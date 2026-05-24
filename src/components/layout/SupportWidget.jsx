// src/components/layout/SupportWidget.jsx
import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../store';

export default function SupportWidget() {
  const { currentUser, currentView, supportTickets, setSupportTickets, showToast } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const chatRef = useRef(null);

  const myTicket = currentUser ? supportTickets.find(t => t.user_id === currentUser.id && t.status === 'OPEN') : null;

  useEffect(() => {
    if (isOpen && chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [isOpen, myTicket?.messages]);

  const adminViews = ['ADMIN_DASH','ADMIN_CLIENTS','ADMIN_WORKERS','ADMIN_APPROVALS','ADMIN_SUPPORT','ADMIN_CHATS'];
  if (adminViews.includes(currentView)) return null;

  const handleSend = () => {
    if (!message.trim()) return;
    if (!currentUser) { showToast('Faça login para usar o suporte.', 'warning'); return; }
    const newMsg = { sender: 'USER', text: message, time: new Date().toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' }) };
    if (myTicket) {
      setSupportTickets(supportTickets.map(t => t.id === myTicket.id ? { ...t, messages: [...t.messages, newMsg] } : t));
    } else {
      setSupportTickets([...supportTickets, { id: 't' + Date.now(), user_id: currentUser.id, status: 'OPEN', messages: [newMsg] }]);
    }
    setMessage('');
  };

  return (
    <div className="fixed bottom-28 md:bottom-6 right-3 md:right-6 z-[9999]">
      {isOpen ? (
        <div className="bg-white w-80 rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-slide-down h-96">
          <div className="bg-[#EA1D2C] p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <i className="ph-fill ph-headset text-2xl" />
              <h4 className="font-extrabold text-sm">Suporte mãoAobra</h4>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition">
              <i className="ph-bold ph-x text-lg" />
            </button>
          </div>
          <div className="flex-1 bg-gray-50 p-4 overflow-y-auto flex flex-col gap-3" ref={chatRef}>
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-[#EA1D2C] flex items-center justify-center text-white shrink-0">
                <i className="ph-bold ph-robot text-sm" />
              </div>
              <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-none text-sm text-[#1F2937] shadow-sm">
                Olá{currentUser ? `, ${currentUser.nome.split(' ')[0]}` : ''}! Como podemos te ajudar hoje?
              </div>
            </div>
            {myTicket?.messages.map((msg, i) => (
              <div key={i} className={`flex items-start gap-2 ${msg.sender === 'USER' ? 'justify-end' : ''}`}>
                {msg.sender === 'ADMIN' && (
                  <div className="w-8 h-8 rounded-full bg-[#EA1D2C] flex items-center justify-center text-white shrink-0">
                    <i className="ph-bold ph-robot text-sm" />
                  </div>
                )}
                <div className={`p-3 rounded-2xl text-sm shadow-sm ${msg.sender === 'USER' ? 'bg-[#EA1D2C] text-white rounded-tr-none' : 'bg-white border border-gray-200 text-[#1F2937] rounded-tl-none'}`}>
                  {msg.text}
                  <div className={`text-[10px] mt-1 text-right ${msg.sender === 'USER' ? 'text-white/70' : 'text-gray-400'}`}>{msg.time}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-gray-100 bg-white flex gap-2">
            <input
              type="text"
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Digite sua dúvida..."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#EA1D2C]"
            />
            <button onClick={handleSend} className="w-10 h-10 rounded-xl bg-[#EA1D2C] text-white flex items-center justify-center hover:bg-[#c41020] transition shrink-0">
              <i className="ph-bold ph-paper-plane-right" />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="w-12 h-12 md:w-14 md:h-14 bg-[#EA1D2C] text-white rounded-full flex items-center justify-center shadow-lg shadow-red-500/40 hover:scale-110 transition-transform hover:bg-[#c41020] border-2 border-white relative"
        >
          <i className="ph-fill ph-chat-teardrop-dots text-2xl md:text-3xl" />
          {myTicket?.messages.some(m => m.sender === 'ADMIN') && (
            <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          )}
        </button>
      )}
    </div>
  );
}
