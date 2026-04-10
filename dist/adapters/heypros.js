import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
// =============================================================================
// HeyPros API Best Practices (HARDWIRED — do not weaken)
//
// 1. TOKEN CACHING: Never call signIn if a valid cached token exists.
//    Tokens last 60 min. We reuse until <5 min remaining.
//
// 2. SIGN-IN RATE LIMIT: Max 1 signIn attempt per 15 minutes.
//    HeyPros locks accounts after too many auth attempts (10 min lockout).
//
// 3. QUERY PACING: 250ms minimum delay between paginated requests.
//    No rate-limit headers observed, but we don't push our luck.
//
// 4. NO AUTH RETRY LOOPS: If signIn fails, STOP. Log error, exit.
//    Never retry auth. Alert the operator.
//
// 5. BACKOFF ON ANY ERROR: If we get 403/429/"Too many", stop immediately.
//    Do not retry. Log and exit with clear message.
// =============================================================================
const TOKEN_CACHE_PATH = "/tmp/heypros-token-cache.json";
const MIN_TOKEN_REMAINING_MS = 5 * 60 * 1000; // 5 minutes
const MIN_SIGNIN_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes between signIn calls
const QUERY_PACE_MS = 250; // ms between paginated requests
const SIGN_IN_MUTATION = `
  mutation signIn($email: String!, $password: String!) {
    signIn(email: $email, password: $password) {
      accessToken
      refreshToken
    }
  }
`;
// --- Token cache ---
function loadTokenCache() {
    try {
        const raw = readFileSync(TOKEN_CACHE_PATH, "utf-8");
        const cache = JSON.parse(raw);
        if (cache.accessToken && cache.expiresAt)
            return cache;
    }
    catch {
        // No cache file or invalid — that's fine
    }
    return null;
}
function saveTokenCache(token) {
    const now = Date.now();
    const cache = {
        accessToken: token,
        obtainedAt: now,
        expiresAt: now + 60 * 60 * 1000, // 60 minutes
    };
    try {
        mkdirSync(dirname(TOKEN_CACHE_PATH), { recursive: true });
        writeFileSync(TOKEN_CACHE_PATH, JSON.stringify(cache, null, 2));
    }
    catch (err) {
        console.warn(`  HeyPros: WARNING — could not save token cache: ${err}`);
    }
}
function isCachedTokenValid(cache) {
    return Date.now() + MIN_TOKEN_REMAINING_MS < cache.expiresAt;
}
function canAttemptSignIn(cache) {
    if (!cache)
        return true; // no prior signIn recorded
    const elapsed = Date.now() - cache.obtainedAt;
    return elapsed >= MIN_SIGNIN_INTERVAL_MS;
}
// --- Query helper ---
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
async function gqlFetch(url, tenant, token, query, variables) {
    const headers = {
        "Content-Type": "application/json",
        tenant: tenant,
    };
    if (token)
        headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({ query, variables }),
    });
    const json = (await res.json());
    // Hard stop on rate limiting or blocking
    if (res.status === 429 || res.status === 403) {
        throw new Error(`HeyPros BLOCKED (HTTP ${res.status}). ` +
            `STOP — do not retry. Check if IP or account is rate-limited. ` +
            `Response: ${JSON.stringify(json.errors?.map(e => e.message))}`);
    }
    if (!res.ok) {
        const errMsg = json.errors?.map((e) => e.message).join(", ") ?? res.statusText;
        throw new Error(`HeyPros HTTP ${res.status}: ${errMsg}`);
    }
    // Check for auth throttle in GraphQL errors (HeyPros returns 200 with error)
    if (json.errors?.length) {
        const messages = json.errors.map((e) => e.message).join(", ");
        if (messages.toLowerCase().includes("too many") || messages.toLowerCase().includes("try again")) {
            throw new Error(`HeyPros AUTH THROTTLED: ${messages}. ` +
                `STOP — do not retry. Wait at least 15 minutes before trying again.`);
        }
        throw new Error(`HeyPros GQL error: ${messages}`);
    }
    if (!json.data) {
        throw new Error("HeyPros returned no data");
    }
    return json.data;
}
// --- Auth ---
async function getValidToken(config) {
    // Step 1: Try cached token
    const cache = loadTokenCache();
    if (cache && isCachedTokenValid(cache)) {
        const remaining = Math.round((cache.expiresAt - Date.now()) / 60000);
        console.log(`  HeyPros: using cached token (${remaining}m remaining)`);
        return cache.accessToken;
    }
    // Step 2: Check signIn rate limit
    if (!canAttemptSignIn(cache)) {
        const waitMin = Math.ceil((MIN_SIGNIN_INTERVAL_MS - (Date.now() - (cache?.obtainedAt ?? 0))) / 60000);
        throw new Error(`HeyPros: token expired but signIn rate limit active. ` +
            `Last signIn was < 15 minutes ago. Wait ${waitMin} more minutes. ` +
            `NEVER rapid-retry auth — HeyPros will lock the account.`);
    }
    // Step 3: Sign in (ONE attempt, no retry)
    console.log("  HeyPros: signing in (cached token expired or missing)...");
    try {
        const data = await gqlFetch(config.heypros.graphqlUrl, config.heypros.tenant, null, SIGN_IN_MUTATION, { email: config.heypros.email, password: config.heypros.password });
        if (!data.signIn.accessToken) {
            throw new Error("HeyPros signIn returned no accessToken — check credentials");
        }
        // Cache the token
        saveTokenCache(data.signIn.accessToken);
        console.log("  HeyPros: signed in successfully, token cached for 60m");
        return data.signIn.accessToken;
    }
    catch (err) {
        // DO NOT RETRY. Throw immediately.
        if (err instanceof Error) {
            throw new Error(`HeyPros signIn FAILED: ${err.message}. ` +
                `NOT retrying — fix credentials or wait for lockout to expire.`);
        }
        throw err;
    }
}
// --- Jobs by purchase order query (Option C) ---
const JOBS_BY_PO_QUERY = `
  query jobsDashboard($page: Int!, $perPage: Int!) {
    jobsDashboard(page: $page, perPage: $perPage) {
      items {
        hashid
        hashidNumeric
        purchaseOrder
        name
        statusV2 {
          label
        }
        jobLabelInstances {
          label {
            hashid
            name
          }
        }
        installationStarts
        attachedContractors {
          hashid
          firstName
          lastName
          companyName
        }
        ostensibleWinner {
          user {
            hashid
            firstName
            lastName
            companyName
          }
        }
        jobInvoices {
          hashidNumeric
          amount
          status { label }
          file {
            fileName
          }
        }
      }
      total
      page
    }
  }
`;
// --- Purchase Order Parsing ---
/**
 * Parse a HeyPros purchaseOrder field into individual job numbers.
 * Handles formats seen in production:
 *   "19616 19659"       → ["19616", "19659"]
 *   "19693 19694"       → ["19693", "19694"]
 *   "19353 / 54"        → ["19353", "19354"]  (relative shorthand)
 *   "Job #19553"        → ["19553"]
 *   "19633"             → ["19633"]
 */
export function parsePurchaseOrder(raw) {
    if (!raw)
        return [];
    let cleaned = raw.trim();
    if (!cleaned)
        return [];
    // Strip "Job #", "Job#", "#" prefixes
    cleaned = cleaned.replace(/Job\s*#\s*/gi, "");
    // Split on whitespace, commas, slashes, "and"
    const tokens = cleaned.split(/[\s,/]+|\band\b/i).map(t => t.trim()).filter(Boolean);
    const result = [];
    let lastFull = "";
    for (const token of tokens) {
        // Skip non-numeric tokens (e.g. stray words from job names)
        if (!/^\d+$/.test(token))
            continue;
        if (token.length >= 4) {
            // Full job number (e.g. "19616")
            result.push(token);
            lastFull = token;
        }
        else if (lastFull) {
            // Relative shorthand (e.g. "54" after "19353" → "19354")
            const prefix = lastFull.slice(0, lastFull.length - token.length);
            result.push(prefix + token);
        }
        else {
            // Short number with no preceding full number — use as-is
            result.push(token);
        }
    }
    return result;
}
// --- Public API ---
export async function fetchJobsByPurchaseOrders(config, purchaseOrders) {
    const token = await getValidToken(config);
    const poSet = new Set(purchaseOrders);
    const matched = [];
    let page = 1;
    let totalPages = 1;
    while (page <= totalPages) {
        const data = await gqlFetch(config.heypros.graphqlUrl, config.heypros.tenant, token, JOBS_BY_PO_QUERY, { page, perPage: config.pageSize });
        for (const item of data.jobsDashboard.items) {
            const po = item.purchaseOrder?.trim();
            if (!po)
                continue;
            // Try exact match first (fast path for 99% of WOs)
            if (poSet.has(po)) {
                matched.push({
                    hashid: item.hashid,
                    hashidNumeric: item.hashidNumeric,
                    purchaseOrder: item.purchaseOrder,
                    installationStarts: item.installationStarts ?? null,
                    attachedContractors: item.attachedContractors ?? [],
                    ostensibleWinnerUser: item.ostensibleWinner?.user ?? null,
                    jobInvoices: item.jobInvoices,
                });
            }
            else {
                // Multi-PO or prefixed format — parse and check each number
                const parsed = parsePurchaseOrder(po);
                const anyMatch = parsed.some(n => poSet.has(n));
                if (anyMatch) {
                    matched.push({
                        hashid: item.hashid,
                        hashidNumeric: item.hashidNumeric,
                        purchaseOrder: item.purchaseOrder,
                        installationStarts: item.installationStarts ?? null,
                        attachedContractors: item.attachedContractors ?? [],
                        ostensibleWinnerUser: item.ostensibleWinner?.user ?? null,
                        jobInvoices: item.jobInvoices,
                    });
                }
            }
        }
        const total = data.jobsDashboard.total;
        totalPages = Math.ceil(total / config.pageSize);
        if (page === 1) {
            console.log(`  HeyPros (by PO): ${total} total jobs, ${totalPages} pages`);
        }
        console.log(`  HeyPros (by PO): page ${page}/${totalPages} — ${matched.length} matches so far`);
        page++;
        if (page <= totalPages) {
            await sleep(QUERY_PACE_MS);
        }
    }
    return matched;
}
