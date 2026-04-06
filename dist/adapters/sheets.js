import { google } from "googleapis";
/**
 * Read job numbers from output sheet.
 * For legacy tabs (Jan/Feb): also reads column L (Invoice #) for manual hold detection.
 * For new tabs (March+): L is auto-populated "# of Invoices" — no manual hold via L.
 */
export async function readOutputSheetJobNumbers(spreadsheetId, tab = "Sheet1") {
    const sheets = await getSheetsClient();
    const useNew = isNewLayout(tab);
    if (useNew) {
        // New layout: just read column F (Job #)
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `'${tab}'!F2:F500`,
        });
        const rows = res.data.values ?? [];
        const result = [];
        for (let i = 0; i < rows.length; i++) {
            const val = rows[i]?.[0] != null ? String(rows[i][0]).trim() : "";
            if (val.length > 0)
                result.push({ rowIndex: 2 + i, jobNumber: val, existingInvoiceValue: "" });
        }
        return result;
    }
    else {
        // Legacy layout: read F through L (F=Job#, L=Invoice#) for manual hold ("-")
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `'${tab}'!F2:L500`,
        });
        const rows = res.data.values ?? [];
        const result = [];
        for (let i = 0; i < rows.length; i++) {
            const val = rows[i]?.[0] != null ? String(rows[i][0]).trim() : "";
            const invoiceVal = rows[i]?.[6] != null ? String(rows[i][6]).trim() : "";
            if (val.length > 0)
                result.push({ rowIndex: 2 + i, jobNumber: val, existingInvoiceValue: invoiceVal });
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
    "A", "C", "D", "E", "G", "H", "I", "J", "K",
    "L", "M", "N", // invoice summary (new)
    "O", "P", "R", // HeyPros invoice #, Sub Inv Amt, Contractor PDF
    "X", // auto notes (was Z)
    "Y", "Z", "AA", // tracker slot 1
    "AB", "AC", "AD", // tracker slot 2
    "AE", "AF", "AG", // tracker slot 3
    "AH", "AI", "AJ", // tracker slot 4
    "AK", "AL", "AM", // tracker slot 5
]);
/**
 * LEGACY layout (Jan/Feb): auto-populated columns in A–Z layout.
 */
export const AUTO_COL_LETTERS_LEGACY = new Set(["A", "C", "D", "E", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "T", "Z"]);
// For recurring tabs: A (Date), L (Invoice #), S (KCPC Released Amount) are manual
export const RECURRING_AUTO_COL_LETTERS = new Set(["A", "C", "D", "E", "G", "H", "I", "J", "K", "M", "N", "O", "P", "Q", "R", "T", "Z"]);
/** Determine if a tab uses the new 39-column layout (March-forward) or legacy 26-column. */
export function isNewLayout(tabName) {
    // Legacy tabs: "January 2026", "February 2026"
    // New tabs: "March", "April", etc. (no year suffix)
    // Recurring tabs use their own flow, not affected by this
    const legacyPattern = /^\w+\s+\d{4}$/;
    return !legacyPattern.test(tabName);
}
/**
 * Read Job # (col F) and Invoice # (col L) and HeyPros ID (col E) from a recurring tab.
 */
export async function readRecurringTabRows(spreadsheetId, tab) {
    const sheets = await getSheetsClient();
    // Read cols E, F, L (HeyPros ID, Job #, Invoice #)
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `'${tab}'!A2:L500`,
    });
    const rows = res.data.values ?? [];
    const result = [];
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i] ?? [];
        const jobNumber = row[5] != null ? String(row[5]).trim() : ""; // col F (index 5)
        const heyProsId = row[4] != null ? String(row[4]).trim() : ""; // col E (index 4)
        const invoiceNumber = row[11] != null ? String(row[11]).trim() : ""; // col L (index 11)
        if (jobNumber.length > 0) {
            result.push({ rowIndex: 2 + i, jobNumber, invoiceNumber, heyProsId });
        }
    }
    return result;
}
export async function batchUpdateRecurringColumns(spreadsheetId, tab, updates) {
    if (updates.length === 0)
        return;
    const sheets = await getSheetsClient();
    const data = [];
    for (const update of updates) {
        for (const [col, val] of Object.entries(update.values)) {
            if (!RECURRING_AUTO_COL_LETTERS.has(col))
                continue; // never write manual cols (B, L, U, V, W, X, Y)
            data.push({ range: `'${tab}'!${col}${update.rowIndex}`, values: [[val ?? ""]] });
        }
    }
    if (data.length === 0)
        return;
    await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: { valueInputOption: "USER_ENTERED", data },
    });
}
export async function batchUpdateAutoColumns(spreadsheetId, tab, updates) {
    if (updates.length === 0)
        return;
    const sheets = await getSheetsClient();
    const allowedCols = isNewLayout(tab) ? AUTO_COL_LETTERS_NEW : AUTO_COL_LETTERS_LEGACY;
    const data = [];
    for (const update of updates) {
        for (const [col, val] of Object.entries(update.values)) {
            if (!allowedCols.has(col))
                continue; // never write manual cols
            data.push({ range: `'${tab}'!${col}${update.rowIndex}`, values: [[val ?? ""]] });
        }
    }
    if (data.length === 0)
        return;
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
export async function refreshGTPTab(spreadsheetId, sourceTab) {
    const useNew = isNewLayout(sourceTab);
    // Derive GTP tab name based on layout
    let gtpTab;
    let monthName;
    if (useNew) {
        // New naming: "March" → "March - GTP $"
        gtpTab = `${sourceTab} - GTP $`;
        monthName = sourceTab;
    }
    else {
        // Legacy naming: "February 2026" → "Feb - GTP $", "January 2026" → "Jan - GTP $"
        const MONTH_SHORT = { January: "Jan", February: "Feb" };
        monthName = sourceTab.split(" ")[0];
        const shortName = MONTH_SHORT[monthName] ?? monthName;
        gtpTab = `${shortName} - GTP $`;
    }
    const sheets = await getSheetsClient();
    // --- Helper: extract GTP-eligible rows from a tab ---
    function extractGtpRows(rows, layoutNew) {
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
        const result = [];
        for (const row of rows) {
            const paidCheck = (row[COL_PAID_CHECK] ?? "").toString().trim();
            const paymentStatus = (row[COL_PAYMENT_STATUS] ?? "").toString().trim();
            const paymentTracking = (row[COL_PAYMENT_TRACKING] ?? "").toString().trim();
            if (paidCheck === paidValue &&
                paymentStatus === "Good to Pay" &&
                paymentTracking.toUpperCase() === "AWAITING FOR PAYMENT") {
                result.push([
                    (row[COL_DATE] ?? "").toString(),
                    (row[COL_COMPANY] ?? "").toString(),
                    (row[COL_PP_OWNER] ?? "").toString(),
                    (row[COL_JOB_NUM] ?? "").toString(),
                    (row[COL_CLIENT_NAME] ?? "").toString(),
                    (row[COL_SUB_AMOUNT] ?? "").toString(),
                    "✅", // normalize: legacy "Paid" → "✅" for GTP output
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
    const MONTH_SHORT_R = { January: "Jan", February: "Feb" };
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
    }
    catch (e) {
        // Recurring tab may not exist — that's fine
        if (e?.message?.includes("Unable to parse range")) {
            console.log(`  No recurring tab '${recurringTab}' — skipping`);
        }
        else {
            throw e;
        }
    }
    // Clear existing data (rows 2+) on GTP tab
    try {
        await sheets.spreadsheets.values.clear({
            spreadsheetId,
            range: `'${gtpTab}'!A2:I500`,
        });
    }
    catch (e) {
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
export async function formatLinkColumns(spreadsheetId, tab, rowCount) {
    const sheets = await getSheetsClient();
    // Get sheet ID
    const meta = await sheets.spreadsheets.get({
        spreadsheetId,
        fields: "sheets.properties",
    });
    const sheet = meta.data.sheets?.find((s) => s.properties?.title === tab);
    if (!sheet)
        return;
    const sheetId = sheet.properties.sheetId;
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
    return google.sheets({ version: "v4", auth: authClient });
}
// ---------------------------------------------------------------------------
// Command tab — sync result logging
// ---------------------------------------------------------------------------
const COMMAND_TAB = "Log";
const COMMAND_HEADERS = [
    "Timestamp", "Tab", "Status", "Jobs", "Rows", "GTP Rows", "Elapsed", "Error",
];
/**
 * Append a sync result row to the Command tab.
 * Creates the tab with headers if it doesn't exist.
 */
export async function logSyncResult(spreadsheetId, entry) {
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
    const tabExists = meta.data.sheets?.some((s) => s.properties?.title === COMMAND_TAB);
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
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];
/**
 * Determine column indices for dashboard-relevant columns based on tab name.
 * Recurring tabs (" - R") ALWAYS use legacy positions.
 * Legacy one-off tabs (contains year, e.g. "January 2026") use legacy positions.
 * New one-off tabs (no year, e.g. "March") use new positions.
 */
function getDashboardColIndices(tabName) {
    const isRecurring = tabName.endsWith(" - R");
    const isLegacy = /^\w+\s+\d{4}$/.test(tabName);
    if (isRecurring || isLegacy) {
        return { paymentStatus: 20, subInvoiceAmount: 17, allPaid: 14 };
    }
    // New layout
    return { paymentStatus: 18, subInvoiceAmount: 15, allPaid: 13 };
}
/**
 * Extract month name from a tab name.
 * "March" → "March", "January 2026" → "January", "April - R" → "April"
 */
function extractMonthName(tabName) {
    const base = tabName.replace(/ - R$/, "").replace(/\s+\d{4}$/, "").trim();
    return base;
}
/**
 * Parse a dollar amount string from the sheet.
 * Handles: "$1,234.56", "1234.56", "$1234", etc.
 */
function parseDollarAmount(val) {
    if (!val)
        return 0;
    const cleaned = val.replace(/[$,]/g, "").trim();
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
}
/**
 * Refresh the Dashboard tab with payment completion stats across all month tabs.
 * Reads all active month + recurring tabs, aggregates by month, writes summary.
 */
export async function refreshDashboard(spreadsheetId) {
    const sheets = await getSheetsClient();
    // 1. Discover all tabs in the spreadsheet
    const meta = await sheets.spreadsheets.get({
        spreadsheetId,
        fields: "sheets.properties",
    });
    const allTabs = (meta.data.sheets ?? [])
        .map((s) => s.properties?.title)
        .filter(Boolean);
    // 2. Filter to scannable tabs: month one-off + recurring, exclude Log/Dashboard/GTP
    const scanTabs = allTabs.filter((tab) => {
        const lower = tab.toLowerCase();
        if (tab === "Log" || tab === DASHBOARD_TAB)
            return false;
        if (lower.includes("gtp"))
            return false;
        // Must be a recognized month tab or recurring tab
        const monthName = extractMonthName(tab);
        return MONTH_NAMES.includes(monthName);
    });
    console.log(`  Dashboard: scanning ${scanTabs.length} tabs: ${scanTabs.join(", ")}`);
    // 3. Aggregate stats by month
    const statsByMonth = new Map();
    for (const tab of scanTabs) {
        const cols = getDashboardColIndices(tab);
        const maxCol = Math.max(cols.paymentStatus, cols.subInvoiceAmount, cols.allPaid);
        // Convert max column index to letter for range
        const endColLetter = String.fromCharCode(65 + Math.min(maxCol, 25));
        const range = maxCol > 25
            ? `'${tab}'!A2:Z500`
            : `'${tab}'!A2:${endColLetter}500`;
        let rows;
        try {
            const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
            rows = (res.data.values ?? []);
        }
        catch (e) {
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
                blank: 0, blankAmount: 0,
                noPaymentCount: 0, noPaymentAmount: 0,
            });
        }
        const stats = statsByMonth.get(monthName);
        for (const row of rows) {
            // Skip rows with blank Job # (col F, index 5)
            const jobNum = (row[5] ?? "").toString().trim();
            if (!jobNum)
                continue;
            const paymentStatus = (row[cols.paymentStatus] ?? "").toString().trim();
            const subAmount = parseDollarAmount((row[cols.subInvoiceAmount] ?? "").toString());
            const allPaidVal = (row[cols.allPaid] ?? "").toString().trim();
            // Separate "No Payment" rows
            if (paymentStatus.toLowerCase() === "no payment") {
                stats.noPaymentCount++;
                stats.noPaymentAmount += subAmount;
                continue;
            }
            stats.total++;
            stats.totalAmount += subAmount;
            // Determine if "paid" — new layout: ✅, legacy: "Paid" or "✅"
            const isPaid = allPaidVal === "✅" || allPaidVal === "Paid";
            const statusLower = paymentStatus.toLowerCase();
            if (statusLower === "paid" || isPaid) {
                stats.paid++;
                stats.paidAmount += subAmount;
            }
            else if (statusLower === "good to pay") {
                stats.goodToPay++;
                stats.goodToPayAmount += subAmount;
            }
            else if (statusLower === "on hold") {
                stats.onHold++;
                stats.onHoldAmount += subAmount;
            }
            else if (statusLower === "pending approval") {
                stats.pending++;
                stats.pendingAmount += subAmount;
            }
            else {
                // Blank or unknown
                stats.blank++;
                stats.blankAmount += subAmount;
            }
        }
    }
    // 4. Sort months by index and build output arrays
    const sortedMonths = [...statsByMonth.values()].sort((a, b) => a.monthIndex - b.monthIndex);
    // Main table header
    const mainHeader = [
        "Month", "Total Jobs", "Total $",
        "# Paid", "% Paid",
        "# Good to Pay", "% Good to Pay",
        "# On Hold", "% On Hold",
        "# Pending", "% Pending",
        "# Blank", "% Blank",
    ];
    const pct = (n, total) => total > 0 ? n / total : 0;
    const mainRows = [mainHeader];
    // YTD accumulators
    let ytdTotal = 0, ytdAmount = 0, ytdPaid = 0, ytdGtp = 0, ytdHold = 0, ytdPending = 0, ytdBlank = 0;
    for (const s of sortedMonths) {
        if (s.total === 0 && s.noPaymentCount === 0)
            continue; // skip months with no data at all
        mainRows.push([
            s.month,
            s.total,
            s.totalAmount,
            s.paid, pct(s.paid, s.total),
            s.goodToPay, pct(s.goodToPay, s.total),
            s.onHold, pct(s.onHold, s.total),
            s.pending, pct(s.pending, s.total),
            s.blank, pct(s.blank, s.total),
        ]);
        ytdTotal += s.total;
        ytdAmount += s.totalAmount;
        ytdPaid += s.paid;
        ytdGtp += s.goodToPay;
        ytdHold += s.onHold;
        ytdPending += s.pending;
        ytdBlank += s.blank;
    }
    // YTD row at row 14 (pad if needed)
    while (mainRows.length < 13)
        mainRows.push([]); // rows 2-13 = up to 12 months, pad empties
    mainRows.push([
        "YTD",
        ytdTotal,
        ytdAmount,
        ytdPaid, pct(ytdPaid, ytdTotal),
        ytdGtp, pct(ytdGtp, ytdTotal),
        ytdHold, pct(ytdHold, ytdTotal),
        ytdPending, pct(ytdPending, ytdTotal),
        ytdBlank, pct(ytdBlank, ytdTotal),
    ]);
    // Section 2: No Payment notes (row 16+)
    const noPayHeader = ["Excluded — No Payment (jobs that will never be paid)"];
    const noPaySubHeader = ["Month", "# Jobs Excluded", "Total $ Excluded"];
    const noPayRows = [];
    let ytdNoPayCount = 0, ytdNoPayAmount = 0;
    for (const s of sortedMonths) {
        if (s.noPaymentCount === 0)
            continue;
        noPayRows.push([s.month, s.noPaymentCount, s.noPaymentAmount]);
        ytdNoPayCount += s.noPaymentCount;
        ytdNoPayAmount += s.noPaymentAmount;
    }
    // 5. Ensure Dashboard tab exists
    const dashboardExists = allTabs.includes(DASHBOARD_TAB);
    let dashboardSheetId;
    if (!dashboardExists) {
        console.log("  Dashboard tab: creating...");
        const addRes = await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
                requests: [{ addSheet: { properties: { title: DASHBOARD_TAB } } }],
            },
        });
        dashboardSheetId = addRes.data.replies?.[0]?.addSheet?.properties?.sheetId ?? 0;
    }
    else {
        const sheet = meta.data.sheets?.find((s) => s.properties?.title === DASHBOARD_TAB);
        dashboardSheetId = sheet?.properties?.sheetId ?? 0;
    }
    // 6. Clear Dashboard tab
    try {
        await sheets.spreadsheets.values.clear({
            spreadsheetId,
            range: `'${DASHBOARD_TAB}'!A1:M100`,
        });
    }
    catch {
        // tab may be empty
    }
    // 7. Write main table (rows 1-14)
    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `'${DASHBOARD_TAB}'!A1:M${mainRows.length}`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: mainRows },
    });
    // 8. Write No Payment section (row 16+)
    const noPayStartRow = mainRows.length + 2; // blank row after main table
    const allNoPayRows = [
        noPayHeader,
        noPaySubHeader,
        ...noPayRows,
    ];
    if (ytdNoPayCount > 0) {
        allNoPayRows.push(["YTD", ytdNoPayCount, ytdNoPayAmount]);
    }
    if (allNoPayRows.length > 2) { // only write if there's data beyond headers
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `'${DASHBOARD_TAB}'!A${noPayStartRow}:M${noPayStartRow + allNoPayRows.length - 1}`,
            valueInputOption: "USER_ENTERED",
            requestBody: { values: allNoPayRows },
        });
    }
    // 9. Apply formatting via batchUpdate
    const ytdRowIndex = mainRows.length - 1; // 0-based index of YTD row
    const noPayHeaderRowIndex = noPayStartRow - 1; // 0-based
    const noPaySubHeaderRowIndex = noPayStartRow; // 0-based
    const noPayYtdRowIndex = noPayStartRow + allNoPayRows.length - 2; // 0-based
    const formatRequests = [];
    // Header row (row 1): bold, blue bg, white text
    formatRequests.push({
        repeatCell: {
            range: { sheetId: dashboardSheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 13 },
            cell: {
                userEnteredFormat: {
                    backgroundColor: { red: 26 / 255, green: 115 / 255, blue: 232 / 255 },
                    textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } },
                },
            },
            fields: "userEnteredFormat(backgroundColor,textFormat)",
        },
    });
    // YTD row: bold, light blue bg
    formatRequests.push({
        repeatCell: {
            range: { sheetId: dashboardSheetId, startRowIndex: ytdRowIndex, endRowIndex: ytdRowIndex + 1, startColumnIndex: 0, endColumnIndex: 13 },
            cell: {
                userEnteredFormat: {
                    backgroundColor: { red: 207 / 255, green: 226 / 255, blue: 255 / 255 },
                    textFormat: { bold: true },
                },
            },
            fields: "userEnteredFormat(backgroundColor,textFormat)",
        },
    });
    // % columns: E(4), G(6), I(8), K(10), M(12) — percentage format
    const pctCols = [4, 6, 8, 10, 12];
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
    // No Payment section header: bold, orange bg
    if (allNoPayRows.length > 2) {
        formatRequests.push({
            repeatCell: {
                range: { sheetId: dashboardSheetId, startRowIndex: noPayHeaderRowIndex, endRowIndex: noPayHeaderRowIndex + 1, startColumnIndex: 0, endColumnIndex: 13 },
                cell: {
                    userEnteredFormat: {
                        backgroundColor: { red: 255 / 255, green: 229 / 255, blue: 178 / 255 },
                        textFormat: { bold: true },
                    },
                },
                fields: "userEnteredFormat(backgroundColor,textFormat)",
            },
        });
        // No Payment sub-header: bold
        formatRequests.push({
            repeatCell: {
                range: { sheetId: dashboardSheetId, startRowIndex: noPaySubHeaderRowIndex, endRowIndex: noPaySubHeaderRowIndex + 1, startColumnIndex: 0, endColumnIndex: 3 },
                cell: { userEnteredFormat: { textFormat: { bold: true } } },
                fields: "userEnteredFormat.textFormat",
            },
        });
        // No Payment $ column (C, index 2)
        formatRequests.push({
            repeatCell: {
                range: {
                    sheetId: dashboardSheetId,
                    startRowIndex: noPaySubHeaderRowIndex + 1,
                    endRowIndex: noPayStartRow + allNoPayRows.length - 1,
                    startColumnIndex: 2,
                    endColumnIndex: 3,
                },
                cell: { userEnteredFormat: { numberFormat: { type: "CURRENCY", pattern: "$#,##0.00" } } },
                fields: "userEnteredFormat.numberFormat",
            },
        });
        // No Payment YTD row: bold
        if (ytdNoPayCount > 0) {
            formatRequests.push({
                repeatCell: {
                    range: { sheetId: dashboardSheetId, startRowIndex: noPayYtdRowIndex, endRowIndex: noPayYtdRowIndex + 1, startColumnIndex: 0, endColumnIndex: 3 },
                    cell: {
                        userEnteredFormat: {
                            backgroundColor: { red: 207 / 255, green: 226 / 255, blue: 255 / 255 },
                            textFormat: { bold: true },
                        },
                    },
                    fields: "userEnteredFormat(backgroundColor,textFormat)",
                },
            });
        }
    }
    // Frozen header row
    formatRequests.push({
        updateSheetProperties: {
            properties: { sheetId: dashboardSheetId, gridProperties: { frozenRowCount: 1 } },
            fields: "gridProperties.frozenRowCount",
        },
    });
    // Column widths: Month=120, count cols=70, % cols=70, $ cols=100
    const colWidths = [
        { col: 0, width: 120 }, // Month
        { col: 1, width: 70 }, // Total Jobs
        { col: 2, width: 100 }, // Total $
        { col: 3, width: 70 }, // # Paid
        { col: 4, width: 70 }, // % Paid
        { col: 5, width: 70 }, // # Good to Pay
        { col: 6, width: 70 }, // % Good to Pay
        { col: 7, width: 70 }, // # On Hold
        { col: 8, width: 70 }, // % On Hold
        { col: 9, width: 70 }, // # Pending
        { col: 10, width: 70 }, // % Pending
        { col: 11, width: 70 }, // # Blank
        { col: 12, width: 70 }, // % Blank
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
    // Clear existing conditional format rules first
    formatRequests.push({
        deleteConditionalFormatRule: {
            sheetId: dashboardSheetId,
            index: 0,
        },
    });
    // We'll add them after clearing — but clearing may fail if none exist, so use addConditionalFormatRule
    // Remove the delete and just add (they'll stack, but that's fine for a cleared tab)
    formatRequests.pop(); // remove the delete
    formatRequests.push({
        addConditionalFormatRule: {
            rule: {
                ranges: [{ sheetId: dashboardSheetId, startRowIndex: 1, endRowIndex: mainRows.length, startColumnIndex: 4, endColumnIndex: 5 }],
                booleanRule: {
                    condition: { type: "NUMBER_LESS", values: [{ userEnteredValue: "0.5" }] },
                    format: { backgroundColor: { red: 234 / 255, green: 153 / 255, blue: 153 / 255 } },
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
                    format: { backgroundColor: { red: 255 / 255, green: 229 / 255, blue: 153 / 255 } },
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
                    format: { backgroundColor: { red: 147 / 255, green: 196 / 255, blue: 125 / 255 } },
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
