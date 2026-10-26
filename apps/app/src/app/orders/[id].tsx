import { type ChatMessage, isChatOpen, type OrderDetail, type OrderStatus } from '@maoaobra/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Button, Card, ErrorText, Label, Loading, Muted, Screen } from '@/components/ui';
import { api } from '@/lib/api';
import { authClient } from '@/lib/auth-client';
import {
  actionLabel,
  formatDate,
  isDestructive,
  periodLabel,
  statusLabel,
  statusLabelForPro,
} from '@/lib/labels';
import { colors } from '@/theme';

export default function OrderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const order = useQuery({
    queryKey: ['order', id],
    queryFn: () => api<OrderDetail>(`/orders/${id}`),
    refetchInterval: 10_000,
  });
  const transition = useMutation({
    mutationFn: (to: OrderStatus) =>
      api<OrderDetail>(`/orders/${id}/transitions`, { method: 'POST', body: { to } }),
    onSuccess: (updated) => {
      queryClient.setQueryData(['order', id], updated);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  if (order.isPending) return <Loading />;
  if (!order.data) return <ErrorText error={order.error} />;
  const o = order.data;
  const labels = o.role === 'pro' ? statusLabelForPro : statusLabel;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Screen title={`${o.category.name} · ${o.counterpartName}`} back>
        <Card>
          <Text style={styles.status}>{labels[o.status]}</Text>
          <Muted>
            {formatDate(o.scheduledDate)} · {periodLabel[o.period]} · {o.neighborhood}
          </Muted>
          <Text style={{ color: colors.text }}>{o.description}</Text>
        </Card>

        {o.contact ? (
          <Card>
            <Label>Contato liberado</Label>
            <Text style={{ color: colors.text }}>{o.contact.address}</Text>
            {o.contact.phoneNumber && (
              <Button
                label={`WhatsApp de ${o.counterpartName}`}
                variant="secondary"
                onPress={() => Linking.openURL(`https://wa.me/${o.contact?.phoneNumber?.slice(1)}`)}
              />
            )}
          </Card>
        ) : (
          o.status === 'accepted' &&
          o.role === 'customer' && (
            <Muted>Ao confirmar, telefone e endereço são liberados para vocês dois.</Muted>
          )
        )}

        {o.nextStatuses.map((to) => (
          <ActionButton
            key={to}
            to={to}
            loading={transition.isPending && transition.variables === to}
            disabled={transition.isPending}
            onConfirm={() => transition.mutate(to)}
          />
        ))}
        <ErrorText error={transition.error} />

        <Chat orderId={id} open={isChatOpen(o.status)} />
      </Screen>
    </KeyboardAvoidingView>
  );
}

/** Ações destrutivas (recusar, cancelar, não compareceu) pedem um segundo toque. */
function ActionButton(props: {
  to: OrderStatus;
  loading: boolean;
  disabled: boolean;
  onConfirm: () => void;
}) {
  const [armed, setArmed] = useState(false);
  const destructive = isDestructive(props.to);
  return (
    <Button
      label={armed ? 'Toque de novo para confirmar' : actionLabel[props.to]}
      variant={destructive ? 'danger' : 'primary'}
      loading={props.loading}
      disabled={props.disabled}
      onPress={() => {
        if (destructive && !armed) {
          setArmed(true);
          setTimeout(() => setArmed(false), 4000);
          return;
        }
        props.onConfirm();
      }}
    />
  );
}

function Chat({ orderId, open }: { orderId: string; open: boolean }) {
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const [body, setBody] = useState('');
  const messages = useQuery({
    queryKey: ['messages', orderId],
    queryFn: () => api<ChatMessage[]>(`/orders/${orderId}/messages`),
    // ponytail: polling enquanto o chat está aberto; WebSocket quando o volume pedir
    refetchInterval: open ? 3_000 : false,
  });
  const send = useMutation({
    mutationFn: (text: string) =>
      api<ChatMessage>(`/orders/${orderId}/messages`, { method: 'POST', body: { body: text } }),
    onSuccess: (message) => {
      setBody('');
      queryClient.setQueryData<ChatMessage[]>(['messages', orderId], (current = []) => [
        ...current,
        message,
      ]);
    },
  });

  return (
    <Card>
      <Label>Conversa</Label>
      {messages.data?.length === 0 && <Muted>Nenhuma mensagem ainda.</Muted>}
      {messages.data?.map((message) => {
        const mine = message.senderId === session?.user.id;
        return (
          <View key={message.id} style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
            <Text style={{ color: mine ? colors.white : colors.text }}>{message.body}</Text>
            {message.mentionsContact && (
              <Text style={[styles.warning, mine && { color: colors.white }]}>
                ⚠️ Combine tudo pelo app até a confirmação. Telefone e endereço são liberados assim
                que o pedido for confirmado.
              </Text>
            )}
          </View>
        );
      })}

      {open ? (
        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            value={body}
            onChangeText={setBody}
            placeholder="Escreva uma mensagem"
            placeholderTextColor={colors.muted}
            multiline
            maxLength={2000}
          />
          <Button
            label="Enviar"
            loading={send.isPending}
            disabled={!body.trim()}
            onPress={() => send.mutate(body.trim())}
          />
        </View>
      ) : (
        <Muted>A conversa foi encerrada junto com o pedido.</Muted>
      )}
      <ErrorText error={send.error ?? messages.error} />
    </Card>
  );
}

const styles = StyleSheet.create({
  status: { fontSize: 18, fontWeight: '800', color: colors.primary },
  bubble: { maxWidth: '85%', padding: 10, borderRadius: 14, gap: 4 },
  mine: { alignSelf: 'flex-end', backgroundColor: colors.primary },
  theirs: { alignSelf: 'flex-start', backgroundColor: colors.background },
  warning: { fontSize: 12, color: colors.muted },
  composer: { gap: 8, marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 44,
    color: colors.text,
  },
});
