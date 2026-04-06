/**
 * Cloud Function entry point for KC PP Sync
 * Triggered by Cloud Scheduler via HTTP
 *
 * Option C: Read job numbers from output sheet, then look up in Jobber + HeyPros.
 */
import { loadConfig, resolveMode } from "./config/env.js";
import { fetchJobsByPurchaseOrders } from "./adapters/heypros.js";
import { fetchJobberJobsByNumbers } from "./adapters/jobber.js";
import { readOutputSheetJobNumbers, batchUpdateAutoColumns, refreshGTPTab, readRecurringTabRows, batchUpdateRecurringColumns, isNewLayout, formatLinkColumns, refreshDashboard, extendTabCF } from "./adapters/sheets.js";
import { HEYPROS_FILE_BASE } from "./config/constants.js";
import { formatHeyProsId, formatDate } from "./config/types.js";
import { logSyncResult } from "./adapters/sheets.js";
const JOB_STATUS_DISPLAY = {
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
const JOB_TYPE_DISPLAY = {
    ONE_OFF: 'One-Off',
    RECURRING: 'Recurring',
};
const INVOICE_STATUS_DISPLAY = {
    paid: 'Paid',
    awaiting_payment: 'Awaiting Payment',
    past_due: 'Past Due',
    draft: 'Draft',
};
function displayJobStatus(val) {
    return JOB_STATUS_DISPLAY[val] ?? val;
}
function displayJobType(val) {
    return JOB_TYPE_DISPLAY[val] ?? (val ? val.charAt(0).toUpperCase() + val.slice(1).toLowerCase() : '');
}
function displayInvoiceStatus(val) {
    return INVOICE_STATUS_DISPLAY[val] ?? val;
}
function formatAmount(cents) {
    return (cents / 100).toFixed(2);
}
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
/**
 * Parse a tab name into { month, year }.
 * Supports both formats:
 *   - Legacy: "March 2026" → { month: 2, year: 2026 }
 *   - New: "March" → { month: 2, year: <current year> }
 * Returns null if the tab name doesn't match.
 */
function parseTabMonth(tabName) {
    // Try legacy format first: "Month Year"
    const legacyMatch = tabName.match(/^(\w+)\s+(\d{4})$/);
    if (legacyMatch) {
        const monthIdx = MONTH_NAMES.indexOf(legacyMatch[1]);
        if (monthIdx === -1)
            return null;
        return { month: monthIdx, year: parseInt(legacyMatch[2], 10) };
    }
    // Try new format: just "Month"
    const monthIdx = MONTH_NAMES.indexOf(tabName);
    if (monthIdx !== -1) {
        // Use current year in LA timezone (KC operates in LA)
        const now = new Date();
        const parts = new Intl.DateTimeFormat("en-US", {
            timeZone: "America/Los_Angeles",
            year: "numeric",
        }).formatToParts(now);
        const year = parseInt(parts.find(p => p.type === "year")?.value ?? String(now.getFullYear()), 10);
        return { month: monthIdx, year };
    }
    return null;
}
/**
 * Option C flow: source-sheet driven sync.
 * Reads job numbers from the output sheet, fetches data, and batch-updates auto columns only.
 */
async function runSourceSheetFlow(config) {
    // 1. Read job numbers from output sheet
    console.log("Step 1: Reading job numbers from output sheet...");
    const outputRows = await readOutputSheetJobNumbers(config.sheets.spreadsheetId, config.sheets.sheetsTab);
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
    const jobberByNumber = new Map();
    for (const j of jobberJobs) {
        const existing = jobberByNumber.get(j.jobNumber) ?? [];
        existing.push(j);
        jobberByNumber.set(j.jobNumber, existing);
    }
    // 3. Fetch HeyPros jobs by purchase order
    const heyProsJobs = await fetchJobsByPurchaseOrders(config, uniqueJobNumbers);
    console.log(`${heyProsJobs.length} HeyPros job matches`);
    const heyProsByPO = new Map();
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
    const updates = [];
    // Parse target month from tab name for month-filtered WO assignment
    const tabMonth = parseTabMonth(config.sheets.sheetsTab);
    // Detect layout: new (March+) or legacy (Jan/Feb)
    const useNewLayout = isNewLayout(config.sheets.sheetsTab);
    const heyProsAssignmentIndex = new Map();
    for (const { rowIndex, jobNumber, existingInvoiceValue } of outputRows) {
        const jobberRecords = jobberByNumber.get(jobNumber) ?? [];
        const heyProsList = heyProsByPO.get(jobNumber) ?? [];
        // Filter WOs to those whose installationStarts falls within the target month.
        // WOs with no installationStarts are always included (conservative).
        const filteredList = tabMonth
            ? heyProsList.filter(wo => {
                if (!wo.installationStarts)
                    return true;
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
        const unknownInvoices = allInvoices.filter(inv => inv.status?.label != null && !KNOWN_STATUSES.includes(inv.status.label));
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
        // Legacy layout manual hold: check if Invoice # column has "-" in the sheet
        const isManualInvoiceHold = !useNewLayout && existingInvoiceValue === "-";
        // Common fields (same columns in both layouts: A–K)
        const values = {
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
        };
        if (useNewLayout) {
            // ──────── NEW LAYOUT (March+): A–AM ────────
            // L = # of Invoices, M = Total Invoiced, N = All Paid?
            const allJobberInvoices = jobberRecords.flatMap(j => j.invoiceNumber ? [j] : []);
            // Deduplicate by invoiceNumber (same job may appear multiple times in jobberRecords)
            const uniqueInvoices = new Map();
            for (const j of allJobberInvoices) {
                if (j.invoiceNumber && !uniqueInvoices.has(j.invoiceNumber)) {
                    uniqueInvoices.set(j.invoiceNumber, j);
                }
            }
            const invoiceList = [...uniqueInvoices.values()];
            values.L = invoiceList.length > 0 ? String(invoiceList.length) : "0";
            values.M = invoiceList.length > 0
                ? invoiceList.reduce((sum, j) => sum + j.amount, 0).toFixed(2)
                : "";
            const allPaid = invoiceList.length > 0 && invoiceList.every(j => j.invoiceStatus === "paid");
            values.N = invoiceList.length === 0 ? "" : (allPaid ? "✅" : "❌");
            // O = HeyPros Invoice # (was Q)
            values.O = formatHeyProsId(hpInvoiceHashidNumeric);
            // P = Sub Invoice Amount (was R)
            values.P = acceptedInvoices.length === 0 ? "" : (isMultiInvoice ? totalAmountDollars.toFixed(2) : hpInvoiceAmountDollars);
            // R = Contractor Invoice PDF (was T)
            values.R = acceptedInvoices.length === 0 ? ""
                : isMultiInvoice ? "See Auto Note"
                    : hpPdfUrl ? '=HYPERLINK("' + hpPdfUrl + '","View PDF")' : '';
            // Invoice Tracker Block (Y–AM): 5 slots × 3 cols
            const trackerCols = [
                ["Y", "Z", "AA"], // slot 1
                ["AB", "AC", "AD"], // slot 2
                ["AE", "AF", "AG"], // slot 3
                ["AH", "AI", "AJ"], // slot 4
                ["AK", "AL", "AM"], // slot 5
            ];
            // Sort invoices by invoice number ascending (slot 1 = first/oldest)
            const sortedJobberInvoices = invoiceList.slice().sort((a, b) => {
                const numA = parseInt(a.invoiceNumber?.replace(/\D/g, "") ?? "0", 10);
                const numB = parseInt(b.invoiceNumber?.replace(/\D/g, "") ?? "0", 10);
                return numA - numB;
            });
            for (let slot = 0; slot < 5; slot++) {
                const [colNum, colAmt, colPaid] = trackerCols[slot];
                const ji = sortedJobberInvoices[slot];
                if (ji) {
                    values[colNum] = ji.invoiceWebUri
                        ? `=HYPERLINK("${ji.invoiceWebUri}","${ji.invoiceNumber}")`
                        : ji.invoiceNumber;
                    values[colAmt] = ji.amount > 0 ? ji.amount.toFixed(2) : "";
                    values[colPaid] = ji.invoiceStatus === "paid" ? "✅" : "❌";
                }
                else {
                    values[colNum] = "";
                    values[colAmt] = "";
                    values[colPaid] = "";
                }
            }
            // X = Auto Notes (was Z)
            values.X = "";
        }
        else {
            // ──────── LEGACY LAYOUT (Jan/Feb): A–Z ────────
            values.Q = formatHeyProsId(hpInvoiceHashidNumeric);
            values.R = acceptedInvoices.length === 0 ? "" : (isMultiInvoice ? totalAmountDollars.toFixed(2) : hpInvoiceAmountDollars);
            values.T = acceptedInvoices.length === 0 ? ""
                : isMultiInvoice ? "See Auto Note"
                    : hpPdfUrl ? '=HYPERLINK("' + hpPdfUrl + '","View PDF")' : '';
            values.Z = "";
            // Only populate invoice columns (L, M, N, O, P) when NOT in manual hold mode
            if (!isManualInvoiceHold) {
                values.L = inv?.invoiceWebUri && inv.invoiceNumber
                    ? `=HYPERLINK("${inv.invoiceWebUri}","${inv.invoiceNumber}")`
                    : inv?.invoiceNumber ?? "";
                values.M = inv ? (inv.amount === 0 ? "" : String(inv.amount)) : "";
                values.N = inv?.issuedDate ? formatDate(inv.issuedDate) : "";
                values.O = inv?.invoiceStatus ? displayInvoiceStatus(inv.invoiceStatus) : "";
                values.P = inv?.invoiceStatus === "paid" && inv.paidDate ? formatDate(inv.paidDate) : "";
            }
        }
        // Auto notes column: X for new layout, Z for legacy
        const autoNotesCol = useNewLayout ? "X" : "Z";
        const plainParts = []; // for plain text auto-notes
        // Condition 1: multi-accepted (2+ accepted invoices)
        if (isMultiInvoice) {
            const count = sortedInvoices.length;
            const invParts = [];
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
        if (heyProsList.length === 0)
            plainParts.push("⚠️ WO# not found in HeyPros");
        // Condition 7: multiple WOs in this month (multi-contractor job)
        if (filteredList.length > 1)
            plainParts.push(`ℹ️ Multi-contractor job (${filteredList.length} WOs this month)`);
        // Condition 8: no Jobber data
        if (jobberRecords.length === 0)
            plainParts.push("⚠️ Job# not found in Jobber");
        // Condition 9: extra row beyond filtered HP list
        if (hpIdx >= filteredList.length && filteredList.length > 0)
            plainParts.push("⚠️ No HeyPros WO for this row");
        // Condition 10: manual invoice hold (legacy only)
        if (isManualInvoiceHold)
            plainParts.push("⏸️ Manual invoice hold (L = \"-\")");
        // New layout extra notes
        if (useNewLayout) {
            const allJobberInvoices2 = jobberRecords.flatMap(j => j.invoiceNumber ? [j] : []);
            const uniqueInvCount = new Set(allJobberInvoices2.map(j => j.invoiceNumber)).size;
            if (uniqueInvCount > 5) {
                plainParts.push(`⚠️ Job has ${uniqueInvCount} invoices — only first 5 shown in tracker`);
            }
            if (uniqueInvCount > 1) {
                const paidCount = allJobberInvoices2.filter(j => j.invoiceStatus === "paid").length;
                const unpaidCount = uniqueInvCount - paidCount;
                if (unpaidCount > 0 && paidCount > 0) {
                    plainParts.push(`🔴 ${unpaidCount} of ${uniqueInvCount} client invoices unpaid`);
                }
            }
        }
        // Assemble auto notes — plain text only, joined with pipe separator
        values[autoNotesCol] = plainParts.length > 0 ? plainParts.join(" | ") : "";
        // PROTECT MANUAL DATA: When no WO found in HeyPros, do NOT overwrite
        // columns that Nathan manually enters for pre-HeyPros jobs.
        if (heyProsList.length === 0) {
            delete values.A;
            delete values.C;
            delete values.D;
            delete values.E;
            if (useNewLayout) {
                // New layout: O (HP Invoice #), P (Sub Inv Amt), R (Contractor PDF)
                delete values.O;
                delete values.P;
                delete values.R;
            }
            else {
                // Legacy layout: Q (HP Invoice #), R (Sub Inv Amt), T (Contractor PDF)
                delete values.Q;
                delete values.R;
                delete values.T;
            }
        }
        // Track invoice number for shared invoice detection
        const resolvedInvNum = inv?.invoiceNumber ?? "";
        updates.push({ rowIndex, values, _invoiceNumber: resolvedInvNum });
    }
    // 5a. Shared invoice detection — flag rows sharing the same Jobber invoice #
    const invoiceRowMap = new Map();
    for (const u of updates) {
        const invNum = u._invoiceNumber;
        if (invNum && invNum !== "-") {
            const existing = invoiceRowMap.get(invNum) ?? [];
            existing.push(u.rowIndex);
            invoiceRowMap.set(invNum, existing);
        }
    }
    const notesCol = useNewLayout ? "X" : "Z";
    for (const u of updates) {
        const invNum = u._invoiceNumber;
        if (invNum && invNum !== "-") {
            const sharedRows = invoiceRowMap.get(invNum);
            if (sharedRows && sharedRows.length > 1) {
                const otherRows = sharedRows.filter(r => r !== u.rowIndex);
                const note = `🔗 Shared Invoice #${invNum} (also on row${otherRows.length > 1 ? "s" : ""} ${otherRows.join(", ")})`;
                u.values[notesCol] = u.values[notesCol] ? `${u.values[notesCol]} | ${note}` : note;
            }
        }
        delete u._invoiceNumber; // clean up temp field
    }
    // 5. Batch update auto columns
    if (config.sheets.dryRun) {
        console.log("\n  Sheets [DRY RUN] — would update these rows:");
        for (const u of updates) {
            console.log(`    Row ${u.rowIndex}: ${JSON.stringify(u.values)}`);
        }
    }
    else {
        await batchUpdateAutoColumns(config.sheets.spreadsheetId, config.sheets.sheetsTab, updates);
        console.log(`  Sheets: updated ${updates.length} rows`);
        // Apply black text formatting to hyperlink columns (E, G, J, R/T)
        await formatLinkColumns(config.sheets.spreadsheetId, config.sheets.sheetsTab, updates.length > 0 ? Math.max(...updates.map(u => u.rowIndex)) : 50);
        console.log("  Link columns: formatted");
    }
    return { updateCount: updates.length, jobCount: uniqueJobNumbers.length };
}
/**
 * Recurring tab flow: same Jobber + HeyPros lookups as monthly, but:
 * - A (Date) auto-populated from HeyPros installationStarts (visit date)
 * - L (Invoice #) is NOT overwritten — manually entered
 * - M, N, O, P only filled when L has a value (invoice lookup)
 * - HeyPros WOs grouped by job number, filtered to tab month, sorted by installationStarts ascending
 * - Sequential round-robin assignment per job number (same as monthly multi-WO logic)
 * - No GTP refresh
 */
async function runRecurringTabFlow(config) {
    console.log("Step 1: Reading recurring tab rows...");
    const rows = await readRecurringTabRows(config.sheets.spreadsheetId, config.sheets.sheetsTab);
    if (rows.length === 0) {
        console.log("  No job numbers found — nothing to sync");
        return { updateCount: 0, jobCount: 0 };
    }
    const uniqueJobNumbers = [...new Set(rows.map(r => r.jobNumber))];
    console.log(`  → ${rows.length} rows, ${uniqueJobNumbers.length} unique job numbers`);
    // 2. Fetch Jobber jobs by number
    const jobberJobs = await fetchJobberJobsByNumbers(config, uniqueJobNumbers);
    console.log(`  → ${jobberJobs.length} Jobber records`);
    // Index Jobber jobs by jobNumber
    const jobberByNumber = new Map();
    for (const j of jobberJobs) {
        const existing = jobberByNumber.get(j.jobNumber) ?? [];
        existing.push(j);
        jobberByNumber.set(j.jobNumber, existing);
    }
    // 3. Fetch HeyPros jobs by purchase order
    const heyProsJobs = await fetchJobsByPurchaseOrders(config, uniqueJobNumbers);
    console.log(`  → ${heyProsJobs.length} HeyPros job matches`);
    // Index HeyPros by PO (job number), sort by installationStarts, filter to tab month
    const heyProsByPO = new Map();
    for (const hp of heyProsJobs) {
        const po = hp.purchaseOrder?.trim();
        if (po) {
            const existing = heyProsByPO.get(po) ?? [];
            existing.push(hp);
            heyProsByPO.set(po, existing);
        }
    }
    // Parse target month from tab name (strip " - R" suffix first)
    const baseTabName = config.sheets.sheetsTab.replace(/ - R$/, "");
    const tabMonth = parseTabMonth(baseTabName);
    // Sort each PO's WOs by installationStarts ascending, then filter to tab month
    for (const [po, list] of heyProsByPO) {
        list.sort((a, b) => {
            const da = a.installationStarts ? new Date(a.installationStarts).getTime() : 0;
            const db = b.installationStarts ? new Date(b.installationStarts).getTime() : 0;
            return da - db;
        });
        // Filter to tab month if we could parse it
        if (tabMonth) {
            const filtered = list.filter(wo => {
                if (!wo.installationStarts)
                    return true;
                const d = new Date(wo.installationStarts);
                return d.getUTCMonth() === tabMonth.month && d.getUTCFullYear() === tabMonth.year;
            });
            heyProsByPO.set(po, filtered);
        }
    }
    // Sequential assignment counter per job number (round robin)
    const heyProsAssignmentIndex = new Map();
    // 4. Build per-row updates
    const updates = [];
    for (const { rowIndex, jobNumber, invoiceNumber, heyProsId } of rows) {
        const jobberRecords = jobberByNumber.get(jobNumber) ?? [];
        // Sequential WO assignment: each row for the same job gets the next WO in date order
        const filteredList = heyProsByPO.get(jobNumber) ?? [];
        const hpIdx = heyProsAssignmentIndex.get(jobNumber) ?? 0;
        const heyPros = hpIdx < filteredList.length ? filteredList[hpIdx] : undefined;
        heyProsAssignmentIndex.set(jobNumber, hpIdx + 1);
        const allInvoices = heyPros?.jobInvoices ?? [];
        const KNOWN_STATUSES = ["Accepted", "Rejected", "Canceled", "Pending Approval"];
        const acceptedInvoices = allInvoices.filter(inv => inv.status?.label === "Accepted");
        const rejectedInvoices = allInvoices.filter(inv => inv.status?.label === "Rejected");
        const canceledInvoices = allInvoices.filter(inv => inv.status?.label === "Canceled");
        const pendingInvoices = allInvoices.filter(inv => inv.status?.label === "Pending Approval");
        const unknownInvoices = allInvoices.filter(inv => inv.status?.label != null && !KNOWN_STATUSES.includes(inv.status.label));
        const sortedInvoices = acceptedInvoices.slice().sort((a, b) => {
            const numA = typeof a.hashidNumeric === "number" ? a.hashidNumeric : parseInt(String(a.hashidNumeric ?? "0"), 10);
            const numB = typeof b.hashidNumeric === "number" ? b.hashidNumeric : parseInt(String(b.hashidNumeric ?? "0"), 10);
            return numB - numA;
        });
        const hpInvoice = sortedInvoices.length > 0 ? sortedInvoices[0] : undefined;
        const isMultiInvoice = acceptedInvoices.length > 1;
        const totalAmountDollars = acceptedInvoices.reduce((sum, inv) => sum + inv.amount, 0) / 100;
        const hpInvoiceHashidNumeric = hpInvoice?.hashidNumeric ?? "";
        const hpInvoiceAmountDollars = hpInvoice ? formatAmount(hpInvoice.amount) : "";
        const hpPdfUrl = hpInvoice?.file?.fileName
            ? `${HEYPROS_FILE_BASE}${hpInvoice.file.fileName}`
            : "";
        // Pick Jobber record — for recurring, match by invoice number if provided
        const isRecurringManualHold = invoiceNumber === "-";
        let inv;
        if (invoiceNumber && !isRecurringManualHold) {
            // Match by specific invoice number
            inv = jobberRecords.find(j => j.invoiceNumber === invoiceNumber);
            if (!inv) {
                // Try without leading zeros or other normalization
                inv = jobberRecords.find(j => parseInt(j.invoiceNumber, 10) === parseInt(invoiceNumber, 10));
            }
        }
        // For job-level fields, use any Jobber record for this job
        const jobRecord = jobberRecords.length > 0 ? jobberRecords[0] : undefined;
        const contractor = heyPros?.ostensibleWinnerUser ?? heyPros?.attachedContractors?.[0] ?? null;
        const values = {
            // Date from HeyPros (installationStarts = visit/service date)
            A: heyPros?.installationStarts ? formatDate(heyPros.installationStarts) : "",
            // Job-level fields (from Jobber job, not invoice-specific)
            C: contractor?.companyName ?? "",
            D: contractor ? `${contractor.firstName} ${contractor.lastName}`.trim() : "",
            E: heyPros?.hashid && heyPros.hashidNumeric
                ? `=HYPERLINK("https://kc-power-clean.heypros.com/job/${heyPros.hashid}","${formatHeyProsId(heyPros.hashidNumeric)}")`
                : formatHeyProsId(heyPros?.hashidNumeric ?? ""),
            G: jobRecord?.jobberWebUri ? `=HYPERLINK("${jobRecord.jobberWebUri}","View Job")` : "",
            H: jobRecord?.jobStatus ? displayJobStatus(jobRecord.jobStatus) : "",
            I: jobRecord?.jobType ? displayJobType(jobRecord.jobType) : "",
            J: jobRecord?.clientWebUri && jobRecord.clientName
                ? `=HYPERLINK("${jobRecord.clientWebUri}","${(jobRecord.clientName ?? "").replace(/"/g, '""')}")`
                : jobRecord?.clientName ?? "",
            K: jobRecord?.division ?? "",
            // HeyPros invoice fields
            Q: formatHeyProsId(hpInvoiceHashidNumeric),
            R: acceptedInvoices.length === 0 ? "" : (isMultiInvoice ? totalAmountDollars.toFixed(2) : hpInvoiceAmountDollars),
            T: acceptedInvoices.length === 0 ? ""
                : isMultiInvoice ? "See Auto Note"
                    : hpPdfUrl ? '=HYPERLINK("' + hpPdfUrl + '","View PDF")' : '',
        };
        // Invoice-specific fields — ONLY when Invoice # (L) is provided and NOT manual hold
        if (invoiceNumber && !isRecurringManualHold && inv) {
            values.M = inv.amount === 0 ? "" : String(inv.amount);
            values.N = inv.issuedDate ? formatDate(inv.issuedDate) : "";
            values.O = inv.invoiceStatus ? displayInvoiceStatus(inv.invoiceStatus) : "";
            values.P = inv.invoiceStatus === "paid" && inv.paidDate ? formatDate(inv.paidDate) : "";
        }
        else if (!isRecurringManualHold) {
            // No invoice # or no match — leave M, N, O, P blank
            values.M = "";
            values.N = "";
            values.O = "";
            values.P = "";
        }
        // When isRecurringManualHold, M/N/O/P are not set → won't be written
        // Auto notes
        const plainParts = [];
        if (isMultiInvoice) {
            const count = sortedInvoices.length;
            const invParts = [];
            for (let n = 0; n < count; n++) {
                const sinv = sortedInvoices[n];
                const amtStr = "$" + (sinv.amount / 100).toFixed(2);
                invParts.push(`Inv ${n + 1}: ${amtStr}`);
            }
            plainParts.push(`ℹ️ ${count} accepted invoices (${invParts.join(", ")}) — download PDFs from HeyPros`);
        }
        for (const rinv of rejectedInvoices)
            plainParts.push(`⚠️ Rejected: $${(rinv.amount / 100).toFixed(2)}`);
        for (const cinv of canceledInvoices)
            plainParts.push(`⚠️ Canceled: $${(cinv.amount / 100).toFixed(2)}`);
        for (const pinv of pendingInvoices)
            plainParts.push(`⏳ Pending: $${(pinv.amount / 100).toFixed(2)}`);
        for (const uinv of unknownInvoices)
            plainParts.push(`⚠️ Unknown status '${uinv.status?.label}': $${(uinv.amount / 100).toFixed(2)}`);
        if (!heyPros)
            plainParts.push("⚠️ WO# not found in HeyPros");
        if (jobberRecords.length === 0)
            plainParts.push("⚠️ Job# not found in Jobber");
        if (invoiceNumber && !isRecurringManualHold && !inv)
            plainParts.push(`⚠️ Invoice #${invoiceNumber} not found in Jobber`);
        if (isRecurringManualHold)
            plainParts.push("⏸️ Manual invoice hold (L = \"-\")");
        values.Z = plainParts.length > 0 ? plainParts.join(" | ") : "";
        // Protect manual data when no HeyPros match
        if (!heyPros) {
            delete values.C;
            delete values.D;
            delete values.E;
            delete values.Q;
            delete values.R;
            delete values.S;
            delete values.T;
        }
        updates.push({ rowIndex, values });
    }
    // 5. Batch update
    if (config.sheets.dryRun) {
        console.log("\n  Sheets [DRY RUN] — would update these rows:");
        for (const u of updates) {
            console.log(`    Row ${u.rowIndex}: ${JSON.stringify(u.values)}`);
        }
    }
    else {
        await batchUpdateRecurringColumns(config.sheets.spreadsheetId, config.sheets.sheetsTab, updates);
        console.log(`  Sheets: updated ${updates.length} rows`);
        // Apply black text formatting to hyperlink columns (E, G, J, T)
        await formatLinkColumns(config.sheets.spreadsheetId, config.sheets.sheetsTab, updates.length > 0 ? Math.max(...updates.map(u => u.rowIndex)) : 50);
        console.log("  Link columns: formatted");
    }
    return { updateCount: updates.length, jobCount: uniqueJobNumbers.length };
}
export async function kcPPSync(req, res) {
    const startTime = Date.now();
    try {
        console.log("KC PP Sync — triggered");
        const config = loadConfig();
        // Allow caller to override the target tab via request body:
        //   { tab: "March" }           — explicit tab name
        //   { mode: "current" }        — auto-resolve: current, current-r, prev, prev-r
        const bodyMode = req.body?.mode;
        const bodyTab = req.body?.tab;
        if (bodyMode && typeof bodyMode === "string") {
            const resolved = resolveMode(bodyMode);
            if (!resolved) {
                res.status(400).json({ status: "error", error: `Unknown mode: ${bodyMode}. Valid: current, current-r, prev, prev-r` });
                return;
            }
            config.sheets.sheetsTab = resolved;
            console.log(`  Mode '${bodyMode}' → tab '${resolved}'`);
        }
        else if (bodyTab && typeof bodyTab === "string") {
            config.sheets.sheetsTab = bodyTab;
        }
        // Handle fixStaleCF: remove stale row-scoped CF rules on a tab
        // Deletes rules with narrow startRowIndex (e.g., row 200+) that override global rules
        if (req.body?.fixStaleCF) {
            const tabName = req.body.fixStaleCF;
            const { google } = await import("googleapis");
            const gauth2 = new google.auth.GoogleAuth({ scopes: ["https://www.googleapis.com/auth/spreadsheets"] });
            const sheets2 = google.sheets({ version: "v4", auth: gauth2 });
            const meta2 = await sheets2.spreadsheets.get({
                spreadsheetId: config.sheets.spreadsheetId,
                fields: "sheets(properties,conditionalFormats)",
            });
            const sheet2 = meta2.data.sheets?.find((s) => s.properties?.title === tabName);
            if (!sheet2) {
                res.json({ error: `Tab "${tabName}" not found` });
                return;
            }
            const sheetId2 = sheet2.properties.sheetId;
            const cf2 = sheet2.conditionalFormats || [];
            // Find rules where ALL ranges have startRowIndex >= 100 (stale row-anchored rules)
            const staleIdxs = [];
            const partialFix = [];
            cf2.forEach((rule, idx) => {
                const ranges = rule.ranges || [];
                const staleRanges = ranges.filter((r) => r.startRowIndex >= 100);
                const cleanRanges = ranges.filter((r) => !r.startRowIndex || r.startRowIndex < 100);
                if (staleRanges.length === ranges.length) {
                    // All ranges are stale — delete entire rule
                    staleIdxs.push(idx);
                }
                else if (staleRanges.length > 0 && cleanRanges.length > 0) {
                    // Mix — keep clean ranges, remove stale
                    partialFix.push({ idx, cleanRanges });
                }
            });
            // Delete fully-stale rules (in reverse order to preserve indices)
            const deleteRequests = [...staleIdxs].sort((a, b) => b - a).map(idx => ({
                deleteConditionalFormatRule: { sheetId: sheetId2, index: idx }
            }));
            // Update mixed rules — replace with clean ranges only
            const updateRequests = partialFix.map(({ idx, cleanRanges }) => ({
                updateConditionalFormatRule: {
                    sheetId: sheetId2,
                    index: idx,
                    rule: { ...cf2[idx], ranges: cleanRanges },
                }
            }));
            const allRequests = [...updateRequests, ...deleteRequests];
            if (allRequests.length > 0) {
                await sheets2.spreadsheets.batchUpdate({
                    spreadsheetId: config.sheets.spreadsheetId,
                    requestBody: { requests: allRequests },
                });
            }
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            res.json({ status: "ok", elapsed: `${elapsed}s`, tab: tabName, deletedRules: staleIdxs.length, patchedRules: partialFix.length });
            return;
        }
        // Handle debugCF request: dump CF rules covering a specific column on a tab
        if (req.body?.debugCF) {
            const tabName = req.body.debugCF;
            const targetCol = req.body.col ?? 18; // default col S (0-indexed)
            const { google } = await import("googleapis");
            const gauth = new google.auth.GoogleAuth({ scopes: ["https://www.googleapis.com/auth/spreadsheets"] });
            const sheets = google.sheets({ version: "v4", auth: gauth });
            const meta = await sheets.spreadsheets.get({
                spreadsheetId: config.sheets.spreadsheetId,
                fields: "sheets(properties,conditionalFormats)",
            });
            const sheet = meta.data.sheets?.find((s) => s.properties?.title === tabName);
            if (!sheet) {
                res.json({ error: `Tab "${tabName}" not found` });
                return;
            }
            const cf = sheet.conditionalFormats || [];
            const matching = cf
                .map((rule, idx) => ({ idx, rule }))
                .filter(({ rule }) => rule.ranges?.some((r) => r.startColumnIndex <= targetCol && (!r.endColumnIndex || r.endColumnIndex > targetCol)));
            res.json({ tab: tabName, col: targetCol, totalRules: cf.length, matchingRules: matching.length, rules: matching });
            return;
        }
        // Handle extendCF request: extend CF rules on a tab to 500 rows
        if (req.body?.extendCF) {
            const tabName = req.body.extendCF;
            console.log(`Extending CF rules on "${tabName}" to 500 rows`);
            const count = await extendTabCF(config.sheets.spreadsheetId, tabName, 500);
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            res.json({ status: "ok", elapsed: `${elapsed}s`, tab: tabName, rulesExtended: count });
            return;
        }
        // Handle refreshDashboard-only request
        if (req.body?.refreshDashboard === true && !req.body?.mode && !req.body?.tab) {
            console.log("Dashboard-only refresh requested");
            const dashCount = await refreshDashboard(config.sheets.spreadsheetId);
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            await logSyncResult(config.sheets.spreadsheetId, {
                timestamp: new Date().toISOString(),
                tab: "Dashboard",
                status: "✅ OK",
                jobs: dashCount,
                rows: 0,
                gtpRows: 0,
                elapsed: `${elapsed}s`,
                error: "",
            }).catch((e) => console.warn(`  Command log failed: ${e}`));
            res.status(200).json({ status: "ok", elapsed: `${elapsed}s`, dashboard: true, totalJobs: dashCount });
            return;
        }
        // Detect recurring tab (ends with " - R")
        const isRecurringTab = config.sheets.sheetsTab.endsWith(" - R");
        let updateCount;
        let jobCount;
        let gtpCount = 0;
        let dashboardCount = 0;
        if (isRecurringTab) {
            console.log(`Recurring tab detected: ${config.sheets.sheetsTab}`);
            const result = await runRecurringTabFlow(config);
            updateCount = result.updateCount;
            jobCount = result.jobCount;
            // No GTP refresh for recurring tabs
        }
        else {
            const result = await runSourceSheetFlow(config);
            updateCount = result.updateCount;
            jobCount = result.jobCount;
            // Refresh GTP $ tab after sync (monthly tabs only)
            if (!config.sheets.dryRun) {
                console.log("Refreshing GTP $ tab...");
                gtpCount = await refreshGTPTab(config.sheets.spreadsheetId, config.sheets.sheetsTab);
                console.log(`  GTP $: ${gtpCount} rows`);
            }
        }
        // Refresh Dashboard tab after every sync
        if (!config.sheets.dryRun) {
            console.log("Refreshing Dashboard tab...");
            try {
                dashboardCount = await refreshDashboard(config.sheets.spreadsheetId);
                console.log(`  Dashboard: ${dashboardCount} total jobs`);
            }
            catch (e) {
                console.warn(`  Dashboard refresh failed: ${e}`);
            }
        }
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        const summary = {
            status: "ok",
            elapsed: `${elapsed}s`,
            tab: config.sheets.sheetsTab,
            recurring: isRecurringTab,
            jobNumbers: jobCount,
            updatedRows: updateCount,
            gtpRows: gtpCount,
            dashboardJobs: dashboardCount,
            spreadsheetId: config.sheets.dryRun ? null : config.sheets.spreadsheetId,
        };
        console.log(`Done in ${elapsed}s`, JSON.stringify(summary));
        // Log success to Command tab
        await logSyncResult(config.sheets.spreadsheetId, {
            timestamp: new Date().toISOString(),
            tab: config.sheets.sheetsTab,
            status: "✅ OK",
            jobs: jobCount,
            rows: updateCount,
            gtpRows: gtpCount,
            elapsed: `${elapsed}s`,
            error: "",
        }).catch((e) => console.warn(`  Command log failed: ${e}`));
        // Log dashboard refresh separately
        if (dashboardCount > 0) {
            await logSyncResult(config.sheets.spreadsheetId, {
                timestamp: new Date().toISOString(),
                tab: "Dashboard",
                status: "✅ OK",
                jobs: dashboardCount,
                rows: 0,
                gtpRows: 0,
                elapsed: `${elapsed}s`,
                error: "",
            }).catch((e) => console.warn(`  Dashboard log failed: ${e}`));
        }
        res.status(200).json(summary);
    }
    catch (err) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        const message = err instanceof Error ? err.message : String(err);
        console.error(`FATAL (${elapsed}s): ${message}`);
        // Log failure to Command tab
        const tabName = req.body?.tab ?? req.body?.mode ?? "unknown";
        const spreadsheetId = process.env.SPREADSHEET_ID ?? process.env.GOOGLE_SHEETS_DEFAULT_ID ?? "";
        await logSyncResult(spreadsheetId, {
            timestamp: new Date().toISOString(),
            tab: tabName,
            status: "🔴 FAILED",
            jobs: 0,
            rows: 0,
            gtpRows: 0,
            elapsed: `${elapsed}s`,
            error: message.slice(0, 500),
        }).catch((e) => console.warn(`  Command log failed: ${e}`));
        res.status(500).json({ status: "error", elapsed: `${elapsed}s`, error: message });
    }
}
