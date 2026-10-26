import type { ProPublicProfile } from '@maoaobra/shared';
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';
import { Button, Card, ErrorText, Label, Loading, Muted, Screen } from '@/components/ui';
import { api } from '@/lib/api';
import { colors } from '@/theme';

export default function ProProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const pro = useQuery({
    queryKey: ['pro', id],
    queryFn: () => api<ProPublicProfile>(`/pros/${id}`),
  });

  return (
    <Screen title={pro.data?.name ?? 'Profissional'} back>
      {pro.isPending && <Loading />}
      <ErrorText error={pro.error} />
      {pro.data && (
        <>
          <Card>
            <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text }}>
              {pro.data.name}
            </Text>
            <Muted>{pro.data.categories.map((c) => c.name).join(' · ')}</Muted>
          </Card>
          <Card>
            <Label>Sobre</Label>
            <Text style={{ color: colors.text, lineHeight: 22 }}>{pro.data.bio}</Text>
          </Card>
          <Muted>
            Profissional verificado pela equipe do Mão a Obra. O contato é liberado depois que o
            pedido é confirmado.
          </Muted>
          <Button
            label="Solicitar serviço"
            onPress={() => router.push({ pathname: '/pros/[id]/request', params: { id } })}
          />
        </>
      )}
    </Screen>
  );
}
