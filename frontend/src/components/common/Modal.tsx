import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm">
      <div className="flex h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)] shadow-[0_30px_80px_rgba(15,23,42,0.4)]">
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[var(--border)] bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-cyan-500/10 px-4 py-3 sm:px-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--text-muted)]">Bug workspace</p>
            <h3 className="mt-1 text-lg font-semibold text-[var(--text-primary)] sm:text-xl">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-alt)] text-lg text-[var(--text-primary)] transition hover:border-indigo-400 hover:text-indigo-400"
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
