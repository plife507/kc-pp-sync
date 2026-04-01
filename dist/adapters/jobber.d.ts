import type { Config } from "../config/env.js";
import type { JobberPaidJob } from "../config/types.js";
export declare class JobberAuth {
    private tokenPath;
    private tokens;
    private clientId;
    private clientSecret;
    constructor(tokenPath: string);
    getValidToken(): Promise<string>;
    forceRefresh(): Promise<void>;
    private loadTokenFile;
    private expiresAtEpoch;
    private isExpiringSoon;
    private refresh;
    private persist;
}
export declare function fetchJobberJobsByNumbers(config: Config, jobNumbers: string[]): Promise<JobberPaidJob[]>;
