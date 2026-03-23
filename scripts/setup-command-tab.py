#!/usr/bin/env python3
"""Create and format the '⚡ Command' tab — compact dashboard layout."""

import json
import urllib.parse
import urllib.request

SPREADSHEET_ID = "1p4lxIUjWFYNDp6ptqSMwyRcdle5Hcv5UMC6TdpZE99Q"
BASE = f"https://sheets.googleapis.com/v4/spreadsheets/{SPREADSHEET_ID}"
FUNCTION_URL = "https://us-central1-aya-gservicies.cloudfunctions.net/kc-pp-sync"
TAB_TITLE = "⚡ Command"

MONTHS = [
    "January 2026", "February 2026", "March 2026",
    "April 2026", "May 2026", "June 2026",
    "July 2026", "August 2026", "September 2026",
    "October 2026", "November 2026", "December 2026",
]


def get_token():
    with open("/tmp/sheets-access-token.txt") as f:
        return f.read().strip()


def api(method, url, body=None):
    token = get_token()
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(
        url,
        data=data,
        method=method,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())


def get_existing_sheets():
    result = api("GET", f"{BASE}?fields=sheets.properties")
    return {s["properties"]["title"]: s["properties"]["sheetId"] for s in result["sheets"]}


def delete_tab_if_exists(existing):
    if TAB_TITLE in existing:
        api("POST", f"{BASE}:batchUpdate", {
            "requests": [{"deleteSheet": {"sheetId": existing[TAB_TITLE]}}]
        })
        print(f"Deleted existing '{TAB_TITLE}' tab")


def create_tab():
    resp = api("POST", f"{BASE}:batchUpdate", {
        "requests": [{"addSheet": {"properties": {"title": TAB_TITLE}}}]
    })
    sheet_id = resp["replies"][0]["addSheet"]["properties"]["sheetId"]
    print(f"Created '{TAB_TITLE}' tab (sheetId={sheet_id})")
    return sheet_id


def write_data():
    rows = [
        # Row 1: title (merged A1:F1)
        ["⚡ KC PP Sync — Command Center", "", "", "", "", ""],
        # Row 2: spacer
        ["", "", "", "", "", ""],
        # Row 3: select month row
        ["SELECT MONTH", "", "", "", "", ""],
        # Row 4: spacer
        ["", "", "", "", "", ""],
        # Row 5: sync all row
        ["SYNC ALL MONTHS", "", "", "", "", ""],
        # Row 6: spacer
        ["", "", "", "", "", ""],
        # Row 7: status headers
        ["STATUS", "Last Result", "Last Synced", "Rows Updated", "Elapsed", ""],
        # Row 8: status values (filled by script)
        ["", "", "", "", "", ""],
        # Row 9: spacer
        ["", "", "", "", "", ""],
        # Row 10: config header (merged A10:F10)
        ["CONFIGURATION", "", "", "", "", ""],
        # Row 11: function URL (B11:F11 merged)
        ["Function URL", FUNCTION_URL, "", "", "", ""],
    ]
    encoded_range = urllib.parse.quote(f"'{TAB_TITLE}'!A1:F11", safe="")
    api("PUT", f"{BASE}/values/{encoded_range}?valueInputOption=RAW", {
        "values": rows,
    })
    print("Wrote tab data")


def format_tab(sheet_id):
    """Apply formatting: merges, colors, widths, freeze, borders."""
    # Colors
    navy = {"red": 0.118, "green": 0.227, "blue": 0.373}        # #1e3a5f
    white = {"red": 1, "green": 1, "blue": 1}
    light_blue_bg = {"red": 0.91, "green": 0.941, "blue": 0.996}  # #e8f0fe
    light_gray_bg = {"red": 0.961, "green": 0.961, "blue": 0.961}  # #f5f5f5
    gray_fg = {"red": 0.4, "green": 0.4, "blue": 0.4}             # #666666
    text_dark = {"red": 0.2, "green": 0.2, "blue": 0.2}           # #333333
    url_blue = {"red": 0.102, "green": 0.451, "blue": 0.91}       # #1a73e8
    border_light = {"red": 0.8, "green": 0.8, "blue": 0.8}        # #cccccc

    def rng(r1, r2, c1, c2):
        return {"sheetId": sheet_id, "startRowIndex": r1, "endRowIndex": r2,
                "startColumnIndex": c1, "endColumnIndex": c2}

    def merge(r1, r2, c1, c2):
        return {"mergeCells": {"range": rng(r1, r2, c1, c2), "mergeType": "MERGE_ALL"}}

    def cell_fmt(r1, r2, c1, c2, *, bold=False, bg=None, fg=None, font_size=None, h_align=None):
        fmt = {}
        if bold:
            fmt["textFormat"] = {"bold": True}
        if font_size:
            fmt.setdefault("textFormat", {})["fontSize"] = font_size
        if fg:
            fmt.setdefault("textFormat", {})["foregroundColor"] = fg
        if bg:
            fmt["backgroundColor"] = bg
        if h_align:
            fmt["horizontalAlignment"] = h_align
        fields = ",".join(f"userEnteredFormat.{k}" for k in fmt)
        return {"repeatCell": {
            "range": rng(r1, r2, c1, c2),
            "cell": {"userEnteredFormat": fmt},
            "fields": fields,
        }}

    def col_width(col, px):
        return {"updateDimensionProperties": {
            "range": {"sheetId": sheet_id, "dimension": "COLUMNS", "startIndex": col, "endIndex": col + 1},
            "properties": {"pixelSize": px},
            "fields": "pixelSize",
        }}

    def row_height(row, px):
        return {"updateDimensionProperties": {
            "range": {"sheetId": sheet_id, "dimension": "ROWS", "startIndex": row, "endIndex": row + 1},
            "properties": {"pixelSize": px},
            "fields": "pixelSize",
        }}

    def bottom_border(r1, r2, c1, c2, color, style="SOLID"):
        return {"updateBorders": {
            "range": rng(r1, r2, c1, c2),
            "bottom": {"style": style, "color": color},
        }}

    requests = [
        # --- Merges ---
        merge(0, 1, 0, 6),    # A1:F1 title
        merge(9, 10, 0, 6),   # A10:F10 config header
        merge(10, 11, 1, 6),  # B11:F11 function URL

        # --- Column widths ---
        col_width(0, 180),   # A
        col_width(1, 180),   # B
        col_width(2, 120),   # C
        col_width(3, 140),   # D
        col_width(4, 130),   # E
        col_width(5, 80),    # F

        # --- Row heights ---
        row_height(0, 56),   # Row 1: title
        row_height(1, 10),   # Row 2: spacer
        row_height(2, 48),   # Row 3: select month
        row_height(3, 16),   # Row 4: spacer
        row_height(4, 48),   # Row 5: sync all
        row_height(5, 16),   # Row 6: spacer
        row_height(6, 32),   # Row 7: status header
        row_height(7, 40),   # Row 8: status values
        row_height(8, 16),   # Row 9: spacer
        row_height(9, 30),   # Row 10: config header
        row_height(10, 32),  # Row 11: config row

        # --- Title bar (row 1) ---
        cell_fmt(0, 1, 0, 6, bold=True, bg=navy, fg=white, font_size=20, h_align="CENTER"),

        # --- Row 3: SELECT MONTH ---
        cell_fmt(2, 3, 0, 1, bold=True, fg=navy),            # A3 bold navy
        cell_fmt(2, 3, 1, 2, bg=light_blue_bg),               # B3 light blue bg (dropdown)
        bottom_border(2, 3, 0, 6, border_light),              # thin bottom border

        # --- Row 5: SYNC ALL MONTHS ---
        cell_fmt(4, 5, 0, 1, bold=True, fg=navy),            # A5 bold navy
        bottom_border(4, 5, 0, 6, border_light),              # thin bottom border

        # --- Row 7: status header ---
        cell_fmt(6, 7, 0, 6, bold=True, bg=light_gray_bg, font_size=12),
        # A7 "STATUS" as bold gray section label
        cell_fmt(6, 7, 0, 1, bold=True, fg=gray_fg),

        # --- Row 8: status values ---
        cell_fmt(7, 8, 0, 6, bg=white),

        # --- Row 10: config header ---
        cell_fmt(9, 10, 0, 6, bold=True, bg=light_gray_bg, fg=gray_fg),

        # --- Row 11: config row ---
        cell_fmt(10, 11, 0, 1, bold=True, fg=text_dark),     # A11 bold
        cell_fmt(10, 11, 1, 6, fg=url_blue),                  # B-F blue text for URL

        # --- Freeze row 1 ---
        {"updateSheetProperties": {
            "properties": {"sheetId": sheet_id, "gridProperties": {"frozenRowCount": 1}},
            "fields": "gridProperties.frozenRowCount",
        }},
    ]

    api("POST", f"{BASE}:batchUpdate", {"requests": requests})
    print("Applied formatting")

    # --- Data validation: B3 dropdown with all 12 months ---
    add_dropdown_validation(sheet_id)


def add_dropdown_validation(sheet_id):
    """Add data validation dropdown to B3 with all 12 month options."""
    requests = [
        {"setDataValidation": {
            "range": {
                "sheetId": sheet_id,
                "startRowIndex": 2,
                "endRowIndex": 3,
                "startColumnIndex": 1,
                "endColumnIndex": 2,
            },
            "rule": {
                "condition": {
                    "type": "ONE_OF_LIST",
                    "values": [{"userEnteredValue": m} for m in MONTHS],
                },
                "showCustomUi": True,
                "strict": False,
            },
        }}
    ]
    api("POST", f"{BASE}:batchUpdate", {"requests": requests})
    print("Added dropdown validation to B3")


def main():
    existing = get_existing_sheets()
    delete_tab_if_exists(existing)
    sheet_id = create_tab()
    write_data()
    format_tab(sheet_id)
    print("Done — ⚡ Command tab is ready.")


if __name__ == "__main__":
    main()
