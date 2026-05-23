// src/components/modals/ReviewModal.jsx
import { useState } from 'react';
import { createPortal } from 'react-dom';

export default function ReviewModal({ onSubmit, onClose, isWorkerReview = false }) {
  const [nota, setNota] = useState(5);
  const [comentario, setComentario] = useState('');

  return createPortal(
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white max-w-md w-full rounded-3xl p-6 md:p-8 shadow-2xl relative animate-slide-down border border-gray-100">
        <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full flex items-center justify-center transition border border-gray-200">
          <i className="ph-bold ph-x text-xl" />
        </button>
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-orange-500 shadow-sm border border-orange-100">
            <i className="ph-fill ph-star text-3xl" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#1F2937]">Deixar Avaliação</h2>
          <p className="text-gray-500 text-sm mt-2">{isWorkerReview ? 'Como foi a experiência com este cliente?' : 'Como foi o serviço realizado?'}</p>
        </div>

        {/* Estrelas clicáveis */}
        <div className="flex justify-center gap-2 mb-6">
          {[1,2,3,4,5].map(i => (
            <button key={i} type="button" onClick={() => setNota(i)}>
              <i className={`text-4xl transition-transform hover:scale-110 ${i <= nota ? 'ph-fill ph-star text-amber-400' : 'ph ph-star text-gray-300'}`} />
            </button>
          ))}
        </div>
        <p className="text-center text-sm font-bold text-gray-500 mb-6">{['','Péssimo','Ruim','Regular','Bom','Excelente!'][nota]}</p>

        <textarea
          value={comentario}
          onChange={e => setComentario(e.target.value)}
          maxLength={400}
          placeholder={isWorkerReview ? 'Descreva como foi trabalhar com este cliente...' : 'Descreva como foi o serviço...'}
          className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#EA1D2C] focus:border-[#EA1D2C] outline-none bg-gray-50 focus:bg-white resize-none h-28 transition mb-1"
        />
        <p className="text-xs text-gray-400 text-right mb-6">{comentario.length}/400</p>

        <button
          onClick={() => { if (comentario.trim().length < 5) return; onSubmit(nota, comentario); }}
          disabled={comentario.trim().length < 5}
          className="w-full bg-[#EA1D2C] disabled:opacity-50 hover:bg-[#c41020] text-white font-extrabold py-4 rounded-xl shadow-lg shadow-red-500/30 transition transform hover:-translate-y-1"
        >
          Publicar Avaliação
        </button>
      </div>
    </div>,
    document.body
  );
}
