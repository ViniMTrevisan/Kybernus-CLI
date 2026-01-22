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
  // Se for modo não interativo, validar options obrigatórias
  if (options.nonInteractive) {
    if (!options.name || !options.stack) {
      throw new Error('Modo não interativo requer --name e --stack. Arquitetura assume padrão se não informada.');
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

  clack.intro('🚀 Bem-vindo ao Kybernus');

  // Pre-fill prompt default values based on passed options
  const answers = await clack.group(
    {
      projectName: () =>
        clack.text({
          message: 'Nome do projeto:',
          placeholder: 'meu-projeto',
          initialValue: options.name,
          validate: (value) => {
            if (!value) return 'Nome é obrigatório';
            if (!/^[a-z0-9-]+$/.test(value)) {
              return 'Use apenas letras minúsculas, números e hífens';
            }
          },
        }),

      stack: () =>
        clack.select({
          message: 'Escolha a stack:',
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
            { value: 'maven', label: 'Maven (Gradle em breve)' },
          ],
        });
      },

      packageName: ({ results }) => {
        if (results.stack !== 'java-spring') return;

        return clack.text({
          message: 'Package name (ex: com.usuario.projeto):',
          placeholder: 'com.usuario.projeto',
          initialValue: options.packageName,
          validate: (value) => {
            if (!value) return 'Package name é obrigatório para Java';
            if (!/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(value)) {
              return 'Package name inválido (ex: com.usuario.projeto)';
            }
          },
        });
      },

      architecture: ({ results }) => {
        // Apenas stacks backend suportam arquiteturas diferentes
        const backendStacks = ['java-spring', 'nodejs-express', 'python-fastapi', 'nestjs'];
        if (!backendStacks.includes(results.stack as string)) return;

        const uiOptions = [{ value: 'mvc', label: 'MVC (Model-View-Controller)' }];

        // Arquiteturas avançadas apenas no Pro
        if (licenseTier === 'pro') {
          uiOptions.push(
            { value: 'clean', label: '🌟 Clean Architecture (Pro)' },
            { value: 'hexagonal', label: '🌟 Hexagonal Architecture (Pro)' }
          );
        }

        return clack.select({
          message: 'Arquitetura:',
          initialValue: options.architecture,
          options: uiOptions,
        });
      },

      useAI: () =>
        clack.confirm({
          message: 'Gerar documentação com IA (Google Gemini)?',
          initialValue: options.ai || false,
        }),

      geminiKey: ({ results }) => {
        if (!results.useAI) return;
        // Se a key já vier nas options, não pergunta
        if (options.geminiKey) return;

        return clack.password({
          message: 'Gemini API Key:',
          validate: (value) => {
            if (!value) return 'API Key é obrigatória para usar IA';
          },
        });
      },

      devops: async ({ results }) => {
        if (licenseTier !== 'pro') return [];

        // Se já tiver alguma flag de devops, assume que estamos em modo override
        if (options.docker || options.cicd || options.terraform) {
          return;
        }

        const selected = await clack.multiselect({
          message: "DevOps & Infraestrutura (marque o que desejar com Space ou 'A' para selecionar todos):",
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
        clack.cancel('Operação cancelada');
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
