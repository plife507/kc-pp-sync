import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync, unlinkSync } from "node:fs";
import { dirname } from "node:path";
import type { Config } from "../config/env.js";
import type { JobberPaidJob } from "../config/types.js";

// =============================================================================
// Throttle management ported from kc/jobber-cli/lib/core/throttle-manager.js
// and kc/jobber-cli/lib/core/cost-reference.js
//
// DO NOT replace this with hand-rolled logic. The jobber-cli modules are the
// canonical implementation. This port preserves all semantics:
//   - Queued updates to prevent race conditions on throttleStatus
//   - calculateWaitTime: (deficit / restoreRate) * 1.1, capped at 3600s
//   - waitIfNeeded: progress log every 2s
//   - Budget warning at 80% usage
//   - CostReference: learns actual costs (avg * 1.2 estimate), shares cache
//     with jobber-cli cost cache (shared when running locally)
// =============================================================================

// ---------------------------------------------------------------------------
// ThrottleManager (ported from jobber-cli/lib/core/throttle-manager.js)
// ---------------------------------------------------------------------------

interface ThrottleStatus {
  maximumAvailable: number;
  currentlyAvailable: number;
  restoreRate: number;
}

interface GQLResponseWithCost {
  extensions?: {
    cost?: {
      throttleStatus?: ThrottleStatus;
      actualQueryCost?: number | null;
      requestedQueryCost?: number;
    };
    throttleStatus?: ThrottleStatus;
  };
}

class ThrottleManager {
  private throttleStatus: ThrottleStatus = {
    maximumAvailable: 10000,
    currentlyAvailable: 10000,
    restoreRate: 500,
  };
  private _updateQueue: Promise<ThrottleStatus | null> = Promise.resolve(null);
  private _lastUpdateTimestamp: number = Date.now();

  /**
   * Extract throttle status from API response and update internal state.
   * Queued to prevent race conditions (matches jobber-cli CRITICAL FIX #2).
   */
  updateStatus(response: GQLResponseWithCost): Promise<ThrottleStatus | null> {
    this._updateQueue = this._updateQueue.then(() => {
      const throttle =
        response.extensions?.cost?.throttleStatus ??
        response.extensions?.throttleStatus;
      if (throttle) {
        const now = Date.now();
        this.throttleStatus = {
          maximumAvailable: throttle.maximumAvailable,
          currentlyAvailable: throttle.currentlyAvailable,
          restoreRate: throttle.restoreRate,
        };
        this._lastUpdateTimestamp = now;

        const usagePercent =
          (1 - this.throttleStatus.currentlyAvailable / this.throttleStatus.maximumAvailable) * 100;
        if (usagePercent > 80) {
          console.warn(
            `  Jobber: ⚠ budget ${usagePercent.toFixed(0)}% used — ` +
              `${this.throttleStatus.currentlyAvailable}/${this.throttleStatus.maximumAvailable} remaining`,
          );
        }
        return this.throttleStatus;
      }
      return null;
    });
    return this._updateQueue;
  }

  /**
   * Calculate wait time in seconds needed for requiredUnits.
   * Formula: (deficit / restoreRate) * 1.1, capped at 3600s.
   * (Matches jobber-cli CRITICAL FIX #2 — validated, no NaN/Infinity.)
   */
  calculateWaitTime(requiredUnits: number): number {
    if (!Number.isFinite(requiredUnits) || requiredUnits < 0) {
      throw new Error(`Invalid requiredUnits: ${requiredUnits}`);
    }
    const { currentlyAvailable, restoreRate } = this.throttleStatus;
    if (!Number.isFinite(currentlyAvailable) || currentlyAvailable < 0) {
      throw new Error(`Throttle status corrupted: currentlyAvailable=${currentlyAvailable}`);
    }
    const effectiveRate =
      !restoreRate || restoreRate <= 0 || !Number.isFinite(restoreRate) ? 500 : restoreRate;
    const unitsNeeded = requiredUnits - currentlyAvailable;
    if (unitsNeeded <= 0) return 0;
    const waitSeconds = (unitsNeeded / effectiveRate) * 1.1;
    if (!Number.isFinite(waitSeconds) || waitSeconds < 0) {
      throw new Error(`Calculated invalid wait time: ${waitSeconds}`);
    }
    return Math.min(Math.ceil(waitSeconds), 3600);
  }

  /**
   * Sleep if we don't have enough budget for estimatedCost.
   * Shows progress every 2s (matches jobber-cli waitWithProgress).
   */
  async waitIfNeeded(estimatedCost: number): Promise<void> {
    const waitTime = this.calculateWaitTime(estimatedCost);
    if (!isFinite(waitTime) || waitTime < 0 || waitTime > 3600) {
      throw new Error(`Invalid throttle wait time: ${waitTime}. Max is 1 hour.`);
    }
    if (waitTime > 0) {
      const { currentlyAvailable, restoreRate } = this.throttleStatus;
      console.log(
        `  Jobber: ⏳ budget low: ${currentlyAvailable} available, need ~${estimatedCost}. ` +
          `Waiting ${waitTime}s for budget to restore...`,
      );
      await this._waitWithProgress(waitTime, (waited, total) => {
        const restored = Math.floor(waited * restoreRate);
        const newAvail = Math.min(this.throttleStatus.maximumAvailable, currentlyAvailable + restored);
        return `  Jobber:    ⏳ ${Math.floor(waited)}s / ${total}s (${newAvail} available)...`;
      });
      const restored = Math.floor(waitTime * restoreRate);
      this.throttleStatus.currentlyAvailable = Math.min(
        this.throttleStatus.maximumAvailable,
        currentlyAvailable + restored,
      );

    }
  }

  private async _waitWithProgress(
    totalSeconds: number,
    progressFn: (waited: number, total: number) => string,
  ): Promise<void> {
    let waited = 0;
    while (waited < totalSeconds) {
      const sleepMs = Math.min(2000, (totalSeconds - waited) * 1000);
      await new Promise<void>((resolve) => setTimeout(resolve, sleepMs));
      waited += sleepMs / 1000;
      if (waited < totalSeconds) {
        console.log(progressFn(waited, totalSeconds));
      }
    }
  }

  getStatus(): ThrottleStatus {
    return { ...this.throttleStatus };
  }

  hasEnoughBudget(estimatedCost: number): boolean {
    return this.throttleStatus.currentlyAvailable >= estimatedCost;
  }
}

// ---------------------------------------------------------------------------
// CostReference (ported from jobber-cli/lib/core/cost-reference.js)
// Shares the same cache file as jobber-cli so both tools learn together.
// ---------------------------------------------------------------------------

// Use /tmp for Cloud Functions compatibility (read-only filesystem except /tmp)
const COST_CACHE_PATH =
  process.env.JOBBER_COST_CACHE_PATH ?? "/tmp/jobber-cost-cache.json";

interface CostEntry {
  samples: number;
  min: number;
  max: number;
  avg: number;
  depth: number;
  fields: number;
  lastCost: number;
  lastSeen: string;
}

interface CostFile {
  costs: Record<string, CostEntry>;
  updated: string | null;
}

function getQueryKey(query: string): string | null {
  const opMatch = query.match(/(?:query|mutation|subscription)\s+(\w+)/);
  if (opMatch) return opMatch[1];
  const fieldMatch = query.match(/\{\s*(\w+)/);
  if (fieldMatch) return fieldMatch[1];
  return null;
}

function getQueryDepth(query: string): number {
  let depth = 0, maxDepth = 0;
  for (const c of query) {
    if (c === "{") { depth++; maxDepth = Math.max(maxDepth, depth); }
    else if (c === "}") depth--;
  }
  return maxDepth;
}

function getQueryFields(query: string): number {
  return (query.match(/\w+\s*[{(:]/g) ?? []).length;
}

class CostReference {
  private _data: CostFile | null = null;
  private _dirty = false;

  private _load(): CostFile {
    if (this._data) return this._data;
    try {
      if (existsSync(COST_CACHE_PATH)) {
        this._data = JSON.parse(readFileSync(COST_CACHE_PATH, "utf-8")) as CostFile;
      } else {
        this._data = { costs: {}, updated: null };
      }
    } catch {
      this._data = { costs: {}, updated: null };
    }
    return this._data;
  }

  private _save(): void {
    if (!this._dirty) return;
    const data = this._load();
    data.updated = new Date().toISOString();
    const dir = dirname(COST_CACHE_PATH);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const tmp = `${COST_CACHE_PATH}.tmp`;
    writeFileSync(tmp, JSON.stringify(data, null, 2), "utf-8");
    try {
      renameSync(tmp, COST_CACHE_PATH);
    } catch (err) {
      try { unlinkSync(tmp); } catch { /* ignore */ }
      throw err;
    }
    this._dirty = false;
  }

  record(query: string, actualCost: number): void {
    if (!actualCost || actualCost <= 0) return;
    const key = getQueryKey(query);
    if (!key) return;
    const data = this._load();
    const entry: CostEntry = data.costs[key] ?? {
      samples: 0,
      min: actualCost,
      max: 0,
      avg: 0,
      depth: getQueryDepth(query),
      fields: getQueryFields(query),
      lastCost: actualCost,
      lastSeen: new Date().toISOString(),
    };
    const weight = Math.min(entry.samples, 20);
    entry.avg = Math.round((entry.avg * weight + actualCost) / (weight + 1));
    entry.min = Math.min(entry.min, actualCost);
    entry.max = Math.max(entry.max, actualCost);
    entry.samples = (entry.samples ?? 0) + 1;
    entry.lastCost = actualCost;
    entry.lastSeen = new Date().toISOString();
    data.costs[key] = entry;
    this._dirty = true;
    if (entry.samples % 5 === 0) this._save();
  }

  estimate(query: string): number | null {
    const key = getQueryKey(query);
    if (!key) return null;
    const data = this._load();
    const entry = data.costs[key];
    if (!entry || entry.samples === 0) return null;
    return Math.ceil(entry.avg * 1.2);
  }

  flush(): void {
    this._save();
  }
}

// Module-level singletons — one throttle manager and cost reference per process
const throttleManager = new ThrottleManager();
const costRef = new CostReference();

// ---------------------------------------------------------------------------
// Token file shape
// ---------------------------------------------------------------------------

interface JobberTokenFile {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

// ---------------------------------------------------------------------------
// JWT exp extraction (no verification — just reads the payload)
// ---------------------------------------------------------------------------

function jwtExp(token: string): number | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
    if (typeof payload.exp === "number") return payload.exp;
    return null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// .env file helpers (read / update a single key)
// ---------------------------------------------------------------------------

// KC_ENV_PATH is only writable in local dev (not Cloud Functions).
// updateEnvFile() wraps writes in try/catch so failures are silent.
const KC_ENV_PATH =
  process.env.KC_ENV_PATH ?? "/tmp/kc.env";

function loadEnvVar(key: string): string | undefined {
  try {
    const lines = readFileSync(KC_ENV_PATH, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("#") || !trimmed.includes("=")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (trimmed.slice(0, eqIdx) === key) return trimmed.slice(eqIdx + 1);
    }
  } catch {
    // file not found — ok
  }
  return undefined;
}

function updateEnvFile(key: string, value: string): void {
  try {
    const content = readFileSync(KC_ENV_PATH, "utf-8");
    const lines = content.split("\n");
    let found = false;
    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      if (trimmed.startsWith("#") || !trimmed.includes("=")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (trimmed.slice(0, eqIdx) === key) {
        lines[i] = `${key}=${value}`;
        found = true;
        break;
      }
    }
    if (!found) lines.push(`${key}=${value}`);
    writeFileSync(KC_ENV_PATH, lines.join("\n"), "utf-8");
  } catch {
    // best-effort — don't break sync if kc/.env is missing
  }
}

// ---------------------------------------------------------------------------
// JobberAuth — self-contained OAuth token management
// ---------------------------------------------------------------------------

const REFRESH_BUFFER_SEC = 5 * 60; // refresh when <5 min remain

export class JobberAuth {
  private tokenPath: string;
  private tokens: JobberTokenFile;
  private clientId: string;
  private clientSecret: string;

  constructor(tokenPath: string) {
    this.tokenPath = tokenPath;
    this.tokens = this.loadTokenFile();
    this.originalRefreshToken = this.tokens.refresh_token;
    this.clientId =
      process.env.JOBBER_CLIENT_ID ?? loadEnvVar("JOBBER_CLIENT_ID") ?? "";
    this.clientSecret =
      process.env.JOBBER_CLIENT_SECRET ?? loadEnvVar("JOBBER_CLIENT_SECRET") ?? "";
  }

  async getValidToken(): Promise<string> {
    if (!this.isExpiringSoon()) return this.tokens.access_token;
    await this.refresh();
    return this.tokens.access_token;
  }

  async forceRefresh(): Promise<void> {
    await this.refresh();
  }

  private loadTokenFile(): JobberTokenFile {
    // 1. If tokenPath is set and file exists, read normally
    if (this.tokenPath && existsSync(this.tokenPath)) {
      let raw: string;
      try {
        raw = readFileSync(this.tokenPath, "utf-8");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        throw new Error(`Cannot read Jobber token file at ${this.tokenPath}: ${msg}`);
      }
      let parsed: JobberTokenFile;
      try {
        parsed = JSON.parse(raw);
      } catch {
        throw new Error(`Jobber token file at ${this.tokenPath} is not valid JSON`);
      }
      if (!parsed.access_token || typeof parsed.access_token !== "string") {
        throw new Error(`Jobber token file at ${this.tokenPath} is missing access_token`);
      }
      if (!parsed.refresh_token || typeof parsed.refresh_token !== "string") {
        throw new Error(`Jobber token file at ${this.tokenPath} is missing refresh_token`);
      }
      return parsed;
    }

    // 2. No file available — bootstrap from env vars
    const refreshToken = process.env.JOBBER_REFRESH_TOKEN;
    if (!refreshToken) {
      throw new Error(
        this.tokenPath
          ? `Jobber token file not found at ${this.tokenPath} and JOBBER_REFRESH_TOKEN env var is not set`
          : "JOBBER_TOKEN_PATH is not set and JOBBER_REFRESH_TOKEN env var is not set",
      );
    }
    console.log("  Jobber: no token file — bootstrapping from JOBBER_REFRESH_TOKEN env var");
    const tokens: JobberTokenFile = {
      access_token: process.env.JOBBER_ACCESS_TOKEN ?? "",
      refresh_token: refreshToken,
      expires_at: 0, // force immediate refresh on first call
    };
    // If tokenPath is set, persist the bootstrapped tokens to disk
    if (this.tokenPath) {
      try {
        const dir = dirname(this.tokenPath);
        if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
        writeFileSync(this.tokenPath, JSON.stringify(tokens, null, 2) + "\n", "utf-8");
        console.log(`  Jobber: bootstrapped token file written to ${this.tokenPath}`);
      } catch (err: unknown) {
        console.warn(`  Jobber: warning — could not write bootstrapped token file: ${err}`);
      }
    }
    return tokens;
  }

  private expiresAtEpoch(): number {
    const exp = jwtExp(this.tokens.access_token);
    if (exp) return exp;
    return this.tokens.expires_at ?? 0;
  }

  private isExpiringSoon(): boolean {
    const expiresAt = this.expiresAtEpoch();
    if (!expiresAt) return true;
    return Date.now() / 1000 >= expiresAt - REFRESH_BUFFER_SEC;
  }

  private async refresh(): Promise<void> {
    if (!this.clientId || !this.clientSecret) {
      throw new Error(
        "Jobber OAuth refresh requires JOBBER_CLIENT_ID and JOBBER_CLIENT_SECRET " +
          "(set JOBBER_CLIENT_ID and JOBBER_CLIENT_SECRET in process.env)",
      );
    }
    console.log("  Jobber: access token expired or expiring soon — refreshing…");
    const res = await fetch("https://api.getjobber.com/api/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: this.tokens.refresh_token,
        grant_type: "refresh_token",
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "(no body)");
      throw new Error(
        `Jobber refresh token expired — re-authorize at ` +
          `https://api.getjobber.com/api/oauth/authorize ` +
          `(refresh returned ${res.status}: ${body})`,
      );
    }
    const data = (await res.json()) as {
      access_token?: string;
      refresh_token?: string;
      expires_at?: number;
      expires_in?: number;
    };
    if (!data.access_token || typeof data.access_token !== "string") {
      throw new Error("Jobber token refresh response missing access_token");
    }
    this.tokens.access_token = data.access_token;
    if (data.refresh_token) this.tokens.refresh_token = data.refresh_token;
    if (typeof data.expires_at === "number") {
      this.tokens.expires_at = data.expires_at;
    } else if (typeof data.expires_in === "number") {
      this.tokens.expires_at = Math.floor(Date.now() / 1000) + data.expires_in;
    } else {
      const exp = jwtExp(data.access_token);
      if (exp) this.tokens.expires_at = exp;
    }
    this.persist();
    console.log("  Jobber: token refreshed successfully");
  }

  /** Track the original refresh token to detect rotation */
  private originalRefreshToken: string = "";

  private persist(): void {
    if (this.tokenPath) {
      try {
        writeFileSync(this.tokenPath, JSON.stringify(this.tokens, null, 2) + "\n", "utf-8");
      } catch (err: unknown) {
        console.warn(`  Jobber: warning — could not write token file: ${err}`);
      }
    } else {
      console.warn("  Jobber: no token path configured — tokens persisted in-memory only");
    }
    updateEnvFile("JOBBER_ACCESS_TOKEN", this.tokens.access_token);

    // If refresh token was rotated, persist to Secret Manager so next cold start gets it
    if (
      this.originalRefreshToken &&
      this.tokens.refresh_token !== this.originalRefreshToken
    ) {
      this.persistRefreshTokenToSecretManager().catch((err) => {
        console.warn(`  Jobber: ⚠ failed to update Secret Manager: ${err}`);
      });
    }
  }

  /**
   * Write rotated refresh token to Secret Manager (GCP).
   * Uses ADC (Application Default Credentials) via googleapis.
   * Defaults to JOBBER_REFRESH_TOKEN, but can be overridden so this service
   * does not rotate shared Jobber credentials.
   */
  private async persistRefreshTokenToSecretManager(): Promise<void> {
    try {
      const { google } = await import("googleapis");
      const auth = new google.auth.GoogleAuth({
        scopes: ["https://www.googleapis.com/auth/cloud-platform"],
      });
      const authClient = await auth.getClient();
      const token = await authClient.getAccessToken();
      if (!token.token) {
        console.warn("  Jobber: no access token from ADC — skipping Secret Manager update");
        return;
      }

      const secretName =
        process.env.JOBBER_REFRESH_TOKEN_SECRET_NAME ??
        "projects/823212137840/secrets/JOBBER_REFRESH_TOKEN";
      const payload = Buffer.from(this.tokens.refresh_token).toString("base64");

      const res = await fetch(
        `https://secretmanager.googleapis.com/v1/${secretName}:addVersion`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            payload: { data: payload },
          }),
        },
      );

      if (!res.ok) {
        const body = await res.text().catch(() => "(no body)");
        console.warn(`  Jobber: Secret Manager update failed (${res.status}): ${body}`);
        return;
      }

      const data = await res.json() as { name?: string };
      console.log(`  Jobber: ✅ refresh token rotated — saved to Secret Manager (${data.name})`);
      this.originalRefreshToken = this.tokens.refresh_token;
    } catch (err) {
      console.warn(`  Jobber: ⚠ Secret Manager update error: ${err}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Auth-error detection
// ---------------------------------------------------------------------------

function isAuthError(status: number, errorMessages: string[]): boolean {
  if (status === 401 || status === 403) return true;
  const authPatterns = ["unauthorized", "unauthenticated", "not authenticated", "token", "forbidden"];
  return errorMessages.some((msg) => {
    const lower = msg.toLowerCase();
    return authPatterns.some((p) => lower.includes(p));
  });
}

export function isJobberOAuthRenewRequired(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("jobber refresh token expired") ||
    (lower.includes("jobber") && lower.includes("re-authorize")) ||
    (lower.includes("jobber") && lower.includes("reauthorize"))
  );
}

// ---------------------------------------------------------------------------
// Throttle error detection
// ---------------------------------------------------------------------------

function isThrottledError(errorMessages: string[]): boolean {
  return errorMessages.some((msg) => msg.toLowerCase().includes("throttled"));
}

// ---------------------------------------------------------------------------
// GraphQL response shape
// ---------------------------------------------------------------------------

interface JobberGQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
  extensions?: {
    cost?: {
      requestedQueryCost?: number;
      actualQueryCost?: number | null;
      throttleStatus?: ThrottleStatus;
    };
    throttleStatus?: ThrottleStatus;
  };
}

// Hard cap: first:10 maximum (first:100 always exceeds 10,000 requestedQueryCost)
const MAX_PAGE_SIZE = 10;

// ---------------------------------------------------------------------------
// GraphQL fetch — auth retry + throttle recovery via ThrottleManager
// ---------------------------------------------------------------------------

async function gqlFetch<T>(
  apiUrl: string,
  apiVersion: string,
  auth: JobberAuth,
  query: string,
  variables: Record<string, unknown>,
): Promise<T> {
  // Enforce page size cap
  if (typeof variables.first === "number" && variables.first > MAX_PAGE_SIZE) {
    console.log(
      `  Jobber: clamping page size ${variables.first} → ${MAX_PAGE_SIZE} (requestedQueryCost safety cap)`,
    );
    variables = { ...variables, first: MAX_PAGE_SIZE };
  }

  // Pre-flight: use CostReference to estimate cost, wait if needed
  const estimated = costRef.estimate(query) ?? 500; // fallback 500 if no history
  await throttleManager.waitIfNeeded(estimated);

  const attempt = async (): Promise<T> => {
    const token = await auth.getValidToken();
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-JOBBER-GRAPHQL-VERSION": apiVersion,
      },
      body: JSON.stringify({ query, variables }),
    });

    const body = await res.text();
    let json: JobberGQLResponse<T>;
    try {
      json = JSON.parse(body);
    } catch {
      if (!res.ok) throw { status: res.status, body, errors: [] };
      throw new Error(`Jobber API returned non-JSON: ${body.slice(0, 200)}`);
    }

    // Update ThrottleManager from response (queued, race-condition safe)
    await throttleManager.updateStatus(json);

    // Record actual cost in CostReference so future estimates improve
    const actualCost = json.extensions?.cost?.actualQueryCost;
    if (typeof actualCost === "number" && actualCost > 0) {
      costRef.record(query, actualCost);
      const status = throttleManager.getStatus();
      console.log(
        `  Jobber: cost=${actualCost} | budget=${status.currentlyAvailable}/${status.maximumAvailable}`,
      );
    }

    const errorMessages = json.errors?.map((e) => e.message) ?? [];
    if (!res.ok || isAuthError(res.status, errorMessages)) {
      throw { status: res.status, body, errors: errorMessages };
    }

    // Throttled error — Jobber returns 200 with error in body
    if (isThrottledError(errorMessages)) {
      const requestedCost = json.extensions?.cost?.requestedQueryCost ?? estimated;
      throw { throttled: true, requestedCost, errors: errorMessages };
    }

    if (errorMessages.length) {
      throw new Error(`Jobber GraphQL errors: ${errorMessages.join("; ")}`);
    }
    if (!json.data) {
      throw new Error("Jobber GraphQL response missing data");
    }
    return json.data;
  };

  try {
    return await attempt();
  } catch (err: unknown) {
    const errObj = err as {
      status?: number;
      errors?: string[];
      body?: string;
      throttled?: boolean;
      requestedCost?: number;
    };

    // Throttle recovery — sleep via ThrottleManager, retry ONCE
    if (errObj.throttled) {
      const requestedCost = errObj.requestedCost ?? 10000;
      console.log(
        `  Jobber: THROTTLED — requestedQueryCost=${requestedCost}. ` +
          `Calculating sleep via ThrottleManager...`,
      );
      await throttleManager.waitIfNeeded(requestedCost);
      console.log(`  Jobber: retrying after throttle recovery (ONE retry — will not loop)`);
      try {
        return await attempt();
      } catch (retryErr: unknown) {
        const retryObj = retryErr as { throttled?: boolean; errors?: string[] };
        if (retryObj.throttled) {
          costRef.flush();
          throw new Error(
            `Jobber THROTTLED on retry — stopping. ` +
              `Budget did not restore fast enough. Errors: ${retryObj.errors?.join("; ")}`,
          );
        }
        throw retryErr;
      }
    }

    // Auth error — refresh token and retry ONCE
    if (errObj.status !== undefined && errObj.errors !== undefined) {
      if (isAuthError(errObj.status, errObj.errors)) {
        console.log("  Jobber: auth error — refreshing token and retrying…");
        await auth.forceRefresh();
        return await attempt();
      }
      throw new Error(`Jobber API ${errObj.status}: ${errObj.body ?? "(no body)"}`);
    }

    throw err;
  }
}

// ---------------------------------------------------------------------------
// Job-by-number query (Option C — lookup specific jobs via searchTerm)
//
// Jobber's JobFilterAttributes does NOT support jobNumber filtering.
// The correct approach is jobs(searchTerm: "1234") which searches by job
// number. Results must be verified client-side since searchTerm is fuzzy.
// ---------------------------------------------------------------------------

const JOB_BY_NUMBER_QUERY = `
query JobByNumber($searchTerm: String!, $first: Int!) {
  jobs(searchTerm: $searchTerm, first: $first) {
    nodes {
      jobNumber
      jobType
      jobStatus
      jobberWebUri
      client { name jobberWebUri }
      customFields {
        ... on CustomFieldDropdown { label valueDropdown }
        ... on CustomFieldTrueFalse { label valueTrueFalse }
        ... on CustomFieldText { label valueText }
        ... on CustomFieldNumeric { label valueNumeric }
      }
      invoices {
        nodes {
          invoiceNumber
          jobberWebUri
          invoiceStatus
          issuedDate
          receivedDate
          amounts {
            paymentsTotal
            total
          }
        }
      }
    }
  }
}
`;

interface JobByNumberNode {
  jobNumber: number;
  jobType: string | null;
  jobStatus: string | null;
  jobberWebUri: string | null;
  client: { name: string; jobberWebUri: string | null } | null;
  customFields: Array<{
    label: string;
    valueDropdown?: string;
    valueTrueFalse?: boolean;
    valueText?: string;
    valueNumeric?: number;
  }>;
  invoices: {
    nodes: Array<{
      invoiceNumber: string;
      jobberWebUri: string | null;
      invoiceStatus: string;
      issuedDate: string | null;
      receivedDate: string | null;
      amounts: { paymentsTotal: number | null; total: number };
    }>;
  };
}

interface JobByNumberResponse {
  jobs: { nodes: JobByNumberNode[] };
}

const INVOICE_BY_NUMBER_QUERY = `
query InvoiceByNumber($searchTerm: String!, $first: Int!) {
  invoices(searchTerm: $searchTerm, first: $first) {
    nodes {
      invoiceNumber
      jobberWebUri
      invoiceStatus
      issuedDate
      receivedDate
      amounts {
        paymentsTotal
        total
      }
      client { name jobberWebUri }
      jobs(first: 10) {
        nodes {
          jobNumber
          jobType
          jobStatus
          jobberWebUri
          client { name jobberWebUri }
          customFields {
            ... on CustomFieldDropdown { label valueDropdown }
            ... on CustomFieldTrueFalse { label valueTrueFalse }
            ... on CustomFieldText { label valueText }
            ... on CustomFieldNumeric { label valueNumeric }
          }
        }
      }
      archivedJobs(first: 10) {
        nodes {
          jobNumber
          jobType
          jobStatus
          jobberWebUri
          client { name jobberWebUri }
          customFields {
            ... on CustomFieldDropdown { label valueDropdown }
            ... on CustomFieldTrueFalse { label valueTrueFalse }
            ... on CustomFieldText { label valueText }
            ... on CustomFieldNumeric { label valueNumeric }
          }
        }
      }
    }
  }
}
`;

interface InvoiceByNumberJobNode {
  jobNumber: number;
  jobType: string | null;
  jobStatus: string | null;
  jobberWebUri: string | null;
  client: { name: string; jobberWebUri: string | null } | null;
  customFields: JobByNumberNode["customFields"];
}

interface InvoiceByNumberNode {
  invoiceNumber: string;
  jobberWebUri: string | null;
  invoiceStatus: string;
  issuedDate: string | null;
  receivedDate: string | null;
  amounts: { paymentsTotal: number | null; total: number } | null;
  client: { name: string; jobberWebUri: string | null } | null;
  jobs: { nodes: InvoiceByNumberJobNode[] };
  archivedJobs: { nodes: InvoiceByNumberJobNode[] };
}

interface InvoiceByNumberResponse {
  invoices: { nodes: InvoiceByNumberNode[] };
}

function extractDivision(
  customFields: JobByNumberNode["customFields"],
): string {
  for (const cf of customFields) {
    if (cf.label === "(A) Division") {
      return cf.valueDropdown ?? cf.valueText ?? "";
    }
  }
  return "";
}

function invoiceNumbersEqual(a: string | null | undefined, b: string | null | undefined): boolean {
  const left = String(a ?? "").trim();
  const right = String(b ?? "").trim();
  if (!left || !right) return false;
  if (left === right) return true;
  const leftDigits = left.replace(/\D/g, "");
  const rightDigits = right.replace(/\D/g, "");
  if (!leftDigits || !rightDigits) return false;
  return parseInt(leftDigits, 10) === parseInt(rightDigits, 10);
}

export async function fetchJobberJobsByNumbers(
  config: Config,
  jobNumbers: string[],
): Promise<JobberPaidJob[]> {
  const auth = new JobberAuth(config.jobber.tokenPath);
  const all: JobberPaidJob[] = [];

  for (const jn of jobNumbers) {
    const num = parseInt(jn, 10);
    if (isNaN(num)) {
      console.warn(`  Jobber: skipping non-numeric job number: ${jn}`);
      continue;
    }

    // searchTerm is fuzzy — fetch a small window and filter client-side for exact match
    const data = await gqlFetch<JobByNumberResponse>(
      config.jobber.apiUrl,
      config.jobber.apiVersion,
      auth,
      JOB_BY_NUMBER_QUERY,
      { searchTerm: String(num), first: 5 },
    );

    // Filter client-side: searchTerm is fuzzy, verify exact jobNumber match
    const matchingJobs = data.jobs.nodes.filter((j) => j.jobNumber === num);
    if (matchingJobs.length === 0) {
      console.warn(`  Jobber: job #${num} not found in search results (${data.jobs.nodes.length} candidates)`);
    }

    for (const job of matchingJobs) {
      const division = extractDivision(job.customFields);
      const clientName = job.client?.name ?? "";
      const jobType = job.jobType ?? "";
      const jobStatus = job.jobStatus ?? "";
      const jobberWebUri = job.jobberWebUri ?? "";
      const clientWebUri = job.client?.jobberWebUri ?? "";

      if (job.invoices.nodes.length === 0) {
        // Job exists but has no invoices — still produce a row
        all.push({
          jobNumber: String(job.jobNumber),
          invoiceNumber: "",
          invoiceWebUri: "",
          invoiceStatus: "",
          issuedDate: null,
          paidDate: null,
          amount: 0,
          clientName,
          division,
          jobType,
          jobStatus,
          jobberWebUri,
          clientWebUri,
        });
      } else {
        for (const inv of job.invoices.nodes) {
          all.push({
            jobNumber: String(job.jobNumber),
            invoiceNumber: inv.invoiceNumber,
            invoiceWebUri: inv.jobberWebUri ?? "",
            invoiceStatus: inv.invoiceStatus,
            issuedDate: inv.issuedDate ?? null,
            paidDate: inv.receivedDate ?? null,
            amount: inv.amounts.total,
            clientName,
            division,
            jobType,
            jobStatus,
            jobberWebUri,
            clientWebUri,
          });
        }
      }
    }

    // Pace between job lookups (100ms — ThrottleManager handles budget, extra delay was redundant)
    await new Promise<void>((resolve) => setTimeout(resolve, 100));
  }

  costRef.flush();
  return all;
}

export async function fetchJobberInvoicesByNumbers(
  config: Config,
  invoiceNumbers: string[],
): Promise<JobberPaidJob[]> {
  const auth = new JobberAuth(config.jobber.tokenPath);
  const all: JobberPaidJob[] = [];
  const uniqueInvoiceNumbers = [...new Set(invoiceNumbers.map(n => String(n).trim()).filter(Boolean))];

  for (const invoiceNumber of uniqueInvoiceNumbers) {
    const data = await gqlFetch<InvoiceByNumberResponse>(
      config.jobber.apiUrl,
      config.jobber.apiVersion,
      auth,
      INVOICE_BY_NUMBER_QUERY,
      { searchTerm: invoiceNumber, first: 5 },
    );

    const matchingInvoices = data.invoices.nodes.filter((inv) =>
      invoiceNumbersEqual(inv.invoiceNumber, invoiceNumber),
    );
    if (matchingInvoices.length === 0) {
      console.warn(`  Jobber: invoice #${invoiceNumber} not found in invoice search (${data.invoices.nodes.length} candidates)`);
    }

    for (const inv of matchingInvoices) {
      const relatedJobs = [...(inv.jobs?.nodes ?? []), ...(inv.archivedJobs?.nodes ?? [])];
      if (relatedJobs.length === 0) {
        all.push({
          jobNumber: "",
          invoiceNumber: inv.invoiceNumber,
          invoiceWebUri: inv.jobberWebUri ?? "",
          invoiceStatus: inv.invoiceStatus,
          issuedDate: inv.issuedDate ?? null,
          paidDate: inv.receivedDate ?? null,
          amount: inv.amounts?.total ?? 0,
          clientName: inv.client?.name ?? "",
          division: "",
          jobType: "",
          jobStatus: "",
          jobberWebUri: "",
          clientWebUri: inv.client?.jobberWebUri ?? "",
        });
        continue;
      }

      for (const job of relatedJobs) {
        all.push({
          jobNumber: String(job.jobNumber),
          invoiceNumber: inv.invoiceNumber,
          invoiceWebUri: inv.jobberWebUri ?? "",
          invoiceStatus: inv.invoiceStatus,
          issuedDate: inv.issuedDate ?? null,
          paidDate: inv.receivedDate ?? null,
          amount: inv.amounts?.total ?? 0,
          clientName: job.client?.name ?? inv.client?.name ?? "",
          division: extractDivision(job.customFields),
          jobType: job.jobType ?? "",
          jobStatus: job.jobStatus ?? "",
          jobberWebUri: job.jobberWebUri ?? "",
          clientWebUri: job.client?.jobberWebUri ?? inv.client?.jobberWebUri ?? "",
        });
      }
    }

    await new Promise<void>((resolve) => setTimeout(resolve, 100));
  }

  costRef.flush();
  return all;
}


