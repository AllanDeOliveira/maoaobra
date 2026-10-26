import type { Category, ProSearchResult } from '@maoaobra/shared';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text } from 'react-native';
import { SignOut } from '@/components/SignOut';
import { Button, Card, Chip, ErrorText, Label, Loading, Muted, Row, Screen } from '@/components/ui';
import { api } from '@/lib/api';
import { useCurrentPoint } from '@/lib/location';
import { colors } from '@/theme';

export function CustomerHome() {
  const [category, setCategory] = useState<string | null>(null);
  const location = useCurrentPoint();
  const categories = useQuery({
    queryKey: ['categories'],
    queryFn: () => api<Category[]>('/categories'),
  });
  const point = location.data?.point;
  const pros = useQuery({
    queryKey: ['search', category, point?.lat, point?.lng],
    queryFn: () =>
      api<ProSearchResult[]>(`/pros?category=${category}&lat=${point?.lat}&lng=${point?.lng}`),
    enabled: Boolean(category && point),
  });

  return (
    <Screen title="Mão a Obra" right={<SignOut />}>
      <Button label="Meus pedidos" variant="secondary" onPress={() => router.push('/orders')} />

      <Label>Do que você precisa?</Label>
      <Row>
        {categories.data?.map((c) => (
          <Chip
            key={c.slug}
            label={c.name}
            selected={category === c.slug}
            onPress={() => setCategory(c.slug)}
          />
        ))}
      </Row>
      {location.data && !location.data.precise && (
        <Muted>
          Mostrando profissionais a partir do centro de Cáceres. Permita a localização para ver quem
          está mais perto de você.
        </Muted>
      )}

      {category && pros.isPending && <Loading />}
      <ErrorText error={pros.error} />
      {pros.data?.length === 0 && (
        <Muted>Nenhum profissional atende sua região nesta categoria ainda.</Muted>
      )}
      {pros.data?.map((pro) => (
        <Card
          key={pro.id}
          onPress={() => router.push({ pathname: '/pros/[id]', params: { id: pro.id } })}
        >
          <Text style={{ fontWeight: '800', fontSize: 16, color: colors.text }}>{pro.name}</Text>
          <Muted>a {pro.distanceKm.toLocaleString('pt-BR')} km de você</Muted>
          <Text numberOfLines={2} style={{ color: colors.text }}>
            {pro.bio}
          </Text>
        </Card>
      ))}

      <Pressable onPress={() => router.push('/pro-application')}>
        <Text style={{ color: colors.primary, fontWeight: '700', textAlign: 'center' }}>
          Quero trabalhar no Mão a Obra
        </Text>
      </Pressable>
    </Screen>
  );
}
