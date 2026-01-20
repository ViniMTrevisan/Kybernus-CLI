#!/usr/bin/env node

import { Command } from 'commander';
import { initCommand } from './cli/commands/init.js';
import { loginCommand } from './cli/commands/login.js';
import { logoutCommand } from './cli/commands/logout.js';

const program = new Command();

program
    .name('kybernus')
    .description('Open Core CLI for scaffolding production-ready backend and fullstack projects')
    .version('0.1.0');

program
    .command('init')
    .description('Initialize a new project')
    .option('-n, --name <name>', 'Project name')
    .option('-s, --stack <stack>', 'Technology stack (nextjs, java-spring, nodejs-express, python-fastapi, nestjs)')
    .option('-a, --architecture <arch>', 'Architecture (mvc, clean, hexagonal)')
    .option('-b, --build-tool <tool>', 'Build tool (maven, gradle, npm, pnpm, yarn)')
    .option('-l, --license <key>', 'Pro license key')
    .option('--no-ai', 'Skip AI documentation generation')
    .option('--non-interactive', 'Run in non-interactive mode (requires all options)')
    .action(initCommand);

program
    .command('login')
    .description('Authenticate with a Pro license key')
    .option('-k, --key <key>', 'Pro license key')
    .action(loginCommand);

import { registerCommand } from './cli/commands/register.js';
import { statusCommand } from './cli/commands/status.js';
import { upgradeCommand } from './cli/commands/upgrade.js';

// ... (existing layout)

program
    .command('register')
    .description('Start a 15-day Free Trial (Full Access)')
    .action(registerCommand);

program
    .command('status')
    .description('Check your current license status and validity')
    .action(statusCommand);

program
    .command('upgrade')
    .description('Upgrade to Monthly Subscription or Pro Lifetime')
    .action(upgradeCommand);

program
    .command('logout')
    .description('Remove Pro/Trial license and switch to restricted Free mode')
    .action(logoutCommand);

program.parse();
