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
    // New layout: just read column F (Job #)
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `'${tab}'!F2:F500`,
    });
    const rows = res.data.values ?? [];
    const result: Array<{ rowIndex: number; jobNumber: string; existingInvoiceValue: string }> = [];
    for (let i = 0; i < rows.length; i++) {
      const val = rows[i]?.[0] != null ? String(rows[i][0]).trim() : "";
      if (val.length > 0) result.push({ rowIndex: 2 + i, jobNumber: val, existingInvoiceValue: "" });
    }
    return result;
  } else {
    // Legacy layout: read F through L (F=Job#, L=Invoice#) for manual hold ("-")
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `'${tab}'!F2:L500`,
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
 * NEW layout (March-forward): auto-populated columns in A–AM layout.
 * Manual/finance columns NOT in this set: B (review), F (job#), Q (KCPC Released),
 * S (Payment Status), T (Payment Tracking), U (Payment Method), V (Date of Payment), W (Notes).
 */
export const AUTO_COL_LETTERS_NEW = new Set([
  "A","C","D","E","G","H","I","J","K",
  "L","M","N",          // invoice summary (new)
  "O","P","R",           // HeyPros invoice #, Sub Inv Amt, Contractor PDF
  "X",                   // auto notes (was Z)
  "Y","Z","AA",          // tracker slot 1
  "AB","AC","AD",        // tracker slot 2
  "AE","AF","AG",        // tracker slot 3
  "AH","AI","AJ",        // tracker slot 4
  "AK","AL","AM",        // tracker slot 5
]);

/**
 * LEGACY layout (Jan/Feb): auto-populated columns in A–Z layout.
 */
export const AUTO_COL_LETTERS_LEGACY = new Set(["A","C","D","E","G","H","I","J","K","L","M","N","O","P","Q","R","T","Z"]);

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

export async function batchUpdateAutoColumns(
  spreadsheetId: string,
  tab: string,
  updates: Array<{ rowIndex: number; values: Record<string, string> }>,
): Promise<void> {
  if (updates.length === 0) return;
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
  ): string[][] {
    const COL_DATE = 0;
    const COL_COMPANY = 2;
    const COL_PP_OWNER = 3;
    const COL_JOB_NUM = 5;
    const COL_CLIENT_NAME = 9;

    // New layout: N=13 (All Paid?), P=15 (Sub Inv Amt), S=18 (Payment Status), T=19 (Payment Tracking)
    // Legacy:     O=14 (Invoice Status), R=17 (Sub Inv Amt), U=20 (Payment Status), V=21 (Payment Tracking)
    const COL_PAID_CHECK = layoutNew ? 13 : 14;
    const COL_SUB_AMOUNT = layoutNew ? 15 : 17;
    const COL_PAYMENT_STATUS = layoutNew ? 18 : 20;
    const COL_PAYMENT_TRACKING = layoutNew ? 19 : 21;

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
  const readRange = useNew ? `'${sourceTab}'!A2:T500` : `'${sourceTab}'!A2:V500`;
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
      range: `'${recurringTab}'!A2:V500`,
    });
    const recurGtp = extractGtpRows(recurRes.data.values ?? [], false);
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
 * New layout link cols: E(4), G(6), J(9), R(17)
 * Legacy/recurring link cols: E(4), G(6), J(9), T(19)
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
  // PDF column: R(17) on new layout, T(19) on legacy/recurring
  const linkCols = useNew ? [4, 6, 9, 17] : [4, 6, 9, 19];

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

async function getSheetsClient() {
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
  pending: number;
  pendingAmount: number;
  noClientPay: number;        // client hasn't paid yet — sub will still be paid
  noClientPayAmount: number;
  blank: number;
  blankAmount: number;
  noPaymentCount: number;     // sub will never be paid — excluded from totals
  noPaymentAmount: number;
}

/**
 * Determine column indices for dashboard-relevant columns based on tab name.
 * Recurring tabs (" - R") ALWAYS use legacy positions.
 * Legacy one-off tabs (contains year, e.g. "January 2026") use legacy positions.
 * New one-off tabs (no year, e.g. "March") use new positions.
 */
function getDashboardColIndices(tabName: string): {
  paymentStatus: number;
  subInvoiceAmount: number;
  allPaid: number;
} {
  const isRecurring = tabName.endsWith(" - R");

  if (isRecurring || !isNewLayout(tabName)) {
    // Legacy (Jan/Feb with or without year suffix) and recurring tabs
    return { paymentStatus: 20, subInvoiceAmount: 17, allPaid: 14 };
  }
  // New layout (March+)
  return { paymentStatus: 18, subInvoiceAmount: 15, allPaid: 13 };
}

/**
 * Extract month name from a tab name.
 * "March" → "March", "January 2026" → "January", "April - R" → "April"
 */
function extractMonthName(tabName: string): string {
  const base = tabName.replace(/ - R$/, "").replace(/\s+\d{4}$/, "").trim();
  return base;
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
    const maxCol = Math.max(cols.paymentStatus, cols.subInvoiceAmount, cols.allPaid);
    // Convert max column index to letter for range
    const endColLetter = String.fromCharCode(65 + Math.min(maxCol, 25));
    const range = maxCol > 25
      ? `'${tab}'!A2:Z500`
      : `'${tab}'!A2:${endColLetter}500`;

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
        pending: 0, pendingAmount: 0,
        noClientPay: 0, noClientPayAmount: 0,
        blank: 0, blankAmount: 0,
        noPaymentCount: 0, noPaymentAmount: 0,
      });
    }
    const stats = statsByMonth.get(monthName)!;

    for (const row of rows) {
      // Skip rows with blank Job # (col F, index 5)
      const jobNum = (row[5] ?? "").toString().trim();
      if (!jobNum) continue;

      const paymentStatus = (row[cols.paymentStatus] ?? "").toString().trim();
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

      // Dashboard tracks sub payment status via Payment Status column only.
      // AllPaid (client payment to KC) is visible on the sheet but does NOT drive dashboard buckets.
      const statusLower = paymentStatus.toLowerCase();
      if (statusLower === "paid") {
        stats.paid++;
        stats.paidAmount += subAmount;
      } else if (statusLower === "good to pay") {
        stats.goodToPay++;
        stats.goodToPayAmount += subAmount;
      } else if (statusLower === "on hold") {
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
    "# Pending Approval", "% Pending Approval",
    "# No Client Pay", "% No Client Pay",
    "# Blank", "% Blank",
  ];

  const pct = (n: number, total: number) => total > 0 ? n / total : 0;

  const mainRows: (string | number)[][] = [mainHeader];

  // YTD accumulators
  let ytdTotal = 0, ytdAmount = 0, ytdPaid = 0, ytdGtp = 0, ytdHold = 0, ytdPending = 0, ytdNoClient = 0, ytdBlank = 0;

  for (const s of sortedMonths) {
    if (s.total === 0 && s.noPaymentCount === 0) continue; // skip months with no data at all
    mainRows.push([
      s.month,
      s.total,
      s.totalAmount,
      s.paid, pct(s.paid, s.total),
      s.goodToPay, pct(s.goodToPay, s.total),
      s.onHold, pct(s.onHold, s.total),
      s.pending, pct(s.pending, s.total),
      s.noClientPay, pct(s.noClientPay, s.total),
      s.blank, pct(s.blank, s.total),
    ]);
    ytdTotal += s.total;
    ytdAmount += s.totalAmount;
    ytdPaid += s.paid;
    ytdGtp += s.goodToPay;
    ytdHold += s.onHold;
    ytdPending += s.pending;
    ytdNoClient += s.noClientPay;
    ytdBlank += s.blank;
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
    ytdPending, pct(ytdPending, ytdTotal),
    ytdNoClient, pct(ytdNoClient, ytdTotal),
    ytdBlank, pct(ytdBlank, ytdTotal),
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

  // 6. Clear Dashboard tab (full width A:S to cover both old and new layouts)
  try {
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: `'${DASHBOARD_TAB}'!A1:S200`,
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
    range: `'${DASHBOARD_TAB}'!A1:O${mainRows.length}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: mainRows },
  });

  // 9. Apply formatting via batchUpdate
  const ytdRowIndex = mainRows.length - 1; // 0-based index of YTD row

  const formatRequests: any[] = [];

  // Header row (row 1): bold, blue bg, white text
  formatRequests.push({
    repeatCell: {
      range: { sheetId: dashboardSheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 15 },
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
      range: { sheetId: dashboardSheetId, startRowIndex: ytdRowIndex, endRowIndex: ytdRowIndex + 1, startColumnIndex: 0, endColumnIndex: 15 },
      cell: {
        userEnteredFormat: {
          backgroundColor: { red: 207/255, green: 226/255, blue: 255/255 },
          textFormat: { bold: true },
        },
      },
      fields: "userEnteredFormat(backgroundColor,textFormat)",
    },
  });

  // % columns: E(4)=% Paid, G(6)=% GTP, I(8)=% On Hold, K(10)=% Pending, M(12)=% No Client Pay, O(14)=% Blank
  const pctCols = [4, 6, 8, 10, 12, 14];
  for (const col of pctCols) {
    formatRequests.push({
      repeatCell: {
        range: { sheetId: dashboardSheetId, startRowIndex: 1, endRowIndex: mainRows.length, startColumnIndex: col, endColumnIndex: col + 1 },
        cell: { userEnteredFormat: { numberFormat: { type: "PERCENT", pattern: "0.0%" } } },
        fields: "userEnteredFormat.numberFormat",
      },
    });
  }

  // $ columns: C(2) and any $ in no-pay section — currency format
  formatRequests.push({
    repeatCell: {
      range: { sheetId: dashboardSheetId, startRowIndex: 1, endRowIndex: mainRows.length, startColumnIndex: 2, endColumnIndex: 3 },
      cell: { userEnteredFormat: { numberFormat: { type: "CURRENCY", pattern: "$#,##0.00" } } },
      fields: "userEnteredFormat.numberFormat",
    },
  });

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
    { col: 9, width: 90 },   // # Pending Approval
    { col: 10, width: 90 },  // % Pending Approval
    { col: 11, width: 90 },  // # No Client Pay
    { col: 12, width: 90 },  // % No Client Pay
    { col: 13, width: 70 },  // # Blank
    { col: 14, width: 70 },  // % Blank
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

  // Conditional formatting on % Paid column (col E, index 4): red <50%, yellow 50-79%, green ≥80%
  // (All stale CF rules were already nuked above in step 6b — safe to just add fresh rules here.)
  formatRequests.push({
    addConditionalFormatRule: {
      rule: {
        ranges: [{ sheetId: dashboardSheetId, startRowIndex: 1, endRowIndex: mainRows.length, startColumnIndex: 4, endColumnIndex: 5 }],
        booleanRule: {
          condition: { type: "NUMBER_LESS", values: [{ userEnteredValue: "0.5" }] },
          format: { backgroundColor: { red: 234/255, green: 153/255, blue: 153/255 } },
        },
      },
      index: 0,
    },
  });
  formatRequests.push({
    addConditionalFormatRule: {
      rule: {
        ranges: [{ sheetId: dashboardSheetId, startRowIndex: 1, endRowIndex: mainRows.length, startColumnIndex: 4, endColumnIndex: 5 }],
        booleanRule: {
          condition: { type: "NUMBER_BETWEEN", values: [{ userEnteredValue: "0.5" }, { userEnteredValue: "0.7999" }] },
          format: { backgroundColor: { red: 255/255, green: 229/255, blue: 153/255 } },
        },
      },
      index: 1,
    },
  });
  formatRequests.push({
    addConditionalFormatRule: {
      rule: {
        ranges: [{ sheetId: dashboardSheetId, startRowIndex: 1, endRowIndex: mainRows.length, startColumnIndex: 4, endColumnIndex: 5 }],
        booleanRule: {
          condition: { type: "NUMBER_GREATER_THAN_EQ", values: [{ userEnteredValue: "0.8" }] },
          format: { backgroundColor: { red: 147/255, green: 196/255, blue: 125/255 } },
        },
      },
      index: 2,
    },
  });

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
export async function refreshProfitabilityDashboard(spreadsheetId: string): Promise<void> {
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
  if (!dashSheet) return;
  const dashboardSheetId = dashSheet.properties!.sheetId!;

  // 2. Month definitions
  const MONTHS_TO_SCAN: Array<{ display: string; oneOffTab: string; recurringTab: string; type: "legacy" | "new" }> = [
    { display: "February", oneOffTab: "February", recurringTab: "Feb - R", type: "legacy" },
    { display: "March",    oneOffTab: "March",          recurringTab: "March - R", type: "new" },
    { display: "April",    oneOffTab: "April",          recurringTab: "April - R", type: "new" },
    { display: "May",      oneOffTab: "May",            recurringTab: "May - R",   type: "new" },
    { display: "June",     oneOffTab: "June",           recurringTab: "June - R",  type: "new" },
    { display: "July",     oneOffTab: "July",           recurringTab: "July - R",  type: "new" },
    { display: "August",   oneOffTab: "August",         recurringTab: "August - R",   type: "new" },
    { display: "September",oneOffTab: "September",      recurringTab: "September - R",type: "new" },
    { display: "October",  oneOffTab: "October",        recurringTab: "October - R",  type: "new" },
    { display: "November", oneOffTab: "November",       recurringTab: "November - R", type: "new" },
    { display: "December", oneOffTab: "December",       recurringTab: "December - R", type: "new" },
  ];

  // 3. Aggregate data per month
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
          ? `'${m.oneOffTab}'!A2:U500`
          : `'${m.oneOffTab}'!A2:S500`;
        const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
        const rows = (res.data.values ?? []) as string[][];

        if (m.type === "legacy") {
          // Legacy layout (Jan/Feb):
          //   F=Job#(5), K=Division(10), L=Invoice#(11), M=TotalInvoiced(12),
          //   O=InvoiceStatus(14), R=SubInvAmt(17), U=PaymentStatus(20)
          // Invoice gate: col L must be a real invoice number (not blank, not "-")
          // Revenue gate: InvoiceStatus(O) = "Paid"
          // Dedup revenue by Invoice #
          const seenInvoices = new Set<string>();
          for (const row of rows) {
            const jobNum     = (row[5]  ?? "").toString().trim();
            if (!jobNum) continue;
            const invoiceNum = (row[11] ?? "").toString().trim();
            // Invoice gate: skip uninvoiced rows — division not yet finalised
            if (!invoiceNum || invoiceNum === "-") continue;

            const division  = (row[10] ?? "").toString().trim();
            const invTotal  = (row[12] ?? "").toString().trim();
            const invStatus = (row[14] ?? "").toString().trim();
            const labor     = parseDollarAmount((row[17] ?? "").toString());
            const payStatus = (row[20] ?? "").toString().trim();
            // Skip "No payment" rows (sub never gets paid, not a real job)
            if (payStatus.toLowerCase().startsWith("no payment")) continue;

            const isHybrid = division === "Hybrid";
            const clientPaid = invStatus.toLowerCase() === "paid";

            // Labor + Revenue: only count when client has paid
            if (clientPaid) {
              if (isHybrid) {
                hybridLabor += labor;
                seenHybridJobs.add(jobNum);
              } else {
                oneOffLabor += labor;
                seenOneOffJobs.add(jobNum);
              }
              // Revenue: dedup by Invoice #
              if (!seenInvoices.has(invoiceNum)) {
                seenInvoices.add(invoiceNum);
                const rev = parseDollarAmount(invTotal);
                if (isHybrid) hybridRevenue += rev;
                else          oneOffRevenue += rev;
              }
            } else if (!isHybrid) {
              oneOffExcluded++;
            }
          }
        } else {
          // New layout (March+):
          //   F=Job#(5), K=Division(10), L=#Invoices(11), M=TotalInvoiced(12),
          //   N=AllPaid?(13), P=SubInvAmt(15), S=PaymentStatus(18)
          // Invoice gate: col L (# of Invoices) must be > 0 — skips jobs not yet invoiced
          // Revenue gate: All Paid?(N) = "✅"
          // Dedup revenue by Job #
          const seenJobsForRevenue = new Set<string>();
          for (const row of rows) {
            const jobNum    = (row[5]  ?? "").toString().trim();
            if (!jobNum) continue;
            const numInvoices = parseInt((row[11] ?? "0").toString().trim(), 10) || 0;
            // Invoice gate: skip uninvoiced rows — division not yet finalised
            if (numInvoices === 0) continue;

            const division  = (row[10] ?? "").toString().trim();
            const invTotal  = (row[12] ?? "").toString().trim();
            const allPaid   = (row[13] ?? "").toString().trim();
            const labor     = parseDollarAmount((row[15] ?? "").toString());
            const payStatus = (row[18] ?? "").toString().trim();
            // Skip "No payment" rows
            if (payStatus.toLowerCase().startsWith("no payment")) continue;

            const isHybrid = division === "Hybrid";
            const clientPaid = allPaid === "✅";

            // Labor + Revenue: only count when client has paid
            if (clientPaid) {
              if (isHybrid) {
                hybridLabor += labor;
                seenHybridJobs.add(jobNum);
              } else {
                oneOffLabor += labor;
                seenOneOffJobs.add(jobNum);
              }
              // Revenue: dedup by Job #
              if (!seenJobsForRevenue.has(jobNum)) {
                seenJobsForRevenue.add(jobNum);
                const rev = parseDollarAmount(invTotal);
                if (isHybrid) hybridRevenue += rev;
                else          oneOffRevenue += rev;
              }
            } else if (!isHybrid) {
              oneOffExcluded++;
            }
          }
        }
      } catch (e: any) {
        if (!e?.message?.includes("Unable to parse range")) throw e;
      }
    }

    // --- Recurring tab ---
    // Layout: F=Job#(5), L=Invoice#(11), M=TotalInvoiced(12), O=InvoiceStatus(14), R=SubInvAmt(17)
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

        for (const row of rows) {
          const jobNum     = (row[5]  ?? "").toString().trim();
          if (!jobNum) continue;
          const invoiceNum = (row[11] ?? "").toString().trim();
          // Invoice gate: skip rows not yet invoiced
          if (!invoiceNum || invoiceNum === "-") continue;

          const invTotal  = (row[12] ?? "").toString().trim();
          const invStatus = (row[14] ?? "").toString().trim();
          const labor     = parseDollarAmount((row[17] ?? "").toString());

          const clientPaid = invStatus.toLowerCase() === "paid";

          recurringVisits++;
          seenRecurringInvoices.add(invoiceNum);

          // Labor + Revenue: only count when client has paid
          if (clientPaid) {
            recurringLabor += labor;
          }
        }
        // Revenue dedup: one invoice covers multiple visits, count revenue once per invoice
        const seenPaidInvoices = new Set<string>();
        const seenUnpaidInvoices = new Set<string>();
        for (const row of rows) {
          const jobNum     = (row[5]  ?? "").toString().trim();
          if (!jobNum) continue;
          const invoiceNum = (row[11] ?? "").toString().trim();
          if (!invoiceNum || invoiceNum === "-") continue;
          const invTotal  = (row[12] ?? "").toString().trim();
          const invStatus = (row[14] ?? "").toString().trim();
          if (invStatus.toLowerCase() === "paid" && !seenPaidInvoices.has(invoiceNum)) {
            seenPaidInvoices.add(invoiceNum);
            recurringRevenue += parseDollarAmount(invTotal);
          } else if (invStatus.toLowerCase() !== "paid" && !seenUnpaidInvoices.has(invoiceNum)) {
            seenUnpaidInvoices.add(invoiceNum);
            recurringExcluded++;
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

  if (monthData.length === 0) return;

  // 4. Build data rows
  //
  // Sequential grouping — each category shows revenue, labor, margin together:
  //
  //  A  Month
  //  --- ONE-OFF (main tab, non-Hybrid) ---
  //  B  One-off Revenue    (paid jobs only, deduped by Job#)
  //  C  One-off Labor      (all invoiced rows)
  //  D  One-off Margin %   (rev-labor)/rev
  //  E  # One-off Jobs     (unique Job# count, invoiced)
  //  F  # One-off Excluded (invoiced but not paid — excluded from revenue/margin)
  //  --- RECURRING (- R tabs) ---
  //  G  Recurring Revenue  (paid invoices only, deduped by Invoice#)
  //  H  Recurring Labor    (all invoiced rows)
  //  I  Recurring Margin % (rev-labor)/rev
  //  J  # Recur. Visits    (total invoiced rows — each row = one visit)
  //  K  # Recur. Invoices  (unique Invoice# — one invoice spans multiple visits)
  //  L  # Recur. Excluded  (invoiced but not paid — excluded from revenue/margin)
  //  --- HYBRID (main tab, Division = "Hybrid") ---
  //  M  Hybrid Revenue     (paid jobs only)
  //  N  Hybrid Labor       (all invoiced rows)
  //  O  # Hybrid Jobs      (unique Job# count, invoiced)
  //  --- TOTALS ---
  //  P  Total Revenue      (one-off + recurring ONLY — hybrid excluded, different cost structure)
  //  Q  Total Labor        (one-off + recurring ONLY)
  //  R  Total Gross Profit
  //  S  Total Margin %
  //
  // Notes:
  //  - Recurring margin is per billing-cycle invoice (not per visit).
  //    Divide J/K to get avg visits per invoice for per-visit context.
  //  - Hybrid margin is not calculated (KC in-house labor not yet tracked).
  //  - "Excluded" = invoiced rows omitted from revenue because client hasn't paid yet.
  const NUM_COLS = 19;
  const columnHeaders = [
    "Month",
    // One-off
    "One-off Revenue",    "One-off Labor",    "One-off Margin %",
    "# One-off Jobs",     "# Excl. (One-off)",
    // Recurring
    "Recurring Revenue",  "Recurring Labor",  "Recurring Margin %",
    "# Recur. Visits",    "# Recur. Invoices", "# Excl. (Recur.)",
    // Hybrid
    "Hybrid Revenue",     "Hybrid Labor",     "# Hybrid Jobs",
    // Totals
    "Total Revenue",      "Total Labor",      "Gross Profit",      "Total Margin %",
  ];

  const dataRows: (string | number)[][] = [];
  const ytd = {
    oneOffRev: 0, oneOffLab: 0, oneOffJobs: 0, oneOffExcl: 0,
    recurRev: 0,  recurLab: 0,  recurVisits: 0, recurInvoices: 0, recurExcl: 0,
    hybridRev: 0, hybridLab: 0, hybridJobs: 0,
  };

  for (const m of monthData) {
    const oneOffMargin  = m.oneOffRevenue  > 0 ? (m.oneOffRevenue  - m.oneOffLabor)  / m.oneOffRevenue  : 0;
    const recurMargin   = m.recurringRevenue > 0 ? (m.recurringRevenue - m.recurringLabor) / m.recurringRevenue : 0;
    // Totals = one-off + recurring ONLY. Hybrid excluded (different cost structure).
    const totalRev      = m.oneOffRevenue + m.recurringRevenue;
    const totalLabor    = m.oneOffLabor   + m.recurringLabor;
    const grossProfit   = totalRev - totalLabor;
    const totalMargin   = totalRev > 0 ? grossProfit / totalRev : 0;

    dataRows.push([
      m.month,
      // One-off
      m.oneOffRevenue,      m.oneOffLabor,      oneOffMargin,
      m.oneOffJobs,         m.oneOffExcluded,
      // Recurring
      m.recurringRevenue,   m.recurringLabor,   recurMargin,
      m.recurringVisits,    m.recurringInvoices, m.recurringExcluded,
      // Hybrid
      m.hybridRevenue,      m.hybridLabor,      m.hybridJobs,
      // Totals
      totalRev,             totalLabor,         grossProfit,          totalMargin,
    ]);

    ytd.oneOffRev    += m.oneOffRevenue;
    ytd.oneOffLab    += m.oneOffLabor;
    ytd.oneOffJobs   += m.oneOffJobs;
    ytd.oneOffExcl   += m.oneOffExcluded;
    ytd.recurRev     += m.recurringRevenue;
    ytd.recurLab     += m.recurringLabor;
    ytd.recurVisits  += m.recurringVisits;
    ytd.recurInvoices+= m.recurringInvoices;
    ytd.recurExcl    += m.recurringExcluded;
    ytd.hybridRev    += m.hybridRevenue;
    ytd.hybridLab    += m.hybridLabor;
    ytd.hybridJobs   += m.hybridJobs;
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
    ["📊 Revenue & Profitability"],
    [""],
    ["ℹ️ How numbers are calculated:"],
    ["  Revenue    — Counted only when client invoice is confirmed paid (All Paid? = ✅ on main tabs; Jobber Invoice Status = Paid on recurring tabs). Unpaid, On Hold, and NO CLIENT PAY jobs are excluded from revenue."],
    ["  Labor      — Sub Invoice Amount (col P/R). Counted only when client has paid (same gate as revenue). If client hasn't paid, labor is excluded — those jobs appear in # Excluded."],
    ["  One-off    — Division = 'Subcontractor - Dayshift' (or unrecognised). Revenue deduped by Job # to prevent double-counting multi-contractor jobs."],
    ["  Hybrid     — Division = 'Hybrid'. KC in-house labor + one or more PPs on the same job. ⚠️ Margin is a ceiling — KC's own cost of labor is not yet tracked (coming with Hybrid tab)."],
    ["  Recurring  — Jobs on the {Month} - R tabs. Revenue deduped by Invoice # (one billing cycle invoice covers multiple visits). # Recur. Visits = total invoiced rows; # Recur. Invoices = unique invoices. Divide visits by invoices to understand avg visits per billing cycle. Recurring margin is per-invoice — for per-visit margin, divide by visits/invoices ratio."],
    ["  Hybrid     — Division = 'Hybrid' on main tabs. Revenue and labor tracked separately; NOT included in Totals (different cost structure — KC in-house labor not tracked here). Hybrid margin TBD in a future update."],
    ["  # Excluded — Invoiced rows where the client has not yet paid. Both revenue AND labor are excluded. This shows jobs completed but not yet billable for profitability."],
    ["  Margin %   — Shown per category (One-off, Recurring). Total Margin % = (One-off + Recurring Revenue - Labor) / Revenue. Hybrid excluded from totals."],
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
  const ytdRowIndex0      = TABLE_DATA_START - 1 + dataRows.length; // 0-based
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

  // Conditional formatting on Total Margin % col (S, index 18): green ≥65%, yellow 40–65%, red <40%
  const cfRange = [{ sheetId: dashboardSheetId, startRowIndex: tableDataStart0, endRowIndex: ytdRowIndex0 + 1, startColumnIndex: 18, endColumnIndex: 19 }];
  formatRequests.push({
    addConditionalFormatRule: {
      rule: {
        ranges: cfRange,
        booleanRule: {
          condition: { type: "NUMBER_LESS", values: [{ userEnteredValue: "0.4" }] },
          format: { backgroundColor: { red: 255 / 255, green: 199 / 255, blue: 206 / 255 } },
        },
      },
    },
  });
  formatRequests.push({
    addConditionalFormatRule: {
      rule: {
        ranges: cfRange,
        booleanRule: {
          condition: { type: "NUMBER_BETWEEN", values: [{ userEnteredValue: "0.4" }, { userEnteredValue: "0.6499" }] },
          format: { backgroundColor: { red: 255 / 255, green: 235 / 255, blue: 156 / 255 } },
        },
      },
    },
  });
  formatRequests.push({
    addConditionalFormatRule: {
      rule: {
        ranges: cfRange,
        booleanRule: {
          condition: { type: "NUMBER_GREATER_THAN_EQ", values: [{ userEnteredValue: "0.65" }] },
          format: { backgroundColor: { red: 198 / 255, green: 239 / 255, blue: 206 / 255 } },
        },
      },
    },
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

  console.log(`  Profitability: ${monthData.length} months written to Dashboard (one-off/hybrid/recurring split)`);
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
