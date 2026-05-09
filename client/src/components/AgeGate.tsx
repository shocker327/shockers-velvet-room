import { useState } from 'react';
import { setAgeVerified } from '../utils/anonymousUser';

interface AgeGateProps {
  onVerified: () => void;
}

export default function AgeGate({ onVerified }: AgeGateProps) {
  const [checked, setChecked] = useState(false);

  const handleConfirm = () => {
    if (checked) {
      setAgeVerified();
      onVerified();
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-velvet-dark flex items-center justify-center p-4">
      <div className="max-w-md w-full card-dark text-center space-y-6">
        <div className="text-6xl mb-4">🔞</div>
        <h1 className="font-heading text-3xl font-bold text-velvet-gold">
          Age Verification Required
        </h1>
        <p className="text-gray-300 text-sm leading-relaxed">
          The Velvet Suite contains adult content intended for individuals 18 years of age or older. 
          By entering, you confirm that you are of legal age in your jurisdiction to view such content.
        </p>
        <div className="flex items-center justify-center gap-3">
          <input
            type="checkbox"
            id="age-confirm"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="w-5 h-5 rounded border-velvet-gold accent-velvet-gold cursor-pointer"
          />
          <label htmlFor="age-confirm" className="text-sm text-gray-200 cursor-pointer">
            I confirm that I am 18 years of age or older
          </label>
        </div>
        <button
          onClick={handleConfirm}
          disabled={!checked}
          className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
            checked
              ? 'btn-gold'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          Enter The Velvet Suite
        </button>
        <p className="text-xs text-gray-500">
          By entering, you agree to our{' '}
          <a href="/terms" className="text-velvet-gold hover:underline">Terms of Service</a>{' '}
          and{' '}
          <a href="/privacy" className="text-velvet-gold hover:underline">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
