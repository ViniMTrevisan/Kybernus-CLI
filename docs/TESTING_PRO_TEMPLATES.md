# 🧪 Plano de Testes - Pro Templates Download System

## Pre-requisitos

- [ ] Web app rodando localmente (`cd apps/web && npm run dev`)
- [ ] CLI buildada (`npm run build`)
- [ ] CLI linkada globalmente (`npm link`)
- [ ] Licença Pro válida no banco de dados

---

## Teste 1: Verificar que Templates Pro NÃO estão no npm

```bash
cd /Users/vinitrevisan/Documents/saas/kybernus

# Simular o que será publicado no npm
npm pack --dry-run > /tmp/npm-contents.txt

# Verificar se NÃO tem templates pro
grep -i "templates.*pro" /tmp/npm-contents.txt

# ✅ ESPERADO: Nenhum resultado (comando falha com exit code 1)
# ❌ FALHA: Se aparecer "templates/nestjs/pro" ou similar
```

---

## Teste 2: API Endpoint - License Validation

### 2.1 Teste com licença inválida

```bash
curl -X POST http://localhost:3010/api/templates/download \
  -H "Content-Type: application/json" \
  -d '{
    "licenseKey": "INVALID-KEY",
    "stack": "nestjs",
    "architecture": "clean"
  }'

# ✅ ESPERADO: {"error": "Invalid license"} com status 401
```

### 2.2 Teste com licença Free (não tem acesso)

```bash
# Pegar uma licença Free do banco
# psql ou Prisma Studio para encontrar um user com tier=FREE

curl -X POST http://localhost:3010/api/templates/download \
  -H "Content-Type: application/json" \
  -d '{
    "licenseKey": "KYB-FREE-XXXX-XXXX-XXXX",
    "stack": "nestjs",
    "architecture": "clean"
  }'

# ✅ ESPERADO: {"error": "Pro templates require an active Pro license or Trial"} com 403
```

### 2.3 Teste com licença Pro válida

```bash
# Pegar uma licença Pro do banco
# Vá em http://localhost:3010/admin e copie uma licença Pro

curl -X POST http://localhost:3010/api/templates/download \
  -H "Content-Type: application/json" \
  -d '{
    "licenseKey": "SUA-LICENCA-PRO-AQUI",
    "stack": "nestjs",
    "architecture": "clean"
  }' | jq '.files | length'

# ✅ ESPERADO: Número maior que 0 (quantidade de arquivos)
# ✅ ESPERADO: Response JSON com array de files
```

---

## Teste 3: CLI - Free Tier (templates locais)

```bash
# Limpar cache (se existir)
rm -rf ~/.kybernus/cache

# Testar geração Free
mkdir /tmp/test-kybernus-free
cd /tmp/test-kybernus-free

kybernus init \
  --name test-free \
  --stack nodejs-express \
  --architecture mvc \
  --non-interactive

# ✅ ESPERADO: Projeto gerado SEM baixar da API
# ✅ ESPERADO: Usa templates de: dist/../../../templates/nodejs-express/free/mvc
# ✅ ESPERADO: Mensagem "✅ Projeto gerado com sucesso!"

# Verificar se o projeto foi criado
ls test-free/

# ✅ ESPERADO: Estrutura MVC básica (src/controllers, src/services, etc)
```

---

## Teste 4: CLI - Pro Tier (primeiro download)

```bash
# Limpar cache
rm -rf ~/.kybernus/cache

# Login com licença Pro
kybernus login --key SUA-LICENCA-PRO-AQUI

# Criar projeto Pro
mkdir /tmp/test-kybernus-pro
cd /tmp/test-kybernus-pro

kybernus init \
  --name test-pro \
  --stack nestjs \
  --architecture clean \
  --non-interactive

# ✅ ESPERADO: Mensagem "📦 Verificando templates Pro..."
# ✅ ESPERADO: Mensagem "⬇️  Baixando templates Pro..."
# ✅ ESPERADO: Projeto gerado com Clean Architecture
# ✅ ESPERADO: Cache criado em ~/.kybernus/cache/templates/nestjs/pro/clean/

# Verificar cache criado
ls -la ~/.kybernus/cache/templates/nestjs/pro/clean/

# ✅ ESPERADO: Arquivos do template + .cache-timestamp
```

---

## Teste 5: CLI - Pro Tier (usando cache)

```bash
# SEM limpar o cache (usar o cache do teste anterior)

mkdir /tmp/test-kybernus-pro-cached
cd /tmp/test-kybernus-pro-cached

kybernus init \
  --name test-pro-cached \
  --stack nestjs \
  --architecture clean \
  --non-interactive

# ✅ ESPERADO: Mensagem "📦 Verificando templates Pro..."
# ✅ ESPERADO: NÃO deve aparecer "⬇️  Baixando..." (usa cache)
# ✅ ESPERADO: Projeto gerado rapidamente
# ❌ FALHA: Se baixar novamente da API (cache não funcionou)
```

---

## Teste 6: Cache Expiration (24h)

```bash
# Forçar expiração do cache (manipular timestamp)

# Editar o arquivo de timestamp para 25h atrás
echo "2026-01-21T10:00:00.000Z" > ~/.kybernus/cache/templates/nestjs/pro/clean/.cache-timestamp

# Gerar novo projeto
mkdir /tmp/test-cache-expired
cd /tmp/test-cache-expired

kybernus init \
  --name test-cache-exp \
  --stack nestjs \
  --architecture clean \
  --non-interactive

# ✅ ESPERADO: Cache expirado detectado
# ✅ ESPERADO: Download novamente da API
# ✅ ESPERADO: Novo timestamp gerado
```

---

## Teste 7: Rate Limiting

```bash
# Fazer 11 requests em sequência rápida

for i in {1..11}; do
  echo "Request $i"
  curl -X POST http://localhost:3010/api/templates/download \
    -H "Content-Type: application/json" \
    -d '{
      "licenseKey": "SUA-LICENCA-PRO",
      "stack": "nestjs",
      "architecture": "clean"
    }' -w "\nStatus: %{http_code}\n" -s -o /dev/null
done

# ✅ ESPERADO: Primeiros 10 requests = 200 OK
# ✅ ESPERADO: 11º request = 429 Too Many Requests
```

---

## Teste 8: Stacks Diferentes

```bash
# Testar cada stack Pro

# NestJS
kybernus init --name nestjs-test --stack nestjs --architecture clean --non-interactive

# Python FastAPI
kybernus init --name fastapi-test --stack python-fastapi --architecture hexagonal --non-interactive

# Verificar se todos funcionam
```

---

## Teste 9: Erro de Rede (API offline)

```bash
# Parar o servidor web
# Ctrl+C no terminal do `npm run dev`

# Limpar cache
rm -rf ~/.kybernus/cache

# Tentar gerar projeto Pro
kybernus init --name test-offline --stack nestjs --architecture clean --non-interactive

# ✅ ESPERADO: Erro claro: "Network error: fetch failed" ou similar
# ✅ ESPERADO: CLI não trava, exibe erro legível
```

---

## ✅ Checklist Final

### API
- [ ] Rejeita licenças inválidas (401)
- [ ] Rejeita licenças Free para templates Pro (403)
- [ ] Aceita licenças Pro/Trial (200)
- [ ] Rate limiting funciona (429 após 10 req)
- [ ] Retorna files array com conteúdo

### CLI
- [ ] Free tier usa templates locais (bundled)
- [ ] Pro tier baixa da API no primeiro uso
- [ ] Cache funciona (não baixa duas vezes)
- [ ] Cache expira após 24h
- [ ] Erro de rede é tratado gracefully

### NPM Package
- [ ] `npm pack --dry-run` NÃO mostra templates pro
- [ ] Apenas templates free incluídos

### Build
- [ ] `npm run build` sem erros TypeScript
- [ ] Todos os imports resolvem corretamente

---

## 🐛 Troubleshooting

### "Template não encontrado"
- Verifique se o path em `getProTemplatePath` está correto
- Verifique se `templates/` folder existe na raiz do projeto backend

### "Failed to download Pro template"
- Verifique se web app está rodando em localhost:3010
- Verifique se `KYBERNUS_API_URL` está correto na CLI
- Check network logs

### Cache não funciona
- Verifique permissões em `~/.kybernus/`
- Verifique se `.cache-timestamp` está sendo criado
- Verifique lógica de expiração (24h)

---

## 📝 Resultado Esperado

Ao final, você deve conseguir:
1. ✅ Gerar projetos Free sem problemas
2. ✅ Gerar projetos Pro com licença válida
3. ✅ Ver o cache funcionando (segundo projeto Pro é mais rápido)
4. ✅ Confirmar que templates Pro NÃO estão no npm package
