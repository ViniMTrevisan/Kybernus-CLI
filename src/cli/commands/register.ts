import * as clack from '@clack/prompts';
import { ConfigManager } from '../../core/config/config-manager.js';
import { AnalyticsClient } from '../services/AnalyticsClient.js';

const API_URL = process.env.KYBERNUS_API_URL || 'http://localhost:3000/api';

export async function registerCommand() {
    console.clear();
    clack.intro('🚀 Kybernus Registration');

    const configManager = new ConfigManager();

    // Check if already registered
    const existingKey = configManager.getLicenseKey();
    if (existingKey) {
        clack.log.warn('You are already registered.');
        const shouldOverwrite = await clack.confirm({
            message: 'Do you want to register a new account? This will replace your current license.',
        });

        if (clack.isCancel(shouldOverwrite) || !shouldOverwrite) {
            clack.outro('Operation cancelled.');
            process.exit(0);
        }
    }

    const email = await clack.text({
        message: 'Enter your email address to start your 15-day Free Trial:',
        placeholder: 'you@example.com',
        validate: (value) => {
            if (!value) return 'Email is required';
            if (!value.includes('@')) return 'Please enter a valid email';
        },
    });

    if (clack.isCancel(email)) {
        clack.outro('Operation cancelled.');
        process.exit(0);
    }

    const s = clack.spinner();
    s.start('Registering account...');

    try {
        const machineId = configManager.getMachineId();

        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, machineId }),
        });

        const data = await response.json() as any;

        if (!response.ok) {
            s.stop('Registration failed');
            clack.log.error(data.error || 'Unknown error occurred');
            return;
        }

        // Save new credentials
        configManager.setLicenseKey(data.licenseKey);
        configManager.setEmail(email as string);
        configManager.setLicenseTier(data.tier === 'pro' ? 'PRO' : 'FREE');
        if (data.trialEndsAt) {
            configManager.setLicenseExpiration(data.trialEndsAt);
        }

        // Track registration
        const analytics = new AnalyticsClient();
        analytics.track('user_registered', { email });

        s.stop('Registration successful! 🎉');

        clack.note(
            `License Key: ${data.licenseKey}\nTrial Ends: ${new Date(data.trialEndsAt).toLocaleDateString()}`,
            'Trial Activated'
        );

        clack.outro('You are now ready to build amazing projects with Kybernus!');

    } catch (error: any) {
        s.stop('Error connecting to server');
        clack.log.error(error.message);
    }
}
