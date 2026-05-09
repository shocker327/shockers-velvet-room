import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-velvet-dark border-t border-purple-800/30 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-heading text-xl font-bold text-velvet-gold mb-3">
              The Velvet Suite
            </h3>
            <p className="text-gray-400 text-sm">
              Premium AI companions for intimate, uncensored conversation.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-3">Legal</h4>
            <div className="space-y-2">
              <Link to="/terms" className="block text-gray-400 hover:text-velvet-gold text-sm transition-colors">
                Terms of Service
              </Link>
              <Link to="/privacy" className="block text-gray-400 hover:text-velvet-gold text-sm transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-3">Contact</h4>
            <a
              href="mailto:support@shockersvelvetsuite.shop"
              className="text-gray-400 hover:text-velvet-gold text-sm transition-colors"
            >
              support@shockersvelvetsuite.shop
            </a>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-purple-800/20 text-center">
          <p className="text-gray-500 text-sm">
            &copy; 2026 Shocker Studios. All rights reserved. Adults 18+ only.
          </p>
        </div>
      </div>
    </footer>
  );
}
