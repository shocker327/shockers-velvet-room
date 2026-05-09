import { useState, useRef, useEffect } from 'react';
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

export default function ChatInterface({ companionId, companionName, companionAvatar, gradient }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userId = getUserId();

  // Load chat history
  const { data: history } = trpc.getChatHistory.useQuery({
    userId,
    companionId,
    limit: 50,
  });

  const sendMutation = trpc.sendMessage.useMutation();
  const clearMutation = trpc.clearChat.useMutation();

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
        <button
          onClick={handleClear}
          className="text-xs text-gray-400 hover:text-red-400 transition-colors px-3 py-1 border border-gray-700 rounded"
        >
          Clear Chat
        </button>
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
