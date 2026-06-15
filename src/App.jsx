// src/App.jsx — Router completo
import { useEffect } from 'react';
import { useAppStore } from './store';

import Toast from './components/ui/Toast';
import NavBar from './components/layout/NavBar';
import SupportWidget from './components/layout/SupportWidget';

import LoginScreen from './pages/LoginScreen';
import RegisterScreen from './pages/RegisterScreen';
import HomeContratante from './pages/HomeContratante';
import WorkerProfileDetail from './pages/WorkerProfileDetail';
import ClientOrders from './pages/ClientOrders';
import ProfileUser from './pages/ProfileUser';
import ClientProfileDetail from './pages/ClientProfileDetail';

import WorkerDashboard from './pages/WorkerDashboard';
import WorkerServicesCRUD from './pages/WorkerServicesCRUD';
import WorkerHistory from './pages/WorkerHistory';
import WorkerProfileEdit from './pages/WorkerProfileEdit';

import AdminDashboard from './pages/AdminDashboard';
import { AdminClients, AdminWorkers, AdminApprovals, AdminSupport, AdminChats } from './pages/AdminPages';

function AppRouter() {
  const {
    currentView, currentUser,
    selectedWorkerId, setSelectedWorkerId,
    selectedClientId, setSelectedClientId,
    setCurrentView,
    isLoaded, initFirebase
  } = useAppStore();

  useEffect(() => {
    initFirebase();
    // Solicita localização do usuário
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => console.log('Location granted:', pos.coords.latitude, pos.coords.longitude),
        (err) => console.log('Location denied/error:', err)
      );
    }
  }, [initFirebase]);

  // History API
  useEffect(() => {
    const handler = (e) => {
      if (e.state) {
        useAppStore.setState({
          currentView: e.state.view || 'HOME',
          selectedWorkerId: e.state.workerId || null,
          selectedClientId: e.state.clientId || null,
        });
      }
    };
    window.addEventListener('popstate', handler);
    window.history.replaceState({ view: currentView, workerId: null, clientId: null }, '', window.location.pathname);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  // Inactivity Timeout
  useEffect(() => {
    let timeout;
    const resetTimer = () => {
      if (currentUser) {
        localStorage.setItem('maos_lastActivity', Date.now().toString());
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          useAppStore.getState().logout();
          useAppStore.getState().showToast('Sessão expirada por inatividade (30 min)', 'warning');
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
  }, [currentUser]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#EA1D2C] border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-xl font-extrabold text-[#1F2937] animate-pulse">Conectando ao banco de dados...</h2>
      </div>
    );
  }

  const hideNav = currentView === 'LOGIN' || currentView === 'REGISTER' || !!selectedWorkerId;
  const navPaddingClass = !hideNav ? (!currentUser ? 'pt-20' : 'md:pt-20') : '';
  const footerPadding = (!currentUser || hideNav) ? 'pb-6' : 'pb-24 md:pb-6';

  let content;
  if (currentView === 'LOGIN')              content = <LoginScreen />;
  else if (currentView === 'REGISTER')      content = <RegisterScreen />;
  else if (selectedWorkerId)                content = <WorkerProfileDetail workerId={selectedWorkerId} onBack={() => setSelectedWorkerId(null)} />;
  else if (selectedClientId)                content = <ClientProfileDetail clientId={selectedClientId} onBack={() => setSelectedClientId(null)} />;
  else if (currentView === 'HOME')          content = <HomeContratante onSelectWorker={setSelectedWorkerId} />;
  else if (currentView === 'ORDERS')        content = <ClientOrders />;
  else if (currentView === 'PROFILE')       content = <ProfileUser />;
  else if (currentView === 'WORKER_DASH')   content = <WorkerDashboard />;
  else if (currentView === 'WORKER_SERVICES') content = <WorkerServicesCRUD />;
  else if (currentView === 'WORKER_HISTORY')  content = <WorkerHistory />;
  else if (currentView === 'WORKER_PROFILE')  content = <WorkerProfileEdit />;
  else if (currentView === 'ADMIN_DASH')    content = <AdminDashboard />;
  else if (currentView === 'ADMIN_CLIENTS') content = <AdminClients />;
  else if (currentView === 'ADMIN_WORKERS') content = <AdminWorkers />;
  else if (currentView === 'ADMIN_APPROVALS') content = <AdminApprovals />;
  else if (currentView === 'ADMIN_SUPPORT') content = <AdminSupport />;
  else if (currentView === 'ADMIN_CHATS')   content = <AdminChats />;
  else                                      content = <HomeContratante onSelectWorker={setSelectedWorkerId} />;

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col font-sans relative">
      {/* Decoração de fundo */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="fixed bottom-[20%] right-[-10%] w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[120px] pointer-events-none z-0" />

      <Toast />
      {!hideNav && <NavBar />}

      <main className={`flex-1 w-full relative z-10 ${navPaddingClass} pb-4`}>
        {content}
      </main>

      <SupportWidget />

      <footer className={`bg-white border-t border-gray-100 py-5 text-center px-4 relative z-10 ${footerPadding}`}>
        <div className="flex flex-col items-center gap-0.5">
          <div className="text-lg font-extrabold tracking-tight">
            <span className="text-[#1F2937]">mão</span>
            <span className="text-[#EA1D2C]">A</span>
            <span className="text-[#1F2937]">obra</span>
          </div>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">© 2026 Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return <AppRouter />;
}
