import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { trpc } from '../utils/trpc';
import { getUserId } from '../utils/anonymousUser';

export default function DateNight() {
  const { companionId } = useParams<{ companionId: string }>();
  const navigate = useNavigate();
  const userId = getUserId();
  const [isStarting, setIsStarting] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);

  const { data: companion } = trpc.getCompanion.useQuery(
    { id: companionId! },
    { enabled: !!companionId }
  );

  const { data: scenarioData } = trpc.getDateScenarios.useQuery({ userId });
  const startDateMutation = trpc.startDate.useMutation();

  if (!companionId) {
    navigate('/companions');
    return null;
  }

  const handleStartDate = async (scenarioId: string) => {
    if (isStarting) return;
    setIsStarting(true);
    setSelectedScenario(scenarioId);

    try {
      await startDateMutation.mutateAsync({
        userId,
        companionId,
        scenarioId,
      });
      // Navigate to the chat with date mode active
      navigate(`/chat/${companionId}?date=active`);
    } catch (error: any) {
      alert(error.message || 'Failed to start date. Please try again.');
      setIsStarting(false);
      setSelectedScenario(null);
    }
  };

  const isAvailable = (scenarioId: string) => {
    return scenarioData?.availableIds?.includes(scenarioId) ?? false;
  };

  return (
    <div className="min-h-screen bg-velvet-dark py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-heading text-4xl font-bold text-velvet-gold mb-3">
            Date Night
          </h1>
          <p className="text-gray-400 text-lg">
            Choose a scenario for your evening with{' '}
            <span className="text-velvet-gold">{companion?.name || 'your companion'}</span>
          </p>
          {scenarioData?.userTier && (
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-velvet-mid border border-purple-800/30">
              <span className="text-xs text-gray-400">Your tier:</span>
              <span className={`text-xs font-bold uppercase tracking-wider ${
                scenarioData.userTier === 'premium' ? 'text-velvet-gold' : 'text-purple-400'
              }`}>
                {scenarioData.userTier}
              </span>
            </div>
          )}
        </div>

        {/* Scenario Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scenarioData?.scenarios.map((scenario) => {
            const available = isAvailable(scenario.id);
            const isSelected = selectedScenario === scenario.id;
            const isPremiumLocked = !available && scenario.tier === 'premium';

            return (
              <div
                key={scenario.id}
                className={`relative rounded-2xl border transition-all duration-300 overflow-hidden ${
                  available
                    ? 'border-purple-800/30 hover:border-velvet-gold/50 hover:shadow-lg hover:shadow-velvet-gold/10 cursor-pointer'
                    : 'border-gray-800/50 opacity-70'
                } ${isSelected ? 'border-velvet-gold ring-2 ring-velvet-gold/30' : ''}`}
                onClick={() => available && !isStarting && handleStartDate(scenario.id)}
              >
                {/* NSFW Badge */}
                {scenario.isNSFW && (
                  <div className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded-full bg-red-900/80 border border-red-500/50">
                    <span className="text-[10px] font-bold text-red-300 uppercase tracking-wider">NSFW</span>
                  </div>
                )}

                {/* Premium Lock Overlay */}
                {isPremiumLocked && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl">
                    <div className="text-center p-4">
                      <div className="text-3xl mb-2">🔒</div>
                      <p className="text-sm text-velvet-gold font-heading font-bold">Premium Only</p>
                      <p className="text-xs text-gray-400 mt-1">Upgrade to unlock</p>
                    </div>
                  </div>
                )}

                {/* Card Content */}
                <div className="p-6 bg-gradient-to-b from-velvet-mid to-velvet-dark">
                  <div className="text-4xl mb-4">{scenario.icon}</div>
                  <h3 className="font-heading text-xl font-bold text-white mb-2">
                    {scenario.name}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed mb-4">
                    {scenario.description}
                  </p>

                  {/* Tier Badge */}
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      scenario.tier === 'premium'
                        ? 'bg-velvet-gold/20 text-velvet-gold border border-velvet-gold/30'
                        : 'bg-purple-900/50 text-purple-300 border border-purple-700/30'
                    }`}>
                      {scenario.tier === 'premium' ? '★ Premium' : '● Paid'}
                    </span>

                    {available && (
                      <span className="text-xs text-velvet-gold font-medium">
                        {isSelected && isStarting ? (
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Setting up...
                          </span>
                        ) : (
                          'Tap to start →'
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Back Button */}
        <div className="text-center mt-10">
          <button
            onClick={() => navigate(`/chat/${companionId}`)}
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            ← Back to chat
          </button>
        </div>

        {/* Upgrade CTA for non-premium users */}
        {scenarioData?.userTier !== 'premium' && (
          <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-velvet-gold/10 to-purple-900/20 border border-velvet-gold/30 text-center">
            <h3 className="font-heading text-xl text-velvet-gold font-bold mb-2">
              Unlock All Date Scenarios
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Upgrade to Premium for exclusive NSFW scenarios including Hot Tub, Bedroom, and more.
            </p>
            <button
              onClick={() => navigate('/pricing')}
              className="btn-gold px-8 py-3"
            >
              View Premium Plans
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
