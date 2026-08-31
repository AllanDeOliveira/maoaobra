// src/services/userService.js — Operações atômicas de Usuários, Trabalhadores e Contratantes no Firestore
import { db } from '../firebase';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';

/**
 * Busca os dados de um usuário pelo ID.
 */
export async function getUserById(userId) {
  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/**
 * Busca detalhes complementares de um trabalhador pelo ID.
 */
export async function getWorkerDetailsById(workerId) {
  const workerRef = doc(db, 'workers', workerId);
  const snap = await getDoc(workerRef);
  return snap.exists() ? { id: snap.id, user_id: snap.id, ...snap.data() } : null;
}

/**
 * Busca detalhes complementares de um contratante pelo ID.
 */
export async function getClientDetailsById(clientId) {
  const clientRef = doc(db, 'clients', clientId);
  const snap = await getDoc(clientRef);
  return snap.exists() ? { id: snap.id, user_id: snap.id, ...snap.data() } : null;
}

/**
 * Escuta em tempo real a lista de usuários (para o painel de Admin).
 */
export function subscribeToUsers(onUpdate) {
  const usersRef = collection(db, 'users');
  return onSnapshot(usersRef, (snapshot) => {
    const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    onUpdate(list);
  });
}

/**
 * Escuta em tempo real a lista de detalhes dos trabalhadores.
 */
export function subscribeToWorkers(onUpdate) {
  const workersRef = collection(db, 'workers');
  return onSnapshot(workersRef, (snapshot) => {
    const list = snapshot.docs.map((d) => ({ id: d.id, user_id: d.id, ...d.data() }));
    onUpdate(list);
  });
}

/**
 * Escuta em tempo real a lista de detalhes dos contratantes.
 */
export function subscribeToClients(onUpdate) {
  const clientsRef = collection(db, 'clients');
  return onSnapshot(clientsRef, (snapshot) => {
    const list = snapshot.docs.map((d) => ({ id: d.id, user_id: d.id, ...d.data() }));
    onUpdate(list);
  });
}

/**
 * Atualiza o perfil geral de um usuário.
 */
export async function updateUserProfile(userId, data) {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, data);
}

/**
 * Atualiza os detalhes de um trabalhador.
 */
export async function updateWorkerDetails(workerId, data) {
  const workerRef = doc(db, 'workers', workerId);
  await setDoc(workerRef, data, { merge: true });
}

/**
 * Atualiza os detalhes de um cliente.
 */
export async function updateClientDetails(clientId, data) {
  const clientRef = doc(db, 'clients', clientId);
  await setDoc(clientRef, data, { merge: true });
}

/**
 * Aprova o cadastro de um trabalhador pelo Admin (users + cópia pública em workers).
 */
export async function approveWorkerStatus(workerId) {
  const userRef = doc(db, 'users', workerId);
  await updateDoc(userRef, { status: 'APPROVED' });
  await setDoc(doc(db, 'workers', workerId), { status: 'APPROVED' }, { merge: true });
}

/**
 * Rejeita o cadastro de um trabalhador pelo Admin.
 */
export async function rejectWorkerStatus(workerId) {
  const userRef = doc(db, 'users', workerId);
  const workerRef = doc(db, 'workers', workerId);
  await deleteDoc(userRef);
  await deleteDoc(workerRef);
}

/**
 * Remove um usuário e seus dados associados (exclusão de conta).
 */
export async function deleteUserAccount(userId, role) {
  const userRef = doc(db, 'users', userId);
  await deleteDoc(userRef);
  if (role === 'TRABALHADOR') {
    await deleteDoc(doc(db, 'workers', userId));
  } else if (role === 'CONTRATANTE') {
    await deleteDoc(doc(db, 'clients', userId));
  }
}
