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
  // Legacy tabs: "January 2026", "February 2026"
  // New tabs: "March", "April", etc. (no year suffix)
  // Recurring tabs use their own flow, not affected by this
  const legacyPattern = /^\w+\s+\d{4}$/;
  return !legacyPattern.test(tabName);
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


