// scripts/backfill-workers.mjs — copia os campos públicos (nome, foto, telefone, status)
// dos docs de users para os docs de workers (catálogo público), e opcionalmente
// apaga os dados mock antigos deixados pelo seed.
//
// Uso:
//   1. Console do Firebase > Configurações do projeto > Contas de serviço > Gerar nova chave privada
//   2. set GOOGLE_APPLICATION_CREDENTIALS=C:\caminho\da\chave.json
//   3. node scripts/backfill-workers.mjs                 (só o backfill)
//      node scripts/backfill-workers.mjs --purge-mocks   (backfill + apaga a1, c1, w1..w9, s1..s18)

import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

initializeApp({ credential: applicationDefault() });
const db = getFirestore();

const workersUsers = await db.collection('users').where('role', '==', 'TRABALHADOR').get();
for (const u of workersUsers.docs) {
  const { nome, foto_perfil_url, telefone, status } = u.data();
  const data = Object.fromEntries(
    Object.entries({ nome, foto_perfil_url, telefone, status }).filter(([, v]) => v !== undefined)
  );
  await db.doc(`workers/${u.id}`).set(data, { merge: true });
  console.log(`workers/${u.id} atualizado (${nome})`);
}

if (process.argv.includes('--purge-mocks')) {
  const mockPaths = [
    'users/a1',
    'users/c1',
    'clients/c1',
    ...Array.from({ length: 9 }, (_, i) => `users/w${i + 1}`),
    ...Array.from({ length: 9 }, (_, i) => `workers/w${i + 1}`),
    ...Array.from({ length: 18 }, (_, i) => `services/s${i + 1}`)
  ];
  for (const path of mockPaths) {
    await db.doc(path).delete(); // no-op se o doc não existir
    console.log(`apagado ${path}`);
  }
}
console.log('Concluído.');
