import { ConfigManager } from '../config/config-manager.js';

const API_URL = process.env.KYBERNUS_API_URL || 'http://localhost:3000/api';

export interface ValidationResult {
    valid: boolean;
    tier: 'FREE' | 'PRO';
    expiration?: Date;
    message?: string;
    status?: string;
}

export class LicenseValidator {
    private configManager: ConfigManager;

    constructor() {
        this.configManager = new ConfigManager();
    }

    /**
     * Validates a license key against the remote API.
     */
    async validate(key: string): Promise<ValidationResult> {
        const normalizedKey = key?.trim();

        if (!normalizedKey) {
            return {
                valid: false,
                tier: 'FREE',
                message: 'License key cannot be empty',
            };
        }

        const machineId = this.configManager.getMachineId();

        try {
            const response = await fetch(`${API_URL}/licenses/validate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ licenseKey: normalizedKey, machineId })
            });

            const data = await response.json() as any;

            if (!response.ok) {
                // If validation fails (e.g. not found, expired), return as invalid
                return {
                    valid: false,
                    tier: 'FREE',
                    message: data.error || 'Validation failed',
                };
            }

            return {
                valid: data.valid,
                tier: data.tier === 'pro' ? 'PRO' : 'FREE',
                expiration: data.trialEndsAt ? new Date(data.trialEndsAt) : undefined,
                message: data.message,
                status: data.status,
            };

        } catch (error: any) {
            return {
                valid: false,
                tier: 'FREE',
                message: `Connection error: ${error.message}`,
            };
        }
    }

    /**
     * Checks if a license is still valid (not expired).
     */
    isLicenseActive(expiration?: string | Date): boolean {
        if (!expiration) return false;
        const expirationDate = typeof expiration === 'string' ? new Date(expiration) : expiration;
        return expirationDate > new Date();
    }

    /**
     * Consumes one project credit (if applicable).
     * Returns true if authorized, false otherwise.
     */
    async consumeCredit(key: string): Promise<{ authorized: boolean; message?: string; remaining?: number; usage?: number; limit?: number }> {
        try {
            const response = await fetch(`${API_URL}/licenses/consume`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ licenseKey: key })
            });
            return await response.json() as any;
        } catch (error) {
            return { authorized: false, message: 'Network error checking limits.' };
        }
    }
}
