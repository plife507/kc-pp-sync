#!/usr/bin/env python3
"""One-shot script to set up January/February/March 2026 tabs in the ops sheet."""

import google.auth
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

SPREADSHEET_ID = "1p4lxIUjWFYNDp6ptqSMwyRcdle5Hcv5UMC6TdpZE99Q"

HEADER = [
    "Date", "REVIEW", "Company Name", "Preferred Partner Owner Name",
    "HeyPros ID #", "Job #", "Job Type", "Client Name", "Division",
    "Invoice Number", "Jobber Invoice Total Amount", "Invoice Issued Date",
    "Jobber Invoice Status", "Date Invoice Paid (Auto Populates)",
    "Jobber Expense Amount (Manual Input)", "HEY PROS INVOICE NUMBER",
    "Sub Invoice Amount", "KCPC Released Amount", "Payment Status",
    "Payment Tracking (Finance)", "Payment Method (Finance)",
    "Date of Payment", "NOTES / REMARKS", "Contractor Invoice PDF",
]

JANUARY_JOBS = [
    19113,19095,19103,19121,19115,19135,19108,19099,19127,19049,19107,19145,
    19150,19146,19118,19138,19136,19133,19161,19072,19141,19167,19163,19021,
    19165,19147,19154,19160,19180,19172,19183,19134,19174,19117,19168,19098,
    19192,19193,19209,19193,19186,19205,19210,19195,19213,19208,19221,19240,
    19223,19216,19178,19198,19220,19162,19227,19207,19184,19219,19243,19234,
    19245,19252,19246,19229,19256,19217,19266,19265,19159,19261,19268,19242,
    19233,19262,19283,19280,19222,19259,19273,19248,19292,19290,19244,19303,
    19263,19305,19287,19296,19282,19318,19319,12763,19335,19300,19333,19299,
    19332,19324,19336,19297,19328,19311,19346,19345,19342,19097,18151,19307,
    19350,19349,19325,18950,19260,19358,19275,19364,19368,19365,19375,19374,
    19373,19343,19378,19379,19353,19354,19391,19398,19384,19330,19395,19383,
    19383,19390,18603,12442,18839,19418,18637,19004,19418,19418,19418,19418,
    19238,19448,18639,
]

FEBRUARY_JOBS = [
    19387,19387,19433,19367,19448,19431,19449,19463,19466,19472,19476,19467,
    19487,19463,19450,19484,19480,19488,19468,19472,19486,19490,19509,19511,
    19513,19514,19484,19504,19496,19521,19521,19505,19528,19530,19519,19523,
    19524,19507,19502,19508,19532,19547,19503,19555,19546,19537,19539,19560,
    19548,19540,19477,19557,19564,19570,19568,19558,19569,19571,19561,19562,
    19533,19579,19578,19577,19576,19591,19520,19590,19597,19586,19595,19589,
    19588,19599,19593,19602,19606,19609,19611,19610,19601,19608,19607,19616,
    19617,19615,19614,19620,19624,19621,19631,19629,19635,19633,19636,19642,
    19637,19641,19640,19638,19646,19648,19649,19647,19651,19654,19655,19656,
    19657,19658,19660,19663,19662,19664,19668,19669,19665,19670,19672,19673,
    19676,19675,19679,19680,19683,19684,19686,19688,19690,19691,19692,
]


def get_sheets_service():
    creds, _ = google.auth.default(scopes=["https://www.googleapis.com/auth/spreadsheets"])
    return build("sheets", "v4", credentials=creds)


def get_existing_sheets(service):
    meta = service.spreadsheets().get(spreadsheetId=SPREADSHEET_ID, fields="sheets.properties").execute()
    return {s["properties"]["title"]: s["properties"]["sheetId"] for s in meta["sheets"]}


def rename_sheet1_to_march(service, existing):
    if "Sheet1" not in existing:
        print("Sheet1 not found (already renamed?) — skipping rename.")
        return
    if "March 2026" in existing:
        print("March 2026 already exists — skipping rename.")
        return
    service.spreadsheets().batchUpdate(
        spreadsheetId=SPREADSHEET_ID,
        body={"requests": [{"updateSheetProperties": {
            "properties": {"sheetId": existing["Sheet1"], "title": "March 2026"},
            "fields": "title",
        }}]},
    ).execute()
    print("Renamed Sheet1 → March 2026")


def ensure_tab(service, existing, title):
    if title in existing:
        print(f"Tab '{title}' already exists — skipping creation.")
        return
    service.spreadsheets().batchUpdate(
        spreadsheetId=SPREADSHEET_ID,
        body={"requests": [{"addSheet": {"properties": {"title": title}}}]},
    ).execute()
    print(f"Created tab '{title}'")


def write_header_and_jobs(service, tab_title, job_numbers):
    # Build values: header in row 1, job numbers in column F (index 5) starting row 2
    last_row = len(job_numbers) + 1  # +1 for header
    # Write header
    service.spreadsheets().values().update(
        spreadsheetId=SPREADSHEET_ID,
        range=f"'{tab_title}'!A1:X1",
        valueInputOption="RAW",
        body={"values": [HEADER]},
    ).execute()
    # Write job numbers in column F
    job_rows = [[j] for j in job_numbers]
    service.spreadsheets().values().update(
        spreadsheetId=SPREADSHEET_ID,
        range=f"'{tab_title}'!F2:F{last_row}",
        valueInputOption="RAW",
        body={"values": job_rows},
    ).execute()
    print(f"Wrote header + {len(job_numbers)} job numbers to '{tab_title}'")


def main():
    assert len(HEADER) == 24, f"Header has {len(HEADER)} columns, expected 24"
    assert len(JANUARY_JOBS) == 147, f"January has {len(JANUARY_JOBS)} jobs, expected 147"
    assert len(FEBRUARY_JOBS) == 131, f"February has {len(FEBRUARY_JOBS)} jobs, expected 131"

    service = get_sheets_service()
    existing = get_existing_sheets(service)

    # Step 1: Rename Sheet1 → March 2026
    rename_sheet1_to_march(service, existing)

    # Refresh after rename
    existing = get_existing_sheets(service)

    # Step 2: January 2026
    ensure_tab(service, existing, "January 2026")
    write_header_and_jobs(service, "January 2026", JANUARY_JOBS)

    # Step 3: February 2026
    ensure_tab(service, existing, "February 2026")
    write_header_and_jobs(service, "February 2026", FEBRUARY_JOBS)

    print("Done.")


if __name__ == "__main__":
    main()
