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
  { id: 'w1', nome: 'Allan Eletricista', email: 'allan@gmail.com', senha: '123', role: 'TRABALHADOR', foto_perfil_url: 'https://ui-avatars.com/api/?name=Allan+Eletricista&background=007bff&color=fff', telefone: '(11) 98888-7777', data_criacao: new Date().toISOString(), status: 'APPROVED' },
  { id: 'w2', nome: 'Mario Encanador', email: 'encanador@gmail.com', senha: '123', role: 'TRABALHADOR', foto_perfil_url: 'https://ui-avatars.com/api/?name=Mario+Encanador&background=17a2b8&color=fff', telefone: '(11) 97777-6666', data_criacao: new Date().toISOString(), status: 'APPROVED' },
  { id: 'w3', nome: 'Maria Diarista', email: 'diarista@gmail.com', senha: '123', role: 'TRABALHADOR', foto_perfil_url: 'https://ui-avatars.com/api/?name=Maria+Diarista&background=e83e8c&color=fff', telefone: '(11) 96666-5555', data_criacao: new Date().toISOString(), status: 'APPROVED' },
  { id: 'w4', nome: 'Pablo Pintor', email: 'pintor@gmail.com', senha: '123', role: 'TRABALHADOR', foto_perfil_url: 'https://ui-avatars.com/api/?name=Pablo+Pintor&background=fd7e14&color=fff', telefone: '(11) 95555-4444', data_criacao: new Date().toISOString(), status: 'APPROVED' },
  { id: 'w5', nome: 'Roberto Montador', email: 'montador@gmail.com', senha: '123', role: 'TRABALHADOR', foto_perfil_url: 'https://ui-avatars.com/api/?name=Roberto+Montador&background=6c757d&color=fff', telefone: '(11) 94444-3333', data_criacao: new Date().toISOString(), status: 'APPROVED' },
  { id: 'w6', nome: 'Lucas TI', email: 'ti@gmail.com', senha: '123', role: 'TRABALHADOR', foto_perfil_url: 'https://ui-avatars.com/api/?name=Lucas+TI&background=20c997&color=fff', telefone: '(11) 93333-2222', data_criacao: new Date().toISOString(), status: 'APPROVED' },
  { id: 'w7', nome: 'João Jardineiro', email: 'jardineiro@gmail.com', senha: '123', role: 'TRABALHADOR', foto_perfil_url: 'https://ui-avatars.com/api/?name=Joao+Jardineiro&background=28a745&color=fff', telefone: '(11) 92222-1111', data_criacao: new Date().toISOString(), status: 'APPROVED' },
  { id: 'c1', nome: 'Vinicius Cliente', email: 'vini@gmail.com', senha: '123', role: 'CONTRATANTE', foto_perfil_url: 'https://ui-avatars.com/api/?name=Vinicius&background=6f42c1&color=fff', telefone: '(11) 99999-1111', data_criacao: new Date().toISOString(), status: 'APPROVED' },
];

const INITIAL_WORKER_DETAILS = [
  { user_id: 'w1', bio: 'Especialista em instalações elétricas.', categorias: ['Eletricista'], nota_media: 4.9, portfolio_fotos: [], cpf: '123.456.789-00', cep: '78200-000', rua: 'Rua Principal', numero: '100', bairro: 'Centro', uf: 'MT', cidade: 'Cáceres', isOnline: true, workingHours: 'Seg-Sex, 08:00 às 18:00' },
  { user_id: 'w2', bio: 'Resolvo qualquer vazamento ou problema hidráulico.', categorias: ['Encanador'], nota_media: 4.8, portfolio_fotos: [], cpf: '223.456.789-00', cep: '78200-000', rua: 'Rua das Águas', numero: '200', bairro: 'Centro', uf: 'MT', cidade: 'Cáceres', isOnline: true, workingHours: 'Seg-Sex, 08:00 às 18:00' },
  { user_id: 'w3', bio: 'Limpeza pesada e organização com dedicação.', categorias: ['Diarista'], nota_media: 5.0, portfolio_fotos: [], cpf: '323.456.789-00', cep: '78200-000', rua: 'Rua da Limpeza', numero: '300', bairro: 'Centro', uf: 'MT', cidade: 'Cáceres', isOnline: true, workingHours: 'Seg-Sab, 07:00 às 17:00' },
  { user_id: 'w4', bio: 'Pinturas residenciais e comerciais com acabamento fino.', categorias: ['Pintor'], nota_media: 4.7, portfolio_fotos: [], cpf: '423.456.789-00', cep: '78200-000', rua: 'Avenida das Cores', numero: '400', bairro: 'Centro', uf: 'MT', cidade: 'Cáceres', isOnline: false, workingHours: 'Seg-Sex, 08:00 às 18:00' },
  { user_id: 'w5', bio: 'Montagem e desmontagem de móveis de qualquer marca.', categorias: ['Montador'], nota_media: 4.6, portfolio_fotos: [], cpf: '523.456.789-00', cep: '78200-000', rua: 'Rua da Madeira', numero: '500', bairro: 'Centro', uf: 'MT', cidade: 'Cáceres', isOnline: true, workingHours: 'Seg-Sex, 08:00 às 18:00' },
  { user_id: 'w6', bio: 'Formatação, manutenção e montagem de computadores.', categorias: ['TI'], nota_media: 4.9, portfolio_fotos: [], cpf: '623.456.789-00', cep: '78200-000', rua: 'Rua dos Bits', numero: '600', bairro: 'Centro', uf: 'MT', cidade: 'Cáceres', isOnline: true, workingHours: 'Seg-Sex, 09:00 às 19:00' },
  { user_id: 'w7', bio: 'Corte de grama, poda de árvores e paisagismo.', categorias: ['Jardineiro'], nota_media: 4.8, portfolio_fotos: [], cpf: '723.456.789-00', cep: '78200-000', rua: 'Rua das Plantas', numero: '700', bairro: 'Centro', uf: 'MT', cidade: 'Cáceres', isOnline: true, workingHours: 'Seg-Sab, 06:00 às 16:00' },
];

const INITIAL_CONTRATANTE_DETAILS = [
  { user_id: 'c1', cpf: '555.666.777-88', cep: '78200-000', rua: 'Avenida Sete de Setembro', numero: '1000', bairro: 'Centro', uf: 'MT', cidade: 'Cáceres' },
];

const INITIAL_SERVICES = [
  { id: 's1', worker_id: 'w1', titulo: 'Instalação de Chuveiro', descricao: 'Instalação completa.', preco_base: 80, tempo_estimado: '1h', imagem_url: '' },
  { id: 's2', worker_id: 'w2', titulo: 'Reparo de Infiltração', descricao: 'Busca e reparo de vazamentos.', preco_base: 150, tempo_estimado: '2h', imagem_url: '' },
  { id: 's3', worker_id: 'w3', titulo: 'Faxina Completa', descricao: 'Limpeza de todos os cômodos.', preco_base: 120, tempo_estimado: '8h', imagem_url: '' },
  { id: 's4', worker_id: 'w4', titulo: 'Pintura de Fachada', descricao: 'Pintura externa, inclui lixamento.', preco_base: 500, tempo_estimado: '2 dias', imagem_url: '' },
  { id: 's5', worker_id: 'w5', titulo: 'Montagem de Guarda-Roupa', descricao: 'Montagem de armários grandes.', preco_base: 100, tempo_estimado: '3h', imagem_url: '' },
  { id: 's6', worker_id: 'w6', titulo: 'Formatação de PC', descricao: 'Backup e instalação do Windows.', preco_base: 90, tempo_estimado: '2h', imagem_url: '' },
  { id: 's7', worker_id: 'w7', titulo: 'Poda de Jardim', descricao: 'Poda de arbustos e árvores pequenas.', preco_base: 80, tempo_estimado: '2h', imagem_url: '' },
];

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
  
  currentUser: null,
  currentView: 'HOME',
  selectedWorkerId: null,
  selectedClientId: null,
  toast: null,

  // ---- SETTERS COM PERSISTÊNCIA FIREBASE ----
  setUsers: (v) => { set({ users: v }); saveToFirebase('maos_v6_users', v); },
  setWorkerDetails: (v) => { set({ workerDetails: v }); saveToFirebase('maos_v6_worker_details', v); },
  setContratanteDetails: (v) => { set({ contratanteDetails: v }); saveToFirebase('maos_v6_contratante_details', v); },
  setServices: (v) => { set({ services: v }); saveToFirebase('maos_v6_services', v); },
  setOrders: (v) => { set({ orders: v }); saveToFirebase('maos_v6_orders', v); },
  setReviews: (v) => { set({ reviews: v }); saveToFirebase('maos_v6_reviews', v); },
  setSupportTickets: (v) => { set({ supportTickets: v }); saveToFirebase('maos_v6_support_tickets', v); },

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
    if (user.role === 'ADMIN') get().setCurrentView('ADMIN_DASH');
    else if (user.role === 'CONTRATANTE') get().setCurrentView('HOME');
    else get().setCurrentView('WORKER_DASH');
    showToast(`Bem-vindo, ${user.nome.split(' ')[0]}!`);
    return true;
  },

  logout: () => {
    set({ currentUser: null });
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
  
  // Função para inicializar a escuta ao Firebase
  initFirebase: () => {
    let loadedCount = 0;
    const checkLoaded = () => {
      loadedCount++;
      if (loadedCount === 7) set({ isLoaded: true });
    };

    syncWithFirebase('maos_v6_users', INITIAL_USERS, (data) => { set({ users: data }); checkLoaded(); });
    syncWithFirebase('maos_v6_worker_details', INITIAL_WORKER_DETAILS, (data) => { set({ workerDetails: data }); checkLoaded(); });
    syncWithFirebase('maos_v6_contratante_details', INITIAL_CONTRATANTE_DETAILS, (data) => { set({ contratanteDetails: data }); checkLoaded(); });
    syncWithFirebase('maos_v6_services', INITIAL_SERVICES, (data) => { set({ services: data }); checkLoaded(); });
    syncWithFirebase('maos_v6_orders', [], (data) => { set({ orders: data }); checkLoaded(); });
    syncWithFirebase('maos_v6_reviews', [], (data) => { set({ reviews: data }); checkLoaded(); });
    syncWithFirebase('maos_v6_support_tickets', [], (data) => { set({ supportTickets: data }); checkLoaded(); });
  }
}));
