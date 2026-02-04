import { Command } from 'commander';
import { ConfigManager } from '../../core/config/config-manager.js';
import * as clack from '@clack/prompts';
import color from 'picocolors';

export const analyticsCommand = new Command('analytics')
    .description('Manage anonymous usage reporting settings')
    .option('--enable', 'Enable anonymous usage reporting')
    .option('--disable', 'Disable anonymous usage reporting')
    .option('--status', 'Show current reporting status')
    .action(async (options) => {
        const config = new ConfigManager();

        if (options.enable) {
            config.setAnalyticsEnabled(true);
            clack.log.success(color.green('✔ Anonymous usage reporting enabled. Thank you for helping us improve!'));
        } else if (options.disable) {
            config.setAnalyticsEnabled(false);
            clack.log.warn(color.yellow('✔ Anonymous usage reporting disabled.'));
        } else {
            const status = config.isAnalyticsEnabled();
            if (status) {
                clack.log.info(`Analytics: ${color.green('ENABLED')}`);
            } else {
                clack.log.info(`Analytics: ${color.red('DISABLED')}`);
            }
            clack.log.message('Use --enable or --disable to change this setting.');
        }
    });
