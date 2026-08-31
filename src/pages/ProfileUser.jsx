// src/pages/ProfileUser.jsx — Perfil do cliente com React Router e Firestore
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import Header from '../components/ui/Header';
import ImageUploader from '../components/ui/ImageUploader';
import { updateUserProfile, updateClientDetails } from '../services/userService';

export default function ProfileUser() {
  const navigate = useNavigate();
  const { currentUser, contratanteDetails, logout, showToast, setCurrentUser } = useAppStore();

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 animate-fade-in">
        <i className="ph-fill ph-user-circle text-7xl text-gray-200 mb-4" />
        <h2 className="text-2xl font-extrabold text-[#1F2937] mb-2">Meu Perfil</h2>
        <p className="text-gray-500 font-medium mb-6">Faça login para acessar seu perfil.</p>
        <button
          onClick={() => navigate('/login')}
          className="bg-[#EA1D2C] text-white font-extrabold px-8 py-3 rounded-xl shadow-lg shadow-red-500/30 hover:bg-[#c41020] transition"
        >
          Fazer Login
        </button>
      </div>
    );
  }

  const details = contratanteDetails.find((d) => d.user_id === currentUser.id || d.id === currentUser.id);

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
      await updateClientDetails(currentUser.id, { banner_url: url });
      showToast('Capa do perfil atualizada!');
    } catch {
      showToast('Erro ao atualizar capa.', 'error');
    }
  };

  return (
    <div className="pb-28 animate-fade-in w-full">
      <Header title="Meu Perfil" />
      <div className="max-w-3xl mx-auto px-4 md:px-0">
        <div className="mb-6 relative rounded-3xl shadow-sm border border-gray-100 overflow-hidden bg-white">
          <div className="h-32 bg-[#1F2937] relative">
            <img
              src={details?.banner_url || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=60'}
              className="w-full h-full object-cover opacity-50"
              alt="banner"
            />
            <ImageUploader
              pathFolder={`clients/${currentUser.id}`}
              className="absolute top-4 right-4"
              onUploadSuccess={handleUpdateBanner}
              onError={(err) => showToast(err, 'error')}
            >
              <div
                role="button"
                className="bg-white/20 hover:bg-white/40 text-white p-2 rounded-xl backdrop-blur transition border border-white/30 text-sm font-bold flex gap-2 items-center justify-center cursor-pointer"
              >
                <i className="ph-bold ph-image" /> Alterar Capa
              </div>
            </ImageUploader>
          </div>
          <div className="p-8 flex flex-col items-center -mt-16">
            <div className="relative">
              <img
                src={currentUser.foto_perfil_url || 'https://ui-avatars.com/api/?name=User&background=ea1d2c&color=fff'}
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md bg-white"
                alt={currentUser.nome}
              />
              <ImageUploader
                pathFolder={`avatars/${currentUser.id}`}
                className="absolute bottom-1 right-1"
                onUploadSuccess={handleUpdateAvatar}
                onError={(err) => showToast(err, 'error')}
              >
                <div
                  role="button"
                  className="bg-[#EA1D2C] text-white w-10 h-10 flex items-center justify-center rounded-full shadow-lg hover:bg-[#c41020] transition border-2 border-white cursor-pointer"
                >
                  <i className="ph-bold ph-pencil-simple text-base" />
                </div>
              </ImageUploader>
            </div>
            <h2 className="text-2xl font-extrabold mt-5 text-[#1F2937]">{currentUser.nome}</h2>
            <p className="text-gray-500 font-medium bg-gray-50 px-4 py-1.5 rounded-lg mt-2 border border-gray-100">
              {currentUser.email}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
          <h3 className="text-sm font-extrabold text-[#1F2937] uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
            <i className="ph-fill ph-identification-badge text-[#EA1D2C] text-xl" /> Informações Cadastrais
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoItem label="WhatsApp / Telefone" value={currentUser.telefone} />
            <InfoItem label="CPF" value={details?.cpf} />
            <div className="md:col-span-2 bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Endereço Cadastrado</div>
              <div className="text-base font-extrabold text-[#1F2937]">
                {details?.rua ? `${details.rua}, ${details.numero || 'S/N'}` : 'Não informado'}
              </div>
              <div className="text-sm font-bold text-gray-500">
                {details?.bairro ? `${details.bairro} • ` : ''}
                {details?.cidade ? `${details.cidade} - ${details.uf || 'MT'}` : ''}
                {details?.cep ? ` • CEP: ${details.cep}` : ''}
              </div>
            </div>
          </div>
          <button
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
            className="w-full md:w-auto md:min-w-[250px] mx-auto bg-red-50 text-red-600 font-extrabold py-4 px-8 rounded-2xl border border-red-100 mt-10 flex justify-center items-center gap-2 hover:bg-red-100 transition"
          >
            <i className="ph-bold ph-sign-out text-xl" /> Sair da conta
          </button>
        </div>
      </div>
    </div>
  );
}

const InfoItem = ({ label, value }) => (
  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
    <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">{label}</div>
    <div className="text-base font-extrabold text-[#1F2937]">{value || '—'}</div>
  </div>
);
