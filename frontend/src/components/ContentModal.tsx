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
{/* Backdrop with visible fluffy drifting clouds */}
<div 
  className="fixed inset-0 bg-gradient-to-br from-blue-900/30 via-cyan-900/20 to-slate-900/25 backdrop-blur-sm z-40 transition-all duration-300"
  onClick={onClose}
>
  {/* Cloud 1 - Fluffy cluster */}
  <div 
    className="absolute top-10"
    style={{
      animation: 'cloud-drift 58s linear infinite',
      left: '10%', // Start 10% across the screen
    }}
  >
    <div className="absolute w-48 h-48 bg-white/70 rounded-full blur-md" />
    <div className="absolute left-32 top-4 w-56 h-56 bg-white/70 rounded-full blur-md" />
    <div className="absolute left-64 top-8 w-40 h-40 bg-white/70 rounded-full blur-md" />
    <div className="absolute left-20 top-24 w-52 h-52 bg-white/70 rounded-full blur-md" />
  </div>
  
  {/* Cloud 2 - Fluffy cluster */}
  <div 
    className="absolute top-1/4"
    style={{
      animation: 'cloud-drift 61s linear infinite',
      left: '-15%', // Start off-screen to the left
    }}
  >
    <div className="absolute w-52 h-52 bg-white/65 rounded-full blur-md" />
    <div className="absolute left-36 top-6 w-44 h-44 bg-white/65 rounded-full blur-md" />
    <div className="absolute left-60 top-10 w-40 h-40 bg-white/65 rounded-full blur-md" />
  </div>

  {/* Cloud 3 - Medium cluster */}
  <div 
    className="absolute top-1/2"
    style={{
      animation: 'cloud-drift 60s linear infinite',
      left: '30%', // Start 30% across the screen
    }}
  >
    <div className="absolute w-44 h-44 bg-white/65 rounded-full blur-md" />
    <div className="absolute left-30 top-4 w-48 h-48 bg-white/65 rounded-full blur-md" />
    <div className="absolute left-56 top-8 w-36 h-36 bg-white/65 rounded-full blur-md" />
  </div>

  {/* Cloud 4 - Small puff cluster */}
  <div 
    className="absolute top-3/4"
    style={{
      animation: 'cloud-drift 63s linear infinite',
      left: '50%', // Start halfway across
    }}
  >
    <div className="absolute w-40 h-40 bg-white/60 rounded-full blur-sm" />
    <div className="absolute left-28 top-4 w-44 h-44 bg-white/60 rounded-full blur-sm" />
    <div className="absolute left-52 top-8 w-32 h-32 bg-white/60 rounded-full blur-sm" />
  </div>
</div>

      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl shadow-yellow-500/20 max-w-2xl w-full max-h-[80vh] flex flex-col border border-yellow-100/50 overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center p-6 bg-gradient-to-r from-blue-50 via-cyan-50 to-teal-50 border-b border-teal-100/50">
            <h2 className="text-xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-600">
              {title}
            </h2>
            <div className="flex items-center gap-2">
              {/* Delete Button */}
              {showDeleteButton && !showDeleteConfirm && (
                <button
                  onClick={handleDeleteClick}
                  className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full cursor-pointer transition-all duration-200 p-2"
                  title="Delete entry"
                >
                  <Trash2 size={18} />
                </button>
              )}
              
              {/* Close Button */}
              <button
                onClick={onClose}
                className="text-gray-400 cursor-pointer hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200 p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Delete Confirmation */}
          {showDeleteConfirm && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border-b border-red-100/50 p-6">
              <p className="text-red-700 mb-4 font-light">
                Are you sure you want to delete this journal entry? This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleConfirmDelete}
                  className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 cursor-pointer text-white rounded-full transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={handleCancelDelete}
                  className="px-6 py-2.5 bg-white hover:bg-gray-50 cursor-pointer text-gray-700 rounded-full transition-all duration-200 border border-gray-200 shadow-sm hover:shadow-md"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          
          {/* Content */}
          <div className="p-8 overflow-y-auto flex-1 bg-gradient-to-b from-white to-purple-50/20">
            {type === 'auth' ? (
              <AuthForm 
                onAuthSuccess={onAuthSuccess!} 
                onClose={onClose}
              />
            ) : (
              <div className="text-gray-700 whitespace-pre-wrap leading-relaxed font-light text-base">
                {content}
              </div>
            )}
          </div>
          
          {/* Footer with actions */}
          {type !== 'auth' && (
            <div className="p-6 border-t border-purple-100/50 bg-gradient-to-r from-purple-50/30 via-pink-50/30 to-blue-50/30 flex justify-between items-center">
              <div className="text-sm text-gray-500 font-light italic">
                {type === 'sample' && "Use this sample text to get started"}
                {type === 'response' && "AI Response"}
              </div>
              <div className="flex gap-2">
                {showCopyButton && (
                  <button
                    onClick={handleCopy}
                    className={`px-5 py-2.5 rounded-full transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer ${
                      copied 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                        : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white'
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
                  className="px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 rounded-full transition-all duration-200 cursor-pointer border border-gray-200 shadow-sm hover:shadow-md"
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