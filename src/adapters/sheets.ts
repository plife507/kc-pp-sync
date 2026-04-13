import { google } from "googleapis";

/**
 * Read job numbers from output sheet.
 * For legacy tabs (Jan/Feb): also reads column L (Invoice #) for manual hold detection.
 * For new tabs (March+): L is auto-populated "# of Invoices" — no manual hold via L.
 */
export async function readOutputSheetJobNumbers(
  spreadsheetId: string,
  tab: string = "Sheet1",
): Promise<Array<{ rowIndex: number; jobNumber: string; existingInvoiceValue: string }>> {
  const sheets = await getSheetsClient();
  const useNew = isNewLayout(tab);

  if (useNew) {
    // New layout: just read column G (Job #)
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `'${tab}'!G2:G500`,
    });
    const rows = res.data.values ?? [];
    const result: Array<{ rowIndex: number; jobNumber: string; existingInvoiceValue: string }> = [];
    for (let i = 0; i < rows.length; i++) {
      const val = rows[i]?.[0] != null ? String(rows[i][0]).trim() : "";
      if (val.length > 0) result.push({ rowIndex: 2 + i, jobNumber: val, existingInvoiceValue: "" });
    }
    return result;
  } else {
    // Legacy layout: read G through M (G=Job#, M=Invoice#) for manual hold ("-")
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `'${tab}'!G2:M500`,
    });
    const rows = res.data.values ?? [];
    const result: Array<{ rowIndex: number; jobNumber: string; existingInvoiceValue: string }> = [];
    for (let i = 0; i < rows.length; i++) {
      const val = rows[i]?.[0] != null ? String(rows[i][0]).trim() : "";
      const invoiceVal = rows[i]?.[6] != null ? String(rows[i][6]).trim() : "";
      if (val.length > 0) result.push({ rowIndex: 2 + i, jobNumber: val, existingInvoiceValue: invoiceVal });
    }
    return result;
  }
}

/**
 * NEW layout (March-forward): auto-populated columns in A–AN layout.
 * Manual/finance columns NOT in this set: B (review), G (job#), R (KCPC Released),
 * T (Payment Status), U (Payment Tracking), V (Payment Method), W (Date of Payment), X (Notes).
 */
export const AUTO_COL_LETTERS_NEW = new Set([
  "A","C","D","E","F","H","I","J","K","L",
  "M","N","O",           // invoice summary
  "P","Q","S",           // HeyPros invoice #, Sub Inv Amt, Contractor PDF
  "Y",                   // auto notes
  "Z","AA","AB",         // tracker slot 1
  "AC","AD","AE",        // tracker slot 2
  "AF","AG","AH",        // tracker slot 3
  "AI","AJ","AK",        // tracker slot 4
  "AL","AM","AN",        // tracker slot 5
  "AO",                  // Client Paid Date (latest invoice receivedDate)
]);

/**
 * LEGACY layout (Jan/Feb): auto-populated columns in A–Z layout.
 */
export const AUTO_COL_LETTERS_LEGACY = new Set(["A","C","D","E","F","H","I","J","K","L","M","N","O","P","Q","R","S","U","AA"]);

// For recurring tabs: A (Date), L (Invoice #), S (KCPC Released Amount) are manual
export const RECURRING_AUTO_COL_LETTERS = new Set(["A","C","D","E","G","H","I","J","K","M","N","O","P","Q","R","T","Z"]);

/** Determine if a tab uses the new 39-column layout (March-forward) or legacy 26-column. */
export function isNewLayout(tabName: string): boolean {
  // Legacy tabs: "January 2026", "February 2026", "January", "February"
  // New tabs: "March", "April", etc. (no year suffix, and not Jan/Feb)
  // Recurring tabs use their own flow, not affected by this
  const legacyPattern = /^\w+\s+\d{4}$/;
  const legacyMonths = ["January", "February"];
  return !legacyPattern.test(tabName) && !legacyMonths.includes(tabName);
}

/**
 * Read Job # (col F) and Invoice # (col L) and HeyPros ID (col E) from a recurring tab.
 */
export async function readRecurringTabRows(
  spreadsheetId: string,
  tab: string,
): Promise<Array<{ rowIndex: number; jobNumber: string; invoiceNumber: string; heyProsId: string }>> {
  const sheets = await getSheetsClient();
  // Read cols E, F, L (HeyPros ID, Job #, Invoice #)
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${tab}'!A2:L500`,
  });
  const rows = res.data.values ?? [];
  const result: Array<{ rowIndex: number; jobNumber: string; invoiceNumber: string; heyProsId: string }> = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i] ?? [];
    const jobNumber = row[5] != null ? String(row[5]).trim() : "";  // col F (index 5)
    const heyProsId = row[4] != null ? String(row[4]).trim() : "";  // col E (index 4)
    const invoiceNumber = row[11] != null ? String(row[11]).trim() : "";  // col L (index 11)
    if (jobNumber.length > 0) {
      result.push({ rowIndex: 2 + i, jobNumber, invoiceNumber, heyProsId });
    }
  }
  return result;
}

export async function batchUpdateRecurringColumns(
  spreadsheetId: string,
  tab: string,
  updates: Array<{ rowIndex: number; values: Record<string, string> }>,
): Promise<void> {
  if (updates.length === 0) return;
  const sheets = await getSheetsClient();
  const data: Array<{ range: string; values: string[][] }> = [];
  for (const update of updates) {
    for (const [col, val] of Object.entries(update.values)) {
      if (!RECURRING_AUTO_COL_LETTERS.has(col)) continue; // never write manual cols (B, L, U, V, W, X, Y)
      data.push({ range: `'${tab}'!${col}${update.rowIndex}`, values: [[val ?? ""]] });
    }
  }
  if (data.length === 0) return;
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: { valueInputOption: "USER_ENTERED", data },
  });
}

/**
 * Ensure a sheet tab has at least `minCols` columns.
 * Appends columns if needed. No-op if already wide enough.
 */
async function ensureGridColumns(spreadsheetId: string, tab: string, minCols: number): Promise<void> {
  const sheets = await getSheetsClient();
  const meta = await sheets.spreadsheets.get({ spreadsheetId, fields: "sheets.properties" });
  const sheetProps = (meta.data.sheets ?? []).find(s => s.properties?.title === tab);
  if (!sheetProps) return; // tab not found, will fail elsewhere
  const currentCols = sheetProps.properties?.gridProperties?.columnCount ?? 0;
  if (currentCols >= minCols) return;
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{
        appendDimension: {
          sheetId: sheetProps.properties!.sheetId!,
          dimension: "COLUMNS",
          length: minCols - currentCols,
        },
      }],
    },
  });
  console.log(`  ${tab}: expanded grid from ${currentCols} to ${minCols} columns`);
}

export async function batchUpdateAutoColumns(
  spreadsheetId: string,
  tab: string,
  updates: Array<{ rowIndex: number; values: Record<string, string> }>,
): Promise<void> {
  if (updates.length === 0) return;

  // New layout writes to col AO (index 40) — ensure grid is wide enough
  if (isNewLayout(tab)) {
    await ensureGridColumns(spreadsheetId, tab, 41);
  }

  const sheets = await getSheetsClient();
  const allowedCols = isNewLayout(tab) ? AUTO_COL_LETTERS_NEW : AUTO_COL_LETTERS_LEGACY;
  const data: Array<{ range: string; values: string[][] }> = [];
  for (const update of updates) {
    for (const [col, val] of Object.entries(update.values)) {
      if (!allowedCols.has(col)) continue; // never write manual cols
      data.push({ range: `'${tab}'!${col}${update.rowIndex}`, values: [[val ?? ""]] });
    }
  }
  if (data.length === 0) return;
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: { valueInputOption: "USER_ENTERED", data },
  });
}

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
export async function refreshGTPTab(
  spreadsheetId: string,
  sourceTab: string,
): Promise<number> {
  const useNew = isNewLayout(sourceTab);

  // Derive GTP tab name based on layout
  let gtpTab: string;
  let monthName: string;
  if (useNew) {
    // New naming: "March" → "March - GTP $"
    gtpTab = `${sourceTab} - GTP $`;
    monthName = sourceTab;
  } else {
    // Legacy naming: "February 2026" → "Feb - GTP $", "January 2026" → "Jan - GTP $"
    const MONTH_SHORT: Record<string, string> = { January: "Jan", February: "Feb" };
    monthName = sourceTab.split(" ")[0];
    const shortName = MONTH_SHORT[monthName] ?? monthName;
    gtpTab = `${shortName} - GTP $`;
  }

  const sheets = await getSheetsClient();

  // --- Helper: extract GTP-eligible rows from a tab ---
  function extractGtpRows(
    rows: string[][],
    layoutNew: boolean,
    recurring: boolean = false,
  ): string[][] {
    // Recurring tabs: 26-col layout (no margin col C) — all indices after A are -1 vs legacy one-off
    // Legacy one-off (Feb): 27-col layout (margin col C inserted) — original indices
    const COL_DATE = 0;
    const COL_COMPANY = recurring ? 2 : 3;         // C(2) recurring, D(3) legacy
    const COL_PP_OWNER = recurring ? 3 : 4;         // D(3) recurring, E(4) legacy
    const COL_JOB_NUM = recurring ? 5 : 6;          // F(5) recurring, G(6) legacy
    const COL_CLIENT_NAME = recurring ? 9 : 10;     // J(9) recurring, K(10) legacy

    // New layout: O=14 (All Paid?), Q=16 (Sub Inv Amt), T=19 (Payment Status), U=20 (Payment Tracking)
    // Legacy one-off (Feb w/ margin col C): P=15, S=18, V=21, W=22
    // Recurring (no margin col C):          O=14, R=17, U=20, V=21
    const COL_PAID_CHECK = layoutNew ? 14 : recurring ? 14 : 15;
    const COL_SUB_AMOUNT = layoutNew ? 16 : recurring ? 17 : 18;
    const COL_PAYMENT_STATUS = layoutNew ? 19 : recurring ? 20 : 21;
    const COL_PAYMENT_TRACKING = layoutNew ? 20 : recurring ? 21 : 22;

    const paidValue = layoutNew ? "✅" : "Paid";

    const result: string[][] = [];
    for (const row of rows) {
      const paidCheck = (row[COL_PAID_CHECK] ?? "").toString().trim();
      const paymentStatus = (row[COL_PAYMENT_STATUS] ?? "").toString().trim();
      const paymentTracking = (row[COL_PAYMENT_TRACKING] ?? "").toString().trim();

      if (
        paidCheck === paidValue &&
        paymentStatus === "Good to Pay" &&
        paymentTracking.toUpperCase() === "AWAITING FOR PAYMENT"
      ) {
        result.push([
          (row[COL_DATE] ?? "").toString(),
          (row[COL_COMPANY] ?? "").toString(),
          (row[COL_PP_OWNER] ?? "").toString(),
          (row[COL_JOB_NUM] ?? "").toString(),
          (row[COL_CLIENT_NAME] ?? "").toString(),
          (row[COL_SUB_AMOUNT] ?? "").toString(),
          "✅",  // normalize: legacy "Paid" → "✅" for GTP output
          paymentStatus,
          paymentTracking,
        ]);
      }
    }
    return result;
  }

  // --- Read main month tab ---
  const readRange = useNew ? `'${sourceTab}'!A2:U500` : `'${sourceTab}'!A2:W500`;
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: readRange,
  });
  const gtpRows = extractGtpRows(res.data.values ?? [], useNew);
  console.log(`  GTP from '${sourceTab}': ${gtpRows.length} rows`);

  // --- Also read recurring tab ({Month} - R) if it exists ---
  // Recurring tabs always use legacy layout (A-Z, 26 cols)
  // For legacy months use short names: "February" → "Feb - R"
  const MONTH_SHORT_R: Record<string, string> = { January: "Jan", February: "Feb" };
  const recurringMonthName = MONTH_SHORT_R[monthName] ?? monthName;
  const recurringTab = `${recurringMonthName} - R`;
  try {
    const recurRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `'${recurringTab}'!A2:W500`,
    });
    const recurGtp = extractGtpRows(recurRes.data.values ?? [], false, true);
    console.log(`  GTP from '${recurringTab}': ${recurGtp.length} rows`);
    gtpRows.push(...recurGtp);
  } catch (e: any) {
    // Recurring tab may not exist — that's fine
    if (e?.message?.includes("Unable to parse range")) {
      console.log(`  No recurring tab '${recurringTab}' — skipping`);
    } else {
      throw e;
    }
  }

  // Clear existing data (rows 2+) on GTP tab
  try {
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: `'${gtpTab}'!A2:I500`,
    });
  } catch (e: any) {
    // If the tab doesn't exist, log and skip
    if (e?.message?.includes("Unable to parse range")) {
      console.log(`  GTP tab '${gtpTab}' not found — skipping GTP refresh`);
      return 0;
    }
    throw e;
  }

  // Write filtered rows
  if (gtpRows.length > 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `'${gtpTab}'!A2:I${gtpRows.length + 1}`,
      requestBody: { values: gtpRows },
      valueInputOption: "USER_ENTERED",
    });
  }

  return gtpRows.length;
}

/**
 * Apply black text formatting to hyperlink columns so links render as
 * black underlined text instead of default Google blue.
 *
 * New layout link cols: F(5), H(7), K(10), S(18)
 * Legacy/recurring link cols: F(5), H(7), K(10), U(20)
 */
export async function formatLinkColumns(
  spreadsheetId: string,
  tab: string,
  rowCount: number,
): Promise<void> {
  const sheets = await getSheetsClient();

  // Get sheet ID
  const meta = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets.properties",
  });
  const sheet = meta.data.sheets?.find(
    (s: any) => s.properties?.title === tab,
  );
  if (!sheet) return;
  const sheetId = sheet.properties!.sheetId!;

  const useNew = isNewLayout(tab);
  // PDF column: S(18) on new layout, U(20) on legacy/recurring
  const linkCols = useNew ? [5, 7, 10, 18] : [5, 7, 10, 20];

  const requests = linkCols.map((col) => ({
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 1,
        endRowIndex: rowCount + 1,
        startColumnIndex: col,
        endColumnIndex: col + 1,
      },
      cell: {
        userEnteredFormat: {
          textFormat: {
            foregroundColor: { red: 0, green: 0, blue: 0 },
          },
        },
      },
      fields: "userEnteredFormat.textFormat.foregroundColor",
    },
  }));

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests },
  });
}

export async function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const authClient = await auth.getClient();
  return google.sheets({ version: "v4", auth: authClient as any });
}

// ---------------------------------------------------------------------------
// Command tab — sync result logging
// ---------------------------------------------------------------------------

const COMMAND_TAB = "Log";
const COMMAND_HEADERS = [
  "Timestamp", "Tab", "Status", "Jobs", "Rows", "GTP Rows", "Elapsed", "Error",
];

export interface SyncLogEntry {
  timestamp: string;
  tab: string;
  status: string;   // "✅ OK" or "🔴 FAILED"
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
export async function logSyncResult(spreadsheetId: string, entry: SyncLogEntry): Promise<void> {
  if (!spreadsheetId) {
    console.warn("  Command log: no spreadsheetId — skipping");
    return;
  }

  const sheets = await getSheetsClient();

  // Check if Command tab exists; create if not
  const meta = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets.properties.title",
  });
  const tabExists = meta.data.sheets?.some(
    (s) => s.properties?.title === COMMAND_TAB
  );

  if (!tabExists) {
    console.log("  Command tab: creating...");
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          { addSheet: { properties: { title: COMMAND_TAB, index: 0 } } },
        ],
      },
    });
    // Write headers
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `'${COMMAND_TAB}'!A1:H1`,
      valueInputOption: "RAW",
      requestBody: { values: [COMMAND_HEADERS] },
    });
    console.log("  Command tab: created with headers");
  }

  // Append the log row
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `'${COMMAND_TAB}'!A:H`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [[
        entry.timestamp,
        entry.tab,
        entry.status,
        entry.jobs,
        entry.rows,
        entry.gtpRows,
        entry.elapsed,
        entry.error,
      ]],
    },
  });
  console.log(`  Command log: ${entry.status} — ${entry.tab}`);
}

// ---------------------------------------------------------------------------
// Dashboard tab — payment completion rates
// ---------------------------------------------------------------------------

const DASHBOARD_TAB = "Dashboard";

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

interface MonthStats {
  month: string;       // display name e.g. "January", "March"
  monthIndex: number;  // 0-based month index for sorting
  total: number;
  totalAmount: number;
  paid: number;
  paidAmount: number;
  goodToPay: number;
  goodToPayAmount: number;
  onHold: number;
  onHoldAmount: number;
  onHoldClientPaid: number;   // client HAS paid but sub payment on hold — money sitting in limbo
  onHoldClientPaidAmount: number;
  pending: number;
  pendingAmount: number;
  noClientPay: number;        // client hasn't paid yet — sub will still be paid
  noClientPayAmount: number;
  blank: number;
  blankAmount: number;
  noPaymentCount: number;     // sub will never be paid — excluded from totals
  noPaymentAmount: number;
  // GTP aging buckets: days since job date for Good to Pay + AWAITING FOR PAYMENT rows
  gtp7d: number;    gtp7dAmt: number;    // 0–7 days
  gtp14d: number;   gtp14dAmt: number;   // 8–14 days
  gtp21d: number;   gtp21dAmt: number;   // 15–21 days
  gtp21plus: number; gtp21plusAmt: number; // 21+ days
}

/**
 * Determine column indices for dashboard-relevant columns based on tab name.
 * Recurring tabs (" - R") ALWAYS use legacy positions.
 * Legacy one-off tabs (contains year, e.g. "January 2026") use legacy positions.
 * New one-off tabs (no year, e.g. "March") use new positions.
 */
function getDashboardColIndices(tabName: string): {
  paymentStatus: number;
  paymentTracking: number;
  subInvoiceAmount: number;
  allPaid: number;
  clientPaidDate: number;
} {
  const isRecurring = tabName.endsWith(" - R");

  if (isRecurring) {
    // Recurring tabs: 26-col layout, NO margin column C
    // U(20)=Payment Status, V(21)=Payment Tracking, R(17)=Sub Invoice Amount, O(14)=Invoice Status
    // P(15)=Date Invoice Paid
    return { paymentStatus: 20, paymentTracking: 21, subInvoiceAmount: 17, allPaid: 14, clientPaidDate: 15 };
  }
  if (!isNewLayout(tabName)) {
    // Legacy one-off tabs (Jan/Feb) WITH margin column C inserted (+1 shift)
    // V(21)=Payment Status, W(22)=Payment Tracking, S(18)=Sub Invoice Amount, P(15)=Invoice Status
    // Q(16)=Date Invoice Paid
    return { paymentStatus: 21, paymentTracking: 22, subInvoiceAmount: 18, allPaid: 15, clientPaidDate: 16 };
  }
  // New layout (March+)
  // T(19)=Payment Status, U(20)=Payment Tracking, Q(16)=Sub Invoice Amount, O(14)=All Paid
  // AO(40)=Client Paid Date
  return { paymentStatus: 19, paymentTracking: 20, subInvoiceAmount: 16, allPaid: 14, clientPaidDate: 40 };
}

/**
 * Extract month name from a tab name.
 * "March" → "March", "January 2026" → "January", "April - R" → "April"
 */
/**
 * Extract canonical month name from a tab name.
 * "March" → "March", "January 2026" → "January", "April - R" → "April"
 * "Feb - R" → "February" (handles abbreviated month names)
 */
function extractMonthName(tabName: string): string {
  const base = tabName.replace(/ - R$/, "").replace(/\s+\d{4}$/, "").trim();
  // Handle abbreviated month names (e.g. "Feb" → "February", "Jan" → "January")
  const ABBREV_MAP: Record<string, string> = {
    "Jan": "January", "Feb": "February", "Mar": "March", "Apr": "April",
    "Jun": "June", "Jul": "July", "Aug": "August", "Sep": "September",
    "Oct": "October", "Nov": "November", "Dec": "December",
  };
  return ABBREV_MAP[base] ?? base;
}

/**
 * Parse a dollar amount string from the sheet.
 * Handles: "$1,234.56", "1234.56", "$1234", etc.
 */
function parseDollarAmount(val: string): number {
  if (!val) return 0;
  const cleaned = val.replace(/[$,]/g, "").trim();
  // Reject non-numeric strings (e.g. dates like "2/3/2026" where parseFloat returns 2)
  if (!/^[\d.]+$/.test(cleaned)) return 0;
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Refresh the Dashboard tab with payment completion stats across all month tabs.
 * Reads all active month + recurring tabs, aggregates by month, writes summary.
 */
export async function refreshDashboard(spreadsheetId: string): Promise<number> {
  const sheets = await getSheetsClient();

  // 1. Discover all tabs in the spreadsheet
  const meta = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets.properties",
  });
  const allTabs = (meta.data.sheets ?? [])
    .map((s: any) => s.properties?.title as string)
    .filter(Boolean);

  // 2. Filter to scannable tabs: month one-off + recurring, exclude Log/Dashboard/GTP
  const scanTabs = allTabs.filter((tab) => {
    const lower = tab.toLowerCase();
    if (tab === "Log" || tab === DASHBOARD_TAB) return false;
    if (lower.includes("gtp")) return false;
    // Must be a recognized month tab or recurring tab
    const monthName = extractMonthName(tab);
    return MONTH_NAMES.includes(monthName);
  });

  console.log(`  Dashboard: scanning ${scanTabs.length} tabs: ${scanTabs.join(", ")}`);

  // 3. Aggregate stats by month
  const statsByMonth = new Map<string, MonthStats>();

  for (const tab of scanTabs) {
    const cols = getDashboardColIndices(tab);
    const maxCol = Math.max(cols.paymentStatus, cols.paymentTracking, cols.subInvoiceAmount, cols.allPaid, cols.clientPaidDate);
    // Convert max column index to letter(s) for range
    let endColRef: string;
    if (maxCol < 26) {
      endColRef = String.fromCharCode(65 + maxCol);
    } else {
      endColRef = String.fromCharCode(64 + Math.floor(maxCol / 26)) + String.fromCharCode(65 + (maxCol % 26));
    }
    const range = `'${tab}'!A2:${endColRef}500`;

    let rows: string[][];
    try {
      const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
      rows = (res.data.values ?? []) as string[][];
    } catch (e: any) {
      if (e?.message?.includes("Unable to parse range")) {
        console.log(`  Dashboard: tab '${tab}' not found — skipping`);
        continue;
      }
      throw e;
    }

    const monthName = extractMonthName(tab);
    const monthIndex = MONTH_NAMES.indexOf(monthName);
    if (!statsByMonth.has(monthName)) {
      statsByMonth.set(monthName, {
        month: monthName,
        monthIndex,
        total: 0, totalAmount: 0,
        paid: 0, paidAmount: 0,
        goodToPay: 0, goodToPayAmount: 0,
        onHold: 0, onHoldAmount: 0,
        onHoldClientPaid: 0, onHoldClientPaidAmount: 0,
        pending: 0, pendingAmount: 0,
        noClientPay: 0, noClientPayAmount: 0,
        blank: 0, blankAmount: 0,
        noPaymentCount: 0, noPaymentAmount: 0,
        gtp7d: 0, gtp7dAmt: 0, gtp14d: 0, gtp14dAmt: 0,
        gtp21d: 0, gtp21dAmt: 0, gtp21plus: 0, gtp21plusAmt: 0,
      });
    }
    const stats = statsByMonth.get(monthName)!;

    for (const row of rows) {
      // Skip rows with blank Job # (col G, index 6)
      const jobNum = (row[6] ?? "").toString().trim();
      if (!jobNum) continue;

      const paymentStatus = (row[cols.paymentStatus] ?? "").toString().trim();
      const paymentTracking = (row[cols.paymentTracking] ?? "").toString().trim();
      const subAmount = parseDollarAmount((row[cols.subInvoiceAmount] ?? "").toString());
      const allPaidVal = (row[cols.allPaid] ?? "").toString().trim();

      // Separate "No Payment" rows — sub contractor will never be paid
      // "NO CLIENT PAY" stays in the main table (client hasn't paid yet, sub still will be paid)
      const statusLowerCheck = paymentStatus.toLowerCase();
      if (statusLowerCheck === "no payment") {
        stats.noPaymentCount++;
        stats.noPaymentAmount += subAmount;
        continue;
      }

      stats.total++;
      stats.totalAmount += subAmount;

      // Dashboard bucket logic:
      // 1. Payment Tracking = "PAID" → subcontractor has been paid → count as Paid
      // 2. Otherwise, use Payment Status to classify into GTP / On Hold / Pending / NCP / Blank
      const trackingLower = paymentTracking.toLowerCase();
      const statusLower = paymentStatus.toLowerCase();

      if (trackingLower === "paid") {
        // Subcontractor has been paid (KC released payment)
        stats.paid++;
        stats.paidAmount += subAmount;
      } else if (statusLower === "good to pay") {
        stats.goodToPay++;
        stats.goodToPayAmount += subAmount;
        // GTP aging: bucket by days since CLIENT paid date (last invoice payment)
        const paidDateStr = (row[cols.clientPaidDate] ?? "").toString().trim();
        if (paidDateStr) {
          const paidDate = new Date(paidDateStr);
          if (!isNaN(paidDate.getTime())) {
            const now = new Date();
            const diffMs = now.getTime() - paidDate.getTime();
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            if (diffDays <= 7) { stats.gtp7d++; stats.gtp7dAmt += subAmount; }
            else if (diffDays <= 14) { stats.gtp14d++; stats.gtp14dAmt += subAmount; }
            else if (diffDays <= 21) { stats.gtp21d++; stats.gtp21dAmt += subAmount; }
            else { stats.gtp21plus++; stats.gtp21plusAmt += subAmount; }
          }
        }
      } else if (statusLower === "on hold") {
        // Check if client has already paid (AllPaid=✅ for new layout, InvoiceStatus=Paid for legacy)
        const clientPaid = allPaidVal === "✅" || allPaidVal.toLowerCase() === "paid";
        if (clientPaid) {
          stats.onHoldClientPaid++;
          stats.onHoldClientPaidAmount += subAmount;
        }
        stats.onHold++;
        stats.onHoldAmount += subAmount;
      } else if (statusLower === "pending approval" || statusLower.startsWith("pending approval")) {
        // Catches "Pending Approval in HP" and similar variants
        stats.pending++;
        stats.pendingAmount += subAmount;
      } else if (statusLower === "no client pay") {
        // Client hasn't paid yet — sub will still be paid; tracked separately
        stats.noClientPay++;
        stats.noClientPayAmount += subAmount;
      } else {
        // Blank or unknown
        stats.blank++;
        stats.blankAmount += subAmount;
      }
    }
  }

  // 4. Sort months by index and build output arrays (exclude January — tracking starts February)
  const sortedMonths = [...statsByMonth.values()]
    .filter(s => s.monthIndex >= 1)  // 0=January, 1=February+
    .sort((a, b) => a.monthIndex - b.monthIndex);

  // Main table header
  const mainHeader = [
    "Month", "Total Jobs", "Total $",
    "# Paid", "% Paid",
    "# Good to Pay", "% Good to Pay",
    "# On Hold", "% On Hold",
    "# On Hold (Client Paid)", "% On Hold (Client Paid)",
    "# Pending Approval", "% Pending Approval",
    "# No Client Pay", "% No Client Pay",
    "# Blank", "% Blank",
    "GTP 0-7d", "$ 0-7d",
    "GTP 8-14d", "$ 8-14d",
    "GTP 15-21d", "$ 15-21d",
    "GTP 21+d", "$ 21+d",
  ];

  const pct = (n: number, total: number) => total > 0 ? n / total : 0;

  const mainRows: (string | number)[][] = [mainHeader];

  // YTD accumulators
  let ytdTotal = 0, ytdAmount = 0, ytdPaid = 0, ytdGtp = 0, ytdHold = 0, ytdHoldClientPaid = 0, ytdPending = 0, ytdNoClient = 0, ytdBlank = 0;
  let ytdGtp7d = 0, ytdGtp7dAmt = 0, ytdGtp14d = 0, ytdGtp14dAmt = 0, ytdGtp21d = 0, ytdGtp21dAmt = 0, ytdGtp21plus = 0, ytdGtp21plusAmt = 0;

  for (const s of sortedMonths) {
    if (s.total === 0 && s.noPaymentCount === 0) continue; // skip months with no data at all
    mainRows.push([
      s.month,
      s.total,
      s.totalAmount,
      s.paid, pct(s.paid, s.total),
      s.goodToPay, pct(s.goodToPay, s.total),
      s.onHold, pct(s.onHold, s.total),
      s.onHoldClientPaid, pct(s.onHoldClientPaid, s.total),
      s.pending, pct(s.pending, s.total),
      s.noClientPay, pct(s.noClientPay, s.total),
      s.blank, pct(s.blank, s.total),
      s.gtp7d, s.gtp7dAmt,
      s.gtp14d, s.gtp14dAmt,
      s.gtp21d, s.gtp21dAmt,
      s.gtp21plus, s.gtp21plusAmt,
    ]);
    ytdTotal += s.total;
    ytdAmount += s.totalAmount;
    ytdPaid += s.paid;
    ytdGtp += s.goodToPay;
    ytdHold += s.onHold;
    ytdHoldClientPaid += s.onHoldClientPaid;
    ytdPending += s.pending;
    ytdNoClient += s.noClientPay;
    ytdBlank += s.blank;
    ytdGtp7d += s.gtp7d; ytdGtp7dAmt += s.gtp7dAmt;
    ytdGtp14d += s.gtp14d; ytdGtp14dAmt += s.gtp14dAmt;
    ytdGtp21d += s.gtp21d; ytdGtp21dAmt += s.gtp21dAmt;
    ytdGtp21plus += s.gtp21plus; ytdGtp21plusAmt += s.gtp21plusAmt;
  }

  // YTD row at row 14 (pad if needed)
  while (mainRows.length < 13) mainRows.push([]); // rows 2-13 = up to 12 months, pad empties
  mainRows.push([
    "YTD",
    ytdTotal,
    ytdAmount,
    ytdPaid, pct(ytdPaid, ytdTotal),
    ytdGtp, pct(ytdGtp, ytdTotal),
    ytdHold, pct(ytdHold, ytdTotal),
    ytdHoldClientPaid, pct(ytdHoldClientPaid, ytdTotal),
    ytdPending, pct(ytdPending, ytdTotal),
    ytdNoClient, pct(ytdNoClient, ytdTotal),
    ytdBlank, pct(ytdBlank, ytdTotal),
    ytdGtp7d, ytdGtp7dAmt,
    ytdGtp14d, ytdGtp14dAmt,
    ytdGtp21d, ytdGtp21dAmt,
    ytdGtp21plus, ytdGtp21plusAmt,
  ]);

  // (No Payment section removed — covered by # Excl. columns in profitability table)

  // 5. Ensure Dashboard tab exists
  const dashboardExists = allTabs.includes(DASHBOARD_TAB);
  let dashboardSheetId: number;

  if (!dashboardExists) {
    console.log("  Dashboard tab: creating...");
    const addRes = await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{ addSheet: { properties: { title: DASHBOARD_TAB } } }],
      },
    });
    dashboardSheetId = addRes.data.replies?.[0]?.addSheet?.properties?.sheetId ?? 0;
  } else {
    const sheet = meta.data.sheets?.find((s: any) => s.properties?.title === DASHBOARD_TAB);
    dashboardSheetId = sheet?.properties?.sheetId ?? 0;
  }

  // 6. Clear Dashboard tab (full width A:Y to cover all columns incl. GTP aging)
  try {
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: `'${DASHBOARD_TAB}'!A1:Y200`,
    });
  } catch {
    // tab may be empty
  }

  // 6b. Nuke ALL existing conditional format rules on Dashboard to prevent accumulation.
  // addConditionalFormatRule appends — without this, every sync adds 6 more rules (1,000+ after days).
  // We delete rules one-by-one from index 0 until none remain, then write fresh rules below.
  {
    const cfMeta = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: "sheets(properties.sheetId,conditionalFormats)",
    });
    const dashSheet = cfMeta.data.sheets?.find((s: any) => s.properties?.sheetId === dashboardSheetId);
    const existingRules = dashSheet?.conditionalFormats ?? [];
    if (existingRules.length > 0) {
      console.log(`  Dashboard CF nuke: removing ${existingRules.length} stale rules...`);
      // Delete all rules by repeatedly deleting index 0 (list shifts after each delete)
      const deleteRequests = existingRules.map(() => ({
        deleteConditionalFormatRule: { sheetId: dashboardSheetId, index: 0 },
      }));
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: { requests: deleteRequests },
      });
    }
  }

  // 7. Write main table (rows 1-14)
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `'${DASHBOARD_TAB}'!A1:Y${mainRows.length}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: mainRows },
  });

  // 9. Apply formatting via batchUpdate
  const ytdRowIndex = mainRows.length - 1; // 0-based index of YTD row

  const formatRequests: any[] = [];

  // Header row (row 1): bold, blue bg, white text
  formatRequests.push({
    repeatCell: {
      range: { sheetId: dashboardSheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 25 },
      cell: {
        userEnteredFormat: {
          backgroundColor: { red: 26/255, green: 115/255, blue: 232/255 },
          textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } },
        },
      },
      fields: "userEnteredFormat(backgroundColor,textFormat)",
    },
  });

  // YTD row: bold, light blue bg
  formatRequests.push({
    repeatCell: {
      range: { sheetId: dashboardSheetId, startRowIndex: ytdRowIndex, endRowIndex: ytdRowIndex + 1, startColumnIndex: 0, endColumnIndex: 25 },
      cell: {
        userEnteredFormat: {
          backgroundColor: { red: 207/255, green: 226/255, blue: 255/255 },
          textFormat: { bold: true },
        },
      },
      fields: "userEnteredFormat(backgroundColor,textFormat)",
    },
  });

  // % columns: E(4)=% Paid, G(6)=% GTP, I(8)=% On Hold, K(10)=% On Hold (Client Paid),
  //            M(12)=% Pending, O(14)=% No Client Pay, Q(16)=% Blank
  const pctCols = [4, 6, 8, 10, 12, 14, 16];
  for (const col of pctCols) {
    formatRequests.push({
      repeatCell: {
        range: { sheetId: dashboardSheetId, startRowIndex: 1, endRowIndex: mainRows.length, startColumnIndex: col, endColumnIndex: col + 1 },
        cell: { userEnteredFormat: { numberFormat: { type: "PERCENT", pattern: "0.0%" } } },
        fields: "userEnteredFormat.numberFormat",
      },
    });
  }

  // $ columns: C(2) = Total $, and aging $ columns S(18), U(20), W(22), Y(24) — currency format
  for (const dollarCol of [2, 18, 20, 22, 24]) {
    formatRequests.push({
      repeatCell: {
        range: { sheetId: dashboardSheetId, startRowIndex: 1, endRowIndex: mainRows.length, startColumnIndex: dollarCol, endColumnIndex: dollarCol + 1 },
        cell: { userEnteredFormat: { numberFormat: { type: "CURRENCY", pattern: "$#,##0.00" } } },
        fields: "userEnteredFormat.numberFormat",
      },
    });
  }

  // Frozen header row
  formatRequests.push({
    updateSheetProperties: {
      properties: { sheetId: dashboardSheetId, gridProperties: { frozenRowCount: 1 } },
      fields: "gridProperties.frozenRowCount",
    },
  });

  // Column widths: Month=120, count cols=70, % cols=70, $ cols=100
  const colWidths: Array<{ col: number; width: number }> = [
    { col: 0, width: 120 },  // Month
    { col: 1, width: 70 },   // Total Jobs
    { col: 2, width: 100 },  // Total $
    { col: 3, width: 70 },   // # Paid
    { col: 4, width: 70 },   // % Paid
    { col: 5, width: 70 },   // # Good to Pay
    { col: 6, width: 70 },   // % Good to Pay
    { col: 7, width: 70 },   // # On Hold
    { col: 8, width: 70 },   // % On Hold
    { col: 9, width: 100 },  // # On Hold (Client Paid)
    { col: 10, width: 100 }, // % On Hold (Client Paid)
    { col: 11, width: 90 },  // # Pending Approval
    { col: 12, width: 90 },  // % Pending Approval
    { col: 13, width: 90 },  // # No Client Pay
    { col: 14, width: 90 },  // % No Client Pay
    { col: 15, width: 70 },  // # Blank
    { col: 16, width: 70 },  // % Blank
    { col: 17, width: 70 },  // GTP 0-7d
    { col: 18, width: 90 },  // $ 0-7d
    { col: 19, width: 70 },  // GTP 8-14d
    { col: 20, width: 90 },  // $ 8-14d
    { col: 21, width: 75 },  // GTP 15-21d
    { col: 22, width: 90 },  // $ 15-21d
    { col: 23, width: 70 },  // GTP 21+d
    { col: 24, width: 90 },  // $ 21+d
  ];
  for (const cw of colWidths) {
    formatRequests.push({
      updateDimensionProperties: {
        range: { sheetId: dashboardSheetId, dimension: "COLUMNS", startIndex: cw.col, endIndex: cw.col + 1 },
        properties: { pixelSize: cw.width },
        fields: "pixelSize",
      },
    });
  }

  // 10-band gradient conditional formatting on % Paid column (col E, index 4)
  // Same palette as setupMarginCF on monthly tabs. Excludes 0% from red band.
  {
    const paidCfRange = { sheetId: dashboardSheetId, startRowIndex: 1, endRowIndex: mainRows.length, startColumnIndex: 4, endColumnIndex: 5 };
    const paidBands: Array<{ rgb: [number, number, number]; type: string; values: Array<{ userEnteredValue: string }>; dark?: boolean }> = [
      { rgb: [56, 142, 60],    type: "NUMBER_BETWEEN", values: [{ userEnteredValue: "0.90" }, { userEnteredValue: "100" }] },
      { rgb: [76, 175, 80],    type: "NUMBER_BETWEEN", values: [{ userEnteredValue: "0.80" }, { userEnteredValue: "0.8999" }] },
      { rgb: [129, 199, 132],  type: "NUMBER_BETWEEN", values: [{ userEnteredValue: "0.70" }, { userEnteredValue: "0.7999" }] },
      { rgb: [165, 214, 167],  type: "NUMBER_BETWEEN", values: [{ userEnteredValue: "0.60" }, { userEnteredValue: "0.6999" }] },
      { rgb: [220, 231, 117],  type: "NUMBER_BETWEEN", values: [{ userEnteredValue: "0.50" }, { userEnteredValue: "0.5999" }] },
      { rgb: [255, 235, 59],   type: "NUMBER_BETWEEN", values: [{ userEnteredValue: "0.40" }, { userEnteredValue: "0.4999" }] },
      { rgb: [255, 167, 38],   type: "NUMBER_BETWEEN", values: [{ userEnteredValue: "0.30" }, { userEnteredValue: "0.3999" }] },
      { rgb: [255, 112, 67],   type: "NUMBER_BETWEEN", values: [{ userEnteredValue: "0.20" }, { userEnteredValue: "0.2999" }], dark: true },
      { rgb: [239, 83, 80],    type: "NUMBER_BETWEEN", values: [{ userEnteredValue: "0.10" }, { userEnteredValue: "0.1999" }], dark: true },
      { rgb: [198, 40, 40],    type: "NUMBER_BETWEEN", values: [{ userEnteredValue: "0.001" }, { userEnteredValue: "0.0999" }], dark: true },
    ];
    paidBands.forEach((band, idx) => {
      formatRequests.push({
        addConditionalFormatRule: {
          rule: {
            ranges: [paidCfRange],
            booleanRule: {
              condition: { type: band.type, values: band.values },
              format: {
                backgroundColor: { red: band.rgb[0] / 255, green: band.rgb[1] / 255, blue: band.rgb[2] / 255 },
                ...(band.dark ? { textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 } } } : {}),
              },
            },
          },
          index: idx, // Explicit index preserves priority order (≥90% first = highest priority)
        },
      });
    });
  }

  // Orange highlight on "# On Hold (Client Paid)" column (J, index 9) when value > 0
  // Signals money sitting in limbo: client paid but sub payment frozen
  formatRequests.push({
    addConditionalFormatRule: {
      rule: {
        ranges: [{ sheetId: dashboardSheetId, startRowIndex: 1, endRowIndex: mainRows.length, startColumnIndex: 9, endColumnIndex: 10 }],
        booleanRule: {
          condition: { type: "NUMBER_GREATER", values: [{ userEnteredValue: "0" }] },
          format: {
            backgroundColor: { red: 255 / 255, green: 152 / 255, blue: 0 / 255 },  // Material Orange 500
            textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } },
          },
        },
      },
      index: 0,
    },
  });

  // GTP Aging conditional formatting: color # columns when value > 0
  // Green (0-7d), Yellow (8-14d), Orange (15-21d), Red (21+d)
  const agingCfBands: Array<{ col: number; rgb: [number, number, number]; dark?: boolean }> = [
    { col: 17, rgb: [129, 199, 132] },       // GTP 0-7d — Material Green 300
    { col: 19, rgb: [255, 235, 59] },         // GTP 8-14d — Material Yellow 400
    { col: 21, rgb: [255, 167, 38] },         // GTP 15-21d — Material Orange 400
    { col: 23, rgb: [239, 83, 80], dark: true }, // GTP 21+d — Material Red 400
  ];
  for (const band of agingCfBands) {
    // Highlight both # column and adjacent $ column (col and col+1)
    formatRequests.push({
      addConditionalFormatRule: {
        rule: {
          ranges: [{ sheetId: dashboardSheetId, startRowIndex: 1, endRowIndex: mainRows.length, startColumnIndex: band.col, endColumnIndex: band.col + 2 }],
          booleanRule: {
            condition: { type: "CUSTOM_FORMULA", values: [{ userEnteredValue: `=${String.fromCharCode(65 + band.col)}2>0` }] },
            format: {
              backgroundColor: { red: band.rgb[0] / 255, green: band.rgb[1] / 255, blue: band.rgb[2] / 255 },
              ...(band.dark ? { textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } } } : {}),
            },
          },
        },
        index: 0,
      },
    });
  }

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests: formatRequests },
  });

  const totalRows = sortedMonths.reduce((sum, s) => sum + s.total, 0);
  console.log(`  Dashboard: ${sortedMonths.length} months, ${totalRows} total jobs`);
  return totalRows;
}

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
export async function refreshProfitabilityDashboard(spreadsheetId: string): Promise<Map<string, number>> {
  const sheets = await getSheetsClient();

  // 1. Get all sheet names + Dashboard sheetId
  const meta = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets.properties",
  });
  const allTabs = (meta.data.sheets ?? [])
    .map((s: any) => s.properties?.title as string)
    .filter(Boolean);

  const dashSheet = meta.data.sheets?.find((s: any) => s.properties?.title === DASHBOARD_TAB);
  if (!dashSheet) return new Map();
  const dashboardSheetId = dashSheet.properties!.sheetId!;

  // 2. Auto-discover month tabs from spreadsheet (no hardcoded list)
  // Recurring tab naming: "Feb - R" (abbreviated), all others "{Month} - R"
  const RECURRING_TAB_ABBREVS: Record<string, string> = {
    "January": "Jan - R", "February": "Feb - R", "March": "March - R",
    "April": "April - R", "May": "May - R", "June": "June - R",
    "July": "July - R", "August": "August - R", "September": "September - R",
    "October": "October - R", "November": "November - R", "December": "December - R",
  };
  const tabSet = new Set(allTabs);
  const MONTHS_TO_SCAN: Array<{ display: string; oneOffTab: string; recurringTab: string; type: "legacy" | "new" }> = [];

  for (const monthName of MONTH_NAMES) {
    if (monthName === "January") continue; // January excluded per Nathan
    // Find the one-off tab: try bare name first, then with year suffix
    let oneOffTab = "";
    if (tabSet.has(monthName)) {
      oneOffTab = monthName;
    } else {
      // Try year suffixes (2025, 2026, 2027...)
      for (let year = 2025; year <= 2030; year++) {
        if (tabSet.has(`${monthName} ${year}`)) { oneOffTab = `${monthName} ${year}`; break; }
      }
    }
    if (!oneOffTab) continue; // Tab doesn't exist yet — skip

    const recurringTab = RECURRING_TAB_ABBREVS[monthName] || `${monthName} - R`;
    const type = isNewLayout(oneOffTab) ? "new" : "legacy";
    MONTHS_TO_SCAN.push({ display: monthName, oneOffTab, recurringTab, type });
  }
  console.log(`  Profitability: discovered ${MONTHS_TO_SCAN.length} months: ${MONTHS_TO_SCAN.map(m => m.display).join(", ")}`);

  // Helper: derive ISO date of the Sunday starting the week containing the given date string
  function getWeekSunday(dateStr: string): string | null {
    if (!dateStr) return null;
    // Handle M/D/YYYY (e.g. "3/14/2026") and YYYY-MM-DD
    let d: Date;
    if (dateStr.includes("/")) {
      const parts = dateStr.split("/");
      if (parts.length === 3) {
        d = new Date(parseInt(parts[2], 10), parseInt(parts[0], 10) - 1, parseInt(parts[1], 10));
      } else {
        return null;
      }
    } else {
      d = new Date(dateStr + "T12:00:00Z");
    }
    if (isNaN(d.getTime())) return null;
    const day = d.getDay(); // 0=Sun
    const sun = new Date(d);
    sun.setDate(d.getDate() - day);
    return sun.toISOString().split("T")[0]; // "YYYY-MM-DD"
  }

  function weekLabel(sundayIso: string): string {
    const sun = new Date(sundayIso + "T12:00:00Z");
    const sat = new Date(sun);
    sat.setUTCDate(sun.getUTCDate() + 6);
    const fmt = (dt: Date) => dt.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
    return `${fmt(sun)} – ${fmt(sat)}`;
  }

  // 3. Aggregate data — dual pass: per-month (for C1 headers) + per-week (for Dashboard display)

  // Monthly buckets (for C1 margin return map)
  const monthData: Array<{
    month: string;
    // One-off (main tab rows where Division ≠ "Hybrid")
    oneOffRevenue: number;    // paid only, deduped by Job# (new) or Invoice# (legacy)
    oneOffLabor: number;      // invoiced rows only
    oneOffJobs: number;       // unique Job # count (invoiced)
    oneOffExcluded: number;   // invoiced rows excluded from revenue (not paid)
    // Recurring (- R tabs)
    recurringRevenue: number; // paid only, deduped by Invoice#
    recurringLabor: number;   // invoiced rows only
    recurringVisits: number;  // total invoiced rows
    recurringInvoices: number;// unique Invoice # count
    recurringExcluded: number;// invoiced rows excluded from revenue (not paid)
    // Hybrid (main tab rows where Division = "Hybrid")
    hybridRevenue: number;    // paid only
    hybridLabor: number;      // invoiced rows only
    hybridJobs: number;       // unique Job # count (invoiced)
  }> = [];

  // Weekly buckets (for Dashboard display)
  interface WeekBucket {
    weekKey: string;          // ISO Sunday date (for sorting)
    label: string;            // "Apr 6 – Apr 12" (for display)
    oneOffRevenue: number;
    oneOffLabor: number;
    oneOffJobs: Set<string>;        // unique Job# per week
    oneOffExcluded: number;
    recurringRevenue: number;
    recurringLabor: number;
    recurringVisits: number;
    recurringInvoices: Set<string>; // unique Invoice# per week
    recurringExcluded: Set<string>; // unique Invoice# that were excluded
    hybridRevenue: number;
    hybridLabor: number;
    hybridJobs: Set<string>;        // unique Job# per week
  }
  const weekMap = new Map<string, WeekBucket>();

  function getOrCreateWeek(weekKey: string): WeekBucket {
    if (!weekMap.has(weekKey)) {
      weekMap.set(weekKey, {
        weekKey,
        label: weekLabel(weekKey),
        oneOffRevenue: 0, oneOffLabor: 0, oneOffJobs: new Set(), oneOffExcluded: 0,
        recurringRevenue: 0, recurringLabor: 0, recurringVisits: 0,
        recurringInvoices: new Set(), recurringExcluded: new Set(),
        hybridRevenue: 0, hybridLabor: 0, hybridJobs: new Set(),
      });
    }
    return weekMap.get(weekKey)!;
  }

  for (const m of MONTHS_TO_SCAN) {
    const hasOneOff = allTabs.includes(m.oneOffTab);
    const hasRecurring = allTabs.includes(m.recurringTab);
    if (!hasOneOff && !hasRecurring) continue;

    let oneOffRevenue = 0, hybridRevenue = 0, recurringRevenue = 0;
    let oneOffLabor = 0, hybridLabor = 0, recurringLabor = 0;
    let oneOffExcluded = 0, recurringExcluded = 0;
    const seenOneOffJobs = new Set<string>();
    const seenHybridJobs = new Set<string>();
    let recurringVisits = 0;
    const seenRecurringInvoices = new Set<string>();

    // --- One-off tab (contains both "one-off" and "hybrid" rows by Division) ---
    // Invoice gate: row must be invoiced before division is trusted or labor counted.
    //   Legacy: must have a real Invoice # in col L (not blank, not "-")
    //   New:    must have # of Invoices (col L) > 0
    if (hasOneOff) {
      try {
        const range = m.type === "legacy"
          ? `'${m.oneOffTab}'!A2:V500`
          : `'${m.oneOffTab}'!A2:T500`;
        const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
        const rows = (res.data.values ?? []) as string[][];

        if (m.type === "legacy") {
          // Legacy layout (Jan/Feb):
          //   A=Date(0), G=Job#(6), L=Division(11), M=Invoice#(12), N=TotalInvoiced(13),
          //   P=InvoiceStatus(15), S=SubInvAmt(18), V=PaymentStatus(21)
          // Invoice gate: col M must be a real invoice number (not blank, not "-")
          // Revenue gate: InvoiceStatus(P) = "Paid"
          // Dedup revenue by Invoice # (monthly) and per-week
          const seenInvoices = new Set<string>();
          for (const row of rows) {
            const jobNum     = (row[6]  ?? "").toString().trim();
            if (!jobNum) continue;
            const invoiceNum = (row[12] ?? "").toString().trim();
            // Invoice gate: skip uninvoiced rows — division not yet finalised
            if (!invoiceNum || invoiceNum === "-") continue;

            const division  = (row[11] ?? "").toString().trim();
            const invTotal  = (row[13] ?? "").toString().trim();
            const invStatus = (row[15] ?? "").toString().trim();
            const labor     = parseDollarAmount((row[18] ?? "").toString());
            const payStatus = (row[21] ?? "").toString().trim();
            // Skip "No payment" rows (sub never gets paid, not a real job)
            if (payStatus.toLowerCase().startsWith("no payment")) continue;

            const isHybrid = division === "Hybrid";
            const clientPaid = invStatus.toLowerCase() === "paid";
            const dateStr   = (row[0] ?? "").toString().trim();
            const weekKey   = getWeekSunday(dateStr);

            // Labor + Revenue: only count when client has paid AND sub invoice amount is populated
            if (clientPaid && labor > 0) {
              if (isHybrid) {
                hybridLabor += labor;
                seenHybridJobs.add(jobNum);
                if (weekKey) {
                  const wk = getOrCreateWeek(weekKey);
                  wk.hybridLabor += labor;
                  wk.hybridJobs.add(jobNum);
                }
              } else {
                oneOffLabor += labor;
                seenOneOffJobs.add(jobNum);
                if (weekKey) {
                  const wk = getOrCreateWeek(weekKey);
                  wk.oneOffLabor += labor;
                  wk.oneOffJobs.add(jobNum);
                }
              }
              // Revenue: dedup by Invoice # (monthly)
              if (!seenInvoices.has(invoiceNum)) {
                seenInvoices.add(invoiceNum);
                const rev = parseDollarAmount(invTotal);
                if (isHybrid) hybridRevenue += rev;
                else          oneOffRevenue += rev;
              }
              // Revenue: dedup by Invoice # per-week
              if (weekKey) {
                const wk = getOrCreateWeek(weekKey);
                if (!wk.oneOffJobs.has(`inv:${invoiceNum}`) && !wk.hybridJobs.has(`inv:${invoiceNum}`)) {
                  // Use invoice-keyed dedup for legacy (one invoice = one revenue entry)
                  const weekInvKey = `inv:${invoiceNum}`;
                  if (isHybrid) {
                    if (!wk.hybridJobs.has(weekInvKey)) {
                      wk.hybridJobs.add(weekInvKey);
                      wk.hybridRevenue += parseDollarAmount(invTotal);
                    }
                  } else {
                    if (!wk.oneOffJobs.has(weekInvKey)) {
                      wk.oneOffJobs.add(weekInvKey);
                      wk.oneOffRevenue += parseDollarAmount(invTotal);
                    }
                  }
                }
              }
            } else if (!isHybrid) {
              oneOffExcluded++;
              if (weekKey) getOrCreateWeek(weekKey).oneOffExcluded++;
            }
          }
        } else {
          // New layout (March+):
          //   A=Date(0), G=Job#(6), L=Division(11), M=#Invoices(12), N=TotalInvoiced(13),
          //   O=AllPaid?(14), Q=SubInvAmt(16), T=PaymentStatus(19)
          // Invoice gate: col M (# of Invoices) must be > 0 — skips jobs not yet invoiced
          // Revenue gate: All Paid?(O) = "✅"
          // Dedup revenue by Job #
          const seenJobsForRevenue = new Set<string>();
          // Weekly dedup: per-weekKey sets
          const weekSeenJobs = new Map<string, Set<string>>();
          for (const row of rows) {
            const jobNum    = (row[6]  ?? "").toString().trim();
            if (!jobNum) continue;
            const numInvoices = parseInt((row[12] ?? "0").toString().trim(), 10) || 0;
            // Invoice gate: skip uninvoiced rows — division not yet finalised
            if (numInvoices === 0) continue;

            const division  = (row[11] ?? "").toString().trim();
            const invTotal  = (row[13] ?? "").toString().trim();
            const allPaid   = (row[14] ?? "").toString().trim();
            const labor     = parseDollarAmount((row[16] ?? "").toString());
            const payStatus = (row[19] ?? "").toString().trim();
            // Skip "No payment" rows
            if (payStatus.toLowerCase().startsWith("no payment")) continue;

            const isHybrid = division === "Hybrid";
            const clientPaid = allPaid === "✅";
            const dateStr   = (row[0] ?? "").toString().trim();
            const weekKey   = getWeekSunday(dateStr);

            // Labor + Revenue: only count when client has paid AND sub invoice amount is populated
            // Jobs with $0/blank sub invoice are excluded — sub cost not yet entered
            if (clientPaid && labor > 0) {
              if (isHybrid) {
                hybridLabor += labor;
                seenHybridJobs.add(jobNum);
                if (weekKey) {
                  const wk = getOrCreateWeek(weekKey);
                  wk.hybridLabor += labor;
                  wk.hybridJobs.add(jobNum);
                }
              } else {
                oneOffLabor += labor;
                seenOneOffJobs.add(jobNum);
                if (weekKey) {
                  const wk = getOrCreateWeek(weekKey);
                  wk.oneOffLabor += labor;
                  wk.oneOffJobs.add(jobNum);
                }
              }
              // Revenue: dedup by Job # (monthly)
              if (!seenJobsForRevenue.has(jobNum)) {
                seenJobsForRevenue.add(jobNum);
                const rev = parseDollarAmount(invTotal);
                if (isHybrid) hybridRevenue += rev;
                else          oneOffRevenue += rev;
              }
              // Revenue: dedup by Job # per-week
              if (weekKey) {
                if (!weekSeenJobs.has(weekKey)) weekSeenJobs.set(weekKey, new Set());
                const wkSeen = weekSeenJobs.get(weekKey)!;
                if (!wkSeen.has(jobNum)) {
                  wkSeen.add(jobNum);
                  const rev = parseDollarAmount(invTotal);
                  const wk = getOrCreateWeek(weekKey);
                  if (isHybrid) wk.hybridRevenue += rev;
                  else          wk.oneOffRevenue += rev;
                }
              }
            } else if (!isHybrid) {
              oneOffExcluded++;
              if (weekKey) getOrCreateWeek(weekKey).oneOffExcluded++;
            }
          }
        }
      } catch (e: any) {
        if (!e?.message?.includes("Unable to parse range")) throw e;
      }
    }

    // --- Recurring tab ---
    // Layout: A=Date(0), F=Job#(5), L=Invoice#(11), M=TotalInvoiced(12), O=InvoiceStatus(14), R=SubInvAmt(17)
    // Invoice gate: col L must be a real invoice number (not blank, not "-")
    // Revenue gate: InvoiceStatus(O) = "Paid"
    // Dedup revenue by Invoice # (one billing cycle invoice covers multiple visits)
    // Track both visit count and invoice count — one invoice spans multiple visits,
    // so visits-per-invoice context is needed for margin analysis.
    if (hasRecurring) {
      try {
        const res = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: `'${m.recurringTab}'!A2:U500`,
        });
        const rows = (res.data.values ?? []) as string[][];

        // Single pass: track visits + labor per row, revenue dedup by Invoice # (monthly + weekly)
        const seenPaidInvoices = new Set<string>();
        const seenUnpaidInvoices = new Set<string>();
        for (const row of rows) {
          const jobNum     = (row[5]  ?? "").toString().trim();
          if (!jobNum) continue;
          const invoiceNum = (row[11] ?? "").toString().trim();
          if (!invoiceNum || invoiceNum === "-") continue;

          const invTotal  = (row[12] ?? "").toString().trim();
          const invStatus = (row[14] ?? "").toString().trim();
          const labor     = parseDollarAmount((row[17] ?? "").toString());
          const clientPaid = invStatus.toLowerCase() === "paid";
          const dateStr   = (row[0] ?? "").toString().trim();
          const weekKey   = getWeekSunday(dateStr);

          recurringVisits++;
          seenRecurringInvoices.add(invoiceNum);
          if (weekKey) {
            const wk = getOrCreateWeek(weekKey);
            wk.recurringVisits++;
            wk.recurringInvoices.add(invoiceNum);
          }

          // Only count when client has paid AND sub invoice amount is populated
          if (clientPaid && labor > 0) {
            recurringLabor += labor;
            if (weekKey) getOrCreateWeek(weekKey).recurringLabor += labor;
            // Revenue: dedup by Invoice # — monthly
            if (!seenPaidInvoices.has(invoiceNum)) {
              seenPaidInvoices.add(invoiceNum);
              recurringRevenue += parseDollarAmount(invTotal);
            }
            // Revenue: dedup by Invoice # — per-week
            if (weekKey) {
              const wk = getOrCreateWeek(weekKey);
              if (!wk.recurringInvoices.has(`paid:${invoiceNum}`)) {
                wk.recurringInvoices.add(`paid:${invoiceNum}`);
                wk.recurringRevenue += parseDollarAmount(invTotal);
              }
            }
          } else if (!seenUnpaidInvoices.has(invoiceNum)) {
            seenUnpaidInvoices.add(invoiceNum);
            recurringExcluded++;
            if (weekKey) getOrCreateWeek(weekKey).recurringExcluded.add(invoiceNum);
          }
        }
      } catch (e: any) {
        if (!e?.message?.includes("Unable to parse range")) throw e;
      }
    }

    monthData.push({
      month: m.display,
      oneOffRevenue, oneOffLabor, oneOffJobs: seenOneOffJobs.size, oneOffExcluded,
      recurringRevenue, recurringLabor, recurringVisits,
      recurringInvoices: seenRecurringInvoices.size, recurringExcluded,
      hybridRevenue, hybridLabor, hybridJobs: seenHybridJobs.size,
    });
  }

  if (monthData.length === 0 && weekMap.size === 0) return new Map();

  // 4a. Build marginByMonth from monthly data (used for C1 header writes — unchanged)
  const marginByMonth = new Map<string, number>();
  for (const m of monthData) {
    const totalRev   = m.oneOffRevenue + m.recurringRevenue;
    const totalLabor = m.oneOffLabor   + m.recurringLabor;
    const totalMargin = totalRev > 0 ? (totalRev - totalLabor) / totalRev : 0;
    marginByMonth.set(m.month, totalMargin);
  }

  // 4b. Build weekly display rows for Dashboard
  //
  // Column layout (19 cols):
  //  A  Week ("Apr 6 – Apr 12")
  //  --- ONE-OFF (main tab, non-Hybrid) ---
  //  B  One-off Revenue    (paid jobs only, deduped by Job#/Invoice# per week)
  //  C  One-off Labor      (invoiced + paid rows)
  //  D  One-off Margin %   (rev-labor)/rev
  //  E  # One-off Jobs     (unique Job# count, invoiced + paid)
  //  F  # One-off Excluded (invoiced but not paid — excluded from revenue/margin)
  //  --- RECURRING (- R tabs) ---
  //  G  Recurring Revenue  (paid invoices only, deduped by Invoice# per week)
  //  H  Recurring Labor    (invoiced + paid rows)
  //  I  Recurring Margin % (rev-labor)/rev
  //  J  # Recur. Visits    (total invoiced rows)
  //  K  # Recur. Invoices  (unique Invoice# — includes unpaid, for context)
  //  L  # Recur. Excluded  (unique unpaid Invoice# excluded from revenue)
  //  --- HYBRID (main tab, Division = "Hybrid") ---
  //  M  Hybrid Revenue     (paid jobs only)
  //  N  Hybrid Labor       (invoiced + paid rows)
  //  O  # Hybrid Jobs      (unique Job# count, invoiced + paid)
  //  --- TOTALS ---
  //  P  Total Revenue      (one-off + recurring ONLY — hybrid excluded)
  //  Q  Total Labor        (one-off + recurring ONLY)
  //  R  Total Gross Profit
  //  S  Total Margin %
  const NUM_COLS = 19;
  const columnHeaders = [
    "Week",
    // One-off
    "One-off Paid",       "One-off Labor",    "One-off Margin %",
    "# One-off Jobs",     "# Excl. (One-off)",
    // Recurring
    "Recurring Paid",     "Recurring Labor",  "Recurring Margin %",
    "# Recur. Visits",    "# Recur. Invoices", "# Excl. (Recur.)",
    // Hybrid
    "Hybrid Paid",        "Hybrid Labor",     "# Hybrid Jobs",
    // Totals
    "Total Paid (excl. Hybrid)",     "Total Labor (excl. Hybrid)",  "Gross Profit (excl. Hybrid)",  "Total Margin %",
  ];

  // Sort weeks chronologically
  const sortedWeeks = Array.from(weekMap.values()).sort((a, b) => a.weekKey.localeCompare(b.weekKey));

  const dataRows: (string | number)[][] = [];
  const ytd = {
    oneOffRev: 0, oneOffLab: 0, oneOffJobs: 0, oneOffExcl: 0,
    recurRev: 0,  recurLab: 0,  recurVisits: 0, recurInvoices: 0, recurExcl: 0,
    hybridRev: 0, hybridLab: 0, hybridJobs: 0,
  };

  for (const wk of sortedWeeks) {
    // Count unique jobs/invoices — filter out the "inv:" / "paid:" dedup keys
    const oneOffJobCount = Array.from(wk.oneOffJobs).filter(j => !j.startsWith("inv:")).length;
    const hybridJobCount = Array.from(wk.hybridJobs).filter(j => !j.startsWith("inv:")).length;
    // recurringInvoices has both bare invoice# entries (for visit counting) and "paid:X" dedup keys
    const bareInvoices   = Array.from(wk.recurringInvoices).filter(i => !i.startsWith("paid:"));
    const recurInvCount  = bareInvoices.length;

    const oneOffMargin = wk.oneOffRevenue  > 0 ? (wk.oneOffRevenue  - wk.oneOffLabor)  / wk.oneOffRevenue  : 0;
    const recurMargin  = wk.recurringRevenue > 0 ? (wk.recurringRevenue - wk.recurringLabor) / wk.recurringRevenue : 0;
    const totalRev     = wk.oneOffRevenue + wk.recurringRevenue;
    const totalLabor   = wk.oneOffLabor   + wk.recurringLabor;
    const grossProfit  = totalRev - totalLabor;
    const totalMargin  = totalRev > 0 ? grossProfit / totalRev : 0;

    dataRows.push([
      wk.label,
      wk.oneOffRevenue,    wk.oneOffLabor,    oneOffMargin,
      oneOffJobCount,      wk.oneOffExcluded,
      wk.recurringRevenue, wk.recurringLabor, recurMargin,
      wk.recurringVisits,  recurInvCount,     wk.recurringExcluded.size,
      wk.hybridRevenue,    wk.hybridLabor,    hybridJobCount,
      totalRev,            totalLabor,        grossProfit,  totalMargin,
    ]);

    ytd.oneOffRev    += wk.oneOffRevenue;
    ytd.oneOffLab    += wk.oneOffLabor;
    ytd.oneOffJobs   += oneOffJobCount;
    ytd.oneOffExcl   += wk.oneOffExcluded;
    ytd.recurRev     += wk.recurringRevenue;
    ytd.recurLab     += wk.recurringLabor;
    ytd.recurVisits  += wk.recurringVisits;
    ytd.recurInvoices += recurInvCount;
    ytd.recurExcl    += wk.recurringExcluded.size;
    ytd.hybridRev    += wk.hybridRevenue;
    ytd.hybridLab    += wk.hybridLabor;
    ytd.hybridJobs   += hybridJobCount;
  }

  const ytdOneOffMargin = ytd.oneOffRev  > 0 ? (ytd.oneOffRev  - ytd.oneOffLab)  / ytd.oneOffRev  : 0;
  const ytdRecurMargin  = ytd.recurRev   > 0 ? (ytd.recurRev   - ytd.recurLab)   / ytd.recurRev   : 0;
  // YTD totals exclude hybrid (different cost structure)
  const ytdTotalRev     = ytd.oneOffRev + ytd.recurRev;
  const ytdTotalLab     = ytd.oneOffLab + ytd.recurLab;
  const ytdGrossProfit  = ytdTotalRev - ytdTotalLab;
  const ytdMargin       = ytdTotalRev > 0 ? ytdGrossProfit / ytdTotalRev : 0;
  const ytdRow: (string | number)[] = [
    "YTD",
    // One-off
    ytd.oneOffRev,  ytd.oneOffLab,  ytdOneOffMargin,
    ytd.oneOffJobs, ytd.oneOffExcl,
    // Recurring
    ytd.recurRev,   ytd.recurLab,   ytdRecurMargin,
    ytd.recurVisits, ytd.recurInvoices, ytd.recurExcl,
    // Hybrid
    ytd.hybridRev,  ytd.hybridLab,  ytd.hybridJobs,
    // Totals
    ytdTotalRev,    ytdTotalLab,    ytdGrossProfit,  ytdMargin,
  ];

  // 5. Notes rows explaining methodology (written above the data table)
  const notesRows: string[][] = [
    ["📊 Cash Flow & Profitability (Paid vs Unpaid — Weekly)"],
    [""],
    ["ℹ️ How numbers are calculated:"],
    ["  Paid       — Client-paid amounts only (All Paid? = ✅ on main tabs; Jobber Invoice Status = Paid on recurring tabs). Unpaid, On Hold, and NO CLIENT PAY jobs are excluded. Jobs with $0 or blank sub invoice are also excluded."],
    ["  Labor      — Sub Invoice Amount (col P/R). Counted only when client has paid AND sub invoice amount > $0 (same gate as revenue). Jobs with $0 or blank sub invoice are excluded — sub cost not yet entered."],
    ["  One-off    — Division = 'Subcontractor - Dayshift' (or unrecognised). Revenue deduped by Job # to prevent double-counting multi-contractor jobs."],
    ["  Hybrid     — Division = 'Hybrid'. KC in-house labor + one or more PPs on the same job. ⚠️ Margin is a ceiling — KC's own cost of labor is not yet tracked (coming with Hybrid tab)."],
    ["  Recurring  — Jobs on the {Month} - R tabs. Revenue deduped by Invoice # (one billing cycle invoice covers multiple visits). # Recur. Visits = total invoiced rows; # Recur. Invoices = unique invoices. Divide visits by invoices to understand avg visits per billing cycle. Recurring margin is per-invoice — for per-visit margin, divide by visits/invoices ratio."],
    ["  Hybrid     — Division = 'Hybrid' on main tabs. Revenue and labor tracked separately; NOT included in Totals (different cost structure — KC in-house labor not tracked here). Hybrid margin TBD in a future update."],
    ["  # Excluded — Invoiced rows where the client has not yet paid. Both revenue AND labor are excluded. This shows jobs completed but not yet billable for profitability."],
    ["  Margin %   — Shown per category (One-off, Recurring). Total Margin % = (One-off + Recurring Paid - Labor) / Paid. Hybrid excluded from totals."],
    ["  Invoice gate — Uninvoiced rows are excluded from ALL calculations (revenue and labor). Division is not trusted until a job is invoiced."],
    [""],
  ];

  // 6. Clear old profitability section (rows 18+)
  try {
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: `'${DASHBOARD_TAB}'!A18:S200`,
    });
  } catch { /* may be empty */ }

  // 7. Write notes + table
  // Notes start at row 18 (0-based: 17)
  const NOTES_START_ROW = 18; // 1-based
  const notesCount = notesRows.length;
  const TABLE_HEADER_ROW = NOTES_START_ROW + notesCount;    // 1-based
  const TABLE_DATA_START  = TABLE_HEADER_ROW + 1;           // 1-based

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `'${DASHBOARD_TAB}'!A${NOTES_START_ROW}:A${NOTES_START_ROW + notesCount - 1}`,
    valueInputOption: "RAW",
    requestBody: { values: notesRows },
  });

  const allRows: (string | number)[][] = [columnHeaders, ...dataRows, ytdRow];
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `'${DASHBOARD_TAB}'!A${TABLE_HEADER_ROW}:S${TABLE_HEADER_ROW + allRows.length - 1}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: allRows },
  });

  // 8. Formatting
  const ytdRowIndex0      = TABLE_DATA_START - 1 + sortedWeeks.length; // 0-based (one row per week)
  const tableHeaderIndex0 = TABLE_HEADER_ROW - 1;                   // 0-based
  const tableDataStart0   = TABLE_DATA_START - 1;                   // 0-based
  const notesStart0       = NOTES_START_ROW - 1;                    // 0-based
  const formatRequests: any[] = [];

  // Section title row (row 18, 0-based 17): blue bg, white bold, merged A–M
  formatRequests.push({
    mergeCells: {
      range: { sheetId: dashboardSheetId, startRowIndex: notesStart0, endRowIndex: notesStart0 + 1, startColumnIndex: 0, endColumnIndex: NUM_COLS },
      mergeType: "MERGE_ALL",
    },
  });
  formatRequests.push({
    repeatCell: {
      range: { sheetId: dashboardSheetId, startRowIndex: notesStart0, endRowIndex: notesStart0 + 1, startColumnIndex: 0, endColumnIndex: NUM_COLS },
      cell: {
        userEnteredFormat: {
          backgroundColor: { red: 26 / 255, green: 115 / 255, blue: 232 / 255 },
          textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 }, fontSize: 11 },
        },
      },
      fields: "userEnteredFormat(backgroundColor,textFormat)",
    },
  });

  // Notes rows: light grey bg, italic, merged A–M
  for (let i = 1; i < notesCount; i++) {
    const rowIdx = notesStart0 + i;
    formatRequests.push({
      mergeCells: {
        range: { sheetId: dashboardSheetId, startRowIndex: rowIdx, endRowIndex: rowIdx + 1, startColumnIndex: 0, endColumnIndex: NUM_COLS },
        mergeType: "MERGE_ALL",
      },
    });
    formatRequests.push({
      repeatCell: {
        range: { sheetId: dashboardSheetId, startRowIndex: rowIdx, endRowIndex: rowIdx + 1, startColumnIndex: 0, endColumnIndex: NUM_COLS },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 243 / 255, green: 243 / 255, blue: 243 / 255 },
            textFormat: { italic: true, fontSize: 9 },
            wrapStrategy: "WRAP",
          },
        },
        fields: "userEnteredFormat(backgroundColor,textFormat,wrapStrategy)",
      },
    });
  }

  // Column header row: bold, light blue bg
  formatRequests.push({
    repeatCell: {
      range: { sheetId: dashboardSheetId, startRowIndex: tableHeaderIndex0, endRowIndex: tableHeaderIndex0 + 1, startColumnIndex: 0, endColumnIndex: NUM_COLS },
      cell: {
        userEnteredFormat: {
          backgroundColor: { red: 207 / 255, green: 226 / 255, blue: 255 / 255 },
          textFormat: { bold: true },
        },
      },
      fields: "userEnteredFormat(backgroundColor,textFormat)",
    },
  });

  // YTD row: light green bg, bold
  formatRequests.push({
    repeatCell: {
      range: { sheetId: dashboardSheetId, startRowIndex: ytdRowIndex0, endRowIndex: ytdRowIndex0 + 1, startColumnIndex: 0, endColumnIndex: NUM_COLS },
      cell: {
        userEnteredFormat: {
          backgroundColor: { red: 197 / 255, green: 224 / 255, blue: 180 / 255 },
          textFormat: { bold: true },
        },
      },
      fields: "userEnteredFormat(backgroundColor,textFormat)",
    },
  });

  // Clear ALL number formatting on the data+YTD rows first (cols B–S = 1–18)
  // to prevent stale format types from prior layouts bleeding onto new count columns.
  formatRequests.push({
    repeatCell: {
      range: { sheetId: dashboardSheetId, startRowIndex: tableDataStart0, endRowIndex: ytdRowIndex0 + 1, startColumnIndex: 1, endColumnIndex: 19 },
      cell: { userEnteredFormat: { numberFormat: { type: "TEXT" } } },
      fields: "userEnteredFormat.numberFormat",
    },
  });

  // New layout (19 cols, 0-indexed):
  //  0=Month
  //  1=One-off Rev, 2=One-off Labor,              [3=Margin%, 4=# Jobs, 5=# Excl]
  //  6=Recur Rev,   7=Recur Labor,                [8=Margin%, 9=#Visits, 10=#Inv, 11=#Excl]
  //  12=Hybrid Rev, 13=Hybrid Labor,              [14=# Jobs]
  //  15=Total Rev,  16=Total Labor, 17=Gross Profit, [18=Margin%]
  // Currency cols: 1,2,6,7,12,13,15,16,17
  for (const col of [1, 2, 6, 7, 12, 13, 15, 16, 17]) {
    formatRequests.push({
      repeatCell: {
        range: { sheetId: dashboardSheetId, startRowIndex: tableDataStart0, endRowIndex: ytdRowIndex0 + 1, startColumnIndex: col, endColumnIndex: col + 1 },
        cell: { userEnteredFormat: { numberFormat: { type: "CURRENCY", pattern: "$#,##0.00" } } },
        fields: "userEnteredFormat.numberFormat",
      },
    });
  }

  // Percentage format on margin cols: 3 (One-off), 8 (Recurring), 18 (Total)
  for (const col of [3, 8, 18]) {
    formatRequests.push({
      repeatCell: {
        range: { sheetId: dashboardSheetId, startRowIndex: tableDataStart0, endRowIndex: ytdRowIndex0 + 1, startColumnIndex: col, endColumnIndex: col + 1 },
        cell: { userEnteredFormat: { numberFormat: { type: "PERCENT", pattern: "0.0%" } } },
        fields: "userEnteredFormat.numberFormat",
      },
    });
  }

  // 10-band gradient conditional formatting on margin % columns:
  //   D (One-off, index 3), I (Recurring, index 8), S (Total, index 18)
  // Same palette as setupMarginCF on monthly tabs.
  const marginCfRanges = [3, 8, 18].map(col => ({
    sheetId: dashboardSheetId,
    startRowIndex: tableDataStart0,
    endRowIndex: ytdRowIndex0 + 1,
    startColumnIndex: col,
    endColumnIndex: col + 1,
  }));
  const marginBands: Array<{ rgb: [number, number, number]; type: string; values: Array<{ userEnteredValue: string }>; dark?: boolean }> = [
    { rgb: [56, 142, 60],    type: "NUMBER_BETWEEN", values: [{ userEnteredValue: "0.90" }, { userEnteredValue: "100" }] },
    { rgb: [76, 175, 80],    type: "NUMBER_BETWEEN", values: [{ userEnteredValue: "0.80" }, { userEnteredValue: "0.8999" }] },
    { rgb: [129, 199, 132],  type: "NUMBER_BETWEEN", values: [{ userEnteredValue: "0.70" }, { userEnteredValue: "0.7999" }] },
    { rgb: [165, 214, 167],  type: "NUMBER_BETWEEN", values: [{ userEnteredValue: "0.60" }, { userEnteredValue: "0.6999" }] },
    { rgb: [220, 231, 117],  type: "NUMBER_BETWEEN", values: [{ userEnteredValue: "0.50" }, { userEnteredValue: "0.5999" }] },
    { rgb: [255, 235, 59],   type: "NUMBER_BETWEEN", values: [{ userEnteredValue: "0.40" }, { userEnteredValue: "0.4999" }] },
    { rgb: [255, 167, 38],   type: "NUMBER_BETWEEN", values: [{ userEnteredValue: "0.30" }, { userEnteredValue: "0.3999" }] },
    { rgb: [255, 112, 67],   type: "NUMBER_BETWEEN", values: [{ userEnteredValue: "0.20" }, { userEnteredValue: "0.2999" }], dark: true },
    { rgb: [239, 83, 80],    type: "NUMBER_BETWEEN", values: [{ userEnteredValue: "0.10" }, { userEnteredValue: "0.1999" }], dark: true },
    { rgb: [198, 40, 40],    type: "NUMBER_BETWEEN", values: [{ userEnteredValue: "0.001" }, { userEnteredValue: "0.0999" }], dark: true },
  ];
  marginBands.forEach((band, idx) => {
    // Offset index by 10 because paidBands (10 rules) are added first in the same batch
    formatRequests.push({
      addConditionalFormatRule: {
        rule: {
          ranges: marginCfRanges,
          booleanRule: {
            condition: { type: band.type, values: band.values },
            format: {
              backgroundColor: {
                red: band.rgb[0] / 255,
                green: band.rgb[1] / 255,
                blue: band.rgb[2] / 255,
              },
              ...(band.dark ? { textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 } } } : {}),
            },
          },
        },
        index: 10 + idx, // After paidBands (0-9); preserves priority order
      },
    });
  });

  // Column widths: A=120, B–M=130
  formatRequests.push({
    updateDimensionProperties: {
      range: { sheetId: dashboardSheetId, dimension: "COLUMNS", startIndex: 0, endIndex: 1 },
      properties: { pixelSize: 120 },
      fields: "pixelSize",
    },
  });
  for (let col = 1; col < NUM_COLS; col++) {
    formatRequests.push({
      updateDimensionProperties: {
        range: { sheetId: dashboardSheetId, dimension: "COLUMNS", startIndex: col, endIndex: col + 1 },
        properties: { pixelSize: 130 },
        fields: "pixelSize",
      },
    });
  }

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests: formatRequests },
  });

  console.log(`  Profitability: ${sortedWeeks.length} weeks written to Dashboard (one-off/hybrid/recurring split)`);

  return marginByMonth;
}

/**
 * Extend all conditional format rules on a tab so they cover up to maxRow rows.
 * Useful when a tab grows beyond the original CF range (e.g., March hits row 201+).
 */
export async function extendTabCF(spreadsheetId: string, tabName: string, maxRow: number = 500): Promise<number> {
  const sheets = await getSheetsClient();

  const meta = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets(properties,conditionalFormats)",
  });

  const sheet = meta.data.sheets?.find((s: any) => s.properties?.title === tabName);
  if (!sheet) throw new Error(`Tab "${tabName}" not found`);

  const sheetId = sheet.properties!.sheetId!;
  const cf: any[] = sheet.conditionalFormats || [];

  if (cf.length === 0) {
    console.log(`  extendTabCF: no CF rules on "${tabName}"`);
    return 0;
  }

  // Find rules that don't cover up to maxRow
  const toExtend = cf
    .map((rule: any, index: number) => ({ rule, index }))
    .filter(({ rule }: any) => {
      const ranges = rule.ranges || [];
      return ranges.some((r: any) => r.sheetId === sheetId && (r.endRowIndex || 0) < maxRow);
    });

  if (toExtend.length === 0) {
    console.log(`  extendTabCF: all ${cf.length} rules already cover ≥${maxRow} rows`);
    return 0;
  }

  // Update each rule — extend all ranges to maxRow
  const requests = toExtend.map(({ rule, index }: any) => ({
    updateConditionalFormatRule: {
      sheetId,
      index,
      rule: {
        ...rule,
        ranges: rule.ranges.map((r: any) => ({
          ...r,
          endRowIndex: Math.max(r.endRowIndex || 0, maxRow),
        })),
      },
    },
  }));

  await sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests } });
  console.log(`  extendTabCF: extended ${requests.length} CF rules on "${tabName}" to row ${maxRow}`);
  return requests.length;
}

/**
 * Set up conditional formatting on column C (Margin %) for a one-off tab.
 * Removes any existing CF rules that target column C only, then adds three
 * color-band rules: green ≥65%, yellow 40–65%, red <40%.
 */
export async function setupMarginCF(spreadsheetId: string, tabName: string): Promise<void> {
  const sheets = await getSheetsClient();

  const meta = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets(properties,conditionalFormats)",
  });

  const sheet = meta.data.sheets?.find((s: any) => s.properties?.title === tabName);
  if (!sheet) throw new Error(`Tab "${tabName}" not found`);

  const sheetId = sheet.properties!.sheetId!;
  const cf: any[] = sheet.conditionalFormats || [];

  // Find existing rules that target ONLY column C (startColumnIndex=2, endColumnIndex=3)
  const toDelete: number[] = [];
  for (let i = cf.length - 1; i >= 0; i--) {
    const ranges = cf[i].ranges || [];
    const onlyColC = ranges.length > 0 && ranges.every(
      (r: any) => r.sheetId === sheetId && r.startColumnIndex === 2 && r.endColumnIndex === 3
    );
    if (onlyColC) toDelete.push(i);
  }

  const requests: any[] = [];

  // Delete in reverse index order so indices stay valid
  for (const idx of toDelete) {
    requests.push({ deleteConditionalFormatRule: { sheetId, index: idx } });
  }

  const baseRange = {
    sheetId,
    startRowIndex: 1,   // row 2 (0-based)
    endRowIndex: 500,
    startColumnIndex: 2,
    endColumnIndex: 3,
  };

  // 10-band gradient using NUMBER_BETWEEN: each band matches exactly one range (no priority/ordering issues).
  const bands: Array<{ rgb: [number, number, number]; type: string; values: Array<{ userEnteredValue: string }>; dark?: boolean }> = [
    { rgb: [56, 142, 60],    type: "NUMBER_BETWEEN", values: [{ userEnteredValue: "0.90" }, { userEnteredValue: "100" }] },     // 90-100% deep green
    { rgb: [76, 175, 80],    type: "NUMBER_BETWEEN", values: [{ userEnteredValue: "0.80" }, { userEnteredValue: "0.8999" }] },   // 80-89% green
    { rgb: [129, 199, 132],  type: "NUMBER_BETWEEN", values: [{ userEnteredValue: "0.70" }, { userEnteredValue: "0.7999" }] },   // 70-79% light green
    { rgb: [165, 214, 167],  type: "NUMBER_BETWEEN", values: [{ userEnteredValue: "0.60" }, { userEnteredValue: "0.6999" }] },   // 60-69% pale green
    { rgb: [220, 231, 117],  type: "NUMBER_BETWEEN", values: [{ userEnteredValue: "0.50" }, { userEnteredValue: "0.5999" }] },   // 50-59% yellow-green
    { rgb: [255, 235, 59],   type: "NUMBER_BETWEEN", values: [{ userEnteredValue: "0.40" }, { userEnteredValue: "0.4999" }] },   // 40-49% yellow
    { rgb: [255, 167, 38],   type: "NUMBER_BETWEEN", values: [{ userEnteredValue: "0.30" }, { userEnteredValue: "0.3999" }] },   // 30-39% orange
    { rgb: [255, 112, 67],   type: "NUMBER_BETWEEN", values: [{ userEnteredValue: "0.20" }, { userEnteredValue: "0.2999" }] , dark: true },  // 20-29% dark orange
    { rgb: [239, 83, 80],    type: "NUMBER_BETWEEN", values: [{ userEnteredValue: "0.10" }, { userEnteredValue: "0.1999" }] , dark: true },  // 10-19% red-orange
    { rgb: [198, 40, 40],    type: "NUMBER_BETWEEN", values: [{ userEnteredValue: "0.001" }, { userEnteredValue: "0.0999" }], dark: true },  // 0.1-9.9% deep red (excludes 0%)
  ];

  bands.forEach((band, idx) => {
    requests.push({
      addConditionalFormatRule: {
        rule: {
          ranges: [baseRange],
          booleanRule: {
            condition: { type: band.type, values: band.values },
            format: {
              backgroundColor: {
                red: band.rgb[0] / 255,
                green: band.rgb[1] / 255,
                blue: band.rgb[2] / 255,
              },
              // White text on dark backgrounds for readability
              ...(idx >= 7 ? { textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 } } } : {}),
            },
          },
        },
        index: idx,
      },
    });
  });

  await sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests } });
  console.log(`  setupMarginCF: ${toDelete.length} old rules removed, ${bands.length} gradient rules added on "${tabName}" col C`);
}

/**
 * Set up row-level orange highlight on monthly tabs for "Client Paid but On Hold" rows.
 * Condition: AllPaid = ✅ AND PaymentStatus = "On Hold" AND PaymentTracking = "AWAITING FOR PAYMENT"
 * Highlights the entire row in orange (Material Orange 200) with bold text.
 * Idempotent: removes any existing client-paid-on-hold formula rule before adding.
 */
export async function setupClientPaidOnHoldCF(spreadsheetId: string, tabName: string): Promise<void> {
  const sheets = await getSheetsClient();

  const meta = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets(properties,conditionalFormats)",
  });

  const sheet = meta.data.sheets?.find((s: any) => s.properties?.title === tabName);
  if (!sheet) throw new Error(`Tab "${tabName}" not found`);

  const sheetId = sheet.properties!.sheetId!;
  const cf: any[] = sheet.conditionalFormats || [];

  // Determine column letters based on layout
  const recurring = tabName.endsWith(" - R");
  const layoutNew = !recurring && isNewLayout(tabName);

  let colAllPaid: string, colPayStatus: string, colPayTracking: string;
  if (recurring) {
    // Recurring: 26 cols, no margin C — AllPaid=O, PaymentStatus=U, PaymentTracking=V
    colAllPaid = "O"; colPayStatus = "U"; colPayTracking = "V";
  } else if (layoutNew) {
    // New layout (March+): 39 cols with margin C — AllPaid=O, PaymentStatus=T, PaymentTracking=U
    colAllPaid = "O"; colPayStatus = "T"; colPayTracking = "U";
  } else {
    // Legacy one-off (Feb): 27 cols with margin C — AllPaid=P, PaymentStatus=V, PaymentTracking=W
    colAllPaid = "P"; colPayStatus = "V"; colPayTracking = "W";
  }

  // Marker formula fragment to identify our rule for idempotent cleanup
  const formulaMarker = `"On Hold"`;

  // Remove any existing client-paid-on-hold formula rules (identified by CUSTOM_FORMULA referencing all three columns)
  const requests: any[] = [];
  for (let i = cf.length - 1; i >= 0; i--) {
    const rule = cf[i];
    const cond = rule?.booleanRule?.condition;
    if (cond?.type === "CUSTOM_FORMULA") {
      const formula = cond.values?.[0]?.userEnteredValue || "";
      if (formula.includes(formulaMarker) && formula.includes("AWAITING")) {
        requests.push({ deleteConditionalFormatRule: { sheetId, index: i } });
      }
    }
  }

  // Build the CUSTOM_FORMULA: =AND($O2="✅",$T2="On Hold",$U2="AWAITING FOR PAYMENT")
  const formula = `=AND($${colAllPaid}2="✅",$${colPayStatus}2="On Hold",$${colPayTracking}2="AWAITING FOR PAYMENT")`;

  // Full row range (A2:AM500 for new layout, A2:AA500 for legacy, A2:Z500 for recurring)
  const endCol = layoutNew ? 38 : recurring ? 25 : 26; // AM=38, Z=25, AA=26
  const cfRange = {
    sheetId,
    startRowIndex: 1,
    endRowIndex: 500,
    startColumnIndex: 0,
    endColumnIndex: endCol + 1,
  };

  // Add at index 0 (highest priority) so it overrides other row-level formatting
  requests.push({
    addConditionalFormatRule: {
      rule: {
        ranges: [cfRange],
        booleanRule: {
          condition: {
            type: "CUSTOM_FORMULA",
            values: [{ userEnteredValue: formula }],
          },
          format: {
            backgroundColor: { red: 255 / 255, green: 204 / 255, blue: 128 / 255 },  // Material Orange 200
            textFormat: { bold: true },
          },
        },
      },
      index: 0,
    },
  });

  await sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests } });
  const deleted = requests.length - 1;
  console.log(`  setupClientPaidOnHoldCF: ${deleted} old rules removed, 1 rule added on "${tabName}" (${formula})`);
}

export async function renameTab(spreadsheetId: string, from: string, to: string): Promise<void> {
  const sheets = await getSheetsClient();
  const meta = await sheets.spreadsheets.get({ spreadsheetId, fields: "sheets(properties(sheetId,title))" });
  const sheet = meta.data.sheets?.find((s: any) => s.properties?.title === from);
  if (!sheet) throw new Error(`Tab "${from}" not found`);
  const sheetId = sheet.properties!.sheetId;
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests: [{ updateSheetProperties: { properties: { sheetId, title: to }, fields: "title" } }] }
  });
  console.log(`Renamed tab "${from}" → "${to}"`);
}
