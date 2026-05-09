import { Link } from 'react-router-dom';

interface CompanionCardProps {
  id: string;
  name: string;
  tagline: string;
  description: string;
  avatar: string;
  gradient: string;
}

export default function CompanionCard({ id, name, tagline, description, avatar, gradient }: CompanionCardProps) {
  return (
    <div className="card-dark group hover:scale-[1.02] transition-all duration-300">
      <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-3xl mb-4 mx-auto group-hover:shadow-lg group-hover:shadow-purple-500/20 transition-all`}>
        {avatar}
      </div>
      <h3 className="font-heading text-2xl font-bold text-velvet-gold text-center mb-1">
        {name}
      </h3>
      <p className="text-purple-300 text-sm text-center mb-3">{tagline}</p>
      <p className="text-gray-400 text-sm text-center mb-6 leading-relaxed">
        {description}
      </p>
      <Link
        to={`/chat/${id}`}
        className="btn-gold block text-center text-sm"
      >
        Chat Now
      </Link>
    </div>
  );
}
