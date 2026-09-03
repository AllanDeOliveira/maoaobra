// tests/firestore.rules.test.js — cobre as brechas de segurança fechadas nas regras.
// Roda com: npm run test:rules (sobe o emulador do Firestore e executa o vitest dentro dele)
import { readFileSync } from 'node:fs';
import { beforeAll, afterAll, describe, it } from 'vitest';
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

let testEnv;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-maoaobra',
    firestore: { rules: readFileSync('firestore.rules', 'utf8') }
  });

  // Cenário base: alice (cliente), bob (trabalhador aprovado), pedidos o1 concluído e o2 em andamento
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'users/alice'), { nome: 'Alice', role: 'CONTRATANTE', status: 'APPROVED' });
    await setDoc(doc(db, 'users/bob'), { nome: 'Bob', role: 'TRABALHADOR', status: 'APPROVED' });
    await setDoc(doc(db, 'users/pending'), { nome: 'Pendente', role: 'TRABALHADOR', status: 'PENDING' });
    await setDoc(doc(db, 'workers/bob'), { nome: 'Bob', status: 'APPROVED', isOnline: true });
    await setDoc(doc(db, 'orders/o1'), { contratante_id: 'alice', worker_id: 'bob', status: 'CONCLUIDO' });
    await setDoc(doc(db, 'orders/o2'), { contratante_id: 'alice', worker_id: 'bob', status: 'EM_ANDAMENTO' });
  });
});

afterAll(() => testEnv.cleanup());

const as = (uid) => testEnv.authenticatedContext(uid).firestore();

describe('users — escalação de privilégio', () => {
  it('usuário não promove o próprio role a ADMIN', async () => {
    await assertFails(updateDoc(doc(as('alice'), 'users/alice'), { role: 'ADMIN' }));
  });

  it('trabalhador pendente não se auto-aprova', async () => {
    await assertFails(updateDoc(doc(as('pending'), 'users/pending'), { status: 'APPROVED' }));
  });

  it('usuário edita o próprio perfil sem tocar role/status', async () => {
    await assertSucceeds(updateDoc(doc(as('alice'), 'users/alice'), { nome: 'Alice Silva' }));
  });

  it('cadastro não nasce ADMIN nem trabalhador já aprovado', async () => {
    await assertFails(
      setDoc(doc(as('mallory'), 'users/mallory'), { nome: 'M', role: 'ADMIN', status: 'APPROVED' })
    );
    await assertFails(
      setDoc(doc(as('mallory'), 'users/mallory'), { nome: 'M', role: 'TRABALHADOR', status: 'APPROVED' })
    );
    await assertSucceeds(
      setDoc(doc(as('mallory'), 'users/mallory'), { nome: 'M', role: 'TRABALHADOR', status: 'PENDING' })
    );
  });
});

describe('workers — catálogo público', () => {
  it('dono não altera o próprio status no doc público', async () => {
    await assertFails(updateDoc(doc(as('bob'), 'workers/bob'), { status: 'PENDING' }));
  });

  it('dono edita os demais campos do próprio doc', async () => {
    await assertSucceeds(updateDoc(doc(as('bob'), 'workers/bob'), { isOnline: false }));
  });

  it('leitura é pública (sem login)', async () => {
    await assertSucceeds(getDoc(doc(testEnv.unauthenticatedContext().firestore(), 'workers/bob')));
  });
});

describe('reviews — vínculo com pedido concluído', () => {
  const review = (overrides = {}) => ({
    order_id: 'o1',
    worker_id: 'bob',
    user_id: 'alice',
    nota: 5,
    comentario: 'Ótimo',
    isWorkerReview: false,
    ...overrides
  });

  it('participante avalia pedido concluído uma única vez', async () => {
    await assertSucceeds(setDoc(doc(as('alice'), 'reviews/o1_c'), review()));
    // segunda tentativa no mesmo pedido vira update — só admin pode
    await assertFails(setDoc(doc(as('alice'), 'reviews/o1_c'), review({ nota: 1 })));
  });

  it('não avalia pedido não concluído', async () => {
    await assertFails(setDoc(doc(as('alice'), 'reviews/o2_c'), review({ order_id: 'o2' })));
  });

  it('quem não participou do pedido não avalia', async () => {
    await assertFails(setDoc(doc(as('mallory'), 'reviews/o1_c'), review({ user_id: 'mallory' })));
  });

  it('id da review precisa bater com o pedido', async () => {
    await assertFails(setDoc(doc(as('alice'), 'reviews/qualquer_id'), review()));
  });
});

describe('orders — privacidade', () => {
  it('quem não participa do pedido não lê', async () => {
    await assertFails(getDoc(doc(as('mallory'), 'orders/o1')));
  });

  it('participante lê o próprio pedido', async () => {
    await assertSucceeds(getDoc(doc(as('alice'), 'orders/o1')));
  });
});
