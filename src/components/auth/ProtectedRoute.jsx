// src/components/auth/ProtectedRoute.jsx — Proteção declarativa de rotas por autenticação e perfil (role)
import { Navigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../../store';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { currentUser, isLoaded } = useAppStore();
  const location = useLocation();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#EA1D2C] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500 font-bold text-sm">Carregando...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
    // Redireciona para o painel correspondente ao papel do usuário
    if (currentUser.role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (currentUser.role === 'TRABALHADOR') return <Navigate to="/trabalhador/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}
