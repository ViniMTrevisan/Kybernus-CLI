import * as clack from '@clack/prompts';
import color from 'picocolors';
import { runWizard } from '../prompts/wizard.js';
import { ProjectGenerator } from '../../core/generator/project.js';
import { AnalyticsClient } from '../services/AnalyticsClient.js';

interface InitOptions {
    name?: string;
    stack?: string;
    architecture?: string;
    buildTool?: string;
    ai?: boolean;
    nonInteractive?: boolean;
}

export async function initCommand(options: InitOptions) {
    // Run interactive wizard (or use options if non-interactive)
    // Implicitly pass 'pro' tier or handle inside wizard to defaults
    // Privacy Notice
    console.log('');
    console.log(color.dim('📊 Anonymous usage data is collected to improve Kybernus.'));
    console.log(color.dim('   No personal information is tracked. Opt-out anytime:'));
    console.log(color.dim('   kybernus analytics --disable'));
    console.log(color.dim('   Learn more: https://getkybernus.com/privacy'));
    console.log('');

    const config = await runWizard(options);

    // Generate project
    const generator = new ProjectGenerator();
    await generator.generate(config, process.cwd());

    // Track generation
    const analytics = new AnalyticsClient();
    analytics.track('project_generated', {
        name: config.projectName,
        stack: config.stack,
        architecture: config.architecture,
        tier: 'opensource',
        command: 'init'
    });

    clack.outro('🎉 Project created successfully! Happy coding!');
}
