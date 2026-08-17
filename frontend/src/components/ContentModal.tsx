import React, { useState } from 'react';
import Markdown from 'react-markdown';
import AuthForm from './AuthForm';
import Clouds from './Clouds';
import { Trash2, X, Check, Copy, HeartHandshake } from 'lucide-react';


interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
}

interface ContentModalProps {
  show: boolean;
  onClose: () => void;
  title?: string;
  content?: string;
  showCopyButton?: boolean;
  type?: 'sample' | 'response' | 'default' | 'auth' | 'journal-entry';
  onAuthSuccess?: (user: User) => void;
  onDelete?: () => void;
  showDeleteButton?: boolean;
}

const ContentModal: React.FC<ContentModalProps> = ({ 
  show, 
  onClose, 
  title = "Content",
  content = "",
  showCopyButton = false,
  type = 'default',
  onAuthSuccess,
  onDelete,
  showDeleteButton = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (onDelete) {
      onDelete();
    }
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  if (!show) return null;

  return (
    <>
      {/* Dusk backdrop — twilight wash with drifting clouds */}
      <div
        className="fade-in fixed inset-0 z-40 dusk-veil backdrop-blur-sm"
        onClick={onClose}
      >
        <Clouds variant="dusk" />
      </div>

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="rise-in pointer-events-auto bg-card rounded-3xl shadow-lift ring-1 ring-white/60 max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center gap-4 px-8 pt-7 pb-5 border-b border-ink/5">
            <h2 className="font-display text-2xl font-light text-ink">
              {title}
            </h2>
            <div className="flex items-center gap-1">
              {showDeleteButton && !showDeleteConfirm && (
                <button
                  onClick={handleDeleteClick}
                  className="p-2 rounded-full text-ink-soft hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-all"
                  title="Delete entry"
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

          {/* Delete Confirmation */}
          {showDeleteConfirm && (
            <div className="bg-rose-50 border-b border-rose-100 px-8 py-6">
              <p className="text-rose-800 mb-4">
                Are you sure you want to delete this journal entry? This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleConfirmDelete}
                  className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 cursor-pointer text-white rounded-full transition-all shadow-soft"
                >
                  Yes, delete
                </button>
                <button
                  onClick={handleCancelDelete}
                  className="px-6 py-2.5 bg-white hover:bg-mist cursor-pointer text-ink rounded-full transition-all ring-1 ring-ink/10"
                >
                  Keep it
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="px-8 py-7 overflow-y-auto flex-1">
            {type === 'auth' ? (
              <AuthForm
                onAuthSuccess={onAuthSuccess!}
                onClose={onClose}
              />
            ) : type === 'response' ? (
              <div className="prose-calm">
                <Markdown>{content}</Markdown>
              </div>
            ) : (
              <div className="text-ink whitespace-pre-wrap leading-relaxed font-display text-lg">
                {content}
              </div>
            )}
          </div>

          {/* Footer with actions */}
          {type !== 'auth' && (
            <div className="px-8 py-5 border-t border-ink/5 bg-paper">
              {type === 'response' && (
                <div className="mb-4 flex items-start gap-2.5 bg-sky-soft rounded-xl px-4 py-3 text-sm text-ink leading-snug">
                  <HeartHandshake size={18} strokeWidth={1.75} className="text-sky-deep shrink-0 mt-0.5" />
                  <span>
                    This is not a replacement for professional mental health support,
                    and is intended for educational purposes only.
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center gap-4">
                <div className="text-sm text-ink-soft italic">
                  {type === 'sample' && 'Use this sample text to get started'}
                  {type === 'response' && 'Written with care by AI'}
                </div>
                <div className="flex gap-2">
                  {showCopyButton && (
                    <button
                      onClick={handleCopy}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all shadow-soft hover:shadow-lift cursor-pointer text-white ${
                        copied ? 'bg-sage-deep' : 'bg-dawn hover:bg-dawn-deep'
                      }`}
                    >
                      {copied ? <Check size={16} strokeWidth={2} /> : <Copy size={16} strokeWidth={1.75} />}
                      {copied ? 'Copied' : 'Copy text'}
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 bg-white hover:bg-mist text-ink rounded-full transition-all cursor-pointer ring-1 ring-ink/10"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ContentModal;