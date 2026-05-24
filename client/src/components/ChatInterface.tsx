import { useState, useRef, useEffect, useCallback } from 'react';
import { trpc } from '../utils/trpc';
import { getUserId } from '../utils/anonymousUser';

interface Message {
  role: string;
  content: string;
  image?: string | null;
  isDaily?: boolean;
}

interface ChatInterfaceProps {
  companionId: string;
  companionName: string;
  companionAvatar: string;
  gradient: string;
  theme?: string;
}

// ─── Theme backgrounds for each companion ───────────────────────────────────
const themeBackgrounds: Record<string, string> = {
  'zen-garden':
    'bg-gradient-to-b from-emerald-950/80 via-teal-950/60 to-velvet-dark',
  'modern-lounge':
    'bg-gradient-to-b from-orange-950/70 via-red-950/50 to-velvet-dark',
  'moonlit-garden':
    'bg-gradient-to-b from-indigo-950/80 via-purple-950/60 to-velvet-dark',
  'luxury-office':
    'bg-gradient-to-b from-rose-950/70 via-zinc-950/60 to-velvet-dark',
};

// ─── Background image mapping (generated on first deploy) ───────────────────
const themeBackgroundImages: Record<string, string> = {
  'zen-garden': '/backgrounds/serena-bg.png',
  'modern-lounge': '/backgrounds/alex-bg.png',
  'moonlit-garden': '/backgrounds/luna-bg.png',
  'luxury-office': '/backgrounds/victoria-bg.png',
};

const themeOverlays: Record<string, React.CSSProperties> = {
  'zen-garden': {
    background:
      'radial-gradient(ellipse at 50% 20%, rgba(16,185,129,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(20,184,166,0.08) 0%, transparent 50%)',
  },
  'modern-lounge': {
    background:
      'radial-gradient(ellipse at 30% 30%, rgba(249,115,22,0.10) 0%, transparent 60%), radial-gradient(ellipse at 70% 70%, rgba(239,68,68,0.06) 0%, transparent 50%)',
  },
  'moonlit-garden': {
    background:
      'radial-gradient(ellipse at 50% 10%, rgba(129,140,248,0.15) 0%, transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(168,85,247,0.08) 0%, transparent 50%)',
  },
  'luxury-office': {
    background:
      'radial-gradient(ellipse at 60% 20%, rgba(244,63,94,0.10) 0%, transparent 50%), radial-gradient(ellipse at 40% 80%, rgba(161,161,170,0.06) 0%, transparent 50%)',
  },
};

// ─── Helper: get time of day ─────────────────────────────────────────────────
function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

// ─── Image Lightbox ──────────────────────────────────────────────────────────
function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 text-white/70 hover:text-white text-3xl font-light"
        onClick={onClose}
      >
        &times;
      </button>
      <img
        src={src}
        alt="Companion photo"
        className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

// ─── Companion Photo ─────────────────────────────────────────────────────────
function CompanionPhoto({ src }: { src: string }) {
  const [showLightbox, setShowLightbox] = useState(false);

  return (
    <>
      <div
        className="mt-2 cursor-pointer group"
        onClick={() => setShowLightbox(true)}
      >
        <div className="relative inline-block rounded-xl overflow-hidden border-2 border-velvet-gold/30 shadow-lg hover:border-velvet-gold/60 transition-all duration-300">
          <img
            src={src}
            alt="Companion selfie"
            className="max-w-[280px] max-h-[280px] object-cover"
            loading="lazy"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
            <span className="text-xs text-white/80 font-heading">tap to view</span>
          </div>
        </div>
      </div>
      {showLightbox && <Lightbox src={src} onClose={() => setShowLightbox(false)} />}
    </>
  );
}

// ─── Relationship Indicator ──────────────────────────────────────────────────
function RelationshipIndicator({ userId, companionId }: { userId: string; companionId: string }) {
  const { data } = trpc.getRelationshipStatus.useQuery({ userId, companionId });

  if (!data) return null;

  const { level, label, messageCount, nextLevelAt } = data;
  const progress = nextLevelAt
    ? Math.min(100, (messageCount / nextLevelAt) * 100)
    : 100;

  const heartColors = [
    'text-gray-400',
    'text-pink-400',
    'text-rose-500',
    'text-red-500',
  ];

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-velvet-dark/50 rounded-lg border border-purple-800/20">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4].map((l) => (
          <span
            key={l}
            className={`text-xs transition-all duration-500 ${
              l <= level ? heartColors[level - 1] : 'text-gray-700'
            } ${l === level ? 'animate-pulse' : ''}`}
          >
            &#9829;
          </span>
        ))}
      </div>
      <span className="text-xs text-gray-400">{label}</span>
      {nextLevelAt && (
        <div className="w-12 h-1 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-600 to-velvet-gold rounded-full transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

// ─── Audio Button Component ──────────────────────────────────────────────────
function AudioButton({ text, companionId }: { text: string; companionId: string }) {
  const [state, setState] = useState<'idle' | 'loading' | 'playing'>('idle');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ttsMutation = trpc.textToSpeech.useMutation();

  const handleClick = useCallback(async () => {
    if (state === 'playing' && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setState('idle');
      return;
    }

    if (audioUrl) {
      playAudio(audioUrl);
      return;
    }

    setState('loading');
    try {
      const result = await ttsMutation.mutateAsync({ text, companionId });
      const url = `data:audio/mp3;base64,${result.audio}`;
      setAudioUrl(url);
      playAudio(url);
    } catch (err) {
      setState('idle');
    }
  }, [state, audioUrl, text, companionId]);

  const playAudio = (url: string) => {
    const audio = new Audio(url);
    audioRef.current = audio;
    setState('playing');
    audio.play();
    audio.onended = () => setState('idle');
    audio.onerror = () => setState('idle');
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return (
    <button
      onClick={handleClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        padding: '6px 12px',
        borderRadius: '9999px',
        border: '1px solid #d4af37',
        backgroundColor: state === 'playing' ? 'rgba(212,175,55,0.25)' : 'rgba(212,175,55,0.1)',
        color: '#d4af37',
        fontSize: '12px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s',
        minWidth: '36px',
        minHeight: '32px',
      }}
      title={state === 'playing' ? 'Stop' : 'Listen to her voice'}
    >
      {state === 'loading' ? (
        <>
          <svg style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} fill="none" viewBox="0 0 24 24">
            <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Loading...</span>
        </>
      ) : state === 'playing' ? (
        <>
          <svg style={{ width: '16px', height: '16px' }} fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="6" width="12" height="12" rx="1" />
          </svg>
          <span>Stop</span>
        </>
      ) : (
        <>
          <svg style={{ width: '16px', height: '16px' }} fill="currentColor" viewBox="0 0 24 24">
            <path d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 010 7.07l-1.41-1.41a3 3 0 000-4.24l1.41-1.42zM19.07 4.93a10 10 0 010 14.14l-1.41-1.41a8 8 0 000-11.32l1.41-1.41z" />
          </svg>
          <span>Listen</span>
        </>
      )}
    </button>
  );
}

// ─── Daily Message Banner ────────────────────────────────────────────────────
function DailyMessageBanner({ message, companionName }: { message: string; companionName: string }) {
  return (
    <div className="mx-4 mb-4 p-4 bg-gradient-to-r from-velvet-gold/10 to-purple-900/20 border border-velvet-gold/30 rounded-xl animate-fade-in">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-velvet-gold text-xs font-bold uppercase tracking-wider">New Message</span>
        <span className="text-gray-500 text-xs">from {companionName}</span>
      </div>
      <p className="text-gray-200 text-sm italic leading-relaxed">&ldquo;{message}&rdquo;</p>
    </div>
  );
}

// ─── Main Chat Interface ─────────────────────────────────────────────────────
export default function ChatInterface({ companionId, companionName, companionAvatar, gradient, theme }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPhoto, setIsGeneratingPhoto] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userId = getUserId();

  const bgClass = theme ? themeBackgrounds[theme] || '' : '';
  const overlayStyle = theme ? themeOverlays[theme] || {} : {};

  const { data: history } = trpc.getChatHistory.useQuery({
    userId,
    companionId,
    limit: 50,
  });

  // Fetch daily message
  const { data: dailyMessage } = trpc.getDailyMessage.useQuery({
    userId,
    companionId,
    timeOfDay: getTimeOfDay(),
  });

  const sendMutation = trpc.sendMessage.useMutation();
  const clearMutation = trpc.clearChat.useMutation();
  const generateImageMutation = trpc.generateImage.useMutation();
  const markReadMutation = trpc.markDailyRead.useMutation();
  const utils = trpc.useUtils();

  // Mark daily message as read when chat opens
  useEffect(() => {
    if (dailyMessage && !dailyMessage.isRead) {
      markReadMutation.mutate({ userId, companionId });
      // Invalidate unread counts so header/gallery update
      utils.getUnreadCount.invalidate({ userId });
      utils.getUnreadPerCompanion.invalidate({ userId });
    }
  }, [dailyMessage]);

  useEffect(() => {
    if (history) {
      setMessages(history.map((m) => ({ role: m.role, content: m.content })));
    }
  }, [history]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await sendMutation.mutateAsync({
        userId,
        companionId,
        message: userMessage,
      });
      setMessages((prev) => [
        ...prev,
        { role: response.role, content: response.content, image: response.image },
      ]);
      utils.getRelationshipStatus.invalidate({ userId, companionId });
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Something went wrong. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestPhoto = async () => {
    if (isGeneratingPhoto || isLoading) return;
    setIsGeneratingPhoto(true);

    try {
      const result = await generateImageMutation.mutateAsync({
        userId,
        companionId,
      });
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Here's a photo just for you... 💋`,
          image: result.imageUrl,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'I tried to send you a photo but something went wrong. Try asking me again!' },
      ]);
    } finally {
      setIsGeneratingPhoto(false);
    }
  };

  const handleClear = async () => {
    await clearMutation.mutateAsync({ userId, companionId });
    setMessages([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const bgImageUrl = theme ? themeBackgroundImages[theme] : undefined;

  return (
    <div className={`relative flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto ${bgClass}`}>
      {/* Full background image of companion */}
      {bgImageUrl && (
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${bgImageUrl})`,
            opacity: 0.35,
          }}
        />
      )}
      {/* Dark overlay to ensure readability */}
      {bgImageUrl && (
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/40 via-black/50 to-black/70" />
      )}
      {/* Atmospheric color overlay */}
      {theme && (
        <div className="absolute inset-0 pointer-events-none z-0" style={overlayStyle} />
      )}

      {/* Chat Header */}
      <div className="relative z-10 flex items-center justify-between p-4 border-b border-purple-800/30 bg-velvet-dark/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-lg`}>
            {companionAvatar}
          </div>
          <div>
            <h2 className="font-heading text-lg font-bold text-velvet-gold">{companionName}</h2>
            <span className="text-xs text-green-400">&#9679; Online</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <RelationshipIndicator userId={userId} companionId={companionId} />
          <button
            onClick={handleClear}
            className="text-xs text-gray-400 hover:text-red-400 transition-colors px-3 py-1 border border-gray-700 rounded"
          >
            Clear Chat
          </button>
        </div>
      </div>

      {/* Daily Message Banner */}
      {dailyMessage && dailyMessage.message && (
        <div className="relative z-10">
          <DailyMessageBanner message={dailyMessage.message} companionName={companionName} />
        </div>
      )}

      {/* Messages */}
      <div className="relative z-10 flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-20">
            <div className="text-4xl mb-4">{companionAvatar}</div>
            <p className="font-heading text-xl text-velvet-gold mb-2">
              Start a conversation with {companionName}
            </p>
            <p className="text-sm">Say hello and see where the conversation takes you...</p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`message-enter flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-purple-800/50 backdrop-blur-sm text-white'
                  : 'bg-velvet-mid/80 backdrop-blur-sm border border-purple-800/30 text-gray-200'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              {msg.image && <CompanionPhoto src={msg.image} />}
              {msg.role === 'assistant' && (
                <div className="mt-2 flex justify-end">
                  <AudioButton text={msg.content} companionId={companionId} />
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-velvet-mid/80 backdrop-blur-sm border border-purple-800/30 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-velvet-gold rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-velvet-gold rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-velvet-gold rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
        {isGeneratingPhoto && (
          <div className="flex justify-start">
            <div className="bg-velvet-mid/80 backdrop-blur-sm border border-purple-800/30 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <svg className="w-4 h-4 animate-spin text-velvet-gold" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Taking a photo for you...
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="relative z-10 p-4 border-t border-purple-800/30 bg-velvet-dark/60 backdrop-blur-md">
        <div className="flex gap-3">
          <button
            onClick={handleRequestPhoto}
            disabled={isGeneratingPhoto || isLoading}
            className="flex items-center justify-center w-12 h-12 rounded-xl bg-velvet-mid border border-purple-800/30 text-velvet-gold hover:bg-velvet-gold/10 hover:border-velvet-gold/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Request a photo"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
            </svg>
          </button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${companionName}...`}
            rows={1}
            className="flex-1 bg-velvet-mid border border-purple-800/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-velvet-gold/50 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="btn-gold px-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>

      {/* Inline keyframe for spinner (AudioButton) */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
