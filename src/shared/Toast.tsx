import React, { useCallback, useState } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
  action?: ToastAction;
}

const TOAST_DURATION_MS = 4500;

const variantStyles: Record<ToastVariant, { icon: React.ReactNode; className: string }> = {
  success: { icon: <CheckCircle size={16} />, className: 'toast-success' },
  error: { icon: <AlertCircle size={16} />, className: 'toast-error' },
  warning: { icon: <AlertCircle size={16} />, className: 'toast-warning' },
  info: { icon: <Info size={16} />, className: 'toast-info' },
};

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((
    message: string,
    variant: ToastVariant = 'info',
    action?: ToastAction
  ) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((prev) => [...prev, { id, message, variant, action }]);

    window.setTimeout(() => {
      dismissToast(id);
    }, TOAST_DURATION_MS);
  }, [dismissToast]);

  return { toasts, showToast, dismissToast };
}

interface ToastStackProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export function ToastStack({ toasts, onDismiss }: ToastStackProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-stack" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => {
        const { icon, className } = variantStyles[toast.variant];
        return (
          <div key={toast.id} className={`toast ${className}`}>
            <span className="toast-icon">{icon}</span>
            <span className="toast-message">{toast.message}</span>
            {toast.action ? (
              <button
                type="button"
                className="toast-action"
                onClick={() => {
                  toast.action?.onClick();
                  onDismiss(toast.id);
                }}
              >
                {toast.action.label}
              </button>
            ) : null}
            <button
              type="button"
              className="toast-dismiss"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
