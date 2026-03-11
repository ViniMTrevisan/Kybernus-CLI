import { Link } from 'react-router-dom';
import { siteConfig } from '../../../shared/config/siteConfig';
import { usePageTitle } from '../../../shared/hooks/usePageTitle';

const { name, legal, supportEmail, url } = siteConfig;

export function TermsOfServicePage() {
  usePageTitle('Termos de Serviço');
  return (
    <article style={{ maxWidth: 760, margin: '0 auto', lineHeight: 1.75, color: '#374151' }}>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Termos de Serviço</h1>
      <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: 0, marginBottom: '2rem' }}>
        Vigência a partir de: <strong>{legal.termsEffectiveDate}</strong>
      </p>

      <Section title="1. Aceitação dos Termos">
        <p>
          Ao acessar ou utilizar o site <strong>{name}</strong> (<a href={url}>{url}</a>), você concorda em
          ficar vinculado a estes Termos de Serviço e à nossa{' '}
          <Link to="/privacy">Política de Privacidade</Link>. Se você não concordar com qualquer parte dos
          termos, não utilize nossos serviços.
        </p>
      </Section>

      <Section title="2. Identificação da Empresa">
        <Table rows={[
          ['Razão Social', legal.companyName],
          ['CNPJ', legal.cnpj],
          ['Endereço', legal.address],
          ['E-mail de suporte', supportEmail],
        ]} />
      </Section>

      <Section title="3. Produtos e Preços">
        <p>
          Os preços exibidos são em Reais (R$) e incluem todos os tributos devidos, salvo indicação em
          contrário. Nos reservamos o direito de alterar preços a qualquer momento sem aviso prévio. O
          preço válido é o exibido no momento da finalização do pedido.
        </p>
        <p>
          Imagens dos produtos são meramente ilustrativas. Eventuais variações de cor, tamanho ou acabamento
          serão descritas na página do produto.
        </p>
      </Section>

      <Section title="4. Pedidos e Pagamento">
        <p>
          Ao finalizar um pedido, você realiza uma oferta de compra sujeita à nossa confirmação. O pedido
          só é considerado confirmado após aprovação do pagamento e envio do e-mail de confirmação.
        </p>
        <p>
          Aceitamos os métodos de pagamento listados na etapa de checkout, incluindo cartão de crédito/débito,
          PIX e boleto bancário. Os pagamentos são processados de forma segura por meio do{' '}
          <strong>Stripe</strong>.
        </p>
      </Section>

      <Section title="5. Prazo de Entrega e Frete">
        <p>
          Os prazos de entrega são estimados e podem variar conforme a região. A {name} não se responsabiliza
          por atrasos causados por transportadoras, greves, desastres naturais ou outras força maior.
        </p>
        <p>
          O valor do frete será informado antes da finalização do pedido.
        </p>
      </Section>

      <Section title="6. Política de Troca e Devolução (CDC)">
        <p>
          Em conformidade com o <strong>Código de Defesa do Consumidor (Lei 8.078/1990)</strong>:
        </p>
        <ul>
          <li>
            Você tem o direito de desistir da compra em até <strong>7 (sete) dias corridos</strong> a contar
            da data de recebimento do produto, sem necessidade de justificativa (direito de arrependimento —
            art. 49 do CDC).
          </li>
          <li>
            Para produtos com defeito, o prazo para reclamação é de <strong>30 dias</strong> (bens não
            duráveis) ou <strong>90 dias</strong> (bens duráveis) a partir da entrega.
          </li>
          <li>
            O produto deve ser devolvido em sua embalagem original, sem sinais de uso, com todos os
            acessórios e nota fiscal.
          </li>
          <li>
            Para solicitar troca ou devolução, entre em contato com nosso suporte em{' '}
            <a href={`mailto:${supportEmail}`}>{supportEmail}</a>.
          </li>
        </ul>
      </Section>

      <Section title="7. Uso Aceitável">
        <p>Você concorda em não:</p>
        <ul>
          <li>Usar nossos serviços para fins ilegais ou fraudulentos.</li>
          <li>Tentar acessar áreas restritas ou contas de terceiros sem autorização.</li>
          <li>Publicar conteúdo ofensivo, falso ou que infrinja direitos de terceiros.</li>
          <li>Realizar scraping ou coleta automatizada de dados sem consentimento expresso.</li>
        </ul>
      </Section>

      <Section title="8. Propriedade Intelectual">
        <p>
          Todo o conteúdo disponível no site — textos, logotipo, imagens, ícones e software — é de
          propriedade exclusiva de <strong>{legal.companyName}</strong> ou licenciado por terceiros. É
          proibida a reprodução total ou parcial sem autorização prévia e por escrito.
        </p>
      </Section>

      <Section title="9. Limitação de Responsabilidade">
        <p>
          Na máxima extensão permitida pela legislação brasileira, a {name} não será responsável por danos
          indiretos, incidentais, especiais ou consequentes decorrentes do uso ou incapacidade de uso dos
          nossos serviços.
        </p>
      </Section>

      <Section title="10. Lei Aplicável e Foro">
        <p>
          Estes termos são regidos pelas leis brasileiras. Fica eleito o foro da comarca de{' '}
          <strong>São Paulo – SP</strong> para dirimir eventuais controvérsias, com renúncia a qualquer
          outro, por mais privilegiado que seja.
        </p>
      </Section>

      <Section title="11. Alterações">
        <p>
          Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações entram em
          vigor na data de publicação. O uso continuado dos serviços após a publicação das alterações
          constitui aceitação dos novos termos.
        </p>
      </Section>

      <Section title="12. Contato">
        <p>
          Dúvidas? Fale conosco em{' '}
          <a href={`mailto:${supportEmail}`}>{supportEmail}</a>.
        </p>
      </Section>

      <p style={{ marginTop: '2.5rem', fontSize: '0.8rem', color: '#9ca3af' }}>
        {legal.companyName} — {legal.cnpj} — {legal.address}
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

function Table({ rows }: { rows: [string, string][] }) {
  return (
    <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.875rem' }}>
      <tbody>
        {rows.map(([label, value]) => (
          <tr key={label} style={{ borderBottom: '1px solid #f3f4f6' }}>
            <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: '#6b7280', width: '35%' }}>{label}</td>
            <td style={{ padding: '0.5rem 0.75rem', color: '#111827' }}>{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
