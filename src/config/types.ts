/** Normalized shape returned by the Jobber adapter. */
export interface JobberPaidJob {
  jobNumber: string;
  invoiceNumber: string;
  invoiceStatus: string;
  issuedDate: string | null;
  paidDate: string | null;
  amount: number;
  clientName: string;
  division?: string;
  jobType?: string;
  jobStatus?: string | null;
  jobberWebUri?: string;
  clientWebUri?: string;
  invoiceWebUri?: string;
}

/** Raw Jobber GraphQL invoice node (before normalization). */
export interface JobberInvoiceNode {
  id: string;
  invoiceNumber: string;
  subject: string;
  invoiceStatus: string;
  issuedDate: string | null;
  receivedDate: string | null;
  amounts: {
    paymentsTotal: number | null;
    total: number;
  };
  jobs: {
    nodes: {
      jobNumber: string | null;
      client: { name: string } | null;
    }[];
  };
}

export interface JobberInvoicesResponse {
  invoices: {
    nodes: JobberInvoiceNode[];
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
    totalCount: number;
  };
}

export interface HeyProsJobDetail {
  hashid: string;
  hashidNumeric: string;
  purchaseOrder: string | null;
  installationStarts: string | null;
  attachedContractors: Array<{
    hashid: string;
    firstName: string;
    lastName: string;
    companyName: string | null;
  }>;
  ostensibleWinnerUser: {
    hashid: string;
    firstName: string;
    lastName: string;
    companyName: string | null;
  } | null;
  jobInvoices: Array<{
    hashidNumeric: string;
    amount: number;
    status?: { label: string } | null;
    file: { fileName: string } | null;
  }>;
}

export const PAID_BY_CLIENT_LABEL_HASHID = "7XzO5G";
export const PAID_BY_CLIENT_LABEL_NAME = "PAID BY CLIENT";

/**
 * Normalize a HeyPros hashidNumeric for comparison.
 * API returns "9331562", sheet stores "9-331-562" — strip dashes before comparing.
 */
export function normalizeHashidNumeric(id: string | number | null | undefined): string {
  if (id == null) return "";
  return String(id).replace(/-/g, "");
}

/**
 * Format a HeyPros numeric ID as dashed display format.
 * "9331562" → "9-331-562". Handles string or number input, variable digit length.
 * Single source of truth — used by both function.ts and sheets.ts.
 */
export function formatHeyProsId(id: string | number | null | undefined): string {
  if (id == null || (id === "" )) return "";
  if (id === 0) return "";
  const digits = String(id).replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 7) {
    return `${digits[0]}-${digits.slice(1, 4)}-${digits.slice(4)}`;
  }
  // generic: insert dashes every 3 digits from the right
  let result = "";
  for (let i = 0; i < digits.length; i++) {
    if (i > 0 && (digits.length - i) % 3 === 0) result += "-";
    result += digits[i];
  }
  return result;
}

/**
 * Format an ISO date/datetime string as M/D/YYYY.
 * "2026-03-03T08:00:00Z" → "3/3/2026". Returns input unchanged if not parseable.
 * Single source of truth — used by both function.ts and sheets.ts.
 */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()}/${d.getUTCFullYear()}`;
}
