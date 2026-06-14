import { useState } from 'react';
import { trpc } from '../utils/trpc';
import { getUserId } from '../utils/anonymousUser';

interface DateChoice {
  id: string;
  momentDescription: string;
  options: {
    id: string;
    label: string;
    description: string;
  }[];
}

interface DateModeOverlayProps {
  sessionId: string;
  companionId: string;
  companionName: string;
  scenarioName: string;
  scenarioIcon: string;
  sceneImageUrl: string | null;
  nextChoice: DateChoice | null;
  onChoiceMade: (reply: string) => void;
  onEndDate: () => void;
}

export default function DateModeOverlay({
  sessionId,
  companionId,
  companionName,
  scenarioName,
  scenarioIcon,
  sceneImageUrl,
  nextChoice,
  onChoiceMade,
  onEndDate,
}: DateModeOverlayProps) {
  const userId = getUserId();
  const [isChoosingOption, setIsChoosingOption] = useState(false);
  const [showChoices, setShowChoices] = useState(!!nextChoice);
  const makeChoiceMutation = trpc.makeDateChoice.useMutation();
  const endDateMutation = trpc.endDate.useMutation();

  const handleChoice = async (optionId: string) => {
    if (isChoosingOption || !nextChoice) return;
    setIsChoosingOption(true);

    try {
      const result = await makeChoiceMutation.mutateAsync({
        userId,
        companionId,
        sessionId,
        choiceId: nextChoice.id,
        optionId,
      });
      setShowChoices(false);
      onChoiceMade(result.content);
    } catch (error) {
      console.error('Choice failed:', error);
    } finally {
      setIsChoosingOption(false);
    }
  };

  const handleEndDate = async () => {
    try {
      await endDateMutation.mutateAsync({ userId, companionId, sessionId });
      onEndDate();
    } catch (error) {
      console.error('End date failed:', error);
    }
  };

  return (
    <>
      {/* Date Mode Header Bar */}
      <div className="relative z-20 flex items-center justify-between px-4 py-2 bg-gradient-to-r from-velvet-gold/20 to-purple-900/30 border-b border-velvet-gold/30">
        <div className="flex items-center gap-2">
          <span className="text-lg">{scenarioIcon}</span>
          <div>
            <span className="text-xs text-velvet-gold font-bold uppercase tracking-wider">Date Mode</span>
            <span className="text-xs text-gray-400 ml-2">{scenarioName}</span>
          </div>
        </div>
        <button
          onClick={handleEndDate}
          className="text-xs text-gray-400 hover:text-red-400 transition-colors px-3 py-1 border border-gray-700 hover:border-red-800 rounded"
        >
          End Date
        </button>
      </div>

      {/* Interactive Choices Panel */}
      {nextChoice && showChoices && (
        <div className="relative z-20 mx-4 my-3 animate-fade-in">
          <div className="p-4 rounded-xl bg-gradient-to-b from-velvet-mid/95 to-velvet-dark/95 border border-velvet-gold/30 backdrop-blur-md shadow-xl shadow-velvet-gold/5">
            {/* Moment Description */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-velvet-gold animate-pulse" />
              <p className="text-sm text-velvet-gold font-heading italic">
                {nextChoice.momentDescription}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-2">
              {nextChoice.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleChoice(option.id)}
                  disabled={isChoosingOption}
                  className="w-full text-left p-3 rounded-lg border border-purple-800/40 hover:border-velvet-gold/50 bg-velvet-dark/50 hover:bg-velvet-gold/5 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-velvet-gold transition-colors">
                        {option.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{option.description}</p>
                    </div>
                    <span className="text-velvet-gold/50 group-hover:text-velvet-gold text-xs mt-0.5 transition-colors">
                      →
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Dismiss */}
            <button
              onClick={() => setShowChoices(false)}
              className="mt-3 text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Continue chatting instead
            </button>
          </div>
        </div>
      )}

      {/* Collapsed choice indicator (if dismissed) */}
      {nextChoice && !showChoices && (
        <div className="relative z-20 mx-4 my-2">
          <button
            onClick={() => setShowChoices(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-velvet-gold/10 border border-velvet-gold/30 hover:bg-velvet-gold/20 transition-all text-sm"
          >
            <div className="w-2 h-2 rounded-full bg-velvet-gold animate-pulse" />
            <span className="text-velvet-gold text-xs font-medium">
              A moment awaits — tap to see your choices
            </span>
          </button>
        </div>
      )}
    </>
  );
}
