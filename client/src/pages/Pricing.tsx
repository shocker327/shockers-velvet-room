import { useState } from 'react';
import { trpc } from '../utils/trpc';

export default function Pricing() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');

  const joinWaitlist = trpc.joinWaitlist.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      const result = await joinWaitlist.mutateAsync({ email });
      setMessage(result.message);
      setSubmitted(true);
      setEmail('');
    } catch (err) {
      setMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4">
            Choose Your <span className="text-velvet-gold">Experience</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Unlock unlimited, uncensored conversations with all companions. No restrictions, no limits.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-20">
          {/* Monthly */}
          <div className="card-dark relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-purple-800"></div>
            <div className="text-center pt-4">
              <h3 className="font-heading text-2xl font-bold text-white mb-2">Monthly</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-velvet-gold">$39.99</span>
                <span className="text-gray-400">/month</span>
              </div>
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center gap-2 text-gray-300 text-sm">
                  <span className="text-velvet-gold">✓</span> Unlimited uncensored chat
                </li>
                <li className="flex items-center gap-2 text-gray-300 text-sm">
                  <span className="text-velvet-gold">✓</span> All 4 companions
                </li>
                <li className="flex items-center gap-2 text-gray-300 text-sm">
                  <span className="text-velvet-gold">✓</span> Priority responses
                </li>
                <li className="flex items-center gap-2 text-gray-300 text-sm">
                  <span className="text-velvet-gold">✓</span> Chat history saved
                </li>
                <li className="flex items-center gap-2 text-gray-300 text-sm">
                  <span className="text-velvet-gold">✓</span> Cancel anytime
                </li>
              </ul>
              <button
                onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-outline w-full"
              >
                Join Waitlist
              </button>
            </div>
          </div>

          {/* Annual */}
          <div className="card-dark relative overflow-hidden border-velvet-gold/50">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-velvet-gold to-yellow-600"></div>
            <div className="absolute top-4 right-4 bg-velvet-gold text-velvet-dark text-xs font-bold px-2 py-1 rounded">
              BEST VALUE
            </div>
            <div className="text-center pt-4">
              <h3 className="font-heading text-2xl font-bold text-white mb-2">Annual</h3>
              <div className="mb-1">
                <span className="text-4xl font-bold text-velvet-gold">$29.99</span>
                <span className="text-gray-400">/month</span>
              </div>
              <p className="text-xs text-gray-500 mb-4">Billed $359.88/year</p>
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center gap-2 text-gray-300 text-sm">
                  <span className="text-velvet-gold">✓</span> Everything in Monthly
                </li>
                <li className="flex items-center gap-2 text-gray-300 text-sm">
                  <span className="text-velvet-gold">✓</span> Exclusive companions (coming soon)
                </li>
                <li className="flex items-center gap-2 text-gray-300 text-sm">
                  <span className="text-velvet-gold">✓</span> Early access to new features
                </li>
                <li className="flex items-center gap-2 text-gray-300 text-sm">
                  <span className="text-velvet-gold">✓</span> Priority support
                </li>
                <li className="flex items-center gap-2 text-gray-300 text-sm">
                  <span className="text-velvet-gold">✓</span> Save 25% vs monthly
                </li>
              </ul>
              <button
                onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-gold w-full"
              >
                Join Waitlist
              </button>
            </div>
          </div>
        </div>

        {/* How it Works */}
        <section className="mb-20">
          <h2 className="font-heading text-3xl font-bold text-center text-white mb-12">
            How It <span className="text-velvet-gold">Works</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-purple-800/50 flex items-center justify-center text-2xl mx-auto mb-4 border border-purple-600/30">
                1
              </div>
              <h3 className="font-heading text-xl font-bold text-velvet-gold mb-2">Choose a Companion</h3>
              <p className="text-gray-400 text-sm">
                Browse our gallery and select the companion whose personality resonates with you.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-purple-800/50 flex items-center justify-center text-2xl mx-auto mb-4 border border-purple-600/30">
                2
              </div>
              <h3 className="font-heading text-xl font-bold text-velvet-gold mb-2">Start Chatting</h3>
              <p className="text-gray-400 text-sm">
                Begin your conversation — no filters, no limits. Your companion adapts to you.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-purple-800/50 flex items-center justify-center text-2xl mx-auto mb-4 border border-purple-600/30">
                3
              </div>
              <h3 className="font-heading text-xl font-bold text-velvet-gold mb-2">Build Connection</h3>
              <p className="text-gray-400 text-sm">
                Your companion remembers your conversations and deepens the relationship over time.
              </p>
            </div>
          </div>
        </section>

        {/* Waitlist Form */}
        <section id="waitlist" className="max-w-lg mx-auto">
          <div className="card-dark text-center">
            <h2 className="font-heading text-2xl font-bold text-white mb-2">
              Join the <span className="text-velvet-gold">Waitlist</span>
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              Be the first to know when premium subscriptions launch.
            </p>
            {submitted ? (
              <div className="text-velvet-gold font-semibold py-4">{message}</div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 bg-velvet-dark border border-purple-800/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-velvet-gold/50"
                />
                <button type="submit" className="btn-gold whitespace-nowrap">
                  Join Waitlist
                </button>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
