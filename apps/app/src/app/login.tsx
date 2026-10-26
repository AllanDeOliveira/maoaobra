import { brMobilePhone } from '@maoaobra/shared';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { authClient } from '@/lib/auth-client';
import { colors } from '@/theme';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function sendCode() {
    const parsed = brMobilePhone.safeParse(phone);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Celular inválido');
      return;
    }
    setLoading(true);
    setError(null);
    const result = await authClient.phoneNumber.sendOtp({ phoneNumber: parsed.data });
    setLoading(false);
    if (result.error) {
      setError('Não foi possível enviar o código. Tente de novo em instantes.');
      return;
    }
    setSentTo(parsed.data);
  }

  async function verifyCode() {
    if (!sentTo) return;
    setLoading(true);
    setError(null);
    const result = await authClient.phoneNumber.verify({ phoneNumber: sentTo, code });
    setLoading(false);
    if (result.error) {
      setError('Código inválido ou expirado.');
      return;
    }
    router.replace('/');
  }

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.brand}>
          mão<Text style={{ color: colors.primary }}>A</Text>obra
        </Text>

        {sentTo ? (
          <>
            <Text style={styles.label}>Digite o código enviado para {sentTo}</Text>
            <TextInput
              style={styles.input}
              value={code}
              onChangeText={setCode}
              placeholder="000000"
              keyboardType="number-pad"
              autoComplete="one-time-code"
              textContentType="oneTimeCode"
              maxLength={6}
              autoFocus
            />
            <Button
              label="Entrar"
              onPress={verifyCode}
              loading={loading}
              disabled={code.length !== 6}
            />
            <Pressable
              onPress={() => {
                setSentTo(null);
                setCode('');
              }}
            >
              <Text style={styles.link}>Trocar número</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.label}>Seu celular com DDD</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="(65) 99999-0000"
              keyboardType="phone-pad"
              autoComplete="tel"
              textContentType="telephoneNumber"
              autoFocus
            />
            <Button label="Receber código" onPress={sendCode} loading={loading} disabled={!phone} />
          </>
        )}

        {error && <Text style={styles.error}>{error}</Text>}
      </View>
    </View>
  );
}

function Button(props: {
  label: string;
  onPress: () => void;
  loading: boolean;
  disabled: boolean;
}) {
  const inactive = props.loading || props.disabled;
  return (
    <Pressable
      style={[styles.button, inactive && { opacity: 0.5 }]}
      onPress={props.onPress}
      disabled={inactive}
      accessibilityRole="button"
    >
      {props.loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <Text style={styles.buttonText}>{props.label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: colors.background,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    gap: 12,
    padding: 24,
    borderRadius: 24,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  brand: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  label: { fontWeight: '700', color: colors.text },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: { color: colors.white, fontWeight: '800', fontSize: 16 },
  link: { color: colors.primary, fontWeight: '700', textAlign: 'center', marginTop: 4 },
  error: { color: colors.primary, textAlign: 'center' },
});
