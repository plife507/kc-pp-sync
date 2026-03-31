export declare function readOutputSheetJobNumbers(spreadsheetId: string, tab?: string, range?: string): Promise<Array<{
    rowIndex: number;
    jobNumber: string;
    existingInvoiceValue: string;
}>>;
export declare const AUTO_COL_LETTERS: Set<string>;
export declare const RECURRING_AUTO_COL_LETTERS: Set<string>;
/**
 * Read Job # (col F) and Invoice # (col L) and HeyPros ID (col E) from a recurring tab.
 */
export declare function readRecurringTabRows(spreadsheetId: string, tab: string): Promise<Array<{
    rowIndex: number;
    jobNumber: string;
    invoiceNumber: string;
    heyProsId: string;
}>>;
export declare function batchUpdateRecurringColumns(spreadsheetId: string, tab: string, updates: Array<{
    rowIndex: number;
    values: Record<string, string>;
}>): Promise<void>;
export declare function batchUpdateAutoColumns(spreadsheetId: string, tab: string, updates: Array<{
    rowIndex: number;
    values: Record<string, string>;
}>): Promise<void>;
/**
 * Refresh the GTP $ tab after a sync run.
 * Reads the source month tab, filters for GTP-eligible rows, clears+rewrites the GTP tab.
 *
 * GTP criteria: Jobber Invoice Status = "Paid", Payment Status = "Good to Pay",
 *               Payment Tracking (Finance) = "AWAITING FOR PAYMENT"
 *
 * Source columns (March 2026):
 *   A=Date, C=Company Name, D=PP Owner, F=Job#, R=Sub Invoice Amount,
 *   O=Jobber Invoice Status, U=Payment Status, V=Payment Tracking (Finance)
 *
 * GTP $ columns: Date, Company Name, PP Owner, Job #, Sub Invoice Amount,
 *                Jobber Invoice Status, Payment Status, Payment Tracking
 */
export declare function refreshGTPTab(spreadsheetId: string, sourceTab: string): Promise<number>;
