import React, { useState } from 'react';
import AuthForm from './AuthForm';
import { Trash2 } from 'lucide-react';


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
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/50 z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">
              {title}
            </h2>
            <div className="flex items-center gap-2">
              {/* Delete Button */}
              {showDeleteButton && !showDeleteConfirm && (
                <button
                  onClick={handleDeleteClick}
                  className="text-red-400 hover:text-red-600 cursor-pointer transition-colors p-1"
                  title="Delete entry"
                >
                  <Trash2 size={20} />
                </button>
              )}
              
              {/* Close Button */}
              <button
                onClick={onClose}
                className="text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Delete Confirmation */}
          {showDeleteConfirm && (
            <div className="bg-red-50 border-b border-red-200 p-4">
              <p className="text-red-800 mb-3">
                Are you sure you want to delete this journal entry? This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 cursor-pointer text-white rounded-lg transition-colors"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={handleCancelDelete}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 cursor-pointer text-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          
          {/* Content */}
          <div className="p-4 overflow-y-auto flex-1">
            {type === 'auth' ? (
              <AuthForm 
                onAuthSuccess={onAuthSuccess!} 
                onClose={onClose}
              />
            ) : (
              <div className="text-gray-700 whitespace-pre-wrap">{content}</div>
            )}
          </div>
          
          {/* Footer with actions */}
          {type !== 'auth' && (
            <div className="p-4 border-t flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {type === 'sample' && "Use this sample text to get started"}
                {type === 'response' && "AI Response"}
              </div>
              <div className="flex gap-2">
                {showCopyButton && (
                  <button
                    onClick={handleCopy}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      copied 
                        ? 'bg-green-600 text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {copied ? (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Copied!
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 cursor-pointer">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy Text
                      </div>
                    )}
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ContentModal;