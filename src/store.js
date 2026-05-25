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
  { id: 'w5', nome: 'Roberto Montador', email: 'montador@gmail.com', senha: '123', role: 'TRABALHADOR', foto_perfil_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop', telefone: '(11) 94444-3333', data_criacao: new Date().toISOString(), status: 'APPROVED' },
  { id: 'w6', nome: 'Lucas TI', email: 'ti@gmail.com', senha: '123', role: 'TRABALHADOR', foto_perfil_url: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&h=400&fit=crop', telefone: '(11) 93333-2222', data_criacao: new Date().toISOString(), status: 'APPROVED' },
  { id: 'w7', nome: 'João Jardineiro', email: 'jardineiro@gmail.com', senha: '123', role: 'TRABALHADOR', foto_perfil_url: 'https://images.unsplash.com/photo-1416879598466-0bf32a514d02?w=400&h=400&fit=crop', telefone: '(11) 92222-1111', data_criacao: new Date().toISOString(), status: 'APPROVED' },
  { id: 'c1', nome: 'Pedro Cliente', email: 'pedro@gmail.com', senha: '123', role: 'CONTRATANTE', foto_perfil_url: 'https://ui-avatars.com/api/?name=Pedro+Cliente&background=6f42c1&color=fff', telefone: '(11) 99999-1111', data_criacao: new Date().toISOString(), status: 'APPROVED' },
];

const INITIAL_WORKER_DETAILS = [
  { user_id: 'w1', bio: 'Olá! Sou o Eduardo, eletricista com mais de 10 anos de experiência em instalações residenciais e prediais. Faço desde pequenas trocas de tomadas até quadros de distribuição complexos. Trabalho com segurança e sigo as normas técnicas (NBR 5410).', categorias: ['Eletricista'], nota_media: 4.9, portfolio_fotos: [], cpf: '123.456.789-00', cep: '78200-000', rua: 'Rua Principal', numero: '100', bairro: 'Centro', uf: 'MT', cidade: 'Cáceres', isOnline: true, workingHours: 'Seg-Sex, 08:00 às 18:00' },
  { user_id: 'w2', bio: 'Encanador profissional. Resolvo vazamentos, faço instalação de tubulações de água fria e quente, limpeza de caixa d\'água e desentupimento. Meu diferencial é a limpeza e agilidade no serviço.', categorias: ['Encanador'], nota_media: 4.8, portfolio_fotos: [], cpf: '223.456.789-00', cep: '78200-000', rua: 'Rua das Águas', numero: '200', bairro: 'Centro', uf: 'MT', cidade: 'Cáceres', isOnline: true, workingHours: 'Seg-Sex, 08:00 às 18:00' },
  { user_id: 'w3', bio: 'Diarista caprichosa, detalhista e de confiança. Faço faxinas pesadas, limpeza pós-obra, e organização de armários. Deixo sua casa brilhando com produtos adequados para cada superfície.', categorias: ['Diarista'], nota_media: 5.0, portfolio_fotos: [], cpf: '323.456.789-00', cep: '78200-000', rua: 'Rua da Limpeza', numero: '300', bairro: 'Centro', uf: 'MT', cidade: 'Cáceres', isOnline: true, workingHours: 'Seg-Sab, 07:00 às 17:00' },
  { user_id: 'w4', bio: 'Pintor com especialidade em texturas, grafiato, pintura lisa e epóxi. Transformo o visual da sua casa protegendo seus móveis e chão. Garantia de acabamento liso e sem manchas.', categorias: ['Pintor'], nota_media: 4.7, portfolio_fotos: [], cpf: '423.456.789-00', cep: '78200-000', rua: 'Avenida das Cores', numero: '400', bairro: 'Centro', uf: 'MT', cidade: 'Cáceres', isOnline: false, workingHours: 'Seg-Sex, 08:00 às 18:00' },
  { user_id: 'w5', bio: 'Montador de móveis experiente. Trago minhas próprias ferramentas e cuido das suas peças para não arranhar. Monto desde guarda-roupas enormes até painéis de TV com suporte embutido.', categorias: ['Montador'], nota_media: 4.6, portfolio_fotos: [], cpf: '523.456.789-00', cep: '78200-000', rua: 'Rua da Madeira', numero: '500', bairro: 'Centro', uf: 'MT', cidade: 'Cáceres', isOnline: true, workingHours: 'Seg-Sex, 08:00 às 18:00' },
  { user_id: 'w6', bio: 'Técnico de Informática (TI) com paixão por hardware e software. Removo vírus, formato computadores, configuro redes Wi-Fi empresariais e faço upgrade de SSD e Memória RAM na sua casa.', categorias: ['TI'], nota_media: 4.9, portfolio_fotos: [], cpf: '623.456.789-00', cep: '78200-000', rua: 'Rua dos Bits', numero: '600', bairro: 'Centro', uf: 'MT', cidade: 'Cáceres', isOnline: true, workingHours: 'Seg-Sex, 09:00 às 19:00' },
  { user_id: 'w7', bio: 'Jardineiro e paisagista. Adoro o que faço! Faço manutenção de gramados, poda de árvores de pequeno e médio porte, controle de pragas, adubação e criação de canteiros ornamentais.', categorias: ['Jardineiro'], nota_media: 4.8, portfolio_fotos: [], cpf: '723.456.789-00', cep: '78200-000', rua: 'Rua das Plantas', numero: '700', bairro: 'Centro', uf: 'MT', cidade: 'Cáceres', isOnline: true, workingHours: 'Seg-Sab, 06:00 às 16:00' },
];

const INITIAL_CONTRATANTE_DETAILS = [
  { user_id: 'c1', cpf: '555.666.777-88', cep: '78200-000', rua: 'Avenida Sete de Setembro', numero: '1000', bairro: 'Centro', uf: 'MT', cidade: 'Cáceres' },
];

const INITIAL_SERVICES = [
  // w1 Eletricista
  { id: 's1', worker_id: 'w1', titulo: 'Instalação de Chuveiro 220v/110v', descricao: 'Instalação completa e segura com conectores de porcelana.', preco_base: 80, tempo_estimado: '1h', imagem_url: 'https://images.unsplash.com/photo-1585255476311-dfabec4bbff7?w=600&h=400&fit=crop' },
  { id: 's1_2', worker_id: 'w1', titulo: 'Troca de Fiação (por cômodo)', descricao: 'Substituição de fios antigos por cabos modernos para evitar incêndios.', preco_base: 150, tempo_estimado: '3h', imagem_url: 'https://images.unsplash.com/photo-1621905251918-48416bd8af50?w=600&h=400&fit=crop' },
  { id: 's1_3', worker_id: 'w1', titulo: 'Instalação de Ventilador de Teto', descricao: 'Montagem mecânica e elétrica do ventilador.', preco_base: 120, tempo_estimado: '2h', imagem_url: 'https://images.unsplash.com/photo-1527344941323-ebc02dc21eb8?w=600&h=400&fit=crop' },
  
  // w2 Encanador
  { id: 's2', worker_id: 'w2', titulo: 'Caça Vazamentos Ocultos', descricao: 'Uso de aparelhos para detectar vazamentos nas paredes sem quebrar nada à toa.', preco_base: 180, tempo_estimado: '2h', imagem_url: 'https://images.unsplash.com/photo-1505798577917-a65157d3320a?w=600&h=400&fit=crop' },
  { id: 's2_2', worker_id: 'w2', titulo: 'Desentupimento de Pia/Ralo', descricao: 'Remoção de sujeira e gordura das tubulações.', preco_base: 100, tempo_estimado: '1h', imagem_url: 'https://images.unsplash.com/photo-1585058177435-01e4a6435f33?w=600&h=400&fit=crop' },
  { id: 's2_3', worker_id: 'w2', titulo: 'Limpeza de Caixa D\'Água', descricao: 'Higienização completa seguindo padrões de saúde.', preco_base: 150, tempo_estimado: '2h', imagem_url: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=600&h=400&fit=crop' },

  // w3 Diarista
  { id: 's3', worker_id: 'w3', titulo: 'Faxina Completa Residencial', descricao: 'Limpeza de todos os cômodos, varrição e passar pano.', preco_base: 130, tempo_estimado: '8h', imagem_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=400&fit=crop' },
  { id: 's3_2', worker_id: 'w3', titulo: 'Faxina Pós-Obra', descricao: 'Limpeza pesada de respingos de tinta e poeira fina.', preco_base: 250, tempo_estimado: '1 dia', imagem_url: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=600&h=400&fit=crop' },
  { id: 's3_3', worker_id: 'w3', titulo: 'Organização de Guarda-Roupas', descricao: 'Dobras padronizadas e organização por cor.', preco_base: 90, tempo_estimado: '4h', imagem_url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=400&fit=crop' },

  // w4 Pintor
  { id: 's4', worker_id: 'w4', titulo: 'Pintura de Fachada', descricao: 'Pintura externa com tinta impermeabilizante.', preco_base: 500, tempo_estimado: '2 dias', imagem_url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&h=400&fit=crop' },
  { id: 's4_2', worker_id: 'w4', titulo: 'Aplicação de Grafiato/Textura', descricao: 'Trabalho artístico na parede (valor por m²).', preco_base: 35, tempo_estimado: '1h', imagem_url: 'https://images.unsplash.com/photo-1562259929-b7e181d8d007?w=600&h=400&fit=crop' },
  { id: 's4_3', worker_id: 'w4', titulo: 'Pintura Interna Padrão', descricao: 'Mão de obra para pintura lisa de ambientes internos (por cômodo).', preco_base: 200, tempo_estimado: '1 dia', imagem_url: 'https://images.unsplash.com/photo-1562259924-f7dfbb4787a4?w=600&h=400&fit=crop' },

  // w5 Montador
  { id: 's5', worker_id: 'w5', titulo: 'Montagem de Guarda-Roupa Grande', descricao: 'Montagem de roupeiros de até 6 portas.', preco_base: 150, tempo_estimado: '4h', imagem_url: 'https://images.unsplash.com/photo-1581428982868-e410dd4b1a6c?w=600&h=400&fit=crop' },
  { id: 's5_2', worker_id: 'w5', titulo: 'Instalação de Painel de TV', descricao: 'Montagem do painel e fixação segura da TV na parede.', preco_base: 120, tempo_estimado: '2h', imagem_url: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=600&h=400&fit=crop' },
  { id: 's5_3', worker_id: 'w5', titulo: 'Desmontagem de Móveis para Mudança', descricao: 'Desmontagem cuidadosa embalando parafusos.', preco_base: 80, tempo_estimado: '2h', imagem_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop' },

  // w6 TI
  { id: 's6', worker_id: 'w6', titulo: 'Formatação de PC / Notebook', descricao: 'Instalação limpa do Windows + Office + Antivírus.', preco_base: 100, tempo_estimado: '2h', imagem_url: 'https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=600&h=400&fit=crop' },
  { id: 's6_2', worker_id: 'w6', titulo: 'Limpeza Interna de Notebook', descricao: 'Troca de pasta térmica e limpeza dos coolers.', preco_base: 120, tempo_estimado: '2h', imagem_url: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&h=400&fit=crop' },
  { id: 's6_3', worker_id: 'w6', titulo: 'Configuração de Roteador Wi-Fi', descricao: 'Configuração de redes, senhas e repetidores de sinal.', preco_base: 70, tempo_estimado: '1h', imagem_url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&h=400&fit=crop' },

  // w7 Jardineiro
  { id: 's7', worker_id: 'w7', titulo: 'Roçagem de Terrenos', descricao: 'Limpeza de mato alto em lotes e terrenos (valor inicial).', preco_base: 150, tempo_estimado: '3h', imagem_url: 'https://images.unsplash.com/photo-1558904541-efa843a96f09?w=600&h=400&fit=crop' },
  { id: 's7_2', worker_id: 'w7', titulo: 'Manutenção de Gramado', descricao: 'Corte de grama com máquina, acabamento e adubação.', preco_base: 90, tempo_estimado: '2h', imagem_url: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=600&h=400&fit=crop' },
  { id: 's7_3', worker_id: 'w7', titulo: 'Poda de Árvores Frutíferas', descricao: 'Poda direcionada para aumentar a produção de frutos.', preco_base: 80, tempo_estimado: '2h', imagem_url: 'https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?w=600&h=400&fit=crop' },
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
  setUsers: (v) => { set({ users: v }); saveToFirebase('maos_v9_users', v); },
  setWorkerDetails: (v) => { set({ workerDetails: v }); saveToFirebase('maos_v9_worker_details', v); },
  setContratanteDetails: (v) => { set({ contratanteDetails: v }); saveToFirebase('maos_v9_contratante_details', v); },
  setServices: (v) => { set({ services: v }); saveToFirebase('maos_v9_services', v); },
  setOrders: (v) => { set({ orders: v }); saveToFirebase('maos_v9_orders', v); },
  setReviews: (v) => { set({ reviews: v }); saveToFirebase('maos_v9_reviews', v); },
  setSupportTickets: (v) => { set({ supportTickets: v }); saveToFirebase('maos_v9_support_tickets', v); },

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

    syncWithFirebase('maos_v9_users', INITIAL_USERS, (data) => { set({ users: data }); checkLoaded(); });
    syncWithFirebase('maos_v9_worker_details', INITIAL_WORKER_DETAILS, (data) => { set({ workerDetails: data }); checkLoaded(); });
    syncWithFirebase('maos_v9_contratante_details', INITIAL_CONTRATANTE_DETAILS, (data) => { set({ contratanteDetails: data }); checkLoaded(); });
    syncWithFirebase('maos_v9_services', INITIAL_SERVICES, (data) => { set({ services: data }); checkLoaded(); });
    syncWithFirebase('maos_v9_orders', [], (data) => { set({ orders: data }); checkLoaded(); });
    syncWithFirebase('maos_v9_reviews', [], (data) => { set({ reviews: data }); checkLoaded(); });
    syncWithFirebase('maos_v9_support_tickets', [], (data) => { set({ supportTickets: data }); checkLoaded(); });
  }
}));
