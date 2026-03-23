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
        status?: {
            label: string;
        } | null;
        file: {
            fileName: string;
        } | null;
    }>;
}
export declare const PAID_BY_CLIENT_LABEL_HASHID = "7XzO5G";
export declare const PAID_BY_CLIENT_LABEL_NAME = "PAID BY CLIENT";
/**
 * Normalize a HeyPros hashidNumeric for comparison.
 * API returns "9331562", sheet stores "9-331-562" — strip dashes before comparing.
 */
export declare function normalizeHashidNumeric(id: string | number | null | undefined): string;
/**
 * Format a HeyPros numeric ID as dashed display format.
 * "9331562" → "9-331-562". Handles string or number input, variable digit length.
 * Single source of truth — used by both function.ts and sheets.ts.
 */
export declare function formatHeyProsId(id: string | number | null | undefined): string;
/**
 * Format an ISO date/datetime string as M/D/YYYY.
 * "2026-03-03T08:00:00Z" → "3/3/2026". Returns input unchanged if not parseable.
 * Single source of truth — used by both function.ts and sheets.ts.
 */
export declare function formatDate(iso: string | null | undefined): string;
