import { Command } from 'commander';
import * as clack from '@clack/prompts';
import color from 'picocolors';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper for cancellation
function exitIfCancelled(value: any) {
    if (clack.isCancel(value)) {
        clack.outro('❌ Operation cancelled.');
        process.exit(0);
    }
}

export const ecommerceCommand = new Command('ecommerce')
    .description('Generate a complete white-label E-commerce template')
    .action(async () => {
        clack.intro(color.bgCyan(color.black(' kybernus ecommerce ')));

        clack.note(
            `${color.bold('📦 Tech Stack')}\n` +
            `  • Backend: Express.js, TypeScript, PostgreSQL, Prisma, Redis\n` +
            `  • Frontend: React 18, Vite\n` +
            `  • Infra: Docker, S3/MinIO, SMTP/Mailpit\n\n` +
            `${color.bold('✨ Features')}\n` +
            `  • Fully White-label (Dynamic branding & colors)\n` +
            `  • Integrated Payments (Stripe: Card, Pix, Boleto)\n` +
            `  • Shopping Cart & Checkout flow\n` +
            `  • Admin Dashboard & Image Uploads\n\n` +
            `${color.bold('🛠️  Quality')}\n` +
            `  • Built with Test-Driven Development (TDD)\n` +
            `  • Automated Tests (Jest, Supertest, RTL)\n` +
            `  • CI/CD Ready`,
            color.magenta('E-Commerce White-Label Template')
        );

        clack.log.info('Welcome! Let\'s setup your new E-commerce project.');

        // 1. Ask for directory name
        const projectName = await clack.text({
            message: 'What is the name of your new E-commerce project?',
            placeholder: 'my-store',
            defaultValue: 'my-store',
        });
        exitIfCancelled(projectName);

        // 2. Ask for E-commerce details (Allow empty for CNPJ and specific details)
        const storeName = await clack.text({
            message: 'Store Name:',
            placeholder: 'My Store',
            defaultValue: 'My Store',
        });
        exitIfCancelled(storeName);

        const companyName = await clack.text({
            message: 'Company Name (Legal):',
            placeholder: 'My Store LLC',
            defaultValue: 'My Store LLC',
        });
        exitIfCancelled(companyName);

        const cnpj = await clack.text({
            message: 'CNPJ (Optional - press enter to skip):',
            placeholder: '',
            defaultValue: '',
        });
        exitIfCancelled(cnpj);

        const address = await clack.text({
            message: 'Commercial Address (Optional):',
            placeholder: '123 Main St - New York, NY',
            defaultValue: '',
        });
        exitIfCancelled(address);

        const supportEmail = await clack.text({
            message: 'Support Email (Optional):',
            placeholder: 'support@mystore.com',
            defaultValue: '',
        });
        exitIfCancelled(supportEmail);

        const privacyEmail = await clack.text({
            message: 'Privacy Email (Optional):',
            placeholder: 'privacy@mystore.com',
            defaultValue: '',
        });
        exitIfCancelled(privacyEmail);

        const storeUrl = await clack.text({
            message: 'Store URL (Optional):',
            placeholder: 'https://mystore.com',
            defaultValue: '',
        });
        exitIfCancelled(storeUrl);

        let primaryColor = await clack.text({
            message: 'Primary Color (Hex, e.g., #6366F1):',
            placeholder: '#6366F1',
            defaultValue: '#6366F1',
        });
        exitIfCancelled(primaryColor);

        // Basic Hex color validation
        if (typeof primaryColor === 'string' && !primaryColor.match(/^#[0-9A-Fa-f]{6}$/)) {
            clack.log.warn(`Invalid hex color. Falling back to default #6366F1`);
            primaryColor = '#6366F1';
        }

        const spinner = clack.spinner();
        spinner.start('🏗️  Scaffolding E-commerce template...');

        try {
            const cwd = process.cwd();
            const projectPath = path.join(cwd, projectName as string);

            if (await fs.pathExists(projectPath)) {
                spinner.stop('❌ Target directory already exists');
                process.exit(1);
            }

            // Define template source path (Executing from dist/cli/commands/ecommerce.js)
            const templatePath = path.resolve(__dirname, '../../../templates/ecommerce');

            if (!(await fs.pathExists(templatePath))) {
                spinner.stop('❌ E-commerce template not found in templates/ecommerce');
                process.exit(1);
            }

            // Copy all files
            spinner.message('📁 Copying template files...');
            await fs.copy(templatePath, projectPath);

            // 4. Inject variables
            spinner.message('💉 Injecting store configurations...');

            const siteConfigPath = path.join(projectPath, 'apps/web/src/shared/config/siteConfig.ts');
            const tokensPath = path.join(projectPath, 'apps/web/src/shared/theme/tokens.ts');

            const replaceInFile = async (filePath: string, replacements: { regex: RegExp; replaceValue: string }[]) => {
                if (await fs.pathExists(filePath)) {
                    let content = await fs.readFile(filePath, 'utf-8');
                    for (const { regex, replaceValue } of replacements) {
                        content = content.replace(regex, replaceValue);
                    }
                    await fs.writeFile(filePath, content, 'utf-8');
                }
            };

            // siteConfig replacements
            await replaceInFile(siteConfigPath, [
                { regex: /name:\s*'.*',/g, replaceValue: `name: '${String(storeName)}',` },
                { regex: /url:\s*'.*',/g, replaceValue: `url: '${String(storeUrl)}',` },
                { regex: /supportEmail:\s*'.*',/g, replaceValue: `supportEmail: '${String(supportEmail)}',` },
                { regex: /privacyEmail:\s*'.*',/g, replaceValue: `privacyEmail: '${String(privacyEmail)}',` },
                { regex: /companyName:\s*'.*',/g, replaceValue: `companyName: '${String(companyName)}',` },
                { regex: /cnpj:\s*'.*',/g, replaceValue: `cnpj: '${String(cnpj)}',` },
                { regex: /address:\s*'.*',/g, replaceValue: `address: '${String(address)}',` },
            ]);

            // tokens replacements
            await replaceInFile(tokensPath, [
                { regex: /storeName:\s*'.*',/g, replaceValue: `storeName: '${String(storeName)}',` },
                { regex: /primary:\s*'#[0-9A-Fa-f]{6}',/g, replaceValue: `primary: '${String(primaryColor)}',` },
            ]);

            // Write .kybernusrc.json for future CLI compatibility
            const rcContent = {
                projectName: String(projectName),
                stack: 'ecommerce',
                architecture: 'white-label',
                buildTool: 'npm',
                createdAt: new Date().toISOString()
            };
            await fs.writeFile(
                path.join(projectPath, '.kybernusrc.json'),
                JSON.stringify(rcContent, null, 2),
                'utf-8'
            );

            spinner.stop('✅ E-commerce generated successfully!');

            // 5. Outro
            clack.note(
                `📁 Enter the project directory:\n   cd ${String(projectName)}\n\n` +
                `📦 Install dependencies:\n   npm install\n\n` +
                `🚀 Start the environment:\n   npm run dev\n\n` +
                `📝 Check README.md for more details`,
                '✨ Next steps'
            );

            clack.outro('Happy Selling! 🛒');

        } catch (error: any) {
            spinner.stop('❌ Error generating E-commerce project');
            clack.log.error(error.message);
            process.exit(1);
        }
    });

