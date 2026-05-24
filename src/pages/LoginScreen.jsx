// src/pages/LoginScreen.jsx
import { useState } from 'react';
import { useAppStore } from '../store';

export default function LoginScreen() {
  const { login, setCurrentView } = useAppStore();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    login(email, senha);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center px-4 animate-fade-in relative">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-red-500/5 rounded-full blur-[100px] pointer-events-none" />
      <button
        onClick={() => setCurrentView('HOME')}
        className="absolute top-4 left-4 text-gray-400 hover:text-[#1F2937] flex items-center gap-2 font-bold bg-white px-4 py-2 rounded-lg shadow-sm z-50"
      >
        <i className="ph-bold ph-arrow-left" /> Início
      </button>

      <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100">
            <i className="ph-fill ph-wrench text-5xl text-[#EA1D2C]" />
          </div>
          <h1 className="text-3xl font-extrabold text-[#1F2937] tracking-tight">
            <span className="text-[#1F2937]">mão</span><span className="text-[#EA1D2C]">A</span><span className="text-[#1F2937]">obra</span>
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Sua vida mais fácil, num clique.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#EA1D2C] focus:border-[#EA1D2C] outline-none transition-all bg-gray-50 focus:bg-white"
              placeholder="seu@email.com" required />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Senha</label>
            <input type="password" value={senha} onChange={e => setSenha(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#EA1D2C] focus:border-[#EA1D2C] outline-none transition-all bg-gray-50 focus:bg-white"
              placeholder="••••••••" required />
          </div>
          <button type="submit"
            className="w-full bg-[#EA1D2C] hover:bg-[#c41020] text-white font-extrabold text-lg py-4 rounded-xl shadow-lg shadow-red-500/30 transition-all mt-4 transform hover:-translate-y-1">
            Entrar
          </button>
        </form>

        <div className="mt-8 text-center border-t border-gray-100 pt-8">
          <p className="text-gray-500 text-sm mb-4 font-bold">Ainda não tem conta?</p>
          <button onClick={() => setCurrentView('REGISTER')}
            className="w-full bg-white border-2 border-gray-200 text-[#1F2937] font-bold py-4 rounded-xl hover:border-[#EA1D2C] hover:text-[#EA1D2C] transition-all">
            Quero me Cadastrar
          </button>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-xl text-xs text-gray-500 font-medium">
          <p className="font-bold text-gray-700 mb-1">Contas para teste (Senha: 123):</p>
          <p>Admin: legalmano@gmail.com</p>
          <p>Trabalhador: eduardo@gmail.com</p>
          <p>Cliente: pedro@gmail.com</p>
        </div>
      </div>
    </div>
  );
}
