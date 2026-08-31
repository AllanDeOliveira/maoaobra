// src/services/servicesService.js — Operações CRUD atômicas para o catálogo de serviços
import { db } from '../firebase';
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot
} from 'firebase/firestore';

/**
 * Escuta em tempo real todos os serviços ativos no catálogo.
 */
export function subscribeToServices(onUpdate) {
  const servicesRef = collection(db, 'services');
  return onSnapshot(servicesRef, (snapshot) => {
    const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    onUpdate(list);
  });
}

/**
 * Busca serviços específicos de um determinado trabalhador.
 */
export async function getServicesByWorker(workerId) {
  const q = query(collection(db, 'services'), where('worker_id', '==', workerId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Adiciona um novo serviço no Firestore.
 */
export async function createService(serviceData) {
  const servicesRef = collection(db, 'services');
  const docRef = await addDoc(servicesRef, {
    ...serviceData,
    createdAt: new Date().toISOString()
  });
  return docRef.id;
}

/**
 * Atualiza um serviço existente.
 */
export async function updateService(serviceId, serviceData) {
  const serviceRef = doc(db, 'services', serviceId);
  await updateDoc(serviceRef, serviceData);
}

/**
 * Exclui um serviço do catálogo.
 */
export async function deleteService(serviceId) {
  const serviceRef = doc(db, 'services', serviceId);
  await deleteDoc(serviceRef);
}
