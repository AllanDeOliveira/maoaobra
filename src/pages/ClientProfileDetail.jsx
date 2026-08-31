// src/pages/ClientProfileDetail.jsx — Perfil público do cliente para os profissionais
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import Header from '../components/ui/Header';
import ReviewModal from '../components/modals/ReviewModal';
import StarRating from '../components/ui/StarRating';
import { createReview } from '../services/ordersService';

export default function ClientProfileDetail() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { users, contratanteDetails, reviews, orders, currentUser, showToast } = useAppStore();

  const client = users.find((u) => u.id === clientId);
  const details = contratanteDetails.find((d) => d.user_id === clientId || d.id === clientId);
  const [showReviewModal, setShowReviewModal] = useState(false);

  if (!client) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <i className="ph-fill ph-user text-7xl text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-[#1F2937] mb-2">Cliente não encontrado</h2>
        <button onClick={() => navigate(-1)} className="mt-4 bg-[#EA1D2C] text-white font-bold px-6 py-2.5 rounded-xl">
          Voltar
        </button>
      </div>
    );
  }

  const clientReviews = reviews.filter((r) => r.user_id === clientId && r.isWorkerReview === true);
  const notaMedia =
    clientReviews.length > 0
      ? (clientReviews.reduce((a, b) => a + b.nota, 0) / clientReviews.length).toFixed(1)
      : 0;

  const myFinishedOrders = currentUser
    ? orders.filter((o) => o.worker_id === currentUser.id && o.contratante_id === clientId && o.status === 'CONCLUIDO')
    : [];
  const canReview =
    myFinishedOrders.length > 0 &&
    clientReviews.filter((r) => r.worker_id === currentUser.id).length < myFinishedOrders.length;

  return (
    <div className="pb-28 animate-fade-in w-full">
      <Header title="Perfil do Cliente" showBack onBack={() => navigate(-1)} />
      <div className="max-w-4xl mx-auto px-4 md:px-0">
        <div className="mb-6 relative rounded-3xl shadow-sm border border-gray-100 overflow-hidden bg-white">
          <div className="h-32 bg-[#1F2937] relative">
            <img
              src={details?.banner_url || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=60'}
              className="w-full h-full object-cover opacity-50"
              alt="banner"
            />
          </div>
          <div className="p-8 flex flex-col md:flex-row items-center md:items-end gap-6 relative">
            <div className="relative shrink-0 -mt-20">
              <img
                src={client.foto_perfil_url || 'https://ui-avatars.com/api/?name=Cliente&background=ea1d2c&color=fff'}
                className="w-24 h-24 rounded-3xl object-cover border-4 border-white shadow-md bg-white"
                alt={client.nome}
              />
            </div>
            <div className="text-center md:text-left flex-1 mt-4 md:mt-0 pb-2">
              <h2 className="text-2xl font-extrabold text-[#1F2937]">{client.nome}</h2>
              <div className="flex justify-center md:justify-start items-center gap-2 mt-3 bg-gray-50 inline-flex px-3 py-1.5 rounded-lg border border-gray-200">
                <i className="ph-fill ph-star text-amber-400 text-lg" />
                <span className="font-extrabold text-[#1F2937]">
                  {notaMedia > 0 ? `${notaMedia} (${clientReviews.length} avaliações)` : 'Novo cliente'}
                </span>
              </div>
            </div>
            {canReview && (
              <button
                onClick={() => setShowReviewModal(true)}
                className="w-full md:w-auto bg-[#EA1D2C] hover:bg-[#c41020] text-white font-extrabold py-3 px-6 rounded-xl transition shadow-lg shadow-red-500/30 transform hover:-translate-y-1"
              >
                <i className="ph-bold ph-star text-lg mr-2" /> Avaliar Cliente
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
          <h3 className="text-base font-extrabold text-[#1F2937] uppercase mb-6 border-b border-gray-100 pb-4 flex items-center gap-2">
            <i className="ph-fill ph-star text-[#EA1D2C]" /> Avaliações de Profissionais
          </h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {clientReviews.length === 0 ? (
              <div className="text-center py-6">
                <i className="ph-fill ph-star text-4xl text-gray-200 mb-2" />
                <p className="text-sm text-gray-500">Nenhuma avaliação recebida ainda.</p>
              </div>
            ) : (
              clientReviews.map((r) => {
                const w = users.find((u) => u.id === r.worker_id);
                return (
                  <div key={r.id} className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-extrabold text-sm text-[#1F2937]">{w?.nome || 'Profissional'}</span>
                      <StarRating rating={r.nota} />
                    </div>
                    <p className="text-xs text-gray-600">{r.comentario}</p>
                    <div className="text-[10px] text-gray-400 mt-2">{r.data}</div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
      {showReviewModal && (
        <ReviewModal
          isWorkerReview
          onSubmit={async (nota, comentario) => {
            try {
              await createReview({
                worker_id: currentUser.id,
                user_id: clientId,
                nota,
                comentario,
                fotos: [],
                data: new Date().toLocaleDateString('pt-BR'),
                isWorkerReview: true
              });
              setShowReviewModal(false);
              showToast('Avaliação do cliente enviada com sucesso!');
            } catch {
              showToast('Erro ao enviar avaliação.', 'error');
            }
          }}
          onClose={() => setShowReviewModal(false)}
        />
      )}
    </div>
  );
}
