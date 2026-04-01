/**
 * NEW 39-column layout (A–AM) for March-forward tabs.
 * Used for new monthly tabs (e.g., "March", "April").
 */
export const HEADER_ROW = [
    "Date", // A
    "REVIEW", // B
    "Company Name", // C
    "Preferred Partner Owner Name", // D
    "HeyPros ID #", // E
    "Job #", // F
    "Jobber Link", // G
    "Job Status", // H
    "Job Type", // I
    "Client Name", // J
    "Division", // K
    "# of Invoices", // L  (NEW — auto, Jobber)
    "Total Invoiced", // M  (NEW — auto, Jobber)
    "All Paid?", // N  (NEW — auto, ✅/❌)
    "HEY PROS INVOICE NUMBER", // O  (was Q)
    "Sub Invoice Amount", // P  (was R)
    "KCPC Released Amount", // Q  (was S — MANUAL)
    "Contractor Invoice PDF", // R  (was T)
    "Payment Status", // S  (was U — MANUAL)
    "Payment Tracking (Finance)", // T  (was V — MANUAL)
    "Payment Method (Finance)", // U  (was W — MANUAL)
    "Date of Payment", // V  (was X — MANUAL)
    "NOTES / REMARKS", // W  (was Y — MANUAL)
    "Auto Notes", // X  (was Z)
    "Inv #1", // Y  (tracker block)
    "Inv #1 Amt", // Z
    "Inv #1 Paid?", // AA
    "Inv #2", // AB
    "Inv #2 Amt", // AC
    "Inv #2 Paid?", // AD
    "Inv #3", // AE
    "Inv #3 Amt", // AF
    "Inv #3 Paid?", // AG
    "Inv #4", // AH
    "Inv #4 Amt", // AI
    "Inv #4 Paid?", // AJ
    "Inv #5", // AK
    "Inv #5 Amt", // AL
    "Inv #5 Paid?", // AM
];
/**
 * LEGACY 26-column layout (A–Z) for Jan/Feb tabs (backward compat).
 */
export const HEADER_ROW_LEGACY = [
    "Date",
    "REVIEW",
    "Company Name",
    "Preferred Partner Owner Name",
    "HeyPros ID #",
    "Job #",
    "Jobber Link",
    "Job Status",
    "Job Type",
    "Client Name",
    "Division",
    "Invoice Number",
    "Jobber Invoice Total Amount",
    "Invoice Issued Date",
    "Jobber Invoice Status",
    "Date Invoice Paid (Auto Populates)",
    "HEY PROS INVOICE NUMBER",
    "Sub Invoice Amount",
    "KCPC Released Amount",
    "Contractor Invoice PDF",
    "Payment Status",
    "Payment Tracking (Finance)",
    "Payment Method (Finance)",
    "Date of Payment",
    "NOTES / REMARKS",
    "Auto Notes",
];
export const HEYPROS_FILE_BASE = "https://kc-power-clean.heypros.com/files/";
