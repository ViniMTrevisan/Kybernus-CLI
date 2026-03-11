import { usePageTitle } from '../../../shared/hooks/usePageTitle';

export function CheckoutSuccessPage() {
  usePageTitle('Pedido Confirmado');
  return (
    <div>
      <h1>Pedido confirmado!</h1>
      <p>Seu pagamento foi processado com sucesso.</p>
      <a href="/">Continuar comprando</a>
    </div>
  );
}
