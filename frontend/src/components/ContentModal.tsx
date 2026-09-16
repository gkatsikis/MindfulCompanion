import React, { useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import { Trash2, X } from 'lucide-react';
import AuthForm from './AuthForm';
import Clouds from './Clouds';
import type { User } from '../contexts/authContext';

interface ContentModalProps {
  show: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  content?: string;
  /** Markdown reply stored with a journal entry, rendered beneath it */
  aiResponse?: string;
  type?: 'default' | 'auth' | 'journal-entry';
  onAuthSuccess?: (user: User) => void;
  onDelete?: () => void;
  showDeleteButton?: boolean;
}

const secondaryButton =
  'px-5 py-2.5 bg-card hover:bg-mist text-ink rounded-full transition-all cursor-pointer ring-1 ring-ink/10';

const ContentModal: React.FC<ContentModalProps> = ({
  show,
  onClose,
  title = '',
  subtitle,
  content = '',
  aiResponse,
  type = 'default',
  onAuthSuccess,
  onDelete,
  showDeleteButton = false,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!show) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [show, onClose]);

  useEffect(() => {
    if (!show) setShowDeleteConfirm(false);
  }, [show]);

  if (!show) return null;

  return (
    <>
      <div className="fade-in fixed inset-0 z-40 dusk-veil backdrop-blur-sm" onClick={onClose}>
        <Clouds variant="dusk" />
      </div>

      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pointer-events-none">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="rise-in pointer-events-auto bg-card rounded-3xl shadow-lift ring-1 ring-ink/5 max-w-2xl w-full max-h-[88vh] sm:max-h-[80vh] flex flex-col overflow-hidden"
        >
          <div className="flex justify-between items-start gap-4 px-5 sm:px-8 pt-6 sm:pt-7 pb-5 border-b border-ink/5">
            <div className="min-w-0">
              <h2 id="modal-title" className="font-display text-2xl font-light text-ink">
                {title}
              </h2>
              {subtitle && <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {showDeleteButton && !showDeleteConfirm && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-2 rounded-full text-ink-soft hover:text-alert hover:bg-alert-soft cursor-pointer transition-all"
                  aria-label="Delete entry"
                >
                  <Trash2 size={18} strokeWidth={1.75} />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-full text-ink-soft hover:text-ink hover:bg-mist cursor-pointer transition-all"
                aria-label="Close"
              >
                <X size={20} strokeWidth={1.75} />
              </button>
            </div>
          </div>

          {showDeleteConfirm && (
            <div className="bg-alert-soft border-b border-alert/15 px-5 sm:px-8 py-6">
              <p className="text-alert mb-4">Delete this entry? This cannot be undone.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onDelete?.();
                    setShowDeleteConfirm(false);
                  }}
                  className="px-6 py-2.5 bg-alert text-alert-fg hover:opacity-90 cursor-pointer rounded-full transition-all shadow-soft"
                >
                  Yes, delete
                </button>
                <button onClick={() => setShowDeleteConfirm(false)} className={secondaryButton}>
                  Keep it
                </button>
              </div>
            </div>
          )}

          <div className="px-5 sm:px-8 py-6 sm:py-7 overflow-y-auto flex-1">
            {type === 'auth' ? (
              <AuthForm onAuthSuccess={onAuthSuccess!} onClose={onClose} />
            ) : (
              <>
                <div className="text-ink whitespace-pre-wrap leading-relaxed font-display text-lg">
                  {content}
                </div>
                {aiResponse && (
                  <div className="mt-8 pt-6 border-t border-ink/5">
                    <p className="text-xs uppercase tracking-widest text-ink-soft mb-3">
                      Your companion replied
                    </p>
                    <div className="prose-calm">
                      <Markdown>{aiResponse}</Markdown>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {type !== 'auth' && (
            <div className="px-5 sm:px-8 py-4 border-t border-ink/5 bg-paper flex justify-end">
              <button onClick={onClose} className={secondaryButton}>
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ContentModal;
