import * as clack from '@clack/prompts';
import { exec } from 'child_process';
import { ConfigManager } from '../../core/config/config-manager.js';
import { AnalyticsClient } from '../services/AnalyticsClient.js';

const API_URL = process.env.KYBERNUS_API_URL || 'http://localhost:3000/api';

export async function upgradeCommand() {
    console.clear();
    clack.intro('💎 Upgrade Kybernus');

    const configManager = new ConfigManager();
    const licenseKey = configManager.getLicenseKey();

    if (!licenseKey) {
        clack.log.error('You need to register first. Run "kybernus register".');
        clack.outro('Operation cancelled.');
        process.exit(1);
    }

    const type = await clack.select({
        message: 'Choose your plan:',
        options: [
            { value: 'monthly', label: 'Monthly Subscription ($7/month) - Continue using standard features' },
            { value: 'lifetime', label: 'Pro Lifetime ($97 one-time) - Unlock Advanced Architecture & DevOps forever' },
        ],
    });

    if (clack.isCancel(type)) {
        clack.outro('Operation cancelled.');
        process.exit(0);
    }

    const s = clack.spinner();
    s.start('Creating checkout session...');

    try {
        const response = await fetch(`${API_URL}/checkout/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                licenseKey,
                tier: type === 'monthly' ? 'free' : 'pro'
            })
        });

        // Track checkout
        const analytics = new AnalyticsClient();
        analytics.track('checkout_initiated', { tier: type === 'monthly' ? 'free' : 'pro' });

        const data = await response.json() as any;

        if (!response.ok) {
            s.stop('Failed to create checkout');
            clack.log.error(data.error || 'Unknown error');
            return;
        }

        s.stop('Checkout ready!');

        clack.note(`Opening checkout page: ${data.checkoutUrl}`, 'Payment Link');

        // Try to open browser (Mac only support for now via open command)
        exec(`open "${data.checkoutUrl}"`, (err) => {
            if (err) {
                clack.log.warn(`Could not open browser automatically. Please visit: ${data.checkoutUrl}`);
            }
        });

        clack.outro('Complete the payment in your browser. Then run "kybernus status" to refresh your license.');

    } catch (error: any) {
        s.stop('Network error');
        clack.log.error(error.message);
    }
}
