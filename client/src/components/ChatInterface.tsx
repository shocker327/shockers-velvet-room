import { useState, useRef, useEffect, useCallback } from 'react';
import { trpc } from '../utils/trpc';
import { getUserId } from '../utils/anonymousUser';

interface Message {
  role: string;
  content: string;
}

interface ChatInterfaceProps {
  companionId: string;
  companionName: string;
  companionAvatar: string;
  gradient: string;
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
    'text-gray-400',     // level 1
    'text-pink-400',     // level 2
    'text-rose-500',     // level 3
    'text-red-500',      // level 4
  ];

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-velvet-dark/50 rounded-lg border border-purple-800/20">
      {/* Hearts based on level */}
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4].map((l) => (
          <span
            key={l}
            className={`text-xs transition-all duration-500 ${
              l <= level ? heartColors[level - 1] : 'text-gray-700'
            } ${l === level ? 'animate-pulse' : ''}`}
          >
            ♥
          </span>
        ))}
      </div>
      {/* Label */}
      <span className="text-xs text-gray-400">{label}</span>
      {/* Progress bar to next level */}
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
      className={`inline-flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200 ${
        state === 'idle'
          ? 'text-velvet-gold hover:bg-velvet-gold/10'
          : state === 'loading'
          ? 'text-velvet-gold animate-pulse'
          : 'text-velvet-gold bg-velvet-gold/20 animate-pulse'
      }`}
      title={state === 'playing' ? 'Stop' : 'Listen'}
    >
      {state === 'loading' ? (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : state === 'playing' ? (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <rect x="6" y="6" width="12" height="12" rx="1" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 010 7.07l-1.41-1.41a3 3 0 000-4.24l1.41-1.42zM19.07 4.93a10 10 0 010 14.14l-1.41-1.41a8 8 0 000-11.32l1.41-1.41z" />
        </svg>
      )}
    </button>
  );
}

// ─── Main Chat Interface ─────────────────────────────────────────────────────
export default function ChatInterface({ companionId, companionName, companionAvatar, gradient }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userId = getUserId();

  const { data: history } = trpc.getChatHistory.useQuery({
    userId,
    companionId,
    limit: 50,
  });

  const sendMutation = trpc.sendMessage.useMutation();
  const clearMutation = trpc.clearChat.useMutation();
  const utils = trpc.useUtils();

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
      setMessages((prev) => [...prev, { role: response.role, content: response.content }]);
      // Refresh relationship status after each message
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

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-purple-800/30">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-lg`}>
            {companionAvatar}
          </div>
          <div>
            <h2 className="font-heading text-lg font-bold text-velvet-gold">{companionName}</h2>
            <span className="text-xs text-green-400">● Online</span>
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                  ? 'bg-purple-800/50 text-white'
                  : 'bg-velvet-mid border border-purple-800/30 text-gray-200'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
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
            <div className="bg-velvet-mid border border-purple-800/30 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-velvet-gold rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-velvet-gold rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-velvet-gold rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-purple-800/30">
        <div className="flex gap-3">
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
    </div>
  );
}
