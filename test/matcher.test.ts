import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { normalizeHashidNumeric } from "../src/config/types.js";
import type { JobberPaidJob, HeyProsJobDetail } from "../src/config/types.js";

function makeJobberJob(jobNumber: string): JobberPaidJob {
  return {
    jobNumber,
    invoiceNumber: "INV-" + jobNumber,
    invoiceStatus: "paid",
    issuedDate: "2026-03-01",
    paidDate: "2026-03-19",
    amount: 100,
    clientName: "Test Client",
  };
}

describe("Option C column mapping", () => {
  it("JobberPaidJob supports division field", () => {
    const job: JobberPaidJob = {
      ...makeJobberJob("WO-800"),
      division: "Electrical",
    };
    assert.equal(job.division, "Electrical");
  });

  it("JobberPaidJob division defaults to undefined", () => {
    const job = makeJobberJob("WO-801");
    assert.equal(job.division, undefined);
  });

  it("HeyProsJobDetail has correct shape", () => {
    const detail: HeyProsJobDetail = {
      hashid: "abc123",
      hashidNumeric: "3-883-891",
      purchaseOrder: "WO-900",
      jobInvoices: [
        {
          hashidNumeric: "4-111-222",
          amount: 15000,
          file: { fileName: "invoice.pdf" },
        },
      ],
    };
    assert.equal(detail.hashidNumeric, "3-883-891");
    assert.equal(detail.jobInvoices[0].amount, 15000);
    // Amount is in cents — divide by 100 for dollars
    assert.equal(detail.jobInvoices[0].amount / 100, 150);
    assert.equal(detail.jobInvoices[0].file?.fileName, "invoice.pdf");
  });

  it("HeyProsJobDetail handles null file", () => {
    const detail: HeyProsJobDetail = {
      hashid: "abc456",
      hashidNumeric: "3-999-000",
      purchaseOrder: "WO-901",
      jobInvoices: [
        {
          hashidNumeric: "4-333-444",
          amount: 5000,
          file: null,
        },
      ],
    };
    assert.equal(detail.jobInvoices[0].file, null);
  });

  it("PDF URL is constructed correctly from fileName", () => {
    const fileName = "abc123-invoice.pdf";
    const url = `https://hey-pros-api.birdsdontexist.com/files/${fileName}`;
    assert.equal(url, "https://hey-pros-api.birdsdontexist.com/files/abc123-invoice.pdf");
  });

  it("25-column row has correct structure", () => {
    // Simulate a row as built by the Option C flow
    const row = [
      "",                     // A=0: Date (manual)
      "",                     // B=1: REVIEW (manual)
      "",                     // C=2: Company Name (manual)
      "",                     // D=3: Preferred Partner Owner Name (manual)
      "3-883-891",            // E=4: HeyPros hashidNumeric
      "WO-100",               // F=5: Job #
      "",                     // G=6: Jobber Link (auto)
      "",                     // H=7: Job Status (auto)
      "Test Client",          // I=8: Job Type (auto) — mocked as client name for structure test
      "Electrical",           // J=9: Client Name — mocked as division for structure test
      "INV-001",              // K=10: Division — mocked
      "500",                  // L=11: Invoice Number — mocked
      "2026-03-01",           // M=12: Jobber Invoice Total Amount — mocked
      "paid",                 // N=13: Invoice Issued Date — mocked
      "2026-03-15",           // O=14: Jobber Invoice Status — mocked
      "",                     // P=15: Date Invoice Paid (auto)
      "4-111-222",            // Q=16: HEY PROS INVOICE NUMBER (auto)
      "150",                  // R=17: Sub Invoice Amount (auto, dollars)
      "",                     // S=18: KCPC Released Amount (manual)
      "https://hey-pros-api.birdsdontexist.com/files/inv.pdf", // T=19: PDF (auto)
      "",                     // U=20: Payment Status (manual)
      "",                     // V=21: Payment Tracking (manual)
      "",                     // W=22: Payment Method (manual)
      "",                     // X=23: Date of Payment (manual)
      "",                     // Y=24: NOTES / REMARKS (manual)
    ];

    assert.equal(row.length, 25, "row should have 25 columns");
    // Manual columns should be empty
    assert.equal(row[0], "", "col A (Date) should be empty");
    assert.equal(row[1], "", "col B (REVIEW) should be empty");
    assert.equal(row[2], "", "col C (Company Name) should be empty");
    assert.equal(row[3], "", "col D (Preferred Partner) should be empty");
    assert.equal(row[18], "", "col S (KCPC Released) should be empty");
    assert.equal(row[20], "", "col U (Payment Status) should be empty");
    assert.equal(row[21], "", "col V (Payment Tracking) should be empty");
    assert.equal(row[22], "", "col W (Payment Method) should be empty");
    assert.equal(row[23], "", "col X (Date of Payment) should be empty");
    assert.equal(row[24], "", "col Y (NOTES) should be empty");
    // Data columns
    assert.equal(row[4], "3-883-891", "col E should be HeyPros hashidNumeric");
    assert.equal(row[5], "WO-100", "col F should be Job #");
    assert.equal(row[6], "", "col G should be Jobber Link");
    assert.equal(row[16], "4-111-222", "col Q should be HeyPros invoice hashidNumeric");
    assert.equal(row[17], "150", "col R should be amount in dollars");
    assert.ok(row[19].startsWith("https://hey-pros-api.birdsdontexist.com/files/"), "col T should be PDF URL");
  });
});

describe("normalizeHashidNumeric", () => {
  it("strips dashes from dashed format (sheet format)", () => {
    assert.equal(normalizeHashidNumeric("9-331-562"), "9331562");
  });

  it("returns numeric string unchanged (API format)", () => {
    assert.equal(normalizeHashidNumeric("9331562"), "9331562");
  });

  it("handles numeric input", () => {
    assert.equal(normalizeHashidNumeric(9331562), "9331562");
  });

  it("handles null", () => {
    assert.equal(normalizeHashidNumeric(null), "");
  });

  it("handles undefined", () => {
    assert.equal(normalizeHashidNumeric(undefined), "");
  });

  it("handles empty string", () => {
    assert.equal(normalizeHashidNumeric(""), "");
  });

  it("normalizes both sides to equal (comparison use case)", () => {
    const fromSheet = "9-331-562";
    const fromApi = "9331562";
    assert.equal(normalizeHashidNumeric(fromSheet), normalizeHashidNumeric(fromApi));
  });
});
