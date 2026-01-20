import { ConfigManager } from '../../core/config/config-manager.js';

const API_URL = process.env.KYBERNUS_API_URL || 'http://localhost:3010/api';

export class AnalyticsClient {
    private configManager: ConfigManager;

    constructor() {
        this.configManager = new ConfigManager();
    }

    async track(event: string, data: { stack?: string; architecture?: string; command?: string;[key: string]: any } = {}): Promise<void> {
        try {
            const licenseKey = this.configManager.getLicenseKey();
            const machineId = this.configManager.getMachineId(); // Enviando machineId no metadata se API nao suporta direto, ou ignorando?

            const { stack, architecture, command, ...rest } = data;

            // Fire and forget
            fetch(`${API_URL}/analytics/track`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event,
                    licenseKey: licenseKey || undefined,
                    stack,
                    architecture,
                    command,
                    metadata: { ...rest, machineId } // Colocando machineId no metadata
                })
            }).catch(() => { });

        } catch (error) {
            // Silently fail
        }
    }
}
