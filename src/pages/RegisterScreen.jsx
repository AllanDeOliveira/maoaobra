// src/pages/RegisterScreen.jsx
import { useState } from 'react';
import { useAppStore } from '../store';

const UF_OPTIONS = ['SP','RJ','MG','RS','BA','PR','SC','GO','ES','DF','AM','PA','CE','PE','MT','MS','RN','AL','PB','PI','SE','TO','MA','AC','RO','RR','AP'];

export default function RegisterScreen() {
  const { register, setCurrentView, showToast } = useAppStore();
  const [role, setRole] = useState('CONTRATANTE');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cpf, setCpf] = useState('');
  const [cep, setCep] = useState('');
  const [uf, setUf] = useState('SP');
  const [cidade, setCidade] = useState('');
  const [rua, setRua] = useState('');
  const [bairro, setBairro] = useState('');
  const [numero, setNumero] = useState('');
  const [bio, setBio] = useState('');
  const [categoria, setCategoria] = useState('Eletricista');
  const [lgpd, setLgpd] = useState(false);

  const inp = "w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#EA1D2C] focus:border-[#EA1D2C] outline-none bg-gray-50 focus:bg-white transition-colors";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!lgpd) {
      showToast('Você precisa aceitar a Política de Privacidade e LGPD.', 'error');
      return;
    }
    const userData = { nome, email, senha, telefone, role, foto_perfil_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=ea1d2c&color=fff` };
    const specificData = { cpf, cep, uf, cidade, rua, bairro, numero };
    if (role === 'CONTRATANTE') register(userData, { ...specificData, bio_curta: '' });
    else register(userData, { ...specificData, bio, categorias: [categoria] });
  };

  const handleCepChange = async (e) => {
    let val = e.target.value.replace(/\D/g, '');
    setCep(val);
    if (val.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${val}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setRua(data.logradouro || '');
          setBairro(data.bairro || '');
          setCidade(data.localidade || '');
          setUf(data.uf || 'SP');
        }
      } catch (err) {
        console.error('Erro ao buscar CEP', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col w-full animate-fade-in relative md:py-10">
      <button onClick={() => setCurrentView('LOGIN')} className="absolute top-4 left-4 md:top-8 md:left-8 text-gray-400 hover:text-[#1F2937] flex items-center gap-2 font-bold bg-white px-4 py-2 rounded-lg shadow-sm z-50">
        <i className="ph-bold ph-arrow-left" /> Voltar ao Login
      </button>

      <div className="flex-1 p-6 max-w-3xl mx-auto w-full mt-14 md:mt-0">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-[#1F2937]">Crie sua Conta</h1>
          <p className="text-gray-500 font-medium mt-2">Junte-se à maior comunidade de serviços.</p>
        </div>

        {/* Toggle */}
        <div className="flex bg-white rounded-2xl p-2 mb-8 shadow-sm border border-gray-100 relative">
          <button onClick={() => setRole('CONTRATANTE')} className={`flex-1 py-3.5 rounded-xl text-sm font-extrabold transition-all z-10 ${role === 'CONTRATANTE' ? 'text-white' : 'text-gray-500'}`}>Quero Contratar</button>
          <button onClick={() => setRole('TRABALHADOR')} className={`flex-1 py-3.5 rounded-xl text-sm font-extrabold transition-all z-10 ${role === 'TRABALHADOR' ? 'text-white' : 'text-gray-500'}`}>Quero Trabalhar</button>
          <div className={`absolute top-2 bottom-2 w-[calc(50%-0.5rem)] bg-[#EA1D2C] rounded-xl transition-all duration-300 ease-out ${role === 'CONTRATANTE' ? 'left-2' : 'left-[calc(50%+0.25rem)]'}`} />
        </div>

        {role === 'TRABALHADOR' && (
          <div className="bg-orange-50 border border-orange-200 p-5 rounded-2xl mb-8 flex gap-4 items-start shadow-sm animate-fade-in">
            <i className="ph-fill ph-shield-check text-orange-500 text-3xl" />
            <div>
              <h4 className="font-bold text-orange-800 text-sm mb-1">Processo de Aprovação</h4>
              <p className="text-sm text-orange-700">Para garantir a segurança de todos, o cadastro de profissionais passa por uma <b>avaliação rigorosa</b> da nossa equipe.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Dados Pessoais */}
          <Card step="1" title="Dados Pessoais">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <Label>Nome Completo</Label>
                <input required type="text" maxLength="100" value={nome} onChange={e => setNome(e.target.value)} className={inp} placeholder="Ex: Maria Silva" />
              </div>
              <div>
                <Label>CPF</Label>
                <input required type="text" maxLength="14" value={cpf} onChange={e => setCpf(e.target.value)} className={inp} placeholder="000.000.000-00" />
              </div>
              <div>
                <Label>WhatsApp</Label>
                <input required type="tel" maxLength="15" value={telefone} onChange={e => setTelefone(e.target.value)} className={inp} placeholder="(11) 90000-0000" />
              </div>
            </div>
          </Card>

          {/* Acesso */}
          <Card step="2" title="Dados de Acesso">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label>Email</Label>
                <input required type="email" maxLength="100" value={email} onChange={e => setEmail(e.target.value)} className={inp} placeholder="maria@email.com" />
              </div>
              <div>
                <Label>Senha</Label>
                <input required type="password" maxLength="50" value={senha} onChange={e => setSenha(e.target.value)} className={inp} placeholder="••••••••" />
              </div>
            </div>
          </Card>

          {/* Endereço */}
          <Card step="3" title="Endereço">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label>CEP (Apenas números)</Label>
                <input required type="text" maxLength="8" value={cep} onChange={handleCepChange} className={inp} placeholder="00000000" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>UF</Label>
                  <select required value={uf} onChange={e => setUf(e.target.value)} className={inp + ' appearance-none'}>
                    {UF_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Cidade</Label>
                  <input required type="text" maxLength="100" value={cidade} onChange={e => setCidade(e.target.value)} className={inp} placeholder="Cidade" />
                </div>
              </div>
              <div className="md:col-span-2">
                <Label>Rua / Avenida</Label>
                <input required type="text" maxLength="100" value={rua} onChange={e => setRua(e.target.value)} className={inp} placeholder="Ex: Rua das Flores" />
              </div>
              <div>
                <Label>Bairro</Label>
                <input required type="text" maxLength="50" value={bairro} onChange={e => setBairro(e.target.value)} className={inp} placeholder="Centro" />
              </div>
              <div>
                <Label>Número / Complemento</Label>
                <input required type="text" maxLength="20" value={numero} onChange={e => setNumero(e.target.value)} className={inp} placeholder="123 - Apto 4" />
              </div>
            </div>
          </Card>

          {/* Profissional */}
          {role === 'TRABALHADOR' && (
            <Card step="4" title="Perfil Profissional">
              <div className="space-y-5">
                <div>
                  <Label>Especialidade Principal</Label>
                  <select value={categoria} onChange={e => setCategoria(e.target.value)} className={inp + ' appearance-none'}>
                    {['Eletricista','Encanador','Diarista','Pintor','Montador','TI','Jardineiro'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Carta de Apresentação (Bio)</Label>
                  <textarea required rows="4" maxLength="500" value={bio} onChange={e => setBio(e.target.value)} className={inp + ' resize-none'} placeholder="Fale sobre sua experiência e diferenciais..." />
                  <p className="text-xs text-gray-400 mt-1 text-right">{bio.length}/500</p>
                </div>
              </div>
            </Card>
          )}

          {/* LGPD */}
          <div className="flex items-start gap-3 bg-gray-50 p-5 rounded-2xl border border-gray-200 mt-6">
            <input type="checkbox" id="lgpd" checked={lgpd} onChange={e => setLgpd(e.target.checked)} className="mt-1 w-5 h-5 accent-[#EA1D2C] cursor-pointer" />
            <label htmlFor="lgpd" className="text-sm text-gray-600 font-medium cursor-pointer">
              Declaro que li e concordo com os <b>Termos de Uso e Política de Privacidade</b>. 
              Ao me cadastrar, aceito que meus dados informados (como nome, endereço e WhatsApp) poderão ser armazenados e exibidos publicamente na plataforma com o objetivo exclusivo de facilitar a conexão entre cliente e prestador de serviços, em conformidade com a <b>Lei Geral de Proteção de Dados (LGPD)</b>.
            </label>
          </div>

          <button type="submit" className="w-full bg-[#EA1D2C] hover:bg-[#c41020] text-white font-extrabold text-lg py-5 rounded-2xl shadow-lg shadow-red-500/30 mt-8 transition-all transform hover:-translate-y-1">
            {role === 'CONTRATANTE' ? 'Concluir Cadastro de Cliente' : 'Enviar Cadastro para Avaliação'}
          </button>
        </form>
      </div>
    </div>
  );
}

const Card = ({ step, title, children }) => (
  <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
    <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
      <div className="w-8 h-8 rounded-lg bg-red-50 text-[#EA1D2C] flex items-center justify-center font-bold">{step}</div>
      <h3 className="font-extrabold text-[#1F2937] text-lg">{title}</h3>
    </div>
    {children}
  </div>
);

const Label = ({ children }) => <label className="block text-sm font-bold text-gray-700 mb-2">{children}</label>;
