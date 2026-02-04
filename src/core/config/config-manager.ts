import Conf from 'conf';
import crypto from 'crypto';

interface KybernusConfig {
    machineId?: string;
    analyticsEnabled?: boolean;
}

export class ConfigManager {
    private config: Conf<KybernusConfig>;

    constructor() {
        this.config = new Conf<KybernusConfig>({
            projectName: 'kybernus',
            defaults: {
                analyticsEnabled: true,
            },
        });
    }

    getMachineId(): string {
        let machineId = this.config.get('machineId');
        if (!machineId) {
            machineId = crypto.randomUUID();
            this.config.set('machineId', machineId);
        }
        return machineId;
    }

    isAnalyticsEnabled(): boolean {
        return this.config.get('analyticsEnabled', true);
    }

    setAnalyticsEnabled(enabled: boolean): void {
        this.config.set('analyticsEnabled', enabled);
    }

    clear(): void {
        this.config.clear();
    }
}


