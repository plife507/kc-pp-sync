/**
 * Read job numbers from output sheet.
 * For legacy tabs (Jan/Feb): also reads column L (Invoice #) for manual hold detection.
 * For new tabs (March+): L is auto-populated "# of Invoices" — no manual hold via L.
 */
export declare function readOutputSheetJobNumbers(spreadsheetId: string, tab?: string): Promise<Array<{
    rowIndex: number;
    jobNumber: string;
    existingInvoiceValue: string;
}>>;
/**
 * NEW layout (March-forward): auto-populated columns in A–AM layout.
 * Manual/finance columns NOT in this set: B (review), F (job#), Q (KCPC Released),
 * S (Payment Status), T (Payment Tracking), U (Payment Method), V (Date of Payment), W (Notes).
 */
export declare const AUTO_COL_LETTERS_NEW: Set<string>;
/**
 * LEGACY layout (Jan/Feb): auto-populated columns in A–Z layout.
 */
export declare const AUTO_COL_LETTERS_LEGACY: Set<string>;
export declare const RECURRING_AUTO_COL_LETTERS: Set<string>;
/** Determine if a tab uses the new 39-column layout (March-forward) or legacy 26-column. */
export declare function isNewLayout(tabName: string): boolean;
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
 * GTP criteria (new layout):
 *   N (All Paid?) = "✅", S (Payment Status) = "Good to Pay",
 *   T (Payment Tracking) = "AWAITING FOR PAYMENT"
 *
 * GTP criteria (legacy layout):
 *   O (Jobber Invoice Status) = "Paid", U (Payment Status) = "Good to Pay",
 *   V (Payment Tracking) = "AWAITING FOR PAYMENT"
 *
 * GTP $ output columns: Date, Company Name, PP Owner, Job #, Sub Invoice Amount,
 *                        All Paid?/Invoice Status, Payment Status, Payment Tracking
 */
export declare function refreshGTPTab(spreadsheetId: string, sourceTab: string): Promise<number>;
/**
 * Apply black text formatting to hyperlink columns so links render as
 * black underlined text instead of default Google blue.
 *
 * New layout link cols: E(4), G(6), J(9), R(17)
 * Legacy/recurring link cols: E(4), G(6), J(9), T(19)
 */
export declare function formatLinkColumns(spreadsheetId: string, tab: string, rowCount: number): Promise<void>;
export interface SyncLogEntry {
    timestamp: string;
    tab: string;
    status: string;
    jobs: number;
    rows: number;
    gtpRows: number;
    elapsed: string;
    error: string;
}
/**
 * Append a sync result row to the Command tab.
 * Creates the tab with headers if it doesn't exist.
 */
export declare function logSyncResult(spreadsheetId: string, entry: SyncLogEntry): Promise<void>;
/**
 * Refresh the Dashboard tab with payment completion stats across all month tabs.
 * Reads all active month + recurring tabs, aggregates by month, writes summary.
 */
export declare function refreshDashboard(spreadsheetId: string): Promise<number>;
/**
 * Extend all conditional format rules on a tab so they cover up to maxRow rows.
 * Useful when a tab grows beyond the original CF range (e.g., March hits row 201+).
 */
export declare function extendTabCF(spreadsheetId: string, tabName: string, maxRow?: number): Promise<number>;
