// src/store.js — Gerenciamento global de estado limpo e reativo com Zustand
import { create } from 'zustand';
import { playNotificationSound } from './utils/audio';
import { getEstimatedDistance } from './utils/geo';
import { seedFirestoreIfEmpty, INITIAL_USERS, INITIAL_WORKER_DETAILS, INITIAL_SERVICES } from './services/seedService';
import {
  registerUser,
  loginUser,
  logoutUser,
  subscribeToAuth
} from './services/authService';
import {
  subscribeToUsers,
  subscribeToWorkers,
  subscribeToClients,
  approveWorkerStatus,
  rejectWorkerStatus,
  deleteUserAccount
} from './services/userService';
import { subscribeToServices } from './services/servicesService';
import {
  subscribeToOrders,
  subscribeToReviews
} from './services/ordersService';
import { subscribeToSupportTickets } from './services/supportService';

// Reexporta utilitário de distância
export { getEstimatedDistance };

/**
 * Verifica se o trabalhador está no horário de expediente e online.
 */
export const isWorkerOnline = (details) => {
  if (!details) return false;
  const horaInicio = details.horaInicio || '08:00';
  const horaFim = details.horaFim || '18:00';
  let isWithinHours = true;
  try {
    const agora = new Date();
    const horaAtual = agora.getHours() * 60 + agora.getMinutes();
    const [hI, mI] = horaInicio.split(':').map(Number);
    const inicioMinutos = hI * 60 + mI;
    const [hF, mF] = horaFim.split(':').map(Number);
    let fimMinutos = hF * 60 + mF;
    if (fimMinutos < inicioMinutos) fimMinutos += 24 * 60;
    let adjustedAtual = horaAtual;
    if (horaAtual < inicioMinutos && fimMinutos > 24 * 60) adjustedAtual += 24 * 60;
    if (adjustedAtual < inicioMinutos || adjustedAtual > fimMinutos) isWithinHours = false;
  } catch {
    isWithinHours = true;
  }
  return Boolean(details.isOnline && isWithinHours);
};

export const sendPushNotification = (title, body) => {
  if (!("Notification" in window)) return;
  if (Notification.permission === "granted") {
    new Notification(title, { body, icon: '/icon.svg' });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") new Notification(title, { body, icon: '/icon.svg' });
    });
  }
};

// Recupera usuário inicial salvo na sessão
let initialUser = null;
try {
  const storedUser = localStorage.getItem('maos_currentUser');
  const lastActivity = localStorage.getItem('maos_lastActivity');
  if (storedUser && lastActivity) {
    if (Date.now() - parseInt(lastActivity) < 30 * 60 * 1000) {
      initialUser = JSON.parse(storedUser);
      localStorage.setItem('maos_lastActivity', Date.now().toString());
    } else {
      localStorage.removeItem('maos_currentUser');
      localStorage.removeItem('maos_lastActivity');
    }
  }
} catch {
  initialUser = null;
}

export const useAppStore = create((set, get) => ({
  // ---- ESTADO ----
  isLoaded: false,
  currentUser: initialUser,
  users: INITIAL_USERS,
  workerDetails: INITIAL_WORKER_DETAILS,
  contratanteDetails: [],
  services: INITIAL_SERVICES,
  orders: [],
  reviews: [],
  supportTickets: [],
  toast: null,

  // ---- TOASTS ----
  showToast: (message, type = 'success') => {
    playNotificationSound(type);
    set({ toast: { message, type, id: Date.now() } });
    setTimeout(() => set({ toast: null }), 4000);
  },

  // ---- AUTH & SESSION ----
  setCurrentUser: (user) => {
    set({ currentUser: user });
    if (user) {
      localStorage.setItem('maos_currentUser', JSON.stringify(user));
      localStorage.setItem('maos_lastActivity', Date.now().toString());
    } else {
      localStorage.removeItem('maos_currentUser');
      localStorage.removeItem('maos_lastActivity');
    }
  },

  login: async (email, senha) => {
    const { showToast, setCurrentUser } = get();
    try {
      const user = await loginUser(email, senha);
      if (user.role === 'TRABALHADOR' && user.status === 'PENDING') {
        showToast('Cadastro ainda em análise pela equipe. Aguarde a aprovação.', 'warning');
        return false;
      }
      setCurrentUser(user);
      if (Notification.permission === 'default') Notification.requestPermission();
      showToast(`Bem-vindo de volta, ${user.nome.split(' ')[0]}!`);
      return user;
    } catch (err) {
      showToast(err.message || 'Erro ao realizar login.', 'error');
      return false;
    }
  },

  register: async (userData, specificData) => {
    const { showToast, setCurrentUser } = get();
    try {
      const newUser = await registerUser(userData, specificData);
      if (newUser.role === 'CONTRATANTE') {
        setCurrentUser(newUser);
        showToast('Conta criada com sucesso!');
      } else {
        showToast('Cadastro enviado com sucesso! Aguarde a aprovação da nossa equipe.', 'info');
      }
      return newUser;
    } catch (err) {
      showToast(err.message || 'Erro ao cadastrar.', 'error');
      return false;
    }
  },

  logout: async () => {
    const { setCurrentUser, showToast } = get();
    await logoutUser();
    setCurrentUser(null);
    showToast('Você saiu da sua conta.');
  },

  // ---- ADMIN ACTIONS ----
  approveWorker: async (id) => {
    const { showToast } = get();
    try {
      await approveWorkerStatus(id);
      showToast('Profissional aprovado com sucesso!');
    } catch {
      showToast('Erro ao aprovar profissional.', 'error');
    }
  },

  rejectWorker: async (id) => {
    const { showToast } = get();
    try {
      await rejectWorkerStatus(id);
      showToast('Cadastro recusado e removido.');
    } catch {
      showToast('Erro ao recusar cadastro.', 'error');
    }
  },

  deleteUser: async (id) => {
    const { users, showToast } = get();
    const user = users.find((u) => u.id === id);
    if (!user) return;

    if (user.role === 'ADMIN') {
      showToast('Não é possível excluir o administrador mestre!', 'error');
      return;
    }

    if (window.confirm(`Tem certeza que deseja banir e apagar os dados de ${user.nome}?`)) {
      try {
        await deleteUserAccount(id, user.role);
        showToast('Usuário removido do sistema.', 'warning');
      } catch {
        showToast('Erro ao remover usuário.', 'error');
      }
    }
  },

  // ---- INICIALIZAÇÃO E LISTENERS DO FIREBASE ----
  initFirebase: () => {
    // Executa o seed de carga inicial se necessário
    seedFirestoreIfEmpty();

    // Inscrição em tempo real aos documentos granulares
    subscribeToUsers((users) => set({ users }));
    subscribeToWorkers((workerDetails) => set({ workerDetails }));
    subscribeToClients((contratanteDetails) => set({ contratanteDetails }));
    subscribeToServices((services) => set({ services }));
    subscribeToOrders(null, null, (orders) => set({ orders }));
    subscribeToReviews((reviews) => set({ reviews }));
    subscribeToSupportTickets((supportTickets) => set({ supportTickets }));

    // Monitora auth state
    subscribeToAuth((user) => {
      if (user) {
        set({ currentUser: user });
        localStorage.setItem('maos_currentUser', JSON.stringify(user));
      }
    });

    set({ isLoaded: true });
  }
}));

// ==========================================
// NOTIFICAÇÕES REATIVAS PUSH
// ==========================================
let prevOrdersCount = -1;

useAppStore.subscribe((state) => {
  const currentUser = state.currentUser;
  if (!currentUser || !state.isLoaded) return;

  if (prevOrdersCount === -1) {
    prevOrdersCount = state.orders.length;
    return;
  }

  // Notificação de novos pedidos para o trabalhador
  if (state.orders.length > prevOrdersCount) {
    const newOrders = state.orders.slice(prevOrdersCount);
    newOrders.forEach((o) => {
      if (o.worker_id === currentUser.id && o.status === 'PENDENTE') {
        sendPushNotification("Novo Pedido de Serviço!", "Você recebeu uma nova solicitação.");
      }
    });
    prevOrdersCount = state.orders.length;
  }
});
