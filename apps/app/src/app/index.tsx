import { Redirect } from 'expo-router';
import { Loading } from '@/components/ui';
import { authClient } from '@/lib/auth-client';
import { AdminHome } from '@/screens/AdminHome';
import { CustomerHome } from '@/screens/CustomerHome';
import { ProHome } from '@/screens/ProHome';

/** Porta de entrada: decide a tela inicial pelo estado da sessão e pelo papel do usuário. */
export default function Home() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) return <Loading />;
  if (!session) return <Redirect href="/login" />;
  if (!session.user.name) return <Redirect href="/onboarding" />;
  if (session.user.role === 'admin') return <AdminHome />;
  if (session.user.role === 'pro') return <ProHome />;
  return <CustomerHome />;
}
