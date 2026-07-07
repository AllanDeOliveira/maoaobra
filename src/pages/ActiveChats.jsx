import { useState } from 'react';
import { useAppStore } from '../store';
import Header from '../components/ui/Header';
import OrderChatModal from '../components/modals/OrderChatModal';

export default function ActiveChats() {
  const { currentUser, orders, users, services, setCurrentView, setSelectedWorkerId, setSelectedClientId } = useAppStore();
  const [activeChat, setActiveChat] = useState(null);

  if (!currentUser) return null;

  const role = currentUser.role;
  const myOrders = orders.filter(o => role === 'CONTRATANTE' ? o.contratante_id === currentUser.id : o.worker_id === currentUser.id);
  const ativos = myOrders.filter(o => ['PENDENTE','ACEITO','EM_ANDAMENTO'].includes(o.status));

  return (
    <div className="pb-28 animate-fade-in w-full">
      <Header title="Mensagens e Solicitações Ativas" />
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {ativos.length === 0 ? (
          <div className="text-center col-span-full bg-white p-10 rounded-3xl border border-gray-100 shadow-sm max-w-lg mx-auto">
            <i className="ph-fill ph-chats text-6xl text-gray-200 mb-4" />
            <h3 className="text-xl font-bold text-[#1F2937]">Nenhum chat ativo</h3>
            <p className="font-medium mt-2 text-gray-500">Você não possui solicitações em andamento.</p>
          </div>
        ) : ativos.map(o => {
          const otherId = role === 'CONTRATANTE' ? o.worker_id : o.contratante_id;
          const otherUser = users.find(u => u.id === otherId);
          const servico = services.find(s => s.id === o.servico_id);

          return (
            <div key={o.id} className="bg-white border-t-4 border-orange-500 rounded-3xl p-6 shadow-sm hover:shadow-md transition flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs font-extrabold px-2 py-1 rounded-lg border bg-orange-50 text-orange-700 border-orange-200">{o.status}</span>
                  <h3 className="font-extrabold text-[#1F2937] text-lg mt-2">{servico?.titulo || 'Serviço Personalizado'}</h3>
                </div>
              </div>
              <div className="flex gap-4 items-center mb-6 cursor-pointer group" onClick={() => role === 'CONTRATANTE' ? setSelectedWorkerId(otherId) : setSelectedClientId(otherId)}>
                <img src={otherUser?.foto_perfil_url} className="w-12 h-12 rounded-full object-cover border border-gray-200 group-hover:border-[#EA1D2C] transition" alt={otherUser?.nome} />
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">{role === 'CONTRATANTE' ? 'Profissional' : 'Cliente'}</p>
                  <h4 className="font-extrabold text-[#1F2937] text-sm group-hover:text-[#EA1D2C] transition">{otherUser?.nome}</h4>
                </div>
              </div>
              <button onClick={() => setActiveChat(o)} className="mt-auto w-full bg-[#EA1D2C] text-white text-sm font-extrabold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-[#c41020] transition shadow-lg shadow-red-500/20">
                <i className="ph-fill ph-chat-circle-dots text-xl" /> Abrir Chat
              </button>
            </div>
          );
        })}
      </div>
      {activeChat && <OrderChatModal order={orders.find(o => o.id === activeChat.id)} onClose={() => setActiveChat(null)} />}
    </div>
  );
}
