import { useState, useEffect } from 'react';
import { useAppStore } from '../../store';

const CONTRATANTE_LINKS = [
  { id: 'HOME',    icon: 'ph-house',         label: 'Início' },
  { id: 'ORDERS',  icon: 'ph-receipt',       label: 'Pedidos' },
  { id: 'PROFILE', icon: 'ph-user-circle',   label: 'Perfil' },
];
const WORKER_LINKS = [
  { id: 'WORKER_DASH',     icon: 'ph-chart-line', label: 'Dashboard' },
  { id: 'WORKER_SERVICES', icon: 'ph-briefcase',  label: 'Serviços' },
  { id: 'WORKER_HISTORY',  icon: 'ph-clock',      label: 'Histórico' },
  { id: 'WORKER_PROFILE',  icon: 'ph-user-circle',label: 'Perfil' },
];
const ADMIN_LINKS = [
  { id: 'ADMIN_DASH',      icon: 'ph-gauge',       label: 'Geral' },
  { id: 'ADMIN_CLIENTS',   icon: 'ph-users',       label: 'Clientes' },
  { id: 'ADMIN_WORKERS',   icon: 'ph-hard-hat',    label: 'Profissionais' },
  { id: 'ADMIN_APPROVALS', icon: 'ph-clock',       label: 'Aprovações' },
  { id: 'ADMIN_SUPPORT',   icon: 'ph-headset',     label: 'Suporte' },
  { id: 'ADMIN_CHATS',     icon: 'ph-chats',       label: 'Monitoramento' },
];

export default function NavBar() {
  const { currentUser, currentView, setCurrentView, logout, orders } = useAppStore();
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  const role = currentUser?.role;
  const links = !currentUser ? [] : role === 'ADMIN' ? ADMIN_LINKS : role === 'TRABALHADOR' ? WORKER_LINKS : CONTRATANTE_LINKS;

  const myOrders = !currentUser ? [] : orders.filter(o =>
    role === 'CONTRATANTE' ? o.contratante_id === currentUser.id : o.worker_id === currentUser.id
  );
  const hasUnread = myOrders.some(o => o.chat_history?.length > 0 && ['PENDENTE','ACEITO','EM_ANDAMENTO'].includes(o.status));

  const Logo = () => (
    <span className="font-extrabold text-2xl select-none cursor-pointer" onClick={() => setCurrentView(role === 'ADMIN' ? 'ADMIN_DASH' : 'HOME')}>
      <span className="text-[#1F2937]">mão</span><span className="text-[#EA1D2C]">A</span><span className="text-[#1F2937]">obra</span>
    </span>
  );

  if (!currentUser) {
    return (
      <header className="fixed top-0 w-full bg-white border-b border-gray-200 z-50 h-20 px-4 md:px-8 flex items-center justify-between shadow-sm">
        <Logo />
        <div className="flex items-center gap-3">
          <button onClick={() => setIsDark(!isDark)} className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 hover:text-[#EA1D2C] hover:bg-red-50 transition border border-gray-100 mr-2">
            <i className={`ph-fill ${isDark ? 'ph-moon' : 'ph-sun'} text-lg`} />
          </button>
          <button onClick={() => setCurrentView('REGISTER')} className="hidden md:block font-bold text-gray-600 hover:text-[#EA1D2C] px-4 py-2 transition">Criar Conta</button>
          <button onClick={() => setCurrentView('LOGIN')} className="bg-[#EA1D2C] text-white font-extrabold px-6 py-2.5 rounded-xl hover:bg-[#c41020] shadow-md shadow-red-500/20 transition">Entrar</button>
        </div>
      </header>
    );
  }

  return (
    <>
      {/* ── Desktop ── */}
      <header className="hidden md:flex fixed top-0 w-full bg-white border-b border-gray-200 z-50 h-20 px-8 items-center justify-between shadow-sm">
        <Logo />
        <nav className="flex items-center gap-1">
          {links.map(link => {
            const active = currentView === link.id;
            const badge = (link.id === 'ORDERS' || link.id === 'WORKER_DASH') && hasUnread;
            return (
              <button
                key={link.id}
                onClick={() => setCurrentView(link.id)}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all
                  ${active ? 'bg-red-50 text-[#EA1D2C]' : 'text-gray-500 hover:bg-gray-50 hover:text-[#1F2937]'}`}
              >
                <i className={`${active ? 'ph-fill' : 'ph'} ${link.icon} text-lg`} />
                {link.label}
                {badge && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />}
              </button>
            );
          })}
          <button onClick={() => setIsDark(!isDark)} className="ml-2 w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-[#EA1D2C] transition">
            <i className={`ph-fill ${isDark ? 'ph-moon' : 'ph-sun'} text-lg`} />
          </button>
          <button onClick={logout} className="ml-1 px-4 py-2.5 rounded-xl font-bold text-sm text-gray-500 hover:bg-gray-50 hover:text-[#EA1D2C] transition flex items-center gap-2">
            <i className="ph ph-sign-out text-lg" /> Sair
          </button>
        </nav>
      </header>

      {/* ── Mobile Bottom ── */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around pt-2 pb-4 z-50 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
        {links.map(link => {
          const active = currentView === link.id;
          const badge = (link.id === 'ORDERS' || link.id === 'WORKER_DASH') && hasUnread;
          return (
            <button
              key={link.id}
              onClick={() => setCurrentView(link.id)}
              className={`relative flex flex-col items-center gap-0.5 transition-all ${active ? 'text-[#EA1D2C]' : 'text-gray-400'}`}
            >
              <div className="relative">
                <i className={`text-xl ${active ? 'ph-fill' : 'ph'} ${link.icon}`} />
                {badge && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse" />}
              </div>
              <span className="text-[10px] font-bold">{link.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
