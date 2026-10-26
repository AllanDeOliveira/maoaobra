import { useQueryClient } from '@tanstack/react-query';
import { Pressable, Text } from 'react-native';
import { authClient } from '@/lib/auth-client';
import { colors } from '@/theme';

export function SignOut() {
  const queryClient = useQueryClient();
  return (
    <Pressable
      hitSlop={12}
      onPress={async () => {
        await authClient.signOut();
        queryClient.clear(); // não deixa dados de uma conta aparecerem na próxima
      }}
    >
      <Text style={{ color: colors.muted, fontWeight: '700' }}>Sair</Text>
    </Pressable>
  );
}
