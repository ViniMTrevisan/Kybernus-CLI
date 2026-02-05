import { ProjectConfig, Stack } from '../../../models/config.js';

/**
 * Build prompt for generating README.md
 */
export function buildREADMEPrompt(config: ProjectConfig): string {
    const tier = 'OPEN SOURCE';
    const architecture = config.architecture || 'MVC';

    const features = `
- ✅ **Production Architecture** - ${architecture} pattern for scalability
- ✅ **Authentication** - JWT-based authentication with bcrypt password hashing
- ✅ **DevOps Ready** - Docker, Docker Compose, GitHub Actions CI/CD
- ✅ **Infrastructure** - Terraform templates for AWS deployment
- ✅ **Security** - Authentication middlewares, CORS, environment validation
- ✅ **Health Endpoint** - API health check ready
- ✅ **CRUD Example** - Basic items CRUD implementation
- ✅ **Error Handling** - Global exception handling
`;

    return `
You are a professional technical writer creating a comprehensive README.md for a production-ready project.

**Project Information:**
- **Name**: ${config.projectName}
- **Stack**: ${config.stack}
- **Architecture**: ${architecture}
- **Tier**: ${tier}
${config.buildTool ? `- **Build Tool**: ${config.buildTool}` : ''}
${config.packageName ? `- **Package**: ${config.packageName}` : ''}

**Features:**
${features}

**Tech Stack Details:**
${getStackDetails(config.stack)}

**Requirements:**
1. Start with project title using an appropriate emoji
2. Provide a compelling 2-3 sentence description
3. Create a detailed Features section with checkboxes
4. List all technologies in Tech Stack section
5. Explain the ${architecture} architecture pattern clearly
6. Provide step-by-step Getting Started guide:
   - Prerequisites (Node.js, Java, Python versions)
   - Installation commands
   - Environment variables setup
   - Running locally commands
7. Document API endpoints with examples
8. Show project structure tree
9. Include development tips
10. Add deployment instructions
11. Add license info (MIT)
12. Credit: "Generated with ❤️ by [Kybernus CLI](https://getkybernus.com/)"

**Style Guidelines:**
- Use clear, professional language
- Include code blocks with syntax highlighting
- Use emojis appropriately (not excessive)
- Add badges for build status, license, etc.
- Make it scannable with proper headers
- Be comprehensive but concise

Return ONLY the markdown content for README.md, nothing else.
`.trim();
}

function getStackDetails(stack: Stack): string {
    const details: Record<Stack, string> = {
        'nextjs': `
- **Frontend**: Next.js 14+ with App Router
- **Styling**: Tailwind CSS
- **Database**: Prisma ORM
- **Auth**: NextAuth.js
- **API**: Next.js API Routes
`,
        'python-fastapi': `
- **Framework**: FastAPI
- **Validation**: Pydantic
- **Auth**: JWT with python-jose
- **Testing**: pytest
`,
        'nodejs-express': `
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Auth**: JWT with bcryptjs
`,
        'java-spring': `
- **Framework**: Spring Boot 3.x
- **Language**: Java 17+
- **Security**: Spring Security
- **Data**: Spring Data JPA
- **Testing**: JUnit 5
`,
        'nestjs': `
- **Framework**: NestJS
- **Language**: TypeScript
- **Auth**: Passport + JWT
- **Validation**: class-validator
- **Testing**: Jest
`
    };

    return details[stack] || '';
}

/**
 * Build prompt for generating API documentation
 */
export function buildAPIDocsPrompt(
    stack: Stack,
    controllers: Array<{ name: string; content: string }>
): string {
    return `
You are documenting REST API endpoints for a ${stack} application.

Analyze the following controller files and generate comprehensive API documentation.

${controllers.map((c, i) => `
### Controller ${i + 1}: ${c.name}
\`\`\`
${c.content.slice(0, 2000)} ${c.content.length > 2000 ? '...' : ''}
\`\`\`
`).join('\n')}

**Requirements:**
For each endpoint, document:

### \`[METHOD] /api/endpoint-path\`

**Description**: Clear explanation of what this endpoint does

**Authentication**: Required/Not Required

**Request Headers** (if applicable):
\`\`\`
Authorization: Bearer <token>
Content-Type: application/json
\`\`\`

**Request Body** (if applicable):
\`\`\`json
{
  "field": "type - description",
  "example": "value"
}
\`\`\`

**Success Response** (200/201):
\`\`\`json
{
  "status": "success",
  "data": {}
}
\`\`\`

**Error Responses**:
- \`400 Bad Request\` - Invalid input
- \`401 Unauthorized\` - Missing/invalid token
- \`500 Internal Server Error\` - Server error

**Example cURL**:
\`\`\`bash
curl -X POST https://api.example.com/api/endpoint \\
  -H "Content-Type: application/json" \\
  -d '{"key": "value"}'
\`\`\`

---

Return ONLY the API documentation in markdown format, nothing else.
`.trim();
}

/**
 * Build prompt for adding inline comments
 */
export function buildInlineCommentsPrompt(
    content: string,
    language: string,
    filePath: string
): string {
    return `
Add professional inline comments to this ${language} code file: ${filePath}

**Code:**
\`\`\`${language}
${content}
\`\`\`

**Guidelines:**
1. Add JSDoc/docstrings for all public functions and classes
2. Explain complex algorithms or business logic
3. Don't comment obvious code
4. Use ${language} documentation conventions
5. Be concise and professional
6. Add @param, @returns, @throws where applicable

Return the complete code with comments added, maintaining exact formatting.
`.trim();
}
