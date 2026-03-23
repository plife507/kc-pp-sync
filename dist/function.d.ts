/**
 * Cloud Function entry point for KC PP Sync
 * Triggered by Cloud Scheduler via HTTP
 *
 * Option C: Read job numbers from output sheet, then look up in Jobber + HeyPros.
 */
import type { Request, Response } from "@google-cloud/functions-framework";
export declare function kcPPSync(req: Request, res: Response): Promise<void>;
