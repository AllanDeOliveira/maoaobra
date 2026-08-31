// src/pages/WorkerHistory.jsx — Histórico de serviços concluídos e cancelados pelo trabalhador
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import Header from '../components/ui/Header';
import OrderChatModal from '../components/modals/OrderChatModal';

export default function WorkerHistory() {
  const navigate = useNavigate();
  const { orders, users, services, currentUser } = useAppStore();
  const [activeChat, setActiveChat] = useState(null);

  const myOrders = orders.filter(
    (o) => o.worker_id === currentUser?.id && ['CONCLUIDO', 'CANCELADO', 'RECUSADO'].includes(o.status)
  );

  return (
    <div className="pb-28 animate-fade-in w-full">
      <Header title="Histórico de Serviços" />
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        {myOrders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm mt-8">
            <i className="ph-fill ph-clock-counter-clockwise text-6xl text-gray-200 mb-4" />
            <h3 className="text-xl font-extrabold text-[#1F2937] mb-2">Nenhum serviço anterior</h3>
            <p className="text-gray-500 font-medium">Você ainda não possui serviços concluídos ou cancelados.</p>
          </div>
        ) : (
          myOrders.map((o) => {
            const client = users.find((u) => u.id === o.contratante_id);
            const servico = services.find((s) => s.id === o.servico_id);
            const done = o.status === 'CONCLUIDO';

            return (
              <div
                key={o.id}
                className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition mb-4 relative overflow-hidden"
              >
                <div className={`absolute top-0 left-0 w-full h-1.5 ${done ? 'bg-green-500' : 'bg-red-400'}`} />
                <div className="flex justify-between items-center mb-4 mt-2">
                  <span
                    className={`text-xs font-extrabold px-3 py-1.5 rounded-lg border ${
                      done ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                    }`}
                  >
                    STATUS: {o.status}
                  </span>
                  <span className="text-xs text-gray-400 font-bold">{o.data || o.createdAt?.split('T')[0]}</span>
                </div>
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
                  <div>
                    <h3 className="font-extrabold text-[#1F2937] text-lg">{servico?.titulo || 'Serviço Personalizado'}</h3>
                    <span className="font-extrabold text-[#EA1D2C] text-xl">R$ {o.preco_final || 0}</span>
                  </div>
                  <div
                    onClick={() => navigate(`/cliente/${client?.id}`)}
                    className="bg-gray-50 p-4 rounded-2xl flex items-center gap-3 border border-gray-100 cursor-pointer hover:bg-gray-200 transition"
                  >
                    <img
                      src={
                        client?.foto_perfil_url ||
                        'https://ui-avatars.com/api/?name=Client&background=ea1d2c&color=fff'
                      }
                      className="w-10 h-10 rounded-full border border-gray-200 object-cover"
                      alt={client?.nome}
                    />
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase">Cliente</span>
                      <div className="text-sm font-extrabold text-[#1F2937]">{client?.nome || 'Cliente'}</div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setActiveChat(o)}
                  className="w-full bg-gray-100 text-[#1F2937] text-sm font-extrabold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition border border-gray-200"
                >
                  <i className="ph-fill ph-chat-circle-dots text-xl text-[#EA1D2C]" /> Ver Histórico de Mensagens
                </button>
              </div>
            );
          })
        )}
      </div>
      {activeChat && (
        <OrderChatModal
          order={orders.find((o) => o.id === activeChat.id) || activeChat}
          onClose={() => setActiveChat(null)}
        />
      )}
    </div>
  );
}
