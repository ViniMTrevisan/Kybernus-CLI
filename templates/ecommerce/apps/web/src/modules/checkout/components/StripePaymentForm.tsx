import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const errorMessages: Record<string, string> = {
  card_declined: 'Cartão recusado',
  expired_card: 'Cartão expirado',
  incorrect_cvc: 'CVC incorreto',
  insufficient_funds: 'Saldo insuficiente',
};

export interface StripePaymentFormProps {
  clientSecret: string;
  onSuccess: () => void;
  onError: (err: Error) => void;
}

export function StripePaymentForm({ clientSecret, onSuccess, onError }: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setErrorMessage(null);

    const cardElement = elements.getElement(CardElement);
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement! },
    });

    setProcessing(false);

    if (error) {
      const msg = errorMessages[error.code ?? ''] ?? error.message ?? 'Erro ao processar pagamento';
      setErrorMessage(msg);
      onError(new Error(msg));
    } else if (paymentIntent?.status === 'succeeded') {
      onSuccess();
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      {errorMessage && <p>{errorMessage}</p>}
      <button type="submit" disabled={processing || !stripe}>
        Confirmar pagamento
      </button>
    </form>
  );
}
