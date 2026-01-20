import * as clack from '@clack/prompts';
import { ConfigManager } from '../../core/config/config-manager.js';
import { LicenseValidator } from '../../core/auth/license-validator.js';

interface LoginOptions {
    key?: string;
}

export async function loginCommand(options: LoginOptions) {
    clack.intro('🔐 Kybernus Pro Login');

    const configManager = new ConfigManager();
    const validator = new LicenseValidator();

    let licenseKey = options.key;

    // If no key provided via flag, prompt for it
    if (!licenseKey) {
        const keyInput = await clack.text({
            message: 'Enter your Pro license key:',
            placeholder: 'KYB-PRO-XXXXXXXX',
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
