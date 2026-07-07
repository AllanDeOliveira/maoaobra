// src/pages/ClientOrders.jsx
import { useState } from 'react';
import { useAppStore } from '../store';
import Header from '../components/ui/Header';
import OrderChatModal from '../components/modals/OrderChatModal';

export default function ClientOrders() {
  const { currentUser, orders, users, services, setCurrentView, setSelectedWorkerId } = useAppStore();
  const [activeChat, setActiveChat] = useState(null);

  if (!currentUser) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 animate-fade-in">
      <i className="ph-fill ph-receipt text-7xl text-gray-200 mb-4" />
      <h2 className="text-2xl font-extrabold text-[#1F2937] mb-2">Meus Pedidos</h2>
      <p className="text-gray-500 font-medium mb-6">Faça login para acompanhar seus pedidos.</p>
      <button onClick={() => setCurrentView('LOGIN')} className="bg-[#EA1D2C] text-white font-extrabold px-8 py-3 rounded-xl shadow-lg shadow-red-500/30 hover:bg-[#c41020] transition">Fazer Login</button>
    </div>
  );

  const myOrders = orders.filter(o => o.contratante_id === currentUser.id && ['CONCLUIDO', 'RECUSADO'].includes(o.status));

  const statusStyle = (status) => {
    if (['PENDENTE','ACEITO','EM_ANDAMENTO'].includes(status)) return { badge: 'bg-orange-50 text-orange-700 border-orange-200', bar: 'bg-orange-500' };
    if (status === 'CONCLUIDO') return { badge: 'bg-green-50 text-green-700 border-green-200', bar: 'bg-green-500' };
    return { badge: 'bg-gray-50 text-gray-600 border-gray-200', bar: 'bg-gray-300' };
  };

  return (
    <div className="pb-28 animate-fade-in w-full">
      <Header title="Histórico de Pedidos" />
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {myOrders.length === 0 ? (
          <div className="text-center col-span-full bg-white p-10 rounded-3xl border border-gray-100 shadow-sm max-w-lg mx-auto">
            <i className="ph-fill ph-receipt text-6xl text-gray-200 mb-4" />
            <h3 className="text-xl font-bold text-[#1F2937]">Nenhum pedido ainda</h3>
            <p className="font-medium mt-2 text-gray-500">Explore os profissionais na página inicial e solicite orçamentos!</p>
            <button onClick={() => setCurrentView('HOME')} className="mt-6 bg-[#EA1D2C] text-white font-extrabold px-6 py-3 rounded-xl shadow-lg shadow-red-500/30 hover:bg-[#c41020] transition">Explorar Profissionais</button>
          </div>
        ) : myOrders.map(o => {
          const worker = users.find(u => u.id === o.worker_id);
          const servico = services.find(s => s.id === o.servico_id);
          const { badge, bar } = statusStyle(o.status);
          const isActive = ['PENDENTE','ACEITO','EM_ANDAMENTO'].includes(o.status);
          return (
            <div key={o.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-full h-1.5 ${bar}`} />
              <div className="flex justify-between items-center mb-4 mt-2">
                <span className={`text-xs font-extrabold px-3 py-1.5 rounded-lg border ${badge}`}>STATUS: {o.status}</span>
                <span className="text-xs text-gray-400 font-bold">{o.data}</span>
              </div>
              <div className="flex gap-4 items-center mb-6 cursor-pointer group" onClick={() => setSelectedWorkerId(worker?.id)}>
                <img src={worker?.foto_perfil_url} className="w-14 h-14 rounded-full object-cover border-2 border-gray-100 group-hover:border-[#EA1D2C] transition" alt={worker?.nome} />
                <div>
                  <h4 className="font-extrabold text-[#1F2937] text-base">{servico?.titulo || 'Serviço Personalizado'}</h4>
                  <p className="text-xs text-gray-500 font-bold mt-0.5 group-hover:text-[#EA1D2C] transition">Com {worker?.nome}</p>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl flex justify-between items-center border border-gray-100 mb-4">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Agendamento</span>
                  <div className="text-sm font-extrabold text-[#1F2937]">{o.agendamento || 'A combinar'}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Valor</span>
                  <div className="font-extrabold text-[#EA1D2C] text-xl">R$ {o.preco_final}</div>
                </div>
              </div>
              {o.status !== 'RECUSADO' && (
                <button onClick={() => setActiveChat(o)} className="w-full bg-[#EA1D2C] text-white text-sm font-extrabold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-[#c41020] transition shadow-lg shadow-red-500/20">
                  <i className="ph-fill ph-chat-circle-dots text-xl" /> Abrir Chat do Pedido
                </button>
              )}
            </div>
          );
        })}
      </div>
      {activeChat && <OrderChatModal order={orders.find(o => o.id === activeChat.id)} onClose={() => setActiveChat(null)} />}
    </div>
  );
}
