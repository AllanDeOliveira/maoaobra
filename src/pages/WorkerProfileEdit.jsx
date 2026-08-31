// src/pages/WorkerProfileEdit.jsx — Edição do perfil e disponibilidades do trabalhador com Firestore
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import Header from '../components/ui/Header';
import ImageUploader from '../components/ui/ImageUploader';
import { updateUserProfile, updateWorkerDetails } from '../services/userService';

export default function WorkerProfileEdit() {
  const navigate = useNavigate();
  const { currentUser, workerDetails, logout, reviews, users, showToast, setCurrentUser } = useAppStore();
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tempBio, setTempBio] = useState('');

  const details = workerDetails.find((d) => d.user_id === currentUser?.id || d.id === currentUser?.id);
  const myReviews = reviews.filter((r) => r.worker_id === currentUser?.id && !r.isWorkerReview);
  const dynamicRating =
    myReviews.length > 0
      ? (myReviews.reduce((a, b) => a + b.nota, 0) / myReviews.length).toFixed(1)
      : details?.nota_media > 0
      ? details.nota_media
      : 'Novo';

  if (!currentUser) return null;

  const handleUpdateAvatar = async (url) => {
    try {
      await updateUserProfile(currentUser.id, { foto_perfil_url: url });
      setCurrentUser({ ...currentUser, foto_perfil_url: url });
      showToast('Foto de perfil atualizada!');
    } catch {
      showToast('Erro ao atualizar foto de perfil.', 'error');
    }
  };

  const handleUpdateBanner = async (url) => {
    try {
      await updateWorkerDetails(currentUser.id, { banner_url: url });
      showToast('Capa do perfil atualizada!');
    } catch {
      showToast('Erro ao atualizar capa.', 'error');
    }
  };

  const handleToggleOnline = async () => {
    try {
      const nextState = !details?.isOnline;
      await updateWorkerDetails(currentUser.id, { isOnline: nextState });
      showToast(nextState ? 'Você está visível para clientes!' : 'Você está invisível (offline).', nextState ? 'success' : 'warning');
    } catch {
      showToast('Erro ao alterar status online.', 'error');
    }
  };

  const handleSaveBio = async () => {
    try {
      await updateWorkerDetails(currentUser.id, { bio: tempBio });
      setIsEditingBio(false);
      showToast('Apresentação profissional atualizada!');
    } catch {
      showToast('Erro ao salvar apresentação.', 'error');
    }
  };

  return (
    <div className="pb-28 animate-fade-in w-full">
      <Header title="Configurações do Perfil" />
      <div className="max-w-4xl mx-auto px-4 md:px-0">
        {/* Hero Card */}
        <div className="mb-6 relative rounded-3xl shadow-sm border border-gray-100 overflow-hidden bg-white">
          <div className="h-48 bg-[#1F2937] relative">
            <img
              src={details?.banner_url || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=60'}
              className="w-full h-full object-cover opacity-50"
              alt="banner"
            />
            <ImageUploader
              pathFolder={`portfolio/${currentUser.id}`}
              className="absolute top-4 right-4"
              onUploadSuccess={handleUpdateBanner}
              onError={(err) => showToast(err, 'error')}
            >
              <div
                role="button"
                className="bg-white/20 hover:bg-white/40 text-white p-2 rounded-xl backdrop-blur transition border border-white/30 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <i className="ph-bold ph-image" /> Alterar Capa
              </div>
            </ImageUploader>
          </div>
          <div className="p-8 flex flex-col md:flex-row items-center md:items-end gap-6 relative">
            <div className="relative shrink-0 -mt-20">
              <img
                src={currentUser.foto_perfil_url || 'https://ui-avatars.com/api/?name=User&background=ea1d2c&color=fff'}
                className="w-32 h-32 rounded-3xl object-cover border-4 border-white shadow-md bg-white"
                alt={currentUser.nome}
              />
              <ImageUploader
                pathFolder={`avatars/${currentUser.id}`}
                className="absolute -bottom-2 -right-2"
                onUploadSuccess={handleUpdateAvatar}
                onError={(err) => showToast(err, 'error')}
              >
                <div
                  role="button"
                  className="bg-[#EA1D2C] text-white w-10 h-10 flex items-center justify-center rounded-xl shadow-lg hover:bg-[#c41020] transition border-2 border-white cursor-pointer"
                >
                  <i className="ph-bold ph-pencil-simple text-base" />
                </div>
              </ImageUploader>
            </div>
            <div className="text-center md:text-left flex-1 mt-4 md:mt-0 pb-2">
              <h2 className="text-2xl font-extrabold text-[#1F2937]">{currentUser.nome}</h2>
              <p className="text-[#EA1D2C] font-bold text-sm uppercase tracking-widest mt-1">
                {details?.categorias?.[0] || 'Profissional'}
              </p>
              <div className="flex justify-center md:justify-start items-center gap-2 mt-3 bg-gray-50 inline-flex px-3 py-1.5 rounded-lg border border-gray-200">
                <i className="ph-fill ph-star text-amber-400 text-lg" />
                <span className="font-extrabold text-[#1F2937]">{dynamicRating}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            {/* Disponibilidade */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
              <h3 className="text-base font-extrabold text-[#1F2937] uppercase flex items-center gap-2 border-b border-gray-100 pb-4 mb-6">
                <i className="ph-fill ph-clock text-[#EA1D2C]" /> Disponibilidade
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-200">
                  <div>
                    <div className="font-extrabold text-[#1F2937] text-sm">Status Online</div>
                    <div className="text-xs text-gray-500 font-bold">Aparecer disponível para clientes</div>
                  </div>
                  <button
                    onClick={handleToggleOnline}
                    className={`w-14 h-8 rounded-full transition-colors relative ${
                      details?.isOnline ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full bg-white absolute top-1 transition-all shadow-sm ${
                        details?.isOnline ? 'left-7' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                  <div className="font-extrabold text-[#1F2937] text-sm mb-2">
                    Horário de Atendimento (Início e Fim)
                  </div>
                  <div className="flex flex-col md:flex-row items-center gap-2">
                    <input
                      type="time"
                      defaultValue={details?.horaInicio || '08:00'}
                      onBlur={async (e) => {
                        await updateWorkerDetails(currentUser.id, { horaInicio: e.target.value });
                        showToast('Horário inicial salvo!');
                      }}
                      className="w-full md:flex-1 px-3 py-2 text-sm rounded-xl border border-gray-300 outline-none focus:border-[#EA1D2C] focus:ring-1 focus:ring-[#EA1D2C]"
                    />
                    <span className="font-bold text-gray-400 hidden md:inline">até</span>
                    <input
                      type="time"
                      defaultValue={details?.horaFim || '18:00'}
                      onBlur={async (e) => {
                        await updateWorkerDetails(currentUser.id, { horaFim: e.target.value });
                        showToast('Horário final salvo!');
                      }}
                      className="w-full md:flex-1 px-3 py-2 text-sm rounded-xl border border-gray-300 outline-none focus:border-[#EA1D2C] focus:ring-1 focus:ring-[#EA1D2C]"
                    />
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                  <div className="font-extrabold text-[#1F2937] text-sm mb-2">Dias de Trabalho</div>
                  <select
                    defaultValue={details?.diasTrabalho || details?.workingHours?.split(',')[0] || 'Seg-Sex'}
                    onChange={async (e) => {
                      await updateWorkerDetails(currentUser.id, { diasTrabalho: e.target.value });
                      showToast('Dias de trabalho salvos!');
                    }}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 outline-none focus:border-[#EA1D2C] focus:ring-1 focus:ring-[#EA1D2C] bg-white cursor-pointer"
                  >
                    <option value="Seg-Sex">Segunda a Sexta</option>
                    <option value="Seg-Sab">Segunda a Sábado</option>
                    <option value="Todos os dias">Todos os dias</option>
                    <option value="Finais de semana">Apenas Finais de Semana</option>
                    <option value="A combinar">A combinar</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contato */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
              <h3 className="text-base font-extrabold text-[#1F2937] uppercase flex items-center gap-2 border-b border-gray-100 pb-4 mb-6">
                <i className="ph-fill ph-phone text-[#EA1D2C]" /> Contato Público
              </h3>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <div className="font-extrabold text-[#1F2937] text-sm mb-1">WhatsApp / Telefone</div>
                <p className="text-xs text-gray-500 mb-3">
                  Este número ficará visível publicamente no seu perfil para os clientes.
                </p>
                <input
                  type="tel"
                  defaultValue={currentUser.telefone}
                  onBlur={async (e) => {
                    const novoTel = e.target.value;
                    await updateUserProfile(currentUser.id, { telefone: novoTel });
                    setCurrentUser({ ...currentUser, telefone: novoTel });
                    showToast('Telefone atualizado com sucesso!');
                  }}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 outline-none focus:border-[#EA1D2C] focus:ring-1 focus:ring-[#EA1D2C]"
                  placeholder="(65) 99999-0000"
                />
              </div>
            </div>

            {/* Bio */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
                <h3 className="text-base font-extrabold text-[#1F2937] uppercase flex items-center gap-2">
                  <i className="ph-fill ph-text-aa text-[#EA1D2C]" /> Bio Pública
                </h3>
                {!isEditingBio && (
                  <button
                    onClick={() => {
                      setTempBio(details?.bio || '');
                      setIsEditingBio(true);
                    }}
                    className="bg-[#EA1D2C]/10 text-[#EA1D2C] p-2 rounded-lg hover:bg-[#EA1D2C] hover:text-white transition"
                  >
                    <i className="ph-bold ph-pencil-simple text-lg" />
                  </button>
                )}
              </div>
              {isEditingBio ? (
                <div className="animate-fade-in">
                  <textarea
                    value={tempBio}
                    onChange={(e) => setTempBio(e.target.value)}
                    rows="4"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#EA1D2C] focus:ring-1 focus:ring-[#EA1D2C] bg-gray-50 mb-3 text-sm"
                    placeholder="Fale sobre sua experiência profissional..."
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveBio}
                      className="bg-green-500 hover:bg-green-600 text-white font-extrabold px-4 py-2 rounded-xl text-sm transition shadow-md"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={() => setIsEditingBio(false)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-extrabold px-4 py-2 rounded-xl text-sm transition"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-600 leading-relaxed">{details?.bio || 'Sem apresentação cadastrada.'}</p>
              )}
            </div>
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
            <h3 className="text-base font-extrabold text-[#1F2937] uppercase mb-6 border-b border-gray-100 pb-4 flex items-center gap-2">
              <i className="ph-fill ph-star text-amber-400" /> Feedback dos Clientes
            </h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {myReviews.length === 0 ? (
                <div className="text-center py-6">
                  <i className="ph-fill ph-star text-4xl text-gray-200 mb-2" />
                  <p className="text-sm text-gray-500 font-medium">Nenhuma avaliação ainda.</p>
                </div>
              ) : (
                myReviews.map((r) => {
                  const c = users.find((u) => u.id === r.user_id);
                  return (
                    <div key={r.id} className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <img
                            src={
                              c?.foto_perfil_url ||
                              'https://ui-avatars.com/api/?name=Cliente&background=ea1d2c&color=fff'
                            }
                            className="w-8 h-8 rounded-full object-cover"
                            alt={c?.nome}
                          />
                          <span className="font-extrabold text-sm text-[#1F2937]">{c?.nome || 'Cliente'}</span>
                        </div>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <i
                              key={i}
                              className={`text-sm ${
                                i <= r.nota ? 'ph-fill ph-star text-amber-400' : 'ph ph-star text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 font-medium">{r.comentario}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <button
          onClick={async () => {
            await logout();
            navigate('/login');
          }}
          className="w-full mt-8 bg-red-50 text-red-600 font-extrabold py-4 px-8 rounded-2xl border border-red-100 flex justify-center items-center gap-2 hover:bg-red-100 transition"
        >
          <i className="ph-bold ph-sign-out text-xl" /> Sair da conta
        </button>
      </div>
    </div>
  );
}
