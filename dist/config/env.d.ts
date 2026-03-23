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
export declare function loadConfig(): Config;
