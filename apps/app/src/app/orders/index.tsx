import { OrdersList } from '@/components/OrdersList';
import { Screen } from '@/components/ui';

export default function Orders() {
  return (
    <Screen title="Meus pedidos" back>
      <OrdersList as="customer" empty="Você ainda não fez nenhum pedido." />
    </Screen>
  );
}
