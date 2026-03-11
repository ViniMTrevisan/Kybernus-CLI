import { Link } from 'react-router-dom';
import { siteConfig } from '../../../shared/config/siteConfig';
import { usePageTitle } from '../../../shared/hooks/usePageTitle';

const { name, legal, supportEmail, privacyEmail, url } = siteConfig;

export function PrivacyPolicyPage() {
  usePageTitle('Política de Privacidade');
  return (
    <article style={{ maxWidth: 760, margin: '0 auto', lineHeight: 1.75, color: '#374151' }}>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Política de Privacidade</h1>
      <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: 0, marginBottom: '2rem' }}>
        Vigência a partir de: <strong>{legal.termsEffectiveDate}</strong>
      </p>

      <Section title="1. Quem Somos">
        <p>
          Esta Política de Privacidade aplica-se ao site <strong>{name}</strong> ({url}), operado por{' '}
          <strong>{legal.companyName}</strong>, CNPJ {legal.cnpj}, com sede em {legal.address}.
        </p>
        <p>
          Estamos comprometidos com a proteção dos seus dados pessoais em conformidade com a{' '}
          <strong>Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018)</strong>.
        </p>
      </Section>

      <Section title="2. Dados que Coletamos">
        <p>Coletamos os seguintes dados pessoais:</p>
        <ul>
          <li>
            <strong>Dados de cadastro:</strong> nome, endereço de e-mail, senha (armazenada de forma
            criptografada).
          </li>
          <li>
            <strong>Dados de entrega:</strong> endereço postal, CEP, nome do destinatário.
          </li>
          <li>
            <strong>Dados de pagamento:</strong> os dados de cartão de crédito são processados diretamente
            pelo <strong>Stripe</strong> e nunca armazenados em nossos servidores.
          </li>
          <li>
            <strong>Dados de uso:</strong> páginas visitadas, cliques, tempo de sessão (via cookies
            analíticos, com seu consentimento).
          </li>
          <li>
            <strong>Dados técnicos:</strong> endereço IP, tipo de navegador, sistema operacional.
          </li>
        </ul>
      </Section>

      <Section title="3. Finalidade e Base Legal do Tratamento">
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              <th style={thStyle}>Finalidade</th>
              <th style={thStyle}>Base Legal (LGPD)</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Criação e gerenciamento de conta', 'Execução de contrato (art. 7, V)'],
              ['Processamento de pedidos e pagamentos', 'Execução de contrato (art. 7, V)'],
              ['Envio de e-mails transacionais (confirmação, nota fiscal)', 'Execução de contrato (art. 7, V)'],
              ['Prevenção de fraudes e segurança', 'Legítimo interesse (art. 7, IX)'],
              ['Análise de desempenho e melhoria do site', 'Consentimento (art. 7, I)'],
              ['Marketing e ofertas personalizadas', 'Consentimento (art. 7, I)'],
              ['Cumprimento de obrigações legais', 'Obrigação legal (art. 7, II)'],
            ].map(([finalidade, base]) => (
              <tr key={finalidade} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '0.5rem 0.75rem' }}>{finalidade}</td>
                <td style={{ padding: '0.5rem 0.75rem', color: '#6b7280', fontSize: '0.8rem' }}>{base}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="4. Cookies">
        <p>
          Utilizamos cookies para o funcionamento do site (essenciais) e para análise de uso (com seu
          consentimento). Você pode gerenciar suas preferências de cookies a qualquer momento pelo banner
          exibido na primeira visita ou nas configurações do seu navegador.
        </p>
        <ul>
          <li>
            <strong>Cookies essenciais:</strong> necessários para o funcionamento do site (sessão,
            autenticação, carrinho). Não podem ser desativados.
          </li>
          <li>
            <strong>Cookies analíticos:</strong> coletam informações anônimas sobre como você usa o site.
            Requerem seu consentimento.
          </li>
        </ul>
      </Section>

      <Section title="5. Compartilhamento de Dados">
        <p>Não vendemos seus dados pessoais. Compartilhamos apenas com:</p>
        <ul>
          <li>
            <strong>Stripe</strong> — processador de pagamentos (sujeito à própria política de privacidade
            da Stripe).
          </li>
          <li>
            <strong>Transportadoras</strong> — nome e endereço de entrega para envio dos pedidos.
          </li>
          <li>
            <strong>Autoridades competentes</strong> — quando exigido por lei ou ordem judicial.
          </li>
        </ul>
      </Section>

      <Section title="6. Seus Direitos (LGPD art. 18)">
        <p>Como titular de dados, você tem direito a:</p>
        <ul>
          <li>Confirmar a existência de tratamento dos seus dados.</li>
          <li>Acessar os dados que temos sobre você.</li>
          <li>Corrigir dados incompletos, inexatos ou desatualizados.</li>
          <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários.</li>
          <li>Portabilidade dos dados a outro fornecedor de serviço.</li>
          <li>Revogar o consentimento a qualquer momento.</li>
          <li>Opor-se ao tratamento realizado com base em legítimo interesse.</li>
        </ul>
        <p>
          Para exercer seus direitos, entre em contato com nossa Encarregada de Dados (DPO) pelo e-mail:{' '}
          <a href={`mailto:${privacyEmail}`}>{privacyEmail}</a>.
        </p>
      </Section>

      <Section title="7. Retenção de Dados">
        <p>
          Mantemos seus dados pessoais pelo tempo necessário para cumprir as finalidades descritas nesta
          política, salvo quando a lei exigir ou permitir período maior. Dados de pedidos são retidos por
          até <strong>5 anos</strong> para cumprimento de obrigações fiscais e tributárias.
        </p>
      </Section>

      <Section title="8. Segurança">
        <p>
          Adotamos medidas técnicas e organizacionais adequadas para proteger seus dados contra acesso não
          autorizado, perda, destruição ou alteração. Utilizamos criptografia TLS em trânsito e
          armazenamento seguro em repouso. Senhas são armazenadas com hashing bcrypt.
        </p>
      </Section>

      <Section title="9. Encarregado de Dados (DPO)">
        <p>
          Nossa Encarregada de Dados está disponível pelo e-mail:{' '}
          <a href={`mailto:${privacyEmail}`}>{privacyEmail}</a>. Você pode entrar em contato para exercer
          seus direitos ou esclarecer dúvidas sobre o tratamento de seus dados.
        </p>
      </Section>

      <Section title="10. Alterações a Esta Política">
        <p>
          Podemos atualizar esta Política periodicamente. Notificaremos sobre alterações significativas por
          e-mail ou por aviso proeminente no site. A data de vigência no topo desta página reflete a versão
          mais recente.
        </p>
      </Section>

      <Section title="11. Contato">
        <p>
          Suporte geral: <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
          <br />
          Privacidade / DPO: <a href={`mailto:${privacyEmail}`}>{privacyEmail}</a>
          <br />
          Também é possível registrar reclamações junto à{' '}
          <strong>Autoridade Nacional de Proteção de Dados (ANPD)</strong> em{' '}
          <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer">
            gov.br/anpd
          </a>.
        </p>
      </Section>

      <p style={{ marginTop: '2.5rem', fontSize: '0.8rem', color: '#9ca3af' }}>
        {legal.companyName} — {legal.cnpj} — {legal.address}
      </p>

      <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
        Veja também: <Link to="/terms">Termos de Serviço</Link>
      </p>
    </article>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '1.75rem' }}>
      <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.375rem', marginBottom: '0.75rem' }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '0.5rem 0.75rem',
  fontSize: '0.75rem',
  fontWeight: 600,
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};
