// src/components/layout/NavBar.jsx — Navegação responsiva e semântica com React Router
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../../store';

const CONTRATANTE_LINKS = [
  { path: '/', label: 'Explorar', icon: 'ph-compass' },
  { path: '/mensagens', label: 'Mensagens', icon: 'ph-chat-circle-dots' },
  { path: '/pedidos', label: 'Pedidos', icon: 'ph-receipt' },
  { path: '/perfil', label: 'Perfil', icon: 'ph-user' }
];

const WORKER_LINKS = [
  { path: '/trabalhador/dashboard', label: 'Painel', icon: 'ph-squares-four' },
  { path: '/mensagens', label: 'Mensagens', icon: 'ph-chat-circle-dots' },
  { path: '/trabalhador/servicos', label: 'Serviços', icon: 'ph-wrench' },
  { path: '/trabalhador/historico', label: 'Histórico', icon: 'ph-clock-counter-clockwise' },
  { path: '/trabalhador/perfil', label: 'Perfil', icon: 'ph-user-gear' }
];

const ADMIN_LINKS = [
  { path: '/admin', label: 'Dashboard', icon: 'ph-chart-pie-slice' },
  { path: '/admin/clientes', label: 'Clientes', icon: 'ph-users' },
  { path: '/admin/profissionais', label: 'Profissionais', icon: 'ph-briefcase' },
  { path: '/admin/aprovacoes', label: 'Aprovações', icon: 'ph-clock-countdown' },
  { path: '/admin/suporte', label: 'Suporte', icon: 'ph-headset' },
  { path: '/admin/chats', label: 'Chats', icon: 'ph-chats' }
];

function BrandLogo({ onClick }) {
  return (
    <span
      className="font-extrabold text-2xl select-none cursor-pointer"
      onClick={onClick}
    >
      <span className="text-[#1F2937]">mão</span>
      <span className="text-[#EA1D2C]">A</span>
      <span className="text-[#1F2937]">obra</span>
    </span>
  );
}

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout, orders } = useAppStore();
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const [deferredPrompt, setDeferredPrompt] = useState(() =>
    typeof window !== 'undefined' ? window.deferredPwaPrompt || null : null
  );

  useEffect(() => {
    const handler = () => {
      setDeferredPrompt(window.deferredPwaPrompt);
    };
    window.addEventListener('pwa-ready', handler);
    return () => window.removeEventListener('pwa-ready', handler);
  }, []);

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  const role = currentUser?.role;
  const links = !currentUser
    ? []
    : role === 'ADMIN'
    ? ADMIN_LINKS
    : role === 'TRABALHADOR'
    ? WORKER_LINKS
    : CONTRATANTE_LINKS;

  const myOrders = !currentUser
    ? []
    : orders.filter((o) =>
        role === 'CONTRATANTE' ? o.contratante_id === currentUser.id : o.worker_id === currentUser.id
      );
  const hasUnread = myOrders.some((o) => ['PENDENTE', 'EM_ANDAMENTO'].includes(o.status));

  const handleLogoClick = () => {
    navigate(role === 'ADMIN' ? '/admin' : role === 'TRABALHADOR' ? '/trabalhador/dashboard' : '/');
  };

  if (!currentUser) {
    return (
      <header className="fixed top-0 w-full bg-white border-b border-gray-200 z-50 h-20 px-4 md:px-8 flex items-center justify-between shadow-sm">
        <BrandLogo onClick={handleLogoClick} />
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDark(!isDark)}
            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-black transition"
            title="Alternar Tema"
          >
            <i className={`ph-bold ${isDark ? 'ph-sun text-yellow-400' : 'ph-moon'}`} />
          </button>
          {deferredPrompt && (
            <button
              onClick={async () => {
                deferredPrompt.prompt();
                await deferredPrompt.userChoice;
                setDeferredPrompt(null);
              }}
              className="bg-green-500 hover:bg-green-600 text-white font-extrabold px-3 py-2 rounded-xl text-xs flex items-center gap-1 shadow-md transition animate-pulse"
            >
              <i className="ph-bold ph-download-simple" /> Instalar App
            </button>
          )}
          <button
            onClick={() => navigate('/login')}
            className="bg-[#EA1D2C] hover:bg-[#c41020] text-white font-extrabold px-6 py-2.5 rounded-xl shadow-lg shadow-red-500/20 transition text-sm flex items-center gap-2"
          >
            <i className="ph-bold ph-sign-in text-lg" /> Entrar
          </button>
        </div>
      </header>
    );
  }

  return (
    <>
      {/* Desktop Header */}
      <header className="hidden md:flex fixed top-0 w-full bg-white border-b border-gray-200 z-50 h-20 px-8 items-center justify-between shadow-sm">
        <BrandLogo onClick={handleLogoClick} />
        <nav className="flex items-center gap-1">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            const isChat = link.path === '/mensagens';
            return (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`relative px-4 py-2.5 rounded-xl font-extrabold text-sm flex items-center gap-2 transition ${
                  isActive
                    ? 'bg-[#EA1D2C]/10 text-[#EA1D2C]'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-[#1F2937]'
                }`}
              >
                <i className={`ph-bold ${link.icon} text-lg`} />
                <span>{link.label}</span>
                {isChat && hasUnread && (
                  <span className="w-2.5 h-2.5 bg-[#EA1D2C] rounded-full ring-2 ring-white animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDark(!isDark)}
            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-black transition"
            title="Alternar Tema"
          >
            <i className={`ph-bold ${isDark ? 'ph-sun text-yellow-400' : 'ph-moon'}`} />
          </button>
          <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
            <img
              src={currentUser.foto_perfil_url || 'https://ui-avatars.com/api/?name=User&background=ea1d2c&color=fff'}
              className="w-10 h-10 rounded-full border border-gray-200 object-cover"
              alt={currentUser.nome}
            />
            <div className="text-left">
              <div className="font-extrabold text-sm text-[#1F2937] leading-tight">
                {currentUser.nome.split(' ')[0]}
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{role}</span>
            </div>
            <button
              onClick={async () => {
                await logout();
                navigate('/login');
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
              title="Sair"
            >
              <i className="ph-bold ph-sign-out text-lg" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 px-2 py-2 flex justify-around items-center shadow-lg">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          const isChat = link.path === '/mensagens';
          return (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition relative ${
                isActive ? 'text-[#EA1D2C] font-extrabold' : 'text-gray-400 font-bold hover:text-gray-600'
              }`}
            >
              <div className="relative">
                <i className={`text-2xl ${isActive ? 'ph-fill' : 'ph-bold'} ${link.icon}`} />
                {isChat && hasUnread && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#EA1D2C] rounded-full ring-2 ring-white animate-pulse" />
                )}
              </div>
              <span className="text-[10px] tracking-tight">{link.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
