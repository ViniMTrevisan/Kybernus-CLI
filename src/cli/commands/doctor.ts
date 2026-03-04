import { Command } from 'commander';
import * as clack from '@clack/prompts';
import color from 'picocolors';
import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';

export const doctorCommand = new Command('doctor')
    .description('Check the health of your environment and project')
    .action(async () => {
        clack.intro(color.bgCyan(color.black(' Kybernus Doctor ')));

        const s = clack.spinner();
        s.start('Diagnosing environment...');

        const checkCommand = (cmd: string): string | null => {
            try {
                return execSync(cmd, { stdio: 'pipe', encoding: 'utf-8' }).trim();
            } catch {
                return null;
            }
        };

        const envChecks = [
            { name: 'Node.js', cmd: 'node -v' },
            { name: 'npm', cmd: 'npm -v' },
            { name: 'yarn', cmd: 'yarn -v' },
            { name: 'pnpm', cmd: 'pnpm -v' },
            { name: 'Python', cmd: 'python3 --version || python --version' },
            { name: 'Java', cmd: 'java -version 2>&1 | head -n 1' },
            { name: 'Maven', cmd: 'mvn -v | head -n 1' },
            { name: 'Docker', cmd: 'docker -v' }
        ];

        const results = envChecks.map(check => {
            const result = checkCommand(check.cmd);
            return {
                name: check.name,
                installed: !!result,
                version: result ? (result.includes('\n') ? result.split('\n')[0] : result) : 'Not found'
            };
        });

        s.stop('Environment diagnosis complete.');

        clack.log.step('Global Environment');
        results.forEach(res => {
            if (res.installed) {
                clack.log.success(`${color.green('✔')} ${res.name}: ${color.dim(res.version)}`);
            } else {
                clack.log.message(`${color.gray('○')} ${res.name}: ${color.dim('Not installed (Optional depending on stack)')}`);
            }
        });

        // Project Checks
        const cwd = process.cwd();
        clack.log.step('Project Context');

        const hasPackageJson = fs.existsSync(path.join(cwd, 'package.json'));
        const hasPomXml = fs.existsSync(path.join(cwd, 'pom.xml'));
        const hasRequirementsTxt = fs.existsSync(path.join(cwd, 'requirements.txt'));

        let projectType: string[] = [];
        let isProject = false;

        if (hasPackageJson) {
            isProject = true;
            projectType.push('Node.js');
            const hasNodeModules = fs.existsSync(path.join(cwd, 'node_modules'));
            if (hasNodeModules) {
                clack.log.success(`${color.green('✔')} Dependencies: node_modules found`);
            } else {
                clack.log.warn(`${color.yellow('▲')} Dependencies: node_modules missing. Run 'npm install', 'yarn', or 'pnpm install'`);
            }
        }

        if (hasPomXml) {
            isProject = true;
            projectType.push('Java/Maven');
            clack.log.success(`${color.green('✔')} Dependencies: pom.xml found`);
        }

        if (hasRequirementsTxt) {
            isProject = true;
            projectType.push('Python');
            // Try to detect venv
            const hasVenv = fs.existsSync(path.join(cwd, 'venv')) || fs.existsSync(path.join(cwd, '.venv'));
            if (hasVenv) {
                clack.log.success(`${color.green('✔')} Dependencies: Virtual environment found`);
            } else {
                clack.log.warn(`${color.yellow('▲')} Dependencies: Virtual environment (venv/.venv) not found or not in root`);
            }
        }

        if (isProject) {
            clack.log.info(`Project Type: ${color.cyan(projectType.join(', '))}`);
        } else {
            clack.log.message(`${color.gray('○')} No standard project files (package.json, pom.xml, requirements.txt) found in current directory.`);
        }

        // Env checks
        const hasEnvExample = fs.existsSync(path.join(cwd, '.env.example'));
        const hasEnv = fs.existsSync(path.join(cwd, '.env'));

        if (hasEnvExample) {
            if (hasEnv) {
                clack.log.success(`${color.green('✔')} Environment Files: .env and .env.example found`);
            } else {
                clack.log.warn(`${color.yellow('▲')} Environment Files: .env.example found, but .env is missing. You should copy it.`);
            }
        } else if (hasEnv) {
            clack.log.success(`${color.green('✔')} Environment Files: .env found`);
        } else {
            clack.log.message(`${color.gray('○')} Environment Files: No .env files found`);
        }

        clack.outro(color.green('Doctor check finished!'));
    });
