import type { Config } from "../config/env.js";
import type { HeyProsJobDetail } from "../config/types.js";
export declare function fetchJobsByPurchaseOrders(config: Config, purchaseOrders: string[]): Promise<HeyProsJobDetail[]>;
