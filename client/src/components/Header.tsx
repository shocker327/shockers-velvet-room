import { Link } from 'react-router-dom';
import { useState } from 'react';
import { trpc } from '../utils/trpc';
import { getUserId } from '../utils/anonymousUser';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const userId = getUserId();
  const { data: unreadData } = trpc.getUnreadCount.useQuery({ userId });
  const unreadCount = unreadData?.count || 0;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-velvet-dark/90 backdrop-blur-md border-b border-purple-800/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">💜</span>
            <span className="font-heading text-xl font-bold text-velvet-gold">
              The Velvet Suite
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-gray-300 hover:text-velvet-gold transition-colors">
              Home
            </Link>
            <Link to="/companions" className="relative text-gray-300 hover:text-velvet-gold transition-colors">
              Companions
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-4 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold animate-pulse">
                  {unreadCount}
                </span>
              )}
            </Link>
            <Link to="/create-companion" className="text-gray-300 hover:text-velvet-gold transition-colors flex items-center gap-1">
              <span className="text-velvet-gold">+</span> Create
            </Link>
            <Link to="/pricing" className="text-gray-300 hover:text-velvet-gold transition-colors">
              Pricing
            </Link>
            <Link to="/pricing" className="btn-gold text-sm">
              Join Waitlist
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-gray-300 hover:text-velvet-gold"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <nav className="md:hidden pb-4 space-y-3">
            <Link to="/" onClick={() => setMobileOpen(false)} className="block text-gray-300 hover:text-velvet-gold">
              Home
            </Link>
            <Link to="/companions" onClick={() => setMobileOpen(false)} className="relative inline-block text-gray-300 hover:text-velvet-gold">
              Companions
              {unreadCount > 0 && (
                <span className="ml-2 inline-flex w-4 h-4 bg-red-500 rounded-full items-center justify-center text-[10px] text-white font-bold">
                  {unreadCount}
                </span>
              )}
            </Link>
            <Link to="/create-companion" onClick={() => setMobileOpen(false)} className="block text-gray-300 hover:text-velvet-gold">
              + Create Companion
            </Link>
            <Link to="/pricing" onClick={() => setMobileOpen(false)} className="block text-gray-300 hover:text-velvet-gold">
              Pricing
            </Link>
            <Link to="/pricing" onClick={() => setMobileOpen(false)} className="btn-gold inline-block text-sm">
              Join Waitlist
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
