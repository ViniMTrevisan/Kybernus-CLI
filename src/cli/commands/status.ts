import * as clack from '@clack/prompts';
import { ConfigManager } from '../../core/config/config-manager.js';
import { LicenseValidator } from '../../core/auth/license-validator.js';

export async function statusCommand() {
    console.clear();
    clack.intro('📊 Kybernus Status');

    const configManager = new ConfigManager();
    const validator = new LicenseValidator();
    const key = configManager.getLicenseKey();

    if (!key) {
        clack.log.warn('No license found. You are running in unregistered mode.');
        clack.outro('Run "kybernus register" to start a Free Trial.');
        return;
    }

    const s = clack.spinner();
    s.start('Validating license...');

    const result = await validator.validate(key);
    s.stop('Validation complete');

    // Update local cache based on remote validation
    configManager.setLicenseTier(result.tier);
    if (result.expiration) {
        configManager.setLicenseExpiration(result.expiration.toISOString());
    }

    const statusMap: Record<string, string> = {
        'TRIAL': '🟢 Active Trial (All Features Unlocked)',
        'TRIAL_EXPIRED': '🔴 Trial Expired',
        'FREE_ACTIVE': '🟢 Active Monthly Subscription',
        'FREE_PAST_DUE': '🟠 Subscription Past Due',
        'PRO_ACTIVE': '💎 Pro Lifetime',
        'CANCELLED': '🔴 Cancelled'
    };

    const statusLabel = result.status ? (statusMap[result.status] || result.status) : 'Unknown';

    let details = `License Key: ${key}\n` +
        `Tier: ${result.tier}\n` +
        `Status: ${statusLabel}\n`;

    if (result.status === 'TRIAL' && result.limit !== undefined) {
        details += `Usage: ${result.usage}/${result.limit} Projects\n`;
    } else {
        details += `Expires: ${result.expiration ? result.expiration.toLocaleDateString() : 'Never'}\n`;
    }

    details += `Message: ${result.message || ''}`;

    clack.note(
        details,
        'License Information'
    );

    clack.outro('Use "kybernus upgrade" to change your plan.');
}
