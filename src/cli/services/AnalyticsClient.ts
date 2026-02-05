import { PostHog } from 'posthog-node';
import { ConfigManager } from '../../core/config/config-manager.js';
import { createRequire } from 'module';

const POSTHOG_API_KEY = 'phc_J6HPBT5VMDPcOOaukG1ia5JKO7uEgAfsTIgPdceXTQS';
const POSTHOG_HOST = 'https://us.i.posthog.com';
const requirePkg = createRequire(import.meta.url);
const pkg = requirePkg('../../../package.json');


export class AnalyticsClient {
    private client: PostHog;
    private configManager: ConfigManager;

    constructor() {
        this.configManager = new ConfigManager();
        this.client = new PostHog(
            process.env.POSTHOG_API_KEY || POSTHOG_API_KEY,
            { host: POSTHOG_HOST }
        );
    }

    async track(event: string, properties: Record<string, any> = {}): Promise<void> {
        if (!this.configManager.isAnalyticsEnabled()) {
            return;
        }

        const distinctId = this.configManager.getMachineId();

        try {
            this.client.capture({
                distinctId,
                event,
                properties: {
                    ...properties,
                    $os: process.platform,
                    cli_version: pkg.version,
                },
            });

            // Flush properly in short-lived CLI commands
            await this.client.shutdown();
        } catch (error) {
            // Silently fail to not interrupt user flow
        }
    }
}
