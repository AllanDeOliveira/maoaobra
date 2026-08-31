// src/App.jsx — Roteador principal com React Router e autenticação Firebase
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAppStore } from './store';

import Toast from './components/ui/Toast';
import NavBar from './components/layout/NavBar';
import SupportWidget from './components/layout/SupportWidget';
import ProtectedRoute from './components/auth/ProtectedRoute';

import LoginScreen from './pages/LoginScreen';
import RegisterScreen from './pages/RegisterScreen';
import HomeContratante from './pages/HomeContratante';
import WorkerProfileDetail from './pages/WorkerProfileDetail';
import ClientOrders from './pages/ClientOrders';
import ProfileUser from './pages/ProfileUser';
import ClientProfileDetail from './pages/ClientProfileDetail';
import ActiveChats from './pages/ActiveChats';

import WorkerDashboard from './pages/WorkerDashboard';
import WorkerServicesCRUD from './pages/WorkerServicesCRUD';
import WorkerHistory from './pages/WorkerHistory';
import WorkerProfileEdit from './pages/WorkerProfileEdit';

import AdminDashboard from './pages/AdminDashboard';
import {
  AdminClients,
  AdminWorkers,
  AdminApprovals,
  AdminSupport,
  AdminChats
} from './pages/AdminPages';

function AppLayout() {
  const location = useLocation();
  const { currentUser, isLoaded, initFirebase, logout, showToast } = useAppStore();

  useEffect(() => {
    initFirebase();
    // Solicita localização do usuário
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          // Atualiza coordenadas no estado se disponível
          const myCoords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
          useAppStore.setState({ userCoords: myCoords });
        },
        (err) => console.log('Localização não autorizada:', err.message)
      );
    }
  }, [initFirebase]);

  // Inactivity Timeout (30 minutos)
  useEffect(() => {
    let timeout;
    const resetTimer = () => {
      if (currentUser) {
        localStorage.setItem('maos_lastActivity', Date.now().toString());
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          logout();
          showToast('Sessão expirada por inatividade (30 min)', 'warning');
        }, 30 * 60 * 1000);
      }
    };

    if (currentUser) {
      resetTimer();
      window.addEventListener('mousemove', resetTimer);
      window.addEventListener('keypress', resetTimer);
      window.addEventListener('touchstart', resetTimer);
    }

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keypress', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
    };
  }, [currentUser, logout, showToast]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#EA1D2C] border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-xl font-extrabold text-[#1F2937] animate-pulse">Conectando ao banco de dados...</h2>
      </div>
    );
  }

  const isAuthScreen = location.pathname === '/login' || location.pathname === '/cadastro';
  const navPaddingClass = !isAuthScreen ? (!currentUser ? 'pt-20' : 'md:pt-20') : '';
  const footerPadding = !currentUser || isAuthScreen ? 'pb-6' : 'pb-24 md:pb-6';

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col font-sans relative">
      {/* Decoração de fundo suave */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="fixed bottom-[20%] right-[-10%] w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[120px] pointer-events-none z-0" />

      <Toast />
      {!isAuthScreen && <NavBar />}

      <main className={`flex-1 w-full relative z-10 ${navPaddingClass} pb-4`}>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<HomeContratante />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/cadastro" element={<RegisterScreen />} />
          <Route path="/profissional/:workerId" element={<WorkerProfileDetail />} />
          <Route path="/cliente/:clientId" element={<ClientProfileDetail />} />

          {/* Rotas de Cliente (Contratante) */}
          <Route
            path="/pedidos"
            element={
              <ProtectedRoute allowedRoles={['CONTRATANTE', 'ADMIN']}>
                <ClientOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mensagens"
            element={
              <ProtectedRoute>
                <ActiveChats />
              </ProtectedRoute>
            }
          />
          <Route
            path="/perfil"
            element={
              <ProtectedRoute allowedRoles={['CONTRATANTE']}>
                <ProfileUser />
              </ProtectedRoute>
            }
          />

          {/* Rotas de Profissional (Trabalhador) */}
          <Route
            path="/trabalhador/dashboard"
            element={
              <ProtectedRoute allowedRoles={['TRABALHADOR', 'ADMIN']}>
                <WorkerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trabalhador/servicos"
            element={
              <ProtectedRoute allowedRoles={['TRABALHADOR', 'ADMIN']}>
                <WorkerServicesCRUD />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trabalhador/historico"
            element={
              <ProtectedRoute allowedRoles={['TRABALHADOR', 'ADMIN']}>
                <WorkerHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trabalhador/perfil"
            element={
              <ProtectedRoute allowedRoles={['TRABALHADOR', 'ADMIN']}>
                <WorkerProfileEdit />
              </ProtectedRoute>
            }
          />

          {/* Rotas de Administração */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/clientes"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminClients />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/profissionais"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminWorkers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/aprovacoes"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminApprovals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/suporte"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminSupport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/chats"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminChats />
              </ProtectedRoute>
            }
          />

          {/* Fallback para qualquer rota não mapeada */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <SupportWidget />

      <footer className={`bg-white border-t border-gray-100 py-5 text-center px-4 relative z-10 ${footerPadding}`}>
        <div className="flex flex-col items-center gap-0.5">
          <div className="text-lg font-extrabold tracking-tight">
            <span className="text-[#1F2937]">mão</span>
            <span className="text-[#EA1D2C]">A</span>
            <span className="text-[#1F2937]">obra</span>
          </div>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">
            © 2026 Todos os direitos reservados.
          </p>
          <p className="text-[10px] text-gray-300 font-medium mt-1">v1.0.0 — Arquitetura de Produção</p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  const basename = import.meta.env.BASE_URL || '/';
  return (
    <BrowserRouter basename={basename}>
      <AppLayout />
    </BrowserRouter>
  );
}
