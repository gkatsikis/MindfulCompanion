import React, { useState } from 'react';
import type { HelpType } from '../types';
import Header from '../components/Header';
import ContentModal from '../components/ContentModal';
import { useAuth } from '../contexts/authContext';

import { testConnection } from '../services/testService';

interface JournalPageProps {
  onProfileClick: () => void;
}

const JournalPage: React.FC<JournalPageProps> = ({
  onProfileClick 
}) => {
  const { isLoggedIn, user, logout } = useAuth();
  const [journalTitle, setJournalTitle] = useState<string>('');
  const [journalContent, setJournalContent] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<string>('');
  const [modalTitle, setModalTitle] = useState<string>('');
  const [modalType, setModalType] = useState<'sample' | 'response' | 'default' | 'auth'>('default');
  const [showCopyButton, setShowCopyButton] = useState<boolean>(false);

  const handleSubmit = (helpType: HelpType): void => {
    if (helpType === 'save_only') {
      console.log('Saving entry only:', { title: journalTitle, content: journalContent });
      // Here you'd save to your Django backend
    } else {
      console.log('Submitting for AI response:', { 
        title: journalTitle, 
        content: journalContent, 
        helpType 
      });
      // Here you'd send to Django backend for Claude API processing
    }
    
    // Clear form after submission
    setJournalTitle('');
    setJournalContent('');

    // activate response modal?
    
  };

  const handleTestConnection = async (): Promise<void> => {
    try {
      const result = await testConnection();
      console.log(`Message: ${result.message}, Status: ${result.status}`);
    } catch (error) {
      console.log('Connection failed: ', error);
    }
  };

  const handleShowSampleText = (): void => {
    const sampleText = "Today I woke up sad, I felt hopeless and wasn't sure how to change my life."
    console.log('triggered succesfully')

    setModalContent(sampleText)
    setModalTitle('Sample Journal Entry')
    setModalType('sample')
    setShowCopyButton(true);
    setShowModal(true);
  }

  const handleLoginClick = (): void => {
    setModalType('auth');
    setModalTitle('Welcome to Mindful Companion');
    setShowModal(true);
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Header
        onProfileClick={onProfileClick}
        onLoginClick={handleLoginClick}
      />

      <ContentModal
        show={showModal}
        onClose={() => setShowModal(false)}
        title={modalTitle}
        content={modalContent}
        showCopyButton={showCopyButton}
        type={modalType}
      />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-left text-3xl font-light text-gray-800">
          How are you feeling today?
        </h1>
        {isLoggedIn ? (
          <button
            // onClick={() => handleSubmit('save_only')}
            onClick={handleTestConnection}
            disabled={!journalContent.trim()}
            className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-all disabled:opacity-50 cursor-pointer"
          >
            Save Only (No Response)
          </button>
          ) : (
            <button
              onClick={handleShowSampleText}
              className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-all disabled:opacity-50 cursor-pointer"
            >
              Sample Text
            </button>
          )}
      </div>
      {/* Journal Entry Form */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
        {/* Optional Title */}
        <input
          type="text"
          placeholder="Entry title (optional)"
          value={journalTitle}
          onChange={(e) => setJournalTitle(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        {/* Main Text Area */}
        <textarea
          placeholder="Start writing about your day, your thoughts, your feelings..."
          value={journalContent}
          onChange={(e) => setJournalContent(e.target.value)}
          rows={12}
          className="w-full p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 leading-relaxed"
        />
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 place-items-center">
        <button
          // onClick={() => handleSubmit('acute_validation')}
          onClick={handleTestConnection}
          disabled={!journalContent.trim()}
          className="p-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border-2 border-blue-200 hover:border-blue-300 transition-all disabled:opacity-50 cursor-pointer"
        >
          <div className="font-medium mb-1">Just Listen</div>
          <div className="text-sm opacity-75">I need someone to hear me</div>
        </button>
        
        <button
          // onClick={() => handleSubmit('acute_skills')}
          onClick={handleTestConnection}
          disabled={!journalContent.trim()}
          className="p-4 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg border-2 border-green-200 hover:border-green-300 transition-all disabled:opacity-50 cursor-pointer"
        >
          <div className="font-medium mb-1">Quick Help</div>
          <div className="text-sm opacity-75">I need coping techniques now</div>
        </button>

      {/* Save Only Button (for logged in users) */}
      {isLoggedIn && (
        // <div className="flex justify-center">
        <>
        <button
          onClick={() => handleSubmit('chronic_validation')}
          disabled={!journalContent.trim()}
          className="p-4 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg border-2 border-purple-200 hover:border-purple-300 transition-all disabled:opacity-50 cursor-pointer"
        >
          <div className="font-medium mb-1">Ongoing Support</div>
          <div className="text-sm opacity-75">Support for long-term issues</div>
        </button>
        
        <button
          onClick={() => handleSubmit('chronic_education')}
          disabled={!journalContent.trim()}
          className="p-4 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg border-2 border-orange-200 hover:border-orange-300 transition-all disabled:opacity-50 cursor-pointer"
        >
          <div className="font-medium mb-1">Learn Patterns</div>
          <div className="text-sm opacity-75">Help me understand trends</div>
        </button>
        </>
      )}
    </div>
  </div>
  );
};

export default JournalPage;