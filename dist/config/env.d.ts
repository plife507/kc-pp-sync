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
/**
 * Resolve a sync mode to a concrete tab name.
 *   "current"   → "April"
 *   "current-r" → "April - R"
 *   "prev"      → "March"
 *   "prev-r"    → "March - R"
 */
declare function resolveMode(mode: string): string | null;
export { resolveMode };
export declare function loadConfig(): Config;
