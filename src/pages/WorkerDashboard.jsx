import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import OrderChatModal from '../components/modals/OrderChatModal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function WorkerDashboard() {
  const navigate = useNavigate();
  const { orders, users, services, currentUser } = useAppStore();
  const [activeChat, setActiveChat] = useState(null);

  const myOrders = orders.filter((o) => o.worker_id === currentUser?.id);
  const ativos = myOrders.filter((o) => ['PENDENTE', 'ACEITO', 'EM_ANDAMENTO'].includes(o.status));
  const concluidos = myOrders.filter((o) => o.status === 'CONCLUIDO');

  const totalGanhos = concluidos.reduce((acc, o) => acc + (Number(o.preco_final) || 0), 0);
  const chartData = [
    { name: 'Semana 1', ganhos: 0 },
    { name: 'Semana 2', ganhos: 0 },
    { name: 'Semana 3', ganhos: 0 },
    { name: 'Semana Atual', ganhos: totalGanhos }
  ];

  if (!currentUser) return null;

  return (
    <div className="pb-28 animate-fade-in w-full">
      {/* Dark header */}
      <div className="bg-[#1F2937] pt-12 pb-8 px-5 md:px-8 shadow-md rounded-b-[2rem] md:rounded-none">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:justify-between md:items-end gap-6">
          <div className="flex items-center gap-5">
            <img
              src={currentUser.foto_perfil_url || 'https://ui-avatars.com/api/?name=Worker&background=ea1d2c&color=fff'}
              className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border-2 border-white shadow-lg bg-white object-cover"
              alt={currentUser.nome}
            />
            <div>
              <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Painel do Profissional</p>
              <h1 className="text-3xl font-extrabold text-white mt-1">Olá, {currentUser.nome.split(' ')[0]}!</h1>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 w-full md:w-auto">
            {[
              { label: 'Ativos', value: ativos.length, color: 'text-orange-400' },
              { label: 'Concluídos', value: concluidos.length, color: 'text-green-400' },
              { label: 'Total', value: myOrders.length, color: 'text-white' }
            ].map((s) => (
              <div key={s.label} className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10 text-center">
                <div className={`text-3xl font-extrabold ${s.color}`}>{s.value}</div>
                <div className="text-xs uppercase font-extrabold tracking-widest text-gray-300 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 md:p-8 mt-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-extrabold text-[#1F2937] flex items-center gap-2">
            <i className="ph-fill ph-clock-countdown text-orange-500" /> Solicitações Ativas
          </h2>
          <span className="bg-orange-100 text-orange-700 text-sm font-bold px-3 py-1 rounded-lg border border-orange-200">
            {ativos.length} ativas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ativos.length === 0 ? (
            <div className="col-span-full bg-white p-10 rounded-3xl shadow-sm border border-gray-100 text-center">
              <i className="ph-fill ph-coffee text-6xl text-gray-200 mb-4" />
              <h3 className="text-xl font-bold text-[#1F2937]">Tudo tranquilo por aqui.</h3>
              <p className="text-gray-500 font-medium">Nenhum serviço pendente no momento.</p>
            </div>
          ) : (
            ativos.map((o) => {
              const client = users.find((u) => u.id === o.contratante_id);
              const srv = services.find((s) => s.id === o.servico_id);
              const isPending = o.status === 'PENDENTE';

              return (
                <div
                  key={o.id}
                  className={`bg-white border-t-4 ${
                    isPending ? 'border-orange-500' : 'border-blue-500'
                  } rounded-3xl p-6 shadow-md hover:shadow-lg transition`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span
                        className={`text-xs font-extrabold px-2 py-1 rounded-lg border ${
                          isPending ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        {o.status === 'EM_ANDAMENTO' ? 'Em Andamento' : o.status}
                      </span>
                      <h3 className="font-extrabold text-[#1F2937] text-lg mt-2">{srv?.titulo || 'Serviço Personalizado'}</h3>
                      <div className="flex items-center gap-1 text-xs text-gray-500 font-bold mt-1">
                        <i className="ph-fill ph-calendar-blank text-[#EA1D2C]" /> {o.agendamento || 'A combinar'}
                      </div>
                    </div>
                    <span className="font-extrabold text-[#EA1D2C] text-xl bg-red-50 px-2 py-1 rounded-lg whitespace-nowrap">
                      R$ {o.preco_final || 0}
                    </span>
                  </div>
                  <div
                    className="bg-gray-50 p-4 rounded-2xl flex items-center gap-3 mb-4 border border-gray-100 cursor-pointer hover:border-[#EA1D2C] transition group"
                    onClick={() => navigate(`/cliente/${client?.id}`)}
                  >
                    <img
                      src={client?.foto_perfil_url || 'https://ui-avatars.com/api/?name=Client&background=ea1d2c&color=fff'}
                      className="w-10 h-10 rounded-full border border-gray-200 group-hover:border-[#EA1D2C] transition object-cover"
                      alt={client?.nome}
                    />
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase group-hover:text-[#EA1D2C] transition">
                        Cliente
                      </span>
                      <div className="text-sm font-extrabold text-[#1F2937] group-hover:text-[#EA1D2C] transition">
                        {client?.nome || 'Cliente'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveChat(o)}
                    className="bg-[#EA1D2C] hover:bg-[#c41020] transition text-white py-3 rounded-xl w-full font-extrabold text-sm shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
                  >
                    <i className="ph-fill ph-chat-circle-dots text-xl" /> Acessar Pedido & Chat
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Gráfico Financeiro */}
        <div className="mt-12 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl md:text-2xl font-extrabold text-[#1F2937] flex items-center gap-2">
              <i className="ph-fill ph-chart-bar text-green-500" /> Relatório de Ganhos
            </h2>
            <span className="bg-green-100 text-green-700 text-sm font-bold px-3 py-1 rounded-lg border border-green-200">
              Total Acumulado
            </span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 700 }} tickFormatter={(val) => `R$${val}`} />
                <Tooltip
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontWeight: 'bold' }}
                  formatter={(value) => [`R$ ${value}`, 'Ganhos']}
                />
                <Bar dataKey="ganhos" fill="#EA1D2C" radius={[8, 8, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
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
