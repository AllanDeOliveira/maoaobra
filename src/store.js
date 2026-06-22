import { create } from 'zustand';
import { syncWithFirebase, saveToFirebase } from './firebase';

export const getEstimatedDistance = (clientDetails, workerDetails) => {
  if (!clientDetails || !workerDetails) return null;
  const combined = clientDetails.user_id + workerDetails.user_id;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) hash = combined.charCodeAt(i) + ((hash << 5) - hash);
  const isSameCity = clientDetails.cidade === workerDetails.cidade;
  const isSameUF = clientDetails.uf === workerDetails.uf;
  
  const base = Math.abs(hash % 100);
  if (isSameCity) return (1.2 + (base / 10)).toFixed(1);
  if (isSameUF) return (15 + base).toFixed(1);
  return (150 + (base * 5)).toFixed(1);
};

// Função para gerar sons dinâmicos no navegador (Sem precisar de arquivos de áudio)
const playNotificationSound = (type) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'error') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
    } else if (type === 'warning') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
    }
    
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch(e) { console.warn('Audio not supported or blocked'); }
};

// ==========================================
// MOCK DATA INICIAL (Caso o Firebase esteja vazio)
// ==========================================
const INITIAL_USERS = [
  { id: 'a1', nome: 'Administrador', email: 'legalmano@gmail.com', senha: '123', role: 'ADMIN', foto_perfil_url: 'https://ui-avatars.com/api/?name=Admin&background=ea1d2c&color=fff', telefone: '00000000000', data_criacao: new Date().toISOString(), status: 'APPROVED' },
  { id: 'w1', nome: 'Eduardo Eletricista', email: 'eduardo@gmail.com', senha: '123', role: 'TRABALHADOR', foto_perfil_url: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=400&fit=crop', telefone: '(11) 98888-7777', data_criacao: new Date().toISOString(), status: 'APPROVED' },
  { id: 'w2', nome: 'Mario Encanador', email: 'encanador@gmail.com', senha: '123', role: 'TRABALHADOR', foto_perfil_url: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&h=400&fit=crop', telefone: '(11) 97777-6666', data_criacao: new Date().toISOString(), status: 'APPROVED' },
  { id: 'w3', nome: 'Maria Diarista', email: 'diarista@gmail.com', senha: '123', role: 'TRABALHADOR', foto_perfil_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop', telefone: '(11) 96666-5555', data_criacao: new Date().toISOString(), status: 'APPROVED' },
  { id: 'w4', nome: 'Pablo Pintor', email: 'pintor@gmail.com', senha: '123', role: 'TRABALHADOR', foto_perfil_url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop', telefone: '(11) 95555-4444', data_criacao: new Date().toISOString(), status: 'APPROVED' },
];

const INITIAL_WORKER_DETAILS = [
  { user_id: 'w1', bio: 'Especialista em instalações residenciais.', categorias: ['Eletricista'], nota_media: 4.9, portfolio_fotos: [], cpf: '123.456.789-00', cep: '78200-000', rua: 'Rua Principal', numero: '100', bairro: 'Centro', uf: 'MT', cidade: 'Cáceres', isOnline: true, workingHours: 'Seg-Sex, 08:00 às 18:00' },
  { user_id: 'w2', bio: 'Resolvo vazamentos rapidamente.', categorias: ['Encanador'], nota_media: 4.8, portfolio_fotos: [], cpf: '223.456.789-00', cep: '78200-000', rua: 'Rua das Águas', numero: '200', bairro: 'Centro', uf: 'MT', cidade: 'Cáceres', isOnline: true, workingHours: 'Seg-Sex, 08:00 às 18:00' },
  { user_id: 'w3', bio: 'Faxina completa e caprichosa.', categorias: ['Diarista'], nota_media: 5.0, portfolio_fotos: [], cpf: '323.456.789-00', cep: '78200-000', rua: 'Rua da Limpeza', numero: '300', bairro: 'Centro', uf: 'MT', cidade: 'Cáceres', isOnline: true, workingHours: 'Seg-Sab, 07:00 às 17:00' },
  { user_id: 'w4', bio: 'Pintura lisa e texturas.', categorias: ['Pintor'], nota_media: 4.7, portfolio_fotos: [], cpf: '423.456.789-00', cep: '78200-000', rua: 'Avenida das Cores', numero: '400', bairro: 'Centro', uf: 'MT', cidade: 'Cáceres', isOnline: true, workingHours: 'Seg-Sex, 08:00 às 18:00' },
];

const INITIAL_CONTRATANTE_DETAILS = [];

const INITIAL_SERVICES = [];

// ==========================================
// HELPER FUNÇÕES E PERSISTÊNCIA
// ==========================================
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
  } catch(e) {}
  return details.isOnline && isWithinHours;
};

export const sendPushNotification = (title, body) => {
  if (!("Notification" in window)) return;
  if (Notification.permission === "granted") {
    new Notification(title, { body, icon: '/icon.svg' });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") new Notification(title, { body, icon: '/icon.svg' });
    });
  }
};

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
} catch (e) {}

// ==========================================
// STORE ZUSTAND
// ==========================================
export const useAppStore = create((set, get) => ({
  // ---- STATE ----
  isLoaded: false,
  users: [],
  workerDetails: [],
  contratanteDetails: [],
  services: [],
  orders: [],
  reviews: [],
  supportTickets: [],
  
  currentUser: initialUser,
  currentView: 'HOME',
  selectedWorkerId: null,
  selectedClientId: null,
  toast: null,

  // ---- SETTERS COM PERSISTÊNCIA FIREBASE ----
  setUsers: (v) => { set({ users: v }); saveToFirebase('maos_v14_users', v); },
  setWorkerDetails: (v) => { set({ workerDetails: v }); saveToFirebase('maos_v14_worker_details', v); },
  setContratanteDetails: (v) => { set({ contratanteDetails: v }); saveToFirebase('maos_v14_contratante_details', v); },
  setServices: (v) => { set({ services: v }); saveToFirebase('maos_v14_services', v); },
  setOrders: (v) => { set({ orders: v }); saveToFirebase('maos_v14_orders', v); },
  setReviews: (v) => { set({ reviews: v }); saveToFirebase('maos_v14_reviews', v); },
  setSupportTickets: (v) => { set({ supportTickets: v }); saveToFirebase('maos_v14_support_tickets', v); },

  setCurrentView: (view) => {
    set({ currentView: view, selectedWorkerId: null, selectedClientId: null });
    window.history.pushState({ view, workerId: null, clientId: null }, '', window.location.pathname);
  },
  setSelectedWorkerId: (id) => {
    set({ selectedWorkerId: id });
    window.history.pushState({ view: get().currentView, workerId: id, clientId: null }, '', window.location.pathname);
  },
  setSelectedClientId: (id) => {
    set({ selectedClientId: id });
    window.history.pushState({ view: get().currentView, workerId: null, clientId: id }, '', window.location.pathname);
  },
  setCurrentUser: (u) => set({ currentUser: u }),

  // ---- TOAST ----
  showToast: (message, type = 'success') => {
    playNotificationSound(type);
    set({ toast: { message, type, id: Date.now() } });
    setTimeout(() => set({ toast: null }), 4000);
  },

  // ---- AUTH ----
  login: (email, senha) => {
    const { users, showToast } = get();
    const user = users.find(u => u.email === email && u.senha === senha);
    if (!user) { showToast('Credenciais inválidas!', 'error'); return false; }
    if (user.role === 'TRABALHADOR' && user.status === 'PENDING') {
      showToast('Cadastro ainda em análise. Aguarde a aprovação.', 'warning'); return false;
    }
    set({ currentUser: user });
    localStorage.setItem('maos_currentUser', JSON.stringify(user));
    localStorage.setItem('maos_lastActivity', Date.now().toString());
    if (Notification.permission === "default") Notification.requestPermission();
    if (user.role === 'ADMIN') get().setCurrentView('ADMIN_DASH');
    else if (user.role === 'CONTRATANTE') get().setCurrentView('HOME');
    else get().setCurrentView('WORKER_DASH');
    showToast(`Bem-vindo, ${user.nome.split(' ')[0]}!`);
    return true;
  },

  logout: () => {
    set({ currentUser: null });
    localStorage.removeItem('maos_currentUser');
    localStorage.removeItem('maos_lastActivity');
    get().setCurrentView('HOME');
    get().showToast('Você saiu da conta.');
  },

  register: (userData, specificData) => {
    const { users, workerDetails, contratanteDetails, showToast, setUsers, setWorkerDetails, setContratanteDetails } = get();
    const status = userData.role === 'TRABALHADOR' ? 'PENDING' : 'APPROVED';
    const newUser = { ...userData, id: 'u' + Date.now(), data_criacao: new Date().toISOString(), status };
    setUsers([...users, newUser]);
    
    if (newUser.role === 'CONTRATANTE') {
      setContratanteDetails([...contratanteDetails, { user_id: newUser.id, ...specificData, total_pedidos: 0 }]);
      set({ currentUser: newUser });
      localStorage.setItem('maos_currentUser', JSON.stringify(newUser));
      localStorage.setItem('maos_lastActivity', Date.now().toString());
      if (Notification.permission === "default") Notification.requestPermission();
      get().setCurrentView('HOME');
      showToast('Conta criada com sucesso!');
    } else {
      setWorkerDetails([...workerDetails, { user_id: newUser.id, ...specificData, nota_media: 0, portfolio_fotos: [], isOnline: true, workingHours: 'A combinar' }]);
      get().setCurrentView('LOGIN');
      showToast('Cadastro enviado! Aguarde a aprovação.', 'info');
    }
  },

  approveWorker: (id) => {
    const { users, setUsers, showToast } = get();
    setUsers(users.map(u => u.id === id ? { ...u, status: 'APPROVED' } : u));
    showToast('Profissional aprovado!');
  },

  rejectWorker: (id) => {
    const { users, workerDetails, setUsers, setWorkerDetails, showToast } = get();
    setUsers(users.filter(u => u.id !== id));
    setWorkerDetails(workerDetails.filter(w => w.user_id !== id));
    showToast('Cadastro recusado e removido.');
  },

  deleteUser: (id) => {
    const { users, workerDetails, contratanteDetails, services, orders, reviews, supportTickets, setUsers, setWorkerDetails, setContratanteDetails, setServices, setOrders, setReviews, setSupportTickets, showToast } = get();
    
    const user = users.find(u => u.id === id);
    if (!user) return;

    if (user.role === 'ADMIN') {
      showToast('Não é possível excluir o administrador supremo!', 'error');
      return;
    }

    if (window.confirm(`Tem certeza que deseja BANIR e apagar todos os dados de ${user.nome}? Esta ação removerá o usuário do banco de dados.`)) {
      setUsers(users.filter(u => u.id !== id));
      
      if (user.role === 'TRABALHADOR') {
        setWorkerDetails(workerDetails.filter(w => w.user_id !== id));
        setServices(services.filter(s => s.worker_id !== id));
      } else {
        setContratanteDetails(contratanteDetails.filter(c => c.user_id !== id));
      }
      
      setOrders(orders.filter(o => o.worker_id !== id && o.contratante_id !== id));
      setReviews(reviews.filter(r => r.worker_id !== id && r.contratante_id !== id));
      setSupportTickets(supportTickets.filter(t => t.user_id !== id));

      showToast('Usuário e todos seus dados foram banidos do sistema.', 'warning');
    }
  },
  
  // Função para inicializar a escuta ao Firebase
  initFirebase: () => {
    let loadedCount = 0;
    const checkLoaded = () => {
      loadedCount++;
      if (loadedCount === 7) set({ isLoaded: true });
    };

    syncWithFirebase('maos_v14_users', INITIAL_USERS, (data) => { set({ users: data }); checkLoaded(); });
    syncWithFirebase('maos_v14_worker_details', INITIAL_WORKER_DETAILS, (data) => { set({ workerDetails: data }); checkLoaded(); });
    syncWithFirebase('maos_v14_contratante_details', INITIAL_CONTRATANTE_DETAILS, (data) => { set({ contratanteDetails: data }); checkLoaded(); });
    syncWithFirebase('maos_v14_services', INITIAL_SERVICES, (data) => { set({ services: data }); checkLoaded(); });
    syncWithFirebase('maos_v14_orders', [], (data) => { set({ orders: data }); checkLoaded(); });
    syncWithFirebase('maos_v14_reviews', [], (data) => { set({ reviews: data }); checkLoaded(); });
    syncWithFirebase('maos_v14_support_tickets', [], (data) => { set({ supportTickets: data }); checkLoaded(); });
  }
}));

// ==========================================
// NOTIFICATIONS LOGIC
// ==========================================
let prevOrdersCount = -1;
let prevOrdersChatCount = {};

useAppStore.subscribe((state) => {
  const currentUser = state.currentUser;
  if (!currentUser || !state.isLoaded) return;

  if (prevOrdersCount === -1) {
    prevOrdersCount = state.orders.length;
    state.orders.forEach(o => prevOrdersChatCount[o.id] = o.chat_history?.length || 0);
    return;
  }

  // New Orders
  if (state.orders.length > prevOrdersCount) {
    const newOrders = state.orders.slice(prevOrdersCount);
    newOrders.forEach(o => {
      if (o.worker_id === currentUser.id && o.status === 'PENDENTE') {
        sendPushNotification("Novo Serviço Solicitado!", `Alguém acabou de solicitar seus serviços.`);
      }
      prevOrdersChatCount[o.id] = o.chat_history?.length || 0;
    });
    prevOrdersCount = state.orders.length;
  }

  // New Messages in Orders
  state.orders.forEach(o => {
    const prevCount = prevOrdersChatCount[o.id] || 0;
    const currCount = o.chat_history?.length || 0;
    if (currCount > prevCount) {
      const lastMsg = o.chat_history[currCount - 1];
      if (lastMsg && lastMsg.sender !== currentUser.id) {
        if (o.worker_id === currentUser.id || o.contratante_id === currentUser.id) {
          const senderName = state.users.find(u => u.id === lastMsg.sender)?.nome || 'Usuário';
          sendPushNotification("Nova Mensagem", `${senderName}: ${lastMsg.text}`);
        }
      }
      prevOrdersChatCount[o.id] = currCount;
    }
  });
});
