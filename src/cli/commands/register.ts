import * as clack from '@clack/prompts';
import { ConfigManager } from '../../core/config/config-manager.js';
import { AnalyticsClient } from '../services/AnalyticsClient.js';
import { requestDeviceCode, waitForAuth } from '../../core/auth/device-flow.js';

const API_URL = process.env.KYBERNUS_API_URL || 'https://kybernus-cli.vercel.app/api';

interface RegisterOptions {
    google?: boolean;
}

export async function registerCommand(options: RegisterOptions = {}) {
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

    // Google OAuth flow
    if (options.google) {
        await handleGoogleRegister(configManager);
        return;
    }

    // Traditional email/password registration
    await handleEmailRegister(configManager);
}

async function handleGoogleRegister(configManager: ConfigManager) {
    const spinner = clack.spinner();
    spinner.start('Requesting authentication code...');

    try {
        const deviceCode = await requestDeviceCode();
        spinner.stop();

        clack.log.info('🔐 Google Authentication Required\n');
        clack.log.message(`Visit: ${deviceCode.verificationUrl}`);
        clack.log.message(`Enter code: ${deviceCode.userCode}\n`);

        const continueAuth = await clack.confirm({
            message: 'Press Enter once you\'ve opened the URL in your browser',
        });

        if (clack.isCancel(continueAuth) || !continueAuth) {
            clack.cancel('Registration cancelled');
            process.exit(0);
        }

        spinner.start('Waiting for authentication...');

        const result = await waitForAuth(deviceCode.deviceCode, deviceCode.interval);

        spinner.stop();

        if (result.licenseKey && result.email) {
            // Save credentials
            configManager.setLicenseKey(result.licenseKey);
            configManager.setEmail(result.email);
            configManager.setLicenseTier(result.tier === 'PRO' ? 'PRO' : 'FREE');

            // Track registration
            const analytics = new AnalyticsClient();
            analytics.track('user_registered', { email: result.email, method: 'google' });

            clack.note(
                `Email: ${result.email}\nLicense Key: ${result.licenseKey}\nPlan: Metered Trial (3 Projects included)`,
                'Registration Successful'
            );

            clack.outro('🎉 You are now ready to build amazing projects with Kybernus!');
        } else {
            clack.log.error('Registration failed. Please try again.');
            process.exit(1);
        }

    } catch (error: any) {
        spinner.stop();
        clack.log.error(error.message || 'Registration failed');
        process.exit(1);
    }
}

async function handleEmailRegister(configManager: ConfigManager) {
    const email = await clack.text({
        message: 'Enter your email address to unlock 3 Free Pro Projects (Metered Trial):',
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

    const password = await clack.password({
        message: 'Create a password (8+ chars, uppercase, lowercase, number, special character):',
        validate: (value) => {
            if (!value) return 'Password is required';
            if (value.length < 8) return 'Password must be at least 8 characters';
            if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter';
            if (!/[a-z]/.test(value)) return 'Password must contain at least one lowercase letter';
            if (!/[0-9]/.test(value)) return 'Password must contain at least one number';
            if (!/[^A-Za-z0-9]/.test(value)) return 'Password must contain at least one special character (!@#$%...)';
        },
    });

    if (clack.isCancel(password)) {
        clack.outro('Operation cancelled.');
        process.exit(0);
    }

    const s = clack.spinner();
    s.start('Registering account...');

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
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
        analytics.track('user_registered', { email, method: 'email' });

        s.stop('Registration successful! 🎉');

        clack.note(
            `License Key: ${data.licenseKey}\nPlan: Metered Trial (3 Projects included)`,
            'Trial Activated'
        );

        clack.outro('You are now ready to build amazing projects with Kybernus!');

    } catch (error: any) {
        s.stop('Error connecting to server');
        clack.log.error(error.message);
    }
}
