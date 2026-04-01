function currentMonthTabName() {
    const now = new Date();
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Los_Angeles",
        month: "long",
    }).formatToParts(now);
    const month = parts.find(p => p.type === "month")?.value ?? "";
    // New naming: just "March", "April", etc. (no year suffix)
    return month;
}
export function loadConfig() {
    const required = (key) => {
        const val = process.env[key];
        if (!val)
            throw new Error(`Missing required env var: ${key}`);
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
