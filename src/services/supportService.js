// src/services/supportService.js — Gestão de tickets de suporte ao cliente e trabalhador
import { db } from '../firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  onSnapshot
} from 'firebase/firestore';

/**
 * Escuta em tempo real os tickets de suporte.
 */
export function subscribeToSupportTickets(onUpdate) {
  const ticketsRef = collection(db, 'supportTickets');
  return onSnapshot(ticketsRef, (snapshot) => {
    const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    onUpdate(list);
  });
}

/**
 * Cria um novo ticket de suporte.
 */
export async function createSupportTicket(ticketData) {
  const ticketsRef = collection(db, 'supportTickets');
  const docRef = await addDoc(ticketsRef, {
    ...ticketData,
    status: 'OPEN',
    createdAt: new Date().toISOString()
  });
  return docRef.id;
}

/**
 * Adiciona uma mensagem ou responde a um ticket de suporte.
 */
export async function addMessageToSupportTicket(ticketId, message, currentMessages = []) {
  const ticketRef = doc(db, 'supportTickets', ticketId);
  const updatedMessages = [...currentMessages, message];
  await updateDoc(ticketRef, {
    messages: updatedMessages,
    updatedAt: new Date().toISOString()
  });
}

/**
 * Atualiza o status de um ticket de suporte (ex: 'CLOSED').
 */
export async function updateSupportTicketStatus(ticketId, status) {
  const ticketRef = doc(db, 'supportTickets', ticketId);
  await updateDoc(ticketRef, { status });
}
