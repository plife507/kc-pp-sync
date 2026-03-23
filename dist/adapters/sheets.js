import { google } from "googleapis";
export async function readOutputSheetJobNumbers(spreadsheetId, tab = "Sheet1", range = "F2:F500") {
    const sheets = await getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${tab}!${range}`,
    });
    const rows = res.data.values ?? [];
    const startRow = parseInt(range.match(/\d+/)?.[0] ?? "2", 10);
    const result = [];
    for (let i = 0; i < rows.length; i++) {
        const val = rows[i]?.[0] != null ? String(rows[i][0]).trim() : "";
        if (val.length > 0)
            result.push({ rowIndex: startRow + i, jobNumber: val });
    }
    return result;
}
export const AUTO_COL_LETTERS = new Set(["A", "C", "D", "E", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "T", "Z"]);
export async function batchUpdateAutoColumns(spreadsheetId, tab, updates) {
    if (updates.length === 0)
        return;
    const sheets = await getSheetsClient();
    const data = [];
    for (const update of updates) {
        for (const [col, val] of Object.entries(update.values)) {
            if (!AUTO_COL_LETTERS.has(col))
                continue; // never write manual cols
            data.push({ range: `${tab}!${col}${update.rowIndex}`, values: [[val ?? ""]] });
        }
    }
    if (data.length === 0)
        return;
    await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: { valueInputOption: "USER_ENTERED", data },
    });
}
async function getSheetsClient() {
    const auth = new google.auth.GoogleAuth({
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const authClient = await auth.getClient();
    return google.sheets({ version: "v4", auth: authClient });
}
