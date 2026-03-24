/**
 * Cloud Function entry point for KC PP Sync
 * Triggered by Cloud Scheduler via HTTP
 *
 * Option C: Read job numbers from output sheet, then look up in Jobber + HeyPros.
 */

import { loadConfig } from "./config/env.js";
import type { Config } from "./config/env.js";
import { fetchJobsByPurchaseOrders } from "./adapters/heypros.js";
import { fetchJobberJobsByNumbers } from "./adapters/jobber.js";
import { readOutputSheetJobNumbers, batchUpdateAutoColumns } from "./adapters/sheets.js";
import { HEADER_ROW, HEYPROS_FILE_BASE } from "./config/constants.js";

import type { JobberPaidJob, HeyProsJobDetail } from "./config/types.js";
import { formatHeyProsId, formatDate } from "./config/types.js";
import type { Request, Response } from "@google-cloud/functions-framework";

const JOB_STATUS_DISPLAY: Record<string, string> = {
  archived: 'Archived',
  requires_invoicing: 'Requires Invoicing',
  late: 'Late',
  today: 'Today',
  upcoming: 'Upcoming',
  action_required: 'Action Required',
  on_hold: 'On Hold',
  unscheduled: 'Unscheduled',
  active: 'Active',
  expiring_within_30_days: 'Expiring Within 30 Days',
};

const JOB_TYPE_DISPLAY: Record<string, string> = {
  ONE_OFF: 'One-Off',
  RECURRING: 'Recurring',
};

const INVOICE_STATUS_DISPLAY: Record<string, string> = {
  paid: 'Paid',
  awaiting_payment: 'Awaiting Payment',
  past_due: 'Past Due',
  draft: 'Draft',
};

function displayJobStatus(val: string): string {
  return JOB_STATUS_DISPLAY[val] ?? val;
}
function displayJobType(val: string): string {
  return JOB_TYPE_DISPLAY[val] ?? (val ? val.charAt(0).toUpperCase() + val.slice(1).toLowerCase() : '');
}
function displayInvoiceStatus(val: string): string {
  return INVOICE_STATUS_DISPLAY[val] ?? val;
}

function formatAmount(cents: number): string {
  return (cents / 100).toFixed(2);
}

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

/**
 * Parse a tab name like "March 2026" into { month: 2 (0-indexed), year: 2026 }.
 * Returns null if the tab name doesn't match the expected format.
 */
function parseTabMonth(tabName: string): { month: number; year: number } | null {
  const match = tabName.match(/^(\w+)\s+(\d{4})$/);
  if (!match) return null;
  const monthIdx = MONTH_NAMES.indexOf(match[1]);
  if (monthIdx === -1) return null;
  return { month: monthIdx, year: parseInt(match[2], 10) };
}

/**
 * Option C flow: source-sheet driven sync.
 * Reads job numbers from the output sheet, fetches data, and batch-updates auto columns only.
 */
async function runSourceSheetFlow(config: Config): Promise<{ updateCount: number; jobCount: number }> {
  // 1. Read job numbers from output sheet
  console.log("Step 1: Reading job numbers from output sheet...");
  const outputRows = await readOutputSheetJobNumbers(
    config.sheets.spreadsheetId,
    config.sheets.sheetsTab,
    "F2:F500",
  );
  if (outputRows.length === 0) {
    console.log("  No job numbers found — nothing to sync");
    return { updateCount: 0, jobCount: 0 };
  }
  const uniqueJobNumbers = [...new Set(outputRows.map((r) => r.jobNumber))];
  console.log(`  → ${outputRows.length} rows, ${uniqueJobNumbers.length} unique job numbers`);

  // 2. Fetch Jobber jobs by number
  const jobberJobs = await fetchJobberJobsByNumbers(config, uniqueJobNumbers);
  console.log(`  → ${jobberJobs.length} Jobber records, `);

  // Index Jobber jobs by jobNumber
  const jobberByNumber = new Map<string, JobberPaidJob[]>();
  for (const j of jobberJobs) {
    const existing = jobberByNumber.get(j.jobNumber) ?? [];
    existing.push(j);
    jobberByNumber.set(j.jobNumber, existing);
  }

  // 3. Fetch HeyPros jobs by purchase order
  const heyProsJobs = await fetchJobsByPurchaseOrders(config, uniqueJobNumbers);
  console.log(`${heyProsJobs.length} HeyPros job matches`);

  const heyProsByPO = new Map<string, HeyProsJobDetail[]>();
  for (const hp of heyProsJobs) {
    const po = hp.purchaseOrder?.trim();
    if (po) {
      const existing = heyProsByPO.get(po) ?? [];
      existing.push(hp);
      heyProsByPO.set(po, existing);
    }
  }

  // Sort each PO's HeyPros cards by installationStarts ascending (oldest first)
  for (const [, list] of heyProsByPO) {
    list.sort((a, b) => {
      const da = a.installationStarts ? new Date(a.installationStarts).getTime() : 0;
      const db = b.installationStarts ? new Date(b.installationStarts).getTime() : 0;
      return da - db;
    });
  }

  // 4. Build per-row updates (auto columns only)
  const updates: Array<{ rowIndex: number; values: Record<string, string> }> = [];

  // Parse target month from tab name for month-filtered WO assignment
  const tabMonth = parseTabMonth(config.sheets.sheetsTab);

  const heyProsAssignmentIndex = new Map<string, number>();

  for (const { rowIndex, jobNumber } of outputRows) {
    const jobberRecords = jobberByNumber.get(jobNumber) ?? [];
    const heyProsList = heyProsByPO.get(jobNumber) ?? [];

    // Filter WOs to those whose installationStarts falls within the target month.
    // WOs with no installationStarts are always included (conservative).
    const filteredList = tabMonth
      ? heyProsList.filter(wo => {
          if (!wo.installationStarts) return true;
          const d = new Date(wo.installationStarts);
          return d.getUTCMonth() === tabMonth.month && d.getUTCFullYear() === tabMonth.year;
        })
      : heyProsList;

    const hpIdx = heyProsAssignmentIndex.get(jobNumber) ?? 0;
    const heyPros = hpIdx < filteredList.length ? filteredList[hpIdx] : undefined;
    heyProsAssignmentIndex.set(jobNumber, hpIdx + 1);
    const allInvoices = heyPros?.jobInvoices ?? [];
    const KNOWN_STATUSES = ["Accepted", "Rejected", "Canceled", "Pending Approval"];
    const acceptedInvoices = allInvoices.filter(inv => inv.status?.label === "Accepted");
    const rejectedInvoices = allInvoices.filter(inv => inv.status?.label === "Rejected");
    const canceledInvoices = allInvoices.filter(inv => inv.status?.label === "Canceled");
    const pendingInvoices = allInvoices.filter(inv => inv.status?.label === "Pending Approval");
    const unknownInvoices = allInvoices.filter(inv =>
      inv.status?.label != null && !KNOWN_STATUSES.includes(inv.status.label)
    );

    const sortedInvoices = acceptedInvoices.slice().sort((a, b) => {
      const numA = typeof a.hashidNumeric === "number" ? a.hashidNumeric : parseInt(String(a.hashidNumeric ?? "0"), 10);
      const numB = typeof b.hashidNumeric === "number" ? b.hashidNumeric : parseInt(String(b.hashidNumeric ?? "0"), 10);
      return numB - numA;
    });
    const hpInvoice = sortedInvoices.length > 0 ? sortedInvoices[0] : undefined;
    const isMultiInvoice = acceptedInvoices.length > 1;
    const totalAmountDollars = acceptedInvoices.reduce((sum, inv) => sum + inv.amount, 0) / 100;

    const hpHashidNumeric = heyPros?.hashidNumeric ?? "";
    const hpInvoiceHashidNumeric = hpInvoice?.hashidNumeric ?? "";
    const hpInvoiceAmountDollars = hpInvoice ? formatAmount(hpInvoice.amount) : "";
    const hpPdfUrl = hpInvoice?.file?.fileName
      ? `${HEYPROS_FILE_BASE}${hpInvoice.file.fileName}`
      : "";

    // Pick Jobber record with highest invoiceNumber
    const inv = jobberRecords.length > 0
      ? jobberRecords.slice().sort((a, b) => {
          const numA = parseInt(a.invoiceNumber?.replace(/\D/g, "") ?? "0", 10);
          const numB = parseInt(b.invoiceNumber?.replace(/\D/g, "") ?? "0", 10);
          return numB - numA;
        })[0]
      : undefined;
    const contractor = heyPros?.ostensibleWinnerUser ?? heyPros?.attachedContractors?.[0] ?? null;

    const values: Record<string, string> = {
      A: heyPros?.installationStarts ? formatDate(heyPros.installationStarts) : "",
      C: contractor?.companyName ?? "",
      D: contractor ? `${contractor.firstName} ${contractor.lastName}`.trim() : "",
      E: heyPros?.hashid && hpHashidNumeric
        ? `=HYPERLINK("https://kc-power-clean.heypros.com/job/${heyPros.hashid}","${formatHeyProsId(hpHashidNumeric)}")`
        : formatHeyProsId(hpHashidNumeric),
      G: inv?.jobberWebUri ? `=HYPERLINK("${inv.jobberWebUri}","View Job")` : "",
      H: inv?.jobStatus ? displayJobStatus(inv.jobStatus) : "",
      I: inv?.jobType ? displayJobType(inv.jobType) : "",
      J: inv?.clientWebUri && inv.clientName
        ? `=HYPERLINK("${inv.clientWebUri}","${(inv.clientName ?? "").replace(/"/g, '""')}")`
        : inv?.clientName ?? "",
      K: inv?.division ?? "",
      L: inv?.invoiceWebUri && inv.invoiceNumber
        ? `=HYPERLINK("${inv.invoiceWebUri}","${inv.invoiceNumber}")`
        : inv?.invoiceNumber ?? "",
      M: inv ? (inv.amount === 0 ? "" : String(inv.amount)) : "",
      N: inv?.issuedDate ? formatDate(inv.issuedDate) : "",
      O: inv?.invoiceStatus ? displayInvoiceStatus(inv.invoiceStatus) : "",
      P: inv?.invoiceStatus === "paid" && inv.paidDate ? formatDate(inv.paidDate) : "",
      Q: formatHeyProsId(hpInvoiceHashidNumeric),
      R: acceptedInvoices.length === 0 ? "" : (isMultiInvoice ? totalAmountDollars.toFixed(2) : hpInvoiceAmountDollars),
      T: acceptedInvoices.length === 0 ? ""
        : isMultiInvoice ? "See Auto Note"
        : hpPdfUrl ? '=HYPERLINK("' + hpPdfUrl + '","View PDF")' : '',
      Z: "",
    };

    // Build Z auto notes
    const plainParts: string[] = [];     // for plain text auto-notes

    // Condition 1: multi-accepted (2+ accepted invoices)
    if (isMultiInvoice) {
      const count = sortedInvoices.length;
      const invParts: string[] = [];
      for (let n = 1; n <= count; n++) {
        const sinv = sortedInvoices[n - 1];
        const amtStr = "$" + (sinv.amount / 100).toFixed(2);
        invParts.push(`Inv ${n}: ${amtStr}`);
      }
      plainParts.push(`ℹ️ ${count} accepted invoices (${invParts.join(", ")}) — download PDFs from HeyPros`);
    }

    // Condition 2: rejected invoices
    for (const rinv of rejectedInvoices) {
      const amtStr = "$" + (rinv.amount / 100).toFixed(2);
      plainParts.push(`⚠️ Rejected: ${amtStr}`);
    }

    // Condition 3: canceled invoices
    for (const cinv of canceledInvoices) {
      const amtStr = "$" + (cinv.amount / 100).toFixed(2);
      plainParts.push(`⚠️ Canceled: ${amtStr}`);
    }

    // Condition 4: pending invoices
    for (const pinv of pendingInvoices) {
      const amtStr = "$" + (pinv.amount / 100).toFixed(2);
      plainParts.push(`⏳ Pending: ${amtStr}`);
    }

    // Condition 5: unknown status invoices
    for (const uinv of unknownInvoices) {
      const label = uinv.status?.label ?? "unknown";
      const amtStr = "$" + (uinv.amount / 100).toFixed(2);
      plainParts.push(`⚠️ Unknown status '${label}': ${amtStr}`);
    }

    // Condition 6: no HeyPros match
    if (heyProsList.length === 0) plainParts.push("⚠️ WO# not found in HeyPros");

    // Condition 7: multiple WOs in this month (multi-contractor job)
    if (filteredList.length > 1) plainParts.push(`ℹ️ Multi-contractor job (${filteredList.length} WOs this month)`);

    // Condition 8: no Jobber data
    if (jobberRecords.length === 0) plainParts.push("⚠️ Job# not found in Jobber");

    // Condition 9: extra row beyond filtered HP list
    if (hpIdx >= filteredList.length && filteredList.length > 0) plainParts.push("⚠️ No HeyPros WO for this row");

    // Assemble Z value — plain text only, joined with pipe separator
    values.Z = plainParts.length > 0 ? plainParts.join(" | ") : "";

    updates.push({ rowIndex, values });
  }

  // 5. Batch update auto columns
  if (config.sheets.dryRun) {
    console.log("\n  Sheets [DRY RUN] — would update these rows:");
    for (const u of updates) {
      console.log(`    Row ${u.rowIndex}: ${JSON.stringify(u.values)}`);
    }
  } else {
    await batchUpdateAutoColumns(config.sheets.spreadsheetId, config.sheets.sheetsTab, updates);
    console.log(`  Sheets: updated ${updates.length} rows`);
  }

  return { updateCount: updates.length, jobCount: uniqueJobNumbers.length };
}

export async function kcPPSync(req: Request, res: Response): Promise<void> {
  const startTime = Date.now();

  try {
    console.log("KC PP Sync — triggered");

    const config = loadConfig();

    // Allow caller to override the target tab via request body: { tab: "January 2026" }
    const bodyTab = req.body?.tab;
    if (bodyTab && typeof bodyTab === "string") {
      config.sheets.sheetsTab = bodyTab;
    }

    const { updateCount, jobCount } = await runSourceSheetFlow(config);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const summary = {
      status: "ok",
      elapsed: `${elapsed}s`,
      jobNumbers: jobCount,
      updatedRows: updateCount,
      spreadsheetId: config.sheets.dryRun ? null : config.sheets.spreadsheetId,
    };
    console.log(`Done in ${elapsed}s`, JSON.stringify(summary));
    res.status(200).json(summary);
  } catch (err) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const message = err instanceof Error ? err.message : String(err);
    console.error(`FATAL (${elapsed}s): ${message}`);
    res.status(500).json({ status: "error", elapsed: `${elapsed}s`, error: message });
  }
}
