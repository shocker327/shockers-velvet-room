import { useParams, Navigate } from 'react-router-dom';
import { trpc } from '../utils/trpc';
import ChatInterface from '../components/ChatInterface';

export default function Chat() {
  const { companionId } = useParams<{ companionId: string }>();
  
  const { data: companion, isLoading, error } = trpc.getCompanion.useQuery(
    { id: companionId || '' },
    { enabled: !!companionId }
  );

  if (!companionId) return <Navigate to="/companions" />;
  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }
  if (error || !companion) return <Navigate to="/companions" />;

  return (
    <div className="pt-16">
      <ChatInterface
        companionId={companion.id}
        companionName={companion.name}
        companionAvatar={companion.avatar}
        gradient={companion.gradient}
      />
    </div>
  );
}
