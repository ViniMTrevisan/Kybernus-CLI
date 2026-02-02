import * as clack from '@clack/prompts';
import { ConfigManager } from '../../core/config/config-manager.js';
import { LicenseValidator } from '../../core/auth/license-validator.js';
import { requestDeviceCode, waitForAuth } from '../../core/auth/device-flow.js';

interface LoginOptions {
    key?: string;
    google?: boolean;
}

export async function loginCommand(options: LoginOptions) {
    clack.intro('🔐 Kybernus Pro Login');

    const configManager = new ConfigManager();

    // Google OAuth flow
    if (options.google) {
        await handleGoogleLogin(configManager);
        return;
    }

    // Traditional license key login
    const validator = new LicenseValidator();
    let licenseKey = options.key;

    // If no key provided via flag, prompt for it
    if (!licenseKey) {
        const keyInput = await clack.text({
            message: 'Enter your Pro license key:',
            placeholder: 'KYB-PRO-XXXX-XXXX-XXXX-XXXXXXXX',
            validate: (value) => {
                if (!value) return 'License key is required';
            },
        });

        if (clack.isCancel(keyInput)) {
            clack.cancel('Login cancelled');
            process.exit(0);
        }

        licenseKey = keyInput as string;
    }

    // Validate the key
    const spinner = clack.spinner();
    spinner.start('Validating license key...');

    const result = await validator.validate(licenseKey);

    spinner.stop();

    if (!result.valid) {
        clack.log.error(result.message || 'Invalid license key');
        process.exit(1);
    }

    // Save license to config
    configManager.setLicenseKey(licenseKey);
    configManager.setLicenseTier(result.tier);
    if (result.expiration) {
        configManager.setLicenseExpiration(result.expiration.toISOString());
    }

    clack.outro('✅ Successfully authenticated! You now have access to Pro features.');
}

async function handleGoogleLogin(configManager: ConfigManager) {
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
            clack.cancel('Login cancelled');
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

            clack.note(
                `Email: ${result.email}\nLicense Key: ${result.licenseKey}\nTier: ${result.tier || 'Trial'}`,
                'Authentication Successful'
            );

            clack.outro('✅ Successfully authenticated with Google!');
        } else {
            clack.log.error('Authentication failed. Please try again.');
            process.exit(1);
        }

    } catch (error: any) {
        spinner.stop();
        clack.log.error(error.message || 'Authentication failed');
        process.exit(1);
    }
}
