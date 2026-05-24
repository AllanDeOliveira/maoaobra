// src/pages/HomeContratante.jsx
import { useState } from 'react';
import { useAppStore, getEstimatedDistance } from '../store';
import StarRating from '../components/ui/StarRating';

const CATEGORIES = ['Todos','Eletricista','Encanador','Diarista','Pintor','Montador','TI','Jardineiro'];
const CAT_ICONS  = { Todos:'ph-squares-four', Eletricista:'ph-lightning', Encanador:'ph-drop', Diarista:'ph-broom', Pintor:'ph-paint-roller', Montador:'ph-wrench', TI:'ph-desktop', Jardineiro:'ph-plant' };

export default function HomeContratante({ onSelectWorker }) {
  const { users, workerDetails, reviews, currentUser, setCurrentView } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  const myDetails = currentUser ? useAppStore.getState().contratanteDetails.find(d => d.user_id === currentUser.id) : null;

  const workers = users.filter(u => u.role === 'TRABALHADOR' && u.status === 'APPROVED');

  const filteredWorkers = workers.filter(w => {
    const d = workerDetails.find(x => x.user_id === w.id);
    const matchCat = selectedCategory === 'Todos' || d?.categorias?.some(c => c === selectedCategory);
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || w.nome.toLowerCase().includes(q) || d?.categorias?.some(c => c.toLowerCase().includes(q)) || d?.bio?.toLowerCase().includes(q) || d?.bairro?.toLowerCase().includes(q);
    return matchCat && matchSearch;
  }).sort((a, b) => {
    if (!myDetails) return 0;
    const dA = workerDetails.find(x => x.user_id === a.id);
    const dB = workerDetails.find(x => x.user_id === b.id);
    const distA = parseFloat(getEstimatedDistance(myDetails, dA)) || Infinity;
    const distB = parseFloat(getEstimatedDistance(myDetails, dB)) || Infinity;
    return distA - distB;
  });

  return (
    <div className="w-full animate-fade-in">
      {/* HERO */}
      <div className="bg-white border-b border-gray-100 pt-4 pb-8 mb-8 md:rounded-3xl md:shadow-sm md:mt-2">
        <div className="px-4 md:px-8 max-w-4xl mx-auto text-center">
          <h1 className="text-2xl md:text-4xl font-extrabold text-[#1F2937] mb-2 mt-2 md:mt-4 leading-tight">
            Encontre os melhores profissionais.
          </h1>
          <p className="text-sm md:text-base text-gray-500 font-bold mb-4">O que você está precisando resolver hoje?</p>
          <div className="relative mt-4 md:mt-6 shadow-lg shadow-gray-200/50 rounded-2xl mx-2 md:mx-0">
            <i className="ph-bold ph-magnifying-glass absolute left-4 md:left-5 top-3.5 md:top-4 text-gray-400 text-lg md:text-xl" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Ex: Encanador, Limpeza..."
              className="w-full pl-12 md:pl-14 pr-3 py-3 md:py-4 bg-white border border-gray-200 rounded-2xl font-bold text-sm md:text-lg focus:ring-4 focus:ring-red-100 focus:border-[#EA1D2C] outline-none transition-all"
            />
          </div>
        </div>

        {/* CATEGORIAS */}
        <div className="mt-6 md:mt-10 px-2 md:px-8 max-w-7xl mx-auto">
          <div className="flex gap-2 md:gap-4 overflow-x-auto hide-scrollbar pb-2 md:flex-wrap md:justify-center">
            {CATEGORIES.map(cat => {
              const isSelected = selectedCategory === cat;
              return (
                <div key={cat} onClick={() => setSelectedCategory(cat)}
                  className="flex flex-col items-center gap-2 md:gap-3 flex-shrink-0 cursor-pointer group w-16 md:w-28">
                  <div className={`w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-3xl shadow-sm flex items-center justify-center text-2xl md:text-3xl border transition-all duration-300
                    ${isSelected ? 'bg-[#EA1D2C] text-white border-[#EA1D2C] shadow-md md:shadow-lg shadow-red-500/30 scale-105 md:scale-110' : 'bg-white text-[#1F2937] border-gray-200 group-hover:border-red-300 group-hover:bg-red-50'}`}>
                    <i className={`ph-fill ${CAT_ICONS[cat] || 'ph-squares-four'}`} />
                  </div>
                  <span className={`text-[10px] md:text-sm font-bold ${isSelected ? 'text-[#EA1D2C]' : 'text-gray-500'}`}>{cat}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* GRID WORKERS */}
      <div className="px-4 md:px-8 max-w-7xl mx-auto mb-32 md:mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-2">
          <h2 className="text-lg md:text-2xl font-extrabold text-[#1F2937] leading-tight">
            {searchQuery ? `Resultados para "${searchQuery}"` : selectedCategory === 'Todos' ? 'Profissionais em Destaque' : `Profissionais de ${selectedCategory}`}
          </h2>
          <span className="text-xs md:text-sm font-bold text-gray-400">{filteredWorkers.length} encontrado{filteredWorkers.length !== 1 ? 's' : ''}</span>
        </div>

        {filteredWorkers.length === 0 ? (
          <div className="text-center p-14 bg-white rounded-3xl border border-gray-100 max-w-2xl mx-auto shadow-sm">
            <i className="ph-fill ph-magnifying-glass text-6xl mb-4 text-gray-200" />
            <h3 className="text-xl font-bold text-[#1F2937] mb-2">Nenhum profissional encontrado</h3>
            <p className="text-gray-500 font-medium">Tente outro termo ou categoria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredWorkers.map(w => {
              const details = workerDetails.find(d => d.user_id === w.id);
              const workerReviews = reviews.filter(r => r.worker_id === w.id && !r.isWorkerReview);
              const dynamicRating = workerReviews.length > 0
                ? (workerReviews.reduce((a, b) => a + b.nota, 0) / workerReviews.length).toFixed(1)
                : 0;
              return (
                <div
                  key={w.id}
                  onClick={() => onSelectWorker(w.id)}
                  className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex gap-5 items-center cursor-pointer hover:shadow-xl hover:border-red-200 transition-all transform hover:-translate-y-1 group"
                >
                  <div className="relative shrink-0">
                    <img src={w.foto_perfil_url} alt={w.nome} className="w-20 h-20 rounded-2xl object-cover bg-gray-200 shadow-sm" />
                    <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-sm">
                      <i className={`ph-fill ph-circle text-lg ${details?.isOnline ? 'text-green-500' : 'text-gray-300'}`} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-lg text-[#1F2937] group-hover:text-[#EA1D2C] transition-colors truncate">{w.nome}</h3>
                    <p className="text-gray-500 text-sm font-bold uppercase tracking-wide mt-0.5">{details?.categorias?.[0]}</p>
                    <div className="flex items-center gap-1 mt-1 text-xs font-bold text-gray-500">
                      <i className="ph-fill ph-map-pin text-[#EA1D2C]" /> 
                      {details?.cidade ? `${details.cidade}, ${details.uf}` : details?.bairro ? `${details.bairro}, ${details.uf}` : 'Brasil'}
                      {myDetails && details && <span className="ml-1 text-[#EA1D2C] bg-red-50 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider font-extrabold shadow-sm border border-red-100">~ {getEstimatedDistance(myDetails, details)} km</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <StarRating rating={Number(dynamicRating)} />
                      <span className="text-xs font-extrabold text-[#1F2937]">{dynamicRating > 0 ? dynamicRating : 'Novo'}</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-red-50 group-hover:text-[#EA1D2C] transition-colors shrink-0">
                    <i className="ph-bold ph-arrow-right text-lg" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
