// src/services/ordersService.js — Pedidos, orçamentos, subcoleções de chat e avaliações
import { db } from '../firebase';
import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore';

/**
 * Escuta em tempo real todos os pedidos ou filtra pelos pedidos do usuário logado.
 */
export function subscribeToOrders(userId, role, onUpdate) {
  const ordersRef = collection(db, 'orders');
  let q = ordersRef;

  if (role === 'CONTRATANTE' && userId) {
    q = query(ordersRef, where('contratante_id', '==', userId));
  } else if (role === 'TRABALHADOR' && userId) {
    q = query(ordersRef, where('worker_id', '==', userId));
  }

  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    onUpdate(list);
  });
}

/**
 * Cria um novo pedido de serviço.
 */
export async function createOrder(orderData, initialMessage = null) {
  const ordersRef = collection(db, 'orders');
  const newOrderDoc = await addDoc(ordersRef, {
    ...orderData,
    createdAt: new Date().toISOString()
  });

  // Se houver uma mensagem inicial, adiciona na subcoleção de chat
  if (initialMessage) {
    const messagesRef = collection(db, 'orders', newOrderDoc.id, 'messages');
    await addDoc(messagesRef, {
      ...initialMessage,
      createdAt: new Date().toISOString()
    });
  }

  return newOrderDoc.id;
}

/**
 * Atualiza o status ou valor de um pedido.
 */
export async function updateOrderStatus(orderId, updateData) {
  const orderRef = doc(db, 'orders', orderId);
  await updateDoc(orderRef, updateData);
}

/**
 * Escuta em tempo real as mensagens da subcoleção de chat de um pedido.
 */
export function subscribeToOrderMessages(orderId, onUpdate) {
  if (!orderId) return () => {};
  const messagesRef = collection(db, 'orders', orderId, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    onUpdate(messages);
  });
}

/**
 * Envia uma nova mensagem no chat de um pedido.
 */
export async function sendOrderMessage(orderId, messageData) {
  const messagesRef = collection(db, 'orders', orderId, 'messages');
  const docRef = await addDoc(messagesRef, {
    ...messageData,
    createdAt: new Date().toISOString()
  });

  // Atualiza a prévia da última mensagem no documento do pedido
  const orderRef = doc(db, 'orders', orderId);
  await updateDoc(orderRef, {
    lastMessage: messageData.text || (messageData.image ? '[Foto]' : ''),
    lastMessageTime: messageData.time || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    updatedAt: new Date().toISOString()
  });

  return docRef.id;
}

// -------------------------------------------------------------
// AVALIAÇÕES (REVIEWS)
// -------------------------------------------------------------

/**
 * Escuta em tempo real todas as avaliações.
 */
export function subscribeToReviews(onUpdate) {
  const reviewsRef = collection(db, 'reviews');
  return onSnapshot(reviewsRef, (snapshot) => {
    const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    onUpdate(list);
  });
}

/**
 * Cria uma nova avaliação após a conclusão do serviço.
 * Id determinístico (`${order_id}_c` ou `_w`): garante 1 avaliação por pedido
 * por lado — as regras só permitem create, então a segunda tentativa falha.
 */
export async function createReview(reviewData) {
  const reviewId = `${reviewData.order_id}_${reviewData.isWorkerReview ? 'w' : 'c'}`;
  await setDoc(doc(db, 'reviews', reviewId), {
    ...reviewData,
    createdAt: new Date().toISOString()
  });
  return reviewId;
}
