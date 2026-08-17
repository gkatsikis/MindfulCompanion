import React, { useState } from 'react';
import { Ear, Sparkles, Sprout, Waves, Feather } from 'lucide-react';
import type { HelpType } from '../types';
import Header from '../components/Header';
import ContentModal from '../components/ContentModal';
import Clouds from '../components/Clouds';
import { useAuth } from '../contexts/authContext';
import { createJournalEntry } from '../services/journalService'
import { getAIResponse, getAIResponseWithSave } from '../services/llmService';


interface JournalPageProps {
  onProfileClick: () => void;
}

// The response modal's title answers the help the user asked for
const RESPONSE_TITLES: Partial<Record<HelpType, string>> = {
  acute_validation: 'We hear you',
  acute_skills: 'Something to try',
  chronic_validation: 'Walking with you',
  chronic_education: 'What your entries show',
};

const JournalPage: React.FC<JournalPageProps> = ({
  onProfileClick 
}) => {
  const { isLoggedIn, login } = useAuth();

  const [journalTitle, setJournalTitle] = useState<string>('');
  const [journalContent, setJournalContent] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<string>('');
  const [modalTitle, setModalTitle] = useState<string>('');
  const [modalType, setModalType] = useState<'sample' | 'response' | 'default' | 'auth'>('default');
  const [showCopyButton, setShowCopyButton] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (helpType: HelpType): Promise<void> => {
    setIsSubmitting(true);

    try {
      if (helpType === 'save_only' && isLoggedIn) {
        console.log('Saving entry only (no AI Response)');

        const savedEntry = await createJournalEntry({
          title: journalTitle,
          content: journalContent,
          requested_help_type: null,
          is_continuation: false,
          references_past_entries: false,
        });

        console.log('Entry saved successfully:', savedEntry)

        setModalTitle('Entry Saved');
        setModalContent('Your entry has been saved successfully.');
        setModalType('default');
        setShowCopyButton(false);
        setShowModal(true);

      } else if (isLoggedIn) {
        console.log('Saving entry AND requesting AI response:', helpType);
      
        const response = await getAIResponseWithSave(
              journalContent,
              helpType,
              journalTitle || undefined
            );

            console.log('Entry saved with AI response:', response);

            // Check if AI generation succeeded or failed
            if ('ai_response' in response) {
              // Success: Show AI response
              setModalTitle(RESPONSE_TITLES[helpType] ?? 'From your companion');
              setModalContent(response.ai_response);
              setModalType('response');
              setShowCopyButton(true); // Allow copying AI response
              setShowModal(true);
            } else if ('ai_error' in response) {
              // Partial success: Entry saved but AI failed
              setModalTitle('Entry Saved (AI Error)');
              setModalContent(`Your entry was saved, but AI response failed: ${response.ai_error}`);
              setModalType('default');
              setShowCopyButton(false);
              setShowModal(true);
            }

          } else {
            console.log('Anonymous user requesting AI response:', helpType);

            // Call LLM service for anonymous users (no save, just AI response)
            const response = await getAIResponse(journalContent, helpType);

            console.log('AI response for anonymous user:', response);

            // Show AI response
            setModalTitle(RESPONSE_TITLES[helpType] ?? 'From your companion');
            setModalContent(response.ai_response);
            setModalType('response');
            setShowCopyButton(true);
            setShowModal(true);
          }
    
      // Clear form after submission
      setJournalTitle('');
      setJournalContent('');

    } catch (error) {
      console.error('Error submitting journal entry:', error);

      setModalTitle('Error');
      setModalContent(
        error instanceof Error
        ? error.message
        : 'Failed to submit your entry. Please try again.'
      );

      setModalType('default');
      setShowCopyButton(false);
      setShowModal(true);
    } finally {
      setIsSubmitting(false);
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

  const handleAuthSuccess = (user: any): void => {
    login(user);
    setShowModal(false);
  };

  const helpCards = [
    {
      type: 'acute_validation' as HelpType,
      icon: Ear,
      chip: 'bg-sky-soft text-sky-deep',
      title: 'Just Listen',
      caption: 'I need someone to hear me',
      show: true,
    },
    {
      type: 'acute_skills' as HelpType,
      icon: Sparkles,
      chip: 'bg-sage-soft text-sage-deep',
      title: 'Quick Help',
      caption: 'I need coping techniques now',
      show: true,
    },
    {
      type: 'chronic_validation' as HelpType,
      icon: Sprout,
      chip: 'bg-lav-soft text-lav-deep',
      title: 'Ongoing Support',
      caption: 'Support for long-term issues',
      show: isLoggedIn,
    },
    {
      type: 'chronic_education' as HelpType,
      icon: Waves,
      chip: 'bg-dawn-soft text-dawn-deep',
      title: 'Learn Patterns',
      caption: 'Help me understand trends',
      show: isLoggedIn,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-12">
        <Header
          onProfileClick={onProfileClick}
          onLoginClick={handleLoginClick}
        />
      </div>

      <ContentModal
        show={showModal}
        onClose={() => setShowModal(false)}
        title={modalTitle}
        content={modalContent}
        showCopyButton={showCopyButton}
        type={modalType}
        onAuthSuccess={handleAuthSuccess}
      />

      <div className="flex flex-wrap gap-4 justify-between items-end mb-8">
        <div>
          <h1 className="font-display font-light text-4xl text-ink">
            How are you feeling <em className="text-dawn-deep">today</em>?
          </h1>
          <p className="mt-2 text-ink-soft">
            This is your space. Take a breath, and write at your own pace.
          </p>
        </div>
        {isLoggedIn ? (
          <button
            onClick={() => handleSubmit('save_only')}
            disabled={!journalContent.trim() || isSubmitting}
            className="px-6 py-2.5 rounded-full bg-white/70 text-ink-soft hover:text-ink ring-1 ring-ink/10 hover:ring-ink/20 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving…' : 'Save quietly'}
          </button>
        ) : (
          <button
            onClick={handleShowSampleText}
            className="px-6 py-2.5 rounded-full bg-white/70 text-ink-soft hover:text-ink ring-1 ring-ink/10 hover:ring-ink/20 transition-all cursor-pointer"
          >
            Show me an example
          </button>
        )}
      </div>

      {/* Journal Entry Form */}
      <div className="bg-card rounded-3xl shadow-soft ring-1 ring-ink/5 p-8 sm:p-10 mb-8">
        {/* Optional Title */}
        <input
          type="text"
          placeholder="A title, if one comes to mind…"
          value={journalTitle}
          onChange={(e) => setJournalTitle(e.target.value)}
          className="w-full pb-3 mb-6 font-display text-2xl text-ink bg-transparent border-b border-ink/10 focus:border-dawn/50 focus:outline-none transition-colors placeholder:italic"
        />

        {/* Main Text Area */}
        <textarea
          placeholder="Start writing about your day, your thoughts, your feelings…"
          value={journalContent}
          onChange={(e) => setJournalContent(e.target.value)}
          rows={12}
          className="w-full font-display text-lg text-ink leading-loose bg-transparent resize-none focus:outline-none placeholder:italic"
        />
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {helpCards.filter(card => card.show).map(({ type, icon: Icon, chip, title, caption }) => (
          <button
            key={type}
            onClick={() => handleSubmit(type)}
            disabled={!journalContent.trim() || isSubmitting}
            className="p-5 text-left bg-card rounded-2xl ring-1 ring-ink/5 shadow-soft hover:shadow-lift hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-soft"
          >
            <div className={`w-9 h-9 mb-3 rounded-full flex items-center justify-center ${chip}`}>
              <Icon size={18} strokeWidth={1.75} />
            </div>
            <div className="font-medium text-ink mb-0.5">{title}</div>
            <div className="text-sm text-ink-soft leading-snug">{caption}</div>
          </button>
        ))}
      </div>

      {/* Writing overlay — dusk clouds while the reflection is composed */}
      {isSubmitting && (
        <div className="fade-in fixed inset-0 z-40 dusk-veil backdrop-blur-sm">
          <Clouds variant="dusk" />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="rise-in bg-card rounded-3xl shadow-lift px-10 py-9 flex flex-col items-center">
              <div className="relative bg-mist rounded-2xl px-5 pt-6 pb-5 w-48">
                <Feather
                  size={22}
                  strokeWidth={1.75}
                  className="write-nib absolute -top-2.5 right-4 text-dawn-deep"
                />
                <span className="write-line" style={{ width: '100%' }} />
                <span className="write-line mt-2.5" style={{ width: '84%', animationDelay: '0.45s' }} />
                <span className="write-line mt-2.5" style={{ width: '62%', animationDelay: '0.9s' }} />
              </div>
              <span className="mt-5 text-ink-soft text-sm">Reflecting on your words…</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JournalPage;