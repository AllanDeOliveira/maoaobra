import { Redirect } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { authClient } from '@/lib/auth-client';
import { colors } from '@/theme';

export default function Home() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!session) return <Redirect href="/login" />;

  return (
    <View style={styles.center}>
      <Text style={styles.title}>Você está dentro 👋</Text>
      <Text style={styles.muted}>{session.user.phoneNumber}</Text>
      <Text style={styles.muted}>Perfil: {session.user.role}</Text>
      <Pressable style={styles.button} onPress={() => authClient.signOut()}>
        <Text style={styles.buttonText}>Sair</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.background,
  },
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  muted: { color: colors.muted },
  button: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonText: { fontWeight: '700', color: colors.text },
});
