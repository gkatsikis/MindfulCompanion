import React, { useEffect, useRef, useState } from 'react';
import Markdown from 'react-markdown';
import {
  Ear, Sparkles, Sprout, Waves, Feather, Lock, Copy, Check, HeartHandshake,
} from 'lucide-react';
import type { HelpType } from '../types';
import type { User } from '../contexts/authContext';
import Header from '../components/Header';
import ContentModal from '../components/ContentModal';
import Clouds from '../components/Clouds';
import { useAuth } from '../contexts/useAuth';
import { createJournalEntry } from '../services/journalService';
import { getAIResponse, getAIResponseWithSave } from '../services/llmService';

// The response title answers the help the user asked for
const RESPONSE_TITLES: Partial<Record<HelpType, string>> = {
  acute_validation: 'We hear you',
  acute_skills: 'Something to try',
  chronic_validation: 'Walking with you',
  chronic_education: 'What your entries show',
};

const HELP_CARDS: {
  type: HelpType;
  icon: typeof Ear;
  chip: string;
  title: string;
  caption: string;
  needsAccount: boolean;
}[] = [
  { type: 'acute_validation', icon: Ear, chip: 'bg-sky-soft text-sky-deep', title: 'Just listen', caption: 'I need someone to hear me', needsAccount: false },
  { type: 'acute_skills', icon: Sparkles, chip: 'bg-sage-soft text-sage-deep', title: 'Quick help', caption: 'I need coping techniques now', needsAccount: false },
  { type: 'chronic_validation', icon: Sprout, chip: 'bg-lav-soft text-lav-deep', title: 'Ongoing support', caption: 'Support for long-term struggles', needsAccount: true },
  { type: 'chronic_education', icon: Waves, chip: 'bg-dawn-soft text-dawn-strong', title: 'Learn patterns', caption: 'Help me understand my trends', needsAccount: true },
];

const SAMPLE_ENTRY = {
  title: 'A heavy morning',
  content:
    "Today I woke up sad. I felt hopeless and wasn't sure how to change my life. I got through the morning, but everything took twice the effort it should have.",
};

// Drafts survive reloads on this device; nothing leaves the browser until the writer chooses.
const DRAFT_KEY = 'mindful-companion:draft';
type Draft = { title: string; content: string };
const EMPTY_DRAFT: Draft = { title: '', content: '' };

const readDraft = (): Draft => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) return { ...EMPTY_DRAFT, ...JSON.parse(raw) };
  } catch {
    /* storage unavailable (private mode, blocked) — start blank */
  }
  return EMPTY_DRAFT;
};

const writeDraft = (draft: Draft) => {
  try {
    if (draft.title || draft.content) localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    else localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* storage unavailable — the in-memory draft still works */
  }
};

interface Reflection {
  title: string;
  body: string;
  helpType: HelpType;
  saved: boolean;
}

const primaryButton =
  'inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-dawn-strong hover:bg-dawn-stronger text-white shadow-soft hover:shadow-lift transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
const secondaryButton =
  'inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-card/70 text-ink-soft hover:text-ink ring-1 ring-ink/10 hover:ring-ink/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

const JournalPage: React.FC = () => {
  const { isLoggedIn, login } = useAuth();

  const [draft, setDraft] = useState<Draft>(readDraft);
  const [reflection, setReflection] = useState<Reflection | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [whisper, setWhisper] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [copied, setCopied] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const reflectionRef = useRef<HTMLElement>(null);

  const hasText = draft.content.trim().length > 0;

  useEffect(() => writeDraft(draft), [draft]);

  useEffect(() => {
    if (reflection) reflectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [reflection]);

  useEffect(() => {
    if (!whisper) return;
    const id = setTimeout(() => setWhisper(null), 2800);
    return () => clearTimeout(id);
  }, [whisper]);

  const setTitle = (title: string) => setDraft((d) => ({ ...d, title }));
  const setContent = (content: string) => setDraft((d) => ({ ...d, content }));

  const startFresh = () => {
    setDraft(EMPTY_DRAFT);
    setReflection(null);
    setError(null);
    setHint(null);
    textareaRef.current?.focus();
  };

  const useExample = () => {
    setDraft(SAMPLE_ENTRY);
    setReflection(null);
    setWhisper('Example added — edit it, or choose what would help.');
    textareaRef.current?.focus();
  };

  const requestReflection = async (helpType: HelpType) => {
    if (!hasText) {
      setHint('Write a few words first, then choose.');
      textareaRef.current?.focus();
      return;
    }
    setHint(null);
    setError(null);
    setIsSubmitting(true);
    const title = RESPONSE_TITLES[helpType] ?? 'From your companion';

    try {
      if (isLoggedIn) {
        const response = await getAIResponseWithSave(draft.content, helpType, draft.title || undefined);
        if ('ai_response' in response) {
          setReflection({ title, body: response.ai_response, helpType, saved: true });
        } else {
          setError('Your entry was saved, but a reflection could not be written just now. You can try again.');
        }
        writeDraft(EMPTY_DRAFT); // kept server-side now; the local copy would only invite a duplicate
      } else {
        const response = await getAIResponse(draft.content, helpType);
        setReflection({ title, body: response.ai_response, helpType, saved: false });
      }
    } catch (err) {
      console.error('Error requesting reflection:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong. Your words are still here — please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveQuietly = async () => {
    if (!hasText) return;
    setIsSaving(true);
    setError(null);
    try {
      await createJournalEntry({
        title: draft.title,
        content: draft.content,
        requested_help_type: null,
        is_continuation: false,
        references_past_entries: false,
      });
      startFresh();
      setWhisper('Saved to your journal.');
    } catch (err) {
      console.error('Error saving entry:', err);
      setError(err instanceof Error ? err.message : 'Your entry could not be saved. It is still here — please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Signing in from a reflection keeps the entry that prompted it
  const handleAuthSuccess = async (user: User) => {
    login(user);
    setShowAuth(false);
    if (reflection && !reflection.saved && hasText) {
      try {
        await createJournalEntry({
          title: draft.title,
          content: draft.content,
          requested_help_type: reflection.helpType,
          is_continuation: false,
          references_past_entries: false,
        });
        setReflection({ ...reflection, saved: true });
        writeDraft(EMPTY_DRAFT);
        setWhisper('Saved to your journal.');
      } catch (err) {
        console.error('Error keeping entry after sign-in:', err);
        setError('You are signed in, but this entry could not be saved yet. Use "Save quietly" to try again.');
      }
    }
  };

  const copyReflection = async () => {
    if (!reflection) return;
    try {
      await navigator.clipboard.writeText(reflection.body);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-12">
        <Header onLoginClick={() => setShowAuth(true)} />
      </div>

      <ContentModal
        show={showAuth}
        onClose={() => setShowAuth(false)}
        title="Welcome to Mindful Companion"
        type="auth"
        onAuthSuccess={handleAuthSuccess}
      />

      <div className="flex flex-wrap gap-4 justify-between items-end mb-8">
        <div className="max-w-xl">
          <h1 className="font-display font-light text-4xl text-ink">
            How are you feeling <em className="text-dawn-deep">today</em>?
          </h1>
          <p className="mt-2 text-ink-soft">
            This is your space. Write at your own pace — when you're ready, choose the kind of
            support you'd like and a reflection will follow.
          </p>
        </div>
      </div>

      {/* Writing surface: focus shows on the card, not as a ring inside it */}
      <div className="bg-card rounded-3xl shadow-soft ring-1 ring-ink/5 focus-within:ring-2 focus-within:ring-sky/40 transition-shadow p-6 sm:p-10 mb-6">
        <label htmlFor="entry-title" className="sr-only">Title</label>
        <input
          id="entry-title"
          type="text"
          placeholder="A title, if one comes to mind…"
          value={draft.title}
          onChange={(e) => setTitle(e.target.value)}
          className="writing-field w-full pb-3 mb-6 font-display text-xl sm:text-2xl text-ink bg-transparent border-b border-ink/10 focus:border-dawn/50 transition-colors placeholder:italic"
        />
        <label htmlFor="entry-body" className="sr-only">Journal entry</label>
        <textarea
          id="entry-body"
          ref={textareaRef}
          placeholder="Start writing about your day, your thoughts, your feelings…"
          value={draft.content}
          onChange={(e) => setContent(e.target.value)}
          className="writing-field w-full min-h-40 field-sizing-content font-display text-lg text-ink leading-loose bg-transparent resize-none placeholder:italic"
        />
        {(hasText || isLoggedIn) && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-ink-soft">{hasText && 'Draft kept on this device'}</span>
            {isLoggedIn && (
              <button onClick={saveQuietly} disabled={!hasText || isSaving || isSubmitting} className={secondaryButton}>
                {isSaving ? 'Saving…' : 'Save quietly'}
              </button>
            )}
          </div>
        )}
        {!hasText && (
          <p className="mt-4 text-sm text-ink-soft">
            Not sure where to start?{' '}
            <button
              onClick={useExample}
              className="underline decoration-ink/30 hover:decoration-ink hover:text-ink transition-colors cursor-pointer"
            >
              Try an example
            </button>
          </p>
        )}
      </div>

      {error && (
        <div role="alert" className="rise-in bg-alert-soft ring-1 ring-alert/20 text-alert px-5 py-4 rounded-2xl mb-6">
          {error}
        </div>
      )}

      {reflection && (
        <section
          ref={reflectionRef}
          aria-labelledby="reflection-title"
          className="rise-in bg-card rounded-3xl shadow-soft ring-1 ring-ink/5 p-6 sm:p-10 mb-6 scroll-mt-6"
        >
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <p className="text-xs uppercase tracking-widest text-ink-soft">From your companion</p>
              <h2 id="reflection-title" className="font-display text-2xl font-light text-ink mt-1">
                {reflection.title}
              </h2>
            </div>
            <button
              onClick={copyReflection}
              className={`shrink-0 p-2.5 rounded-full transition-all cursor-pointer ${
                copied ? 'bg-ink text-paper' : 'text-ink-soft hover:text-ink hover:bg-mist'
              }`}
              aria-label={copied ? 'Copied' : 'Copy reflection'}
            >
              {copied ? <Check size={18} strokeWidth={2} /> : <Copy size={18} strokeWidth={1.75} />}
            </button>
          </div>

          <div className="prose-calm">
            <Markdown>{reflection.body}</Markdown>
          </div>

          <div className="mt-8 pt-6 border-t border-ink/5 flex flex-wrap items-center justify-between gap-4">
            <p className="flex items-start gap-2 text-sm text-ink-soft max-w-sm">
              <HeartHandshake size={18} strokeWidth={1.75} className="text-sky-deep shrink-0 mt-0.5" />
              <span>Written with care by AI. Not a replacement for professional mental health support.</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {reflection.saved ? (
                <span className="self-center text-sm text-ink-soft">Saved to your journal</span>
              ) : (
                <button onClick={() => setShowAuth(true)} className={primaryButton}>
                  Sign in to keep this entry
                </button>
              )}
              <button onClick={startFresh} className={secondaryButton}>
                Write something new
              </button>
            </div>
          </div>
        </section>
      )}

      <section aria-labelledby="help-title" className="mb-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 mb-4">
          <h2 id="help-title" className="font-display font-light text-2xl text-ink">
            {reflection ? 'Ask in a different way' : "When you're ready — what would help?"}
          </h2>
          <p role="status" aria-live="polite" className="text-sm text-dawn-strong min-h-5">
            {hint}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {HELP_CARDS.map(({ type, icon: Icon, chip, title, caption, needsAccount }) => {
            const locked = needsAccount && !isLoggedIn;
            return (
              <button
                key={type}
                onClick={() => (locked ? setShowAuth(true) : requestReflection(type))}
                disabled={isSubmitting}
                aria-disabled={!hasText && !locked}
                className={`p-5 flex flex-col items-start text-left rounded-2xl transition-all cursor-pointer disabled:cursor-wait ${
                  locked
                    ? 'bg-card/70 ring-1 ring-ink/5 opacity-80 hover:opacity-100 hover:shadow-soft'
                    : 'bg-card ring-1 ring-ink/5 shadow-soft hover:shadow-lift hover:-translate-y-0.5'
                }`}
              >
                <div className={`relative w-9 h-9 mb-3 rounded-full flex items-center justify-center ${locked ? 'bg-mist text-ink-soft' : chip}`}>
                  <Icon size={18} strokeWidth={2} />
                  {locked && (
                    <span className="absolute -right-1 -bottom-1 w-4.5 h-4.5 rounded-full bg-ink text-paper flex items-center justify-center ring-2 ring-card">
                      <Lock size={9} strokeWidth={2.5} />
                    </span>
                  )}
                </div>
                <div className="font-medium text-ink mb-0.5">{title}</div>
                <div className="text-sm text-ink-soft leading-snug">
                  {locked ? 'Sign in to unlock' : caption}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {whisper && (
        <div role="status" className="fade-in fixed bottom-6 inset-x-0 z-30 flex justify-center pointer-events-none px-4">
          <span className="bg-ink text-paper text-sm px-4 py-2 rounded-full shadow-lift">{whisper}</span>
        </div>
      )}

      {/* Writing overlay — dusk clouds while the reflection is composed */}
      {isSubmitting && (
        <div className="fade-in fixed inset-0 z-40 dusk-veil backdrop-blur-sm" role="status" aria-live="polite">
          <Clouds variant="dusk" />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="rise-in bg-card rounded-3xl shadow-lift px-10 py-9 flex flex-col items-center">
              <div className="relative bg-mist rounded-2xl px-5 pt-6 pb-5 w-48">
                <Feather size={22} strokeWidth={1.75} className="write-nib absolute -top-2.5 right-4 text-dawn-deep" />
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
