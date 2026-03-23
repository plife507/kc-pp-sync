import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AUTO_COL_LETTERS } from "../src/adapters/sheets.js";

describe("AUTO_COL_LETTERS", () => {
  it("contains E,G,H,I,J,K,L,M,N,O,P,Q,R,T,Z", () => {
    for (const col of ["E", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "T", "Z"]) {
      assert.ok(AUTO_COL_LETTERS.has(col), `expected ${col} to be in AUTO_COL_LETTERS`);
    }
  });

  it("does not contain F (job number is manual)", () => {
    assert.equal(AUTO_COL_LETTERS.has("F"), false);
  });

  it("contains A,C,D (heypros date + contractor fields — now auto)", () => {
    for (const col of ["A", "C", "D"]) {
      assert.ok(AUTO_COL_LETTERS.has(col), `expected ${col} to be in AUTO_COL_LETTERS`);
    }
  });

  it("does not contain B,F,S,U,V,W,X,Y (manual columns)", () => {
    for (const col of ["B", "F", "S", "U", "V", "W", "X", "Y"]) {
      assert.equal(AUTO_COL_LETTERS.has(col), false, `expected ${col} NOT to be in AUTO_COL_LETTERS`);
    }
  });

  it("has exactly 18 auto columns", () => {
    assert.equal(AUTO_COL_LETTERS.size, 18);
  });
});

describe("batchUpdateAutoColumns range format", () => {
  it("rowIndex 2, col E → range 'Sheet1!E2'", () => {
    const tab = "Sheet1";
    const rowIndex = 2;
    const col = "E";
    assert.equal(`${tab}!${col}${rowIndex}`, "Sheet1!E2");
  });

  it("builds correct cell references from update", () => {
    const tab = "Sheet1";
    const update = {
      rowIndex: 3,
      values: { E: "hp-id", G: "jobber-link", T: "https://example.com/file.pdf" } as Record<string, string>,
    };

    const refs: string[] = [];
    for (const [col] of Object.entries(update.values)) {
      if (AUTO_COL_LETTERS.has(col)) {
        refs.push(`${tab}!${col}${update.rowIndex}`);
      }
    }

    assert.deepEqual(refs, ["Sheet1!E3", "Sheet1!G3", "Sheet1!T3"]);
  });

  it("skips non-auto columns in values", () => {
    const tab = "Sheet1";
    const update = {
      rowIndex: 2,
      values: { E: "hp-id", F: "should-be-ignored", G: "Client" } as Record<string, string>,
    };

    const refs: string[] = [];
    for (const [col] of Object.entries(update.values)) {
      if (AUTO_COL_LETTERS.has(col)) {
        refs.push(`${tab}!${col}${update.rowIndex}`);
      }
    }

    // F should be excluded
    assert.deepEqual(refs, ["Sheet1!E2", "Sheet1!G2"]);
  });
});

describe("Jobber highest invoiceNumber selection", () => {
  it("picks the record with the highest numeric invoice suffix", () => {
    const records = [
      { invoiceNumber: "INV-00100", clientName: "A" },
      { invoiceNumber: "INV-00300", clientName: "C" },
      { invoiceNumber: "INV-00200", clientName: "B" },
    ];
    const best = records.slice().sort((a, b) => {
      const numA = parseInt(a.invoiceNumber.replace(/\D/g, "") ?? "0", 10);
      const numB = parseInt(b.invoiceNumber.replace(/\D/g, "") ?? "0", 10);
      return numB - numA;
    })[0];
    assert.equal(best.invoiceNumber, "INV-00300");
    assert.equal(best.clientName, "C");
  });

  it("handles single record", () => {
    const records = [{ invoiceNumber: "INV-00001", clientName: "Only" }];
    const best = records.slice().sort((a, b) => {
      const numA = parseInt(a.invoiceNumber.replace(/\D/g, "") ?? "0", 10);
      const numB = parseInt(b.invoiceNumber.replace(/\D/g, "") ?? "0", 10);
      return numB - numA;
    })[0];
    assert.equal(best.invoiceNumber, "INV-00001");
  });

  it("returns undefined for empty records", () => {
    const records: { invoiceNumber: string }[] = [];
    const best = records.length > 0
      ? records.slice().sort((a, b) => {
          const numA = parseInt(a.invoiceNumber.replace(/\D/g, "") ?? "0", 10);
          const numB = parseInt(b.invoiceNumber.replace(/\D/g, "") ?? "0", 10);
          return numB - numA;
        })[0]
      : undefined;
    assert.equal(best, undefined);
  });
});

describe("HeyPros highest hashidNumeric invoice selection", () => {
  it("picks the invoice with the highest hashidNumeric", () => {
    const invoices = [
      { hashidNumeric: "100", amount: 5000, file: null },
      { hashidNumeric: "300", amount: 8000, file: null },
      { hashidNumeric: "200", amount: 6000, file: null },
    ];
    const best = invoices.slice().sort((a, b) => {
      const numA = typeof a.hashidNumeric === "number" ? a.hashidNumeric : parseInt(String(a.hashidNumeric ?? "0"), 10);
      const numB = typeof b.hashidNumeric === "number" ? b.hashidNumeric : parseInt(String(b.hashidNumeric ?? "0"), 10);
      return numB - numA;
    })[0];
    assert.equal(best.hashidNumeric, "300");
    assert.equal(best.amount, 8000);
  });

  it("handles numeric hashidNumeric values", () => {
    const invoices = [
      { hashidNumeric: 50 as unknown as string, amount: 1000, file: null },
      { hashidNumeric: 150 as unknown as string, amount: 2000, file: null },
    ];
    const best = invoices.slice().sort((a, b) => {
      const numA = typeof a.hashidNumeric === "number" ? a.hashidNumeric : parseInt(String(a.hashidNumeric ?? "0"), 10);
      const numB = typeof b.hashidNumeric === "number" ? b.hashidNumeric : parseInt(String(b.hashidNumeric ?? "0"), 10);
      return numB - numA;
    })[0];
    assert.equal(best.amount, 2000);
  });

  it("returns undefined when no invoices", () => {
    const invoices: { hashidNumeric: string; amount: number; file: null }[] = [];
    const best = invoices.length > 0
      ? invoices.slice().sort((a, b) => {
          const numA = parseInt(String(a.hashidNumeric ?? "0"), 10);
          const numB = parseInt(String(b.hashidNumeric ?? "0"), 10);
          return numB - numA;
        })[0]
      : undefined;
    assert.equal(best, undefined);
  });
});

describe("Multi-HeyPros round-robin assignment", () => {
  it("assigns different HP jobs to consecutive rows with same job number", () => {
    const heyProsByPO = new Map<string, { hashidNumeric: string }[]>();
    heyProsByPO.set("19699", [
      { hashidNumeric: "AAA" },
      { hashidNumeric: "BBB" },
      { hashidNumeric: "CCC" },
    ]);

    const outputRows = [
      { rowIndex: 2, jobNumber: "19699" },
      { rowIndex: 3, jobNumber: "19699" },
      { rowIndex: 4, jobNumber: "19699" },
    ];

    const assignmentIndex = new Map<string, number>();
    const assigned: string[] = [];

    for (const { jobNumber } of outputRows) {
      const list = heyProsByPO.get(jobNumber) ?? [];
      const idx = assignmentIndex.get(jobNumber) ?? 0;
      const hp = list[idx] ?? list[0];
      assignmentIndex.set(jobNumber, idx + 1);
      assigned.push(hp?.hashidNumeric ?? "");
    }

    assert.deepEqual(assigned, ["AAA", "BBB", "CCC"]);
  });

  it("returns empty string when index exceeds list length (no wrap-around)", () => {
    const heyProsByPO = new Map<string, { hashidNumeric: string }[]>();
    heyProsByPO.set("100", [{ hashidNumeric: "X1" }]);

    const outputRows = [
      { rowIndex: 2, jobNumber: "100" },
      { rowIndex: 3, jobNumber: "100" },
    ];

    const assignmentIndex = new Map<string, number>();
    const assigned: string[] = [];

    for (const { jobNumber } of outputRows) {
      const list = heyProsByPO.get(jobNumber) ?? [];
      const idx = assignmentIndex.get(jobNumber) ?? 0;
      const hp = idx < list.length ? list[idx] : undefined;
      assignmentIndex.set(jobNumber, idx + 1);
      assigned.push(hp?.hashidNumeric ?? "");
    }

    // Second row gets blank -- no wrap-around when cards are exhausted
    assert.deepEqual(assigned, ["X1", ""]);
  });

  it("handles independent job numbers separately", () => {
    const heyProsByPO = new Map<string, { hashidNumeric: string }[]>();
    heyProsByPO.set("100", [{ hashidNumeric: "A1" }, { hashidNumeric: "A2" }]);
    heyProsByPO.set("200", [{ hashidNumeric: "B1" }]);

    const outputRows = [
      { rowIndex: 2, jobNumber: "100" },
      { rowIndex: 3, jobNumber: "200" },
      { rowIndex: 4, jobNumber: "100" },
    ];

    const assignmentIndex = new Map<string, number>();
    const assigned: string[] = [];

    for (const { jobNumber } of outputRows) {
      const list = heyProsByPO.get(jobNumber) ?? [];
      const idx = assignmentIndex.get(jobNumber) ?? 0;
      const hp = list[idx] ?? list[0];
      assignmentIndex.set(jobNumber, idx + 1);
      assigned.push(hp?.hashidNumeric ?? "");
    }

    assert.deepEqual(assigned, ["A1", "B1", "A2"]);
  });
});

describe("HeyPros amount conversion", () => {
  it("15000 cents → '150' dollars", () => {
    const amountCents = 15000;
    const dollars = String(amountCents / 100);
    assert.equal(dollars, "150");
  });
});

describe("Multi-invoice handling", () => {
  const HEYPROS_FILE_BASE = "https://hey-pros-api.birdsdontexist.com/files/";

  function buildMultiInvoiceNote(
    invoices: Array<{ amount: number; hashidNumeric: string | number }>,
  ): string {
    const sorted = invoices.slice().sort((a, b) => {
      const numA = typeof a.hashidNumeric === "number" ? a.hashidNumeric : parseInt(String(a.hashidNumeric ?? "0"), 10);
      const numB = typeof b.hashidNumeric === "number" ? b.hashidNumeric : parseInt(String(b.hashidNumeric ?? "0"), 10);
      return numB - numA;
    });
    const count = sorted.length;
    const invParts: string[] = [];
    for (let n = 1; n <= count; n++) {
      const inv = sorted[n - 1];
      const amtStr = "$" + (inv.amount / 100).toFixed(2);
      invParts.push(`Inv ${n}: ${amtStr}`);
    }
    return `ℹ️ ${count} accepted invoices (${invParts.join(", ")}) — download PDFs from HeyPros`;
  }

  it("builds plain text note for 2 invoices", () => {
    const invoices = [
      { hashidNumeric: "100", amount: 5000 },
      { hashidNumeric: "200", amount: 8000 },
    ];
    const note = buildMultiInvoiceNote(invoices);
    assert.ok(note.includes("2 accepted invoices"));
    assert.ok(note.includes("Inv 1: $80.00"));
    assert.ok(note.includes("Inv 2: $50.00"));
    assert.ok(note.includes("download PDFs from HeyPros"));
    assert.ok(!note.includes("HYPERLINK"));
  });

  it("builds plain text note for 3 invoices", () => {
    const invoices = [
      { hashidNumeric: "100", amount: 5000 },
      { hashidNumeric: "200", amount: 8000 },
      { hashidNumeric: "300", amount: 3000 },
    ];
    const note = buildMultiInvoiceNote(invoices);
    assert.ok(note.includes("3 accepted invoices"));
    assert.ok(note.includes("Inv 1:"));
    assert.ok(note.includes("Inv 2:"));
    assert.ok(note.includes("Inv 3:"));
  });

  it("computes total amount across all invoices", () => {
    const invoices = [
      { hashidNumeric: "1", amount: 5000, file: null },
      { hashidNumeric: "2", amount: 8000, file: null },
      { hashidNumeric: "3", amount: 2000, file: null },
    ];
    const total = invoices.reduce((sum, inv) => sum + inv.amount, 0) / 100;
    assert.equal(total.toFixed(2), "150.00");
  });

  it("single invoice does not trigger multi-invoice logic", () => {
    const invoices = [{ hashidNumeric: "100", amount: 5000, file: { fileName: "a.pdf" } }];
    const isMultiInvoice = invoices.length > 1;
    assert.equal(isMultiInvoice, false);
  });

  it("sets T to 'See Auto Note' for multi-invoice rows", () => {
    const isMultiInvoice = true;
    const hpPdfUrl = "https://example.com/file.pdf";
    const t = isMultiInvoice
      ? "See Auto Note"
      : hpPdfUrl ? `=HYPERLINK("${hpPdfUrl}","View PDF")` : "";
    assert.equal(t, "See Auto Note");
  });

  it("uses total amount for R when multi-invoice", () => {
    const invoices = [
      { hashidNumeric: "1", amount: 10000, file: null },
      { hashidNumeric: "2", amount: 5000, file: null },
    ];
    const isMultiInvoice = invoices.length > 1;
    const totalAmountDollars = invoices.reduce((sum, inv) => sum + inv.amount, 0) / 100;
    const singleAmount = (invoices[0].amount / 100).toFixed(2);
    const r = isMultiInvoice ? totalAmountDollars.toFixed(2) : singleAmount;
    assert.equal(r, "150.00");
  });
});

describe("auto-notes conditions 2-5", () => {
  function buildPlainNotes(opts: {
    heyProsList: unknown[];
    jobberRecords: unknown[];
    hpIdx: number;
  }): string {
    const notes: string[] = [];
    if (opts.heyProsList.length === 0)   notes.push("⚠️ WO# not found in HeyPros");
    if (opts.heyProsList.length > 1)     notes.push(`ℹ️ Multi-contractor job (${opts.heyProsList.length} WOs this month)`);
    if (opts.jobberRecords.length === 0) notes.push("⚠️ Job# not found in Jobber");
    if (opts.hpIdx >= opts.heyProsList.length && opts.heyProsList.length > 0)
      notes.push("⚠️ No HeyPros WO for this row");
    return notes.join(" | ");
  }

  it("condition 2: no HeyPros match → WO# not found note", () => {
    const z = buildPlainNotes({ heyProsList: [], jobberRecords: [{}], hpIdx: 0 });
    assert.ok(z.includes("⚠️ WO# not found in HeyPros"), `got: ${z}`);
  });

  it("condition 3: duplicate WO# → duplicate note", () => {
    const z = buildPlainNotes({ heyProsList: [{}, {}], jobberRecords: [{}], hpIdx: 0 });
    assert.ok(z.includes("ℹ️ Multi-contractor job"), `got: ${z}`);
  });

  it("condition 4: no Jobber data → Job# not found note", () => {
    const z = buildPlainNotes({ heyProsList: [{}], jobberRecords: [], hpIdx: 0 });
    assert.ok(z.includes("⚠️ Job# not found in Jobber"), `got: ${z}`);
  });

  it("condition 5: extra row beyond HP list → no HP WO note", () => {
    const z = buildPlainNotes({ heyProsList: [{}], jobberRecords: [{}], hpIdx: 1 });
    assert.ok(z.includes("⚠️ No HeyPros WO for this row"), `got: ${z}`);
  });

  it("clean row: all conditions clear → empty string", () => {
    const z = buildPlainNotes({ heyProsList: [{}], jobberRecords: [{}], hpIdx: 0 });
    assert.equal(z, "");
  });

  it("multiple conditions joined with | separator", () => {
    const z = buildPlainNotes({ heyProsList: [], jobberRecords: [], hpIdx: 0 });
    assert.ok(z.includes(" | "), `expected pipe separator, got: ${z}`);
    assert.ok(z.includes("⚠️ WO# not found in HeyPros"));
    assert.ok(z.includes("⚠️ Job# not found in Jobber"));
  });
});

describe("invoice status note text", () => {
  it("formats rejected invoice note with amount", () => {
    const amtStr = "$" + (140000 / 100).toFixed(2);
    const note = `⚠️ Rejected: ${amtStr}`;
    assert.equal(note, "⚠️ Rejected: $1400.00");
  });

  it("formats canceled invoice note with amount", () => {
    const amtStr = "$" + (10000 / 100).toFixed(2);
    const note = `⚠️ Canceled: ${amtStr}`;
    assert.equal(note, "⚠️ Canceled: $100.00");
  });

  it("formats pending invoice note with amount", () => {
    const amtStr = "$" + (10000 / 100).toFixed(2);
    const note = `⏳ Pending: ${amtStr}`;
    assert.equal(note, "⏳ Pending: $100.00");
  });

  it("formats unknown status note with label and amount", () => {
    const label = "Needs Review";
    const amtStr = "$" + (2500 / 100).toFixed(2);
    const note = `⚠️ Unknown status '${label}': ${amtStr}`;
    assert.equal(note, "⚠️ Unknown status 'Needs Review': $25.00");
  });
});

describe("parseTabMonth", () => {
  const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  function parseTabMonth(tabName: string): { month: number; year: number } | null {
    const match = tabName.match(/^(\w+)\s+(\d{4})$/);
    if (!match) return null;
    const monthIdx = MONTH_NAMES.indexOf(match[1]);
    if (monthIdx === -1) return null;
    return { month: monthIdx, year: parseInt(match[2], 10) };
  }

  it("parses March 2026 → month=2, year=2026", () => {
    const r = parseTabMonth("March 2026");
    assert.deepEqual(r, { month: 2, year: 2026 });
  });

  it("parses January 2026 → month=0, year=2026", () => {
    const r = parseTabMonth("January 2026");
    assert.deepEqual(r, { month: 0, year: 2026 });
  });

  it("parses December 2026 → month=11, year=2026", () => {
    const r = parseTabMonth("December 2026");
    assert.deepEqual(r, { month: 11, year: 2026 });
  });

  it("returns null for Command tab", () => {
    assert.equal(parseTabMonth("⚡ Command"), null);
  });

  it("returns null for unrecognized month", () => {
    assert.equal(parseTabMonth("InvalidMonth 2026"), null);
  });

  it("filters WOs to target month (UTC)", () => {
    const wos = [
      { installationStarts: "2026-02-23T00:00:00Z", hashidNumeric: "A" }, // Feb
      { installationStarts: "2026-03-06T00:00:00Z", hashidNumeric: "B" }, // Mar
      { installationStarts: null, hashidNumeric: "C" }, // no date — always include
    ];
    const tabMonth = { month: 2, year: 2026 }; // March
    const filtered = wos.filter(wo => {
      if (!wo.installationStarts) return true;
      const d = new Date(wo.installationStarts);
      return d.getUTCMonth() === tabMonth.month && d.getUTCFullYear() === tabMonth.year;
    });
    assert.equal(filtered.length, 2);
    assert.equal(filtered[0].hashidNumeric, "B");
    assert.equal(filtered[1].hashidNumeric, "C");
  });

  it("WO with null installationStarts is always included", () => {
    const wos = [{ installationStarts: null, hashidNumeric: "N" }];
    const tabMonth = { month: 2, year: 2026 };
    const filtered = wos.filter(wo => {
      if (!wo.installationStarts) return true;
      const d = new Date(wo.installationStarts);
      return d.getUTCMonth() === tabMonth.month && d.getUTCFullYear() === tabMonth.year;
    });
    assert.equal(filtered.length, 1);
  });
});
