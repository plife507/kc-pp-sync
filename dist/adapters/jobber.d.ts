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
    /** Track the original refresh token to detect rotation */
    private originalRefreshToken;
    private persist;
    /**
     * Write rotated refresh token to Secret Manager (GCP).
     * Uses ADC (Application Default Credentials) via googleapis.
     * Secret: projects/823212137840/secrets/JOBBER_REFRESH_TOKEN
     */
    private persistRefreshTokenToSecretManager;
}
export declare function isJobberOAuthRenewRequired(message: string): boolean;
export declare function fetchJobberJobsByNumbers(config: Config, jobNumbers: string[]): Promise<JobberPaidJob[]>;
