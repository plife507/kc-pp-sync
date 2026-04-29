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
 * NEW layout (March-forward): auto-populated columns in A–AN layout.
 * Manual/finance columns NOT in this set: B (review), G (job#), R (KCPC Released),
 * T (Payment Status), U (Payment Tracking), V (Payment Method), W (Date of Payment), X (Notes).
 */
export declare const AUTO_COL_LETTERS_NEW: Set<string>;
/**
 * LEGACY layout (Jan/Feb): auto-populated columns in A–Z layout.
 */
export declare const AUTO_COL_LETTERS_LEGACY: Set<string>;
export declare const RECURRING_AUTO_COL_LETTERS: Set<string>;
/** Determine if a tab uses the new 40-column visible layout (March-forward) or legacy 27-column layout. */
export declare function isNewLayout(tabName: string): boolean;
export type SourceTabLayout = "new-one-off" | "legacy-one-off" | "recurring";
export interface SourceTabLayoutValidation {
    ok: boolean;
    layout: SourceTabLayout;
    errors: string[];
}
export declare function validateSourceTabHeader(tabName: string, headerRow: string[]): SourceTabLayoutValidation;
export declare function assertSourceTabLayout(spreadsheetId: string, tabName: string): Promise<void>;
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
 * New layout link cols: F(5), H(7), K(10), S(18)
 * Legacy/recurring link cols: F(5), H(7), K(10), U(20)
 */
export declare function formatLinkColumns(spreadsheetId: string, tab: string, rowCount: number): Promise<void>;
export declare function getSheetsClient(): Promise<import("googleapis").sheets_v4.Sheets>;
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
 * Append a sync result row to the Log tab.
 * Creates the tab with headers if it doesn't exist.
 */
export declare function logSyncResult(spreadsheetId: string, entry: SyncLogEntry): Promise<void>;
/**
 * Refresh the Dashboard tab with payment completion stats across all month tabs.
 * Reads all active month + recurring tabs, aggregates by month, writes summary.
 */
export declare function refreshDashboard(spreadsheetId: string): Promise<number>;
/**
 * Refresh the profitability section of the Dashboard tab.
 *
 * METHODOLOGY (also written to the sheet as a notes row):
 *   Revenue is counted ONLY when All Paid? = "✅" (Jobber confirmed client invoice paid).
 *   Unpaid / On Hold / NO CLIENT PAY jobs are excluded from revenue but labor is always counted.
 *
 *   Jobs are split into three categories by Division column (K):
 *     One-off   = Division is "Subcontractor - Dayshift" (or blank/other on main tabs)
 *     Hybrid    = Division is "Hybrid" (KC in-house labor + one or more PPs on same job)
 *     Recurring = jobs on the {Month} - R tabs (recurring visit schedule)
 *
 *   Row inclusion gate (both revenue AND labor):
 *     New layout (March+): row must have # of Invoices (col L) > 0 — skips uninvoiced jobs
 *     Legacy layout (Jan/Feb): row must have a real Invoice # in col L (not blank, not "-")
 *     Recurring tabs: row must have a real Invoice # in col L (not blank, not "-")
 *     Rationale: Division is not finalised until a job is invoiced. Uninvoiced rows
 *     may show a Division value that hasn't been confirmed yet — skip entirely.
 *
 *   Revenue dedup (prevents double-counting multi-contractor jobs):
 *     New layout (March+): dedup by Job # — revenue counted once per unique Job #
 *     Legacy layout (Jan/Feb): dedup by Invoice # — revenue counted once per unique invoice
 *     Recurring tabs: dedup by Invoice # (col L)
 *
 *   Labor = Sub Invoice Amount (col P new / col R legacy / col R recurring).
 *   Only counted when the row passes the invoice gate above.
 *
 *   Recurring margin note: one Jobber invoice often covers multiple visits (rows).
 *   Use "# Recurring Invoices" + "# Recurring Visits" to understand visits-per-invoice
 *   before drawing margin conclusions on recurring jobs.
 *
 *   Margin % = (Total Revenue - Total Labor) / Total Revenue.
 *   NOTE: Hybrid margin is understated — KC's own cost of labor is not yet tracked.
 *   A future Hybrid tab will add that field; for now treat Hybrid margin as a ceiling.
 *
 * Written to Dashboard starting at row 18.
 */
/** Returns a map of month display name → total margin (0-1 decimal) for writing to C1 headers. */
export declare function refreshProfitabilityDashboard(spreadsheetId: string): Promise<Map<string, number>>;
/**
 * Extend all conditional format rules on a tab so they cover up to maxRow rows.
 * Useful when a tab grows beyond the original CF range (e.g., March hits row 201+).
 */
export declare function extendTabCF(spreadsheetId: string, tabName: string, maxRow?: number): Promise<number>;
/**
 * Set up conditional formatting on column C (Margin %) for a one-off tab.
 * Removes any existing CF rules that target column C only, then adds three
 * color-band rules: green ≥65%, yellow 40–65%, red <40%.
 */
export declare function setupMarginCF(spreadsheetId: string, tabName: string): Promise<void>;
/**
 * Set up row-level orange highlight on monthly tabs for "Client Paid but On Hold" rows.
 * Condition: AllPaid = ✅ AND PaymentStatus = "On Hold" AND PaymentTracking = "AWAITING FOR PAYMENT"
 * Highlights the entire row in orange (Material Orange 200) with bold text.
 * Idempotent: removes any existing client-paid-on-hold formula rule before adding.
 */
export declare function setupClientPaidOnHoldCF(spreadsheetId: string, tabName: string): Promise<void>;
/**
 * Highlight amount cells when KCPC released amount is lower than sub invoice.
 */
export declare function buildReleasedBelowSubInvoiceFormula(subCol: string, releaseCol: string): string;
export declare function setupReleasedBelowSubInvoiceCF(spreadsheetId: string, tabName: string): Promise<void>;
export declare function renameTab(spreadsheetId: string, from: string, to: string): Promise<void>;
