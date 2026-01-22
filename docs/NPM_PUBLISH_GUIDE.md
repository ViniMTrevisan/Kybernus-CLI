# 📦 Guia de Publicação no NPM - Kybernus CLI

> Guia completo para publicar e manter a CLI no npmjs.com

---

## 1️⃣ Pré-requisitos

### Criar conta no NPM
```bash
# Acesse https://www.npmjs.com/signup e crie conta

# Ou crie via terminal
npm adduser
```

### Verificar login
```bash
npm whoami
# Deve mostrar: vinitrevisan (ou seu username)
```

---

## 2️⃣ Preparação do Projeto

### ✅ O que já está configurado:

| Item | Status | Local |
|------|--------|-------|
| `name` | ✅ `kybernus` | package.json |
| `version` | ✅ `1.0.0` | package.json |
| `bin` | ✅ `kybernus` → `dist/index.js` | package.json |
| `files` | ✅ `dist, templates, README.md, LICENSE` | package.json |
| `keywords` | ✅ 12 palavras-chave | package.json |
| `engines` | ✅ `node >= 18` | package.json |
| `prepublishOnly` | ✅ `npm run build` | package.json |
| `LICENSE` | ✅ MIT | LICENSE |
| `README.md` | ✅ Completo | README.md |

---

## 3️⃣ Verificar antes de publicar

```bash
# Ir para a raiz do projeto
cd /Users/vinitrevisan/Documents/saas/kybernus

# Limpar e reconstruir
npm run build

# Testar localmente
npm link
kybernus --version
kybernus --help

# Ver o que será publicado
npm pack --dry-run
```

### Output esperado do `npm pack --dry-run`:
```
npm notice 📦  kybernus@1.0.0
npm notice Tarball Contents
npm notice dist/index.js
npm notice dist/cli/...
npm notice dist/core/...
npm notice templates/...
npm notice README.md
npm notice LICENSE
npm notice package.json
```

---

## 4️⃣ Publicar no NPM

### Primeira publicação
```bash
# Login (se ainda não logado)
npm login

# Publicar
npm publish
```

### ⚠️ Se o nome `kybernus` já existir:
```bash
# Opção 1: Publicar como scoped package
# Edite package.json: "name": "@seuusername/kybernus"
npm publish --access public

# Opção 2: Escolha outro nome
# Edite package.json: "name": "kybernus-cli"
npm publish
```

---

## 5️⃣ Versionamento (futuras releases)

```bash
# Patch (1.0.0 → 1.0.1) - bug fixes
npm version patch

# Minor (1.0.0 → 1.1.0) - novas features
npm version minor

# Major (1.0.0 → 2.0.0) - breaking changes
npm version major

# Publicar nova versão
npm publish
```

---

## 6️⃣ Automação com GitHub Actions

Já existe um workflow em `.github/workflows/`. Para publicar automaticamente:

### Configurar NPM_TOKEN
1. No NPM → Settings → Access Tokens → Generate New Token (Classic)
2. Escolha "Automation" (para CI/CD)
3. No GitHub repo → Settings → Secrets → Actions
4. Adicione: `NPM_TOKEN` = `npm_xxxxx...`

### Workflow automático
Quando você criar uma tag, o GitHub publica automaticamente:
```bash
# Bump version
npm version patch

# Push com tags
git push --follow-tags
```

---

## 7️⃣ Verificar publicação

```bash
# Ver no NPM
npm view kybernus

# Testar instalação global
npm install -g kybernus
kybernus --version

# Ver página pública
open https://www.npmjs.com/package/kybernus
```

---

## 📋 Checklist Final

- [ ] `npm login` funcionando
- [ ] `npm run build` sem erros
- [ ] `npm pack --dry-run` mostra arquivos corretos
- [ ] Versão no `package.json` está correta
- [ ] README.md tem badges e exemplos
- [ ] LICENSE existe
- [ ] `.gitignore` e `.npmignore` estão corretos
- [ ] Templates NÃO contêm a pasta `pro/` (se for open source)

---

## 🚀 Comando único para publicar

```bash
cd /Users/vinitrevisan/Documents/saas/kybernus && \
npm run build && \
npm publish
```

---

## ❓ Problemas Comuns

### "Package name already exists"
O nome `kybernus` pode já estar em uso. Soluções:
- Use scoped: `@vinitrevisan/kybernus`
- Use variante: `kybernus-cli`

### "Must be logged in"
```bash
npm login
# Email, senha, e OTP (se 2FA ativo)
```

### "Permission denied"
Verifique se você é dono do pacote no NPM.

---

## 📊 Após publicar

1. **Verificar instalação**: `npm i -g kybernus && kybernus --help`
2. **Testar em máquina limpa**: Use Docker ou VM
3. **Monitorar downloads**: https://npm-stat.com/charts.html?package=kybernus
4. **Responder issues**: GitHub Issues
