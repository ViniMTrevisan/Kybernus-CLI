import * as clack from '@clack/prompts';
import { runWizard } from '../prompts/wizard.js';
import { ProjectGenerator } from '../../core/generator/project.js';
import { LicenseTier } from '../../models/config.js';
import { ConfigManager } from '../../core/config/config-manager.js';
import { LicenseValidator } from '../../core/auth/license-validator.js';
import { AnalyticsClient } from '../services/AnalyticsClient.js';

interface InitOptions {
    name?: string;
    stack?: string;
    architecture?: string;
    buildTool?: string;
    license?: string;
    ai?: boolean;
    nonInteractive?: boolean;
}

export async function initCommand(options: InitOptions) {
    const configManager = new ConfigManager();
    const validator = new LicenseValidator();

    // Determine license tier
    let licenseTier: LicenseTier = 'free';
    let licenseKey: string | undefined = options.license;

    // If no license provided via flag, check stored config
    if (!licenseKey) {
        licenseKey = configManager.getLicenseKey();
    }

    // Validate license if present
    if (licenseKey) {
        const result = await validator.validate(licenseKey);

        if (result.valid && result.tier === 'PRO') {
            const expiration = configManager.getLicenseExpiration();

            // Check if license is still active
            if (validator.isLicenseActive(expiration)) {
                licenseTier = 'pro';
            } else {
                clack.log.warn('Your Pro license has expired. Switching to Free mode.');
                configManager.clearLicense();
            }
        }
    }

    if (licenseTier === 'free') {
        clack.note(
            '🆓 Free Mode Active\n\nYou are using Kybernus Free. To access:\n- Advanced Architectures (Clean, Hexagonal)\n- Additional Stacks (Python FastAPI, NestJS)\n- Complete DevOps (Docker, CI/CD, Terraform)\n\nTo unlock Pro features, run: kybernus upgrade',
            'ℹ️  Information'
        );
    } else {
        clack.note('🌟 Pro Mode Active\n\nYou have access to all features!', '✨ Pro');
    }

    // Run interactive wizard (or use options if non-interactive)
    const config = await runWizard(licenseTier, options);

    // Inject licenseKey into config if available
    if (licenseKey) {
        config.licenseKey = licenseKey;
    }

    // Validate project limit (Metered Trial)
    if (licenseTier === 'pro' && licenseKey) {
        const spinner = clack.spinner();
        spinner.start('Validating project quota...');

        const creditCheck = await validator.consumeCredit(licenseKey);

        spinner.stop('Quota verified');

        if (!creditCheck.authorized) {
            clack.log.error(creditCheck.message || 'Project creation blocked by license limit.');
            if (creditCheck.message?.includes('Trial limit')) {
                clack.note('🔓 Unlock unlimited projects with Kybernus Pro lifetime.\nRun: kybernus upgrade', 'Limit Reached');
            }
            return; // Stop generation
        }

        if (creditCheck.remaining !== undefined && creditCheck.remaining >= 0) {
            clack.log.info(`Trial Credits: ${creditCheck.usage}/${creditCheck.limit} used. (${creditCheck.remaining} remaining)`);
        }
    }

    // Generate project
    const generator = new ProjectGenerator();
    await generator.generate(config, process.cwd());

    // Track generation
    const analytics = new AnalyticsClient();
    analytics.track('project_generated', {
        name: config.projectName,
        stack: config.stack,
        architecture: config.architecture,
        tier: licenseTier,
        command: 'init'
    });

    clack.outro('🎉 Project created successfully! Happy coding!');
}
