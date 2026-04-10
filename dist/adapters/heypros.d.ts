import type { Config } from "../config/env.js";
import type { HeyProsJobDetail } from "../config/types.js";
/**
 * Parse a HeyPros purchaseOrder field into individual job numbers.
 * Handles formats seen in production:
 *   "19616 19659"       → ["19616", "19659"]
 *   "19693 19694"       → ["19693", "19694"]
 *   "19353 / 54"        → ["19353", "19354"]  (relative shorthand)
 *   "Job #19553"        → ["19553"]
 *   "19633"             → ["19633"]
 */
export declare function parsePurchaseOrder(raw: string | null | undefined): string[];
export declare function fetchJobsByPurchaseOrders(config: Config, purchaseOrders: string[]): Promise<HeyProsJobDetail[]>;
