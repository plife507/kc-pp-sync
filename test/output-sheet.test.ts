import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  AUTO_COL_LETTERS_LEGACY,
  AUTO_COL_LETTERS_NEW,
  buildReleasedBelowSubInvoiceFormula,
} from "../src/adapters/sheets.js";

describe("AUTO_COL_LETTERS_LEGACY", () => {
  it("contains shifted auto columns: F,H,I,J,K,L,M,N,O,P,Q,R,S,U,AA", () => {
    for (const col of ["F", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "U", "AA"]) {
      assert.ok(AUTO_COL_LETTERS_LEGACY.has(col), `expected ${col} to be in AUTO_COL_LETTERS_LEGACY`);
    }
  });

  it("does not contain G (job number is manual — was F before margin insert)", () => {
    assert.equal(AUTO_COL_LETTERS_LEGACY.has("G"), false);
  });

  it("contains A,C,D,E (date + margin + contractor fields — auto)", () => {
    for (const col of ["A", "C", "D", "E"]) {
      assert.ok(AUTO_COL_LETTERS_LEGACY.has(col), `expected ${col} to be in AUTO_COL_LETTERS_LEGACY`);
    }
  });

  it("does not contain B,G,T,V,W,X,Y,Z (manual columns)", () => {
    for (const col of ["B", "G", "T", "V", "W", "X", "Y", "Z"]) {
      assert.equal(AUTO_COL_LETTERS_LEGACY.has(col), false, `expected ${col} NOT to be in AUTO_COL_LETTERS_LEGACY`);
    }
  });

  it("has exactly 19 auto columns", () => {
    assert.equal(AUTO_COL_LETTERS_LEGACY.size, 19);
  });
});

describe("AUTO_COL_LETTERS_NEW", () => {
  it("contains shifted auto columns including tracker block", () => {
    for (const col of ["A", "C", "D", "E", "F", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "S", "Y"]) {
      assert.ok(AUTO_COL_LETTERS_NEW.has(col), `expected ${col} to be in AUTO_COL_LETTERS_NEW`);
    }
    // Tracker slots Z-AN
    for (const col of ["Z", "AA", "AB", "AC", "AD", "AE", "AF", "AG", "AH", "AI", "AJ", "AK", "AL", "AM", "AN"]) {
      assert.ok(AUTO_COL_LETTERS_NEW.has(col), `expected tracker col ${col} to be in AUTO_COL_LETTERS_NEW`);
    }
  });

  it("does not contain new manual columns B,G,R,T,U,V,W,X", () => {
    for (const col of ["B", "G", "R", "T", "U", "V", "W", "X"]) {
      assert.equal(AUTO_COL_LETTERS_NEW.has(col), false, `expected ${col} NOT to be in AUTO_COL_LETTERS_NEW`);
    }
  });
});

describe("buildReleasedBelowSubInvoiceFormula", () => {
  it("normalizes numeric and currency-text amount cells before comparing", () => {
    assert.equal(
      buildReleasedBelowSubInvoiceFormula("Q", "R"),
      '=AND(IFERROR(VALUE(REGEXREPLACE(TO_TEXT($Q2),"[^0-9.-]","")),0)>0,LEN($R2&"")>0,IFERROR(VALUE(REGEXREPLACE(TO_TEXT($R2),"[^0-9.-]","")),0)<IFERROR(VALUE(REGEXREPLACE(TO_TEXT($Q2),"[^0-9.-]","")),0))',
    );
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
      values: { F: "hp-id", H: "jobber-link", U: "https://example.com/file.pdf" } as Record<string, string>,
    };

    const refs: string[] = [];
    for (const [col] of Object.entries(update.values)) {
      if (AUTO_COL_LETTERS_LEGACY.has(col)) {
        refs.push(`${tab}!${col}${update.rowIndex}`);
      }
    }

    assert.deepEqual(refs, ["Sheet1!F3", "Sheet1!H3", "Sheet1!U3"]);
  });

  it("skips non-auto columns in values", () => {
    const tab = "Sheet1";
    const update = {
      rowIndex: 2,
      values: { E: "hp-id", G: "should-be-ignored", H: "Client" } as Record<string, string>,
    };

    const refs: string[] = [];
    for (const [col] of Object.entries(update.values)) {
      if (AUTO_COL_LETTERS_LEGACY.has(col)) {
        refs.push(`${tab}!${col}${update.rowIndex}`);
      }
    }

    // G (Job#) should be excluded — manual column
    assert.deepEqual(refs, ["Sheet1!E2", "Sheet1!H2"]);
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

  it("returns null for Command UI tab", () => {
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

describe("Margin % calculation (col C)", () => {
  /**
   * Replicates the margin second-pass logic from function.ts.
   * Takes updates with _jobNumber, useNewLayout flag, and computes margin on values.C.
   */
  function computeMargins(
    updates: Array<{ rowIndex: number; values: Record<string, string>; _jobNumber: string }>,
    useNewLayout: boolean,
  ) {
    const marginJobGroups = new Map<string, typeof updates>();
    for (const u of updates) {
      const jn = u._jobNumber;
      if (!jn) continue;
      const group = marginJobGroups.get(jn) ?? [];
      group.push(u);
      marginJobGroups.set(jn, group);
    }

    const subInvCol = useNewLayout ? "Q" : "S";
    const autoNotesCol = useNewLayout ? "Y" : "AA";

    for (const [, group] of marginJobGroups) {
      const division = group[0].values.L ?? "";
      if (division === "Hybrid") {
        for (const u of group) u.values.C = "";
        continue;
      }

      let isPaid: boolean;
      if (useNewLayout) {
        isPaid = group[0].values.O === "✅";
      } else {
        isPaid = group.some(u => u.values.P?.toLowerCase() === "paid");
      }

      const totalInvoicedStr = group[0].values.N ?? "";
      const totalInvoiced = parseFloat(totalInvoicedStr);

      if (!isPaid || !totalInvoiced || isNaN(totalInvoiced) || totalInvoiced === 0) {
        for (const u of group) u.values.C = "";
        continue;
      }

      let totalSubAmount = 0;
      for (const u of group) {
        const raw = u.values[subInvCol] ?? "";
        const parsed = parseFloat(raw.replace(/[$,]/g, ""));
        if (!isNaN(parsed)) totalSubAmount += parsed;
      }

      if (totalSubAmount === 0) {
        for (const u of group) u.values.C = "";
        continue;
      }

      const margin = ((totalInvoiced - totalSubAmount) / totalInvoiced) * 100;
      const marginStr = margin.toFixed(1) + "%";
      for (const u of group) u.values.C = marginStr;

      if (group.length > 1) {
        const subParts = group.map(u => {
          const raw = u.values[subInvCol] ?? "0";
          const parsed = parseFloat(raw.replace(/[$,]/g, ""));
          return "$" + (isNaN(parsed) ? "0.00" : parsed.toFixed(2));
        });
        const note = `📊 Job margin ${marginStr} — ${group.length} subs: ${subParts.join(" + ")} = $${totalSubAmount.toFixed(2)} / $${totalInvoiced.toFixed(2)}`;
        for (const u of group) {
          u.values[autoNotesCol] = u.values[autoNotesCol]
            ? `${u.values[autoNotesCol]} | ${note}`
            : note;
        }
      }
    }
  }

  it("single contractor paid → correct margin (70.0%)", () => {
    const updates = [{
      rowIndex: 2,
      _jobNumber: "100",
      values: { C: "", L: "Residential", N: "1000.00", O: "✅", Q: "300.00", Y: "" } as Record<string, string>,
    }];
    computeMargins(updates, true);
    assert.equal(updates[0].values.C, "70.0%");
  });

  it("single contractor unpaid → blank", () => {
    const updates = [{
      rowIndex: 2,
      _jobNumber: "100",
      values: { C: "", L: "Residential", N: "1000.00", O: "❌", Q: "300.00", Y: "" } as Record<string, string>,
    }];
    computeMargins(updates, true);
    assert.equal(updates[0].values.C, "");
  });

  it("multi-contractor (2 rows same job#) → same margin on both + auto note", () => {
    const updates = [
      {
        rowIndex: 2,
        _jobNumber: "200",
        values: { C: "", L: "Commercial", N: "2000.00", O: "✅", Q: "400.00", Y: "" } as Record<string, string>,
      },
      {
        rowIndex: 3,
        _jobNumber: "200",
        values: { C: "", L: "Commercial", N: "2000.00", O: "✅", Q: "600.00", Y: "" } as Record<string, string>,
      },
    ];
    computeMargins(updates, true);
    // Total sub = 400 + 600 = 1000, margin = (2000-1000)/2000 = 50%
    assert.equal(updates[0].values.C, "50.0%");
    assert.equal(updates[1].values.C, "50.0%");
    // Both should have margin auto note
    assert.ok(updates[0].values.Y.includes("📊 Job margin 50.0%"));
    assert.ok(updates[0].values.Y.includes("2 subs"));
    assert.ok(updates[1].values.Y.includes("📊 Job margin 50.0%"));
  });

  it("Hybrid division → empty string", () => {
    const updates = [{
      rowIndex: 2,
      _jobNumber: "300",
      values: { C: "", L: "Hybrid", N: "1000.00", O: "✅", Q: "300.00", Y: "" } as Record<string, string>,
    }];
    computeMargins(updates, true);
    assert.equal(updates[0].values.C, "");
  });

  it("Total Invoiced = 0 → blank", () => {
    const updates = [{
      rowIndex: 2,
      _jobNumber: "400",
      values: { C: "", L: "Residential", N: "0", O: "✅", Q: "300.00", Y: "" } as Record<string, string>,
    }];
    computeMargins(updates, true);
    assert.equal(updates[0].values.C, "");
  });

  it("Sub Invoice Amount = 0 → blank (no sub invoice data)", () => {
    const updates = [{
      rowIndex: 2,
      _jobNumber: "500",
      values: { C: "", L: "Residential", N: "1000.00", O: "✅", Q: "", Y: "" } as Record<string, string>,
    }];
    computeMargins(updates, true);
    assert.equal(updates[0].values.C, "");
  });

  it("negative margin (sub exceeds invoiced) → shows negative", () => {
    const updates = [{
      rowIndex: 2,
      _jobNumber: "600",
      values: { C: "", L: "Residential", N: "500.00", O: "✅", Q: "800.00", Y: "" } as Record<string, string>,
    }];
    computeMargins(updates, true);
    assert.equal(updates[0].values.C, "-60.0%");
  });

  it("legacy layout: paid invoice status → correct margin", () => {
    const updates = [{
      rowIndex: 2,
      _jobNumber: "700",
      values: { C: "", L: "Residential", N: "1000.00", P: "Paid", S: "250.00", AA: "" } as Record<string, string>,
    }];
    computeMargins(updates, false);
    assert.equal(updates[0].values.C, "75.0%");
  });

  it("legacy layout: unpaid invoice status → blank", () => {
    const updates = [{
      rowIndex: 2,
      _jobNumber: "800",
      values: { C: "", L: "Residential", N: "1000.00", P: "Awaiting Payment", S: "250.00", AA: "" } as Record<string, string>,
    }];
    computeMargins(updates, false);
    assert.equal(updates[0].values.C, "");
  });
});

// --- parsePurchaseOrder tests ---

import { parsePurchaseOrder } from "../src/adapters/heypros.js";

describe("parsePurchaseOrder", () => {
  it("single job number passthrough", () => {
    assert.deepEqual(parsePurchaseOrder("19633"), ["19633"]);
  });

  it("space-separated dual job numbers", () => {
    assert.deepEqual(parsePurchaseOrder("19616 19659"), ["19616", "19659"]);
  });

  it("another space-separated pair", () => {
    assert.deepEqual(parsePurchaseOrder("19693 19694"), ["19693", "19694"]);
  });

  it("slash-separated relative shorthand", () => {
    assert.deepEqual(parsePurchaseOrder("19353 / 54"), ["19353", "19354"]);
  });

  it("Job # prefix (single)", () => {
    assert.deepEqual(parsePurchaseOrder("Job #19553"), ["19553"]);
  });

  it("Job # prefix with extra space", () => {
    assert.deepEqual(parsePurchaseOrder("Job # 19551"), ["19551"]);
  });

  it("null/undefined/empty returns empty array", () => {
    assert.deepEqual(parsePurchaseOrder(null), []);
    assert.deepEqual(parsePurchaseOrder(undefined), []);
    assert.deepEqual(parsePurchaseOrder(""), []);
    assert.deepEqual(parsePurchaseOrder("  "), []);
  });

  it("comma-separated", () => {
    assert.deepEqual(parsePurchaseOrder("19616,19659"), ["19616", "19659"]);
  });

  it("linked job description (real production data)", () => {
    // PO="19653 19639" from HP:E20Q6k
    assert.deepEqual(parsePurchaseOrder("19653 19639"), ["19653", "19639"]);
  });
});
