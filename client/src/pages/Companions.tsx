import { Link } from 'react-router-dom';
import { trpc } from '../utils/trpc';
import { getUserId } from '../utils/anonymousUser';
import CompanionCard from '../components/CompanionCard';

export default function Companions() {
  const userId = getUserId();
  const { data: companions, isLoading } = trpc.getCompanions.useQuery({ userId });
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
            {/* Create New Companion Card */}
            <Link
              to="/create-companion"
              className="card-dark group hover:scale-[1.02] transition-all duration-300 flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed border-velvet-gold/30 hover:border-velvet-gold/60"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-velvet-gold/20 to-purple-900/40 flex items-center justify-center text-4xl mb-4 group-hover:shadow-lg group-hover:shadow-velvet-gold/20 transition-all border-2 border-velvet-gold/40">
                <span className="text-velvet-gold">+</span>
              </div>
              <h3 className="font-heading text-xl font-bold text-velvet-gold text-center mb-2">
                Create Custom
              </h3>
              <p className="text-gray-400 text-sm text-center px-4">
                Design your perfect companion from scratch
              </p>
            </Link>

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
