#!/usr/bin/env node

import { Command } from 'commander';
import { initCommand } from './cli/commands/init.js';
import { analyticsCommand } from './cli/commands/analytics.js';
import { createRequire } from 'module';

const requirePkg = createRequire(import.meta.url);
const pkg = requirePkg('../package.json');

const program = new Command();

program
    .name('kybernus')
    .description('Professional CLI for scaffolding production-ready backend and fullstack projects')
    .version(pkg.version);

program
    .command('init')
    .description('Initialize a new project')
    .option('-n, --name <name>', 'Project name')
    .option('-s, --stack <stack>', 'Technology stack (nextjs, java-spring, nodejs-express, python-fastapi, nestjs)')
    .option('-a, --architecture <arch>', 'Architecture (mvc, clean, hexagonal)')
    .option('-b, --build-tool <tool>', 'Build tool (maven, gradle, npm, pnpm, yarn)')
    .option('--no-ai', 'Skip AI documentation generation')
    .option('--non-interactive', 'Run in non-interactive mode (requires all options)')
    .action(initCommand);

program.addCommand(analyticsCommand);

program.parse();
