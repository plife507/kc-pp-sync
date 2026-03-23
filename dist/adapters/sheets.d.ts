export declare function readOutputSheetJobNumbers(spreadsheetId: string, tab?: string, range?: string): Promise<Array<{
    rowIndex: number;
    jobNumber: string;
}>>;
export declare const AUTO_COL_LETTERS: Set<string>;
export declare function batchUpdateAutoColumns(spreadsheetId: string, tab: string, updates: Array<{
    rowIndex: number;
    values: Record<string, string>;
}>): Promise<void>;
