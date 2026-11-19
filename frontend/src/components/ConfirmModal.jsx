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
      iconWrap: 'bg-rose-50 border-rose-100 text-rose-600',
      accentBar: 'bg-rose-500',
      confirmBtn:
        'bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white shadow-sm shadow-rose-600/20',
      Icon: Trash2,
    },
    warning: {
      iconWrap: 'bg-amber-50 border-amber-100 text-amber-600',
      accentBar: 'bg-amber-500',
      confirmBtn:
        'bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white shadow-sm shadow-amber-500/20',
      Icon: AlertTriangle,
    },
    primary: {
      iconWrap: 'bg-blue-50 border-blue-100 text-[#2563EB]',
      accentBar: 'bg-[#2563EB]',
      confirmBtn:
        'bg-[#2563EB] hover:bg-blue-700 active:scale-[0.98] text-white shadow-sm shadow-blue-600/20',
      Icon: Pencil,
    },
  };

  const theme = variantStyles[variant] || variantStyles.danger;
  const Icon = theme.Icon;

  return (
    <div
      className="fixed inset-0 z-[80] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={() => {
        if (!dialog.loading) dispatch({ type: 'CLOSE_CONFIRM_DIALOG' });
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[420px] bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-fade-in-up"
      >
        {/* Top Close Button */}
        <button
          type="button"
          disabled={dialog.loading}
          onClick={() => dispatch({ type: 'CLOSE_CONFIRM_DIALOG' })}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100/80 hover:bg-slate-200/80 text-slate-500 hover:text-slate-800 disabled:opacity-40 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Main Content */}
        <div className="px-6 pt-7 pb-5 text-center space-y-4">
          {/* Calm Refined Icon Badge */}
          <div
            className={`w-12 h-12 mx-auto rounded-2xl border flex items-center justify-center ${theme.iconWrap}`}
          >
            <Icon className="w-5 h-5" />
          </div>

          <div className="space-y-1.5">
            <h3
              id="confirm-modal-title"
              className="text-lg font-extrabold text-slate-900 tracking-tight"
            >
              {dialog.title || 'Confirm Action'}
            </h3>
            {dialog.message && (
              <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed px-2">
                {dialog.message}
              </p>
            )}
            {dialog.khmerMessage && (
              <p className="text-xs text-slate-500 khmer-text leading-relaxed px-2">
                {dialog.khmerMessage}
              </p>
            )}
          </div>

          {/* Clean Target Item Card */}
          {dialog.targetLabel && (
            <div className="relative overflow-hidden rounded-2xl bg-[#FAF9F6] border border-slate-200/90 px-4 py-3 text-left flex items-center gap-3">
              <span className={`w-1 self-stretch rounded-full shrink-0 ${theme.accentBar}`} />
              <div className="text-xs sm:text-[13px] font-bold text-slate-800 leading-snug line-clamp-2 break-words">
                {dialog.targetLabel}
              </div>
            </div>
          )}
        </div>

        {/* Clean Footer Action Bar */}
        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            disabled={dialog.loading}
            onClick={() => dispatch({ type: 'CLOSE_CONFIRM_DIALOG' })}
            className="py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-50 text-slate-700 text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer"
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
