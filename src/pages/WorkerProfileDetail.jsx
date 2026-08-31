// src/pages/WorkerProfileDetail.jsx — Perfil público do trabalhador com React Router
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore, getEstimatedDistance } from '../store';
import StarRating from '../components/ui/StarRating';
import ReviewModal from '../components/modals/ReviewModal';
import { createOrder, createReview } from '../services/ordersService';

export default function WorkerProfileDetail() {
  const { workerId } = useParams();
  const navigate = useNavigate();
  const {
    users,
    workerDetails,
    contratanteDetails,
    services,
    reviews,
    currentUser,
    showToast,
    orders
  } = useAppStore();

  const worker = users.find((u) => u.id === workerId);
  const details = workerDetails.find((d) => d.user_id === workerId || d.id === workerId);
  const workerServices = services.filter((s) => s.worker_id === workerId);
  const workerReviews = reviews.filter((r) => r.worker_id === workerId && !r.isWorkerReview);
  const [activeTab, setActiveTab] = useState('SOBRE');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const dynamicRating =
    workerReviews.length > 0
      ? (workerReviews.reduce((a, b) => a + b.nota, 0) / workerReviews.length).toFixed(1)
      : details?.nota_media || 0;

  const userFinishedOrders = currentUser
    ? orders.filter((o) => o.contratante_id === currentUser.id && o.worker_id === workerId && o.status === 'CONCLUIDO')
    : [];
  const canReview =
    userFinishedOrders.length > 0 &&
    workerReviews.filter((r) => r.user_id === currentUser?.id).length < userFinishedOrders.length;

  const myDetails = currentUser
    ? contratanteDetails.find((d) => d.user_id === currentUser.id) ||
      workerDetails.find((d) => d.user_id === currentUser.id)
    : null;
  const distance = getEstimatedDistance(myDetails, details);

  const horaInicio = details?.horaInicio || '08:00';
  const horaFim = details?.horaFim || '18:00';

  let isWithinHours = true;
  try {
    const agora = new Date();
    const horaAtual = agora.getHours() * 60 + agora.getMinutes();
    const [hI, mI] = horaInicio.split(':').map(Number);
    const inicioMinutos = hI * 60 + mI;
    const [hF, mF] = horaFim.split(':').map(Number);
    let fimMinutos = hF * 60 + mF;
    if (fimMinutos < inicioMinutos) fimMinutos += 24 * 60;
    let adjustedAtual = horaAtual;
    if (horaAtual < inicioMinutos && fimMinutos > 24 * 60) adjustedAtual += 24 * 60;

    if (adjustedAtual < inicioMinutos || adjustedAtual > fimMinutos) isWithinHours = false;
  } catch {
    isWithinHours = true;
  }

  const finalIsOnline = details?.isOnline && isWithinHours;
  const diasTrabalho = details?.diasTrabalho || details?.workingHours?.split(',')[0] || 'Seg-Sex';
  const workingHoursDisplay = `${diasTrabalho}, ${horaInicio} às ${horaFim}`;

  if (!worker || !details) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <i className="ph-fill ph-user-circle text-7xl text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-[#1F2937] mb-2">Profissional não encontrado</h2>
        <button onClick={() => navigate('/')} className="mt-4 bg-[#EA1D2C] text-white font-bold px-6 py-2.5 rounded-xl">
          Voltar ao Início
        </button>
      </div>
    );
  }

  const handleSolicitar = async (servicoId, descricaoMsg, agendamento) => {
    const srv = services.find((s) => s.id === servicoId);
    const activeOrds = orders.filter(
      (o) => o.contratante_id === currentUser.id && o.worker_id === workerId && ['PENDENTE', 'EM_ANDAMENTO'].includes(o.status)
    );
    if (activeOrds.length >= 3) {
      showToast('Você já possui solicitações ativas com este profissional.', 'error');
      return;
    }

    try {
      await createOrder(
        {
          contratante_id: currentUser.id,
          worker_id: workerId,
          servico_id: servicoId || null,
          status: 'PENDENTE',
          data: new Date().toLocaleDateString('pt-BR'),
          agendamento: agendamento,
          preco_final: srv ? srv.preco_base : 0
        },
        {
          sender: currentUser.id,
          text: `Olá! Gostaria de solicitar o serviço "${srv?.titulo || 'Personalizado'}".\n\n📅 Data sugerida: ${agendamento}\n\nDetalhes: ${descricaoMsg}`,
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        }
      );

      setIsRequestModalOpen(false);
      showToast('Solicitação enviada com sucesso! O profissional responderá no chat.');
      navigate('/mensagens');
    } catch {
      showToast('Erro ao enviar solicitação.', 'error');
    }
  };

  const openRequest = () => {
    if (!currentUser) {
      showToast('Por favor, faça login para continuar.', 'warning');
      navigate('/login');
      return;
    }
    if (currentUser.role === 'TRABALHADOR') {
      showToast('Apenas clientes podem solicitar serviços.', 'error');
      return;
    }
    if (!finalIsOnline) {
      showToast('Profissional indisponível no momento.', 'warning');
      return;
    }
    setIsRequestModalOpen(true);
  };

  const tabBtn = (id, label) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`pb-4 font-extrabold whitespace-nowrap border-b-4 transition ${
        activeTab === id ? 'border-[#EA1D2C] text-[#EA1D2C]' : 'border-transparent text-gray-400 hover:text-[#1F2937]'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="w-full bg-[#F9FAFB] pb-32 md:pb-12 animate-fade-in relative z-50">
      {/* Banner */}
      <div className="relative h-48 md:h-64 bg-[#1F2937] md:rounded-b-[3rem] overflow-hidden">
        <img
          src={details.portfolio_fotos?.[0] || worker.foto_perfil_url}
          className="w-full h-full object-cover opacity-40 mix-blend-overlay blur-sm scale-110"
          alt="banner"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 bg-white/20 backdrop-blur rounded-full p-3 text-white hover:bg-white/40 transition"
        >
          <i className="ph-bold ph-arrow-left text-xl" />
        </button>
      </div>

      <div className="px-4 md:px-8 relative -mt-20 md:-mt-24 max-w-5xl mx-auto">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100 flex flex-col md:flex-row gap-6 md:items-end">
          <img
            src={worker.foto_perfil_url}
            className="w-32 h-32 md:w-40 md:h-40 rounded-3xl object-cover border-4 border-white shadow-lg bg-white -mt-16 md:-mt-20 shrink-0"
            alt={worker.nome}
          />
          <div className="flex-1">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-[#1F2937]">{worker.nome}</h1>
                <p className="text-[#EA1D2C] font-extrabold text-sm tracking-widest uppercase mt-1">
                  {details.categorias?.join(', ')}
                </p>
              </div>
              <div
                className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border shadow-sm ${
                  finalIsOnline ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600 border-gray-200'
                }`}
              >
                <div className={`w-2.5 h-2.5 rounded-full ${finalIsOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                {finalIsOnline ? 'Disponível' : 'Indisponível'}
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <div className="flex flex-col">
                <div className="flex items-center gap-1 font-extrabold text-xl text-[#1F2937]">
                  <i className="ph-fill ph-star text-amber-400" /> {dynamicRating > 0 ? dynamicRating : 'Novo'}
                </div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  {workerReviews.length} avaliações
                </span>
              </div>
              <div className="w-px bg-gray-200" />
              <div className="flex flex-col">
                <div className="font-extrabold text-xl text-[#1F2937] flex items-center gap-1">
                  <i className="ph-fill ph-wrench text-gray-400" /> {workerServices.length}
                </div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Serviços</span>
              </div>
              <div className="w-px bg-gray-200 hidden md:block" />
              <div className="flex flex-col w-full md:w-auto">
                <div className="font-extrabold text-base text-[#1F2937] flex items-center gap-1">
                  <i className="ph-fill ph-clock text-[#EA1D2C]" /> {workingHoursDisplay}
                </div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Horários</span>
              </div>
              {distance && (
                <>
                  <div className="w-px bg-gray-200 hidden md:block" />
                  <div className="flex flex-col w-full md:w-auto">
                    <div className="font-extrabold text-base text-[#1F2937] flex items-center gap-1">
                      <i className="ph-fill ph-map-pin text-[#EA1D2C]" /> ~{distance} km
                    </div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Distância Estimada</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-200 mt-8 overflow-x-auto hide-scrollbar">
          {tabBtn('SOBRE', 'Serviços & Portfólio')}
          {tabBtn('AVALIACOES', `Avaliações (${workerReviews.length})`)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2 space-y-8">
            {activeTab === 'SOBRE' && (
              <>
                <section>
                  <h2 className="text-xl font-extrabold text-[#1F2937] mb-4 flex items-center gap-2">
                    <i className="ph-fill ph-user-circle text-[#EA1D2C]" /> Sobre o profissional
                  </h2>
                  <p className="text-gray-600 text-base leading-relaxed bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    {details.bio}
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-extrabold text-[#1F2937] mb-4 flex items-center gap-2">
                    <i className="ph-fill ph-list-checks text-[#EA1D2C]" /> Serviços Oferecidos
                  </h2>
                  <div className="space-y-4">
                    {workerServices.length === 0 ? (
                      <p className="text-sm text-gray-500 italic bg-white p-6 rounded-3xl border border-gray-100">
                        Nenhum serviço específico cadastrado. Entre em contato para um orçamento personalizado.
                      </p>
                    ) : (
                      workerServices.map((srv) => (
                        <div
                          key={srv.id}
                          className="bg-white border border-gray-100 p-4 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm hover:shadow-md transition"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-gray-100">
                              <img
                                src={srv.imagem_url || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=200&q=80'}
                                className="w-full h-full object-cover"
                                alt={srv.titulo}
                              />
                            </div>
                            <div>
                              <h4 className="font-extrabold text-[#1F2937] text-lg">{srv.titulo}</h4>
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{srv.descricao}</p>
                            </div>
                          </div>
                          <div className="text-left md:text-right bg-gray-50 px-4 py-2 rounded-xl w-full md:w-auto border border-gray-100 shrink-0">
                            <div className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-0.5">A partir de</div>
                            <div className="font-extrabold text-[#EA1D2C] text-xl">R$ {srv.preco_base}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>

                {details.portfolio_fotos?.length > 0 && (
                  <section>
                    <h2 className="text-xl font-extrabold text-[#1F2937] mb-4 flex items-center gap-2">
                      <i className="ph-fill ph-image text-[#EA1D2C]" /> Portfólio
                    </h2>
                    <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
                      {details.portfolio_fotos.map((foto, i) => (
                        <img
                          key={i}
                          src={foto}
                          className="w-48 h-40 rounded-2xl object-cover shrink-0 shadow-sm border border-gray-100"
                          alt={`portfolio ${i + 1}`}
                        />
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}

            {activeTab === 'AVALIACOES' && (
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-extrabold text-[#1F2937] flex items-center gap-2">
                    <i className="ph-fill ph-star text-amber-400" /> Avaliações dos Clientes
                  </h2>
                  {canReview && (
                    <button
                      onClick={() => setIsReviewModalOpen(true)}
                      className="bg-[#EA1D2C] hover:bg-[#c41020] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md transition"
                    >
                      Deixar Avaliação
                    </button>
                  )}
                </div>
                {workerReviews.length === 0 ? (
                  <p className="text-gray-500 italic p-6 bg-gray-50 rounded-2xl text-center">Nenhuma avaliação ainda.</p>
                ) : (
                  <div className="space-y-4">
                    {workerReviews.map((r) => {
                      const u = users.find((x) => x.id === r.user_id);
                      return (
                        <div key={r.id} className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                          <div className="flex justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={u?.foto_perfil_url || 'https://ui-avatars.com/api/?name=User&background=ea1d2c&color=fff'}
                                className="w-10 h-10 rounded-full object-cover"
                                alt={u?.nome}
                              />
                              <div>
                                <div className="font-extrabold text-[#1F2937] text-sm">{u?.nome}</div>
                                <div className="text-[10px] text-gray-500 font-bold">{r.data}</div>
                              </div>
                            </div>
                            <StarRating rating={r.nota} />
                          </div>
                          <p className="text-gray-600 text-sm">{r.comentario}</p>
                          {r.fotos?.length > 0 && (
                            <div className="flex gap-2 mt-3">
                              {r.fotos.map((f, i) => (
                                <img key={i} src={f} className="w-16 h-16 rounded-xl object-cover border border-gray-200" alt="foto" />
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden lg:block space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl sticky top-28">
              <h3 className="font-extrabold text-[#1F2937] text-lg mb-4">Gostou do perfil?</h3>
              <button
                onClick={openRequest}
                disabled={!finalIsOnline}
                className={`w-full font-extrabold py-4 rounded-2xl flex items-center justify-center gap-2 transition transform mb-3 ${
                  finalIsOnline
                    ? 'bg-[#EA1D2C] text-white shadow-lg shadow-red-500/30 hover:bg-[#c41020] hover:-translate-y-1'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {finalIsOnline ? 'Chamar Profissional' : 'Fora de Horário'}
              </button>
              <a
                href={`https://wa.me/55${worker.telefone?.replace(/\D/g, '')}?text=Olá ${worker.nome}, encontrei seu perfil no MãoAobra e gostaria de solicitar um serviço.`}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-green-50 border border-green-200 text-green-700 font-extrabold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-green-100 transition"
              >
                <i className="ph-fill ph-whatsapp-logo text-2xl" /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile CTA */}
      <div className="lg:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 p-4 pb-6 flex gap-3 z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
        <a
          href={`https://wa.me/55${worker.telefone?.replace(/\D/g, '')}`}
          target="_blank"
          rel="noreferrer"
          className="bg-green-500 text-white rounded-2xl p-4 flex items-center justify-center shadow-lg shadow-green-500/30"
        >
          <i className="ph-fill ph-whatsapp-logo text-2xl" />
        </a>
        <button
          onClick={openRequest}
          disabled={!finalIsOnline}
          className={`flex-1 font-extrabold rounded-2xl flex items-center justify-center gap-2 py-4 ${
            finalIsOnline ? 'bg-[#EA1D2C] text-white shadow-lg shadow-red-500/30' : 'bg-gray-200 text-gray-400'
          }`}
        >
          {finalIsOnline ? 'Chamar Profissional' : 'Indisponível'}
        </button>
      </div>

      {/* Modals */}
      {isRequestModalOpen && (
        <RequestModal
          workerServices={workerServices}
          onClose={() => setIsRequestModalOpen(false)}
          onSubmit={handleSolicitar}
          showToast={showToast}
        />
      )}
      {isReviewModalOpen && (
        <ReviewModal
          onSubmit={async (nota, comentario) => {
            try {
              await createReview({
                worker_id: workerId,
                user_id: currentUser.id,
                nota,
                comentario,
                fotos: [],
                data: new Date().toLocaleDateString('pt-BR'),
                isWorkerReview: false
              });
              setIsReviewModalOpen(false);
              showToast('Avaliação enviada com sucesso!');
            } catch {
              showToast('Erro ao enviar avaliação.', 'error');
            }
          }}
          onClose={() => setIsReviewModalOpen(false)}
          isWorkerReview={false}
        />
      )}
    </div>
  );
}

function RequestModal({ workerServices, onClose, onSubmit, showToast }) {
  const [desc, setDesc] = useState('');
  const [selectedSrvId, setSelectedSrvId] = useState('');
  const [dataAgendamento, setDataAgendamento] = useState('');
  const [horaAgendamento, setHoraAgendamento] = useState('');

  return createPortal(
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white max-w-md w-full rounded-3xl p-6 md:p-8 shadow-2xl relative animate-slide-down border border-gray-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full flex items-center justify-center transition border border-gray-200"
        >
          <i className="ph-bold ph-x text-xl" />
        </button>
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-500 shadow-sm border border-blue-100">
            <i className="ph-fill ph-calendar-plus text-3xl" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#1F2937]">Agendar Serviço</h2>
          <p className="text-gray-500 text-sm mt-2 font-bold">Defina os detalhes e data do serviço</p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-bold text-gray-700 mb-2">Qual serviço deseja?</label>
          <select
            value={selectedSrvId}
            onChange={(e) => setSelectedSrvId(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#EA1D2C] outline-none bg-gray-50 appearance-none"
          >
            <option value="">Serviço Personalizado (A Combinar)</option>
            {workerServices.map((s) => (
              <option key={s.id} value={s.id}>
                {s.titulo} — A partir de R$ {s.preco_base}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Data</label>
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={dataAgendamento}
              onChange={(e) => setDataAgendamento(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#EA1D2C] outline-none bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Horário</label>
            <input
              type="time"
              value={horaAgendamento}
              onChange={(e) => setHoraAgendamento(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#EA1D2C] outline-none bg-gray-50"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">Descreva o problema/detalhes:</label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            maxLength={500}
            placeholder="Ex: A torneira da pia da cozinha está vazando muito..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#EA1D2C] outline-none bg-gray-50 resize-none h-24"
          />
          <p className="text-xs text-gray-400 text-right mt-1">{desc.length}/500</p>
        </div>

        <button
          onClick={() => {
            if (!dataAgendamento || !horaAgendamento) {
              showToast('Por favor, selecione data e horário.', 'error');
              return;
            }
            if (desc.trim().length >= 10) {
              const dataStr = `${dataAgendamento.split('-').reverse().join('/')} às ${horaAgendamento}`;
              onSubmit(selectedSrvId || null, desc, dataStr);
            } else {
              showToast('Por favor, explique com mais detalhes (mínimo 10 caracteres).', 'warning');
            }
          }}
          className="w-full bg-[#EA1D2C] hover:bg-[#c41020] text-white font-extrabold py-4 rounded-xl shadow-lg shadow-red-500/30 transition transform hover:-translate-y-1 flex items-center justify-center gap-2"
        >
          <i className="ph-bold ph-paper-plane-right text-lg" /> Enviar Solicitação
        </button>
      </div>
    </div>,
    document.body
  );
}
