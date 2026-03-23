/**
 * ⚡ KC PP Sync — Command Center (Apps Script)
 *
 * Simplified command tab with dropdown month selection.
 *
 * Layout:
 *   B3  — Month dropdown selector
 *   C3/D3 area — "Sync Selected" drawing button (assigned to syncSelected)
 *   C5/D5 area — "Sync All" drawing button (assigned to syncAllMonths)
 *   Row 7 — Status headers
 *   Row 8 — Status values (updated by sync functions)
 *   B12 — Cloud Function URL (configuration)
 *
 * BUTTON SETUP:
 *   1. Insert → Drawing → rounded rectangle, blue #1a73e8, white bold text
 *   2. "▶ Sync Selected" over C3/D3 → assign script: syncSelected
 *   3. "▶ Sync All" over C5/D5 → assign script: syncAllMonths
 */

var COMMAND_TAB = "⚡ Command";

// Dropdown cell for month selection
var DROPDOWN_CELL = "B3";

// Status row (1-indexed) — results written here
var STATUS_ROW = 8;

// Column positions (1-indexed)
var COL_LAST_RESULT  = 2;  // B
var COL_LAST_SYNCED  = 3;  // C
var COL_ROWS_UPDATED = 4;  // D
var COL_ELAPSED      = 5;  // E

// All month tabs
var ALL_MONTHS = [
  "January 2026", "February 2026", "March 2026",
  "April 2026", "May 2026", "June 2026",
  "July 2026", "August 2026", "September 2026",
  "October 2026", "November 2026", "December 2026",
];

// ---------------------------------------------------------------------------
// Menu
// ---------------------------------------------------------------------------

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("KC Sync")
    .addItem("Sync Selected Month", "syncSelected")
    .addItem("Sync All Months", "syncAllMonths")
    .addToUi();
}

// ---------------------------------------------------------------------------
// Sync the month selected in the dropdown (B3)
// ---------------------------------------------------------------------------

function syncSelected() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(COMMAND_TAB);
  var selectedTab = sheet.getRange(DROPDOWN_CELL).getValue();
  if (!selectedTab) {
    SpreadsheetApp.getUi().alert("Please select a month in " + DROPDOWN_CELL + " first.");
    return;
  }
  syncMonth(selectedTab);
}

// ---------------------------------------------------------------------------
// Sync all 12 months sequentially, then write aggregate status to row 9
// ---------------------------------------------------------------------------

function syncAllMonths() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(COMMAND_TAB);

  // Show progress in status row
  sheet.getRange(STATUS_ROW, COL_LAST_RESULT).setValue("⏳ Syncing all...");
  SpreadsheetApp.flush();

  var totalRows = 0;
  var startAll = new Date();

  for (var i = 0; i < ALL_MONTHS.length; i++) {
    try {
      var result = syncMonth(ALL_MONTHS[i]);
      totalRows += (result || 0);
    } catch (e) {
      // Write error to aggregate row (row 9)
      sheet.getRange(9, COL_LAST_RESULT).setValue("❌ Error at " + ALL_MONTHS[i] + ": " + e.message);
      SpreadsheetApp.flush();
      return;
    }
  }

  // Write aggregate results to row 9
  var elapsedAll = ((new Date() - startAll) / 1000).toFixed(1) + "s";
  sheet.getRange(9, COL_LAST_RESULT).setValue("✅ All done");
  sheet.getRange(9, COL_LAST_SYNCED).setValue(new Date());
  sheet.getRange(9, COL_ROWS_UPDATED).setValue(totalRows);
  sheet.getRange(9, COL_ELAPSED).setValue(elapsedAll);
  SpreadsheetApp.flush();
}

// ---------------------------------------------------------------------------
// Core: sync a single month tab via the Cloud Function
// ---------------------------------------------------------------------------

/**
 * Sync a single month by calling the Cloud Function.
 * Updates status columns on the Command tab (row 8).
 *
 * @param {string} tab - The tab/month name, e.g. "January 2026"
 * @returns {number} Number of rows updated
 */
function syncMonth(tab) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(COMMAND_TAB);
  var url = getFunctionUrl();

  // Mark as syncing
  sheet.getRange(STATUS_ROW, COL_LAST_RESULT).setValue("⏳ " + tab + "...");
  SpreadsheetApp.flush();

  var start = new Date();

  try {
    var response = UrlFetchApp.fetch(url, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({ tab: tab }),
      muteHttpExceptions: true,
    });

    var code = response.getResponseCode();
    var body;
    try {
      body = JSON.parse(response.getContentText());
    } catch (e) {
      body = {};
    }

    var elapsed = ((new Date() - start) / 1000).toFixed(1) + "s";

    if (code >= 200 && code < 300) {
      var updatedRows = body.updatedRows || body.rowsUpdated || 0;
      sheet.getRange(STATUS_ROW, COL_LAST_RESULT).setValue("✅ " + tab);
      sheet.getRange(STATUS_ROW, COL_LAST_SYNCED).setValue(new Date());
      sheet.getRange(STATUS_ROW, COL_ROWS_UPDATED).setValue(updatedRows);
      sheet.getRange(STATUS_ROW, COL_ELAPSED).setValue(elapsed);
      SpreadsheetApp.flush();
      return updatedRows;
    } else {
      var errMsg = body.error || body.message || ("HTTP " + code);
      sheet.getRange(STATUS_ROW, COL_LAST_RESULT).setValue("❌ " + errMsg);
      SpreadsheetApp.flush();
      throw new Error(errMsg);
    }
  } catch (e) {
    if (e.message && !e.message.startsWith("❌")) {
      sheet.getRange(STATUS_ROW, COL_LAST_RESULT).setValue("❌ " + e.message);
      SpreadsheetApp.flush();
    }
    throw e;
  }
}

// ---------------------------------------------------------------------------
// Config: read Cloud Function URL from B12
// ---------------------------------------------------------------------------

/**
 * Get the Cloud Function URL from cell B12 on the Command tab.
 */
function getFunctionUrl() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(COMMAND_TAB);
  var url = sheet.getRange("B12").getValue();
  if (!url) {
    throw new Error("Function URL not found in ⚡ Command tab cell B12");
  }
  return url;
}
