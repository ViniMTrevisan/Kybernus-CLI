export type Stack =
    | 'nextjs'
    | 'java-spring'
    | 'nodejs-express'
    | 'python-fastapi'
    | 'nestjs';

export type Architecture = 'mvc' | 'clean' | 'hexagonal' | 'default';

export type BuildTool = 'maven' | 'gradle' | 'npm' | 'pnpm' | 'yarn';

export interface ProjectConfig {
    projectName: string;
    stack: Stack;
    architecture?: Architecture;
    buildTool?: BuildTool;
    packageName?: string; // Para Java: com.usuario.projeto
    useAI: boolean;
    geminiKey?: string;
    devops?: {
        docker: boolean;
        cicd: boolean;
        terraform: boolean;
    };
}

export interface TemplateContext {
    projectName: string;
    projectNamePascalCase: string;
    projectNameKebabCase: string;
    projectNameCamelCase: string;
    projectNameSnakeCase: string;
    packageName?: string;
    packagePath?: string; // com/usuario/projeto
    stack: Stack;
    architecture?: Architecture;
    buildTool?: BuildTool;
    currentYear: number;
}
