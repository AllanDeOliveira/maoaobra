// src/components/modals/OrderChatModal.jsx
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAppStore } from '../../store';
import ImageUploader from '../ui/ImageUploader';

export default function OrderChatModal({ order, onClose }) {
  if (!order) return null;
  const { users, currentUser, setOrders, orders, services, showToast, setSelectedWorkerId, setSelectedClientId, reviews, setReviews } = useAppStore();
  const [message, setMessage] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showBudgetInput, setShowBudgetInput] = useState(false);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [actionModal, setActionModal] = useState(null); // 'CANCEL' | 'FINISH'
  const [finishPrice, setFinishPrice] = useState('');
  const [clientRating, setClientRating] = useState(5);
  const [clientComment, setClientComment] = useState('');
  const chatRef = useRef(null);

  const client = users.find(u => u.id === order.contratante_id);
  const worker = users.find(u => u.id === order.worker_id);
  const srv = services.find(s => s.id === order.servico_id);
  const otherUser = currentUser.role === 'CONTRATANTE' ? worker : client;

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [order.chat_history]);

  const updateOrderStatus = (status) => {
    setOrders(orders.map(o => o.id === order.id ? { ...o, status } : o));
    showToast(status === 'RECUSADO' ? 'Pedido recusado.' : status === 'EM_ANDAMENTO' ? 'Serviço aceito! Mãos à obra!' : 'Serviço finalizado!');
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (showBudgetInput && budgetAmount) {
      const budgetVal = Number(budgetAmount);
      if (budgetVal > 0) {
        const newMsg = {
          sender: currentUser.id,
          text: `💰 *ORÇAMENTO OFICIAL*\nValor Proposto: R$ ${budgetVal.toFixed(2)}\n\n(Cliente: Responda no chat se concorda para eu aceitar o pedido com este valor).`,
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          isBudget: true,
          amount: budgetVal
        };
        setOrders(orders.map(o => o.id === order.id ? { ...o, preco_final: budgetVal, chat_history: [...(o.chat_history || []), newMsg] } : o));
        setShowBudgetInput(false);
        setBudgetAmount('');
        return;
      }
    }

    if (!message.trim() && !imageUrl) return;
    const newMsg = {
      sender: currentUser.id,
      text: message,
      image: imageUrl || null,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
    setOrders(orders.map(o => o.id === order.id ? { ...o, chat_history: [...(o.chat_history || []), newMsg] } : o));
    setMessage('');
    setImageUrl('');
  };

  const handleFinish = (e) => {
    e.preventDefault();
    if (!finishPrice || Number(finishPrice) <= 0) {
      showToast('Insira um valor final válido!', 'warning');
      return;
    }
    const finalVal = Number(finishPrice);
    setOrders(orders.map(o => o.id === order.id ? { ...o, status: 'CONCLUIDO', preco_final: finalVal } : o));
    
    // Save client rating
    if (clientComment) {
      setReviews([...reviews, {
        id: 'r' + Date.now(),
        order_id: order.id,
        worker_id: currentUser.id, // the rater
        user_id: order.contratante_id, // the target
        nota: clientRating,
        comentario: clientComment,
        isWorkerReview: true, // indicates this review is ABOUT the client
        data: new Date().toISOString()
      }]);
    }

    showToast('Trabalho finalizado com sucesso!');
    setActionModal(null);
  };

  const isReadOnly = ['RECUSADO', 'CONCLUIDO', 'CANCELADO'].includes(order.status);

  return createPortal(
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white max-w-4xl w-full rounded-3xl shadow-2xl relative overflow-hidden animate-slide-down flex flex-col h-[85vh]">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 p-4 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => { onClose(); if (currentUser.role === 'CONTRATANTE') setSelectedWorkerId(otherUser?.id); else setSelectedClientId(otherUser?.id); }}>
            <img src={otherUser?.foto_perfil_url} className="w-12 h-12 rounded-full border-2 border-[#EA1D2C] object-cover group-hover:scale-105 transition" alt={otherUser?.nome} />
            <div>
              <h3 className="font-extrabold text-[#1F2937] group-hover:text-[#EA1D2C] transition">{otherUser?.nome}</h3>
              <p className="text-xs text-[#EA1D2C] font-bold">{srv?.titulo || 'Serviço Personalizado'}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-gray-50 hover:bg-red-50 hover:text-red-600 rounded-full flex items-center justify-center text-[#1F2937] transition">
            <i className="ph-bold ph-x text-xl" />
          </button>
        </div>

        {/* Status Bar */}
        <div className="bg-orange-50 p-3 border-b border-orange-100 flex flex-col md:flex-row md:items-center justify-between text-sm gap-2">
          <div className="flex flex-wrap items-center gap-4">
            <div><span className="font-extrabold text-orange-800">Status:</span> <span className="font-bold text-orange-600">{order.status === 'EM_ANDAMENTO' ? 'Em Andamento' : order.status}</span></div>
            <div className="flex items-center gap-1 font-bold text-gray-500"><i className="ph-bold ph-calendar-blank" /> {order.agendamento || 'A combinar'}</div>
          </div>
          <div className="font-extrabold text-[#EA1D2C]">R$ {order.preco_final}</div>
        </div>

        {/* Chat Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50" ref={chatRef}>
          {(order.chat_history || []).map((msg, i) => {
            const isMe = msg.sender === currentUser.id;
            return (
              <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-3 ${msg.isBudget ? 'bg-yellow-100 border-2 border-yellow-400 text-yellow-900 shadow-lg' : isMe ? 'bg-[#EA1D2C] text-white rounded-tr-none' : 'bg-white border border-gray-200 text-[#1F2937] rounded-tl-none shadow-sm'}`}>
                  {msg.image && <img src={msg.image} className="max-w-full rounded-xl mb-2 object-cover max-h-64 border border-white/20" alt="anexo" />}
                  {msg.text && <p className="text-sm font-medium whitespace-pre-wrap">{msg.text}</p>}
                  {msg.isBudget && currentUser.role === 'CONTRATANTE' && order.status === 'PENDENTE' && (
                    <button onClick={() => updateOrderStatus('EM_ANDAMENTO')} className="mt-3 w-full bg-green-500 text-white font-extrabold py-2 rounded-xl shadow-md hover:bg-green-600 transition">Aprovar Orçamento</button>
                  )}
                  <div className={`text-[10px] mt-1 text-right ${msg.isBudget ? 'text-yellow-700' : isMe ? 'text-white/70' : 'text-gray-400'}`}>{msg.time}</div>
                </div>
              </div>
            );
          })}
          {(order.chat_history || []).length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 py-10">
              <i className="ph-fill ph-chat-circle-dots text-6xl mb-2 text-gray-200" />
              <p className="font-bold">Nenhuma mensagem ainda.</p>
              <p className="text-sm">Envie uma mensagem para começar!</p>
            </div>
          )}
        </div>

        {/* Worker Actions */}
        {currentUser.role === 'TRABALHADOR' && order.status === 'PENDENTE' && (
          <div className="p-4 bg-white border-t border-gray-100 flex gap-3">
            <button onClick={() => updateOrderStatus('RECUSADO')} className="flex-1 py-3 bg-red-50 text-red-600 font-extrabold rounded-xl hover:bg-red-100 transition border border-red-100">Recusar</button>
            <button onClick={() => updateOrderStatus('EM_ANDAMENTO')} className="flex-1 py-3 bg-green-500 text-white font-extrabold rounded-xl hover:bg-green-600 shadow-lg shadow-green-500/30 transition transform hover:-translate-y-1">Aceitar Serviço</button>
          </div>
        )}
        {currentUser.role === 'TRABALHADOR' && order.status === 'EM_ANDAMENTO' && (
          <div className="p-4 bg-white border-t border-gray-100 flex gap-3 relative">
            <button onClick={() => setActionModal('CANCEL')} className="flex-1 py-4 bg-red-50 text-red-600 font-extrabold rounded-xl hover:bg-red-100 transition border border-red-100 shadow-sm">Cancelar Serviço</button>
            <button onClick={() => { setFinishPrice(order.preco_final || ''); setActionModal('FINISH'); }} className="flex-[2] py-4 bg-[#1F2937] text-white font-extrabold rounded-xl shadow-xl flex justify-center items-center gap-2 hover:bg-black transition transform hover:-translate-y-1">
              <i className="ph-fill ph-check-circle text-xl" /> Finalizar Trabalho
            </button>
          </div>
        )}

        {/* Message Input */}
        {!isReadOnly && (
          <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex flex-col gap-3">
            {imageUrl && (
              <div className="relative inline-block self-start">
                <img src={imageUrl} className="h-20 rounded-xl border border-gray-200 object-cover shadow-sm" alt="preview" />
                <button type="button" onClick={() => setImageUrl('')} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-md border-2 border-white">
                  <i className="ph-bold ph-x" />
                </button>
              </div>
            )}
            <div className="flex gap-2">
              <ImageUploader 
                 pathFolder={`chats/${order.id}`}
                 onUploadSuccess={(url) => setImageUrl(url)}
                 onError={(err) => showToast(err, 'error')}
              />
              {showBudgetInput ? (
                <div className="flex-1 flex gap-2">
                  <span className="flex items-center justify-center bg-gray-100 px-3 rounded-xl font-bold text-gray-500">R$</span>
                  <input type="number" value={budgetAmount} onChange={e => setBudgetAmount(e.target.value)} placeholder="0.00" className="flex-1 bg-yellow-50 rounded-xl px-4 py-3 border border-yellow-300 outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 font-extrabold text-yellow-800 transition" />
                  <button type="button" onClick={() => setShowBudgetInput(false)} className="px-3 bg-gray-100 rounded-xl text-gray-500 hover:bg-gray-200 font-bold"><i className="ph-bold ph-x" /></button>
                </div>
              ) : (
                <input type="text" value={message} onChange={e => setMessage(e.target.value)} placeholder="Digite sua mensagem..." className="flex-1 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 outline-none focus:border-[#EA1D2C] focus:ring-1 focus:ring-[#EA1D2C] focus:bg-white transition" />
              )}

              {currentUser.role === 'TRABALHADOR' && !showBudgetInput && order.status === 'PENDENTE' && (
                <button type="button" onClick={() => setShowBudgetInput(true)} className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center text-yellow-600 shadow-sm border border-yellow-200 hover:bg-yellow-200 transition shrink-0" title="Enviar Orçamento Formal">
                  <i className="ph-bold ph-currency-dollar text-xl" />
                </button>
              )}

              <button type="submit" className={`w-12 h-12 rounded-xl ${showBudgetInput ? 'bg-green-500 hover:bg-green-600 shadow-green-500/30' : 'bg-[#EA1D2C] hover:bg-[#c41020] shadow-red-500/30'} flex items-center justify-center text-white shadow-lg transition shrink-0`}>
                <i className="ph-bold ph-paper-plane-right text-xl" />
              </button>
            </div>
          </form>
        )}
        {order.status === 'CONCLUIDO' && currentUser.role === 'CONTRATANTE' && (
          <div className="p-4 bg-white border-t border-gray-100 text-center">
            <p className="text-sm font-bold text-green-600 mb-1">✅ Trabalho Concluído!</p>
            <p className="text-xs text-gray-500">Vá ao perfil do profissional para deixar uma avaliação.</p>
          </div>
        )}

        {/* Action Modals (Worker Overlay) */}
        {actionModal && (
          <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col justify-end animate-fade-in p-6">
            <div className="bg-white rounded-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-6 border border-gray-100 animate-slide-down relative">
              <button onClick={() => setActionModal(null)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-gray-50 text-gray-500 hover:bg-gray-200 rounded-full"><i className="ph-bold ph-x" /></button>
              
              {actionModal === 'CANCEL' ? (
                <div className="text-center py-4">
                  <i className="ph-fill ph-warning-circle text-6xl text-red-500 mb-4" />
                  <h3 className="text-xl font-extrabold text-[#1F2937] mb-2">Cancelar Serviço?</h3>
                  <p className="text-sm text-gray-500 mb-6">Esta ação não pode ser desfeita. O cliente será notificado.</p>
                  <button onClick={() => { updateOrderStatus('CANCELADO'); setActionModal(null); }} className="w-full py-4 bg-red-500 text-white font-extrabold rounded-xl hover:bg-red-600 shadow-lg shadow-red-500/30 transition">Sim, Cancelar Pedido</button>
                </div>
              ) : (
                <form onSubmit={handleFinish} className="flex flex-col gap-5">
                  <h3 className="text-xl font-extrabold text-[#1F2937] flex items-center gap-2"><i className="ph-fill ph-check-circle text-green-500" /> Finalizar Trabalho</h3>
                  
                  <div>
                    <label className="block text-sm font-extrabold text-gray-700 mb-2">Valor Final Cobrado (Obrigatório)</label>
                    <div className="flex items-center gap-2">
                      <span className="bg-gray-100 px-4 py-3 rounded-xl font-bold text-gray-500">R$</span>
                      <input type="number" required value={finishPrice} onChange={e => setFinishPrice(e.target.value)} placeholder="0.00" className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#EA1D2C] focus:ring-1 focus:ring-[#EA1D2C] font-extrabold text-[#1F2937]" />
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-5">
                    <label className="block text-sm font-extrabold text-gray-700 mb-2">Avalie o Cliente de forma privada</label>
                    <p className="text-[11px] text-gray-500 mb-3 leading-tight">Sua nota ajudará outros profissionais a saberem com quem estão lidando. O cliente não verá isso.</p>
                    <div className="flex justify-center gap-3 mb-4">
                      {[1,2,3,4,5].map(i => (
                        <i key={i} onClick={() => setClientRating(i)} className={`${i <= clientRating ? 'ph-fill text-amber-400 scale-110' : 'ph text-gray-300'} ph-star text-3xl cursor-pointer hover:scale-110 transition-transform`} />
                      ))}
                    </div>
                    <textarea value={clientComment} onChange={e => setClientComment(e.target.value)} placeholder="Deixe um comentário sobre o cliente (opcional)" rows="2" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#EA1D2C] focus:ring-1 focus:ring-[#EA1D2C] text-sm resize-none" />
                  </div>

                  <button type="submit" className="w-full py-4 bg-[#1F2937] text-white font-extrabold rounded-xl shadow-xl hover:bg-black transition">Concluir e Salvar</button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
