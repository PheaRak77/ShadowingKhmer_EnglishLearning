import React, { useEffect } from 'react';
import { Trash2, AlertTriangle, Pencil, X, Loader2 } from 'lucide-react';
import { useAppContext } from '../reducer/appReducer.js';

export default function ConfirmModal({ onConfirm }) {
  const { state, dispatch } = useAppContext();
  const dialog = state.confirmDialog;

  useEffect(() => {
    if (!dialog?.isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !dialog.loading) {
        dispatch({ type: 'CLOSE_CONFIRM_DIALOG' });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dialog?.isOpen, dialog?.loading, dispatch]);

  if (!dialog?.isOpen) return null;

  const variant = dialog.variant || 'danger';

  const variantStyles = {
    danger: {
      ringBg: 'bg-rose-500/15',
      iconBg: 'bg-rose-50 border-rose-200 text-rose-600',
      itemBox: 'bg-rose-50/70 border-rose-200/80 text-rose-900',
      confirmBtn:
        'bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white shadow-sm shadow-rose-600/25',
      Icon: Trash2,
    },
    warning: {
      ringBg: 'bg-amber-500/15',
      iconBg: 'bg-amber-50 border-amber-200 text-amber-600',
      itemBox: 'bg-amber-50/70 border-amber-200/80 text-amber-900',
      confirmBtn:
        'bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white shadow-sm shadow-amber-500/25',
      Icon: AlertTriangle,
    },
    primary: {
      ringBg: 'bg-blue-500/15',
      iconBg: 'bg-blue-50 border-blue-200 text-[#2563EB]',
      itemBox: 'bg-blue-50/70 border-blue-200/80 text-blue-900',
      confirmBtn:
        'bg-[#2563EB] hover:bg-blue-700 active:scale-[0.98] text-white shadow-sm shadow-blue-600/25',
      Icon: Pencil,
    },
  };

  const theme = variantStyles[variant] || variantStyles.danger;
  const Icon = theme.Icon;

  return (
    <div
      className="fixed inset-0 z-[80] bg-slate-900/45 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={() => {
        if (!dialog.loading) dispatch({ type: 'CLOSE_CONFIRM_DIALOG' });
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white/98 backdrop-blur-xl rounded-3xl border border-slate-200/90 shadow-2xl p-6 space-y-5 animate-fade-in-up"
      >
        {/* Top-Right Close Button */}
        <button
          type="button"
          disabled={dialog.loading}
          onClick={() => dispatch({ type: 'CLOSE_CONFIRM_DIALOG' })}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Centered Icon Emblem */}
        <div className="flex flex-col items-center text-center space-y-3 pt-1">
          <div className="relative w-14 h-14 flex items-center justify-center">
            <span className={`absolute inset-0 rounded-2xl ${theme.ringBg} animate-ping`} />
            <div
              className={`relative w-12 h-12 rounded-2xl border flex items-center justify-center ${theme.iconBg}`}
            >
              <Icon className="w-6 h-6" />
            </div>
          </div>

          <div className="space-y-1">
            <h3
              id="confirm-modal-title"
              className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight"
            >
              {dialog.title || 'Confirm Action'}
            </h3>
            {dialog.message && (
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {dialog.message}
              </p>
            )}
            {dialog.khmerMessage && (
              <p className="text-xs text-slate-500 khmer-text leading-relaxed">
                {dialog.khmerMessage}
              </p>
            )}
          </div>
        </div>

        {/* Highlighted Target Item Pill (e.g., Lesson Title or Username) */}
        {dialog.targetLabel && (
          <div
            className={`px-3.5 py-2.5 rounded-2xl border text-center text-xs sm:text-sm font-bold leading-snug break-words ${theme.itemBox}`}
          >
            "{dialog.targetLabel}"
          </div>
        )}

        {/* Tactile Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            disabled={dialog.loading}
            onClick={() => dispatch({ type: 'CLOSE_CONFIRM_DIALOG' })}
            className="py-2.5 px-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-50 text-slate-700 text-xs sm:text-sm font-bold transition-all cursor-pointer"
          >
            {dialog.cancelText || 'Cancel'}
          </button>

          <button
            type="button"
            disabled={dialog.loading}
            onClick={() => onConfirm(dialog)}
            className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 disabled:opacity-60 transition-all cursor-pointer ${theme.confirmBtn}`}
          >
            {dialog.loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{dialog.confirmText || 'Delete'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
