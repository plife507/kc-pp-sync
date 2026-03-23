export const PAID_BY_CLIENT_LABEL_HASHID = "7XzO5G";
export const PAID_BY_CLIENT_LABEL_NAME = "PAID BY CLIENT";
/**
 * Normalize a HeyPros hashidNumeric for comparison.
 * API returns "9331562", sheet stores "9-331-562" — strip dashes before comparing.
 */
export function normalizeHashidNumeric(id) {
    if (id == null)
        return "";
    return String(id).replace(/-/g, "");
}
/**
 * Format a HeyPros numeric ID as dashed display format.
 * "9331562" → "9-331-562". Handles string or number input, variable digit length.
 * Single source of truth — used by both function.ts and sheets.ts.
 */
export function formatHeyProsId(id) {
    if (id == null || (id === ""))
        return "";
    if (id === 0)
        return "";
    const digits = String(id).replace(/\D/g, "");
    if (!digits)
        return "";
    if (digits.length === 7) {
        return `${digits[0]}-${digits.slice(1, 4)}-${digits.slice(4)}`;
    }
    // generic: insert dashes every 3 digits from the right
    let result = "";
    for (let i = 0; i < digits.length; i++) {
        if (i > 0 && (digits.length - i) % 3 === 0)
            result += "-";
        result += digits[i];
    }
    return result;
}
/**
 * Format an ISO date/datetime string as M/D/YYYY.
 * "2026-03-03T08:00:00Z" → "3/3/2026". Returns input unchanged if not parseable.
 * Single source of truth — used by both function.ts and sheets.ts.
 */
export function formatDate(iso) {
    if (!iso)
        return "";
    const d = new Date(iso);
    if (isNaN(d.getTime()))
        return iso;
    return `${d.getUTCMonth() + 1}/${d.getUTCDate()}/${d.getUTCFullYear()}`;
}
