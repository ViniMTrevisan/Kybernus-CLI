#!/usr/bin/env bash
# =============================================================================
#  customize.sh — Personalizador white-label do template de e-commerce
# =============================================================================
#  Uso: bash scripts/customize.sh
#  Execute na raiz do projeto após clonar o repositório.
# =============================================================================
set -euo pipefail

# ── helpers ────────────────────────────────────────────────────────────────────
BOLD='\033[1m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
RESET='\033[0m'

info()    { echo -e "${CYAN}ℹ  $*${RESET}"; }
success() { echo -e "${GREEN}✔  $*${RESET}"; }
warn()    { echo -e "${YELLOW}⚠  $*${RESET}"; }
error()   { echo -e "${RED}✖  $*${RESET}" >&2; }

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SITE_CONFIG="$REPO_ROOT/apps/web/src/shared/config/siteConfig.ts"
TOKENS_FILE="$REPO_ROOT/apps/web/src/shared/theme/tokens.ts"

# ── check files exist ──────────────────────────────────────────────────────────
for f in "$SITE_CONFIG" "$TOKENS_FILE"; do
  if [[ ! -f "$f" ]]; then
    error "Arquivo não encontrado: $f"
    error "Execute este script na raiz do projeto."
    exit 1
  fi
done

# ── portable sed-in-place ──────────────────────────────────────────────────────
# macOS usa `sed -i ''`, Linux usa `sed -i`
sedi() {
  if [[ "$(uname)" == "Darwin" ]]; then
    LC_ALL=C sed -i '' "$@"
  else
    LC_ALL=C sed -i "$@"
  fi
}

# ── banner ─────────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}║       Personalizador de Loja — White-Label Setup      ║${RESET}"
echo -e "${BOLD}╚══════════════════════════════════════════════════════╝${RESET}"
echo ""
info "Este script irá atualizar as configurações da sua loja."
info "Pressione ENTER para manter o valor atual (mostrado entre colchetes)."
echo ""

# ── prompt helpers ─────────────────────────────────────────────────────────────
ask() {
  local prompt="$1"
  local default="$2"
  local var_name="$3"
  echo -en "${BOLD}${prompt}${RESET} [${default}]: "
  read -r input
  if [[ -z "$input" ]]; then
    eval "$var_name=\"\$default\""
  else
    eval "$var_name=\"\$input\""
  fi
}

validate_hex_color() {
  local color="$1"
  if [[ ! "$color" =~ ^#[0-9A-Fa-f]{6}$ ]]; then
    error "'$color' não é uma cor hex válida. Use o formato #RRGGBB (ex: #6366F1)"
    return 1
  fi
  return 0
}

validate_cnpj() {
  local cnpj="$1"
  # Aceita formato XX.XXX.XXX/XXXX-XX ou sem formatação
  if [[ ! "$cnpj" =~ ^[0-9]{2}\.[0-9]{3}\.[0-9]{3}/[0-9]{4}-[0-9]{2}$ ]] && \
     [[ ! "$cnpj" =~ ^[0-9]{14}$ ]]; then
    warn "CNPJ '$cnpj' não está no formato padrão (XX.XXX.XXX/XXXX-XX)."
    warn "Continuando mesmo assim — você pode corrigir manualmente depois."
  fi
}

# ── coleta de dados ────────────────────────────────────────────────────────────
echo -e "${BOLD}── Informações da loja ─────────────────────────────────${RESET}"
echo ""

ask "Nome da loja" "Minha Loja" STORE_NAME
ask "Razão social (para documentos legais)" "Minha Loja LTDA" COMPANY_NAME

echo -en "${BOLD}CNPJ${RESET} [00.000.000/0001-00]: "
read -r CNPJ_INPUT
if [[ -z "$CNPJ_INPUT" ]]; then
  CNPJ="00.000.000/0001-00"
else
  CNPJ="$CNPJ_INPUT"
  validate_cnpj "$CNPJ"
fi

ask "Endereço comercial" "Rua Exemplo, 123 — São Paulo, SP, CEP 01000-000" COMPANY_ADDRESS

echo ""
echo -e "${BOLD}── Contato ─────────────────────────────────────────────${RESET}"
echo ""
ask "E-mail de suporte" "suporte@minhaloja.com.br" SUPPORT_EMAIL
ask "E-mail de privacidade" "privacidade@minhaloja.com.br" PRIVACY_EMAIL
ask "URL da loja" "https://minhaloja.com.br" STORE_URL

echo ""
echo -e "${BOLD}── Identidade visual ────────────────────────────────────${RESET}"
echo ""

# Cor primária com validação
while true; do
  ask "Cor primária (hex, ex: #6366F1)" "#6366F1" PRIMARY_COLOR
  if validate_hex_color "$PRIMARY_COLOR"; then
    break
  fi
done

# ── resumo ─────────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}║                   Resumo das alterações               ║${RESET}"
echo -e "${BOLD}╚══════════════════════════════════════════════════════╝${RESET}"
echo ""
echo -e "  Nome da loja   : ${CYAN}${STORE_NAME}${RESET}"
echo -e "  Razão social   : ${CYAN}${COMPANY_NAME}${RESET}"
echo -e "  CNPJ           : ${CYAN}${CNPJ}${RESET}"
echo -e "  Endereço       : ${CYAN}${COMPANY_ADDRESS}${RESET}"
echo -e "  E-mail suporte : ${CYAN}${SUPPORT_EMAIL}${RESET}"
echo -e "  E-mail privac. : ${CYAN}${PRIVACY_EMAIL}${RESET}"
echo -e "  URL            : ${CYAN}${STORE_URL}${RESET}"
echo -e "  Cor primária   : ${CYAN}${PRIMARY_COLOR}${RESET}"
echo ""
echo -en "${BOLD}Aplicar estas configurações? [S/n]: ${RESET}"
read -r CONFIRM
if [[ "$CONFIRM" =~ ^[Nn]$ ]]; then
  warn "Operação cancelada. Nenhum arquivo foi modificado."
  exit 0
fi

# ── apply changes ──────────────────────────────────────────────────────────────
echo ""
info "Aplicando alterações…"

# ---------- siteConfig.ts ----------
# name
sedi "s|name: '.*',$|name: '${STORE_NAME}',|" "$SITE_CONFIG"

# tagline (preserve original — usuário pode editar depois)

# url
sedi "s|url: '.*',$|url: '${STORE_URL}',|" "$SITE_CONFIG"

# supportEmail
sedi "s|supportEmail: '.*',$|supportEmail: '${SUPPORT_EMAIL}',|" "$SITE_CONFIG"

# privacyEmail
sedi "s|privacyEmail: '.*',$|privacyEmail: '${PRIVACY_EMAIL}',|" "$SITE_CONFIG"

# companyName
sedi "s|companyName: '.*',$|companyName: '${COMPANY_NAME}',|" "$SITE_CONFIG"

# cnpj
sedi "s|cnpj: '.*',$|cnpj: '${CNPJ}',|" "$SITE_CONFIG"

# address
sedi "s|address: '.*',$|address: '${COMPANY_ADDRESS}',|" "$SITE_CONFIG"

success "siteConfig.ts atualizado"

# ---------- tokens.ts ----------
# storeName
sedi "s|storeName: '.*',$|storeName: '${STORE_NAME}',|" "$TOKENS_FILE"

# primary color
sedi "s|primary: '#[0-9A-Fa-f]\{6\}',$|primary: '${PRIMARY_COLOR}',|" "$TOKENS_FILE"

success "tokens.ts atualizado"

# ── done ───────────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${GREEN}╔══════════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}${GREEN}║           Personalização concluída com sucesso!       ║${RESET}"
echo -e "${BOLD}${GREEN}╚══════════════════════════════════════════════════════╝${RESET}"
echo ""
echo -e "  Arquivos atualizados:"
echo -e "    - apps/web/src/shared/config/siteConfig.ts"
echo -e "    - apps/web/src/shared/theme/tokens.ts"
echo ""
echo -e "  Próximos passos:"
echo -e "    1. Atualize os arquivos ${BOLD}.env${RESET} com as suas chaves (Stripe, SMTP, etc.)"
echo -e "    2. Execute ${CYAN}npm run dev${RESET} para iniciar o ambiente"
echo -e "    3. Acesse ${CYAN}http://localhost:5173${RESET} para visualizar a loja"
echo ""
