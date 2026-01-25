import * as clack from '@clack/prompts';
import { ProjectConfig, LicenseTier, Stack, Architecture, BuildTool } from '../../models/config.js';
import { toKebabCase } from '../../core/generator/context-builder.js';

export interface ConfigOptions {
  name?: string;
  stack?: string;
  architecture?: string;
  buildTool?: string;
  packageName?: string;
  ai?: boolean;
  geminiKey?: string;
  nonInteractive?: boolean;
  docker?: boolean;
  cicd?: boolean;
  terraform?: boolean;
}

export async function runWizard(licenseTier: LicenseTier, options: ConfigOptions = {}): Promise<ProjectConfig> {
  // If non-interactive mode, validate required options
  if (options.nonInteractive) {
    if (!options.name || !options.stack) {
      throw new Error('Non-interactive mode requires --name and --stack. Architecture defaults to mvc if not specified.');
    }

    // Default DevOps flags for Pro non-interactive
    const devops = {
      docker: options.docker || false,
      cicd: options.cicd || false,
      terraform: options.terraform || false
    };

    return {
      projectName: options.name,
      stack: options.stack as Stack,
      architecture: (options.architecture as Architecture) || 'mvc',
      buildTool: (options.buildTool as BuildTool) || 'npm',
      packageName: options.packageName,
      useAI: options.ai || false,
      geminiKey: options.geminiKey,
      devops,
      licenseTier
    };
  }

  clack.intro('🚀 Welcome to Kybernus');

  // Pre-fill prompt default values based on passed options
  const answers = await clack.group(
    {
      projectName: () =>
        clack.text({
          message: 'Project name:',
          placeholder: 'my-project',
          initialValue: options.name,
          validate: (value) => {
            if (!value) return 'Name is required';
            if (!/^[a-z0-9-]+$/.test(value)) {
              return 'Use only lowercase letters, numbers and hyphens';
            }
          },
        }),

      stack: () =>
        clack.select({
          message: 'Choose your stack:',
          initialValue: options.stack,
          options: [
            { value: 'nextjs', label: 'Next.js (React + TypeScript)' },
            { value: 'java-spring', label: 'Java Spring Boot' },
            { value: 'nodejs-express', label: 'Node.js + Express' },
            ...(licenseTier === 'pro'
              ? [
                { value: 'python-fastapi', label: '🌟 Python FastAPI (Pro)' },
                { value: 'nestjs', label: '🌟 NestJS (Pro)' },
              ]
              : []),
          ],
        }),

      buildTool: ({ results }) => {
        if (results.stack !== 'java-spring') return;

        return clack.select({
          message: 'Build tool:',
          initialValue: options.buildTool,
          options: [
            { value: 'maven', label: 'Maven (Gradle coming soon)' },
          ],
        });
      },

      packageName: ({ results }) => {
        if (results.stack !== 'java-spring') return;

        return clack.text({
          message: 'Package name (e.g., com.user.project):',
          placeholder: 'com.user.project',
          initialValue: options.packageName,
          validate: (value) => {
            if (!value) return 'Package name is required for Java';
            if (!/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(value)) {
              return 'Invalid package name (e.g., com.user.project)';
            }
          },
        });
      },

      architecture: ({ results }) => {
        // Next.js has different architecture options (default vs mvc)
        if (results.stack === 'nextjs') {
          const nextjsOptions = [{ value: 'default', label: 'Default Structure (Free)' }];

          // MVC option only in Pro
          if (licenseTier === 'pro') {
            nextjsOptions.push({ value: 'mvc', label: '🌟 MVC Structure (Pro)' });
          }

          return clack.select({
            message: 'Template:',
            initialValue: options.architecture || 'default',
            options: nextjsOptions,
          });
        }

        // Backend stacks support MVC/Clean/Hexagonal
        const backendStacks = ['java-spring', 'nodejs-express', 'python-fastapi', 'nestjs'];
        if (!backendStacks.includes(results.stack as string)) return;

        const uiOptions = [{ value: 'mvc', label: 'MVC (Model-View-Controller)' }];

        // Advanced architectures only in Pro
        if (licenseTier === 'pro') {
          uiOptions.push(
            { value: 'clean', label: '🌟 Clean Architecture (Pro)' },
            { value: 'hexagonal', label: '🌟 Hexagonal Architecture (Pro)' }
          );
        }

        return clack.select({
          message: 'Architecture:',
          initialValue: options.architecture,
          options: uiOptions,
        });
      },

      useAI: () =>
        clack.confirm({
          message: 'Generate AI documentation (Google Gemini)?',
          initialValue: options.ai || false,
        }),

      geminiKey: ({ results }) => {
        if (!results.useAI) return;
        // If key already provided in options, don't ask
        if (options.geminiKey) return;

        return clack.password({
          message: 'Gemini API Key:',
          validate: (value) => {
            if (!value) return 'API Key is required to use AI';
          },
        });
      },

      devops: async ({ results }) => {
        if (licenseTier !== 'pro') return [];

        // If devops flags already set, assume override mode
        if (options.docker || options.cicd || options.terraform) {
          return;
        }

        const selected = await clack.multiselect({
          message: "DevOps & Infrastructure (use Space to select, or 'A' to select all):",
          options: [
            { value: 'docker', label: 'Docker + Docker Compose' },
            { value: 'ci-cd', label: 'GitHub Actions CI/CD' },
            { value: 'terraform', label: 'Terraform (AWS)' },
          ],
          required: false,
        });

        return selected;
      },
    },
    {
      onCancel: () => {
        clack.cancel('Operation cancelled');
        process.exit(0);
      },
    }
  );

  return {
    projectName: answers.projectName as string,
    stack: answers.stack as Stack,
    architecture: answers.architecture as Architecture | undefined,
    buildTool: answers.buildTool as BuildTool | undefined,
    packageName: answers.packageName as string | undefined,
    useAI: answers.useAI as boolean,
    geminiKey: (options.geminiKey || answers.geminiKey) as string | undefined,
    devops: {
      docker: options.docker || (answers.devops as string[] | undefined)?.includes('docker') || false,
      cicd: options.cicd || (answers.devops as string[] | undefined)?.includes('ci-cd') || false,
      terraform: options.terraform || (answers.devops as string[] | undefined)?.includes('terraform') || false,
    },
    licenseTier,
  };
}
