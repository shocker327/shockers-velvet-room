import { Link } from 'react-router-dom';

interface CompanionCardProps {
  id: string;
  name: string;
  tagline: string;
  description: string;
  avatar: string;
  gradient: string;
  unreadMessage?: string | null;
}

export default function CompanionCard({ id, name, tagline, description, avatar, gradient, unreadMessage }: CompanionCardProps) {
  return (
    <div className="card-dark group hover:scale-[1.02] transition-all duration-300 relative">
      {/* Unread notification badge */}
      {unreadMessage && (
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30 animate-pulse">
          <span className="text-white text-xs font-bold">1</span>
        </div>
      )}
      <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-3xl mb-4 mx-auto group-hover:shadow-lg group-hover:shadow-purple-500/20 transition-all`}>
        {avatar}
      </div>
      <h3 className="font-heading text-2xl font-bold text-velvet-gold text-center mb-1">
        {name}
      </h3>
      <p className="text-purple-300 text-sm text-center mb-3">{tagline}</p>
      <p className="text-gray-400 text-sm text-center mb-4 leading-relaxed">
        {description}
      </p>
      {/* Unread message preview */}
      {unreadMessage && (
        <div className="mb-4 px-3 py-2 bg-velvet-gold/10 border border-velvet-gold/30 rounded-lg">
          <p className="text-xs text-velvet-gold font-medium mb-0.5">{name} sent you a message:</p>
          <p className="text-xs text-gray-300 italic truncate">&ldquo;{unreadMessage}&rdquo;</p>
        </div>
      )}
      <Link
        to={`/chat/${id}`}
        className="btn-gold block text-center text-sm"
      >
        {unreadMessage ? 'Read Message' : 'Chat Now'}
      </Link>
    </div>
  );
}
