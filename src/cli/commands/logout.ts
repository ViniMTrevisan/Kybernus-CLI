import * as clack from '@clack/prompts';
import { ConfigManager } from '../../core/config/config-manager.js';

export async function logoutCommand() {
    clack.intro('🔓 Kybernus Logout');

    const configManager = new ConfigManager();
    const currentKey = configManager.getLicenseKey();

    if (!currentKey) {
        clack.log.warn('No active license found');
        clack.outro('Already in Free mode');
        return;
    }

    const shouldLogout = await clack.confirm({
        message: 'Are you sure you want to logout? You will lose access to Pro features.',
    });

    if (clack.isCancel(shouldLogout) || !shouldLogout) {
        clack.cancel('Logout cancelled');
        return;
    }

    configManager.clearLicense();

    clack.outro('✅ Successfully logged out. Switched to Free mode.');
}
