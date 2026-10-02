import React from 'react';
import { useToast } from '../context/ToastContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-3">
      {toasts.map((toast) => {
        let icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />;
        let borderColor = 'border-emerald-500/30';
        let bgGlow = 'shadow-emerald-950/40';

        if (toast.type === 'error') {
          icon = <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />;
          borderColor = 'border-rose-500/40';
          bgGlow = 'shadow-rose-950/40';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />;
          borderColor = 'border-amber-500/40';
          bgGlow = 'shadow-amber-950/40';
        } else if (toast.type === 'info') {
          icon = <Info className="w-5 h-5 text-purple-400 flex-shrink-0" />;
          borderColor = 'border-purple-500/40';
          bgGlow = 'shadow-purple-950/40';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl bg-[#0e0e17]/95 border ${borderColor} shadow-xl ${bgGlow} backdrop-blur-xl animate-fade-in transition-all`}
          >
            {icon}
            <div className="flex-1 overflow-hidden">
              <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                {toast.title}
              </h4>
              {toast.description && (
                <p className="text-[11px] text-zinc-300 mt-0.5 line-clamp-2">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-zinc-500 hover:text-zinc-300 p-0.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
