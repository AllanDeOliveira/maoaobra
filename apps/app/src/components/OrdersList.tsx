import type { OrderSummary } from '@maoaobra/shared';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Text } from 'react-native';
import { Card, ErrorText, Loading, Muted } from '@/components/ui';
import { api } from '@/lib/api';
import { formatDate, periodLabel, statusLabel, statusLabelForPro } from '@/lib/labels';
import { colors } from '@/theme';

export function OrdersList({ as, empty }: { as: 'customer' | 'pro'; empty: string }) {
  const orders = useQuery({
    queryKey: ['orders'],
    queryFn: () => api<OrderSummary[]>('/orders'),
    refetchInterval: 15_000,
  });
  const labels = as === 'pro' ? statusLabelForPro : statusLabel;

  if (orders.isPending) return <Loading />;
  if (orders.error) return <ErrorText error={orders.error} />;
  if (orders.data.length === 0) return <Muted>{empty}</Muted>;

  return orders.data.map((order) => (
    <Card
      key={order.id}
      onPress={() => router.push({ pathname: '/orders/[id]', params: { id: order.id } })}
    >
      <Text style={{ fontWeight: '800', color: colors.text }}>
        {order.category.name} · {order.counterpartName}
      </Text>
      <Muted>
        {formatDate(order.scheduledDate)} · {periodLabel[order.period]}
      </Muted>
      <Text style={{ fontWeight: '700', color: colors.primary }}>{labels[order.status]}</Text>
    </Card>
  ));
}
