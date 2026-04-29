/**
 * NEW 40-column visible layout (A-AN) for March-forward one-off tabs.
 * Runtime writes a hidden AO helper value for latest client-paid date.
 */
export const HEADER_ROW = [
  "Date",                              // A
  "REVIEW",                            // B
  "Margin %",                          // C  (auto — placeholder)
  "Company Name",                      // D
  "Preferred Partner Owner Name",      // E
  "HeyPros ID #",                      // F
  "Job #",                             // G
  "Jobber Link",                       // H
  "Job Status",                        // I
  "Job Type",                          // J
  "Client Name",                       // K
  "Division",                          // L
  "# of Invoices",                     // M  (auto, Jobber)
  "Total Invoiced",                    // N  (auto, Jobber)
  "All Paid?",                         // O  (auto, ✅/❌)
  "HEY PROS INVOICE NUMBER",          // P
  "Sub Invoice Amount",               // Q
  "KCPC Released Amount",             // R  (MANUAL)
  "Contractor Invoice PDF",           // S
  "Payment Status",                   // T  (MANUAL)
  "Payment Tracking (Finance)",       // U  (MANUAL)
  "Payment Method (Finance)",         // V  (MANUAL)
  "Date of Payment",                  // W  (MANUAL)
  "NOTES / REMARKS",                  // X  (MANUAL)
  "Auto Notes",                       // Y
  "Inv #1",                           // Z  (tracker block)
  "Inv #1 Amt",                       // AA
  "Inv #1 Paid?",                     // AB
  "Inv #2",                           // AC
  "Inv #2 Amt",                       // AD
  "Inv #2 Paid?",                     // AE
  "Inv #3",                           // AF
  "Inv #3 Amt",                       // AG
  "Inv #3 Paid?",                     // AH
  "Inv #4",                           // AI
  "Inv #4 Amt",                       // AJ
  "Inv #4 Paid?",                     // AK
  "Inv #5",                           // AL
  "Inv #5 Amt",                       // AM
  "Inv #5 Paid?",                     // AN
];

/**
 * LEGACY 26-column layout (A–Z) for Jan/Feb tabs (backward compat).
 */
export const HEADER_ROW_LEGACY = [
  "Date",                              // A
  "REVIEW",                            // B
  "Margin %",                          // C  (auto — placeholder)
  "Company Name",                      // D
  "Preferred Partner Owner Name",      // E
  "HeyPros ID #",                      // F
  "Job #",                             // G
  "Jobber Link",                       // H
  "Job Status",                        // I
  "Job Type",                          // J
  "Client Name",                       // K
  "Division",                          // L
  "Invoice Number",                    // M
  "Jobber Invoice Total Amount",       // N
  "Invoice Issued Date",              // O
  "Jobber Invoice Status",            // P
  "Date Invoice Paid (Auto Populates)", // Q
  "HEY PROS INVOICE NUMBER",          // R
  "Sub Invoice Amount",               // S
  "KCPC Released Amount",             // T  (MANUAL)
  "Contractor Invoice PDF",           // U
  "Payment Status",                   // V  (MANUAL)
  "Payment Tracking (Finance)",       // W  (MANUAL)
  "Payment Method (Finance)",         // X  (MANUAL)
  "Date of Payment",                  // Y  (MANUAL)
  "NOTES / REMARKS",                  // Z  (MANUAL)
  "Auto Notes",                       // AA
];

export const HEYPROS_FILE_BASE = "https://kc-power-clean.heypros.com/files/";
