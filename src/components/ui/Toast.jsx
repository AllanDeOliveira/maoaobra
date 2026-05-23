// src/components/ui/Toast.jsx
import { useEffect } from 'react';
import { useAppStore } from '../../store';

const icons = {
  success: 'ph-check-circle',
  error:   'ph-x-circle',
  warning: 'ph-warning',
  info:    'ph-info',
};
const colors = {
  success: 'bg-green-600',
  error:   'bg-red-600',
  warning: 'bg-amber-500',
  info:    'bg-blue-500',
};

export default function Toast() {
  const toast = useAppStore(s => s.toast);
  if (!toast) return null;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[999999] animate-slide-down pointer-events-none">
      <div className={`${colors[toast.type] || colors.success} text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-bold text-sm max-w-sm`}>
        <i className={`ph-fill ${icons[toast.type] || icons.success} text-2xl shrink-0`} />
        <span>{toast.message}</span>
      </div>
    </div>
  );
}
