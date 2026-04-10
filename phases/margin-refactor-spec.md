# Column Shift Refactor Spec — Insert Margin % at Column C

A new column C ("Margin %") has been physically inserted on Feb/March/April one-off tabs.
Every column that was at C or later has shifted +1. This spec documents EVERY code change needed.

## IMPORTANT: Recurring tabs are NOT affected. Do NOT change RECURRING_AUTO_COL_LETTERS or any code path that only touches recurring tabs.

## Column Mapping (old position → new position)

### Letter shift (applies to both layouts):
```
A → A (unchanged, before C)
B → B (unchanged, before C)
NEW: C = Margin %
C → D (Company Name)
D → E (PP Owner)
E → F (HeyPros ID)
F → G (Job #)      ← NOTE: F was excluded from auto sets (manual), now G is excluded
G → H (Jobber Link)
H → I (Job Status)
I → J (Job Type)
J → K (Client Name)
K → L (Division)
```

### New layout additional (March/April):
```
L → M (# of Invoices)
M → N (Total Invoiced)
N → O (All Paid?)
O → P (HeyPros Invoice #)
P → Q (Sub Invoice Amount)
Q → R (KCPC Released Amount) ← MANUAL
R → S (Contractor Invoice PDF)
S → T (Payment Status) ← MANUAL
T → U (Payment Tracking) ← MANUAL
U → V (Payment Method) ← MANUAL
V → W (Date of Payment) ← MANUAL
W → X (Notes / Remarks) ← MANUAL
X → Y (Auto Notes)
Y → Z (Inv #1)
Z → AA (Inv #1 Amt)
AA → AB (Inv #1 Paid?)
AB → AC (Inv #2)
AC → AD (Inv #2 Amt)
AD → AE (Inv #2 Paid?)
AE → AF (Inv #3)
AF → AG (Inv #3 Amt)
AG → AH (Inv #3 Paid?)
AH → AI (Inv #4)
AI → AJ (Inv #4 Amt)
AJ → AK (Inv #4 Paid?)
AK → AL (Inv #5)
AL → AM (Inv #5 Amt)
AM → AN (Inv #5 Paid?)
```

### Legacy layout additional (February):
```
L → M (Invoice Number)
M → N (Total Invoiced)
N → O (Invoice Issued Date)
O → P (Jobber Invoice Status)
P → Q (Date Invoice Paid)
Q → R (HeyPros Invoice #)
R → S (Sub Invoice Amount)
S → T (KCPC Released Amount) ← MANUAL
T → U (Contractor Invoice PDF)
U → V (Payment Status) ← MANUAL
V → W (Payment Tracking) ← MANUAL
W → X (Payment Method) ← MANUAL
X → Y (Date of Payment) ← MANUAL
Y → Z (Notes / Remarks) ← MANUAL
Z → AA (Auto Notes)
```

## Files to Change

### 1. src/config/constants.ts
- HEADER_ROW (new layout): Insert `"[A] Margin %"` at index 2 (between REVIEW and Company Name). Update all comments to reflect new positions. Array grows from 39 to 40 elements.
- HEADER_ROW_LEGACY: Insert `"[A] Margin %"` at index 2. Array grows from 26 to 27 elements. Update comments.

### 2. src/adapters/sheets.ts

#### AUTO_COL_LETTERS_NEW (lines 50-59):
```typescript
// OLD:
"A","C","D","E","G","H","I","J","K",
"L","M","N",
"O","P","R",
"X",
"Y","Z","AA","AB","AC","AD","AE","AF","AG","AH","AI","AJ","AK","AL","AM"

// NEW (add "C" for margin, shift all others):
"A","C","D","E","F","H","I","J","K",
"L","M","N","O",
"P","Q","S",
"Y",
"Z","AA","AB","AC","AD","AE","AF","AG","AH","AI","AJ","AK","AL","AM","AN"
```
Update the comment above: Manual columns are now B, G (job#), R (KCPC Released), T (Payment Status), U (Payment Tracking), V (Payment Method), W (Date of Payment), X (Notes).

#### AUTO_COL_LETTERS_LEGACY (line 65):
```typescript
// OLD: "A","C","D","E","G","H","I","J","K","L","M","N","O","P","Q","R","T","Z"
// NEW: "A","C","D","E","F","H","I","J","K","L","M","N","O","P","Q","R","S","U","AA"
```

#### RECURRING_AUTO_COL_LETTERS (line 68):
**DO NOT CHANGE** — recurring tabs have their own independent column layout.

#### readOutputSheetJobNumbers (lines 17-47):
- New layout: `F2:F` → `G2:G` (Job # is now at column G)
- Legacy range: `F2:L` → `G2:M` (Job # at G, Invoice # at M)
- The relative index `rows[i]?.[6]` for invoiceVal stays the same (it's reading 7th column of the range, which is still Invoice #) ← verify this is correct: G2:M = G,H,I,J,K,L,M → index 6 = M = Invoice # ✅

#### extractGtpRows (lines 193-204):
```typescript
// OLD:
const COL_DATE = 0;
const COL_COMPANY = 2;
const COL_PP_OWNER = 3;
const COL_JOB_NUM = 5;
const COL_CLIENT_NAME = 9;
const COL_PAID_CHECK = layoutNew ? 13 : 14;
const COL_SUB_AMOUNT = layoutNew ? 15 : 17;
const COL_PAYMENT_STATUS = layoutNew ? 18 : 20;
const COL_PAYMENT_TRACKING = layoutNew ? 19 : 21;

// NEW (all +1 except COL_DATE which is at 0):
const COL_DATE = 0;
const COL_COMPANY = 3;
const COL_PP_OWNER = 4;
const COL_JOB_NUM = 6;
const COL_CLIENT_NAME = 10;
const COL_PAID_CHECK = layoutNew ? 14 : 15;
const COL_SUB_AMOUNT = layoutNew ? 16 : 18;
const COL_PAYMENT_STATUS = layoutNew ? 19 : 21;
const COL_PAYMENT_TRACKING = layoutNew ? 20 : 22;
```

#### extractGtpRows read range (line 236):
```typescript
// OLD: useNew ? `A2:T500` : `A2:V500`
// NEW: useNew ? `A2:U500` : `A2:W500`
```

#### formatLinkColumns (~line 329):
Look for the hardcoded column indices for hyperlink columns (E, G, J for new / E, G, J, T for legacy).
```typescript
// OLD new: [4, 6, 9, 17]  (E=4, G=6, J=9, R=17)
// NEW new: [5, 7, 10, 18]  (F=5, H=7, K=10, S=18)
// OLD legacy: [4, 6, 9, 19]  (E=4, G=6, J=9, T=19)
// NEW legacy: [5, 7, 10, 20]  (F=5, H=7, K=10, U=20)
```

#### getDashboardColIndices (~lines 489-493):
```typescript
// OLD legacy: paymentStatus: 20, paymentTracking: 21, subInvoiceAmount: 17, allPaid: 14
// NEW legacy: paymentStatus: 21, paymentTracking: 22, subInvoiceAmount: 18, allPaid: 15
// OLD new: paymentStatus: 18, paymentTracking: 19, subInvoiceAmount: 15, allPaid: 13
// NEW new: paymentStatus: 19, paymentTracking: 20, subInvoiceAmount: 16, allPaid: 14
```

#### refreshDashboard Job# check (~line 591):
```typescript
// OLD: row[5]
// NEW: row[6]
```

#### refreshProfitabilityDashboard read ranges (~lines 1027-1028):
```typescript
// OLD: new `A2:S500`, legacy `A2:U500`
// NEW: new `A2:T500`, legacy `A2:V500`
```

#### refreshProfitabilityDashboard legacy indices (~lines 1041-1051):
```typescript
// OLD: jobNum[5], invoiceNum[11], division[10], invTotal[12], invStatus[14], labor[17], payStatus[20]
// NEW: jobNum[6], invoiceNum[12], division[11], invTotal[13], invStatus[15], labor[18], payStatus[21]
```

#### refreshProfitabilityDashboard new indices (~lines 1087-1097):
```typescript
// OLD: jobNum[5], numInvoices[11], division[10], invTotal[12], allPaid[13], labor[15], payStatus[18]
// NEW: jobNum[6], numInvoices[12], division[11], invTotal[13], allPaid[14], labor[16], payStatus[19]
```

### 3. src/function.ts

#### values assignments (common fields, ~lines 212-227):
```typescript
// All letter keys shift: C→D, D→E, E→F, G→H, H→I, I→J, J→K, K→L
values.D = contractor?.companyName ?? "";     // was values.C
values.E = ...;                                // was values.D (PP Owner)
values.F = ...;                                // was values.E (HeyPros ID link)
values.H = ...;                                // was values.G (Jobber Link)
values.I = ...;                                // was values.H (Job Status)
values.J = ...;                                // was values.I (Job Type)
values.K = ...;                                // was values.J (Client Name link)
values.L = inv?.division ?? "";               // was values.K
```
Also add: `values.C = "";`  (placeholder for margin, will be filled in Phase 3)

#### New layout invoice columns (~lines 240-252):
```typescript
// L→M, M→N, N→O, O→P, P→Q, R→S
values.M = ...;  // was values.L (# of Invoices)
values.N = ...;  // was values.M (Total Invoiced)
values.O = ...;  // was values.N (All Paid?)
values.P = ...;  // was values.O (HeyPros Invoice #)
values.Q = ...;  // was values.P (Sub Invoice Amount)
values.S = ...;  // was values.R (Contractor Invoice PDF)
```

#### Tracker slot letters (~lines 260-265):
```typescript
// OLD: ["Y","Z","AA"], ["AB","AC","AD"], ["AE","AF","AG"], ["AH","AI","AJ"], ["AK","AL","AM"]
// NEW: ["Z","AA","AB"], ["AC","AD","AE"], ["AF","AG","AH"], ["AI","AJ","AK"], ["AL","AM","AN"]
```

#### Auto notes init for new layout (~line 289):
```typescript
// OLD: values.X = "";
// NEW: values.Y = "";
```

#### Legacy HP/sub/PDF/notes columns (~lines 295-298):
```typescript
// Q→R, R→S, T→U, Z→AA
values.R = ...;   // was values.Q (HeyPros Invoice #)
values.S = ...;   // was values.R (Sub Invoice Amount)
values.U = ...;   // was values.T (Contractor Invoice PDF)
values.AA = "";   // was values.Z (Auto Notes init)
```

#### Legacy invoice columns (~lines 301-306):
```typescript
// L→M, M→N, N→O, O→P, P→Q
values.M = ...;  // was values.L (Invoice # link)
values.N = ...;  // was values.M (Amount)
values.O = ...;  // was values.N (Issued Date)
values.P = ...;  // was values.O (Invoice Status)
values.Q = ...;  // was values.P (Paid Date)
```

#### autoNotesCol (~line 314):
```typescript
// OLD: useNewLayout ? "X" : "Z"
// NEW: useNewLayout ? "Y" : "AA"
```

#### Manual protect deletes (~lines 389-407):
```typescript
// New layout: delete O,P,R → delete P,Q,S
// Legacy: delete Q,R,T → delete R,S,U
```

#### notesCol (~line 423):
```typescript
// OLD: useNewLayout ? "X" : "Z"
// NEW: useNewLayout ? "Y" : "AA"
```

#### Mismatch CF formula for new layout (~line 799):
```typescript
// OLD: =AND($N2="✅",$S2="NO CLIENT PAY")
// NEW: =AND($O2="✅",$T2="NO CLIENT PAY")
```

#### Mismatch CF endColumnIndex for new layout (~line 794):
```typescript
// OLD: endColumnIndex: 39
// NEW: endColumnIndex: 40
```

#### debugCF default col (~line 870):
```typescript
// OLD: col ?? 18
// NEW: col ?? 19
```

### 4. test/output-sheet.test.ts

Update all assertions:
- AUTO_COL_LETTERS_LEGACY column membership: shift all C+ letters
- AUTO_COL_LETTERS_NEW column membership: shift all C+ letters
- Manual column exclusion lists: shift (F→G for job#, S→T, U→V, etc.)
- Size assertions: LEGACY 18→19 (added C), NEW 28→29 (added C)
- Add C to "contains" assertions for both sets

### 5. DO NOT CHANGE
- RECURRING_AUTO_COL_LETTERS
- readRecurringTabRows
- batchUpdateRecurringColumns  
- Recurring profitability indices (lines 1141-1156)
- Dashboard output layout (writes its own A-S columns)
- GTP output layout (writes its own A-I columns)
- Command/Log tab
