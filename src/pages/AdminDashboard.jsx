// src/pages/AdminDashboard.jsx
import { useAppStore } from '../store';

export default function AdminDashboard() {
  const { users, orders, logout, setCurrentView } = useAppStore();
  const totalClients   = users.filter(u => u.role === 'CONTRATANTE').length;
  const totalWorkers   = users.filter(u => u.role === 'TRABALHADOR' && u.status === 'APPROVED').length;
  const pendingWorkers = users.filter(u => u.role === 'TRABALHADOR' && u.status === 'PENDING').length;
  const doneOrders     = orders.filter(o => o.status === 'CONCLUIDO').length;

  return (
    <div className="pb-28 animate-fade-in w-full">
      <div className="bg-[#1F2937] pt-12 pb-8 px-5 md:px-8 shadow-md md:rounded-b-[2rem]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-1">Painel de Controle</p>
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
              <i className="ph-fill ph-shield-check text-[#EA1D2C]" />
              <span>mão<span className="text-[#EA1D2C]">A</span>obra Admin</span>
            </h1>
          </div>
          <button onClick={logout} className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-xl border border-white/10 flex items-center gap-2 transition">
            <i className="ph-bold ph-sign-out" /> Sair
          </button>
        </div>
      </div>
      <div className="p-4 md:p-8 mt-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon:'ph-fill ph-users text-blue-500', bg:'bg-blue-50', val:totalClients, label:'Clientes', view:'ADMIN_CLIENTS' },
            { icon:'ph-fill ph-briefcase text-green-500', bg:'bg-green-50', val:totalWorkers, label:'Profissionais', view:'ADMIN_WORKERS' },
            { icon:'ph-fill ph-clock-countdown text-orange-500', bg:'bg-orange-100', val:pendingWorkers, label:'Pendentes', view:'ADMIN_APPROVALS', accent:'text-orange-600' },
            { icon:'ph-fill ph-check-circle text-green-500', bg:'bg-green-50', val:doneOrders, label:'Concluídos' },
          ].map(s => (
            <div key={s.label} onClick={() => s.view && setCurrentView(s.view)} className={`bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center ${s.view ? 'cursor-pointer hover:shadow-lg hover:border-red-200' : ''} transition`}>
              <div className={`w-12 h-12 ${s.bg} rounded-2xl flex items-center justify-center mb-3`}><i className={`${s.icon} text-3xl`} /></div>
              <span className={`text-3xl font-extrabold ${s.accent||'text-[#1F2937]'} mb-1`}>{s.val}</span>
              <span className="text-xs text-gray-500 font-bold uppercase tracking-wide text-center">{s.label}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { view:'ADMIN_SUPPORT', icon:'ph-fill ph-headset text-[#EA1D2C]', label:'Central de Suporte', desc:'Atenda tickets dos usuários' },
            { view:'ADMIN_CHATS', icon:'ph-fill ph-chats text-blue-500', label:'Monitorar Chats', desc:'Visualize conversas em andamento' },
          ].map(item => (
            <div key={item.view} onClick={() => setCurrentView(item.view)} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-red-200 transition cursor-pointer flex items-center gap-4">
              <i className={`${item.icon} text-4xl shrink-0`} />
              <div><h3 className="font-extrabold text-[#1F2937]">{item.label}</h3><p className="text-sm text-gray-500">{item.desc}</p></div>
              <i className="ph-bold ph-arrow-right ml-auto text-gray-400" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
