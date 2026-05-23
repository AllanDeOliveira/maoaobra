// src/pages/AdminPages.jsx — AdminClients, AdminWorkers, AdminApprovals, AdminSupport, AdminChats
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAppStore } from '../store';
import Header from '../components/ui/Header';

// ---- AdminUserDetailModal ----
function AdminUserDetailModal({ user, onClose }) {
  if (!user) return null;
  const { workerDetails, contratanteDetails, orders, services, users } = useAppStore();
  const details = user.role === 'CONTRATANTE' ? contratanteDetails.find(d => d.user_id === user.id) : workerDetails.find(d => d.user_id === user.id);
  const userOrders = user.role === 'CONTRATANTE' ? orders.filter(o => o.contratante_id === user.id) : orders.filter(o => o.worker_id === user.id);

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-down">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-extrabold text-lg flex items-center gap-2"><i className="ph-fill ph-identification-badge text-[#EA1D2C]" /> Dossiê do Usuário</h3>
          <button onClick={onClose} className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#1F2937] hover:bg-red-50 hover:text-[#EA1D2C] transition shadow-sm border border-gray-200"><i className="ph-bold ph-x" /></button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex gap-6 mb-8">
            <img src={user.foto_perfil_url} className="w-24 h-24 rounded-2xl object-cover border-2 border-gray-100 shadow-sm" alt={user.nome} />
            <div>
              <h2 className="text-2xl font-extrabold text-[#1F2937]">{user.nome}</h2>
              <div className="flex gap-2 mt-2">
                <span className={`text-xs font-bold px-3 py-1 rounded-lg border ${user.role === 'CONTRATANTE' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-green-50 text-green-700 border-green-200'}`}>{user.role}</span>
                <span className="text-xs font-bold px-3 py-1 rounded-lg bg-gray-100 text-gray-600 border border-gray-200">ID: {user.id}</span>
              </div>
              <p className="text-xs text-gray-400 font-bold mt-2">Cadastrado: {new Date(user.data_criacao).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
              <h4 className="text-xs font-extrabold text-gray-400 uppercase mb-4">Contato</h4>
              <p className="font-bold text-[#1F2937] text-sm">{user.email}</p>
              <p className="font-bold text-[#1F2937] text-sm">{user.telefone}</p>
              <p className="font-bold text-[#1F2937] text-sm">CPF: {details?.cpf || '—'}</p>
            </div>
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
              <h4 className="text-xs font-extrabold text-gray-400 uppercase mb-4">Endereço</h4>
              <p className="font-bold text-[#1F2937]">{details?.rua}, {details?.numero}</p>
              <p className="text-sm text-gray-600">{details?.bairro} — {details?.uf}</p>
              <p className="text-sm text-gray-500">CEP: {details?.cep}</p>
            </div>
          </div>
          {user.role === 'TRABALHADOR' && (
            <div className="mb-8 bg-blue-50 p-5 rounded-2xl border border-blue-100">
              <h4 className="text-xs font-extrabold text-blue-800 uppercase mb-2">Perfil Profissional</h4>
              <p className="text-sm text-blue-900"><strong>Categoria:</strong> {details?.categorias?.join(', ')}</p>
              <p className="text-sm text-blue-900 mt-2"><strong>Bio:</strong> {details?.bio}</p>
            </div>
          )}
          <div>
            <h4 className="text-sm font-extrabold text-[#1F2937] uppercase mb-4 border-b border-gray-100 pb-2">Histórico de Atividade</h4>
            <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
              {userOrders.length === 0 ? <p className="text-sm text-gray-500 italic bg-gray-50 p-4 rounded-xl">Nenhuma atividade registrada.</p>
                : userOrders.map(o => {
                  const srv = services.find(s => s.id === o.servico_id);
                  const other = users.find(u => u.id === (user.role === 'CONTRATANTE' ? o.worker_id : o.contratante_id));
                  return (
                    <div key={o.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${o.status === 'CONCLUIDO' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{o.status}</span>
                        <p className="text-sm font-bold text-[#1F2937] mt-1">{srv?.titulo || 'Serviço'}</p>
                        <p className="text-xs text-gray-500">com {other?.nome}</p>
                      </div>
                      <div className="font-extrabold text-[#EA1D2C]">R$ {o.preco_final}</div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ---- AdminListLayout ----
function AdminListLayout({ title, usersList }) {
  const [selectedUser, setSelectedUser] = useState(null);
  return (
    <div className="pb-28 animate-fade-in w-full">
      <Header title={title} />
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="p-4 text-xs font-extrabold text-gray-400 uppercase">Usuário</th>
                  <th className="p-4 text-xs font-extrabold text-gray-400 uppercase hidden md:table-cell">Contato</th>
                  <th className="p-4 text-xs font-extrabold text-gray-400 uppercase hidden sm:table-cell">Entrada</th>
                  <th className="p-4 text-xs font-extrabold text-gray-400 uppercase text-right">Ação</th>
                </tr>
              </thead>
              <tbody>
                {usersList.length === 0 ? (
                  <tr><td colSpan="4" className="p-8 text-center text-gray-500 font-bold">Nenhum registro encontrado.</td></tr>
                ) : usersList.map(u => (
                  <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={u.foto_perfil_url} className="w-10 h-10 rounded-full object-cover" alt={u.nome} />
                        <div>
                          <div className="font-bold text-[#1F2937]">{u.nome}</div>
                          <div className="text-xs text-gray-500 md:hidden">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <div className="text-sm font-medium text-[#1F2937]">{u.email}</div>
                      <div className="text-xs text-gray-500">{u.telefone}</div>
                    </td>
                    <td className="p-4 hidden sm:table-cell text-sm font-medium text-gray-600">{new Date(u.data_criacao).toLocaleDateString('pt-BR')}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => setSelectedUser(u)} className="bg-gray-100 hover:bg-[#EA1D2C] hover:text-white text-gray-700 font-bold py-2 px-4 rounded-lg text-sm transition shadow-sm">Ver Dossiê</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {selectedUser && <AdminUserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
    </div>
  );
}

export function AdminClients() {
  const { users } = useAppStore();
  return <AdminListLayout title="Gerenciamento de Clientes" usersList={users.filter(u => u.role === 'CONTRATANTE')} />;
}

export function AdminWorkers() {
  const { users } = useAppStore();
  return <AdminListLayout title="Profissionais Aprovados" usersList={users.filter(u => u.role === 'TRABALHADOR' && u.status === 'APPROVED')} />;
}

export function AdminApprovals() {
  const { users, workerDetails, approveWorker, rejectWorker } = useAppStore();
  const pending = users.filter(u => u.role === 'TRABALHADOR' && u.status === 'PENDING');
  return (
    <div className="pb-28 animate-fade-in w-full">
      <Header title="Aprovações Pendentes" />
      <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto">
        {pending.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-xl mx-auto">
            <i className="ph-fill ph-check-circle text-6xl mb-4 text-green-500" />
            <h3 className="text-2xl font-extrabold text-[#1F2937] mb-2">Tudo em dia!</h3>
            <p className="font-medium text-gray-500">Nenhuma solicitação pendente.</p>
          </div>
        ) : pending.map(w => {
          const d = workerDetails.find(x => x.user_id === w.id);
          return (
            <div key={w.id} className="bg-white p-6 md:p-8 rounded-3xl shadow-md border border-gray-100 relative overflow-hidden flex flex-col md:flex-row gap-8 hover:shadow-lg transition">
              <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-extrabold px-4 py-1.5 rounded-bl-xl">REVISÃO NECESSÁRIA</div>
              <div className="shrink-0 flex flex-col items-center gap-3">
                <img src={w.foto_perfil_url} className="w-24 h-24 rounded-full border-4 border-gray-50 shadow-sm object-cover" alt={w.nome} />
                <span className="bg-red-50 text-[#EA1D2C] px-3 py-1 rounded-lg text-xs font-extrabold uppercase">{d?.categorias?.[0]}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-extrabold text-[#1F2937] mb-4">{w.nome}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <p className="text-[10px] font-extrabold text-gray-400 uppercase mb-1">Contato</p>
                    <p className="text-sm font-bold text-[#1F2937]">{w.email}</p>
                    <p className="text-sm font-bold text-[#1F2937] mt-1">{w.telefone}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <p className="text-[10px] font-extrabold text-gray-400 uppercase mb-1">Documento</p>
                    <p className="text-sm font-bold text-[#1F2937]">CPF: {d?.cpf}</p>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
                  <p className="text-[10px] font-extrabold text-blue-800 uppercase mb-2">Carta de Apresentação</p>
                  <p className="text-sm text-blue-900 italic">"{d?.bio}"</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button onClick={() => { if (window.confirm('Recusar e excluir este cadastro?')) rejectWorker(w.id); }} className="flex-1 bg-red-50 text-red-600 font-extrabold py-3.5 rounded-xl hover:bg-red-100 transition border border-red-200">Recusar</button>
                  <button onClick={() => { if (window.confirm('Aprovar este profissional?')) approveWorker(w.id); }} className="flex-1 bg-green-500 text-white font-extrabold py-3.5 rounded-xl shadow-lg shadow-green-500/30 hover:bg-green-600 transition transform hover:-translate-y-1">Aprovar e Liberar Acesso</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AdminSupport() {
  const { supportTickets, setSupportTickets, users } = useAppStore();
  const [replyMsg, setReplyMsg] = useState({});
  const [activeTicketId, setActiveTicketId] = useState(null);

  const handleReply = (ticketId) => {
    if (!replyMsg[ticketId]) return;
    const newMsg = { sender: 'ADMIN', text: replyMsg[ticketId], time: new Date().toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' }) };
    setSupportTickets(supportTickets.map(t => t.id === ticketId ? { ...t, messages: [...t.messages, newMsg] } : t));
    setReplyMsg({ ...replyMsg, [ticketId]: '' });
  };

  const openTickets = supportTickets.filter(t => t.status === 'OPEN');

  return (
    <div className="pb-28 animate-fade-in w-full max-w-5xl mx-auto">
      <Header title={activeTicketId ? 'Chat de Suporte' : 'Suporte Central'} showBack={!!activeTicketId} onBack={() => setActiveTicketId(null)} />
      <div className="px-4 md:px-8 space-y-6">
        {!activeTicketId ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {openTickets.map(t => {
                const u = users.find(x => x.id === t.user_id);
                const last = t.messages[t.messages.length - 1];
                return (
                  <div key={t.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition">
                    <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-4">
                      <img src={u?.foto_perfil_url} className="w-10 h-10 rounded-full object-cover" alt={u?.nome} />
                      <div>
                        <h4 className="font-extrabold text-[#1F2937]">{u?.nome}</h4>
                        <p className="text-[10px] text-gray-500 font-bold">{u?.email}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 font-extrabold uppercase mb-1">Última Mensagem</p>
                    <p className="text-sm text-gray-600 line-clamp-2 italic font-medium flex-1 mb-4">"{last?.text}"</p>
                    <button onClick={() => setActiveTicketId(t.id)} className="w-full bg-[#EA1D2C]/10 text-[#EA1D2C] font-extrabold py-3 rounded-xl hover:bg-[#EA1D2C] hover:text-white transition flex items-center justify-center gap-2">
                      <i className="ph-bold ph-chat-teardrop-text" /> Abrir Chat
                    </button>
                  </div>
                );
              })}
            </div>
            {openTickets.length === 0 && (
              <div className="text-center p-10 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <i className="ph-fill ph-check-circle text-5xl text-green-500 mb-2" />
                <h3 className="font-extrabold text-lg text-[#1F2937]">Nenhum ticket aberto</h3>
                <p className="text-gray-500 text-sm">Todos os usuários foram atendidos.</p>
              </div>
            )}
          </>
        ) : openTickets.filter(t => t.id === activeTicketId).map(t => {
          const u = users.find(x => x.id === t.user_id);
          return (
            <div key={t.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col animate-fade-in">
              <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <img src={u?.foto_perfil_url} className="w-10 h-10 rounded-full object-cover" alt={u?.nome} />
                  <div><h4 className="font-extrabold text-[#1F2937]">{u?.nome}</h4><p className="text-xs text-gray-500">{u?.email}</p></div>
                </div>
                <button onClick={() => { if (window.confirm('Encerrar ticket?')) { setSupportTickets(supportTickets.map(x => x.id === t.id ? { ...x, status: 'CLOSED' } : x)); setActiveTicketId(null); }}} className="bg-red-50 text-red-600 px-3 py-2 rounded-xl text-xs font-bold hover:bg-red-100 transition border border-red-100">
                  <i className="ph-bold ph-x-circle" /> Encerrar
                </button>
              </div>
              <div className="bg-gray-50 h-80 overflow-y-auto p-4 rounded-xl mb-4 space-y-3">
                {t.messages.map((msg, i) => (
                  <div key={i} className={`flex items-start gap-2 ${msg.sender === 'ADMIN' ? 'justify-end' : ''}`}>
                    <div className={`p-3 rounded-2xl text-sm shadow-sm ${msg.sender === 'ADMIN' ? 'bg-[#EA1D2C] text-white rounded-tr-none' : 'bg-white border border-gray-200 text-[#1F2937] rounded-tl-none'}`}>
                      <p className="whitespace-pre-wrap font-medium">{msg.text}</p>
                      <div className={`text-[10px] mt-1 text-right ${msg.sender === 'ADMIN' ? 'text-white/70' : 'text-gray-400'}`}>{msg.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="text" value={replyMsg[t.id] || ''} onChange={e => setReplyMsg({ ...replyMsg, [t.id]: e.target.value })} onKeyDown={e => e.key === 'Enter' && handleReply(t.id)} placeholder="Responder ao usuário..." className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#EA1D2C]" />
                <button onClick={() => handleReply(t.id)} className="px-6 rounded-xl bg-[#EA1D2C] text-white font-bold hover:bg-[#c41020] transition shadow-md flex items-center gap-2">
                  <i className="ph-bold ph-paper-plane-right" /> Responder
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AdminChats() {
  const { orders, users, services } = useAppStore();
  const activeChats = orders.filter(o => o.chat_history?.length > 0 && ['PENDENTE','ACEITO','EM_ANDAMENTO'].includes(o.status));
  return (
    <div className="pb-28 animate-fade-in w-full max-w-5xl mx-auto">
      <Header title="Monitoramento de Chats" />
      <div className="px-4 md:px-8 space-y-6">
        {activeChats.length === 0 ? (
          <div className="text-center p-10 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <i className="ph-fill ph-chats-teardrop text-5xl text-gray-300 mb-2" />
            <h3 className="font-extrabold text-lg text-[#1F2937]">Nenhum chat ativo</h3>
          </div>
        ) : activeChats.map(o => {
          const worker = users.find(u => u.id === o.worker_id);
          const client = users.find(u => u.id === o.contratante_id);
          const srv = services.find(s => s.id === o.servico_id);
          return (
            <div key={o.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                <div>
                  <h4 className="font-extrabold text-[#1F2937] text-lg">{srv?.titulo || 'Serviço Personalizado'}</h4>
                  <p className="text-sm font-bold text-gray-500">
                    Trabalhador: <span className="text-[#EA1D2C]">{worker?.nome}</span> | Cliente: <span className="text-[#EA1D2C]">{client?.nome}</span>
                  </p>
                </div>
                <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-lg text-xs font-bold border border-orange-100">{o.status}</span>
              </div>
              <div className="bg-gray-50 h-64 overflow-y-auto p-4 rounded-xl space-y-3">
                {o.chat_history.map((msg, i) => {
                  const isWorker = msg.sender === worker?.id;
                  const sender = isWorker ? worker : client;
                  return (
                    <div key={i} className={`flex items-start gap-2 ${isWorker ? 'justify-end' : ''}`}>
                      <div className={`p-3 rounded-2xl text-sm shadow-sm max-w-[80%] ${isWorker ? 'bg-[#EA1D2C] text-white rounded-tr-none' : 'bg-white border border-gray-200 text-[#1F2937] rounded-tl-none'}`}>
                        <p className={`text-[10px] font-extrabold mb-1 ${isWorker ? 'text-white/80' : 'text-[#EA1D2C]'}`}>{sender?.nome}</p>
                        {msg.image && <img src={msg.image} className="max-w-full rounded-xl mb-2 object-cover max-h-48" alt="anexo" />}
                        {msg.text && <p className="whitespace-pre-wrap font-medium">{msg.text}</p>}
                        <div className={`text-[10px] mt-1 text-right ${isWorker ? 'text-white/70' : 'text-gray-400'}`}>{msg.time}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
