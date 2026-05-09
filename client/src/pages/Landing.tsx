import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-velvet-dark via-velvet-mid to-velvet-dark"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="font-heading text-5xl md:text-7xl font-bold text-white mb-4">
            The <span className="text-velvet-gold">Velvet</span> Suite
          </h1>
          <p className="text-xl md:text-2xl text-purple-200 mb-2 font-heading italic">
            Intimate AI Companions, Without Limits
          </p>
          <p className="text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Experience deeply personal, uncensored conversations with AI companions crafted for connection, 
            passion, and intimacy. No filters. No judgment. Just you and your perfect companion.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/companions" className="btn-gold text-lg px-8 py-4">
              Meet Your Companions
            </Link>
            <Link to="/pricing" className="btn-outline text-lg px-8 py-4">
              View Pricing
            </Link>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-velvet-dark to-transparent"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-center text-white mb-12">
            Why Choose <span className="text-velvet-gold">The Velvet Suite</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card-dark text-center">
              <div className="text-4xl mb-4">🔓</div>
              <h3 className="font-heading text-xl font-bold text-velvet-gold mb-2">Uncensored</h3>
              <p className="text-gray-400 text-sm">
                No content filters, no restrictions. Express yourself freely in a judgment-free space.
              </p>
            </div>
            <div className="card-dark text-center">
              <div className="text-4xl mb-4">💜</div>
              <h3 className="font-heading text-xl font-bold text-velvet-gold mb-2">Deeply Personal</h3>
              <p className="text-gray-400 text-sm">
                Each companion remembers you, adapts to your preferences, and builds genuine connection.
              </p>
            </div>
            <div className="card-dark text-center">
              <div className="text-4xl mb-4">🌙</div>
              <h3 className="font-heading text-xl font-bold text-velvet-gold mb-2">Always Available</h3>
              <p className="text-gray-400 text-sm">
                Your companions are here whenever you need them — day or night, no waiting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-velvet-dark to-velvet-mid">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Begin?
          </h2>
          <p className="text-gray-400 mb-8">
            Choose your companion and start an unforgettable conversation tonight.
          </p>
          <Link to="/companions" className="btn-gold text-lg px-8 py-4 inline-block">
            Explore Companions
          </Link>
        </div>
      </section>
    </div>
  );
}
