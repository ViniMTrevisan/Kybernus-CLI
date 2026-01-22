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

    // Determinar tier de licença
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
            '🆓 Modo Free ativo\n\nVocê está usando o Kybernus Free. Para acessar:\n- Arquiteturas avançadas (Clean, Hexagonal)\n- Stacks adicionais (Python FastAPI, NestJS)\n- DevOps completo (Docker, CI/CD, Terraform)\n\nAdquira uma licença Pro em: https://kybernus.dev/pro',
            'ℹ️  Informação'
        );
    } else {
        clack.note('🌟 Modo Pro ativo\n\nVocê tem acesso a todos os recursos!', '✨ Pro');
    }

    // Executar wizard interativo (ou usar options se non-interactive)
    const config = await runWizard(licenseTier, options);

    // Inject licenseKey into config if available
    if (licenseKey) {
        config.licenseKey = licenseKey;
    }

    // Validate project limit (Metered Trial)
    if (licenseTier === 'pro' && licenseKey) {
        const spinner = clack.spinner();
        spinner.start('Validando cota de projetos...');

        const creditCheck = await validator.consumeCredit(licenseKey);

        spinner.stop('Cota verificada');

        if (!creditCheck.authorized) {
            clack.log.error(creditCheck.message || 'Criação de projeto bloqueada por limite da licença.');
            if (creditCheck.message?.includes('Trial limit')) {
                clack.note('🔓 Desbloqueie projetos ilimitados com Kybernus Pro lifetime.\nExecute: kybernus upgrade', 'Limite Atingido');
            }
            return; // Stop generation
        }

        if (creditCheck.remaining !== undefined && creditCheck.remaining >= 0) {
            clack.log.info(`Créditos Trial: ${creditCheck.usage}/${creditCheck.limit} utilizados. (${creditCheck.remaining} restantes)`);
        }
    }

    // Gerar projeto
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

    clack.outro('🎉 Projeto criado com sucesso! Bom desenvolvimento!');
}
