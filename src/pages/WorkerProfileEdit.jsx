import { useState } from 'react';
import { useAppStore } from '../store';
import StarRating from '../components/ui/StarRating';
import Header from '../components/ui/Header';
import ImageUploader from '../components/ui/ImageUploader';

export default function WorkerProfileEdit() {
  const { currentUser, workerDetails, logout, reviews, users, setWorkerDetails, showToast, setUsers, setCurrentUser } = useAppStore();
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tempBio, setTempBio] = useState('');

  const details = workerDetails.find(d => d.user_id === currentUser.id);
  const myReviews = reviews.filter(r => r.worker_id === currentUser.id && !r.isWorkerReview);
  const dynamicRating = myReviews.length > 0 ? (myReviews.reduce((a,b) => a+b.nota, 0) / myReviews.length).toFixed(1) : (details?.nota_media > 0 ? details.nota_media : 'Novo');

  return (
    <div className="pb-28 animate-fade-in w-full">
      <Header title="Configurações do Perfil" />
      <div className="max-w-4xl mx-auto px-4 md:px-0">

        {/* Hero Card */}
        <div className="mb-6 relative rounded-3xl shadow-sm border border-gray-100 overflow-hidden bg-white">
          <div className="h-48 bg-[#1F2937] relative">
            <img src={details?.banner_url || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=60'} className="w-full h-full object-cover opacity-50" alt="banner" />
            <ImageUploader 
              pathFolder={`users/${currentUser.id}/banner`}
              className="absolute top-4 right-4"
              onUploadSuccess={(url) => { setWorkerDetails(workerDetails.map(d => d.user_id === currentUser.id ? { ...d, banner_url: url } : d)); showToast('Banner atualizado!'); }}
              onError={(err) => showToast(err, 'error')}
            >
              <button className="bg-white/20 hover:bg-white/40 text-white p-2 rounded-xl backdrop-blur transition border border-white/30 text-sm font-bold">
                <i className="ph-bold ph-image" /> Alterar Capa
              </button>
            </ImageUploader>
          </div>
          <div className="p-8 flex flex-col md:flex-row items-center md:items-end gap-6 relative">
            <div className="relative shrink-0 -mt-20">
              <img src={currentUser.foto_perfil_url} className="w-32 h-32 rounded-3xl object-cover border-4 border-white shadow-md bg-white" alt={currentUser.nome} />
              <ImageUploader 
                pathFolder={`users/${currentUser.id}/avatar`}
                className="absolute -bottom-2 -right-2"
                onUploadSuccess={(url) => { setUsers(users.map(u => u.id === currentUser.id ? { ...u, foto_perfil_url: url } : u)); setCurrentUser({ ...currentUser, foto_perfil_url: url }); showToast('Foto atualizada!'); }}
                onError={(err) => showToast(err, 'error')}
              >
                <button className="bg-[#EA1D2C] text-white w-10 h-10 flex items-center justify-center rounded-xl shadow-lg hover:bg-[#c41020] transition border-2 border-white">
                  <i className="ph-bold ph-pencil-simple text-base" />
                </button>
              </ImageUploader>
            </div>
            <div className="text-center md:text-left flex-1 mt-4 md:mt-0 pb-2">
              <h2 className="text-2xl font-extrabold text-[#1F2937]">{currentUser.nome}</h2>
              <p className="text-[#EA1D2C] font-bold text-sm uppercase tracking-widest mt-1">{details?.categorias?.[0]}</p>
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
                  <button onClick={() => { setWorkerDetails(workerDetails.map(w => w.user_id === currentUser.id ? { ...w, isOnline: !w.isOnline } : w)); showToast(details?.isOnline ? 'Você está offline.' : 'Você está online!', details?.isOnline ? 'warning' : 'success'); }} className={`w-14 h-8 rounded-full transition-colors relative ${details?.isOnline ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <div className={`w-6 h-6 rounded-full bg-white absolute top-1 transition-all shadow-sm ${details?.isOnline ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                  <div className="font-extrabold text-[#1F2937] text-sm mb-2">Horário de Atendimento (Início e Fim)</div>
                  <div className="flex flex-col md:flex-row items-center gap-2">
                    <input type="time" defaultValue={details?.horaInicio || '08:00'} onBlur={e => { setWorkerDetails(workerDetails.map(w => w.user_id === currentUser.id ? { ...w, horaInicio: e.target.value } : w)); showToast('Horário inicial salvo!'); }} className="w-full md:flex-1 px-3 py-2 text-sm rounded-xl border border-gray-300 outline-none focus:border-[#EA1D2C] focus:ring-1 focus:ring-[#EA1D2C]" />
                    <span className="font-bold text-gray-400 hidden md:inline">até</span>
                    <input type="time" defaultValue={details?.horaFim || '18:00'} onBlur={e => { setWorkerDetails(workerDetails.map(w => w.user_id === currentUser.id ? { ...w, horaFim: e.target.value } : w)); showToast('Horário final salvo!'); }} className="w-full md:flex-1 px-3 py-2 text-sm rounded-xl border border-gray-300 outline-none focus:border-[#EA1D2C] focus:ring-1 focus:ring-[#EA1D2C]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
                <h3 className="text-base font-extrabold text-[#1F2937] uppercase flex items-center gap-2"><i className="ph-fill ph-text-aa text-[#EA1D2C]" /> Bio Pública</h3>
                {!isEditingBio && (
                  <button onClick={() => { setTempBio(details?.bio || ''); setIsEditingBio(true); }} className="bg-[#EA1D2C]/10 text-[#EA1D2C] p-2 rounded-lg hover:bg-[#EA1D2C] hover:text-white transition">
                    <i className="ph-bold ph-pencil-simple text-lg" />
                  </button>
                )}
              </div>
              {isEditingBio ? (
                <div className="animate-fade-in">
                  <textarea value={tempBio} onChange={e => setTempBio(e.target.value)} rows="4" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#EA1D2C] focus:ring-1 focus:ring-[#EA1D2C] bg-gray-50 mb-3 text-sm" placeholder="Fale sobre sua experiência..." />
                  <div className="flex gap-2">
                    <button onClick={() => { setWorkerDetails(workerDetails.map(w => w.user_id === currentUser.id ? { ...w, bio: tempBio } : w)); setIsEditingBio(false); showToast('Bio atualizada!'); }} className="bg-green-500 hover:bg-green-600 text-white font-extrabold px-4 py-2 rounded-xl text-sm transition shadow-md">Salvar</button>
                    <button onClick={() => setIsEditingBio(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-extrabold px-4 py-2 rounded-xl text-sm transition">Cancelar</button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-600 leading-relaxed">{details?.bio}</p>
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
                <div className="text-center py-6"><i className="ph-fill ph-star text-4xl text-gray-200 mb-2" /><p className="text-sm text-gray-500 font-medium">Nenhuma avaliação ainda.</p></div>
              ) : myReviews.map(r => {
                const c = users.find(u => u.id === r.user_id);
                return (
                  <div key={r.id} className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <img src={c?.foto_perfil_url} className="w-8 h-8 rounded-full object-cover" alt={c?.nome} />
                        <span className="font-extrabold text-sm text-[#1F2937]">{c?.nome || 'Cliente'}</span>
                      </div>
                      <div className="flex">
                        {[1,2,3,4,5].map(i => <i key={i} className={`text-sm ${i <= r.nota ? 'ph-fill ph-star text-amber-400' : 'ph ph-star text-gray-300'}`} />)}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 font-medium">{r.comentario}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
