import { useState, useEffect } from 'react';
import type React from 'react';
import { useNavigate } from 'react-router-dom';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe, type StripeElementsOptions } from '@stripe/stripe-js';
import { useCheckout, type Cart } from '../hooks/useCheckout';
import { apiFetch } from '../../../shared/lib/apiFetch';
import { usePageTitle } from '../../../shared/hooks/usePageTitle';

const stripePromise = loadStripe(
  // VITE_STRIPE_PUBLIC_KEY is injected via window.__STRIPE_KEY__ by vite.config.ts (define plugin).
  // Falls back to 'pk_test_dummy' in test environments (loadStripe is fully mocked in tests).
  (typeof window !== 'undefined' && (window as Window & { __STRIPE_KEY__?: string }).__STRIPE_KEY__) ||
    'pk_test_dummy',
);

type Step = 'address' | 'shipping' | 'payment';

function CartSummary({ cart }: { cart: Cart | null }) {
  if (!cart) return null;
  return (
    <div aria-label="Resumo do pedido" style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
      <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Resumo do pedido</h3>
      {cart.items.map((item) => (
        <div key={item.variantId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#374151', marginBottom: '0.375rem' }}>
          <span>{item.name}</span>
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, borderTop: '1px solid #e5e7eb', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
        <span>Subtotal:</span>
        <span style={{ color: '#6366f1' }}>{`R$ ${cart.subtotal.toFixed(2).replace('.', ',')}`}</span>
      </div>
    </div>
  );
}

// ── PIX next-action types (not exported by @stripe/stripe-js directly) ─────
interface PixQrCode {
  data: string;
  expires_at: number;
  hosted_instructions_url: string;
  image_url_png: string;
  image_url_svg: string;
}

// ── Boleto next-action types ────────────────────────────────────────────────
interface BoletoDetails {
  expires_after: number; // Unix timestamp
  hosted_voucher_url: string | null;
  number: string | null; // Formatted barcode digits
  pdf: string | null;
}

// ── BoletoWaiting — rendered when Stripe returns boleto_display_details ──────
function BoletoWaiting({ boleto, orderId, onSuccess }: { boleto: BoletoDetails; orderId: string; onSuccess: () => void }) {
  const expiryDate = new Date(boleto.expires_after * 1000).toLocaleDateString('pt-BR');

  // Poll every 30 s — boleto confirmation can take up to 3 business days
  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const order = await apiFetch<{ status: string }>(`/api/orders/${orderId}`);
        if (order.status === 'PAID') {
          clearInterval(poll);
          onSuccess();
        }
      } catch { /* silently retry */ }
    }, 30_000);
    return () => clearInterval(poll);
  }, [orderId, onSuccess]);

  const box: React.CSSProperties = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1.5rem', maxWidth: 520 };
  const infoBox: React.CSSProperties = { background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '0.5rem', padding: '0.875rem 1rem', marginBottom: '1.25rem', fontSize: '0.875rem', color: '#92400e' };
  const codeBox: React.CSSProperties = { display: 'block', wordBreak: 'break-all', background: '#f3f4f6', borderRadius: '0.5rem', padding: '0.75rem', fontSize: '0.8rem', fontFamily: 'monospace', marginBottom: '1rem', userSelect: 'all' };
  const btn: React.CSSProperties = { display: 'inline-block', padding: '0.5rem 1.25rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'none', fontSize: '0.9rem' };

  return (
    <div style={box}>
      <h2 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>Boleto gerado!</h2>
      <div style={infoBox}>
        ⏳ O pagamento será confirmado em até <strong>3 dias úteis</strong> após o pagamento.<br />
        Você receberá um email de confirmação assim que processar.
      </div>
      {boleto.number && (
        <>
          <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.375rem' }}>Código de barras:</p>
          <code style={codeBox}>{boleto.number}</code>
        </>
      )}
      <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '1rem' }}>
        Vencimento: <strong style={{ color: '#374151' }}>{expiryDate}</strong>
      </p>
      {boleto.hosted_voucher_url && (
        <a href={boleto.hosted_voucher_url} target="_blank" rel="noopener noreferrer" style={btn}>
          Ver / Imprimir Boleto →
        </a>
      )}
    </div>
  );
}

// ── PixWaiting — rendered when Stripe returns pix_display_qr_code ────────────
function PixWaiting({ pixData, orderId, onSuccess }: { pixData: PixQrCode; orderId: string; onSuccess: () => void }) {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(() => Math.max(0, pixData.expires_at - Math.floor(Date.now() / 1000)));

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  // Poll order status every 5 s — navigate to success once PAID
  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const order = await apiFetch<{ status: string }>(`/api/orders/${orderId}`);
        if (order.status === 'PAID') {
          clearInterval(poll);
          onSuccess();
        }
      } catch { /* silently retry */ }
    }, 5000);
    return () => clearInterval(poll);
  }, [orderId, onSuccess]);

  function copyCode() {
    navigator.clipboard.writeText(pixData.data).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }

  const mins = Math.floor(timeLeft / 60);
  const secs = (timeLeft % 60).toString().padStart(2, '0');
  const box: React.CSSProperties = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1.5rem', maxWidth: 520, textAlign: 'center' };
  const codeBox: React.CSSProperties = { display: 'block', wordBreak: 'break-all', background: '#f3f4f6', borderRadius: '0.5rem', padding: '0.75rem', fontSize: '0.75rem', fontFamily: 'monospace', marginBottom: '0.75rem', userSelect: 'all', textAlign: 'left' };
  const btn: React.CSSProperties = { width: '100%', padding: '0.5rem 1.25rem', background: copied ? '#10b981' : '#6366f1', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer', marginBottom: '1.25rem', fontSize: '0.9rem' };

  return (
    <div style={box}>
      <h2 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>Pague com PIX</h2>
      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.25rem' }}>
        Escaneie o QR code ou copie o código no seu aplicativo de banco.
      </p>
      <img src={pixData.image_url_png} alt="QR Code PIX" style={{ width: 200, height: 200, marginBottom: '1.25rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }} />
      <code style={codeBox}>{pixData.data}</code>
      <button type="button" onClick={copyCode} style={btn}>
        {copied ? '✓ Código copiado!' : 'Copiar código PIX'}
      </button>
      {timeLeft > 0 ? (
        <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
          Expira em <strong style={{ color: '#374151' }}>{mins}:{secs}</strong> · Aguardando confirmação...
        </p>
      ) : (
        <p style={{ fontSize: '0.8rem', color: '#dc2626' }}>PIX expirado. <a href="/checkout">Tente novamente.</a></p>
      )}
    </div>
  );
}

interface CheckoutInnerProps {
  street: string;
  cep: string;
  orderId: string;
  onPaymentSuccess: () => void;
}

function PaymentStep({ street, cep, orderId, onPaymentSuccess }: CheckoutInnerProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [pixData, setPixData] = useState<PixQrCode | null>(null);
  const [boletoData, setBoletoData] = useState<BoletoDetails | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setPaymentError(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
          shipping: street ? { name: 'Entrega', address: { line1: street, postal_code: cep, country: 'BR' } } : undefined,
        },
        // Cards confirm inline; PIX returns next_action; boleto may redirect
        redirect: 'if_required',
      });

      if (error) {
        setPaymentError(error.message ?? 'Erro no pagamento');
      } else if (paymentIntent?.status === 'requires_action') {
        type StripeNextAction = {
          type?: string;
          pix_display_qr_code?: PixQrCode;
          boleto_display_details?: BoletoDetails;
        };
        const na = paymentIntent.next_action as StripeNextAction | null;
        if (na?.type === 'pix_display_qr_code' && na.pix_display_qr_code) {
          setPixData(na.pix_display_qr_code);
        } else if (na?.type === 'boleto_display_details' && na.boleto_display_details) {
          setBoletoData(na.boleto_display_details);
        } else {
          // Unknown async method — Stripe will redirect to return_url
          onPaymentSuccess();
        }
      } else {
        onPaymentSuccess();
      }
    } catch (err: unknown) {
      if (err instanceof Error) setPaymentError(err.message);
    } finally {
      setProcessing(false);
    }
  }

  const card: React.CSSProperties = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1.5rem', maxWidth: 520 };

  if (pixData) {
    return <PixWaiting pixData={pixData} orderId={orderId} onSuccess={onPaymentSuccess} />;
  }

  if (boletoData) {
    return <BoletoWaiting boleto={boletoData} orderId={orderId} onSuccess={onPaymentSuccess} />;
  }

  return (
    <form onSubmit={handleSubmit} style={card}>
      <h2 style={{ marginBottom: '1.25rem', fontSize: '1.1rem' }}>Pagamento</h2>
      <div style={{ marginBottom: '1rem' }}>
        {/* PaymentElement auto-shows card, PIX, boleto, etc. based on currency/locale */}
        <PaymentElement options={{ layout: 'tabs' }} />
      </div>
      {paymentError && (
        <p style={{ padding: '0.625rem 0.75rem', background: '#fef2f2', color: '#dc2626', borderRadius: '0.5rem', fontSize: '0.875rem', marginBottom: '1rem' }}>{paymentError}</p>
      )}
      <button type="submit" disabled={processing}>
        {processing ? 'Processando...' : 'Confirmar pagamento'}
      </button>
    </form>
  );
}

function CheckoutInner() {
  usePageTitle('Checkout');
  const navigate = useNavigate();
  const { cart, checkout } = useCheckout();

  const [step, setStep] = useState<Step>('address');
  const [street, setStreet] = useState('');
  const [cep, setCep] = useState('');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [creatingIntent, setCreatingIntent] = useState(false);
  const [intentError, setIntentError] = useState<string | null>(null);
  const shippingCost = 18.5;

  async function goToPayment() {
    setCreatingIntent(true);
    setIntentError(null);
    try {
      const shippingAddress = street ? { street, zip: cep } : null;
      const { clientSecret: cs, orderId: oid } = await checkout({ shippingCost, shippingAddress });
      setClientSecret(cs);
      setOrderId(oid);
      setStep('payment');
    } catch (err: unknown) {
      setIntentError(err instanceof Error ? err.message : 'Erro ao iniciar pagamento');
    } finally {
      setCreatingIntent(false);
    }
  }

  const card: React.CSSProperties = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1.5rem', maxWidth: 520 };
  const fieldStyle: React.CSSProperties = { marginBottom: '1rem' };
  const nextBtnStyle: React.CSSProperties = { marginTop: '1.25rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.625rem 1.5rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: 600, fontSize: '0.9375rem', cursor: 'pointer' };
  const steps = ['address', 'shipping', 'payment'] as const;
  const stepLabels = ['Endereço', 'Frete', 'Pagamento'];

  const elementsOptions: StripeElementsOptions | undefined = clientSecret ? { clientSecret, locale: 'pt-BR' } : undefined;

  return (
    <div style={{ maxWidth: 560 }}>
      <h1 style={{ marginBottom: '1.25rem' }}>Checkout</h1>

      {/* Step indicator */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '1.75rem' }}>
        {steps.map((s, i) => (
          <div key={s} style={{ flex: 1, textAlign: 'center', fontSize: '0.8rem', fontWeight: 600, padding: '0.5rem', borderBottom: `2.5px solid ${step === s ? '#6366f1' : '#e5e7eb'}`, color: step === s ? '#6366f1' : '#9ca3af' }}>
            {i + 1}. {stepLabels[i]}
          </div>
        ))}
      </div>

      <CartSummary cart={cart} />

      {step === 'address' && (
        <div style={card}>
          <h2 style={{ marginBottom: '1.25rem', fontSize: '1.1rem' }}>Dados de entrega</h2>
          <div style={fieldStyle}>
            <label htmlFor="checkout-street">Rua</label>
            <input id="checkout-street" aria-label="Rua" value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Av. Paulista, 1000" />
          </div>
          <div style={fieldStyle}>
            <label htmlFor="checkout-cep">CEP</label>
            <input id="checkout-cep" aria-label="CEP" value={cep} onChange={(e) => setCep(e.target.value)} placeholder="00000-000" />
          </div>
          <button type="button" onClick={() => setStep('shipping')} style={nextBtnStyle}>
            Próximo →
          </button>
        </div>
      )}

      {step === 'shipping' && (
        <div style={card}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Selecione a entrega</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.875rem 1rem', background: '#f0f0ff', border: '2px solid #6366f1', borderRadius: '0.5rem', marginBottom: '1.25rem' }}>
            <span style={{ fontWeight: 500 }}>Entrega Padrão (5–7 dias)</span>
            <span style={{ fontWeight: 700, color: '#6366f1' }}>R$ 18,50</span>
          </div>
          {intentError && <p style={{ color: '#dc2626', marginBottom: '0.75rem', fontSize: '0.875rem' }}>{intentError}</p>}
          <button type="button" onClick={goToPayment} disabled={creatingIntent} style={{ ...nextBtnStyle, opacity: creatingIntent ? 0.7 : 1 }}>
            {creatingIntent ? 'Aguarde...' : 'Próximo →'}
          </button>
        </div>
      )}

      {step === 'payment' && clientSecret && (
        <Elements stripe={stripePromise} options={elementsOptions}>
          <PaymentStep street={street} cep={cep} orderId={orderId ?? ''} onPaymentSuccess={() => navigate('/checkout/success')} />
        </Elements>
      )}
    </div>
  );
}

export function CheckoutPage() {
  return <CheckoutInner />;
}
