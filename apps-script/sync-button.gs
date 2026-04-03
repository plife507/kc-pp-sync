/**
 * KC PP Sync — Google Sheets Sync Button
 * Adds a "KC PP Sync" menu to the spreadsheet with sync options.
 * 
 * Setup:
 * 1. Open KC PP Sync spreadsheet
 * 2. Extensions → Apps Script
 * 3. Paste this code
 * 4. Save and reload the spreadsheet
 * 5. "KC PP Sync" menu appears in the menu bar
 */

// Cloud Run service URL
const SYNC_URL = "https://kc-pp-sync-823212137840.us-central1.run.app/";

/**
 * Create custom menu on spreadsheet open
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("⚡ KC PP Sync")
    .addItem("🔄 Sync Current Tab", "syncCurrentTab")
    .addSeparator()
    .addItem("📊 Sync Current Month", "syncCurrentMonth")
    .addItem("📊 Sync Current Month - R", "syncCurrentMonthRecurring")
    .addItem("📊 Sync Previous Month", "syncPrevMonth")
    .addItem("📊 Sync Previous Month - R", "syncPrevMonthRecurring")
    .addSeparator()
    .addItem("🔄 Sync All Active", "syncAll")
    .addToUi();
}

/**
 * Sync the currently active/visible tab
 */
function syncCurrentTab() {
  const tabName = SpreadsheetApp.getActiveSheet().getName();
  
  // Validate it's a syncable tab (not GTP $, not internal)
  if (tabName.includes("GTP $")) {
    SpreadsheetApp.getUi().alert(
      "GTP $ tabs are auto-generated during sync.\n\n" +
      "Sync the source month tab instead (e.g., 'March' or 'April')."
    );
    return;
  }
  
  const ui = SpreadsheetApp.getUi();
  const result = ui.alert(
    "Sync Tab",
    `Sync "${tabName}" now?`,
    ui.ButtonSet.OK_CANCEL
  );
  
  if (result !== ui.Button.OK) return;
  
  triggerSync({ tab: tabName }, `Syncing "${tabName}"...`);
}

/**
 * Sync current month (auto-detected)
 */
function syncCurrentMonth() {
  triggerSync({ mode: "current" }, "Syncing current month...");
}

/**
 * Sync current month recurring tab
 */
function syncCurrentMonthRecurring() {
  triggerSync({ mode: "current-r" }, "Syncing current month recurring...");
}

/**
 * Sync previous month
 */
function syncPrevMonth() {
  triggerSync({ mode: "prev" }, "Syncing previous month...");
}

/**
 * Sync previous month recurring tab
 */
function syncPrevMonthRecurring() {
  triggerSync({ mode: "prev-r" }, "Syncing previous month recurring...");
}

/**
 * Sync all active tabs (current + current-r + prev + prev-r)
 */
function syncAll() {
  const ui = SpreadsheetApp.getUi();
  const result = ui.alert(
    "Sync All Active Tabs",
    "This will sync:\n• Current month\n• Current month - R\n• Previous month\n• Previous month - R\n\nThis may take 2-4 minutes. Continue?",
    ui.ButtonSet.OK_CANCEL
  );
  
  if (result !== ui.Button.OK) return;
  
  const modes = [
    { mode: "current", label: "Current month" },
    { mode: "current-r", label: "Current month - R" },
    { mode: "prev", label: "Previous month" },
    { mode: "prev-r", label: "Previous month - R" },
  ];
  
  const results = [];
  
  for (const m of modes) {
    try {
      SpreadsheetApp.getActiveSpreadsheet().toast(`⏳ ${m.label}...`, "KC PP Sync", -1);
      const response = callSyncAPI(m);
      results.push(`✅ ${m.label}: ${response.tab} — ${response.updatedRows} rows, ${response.elapsed}`);
    } catch (e) {
      results.push(`❌ ${m.label}: ${e.message}`);
    }
  }
  
  SpreadsheetApp.getActiveSpreadsheet().toast("", "KC PP Sync", 1); // clear toast
  ui.alert("Sync All — Results", results.join("\n"), ui.ButtonSet.OK);
}

/**
 * Core sync trigger with toast notifications
 */
function triggerSync(payload, toastMessage) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  ss.toast(toastMessage, "⚡ KC PP Sync", -1);
  
  try {
    const response = callSyncAPI(payload);
    
    const summary = [
      `Tab: ${response.tab}`,
      `Jobs: ${response.jobNumbers}`,
      `Rows updated: ${response.updatedRows}`,
      response.gtpRows > 0 ? `GTP rows: ${response.gtpRows}` : null,
      `Time: ${response.elapsed}`,
    ].filter(Boolean).join("\n");
    
    ss.toast("", "KC PP Sync", 1); // clear loading toast
    SpreadsheetApp.getUi().alert("✅ Sync Complete", summary, SpreadsheetApp.getUi().ButtonSet.OK);
    
  } catch (e) {
    ss.toast("", "KC PP Sync", 1); // clear loading toast
    SpreadsheetApp.getUi().alert("❌ Sync Failed", e.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Call the Cloud Run sync API with OIDC authentication
 */
function callSyncAPI(payload) {
  // Get OIDC identity token for the Cloud Run service
  const token = ScriptApp.getIdentityToken();
  
  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    headers: {
      "Authorization": "Bearer " + token,
    },
    muteHttpExceptions: true,
    timeout: 300, // 5 minutes max
  };
  
  const response = UrlFetchApp.fetch(SYNC_URL, options);
  const code = response.getResponseCode();
  const body = response.getContentText();
  
  if (code === 401 || code === 403) {
    throw new Error(
      "Authentication failed.\n\n" +
      "The Apps Script service account needs Cloud Run Invoker permissions.\n" +
      "Contact Nathan to fix IAM."
    );
  }
  
  if (code !== 200) {
    let errorMsg;
    try {
      const json = JSON.parse(body);
      errorMsg = json.error || body;
    } catch (_) {
      errorMsg = body.substring(0, 500);
    }
    throw new Error(`HTTP ${code}: ${errorMsg}`);
  }
  
  return JSON.parse(body);
}
