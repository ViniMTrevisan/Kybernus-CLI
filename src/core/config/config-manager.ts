import Conf from 'conf';
import crypto from 'crypto';

interface KybernusConfig {
    licenseKey?: string;
    licenseTier?: 'FREE' | 'PRO';
    licenseExpiration?: string;
    machineId?: string;
    email?: string;
}

export class ConfigManager {
    private config: Conf<KybernusConfig>;

    constructor() {
        this.config = new Conf<KybernusConfig>({
            projectName: 'kybernus',
            defaults: {
                licenseTier: 'FREE',
            },
        });
    }

    getLicenseKey(): string | undefined {
        return this.config.get('licenseKey');
    }

    setLicenseKey(key: string): void {
        this.config.set('licenseKey', key);
    }

    getLicenseTier(): 'FREE' | 'PRO' {
        return this.config.get('licenseTier', 'FREE');
    }

    setLicenseTier(tier: 'FREE' | 'PRO'): void {
        this.config.set('licenseTier', tier);
    }

    getLicenseExpiration(): string | undefined {
        return this.config.get('licenseExpiration');
    }

    setLicenseExpiration(expiration: string): void {
        this.config.set('licenseExpiration', expiration);
    }

    getMachineId(): string {
        let machineId = this.config.get('machineId');
        if (!machineId) {
            machineId = crypto.randomUUID();
            this.config.set('machineId', machineId);
        }
        return machineId;
    }

    getEmail(): string | undefined {
        return this.config.get('email');
    }

    setEmail(email: string): void {
        this.config.set('email', email);
    }

    clearLicense(): void {
        this.config.delete('licenseKey');
        this.config.delete('licenseTier');
        this.config.delete('licenseExpiration');
        this.config.delete('email');
        this.config.set('licenseTier', 'FREE');
    }

    getAll(): KybernusConfig {
        return this.config.store;
    }
}
