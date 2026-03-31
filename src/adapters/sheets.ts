import { google } from "googleapis";

export async function readOutputSheetJobNumbers(
  spreadsheetId: string,
  tab: string = "Sheet1",
  range: string = "F2:F500",
): Promise<Array<{ rowIndex: number; jobNumber: string; existingInvoiceValue: string }>> {
  const sheets = await getSheetsClient();
  // Read columns F through L (F=Job#, L=Invoice#) to detect manual hold ("-")
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${tab}'!F2:L500`,
  });
  const rows = res.data.values ?? [];
  const result: Array<{ rowIndex: number; jobNumber: string; existingInvoiceValue: string }> = [];
  for (let i = 0; i < rows.length; i++) {
    const val = rows[i]?.[0] != null ? String(rows[i][0]).trim() : "";  // col F (index 0)
    const invoiceVal = rows[i]?.[6] != null ? String(rows[i][6]).trim() : "";  // col L (index 6, F+6=L)
    if (val.length > 0) result.push({ rowIndex: 2 + i, jobNumber: val, existingInvoiceValue: invoiceVal });
  }
  return result;
}

export const AUTO_COL_LETTERS = new Set(["A","C","D","E","G","H","I","J","K","L","M","N","O","P","Q","R","T","Z"]);

// For recurring tabs: A (Date), L (Invoice #), S (KCPC Released Amount) are manual
export const RECURRING_AUTO_COL_LETTERS = new Set(["A","C","D","E","G","H","I","J","K","M","N","O","P","Q","R","T","Z"]);

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
  const data: Array<{ range: string; values: string[][] }> = [];
  for (const update of updates) {
    for (const [col, val] of Object.entries(update.values)) {
      if (!AUTO_COL_LETTERS.has(col)) continue; // never write manual cols
      data.push({ range: `${tab}!${col}${update.rowIndex}`, values: [[val ?? ""]] });
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
export async function refreshGTPTab(
  spreadsheetId: string,
  sourceTab: string,
): Promise<number> {
  // Derive GTP tab name: "March 2026" -> "GTP $ - March"
  const monthName = sourceTab.split(" ")[0];
  const gtpTab = `GTP $ - ${monthName}`;

  const sheets = await getSheetsClient();

  // Read source tab — columns A through V (22 cols)
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${sourceTab}'!A2:V500`,
  });
  const rows = res.data.values ?? [];

  // Column indices (0-based): A=0, C=2, D=3, F=5, O=14, R=17, U=20, V=21
  const COL_DATE = 0;
  const COL_COMPANY = 2;
  const COL_PP_OWNER = 3;
  const COL_JOB_NUM = 5;
  const COL_INVOICE_STATUS = 14;
  const COL_SUB_AMOUNT = 17;
  const COL_PAYMENT_STATUS = 20;
  const COL_PAYMENT_TRACKING = 21;

  const gtpRows: string[][] = [];
  for (const row of rows) {
    const invoiceStatus = (row[COL_INVOICE_STATUS] ?? "").toString().trim();
    const paymentStatus = (row[COL_PAYMENT_STATUS] ?? "").toString().trim();
    const paymentTracking = (row[COL_PAYMENT_TRACKING] ?? "").toString().trim();

    if (
      invoiceStatus === "Paid" &&
      paymentStatus === "Good to Pay" &&
      paymentTracking.toUpperCase() === "AWAITING FOR PAYMENT"
    ) {
      gtpRows.push([
        (row[COL_DATE] ?? "").toString(),
        (row[COL_COMPANY] ?? "").toString(),
        (row[COL_PP_OWNER] ?? "").toString(),
        (row[COL_JOB_NUM] ?? "").toString(),
        (row[COL_SUB_AMOUNT] ?? "").toString(),
        invoiceStatus,
        paymentStatus,
        paymentTracking,
      ]);
    }
  }

  // Clear existing data (rows 2+) on GTP tab
  try {
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: `'${gtpTab}'!A2:H500`,
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
      range: `'${gtpTab}'!A2:H${gtpRows.length + 1}`,
      requestBody: { values: gtpRows },
      valueInputOption: "USER_ENTERED",
    });
  }

  return gtpRows.length;
}

async function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const authClient = await auth.getClient();
  return google.sheets({ version: "v4", auth: authClient as any });
}


