import { router } from 'expo-router';
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme';

export function Screen(props: {
  title?: string;
  back?: boolean;
  right?: ReactNode;
  scroll?: boolean;
  children: ReactNode;
}) {
  const body = <View style={styles.body}>{props.children}</View>;
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      {(props.title || props.back) && (
        <View style={styles.header}>
          {props.back && (
            <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel="Voltar">
              <Text style={styles.headerBack}>‹</Text>
            </Pressable>
          )}
          <Text style={styles.headerTitle} numberOfLines={1}>
            {props.title}
          </Text>
          {props.right}
        </View>
      )}
      {props.scroll === false ? body : <ScrollView>{body}</ScrollView>}
    </SafeAreaView>
  );
}

export function Loading() {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}

export function Button(props: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}) {
  const variant = props.variant ?? 'primary';
  const inactive = props.loading || props.disabled;
  return (
    <Pressable
      style={[styles.button, styles[variant], inactive && styles.inactive]}
      onPress={props.onPress}
      disabled={inactive}
      accessibilityRole="button"
    >
      {props.loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.white : colors.primary} />
      ) : (
        <Text style={[styles.buttonText, variant !== 'primary' && styles.buttonTextAlt]}>
          {props.label}
        </Text>
      )}
    </Pressable>
  );
}

export function Chip(props: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      style={[styles.chip, props.selected && styles.chipSelected]}
      onPress={props.onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: props.selected }}
    >
      <Text style={[styles.chipText, props.selected && styles.chipTextSelected]}>
        {props.label}
      </Text>
    </Pressable>
  );
}

export function Field({ label, ...input }: TextInputProps & { label: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        {...input}
        style={[styles.input, input.multiline && styles.multiline]}
      />
    </View>
  );
}

export function Card(props: { children: ReactNode; onPress?: () => void }) {
  return props.onPress ? (
    <Pressable style={styles.card} onPress={props.onPress} accessibilityRole="button">
      {props.children}
    </Pressable>
  ) : (
    <View style={styles.card}>{props.children}</View>
  );
}

export const Label = ({ children }: { children: ReactNode }) => (
  <Text style={styles.label}>{children}</Text>
);
export const Muted = ({ children }: { children: ReactNode }) => (
  <Text style={styles.muted}>{children}</Text>
);
export const ErrorText = ({ error }: { error: unknown }) =>
  error ? (
    <Text style={styles.error}>{error instanceof Error ? error.message : String(error)}</Text>
  ) : null;
export const Row = ({ children }: { children: ReactNode }) => (
  <View style={styles.row}>{children}</View>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  body: { padding: 16, gap: 16, width: '100%', maxWidth: 640, alignSelf: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  headerBack: { fontSize: 32, lineHeight: 32, color: colors.text },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '800', color: colors.text },
  button: { borderRadius: 12, paddingVertical: 14, paddingHorizontal: 16, alignItems: 'center' },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  danger: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.primary },
  inactive: { opacity: 0.5 },
  buttonText: { color: colors.white, fontWeight: '800', fontSize: 16 },
  buttonTextAlt: { color: colors.text },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontWeight: '600' },
  chipTextSelected: { color: colors.white },
  field: { gap: 6 },
  label: { fontWeight: '700', color: colors.text },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.white,
  },
  multiline: { minHeight: 96, textAlignVertical: 'top' },
  card: {
    gap: 6,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  muted: { color: colors.muted },
  error: { color: colors.primary, fontWeight: '600' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
