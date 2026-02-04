# 🧪 Test Plan - Kybernus Templates

## Pre-requisitos

- [ ] CLI buildada (`npm run build`)
- [ ] CLI linkada globalmente (`npm link`)

---

## Teste 1: Verificar que TODOS Templates estão no npm

```bash
cd /Users/vinitrevisan/Documents/saas/kybernus

# Simular o que será publicado no npm
npm pack --dry-run > /tmp/npm-contents.txt

# Verificar se tem templates anteriormente "pro"
grep -i "templates.*pro" /tmp/npm-contents.txt

# ✅ ESPERADO: Devem aparecer na lista (agora incluídos) (ou não, se a estrutura de pastas mudar, mas devem estar presentes)
```

---

## Teste 2: CLI - Geração de Projetos

```bash
# Testar geração de stack avançada (ex: NestJS Clean Arch)
mkdir /tmp/test-kybernus-open
cd /tmp/test-kybernus-open

kybernus init \
  --name test-open \
  --stack nestjs \
  --architecture clean \
  --non-interactive

# ✅ ESPERADO: Projeto gerado SEM pedir login/upgrade
# ✅ ESPERADO: Usar templates locais
# ✅ ESPERADO: Mensagem "✅ Project created successfully!"

# Verificar se o projeto foi criado
ls test-open/

# ✅ ESPERADO: Estrutura Clean Architecture completa
```

---

## Teste 3: Outras Stacks

```bash
# Python FastAPI
kybernus init --name fastapi-test --stack python-fastapi --architecture hexagonal --non-interactive

# Java Spring Boot
kybernus init --name java-test --stack java-spring --architecture clean --non-interactive
```

---

## ✅ Checklist Final

### CLI
- [ ] `init` funciona para TODAS as stacks sem restrições
- [ ] Não pede login/auth
- [ ] Não menciona "Trial" ou "Pro"

### NPM Package
- [ ] `npm pack --dry-run` mostra todos os templates necessários
