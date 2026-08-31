// src/services/authService.js — Autenticação robusta integrada ao Firebase Auth e Firestore
import { auth, db } from '../firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

/**
 * Registra um novo usuário no Firebase Auth e cria o perfil no Firestore.
 */
export async function registerUser({ email, senha, nome, telefone, role, foto_perfil_url }, specificData) {
  let userUid;

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, senha);
    userUid = cred.user.uid;
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('Este email já está cadastrado no sistema.', { cause: error });
    } else if (error.code === 'auth/weak-password') {
      throw new Error('A senha deve ter pelo menos 6 caracteres.', { cause: error });
    }
    throw new Error('Erro ao criar a conta. Tente novamente.', { cause: error });
  }

  const status = role === 'TRABALHADOR' ? 'PENDING' : 'APPROVED';
  const userData = {
    id: userUid,
    nome,
    email,
    telefone,
    role,
    status,
    foto_perfil_url:
      foto_perfil_url ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=ea1d2c&color=fff`,
    data_criacao: new Date().toISOString()
  };

  // 1. Salva na coleção 'users'
  await setDoc(doc(db, 'users', userUid), userData);

  // 2. Salva na coleção complementar ('workers' ou 'clients')
  if (role === 'TRABALHADOR') {
    await setDoc(doc(db, 'workers', userUid), {
      id: userUid,
      user_id: userUid,
      ...specificData,
      // Cópia desnormalizada dos dados públicos (workers é legível sem login)
      nome,
      telefone,
      foto_perfil_url: userData.foto_perfil_url,
      status,
      nota_media: 0,
      portfolio_fotos: [],
      isOnline: true,
      workingHours: 'A combinar',
      horaInicio: '08:00',
      horaFim: '18:00'
    });
  } else {
    await setDoc(doc(db, 'clients', userUid), {
      id: userUid,
      user_id: userUid,
      ...specificData,
      total_pedidos: 0
    });
  }

  return userData;
}

/**
 * Realiza o login do usuário via Firebase Auth com recuperação de perfil do Firestore.
 */
export async function loginUser(email, senha) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, senha);
    const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    }
    return {
      id: cred.user.uid,
      email: cred.user.email,
      role: 'CONTRATANTE',
      nome: cred.user.displayName || 'Usuário'
    };
  } catch (error) {
    if (
      error.code === 'auth/user-not-found' ||
      error.code === 'auth/wrong-password' ||
      error.code === 'auth/invalid-credential'
    ) {
      throw new Error('Email ou senha incorretos.', { cause: error });
    }
    throw new Error(error.message || 'Erro ao realizar login.', { cause: error });
  }
}

/**
 * Encerra a sessão do usuário.
 */
export async function logoutUser() {
  try {
    await signOut(auth);
  } catch (e) {
    console.warn('Erro no signOut do Firebase:', e);
  }
}

/**
 * Escuta mudanças de estado de autenticação.
 */
export function subscribeToAuth(callback) {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        callback({ id: userDoc.id, ...userDoc.data() });
      } else {
        callback({
          id: firebaseUser.uid,
          email: firebaseUser.email,
          role: 'CONTRATANTE',
          nome: firebaseUser.displayName || 'Usuário'
        });
      }
    } else {
      callback(null);
    }
  });
}
