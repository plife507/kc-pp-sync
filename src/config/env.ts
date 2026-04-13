export interface Config {
  heypros: {
    graphqlUrl: string;
    tenant: string;
    email: string;
    password: string;
  };
  jobber: {
    tokenPath: string;
    apiUrl: string;
    apiVersion: string;
    syncLookbackDays: number;
  };
  sheets: {
    spreadsheetId: string;
    sheetsTab: string;
    dryRun: boolean;
  };
  pageSize: number;
}

function currentMonthTabName(): string {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    month: "long",
  }).formatToParts(now);
  const month = parts.find(p => p.type === "month")?.value ?? "";
  // New naming: just "March", "April", etc. (no year suffix)
  return month;
}

function previousMonthTabName(): string {
  // Get current month in LA timezone, then go back one month
  const now = new Date();
  const laYear = parseInt(new Intl.DateTimeFormat("en-US", { timeZone: "America/Los_Angeles", year: "numeric" }).format(now), 10);
  const laMonth = new Date(now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" })).getMonth(); // 0-indexed
  // Set to 1st of current LA month, then subtract 1 day → last day of previous month
  const prev = new Date(Date.UTC(laYear, laMonth, 0));
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    month: "long",
  }).formatToParts(prev);
  const month = parts.find(p => p.type === "month")?.value ?? "";
  return month;
}

/**
 * Resolve a sync mode to a concrete tab name.
 *   "current"   → "April"
 *   "current-r" → "April - R"
 *   "prev"      → "March"
 *   "prev-r"    → "March - R"
 */
function resolveMode(mode: string): string | null {
  switch (mode) {
    case "current":   return currentMonthTabName();
    case "current-r": return `${currentMonthTabName()} - R`;
    case "prev":      return previousMonthTabName();
    case "prev-r":    return `${previousMonthTabName()} - R`;
    case "dashboard": return "__dashboard__";
    case "all-prev":  return "__all_prev__";
    default:          return null;
  }
}

export { resolveMode };

export function loadConfig(): Config {
  const required = (key: string): string => {
    const val = process.env[key];
    if (!val) throw new Error(`Missing required env var: ${key}`);
    return val;
  };

  return {
    heypros: {
      graphqlUrl: process.env.HEYPROS_GRAPHQL_URL ?? "https://hey-pros-api.birdsdontexist.com/graphql",
      tenant: process.env.HEYPROS_TENANT ?? "kc-power-clean.heypros.com",
      email: required("HEYPROS_EMAIL"),
      password: required("HEYPROS_PASSWORD"),
    },
    jobber: {
      tokenPath: process.env.JOBBER_TOKEN_PATH ?? "",
      apiUrl: process.env.JOBBER_API_URL ?? "https://api.getjobber.com/api/graphql",
      apiVersion: process.env.JOBBER_API_VERSION ?? "2025-04-16",
      syncLookbackDays: parseInt(process.env.SYNC_LOOKBACK_DAYS ?? "7", 10),
    },
    sheets: {
      spreadsheetId: process.env.SPREADSHEET_ID || process.env.GOOGLE_SHEETS_DEFAULT_ID || process.env.GOOGLE_SHEETS_ID || "1p4lxIUjWFYNDp6ptqSMwyRcdle5Hcv5UMC6TdpZE99Q",
      sheetsTab: process.env.SHEETS_TAB ?? currentMonthTabName(),
      dryRun: process.env.SHEETS_DRY_RUN === "true",
    },
    pageSize: 50,
  };
}
