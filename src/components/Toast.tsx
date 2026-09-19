// src\components\Toast.tsx
import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  if (!toast) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-3 duration-200">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-xs font-medium ${
        toast.type === 'success'
          ? 'bg-blue-900 text-blue-100 border-blue-800'
          : toast.type === 'error'
          ? 'bg-red-900 text-red-100 border-red-800'
          : 'bg-neutral-900 text-neutral-100 border-neutral-800'
      }`}>
        {toast.type === 'success' ? (
          <CheckCircle2 size={16} className="text-blue-400 shrink-0" />
        ) : (
          <AlertCircle size={16} className="text-red-400 shrink-0" />
        )}
        <span>{toast.message}</span>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded-md transition-colors ml-2"
          aria-label="Close notification"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
};
