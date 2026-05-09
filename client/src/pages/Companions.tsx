import { trpc } from '../utils/trpc';
import { getUserId } from '../utils/anonymousUser';
import CompanionCard from '../components/CompanionCard';

export default function Companions() {
  const userId = getUserId();
  const { data: companions, isLoading } = trpc.getCompanions.useQuery();
  const { data: unreadMap } = trpc.getUnreadPerCompanion.useQuery({ userId });

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4">
            Your <span className="text-velvet-gold">Companions</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Each companion has a unique personality, style, and energy. Choose the one that speaks to your desires.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center text-gray-400">Loading companions...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {companions?.map((companion) => (
              <CompanionCard
                key={companion.id}
                {...companion}
                unreadMessage={unreadMap?.[companion.id] || null}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
