// src/pages/WorkerServicesCRUD.jsx — Gerenciamento do catálogo de serviços do trabalhador
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAppStore } from '../store';
import Header from '../components/ui/Header';
import ImageUploader from '../components/ui/ImageUploader';
import { createService, updateService, deleteService as deleteServiceApi } from '../services/servicesService';

export default function WorkerServicesCRUD() {
  const { services, currentUser, showToast } = useAppStore();
  const myServices = services.filter((s) => s.worker_id === currentUser?.id);
  const [modalData, setModalData] = useState(null);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [saving, setSaving] = useState(false);

  const openModal = (srv = null) => {
    setModalData(
      srv || {
        worker_id: currentUser.id,
        titulo: '',
        preco_base: '',
        descricao: '',
        imagem_url: ''
      }
    );
  };
  const closeModal = () => setModalData(null);

  const saveService = async (e) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.target);
    const srvData = {
      worker_id: currentUser.id,
      titulo: fd.get('titulo'),
      descricao: fd.get('descricao'),
      preco_base: Number(fd.get('preco_base')),
      imagem_url: modalData.imagem_url || ''
    };

    try {
      if (modalData.id) {
        await updateService(modalData.id, srvData);
        showToast('Serviço atualizado com sucesso!');
      } else {
        await createService(srvData);
        showToast('Novo serviço adicionado ao catálogo!');
      }
      closeModal();
    } catch {
      showToast('Erro ao salvar serviço.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (serviceToDelete) {
      try {
        await deleteServiceApi(serviceToDelete);
        showToast('Serviço excluído do catálogo.');
        setServiceToDelete(null);
      } catch {
        showToast('Erro ao excluir serviço.', 'error');
      }
    }
  };

  const inp =
    'w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#EA1D2C] focus:border-[#EA1D2C] outline-none bg-gray-50 focus:bg-white transition';

  if (!currentUser) return null;

  return (
    <div className="pb-28 md:pb-8 animate-fade-in w-full">
      <Header title="Gerenciar Catálogo de Serviços" />
      <div className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        <button
          onClick={() => openModal()}
          className="w-full h-full min-h-[160px] bg-white text-[#EA1D2C] border-2 border-[#EA1D2C] border-dashed rounded-3xl p-6 font-extrabold flex flex-col items-center justify-center gap-3 hover:bg-red-50 transition shadow-sm group"
        >
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <i className="ph-bold ph-plus text-3xl" />
          </div>
          Adicionar Novo Serviço
        </button>

        {myServices.map((srv) => (
          <div
            key={srv.id}
            className="bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition relative group overflow-hidden flex flex-col"
          >
            {srv.imagem_url && <img src={srv.imagem_url} className="w-full h-36 object-cover" alt={srv.titulo} />}
            <div className="p-6 flex-1 flex flex-col">
              <div className="absolute top-4 right-4 flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openModal(srv)}
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-[#EA1D2C] hover:text-white transition shadow-sm"
                  title="Editar Serviço"
                >
                  <i className="ph-bold ph-pencil-simple text-sm" />
                </button>
                <button
                  onClick={() => setServiceToDelete(srv.id)}
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-red-500 hover:text-white transition shadow-sm"
                  title="Excluir Serviço"
                >
                  <i className="ph-bold ph-trash text-sm" />
                </button>
              </div>
              <h3 className="font-extrabold text-[#1F2937] text-lg mb-2 pr-16">{srv.titulo}</h3>
              <p className="text-sm text-gray-500 mb-6 bg-gray-50 p-3 rounded-xl border border-gray-100 flex-1">
                {srv.descricao}
              </p>
              <div className="mt-auto">
                <div className="text-xs font-bold text-gray-400 uppercase mb-1">Preço Base</div>
                <div className="font-extrabold text-[#EA1D2C] text-2xl">R$ {srv.preco_base}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalData &&
        createPortal(
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-down">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-extrabold text-lg">{modalData.id ? 'Editar Serviço' : 'Novo Serviço'}</h3>
                <button
                  onClick={closeModal}
                  className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#1F2937] hover:bg-red-50 hover:text-[#EA1D2C] transition shadow-sm border border-gray-200"
                >
                  <i className="ph-bold ph-x" />
                </button>
              </div>
              <form onSubmit={saveService} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Nome do Serviço</label>
                  <input
                    required
                    name="titulo"
                    defaultValue={modalData.titulo}
                    type="text"
                    className={inp}
                    placeholder="Ex: Instalação de Tomadas"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Descrição</label>
                  <textarea
                    required
                    name="descricao"
                    defaultValue={modalData.descricao}
                    rows="3"
                    className={inp + ' resize-none'}
                    placeholder="Detalhes do que está incluso no serviço..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Preço Base (R$)</label>
                    <input
                      required
                      name="preco_base"
                      defaultValue={modalData.preco_base}
                      type="number"
                      min="1"
                      step="0.01"
                      className={inp}
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Imagem do Serviço</label>
                    <div className="flex gap-4 items-center">
                      {modalData.imagem_url && (
                        <div className="relative">
                          <img
                            src={modalData.imagem_url}
                            className="w-16 h-16 rounded-xl object-cover border border-gray-200"
                            alt="preview"
                          />
                          <button
                            type="button"
                            onClick={() => setModalData({ ...modalData, imagem_url: '' })}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] shadow-md border-2 border-white"
                          >
                            <i className="ph-bold ph-x" />
                          </button>
                        </div>
                      )}
                      <ImageUploader
                        pathFolder={`services/${currentUser.id}`}
                        onUploadSuccess={(url) => setModalData({ ...modalData, imagem_url: url })}
                        onError={(err) => showToast(err, 'error')}
                      >
                        <button
                          type="button"
                          className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-[#EA1D2C] hover:bg-red-50 transition border border-red-100 border-dashed"
                        >
                          <i className="ph-bold ph-upload-simple text-xl" />
                        </button>
                      </ImageUploader>
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-[#EA1D2C] hover:bg-[#c41020] disabled:opacity-50 text-white font-extrabold py-4 rounded-xl shadow-lg shadow-red-500/30 transition transform hover:-translate-y-1 mt-2 flex items-center justify-center gap-2"
                >
                  {saving && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {saving ? 'Salvando...' : 'Salvar Serviço'}
                </button>
              </form>
            </div>
          </div>,
          document.body
        )}

      {serviceToDelete &&
        createPortal(
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white max-w-sm w-full rounded-3xl shadow-2xl p-6 text-center animate-slide-down border border-gray-100">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ph-fill ph-trash text-3xl text-[#EA1D2C]" />
              </div>
              <h3 className="text-xl font-extrabold text-[#1F2937] mb-2">Excluir Serviço?</h3>
              <p className="text-sm text-gray-500 mb-6">
                Você tem certeza? Os clientes não poderão mais solicitar este item.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setServiceToDelete(null)}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 font-extrabold rounded-xl hover:bg-gray-200 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-3 bg-[#EA1D2C] text-white font-extrabold rounded-xl hover:bg-[#c41020] shadow-lg shadow-red-500/30 transition"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
