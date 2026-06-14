import { useState, useRef, useEffect, useCallback } from 'react';

interface VoiceNoteBubbleProps {
  audioBase64: string;
  duration: number;
  companionName: string;
  text: string;
  onPlay?: () => void;
}

export default function VoiceNoteBubble({
  audioBase64,
  duration,
  companionName,
  text,
  onPlay,
}: VoiceNoteBubbleProps) {
  const [state, setState] = useState<'idle' | 'playing' | 'paused'>('idle');
  const [currentTime, setCurrentTime] = useState(0);
  const [actualDuration, setActualDuration] = useState(duration);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const [waveformBars] = useState(() =>
    Array.from({ length: 28 }, () => Math.random() * 0.7 + 0.3)
  );

  const audioUrl = `data:audio/mp3;base64,${audioBase64}`;

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.addEventListener('loadedmetadata', () => {
      if (audio.duration && isFinite(audio.duration)) {
        setActualDuration(audio.duration);
      }
    });

    audio.addEventListener('ended', () => {
      setState('idle');
      setCurrentTime(0);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    });

    return () => {
      audio.pause();
      audio.src = '';
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioUrl]);

  const updateProgress = useCallback(() => {
    if (audioRef.current && state === 'playing') {
      setCurrentTime(audioRef.current.currentTime);
      animationRef.current = requestAnimationFrame(updateProgress);
    }
  }, [state]);

  useEffect(() => {
    if (state === 'playing') {
      animationRef.current = requestAnimationFrame(updateProgress);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [state, updateProgress]);

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (state === 'playing') {
      audio.pause();
      setState('paused');
    } else {
      if (state === 'idle') {
        audio.currentTime = 0;
        onPlay?.();
      }
      audio.play().catch(() => setState('idle'));
      setState('playing');
    }
  };

  const progress = actualDuration > 0 ? currentTime / actualDuration : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex justify-start message-enter">
      <div className="max-w-[85%] sm:max-w-[70%]">
        {/* Voice note label */}
        <div className="flex items-center gap-2 mb-1 px-1">
          <svg className="w-3.5 h-3.5 text-velvet-gold" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
          <span className="text-xs text-velvet-gold font-semibold uppercase tracking-wider">
            Voice Note
          </span>
          <span className="text-xs text-gray-500">from {companionName}</span>
        </div>

        {/* Voice note bubble */}
        <div className="bg-gradient-to-r from-velvet-gold/15 to-purple-900/30 backdrop-blur-sm border border-velvet-gold/40 rounded-2xl rounded-tl-sm px-4 py-3 shadow-lg shadow-velvet-gold/5">
          <div className="flex items-center gap-3">
            {/* Play/Pause button */}
            <button
              onClick={togglePlayback}
              className="flex-shrink-0 w-10 h-10 rounded-full bg-velvet-gold/20 border border-velvet-gold/50 flex items-center justify-center hover:bg-velvet-gold/30 transition-all duration-200 group"
            >
              {state === 'playing' ? (
                <svg className="w-4 h-4 text-velvet-gold" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-velvet-gold ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Waveform visualization */}
            <div className="flex-1 flex items-center gap-[2px] h-8">
              {waveformBars.map((height, i) => {
                const barProgress = i / waveformBars.length;
                const isActive = barProgress <= progress;
                const isCurrentBar =
                  state === 'playing' &&
                  Math.abs(barProgress - progress) < 1 / waveformBars.length;

                return (
                  <div
                    key={i}
                    className={`flex-1 rounded-full transition-all duration-150 ${
                      isActive
                        ? 'bg-velvet-gold'
                        : 'bg-gray-600/60'
                    } ${isCurrentBar ? 'scale-y-110' : ''}`}
                    style={{
                      height: `${height * 100}%`,
                      minHeight: '4px',
                      opacity: isActive ? 1 : 0.5,
                    }}
                  />
                );
              })}
            </div>

            {/* Duration */}
            <span className="flex-shrink-0 text-xs text-gray-400 font-mono min-w-[36px] text-right">
              {state === 'idle'
                ? formatTime(actualDuration)
                : formatTime(currentTime)}
            </span>
          </div>

          {/* Transcript (shown subtly below) */}
          <p className="mt-2 text-xs text-gray-400/70 italic leading-relaxed border-t border-gray-700/30 pt-2">
            &ldquo;{text}&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
