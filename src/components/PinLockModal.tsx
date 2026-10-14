import React, { useState } from 'react';
import { Lock, Unlock, Delete } from 'lucide-react';

interface PinLockModalProps {
  correctPin: string;
  onUnlock: () => void;
}

export const PinLockModal: React.FC<PinLockModalProps> = ({ correctPin, onUnlock }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(false);

      if (nextPin.length === 4) {
        if (nextPin === correctPin) {
          onUnlock();
        } else {
          setError(true);
          setTimeout(() => {
            setPin('');
            setError(false);
          }, 800);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/90 backdrop-blur-md">
      <div className="w-full max-w-xs bg-white rounded-3xl p-8 border border-stone-200 text-center shadow-2xl">
        <div className="w-12 h-12 mx-auto rounded-full bg-stone-100 flex items-center justify-center text-stone-800 mb-4">
          <Lock className="w-6 h-6" />
        </div>

        <h2 className="text-lg font-bold text-stone-900 font-display">
          LumaCycle Locked
        </h2>
        <p className="text-xs text-stone-500 mt-1 mb-6">
          Enter your 4-digit passcode to access your personal health logs.
        </p>

        {/* PIN Dots */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[0, 1, 2, 3].map(idx => (
            <div
              key={idx}
              className={`w-3.5 h-3.5 rounded-full border transition-all ${
                error
                  ? 'border-rose-500 bg-rose-500 animate-shake'
                  : pin.length > idx
                  ? 'border-stone-900 bg-stone-900 scale-110'
                  : 'border-stone-300 bg-transparent'
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-xs text-rose-600 font-medium -mt-4 mb-4">
            Incorrect PIN code. Try again.
          </p>
        )}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-3">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button
              key={num}
              onClick={() => handleDigit(num)}
              className="h-14 rounded-2xl bg-stone-50 hover:bg-stone-100 active:scale-95 text-stone-900 font-mono text-xl font-semibold transition-all border border-stone-200"
            >
              {num}
            </button>
          ))}
          <div className="h-14 flex items-center justify-center">
            {/* Blank placeholder */}
          </div>
          <button
            onClick={() => handleDigit('0')}
            className="h-14 rounded-2xl bg-stone-50 hover:bg-stone-100 active:scale-95 text-stone-900 font-mono text-xl font-semibold transition-all border border-stone-200"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            aria-label="Delete last digit"
            className="h-14 rounded-2xl bg-stone-50 hover:bg-stone-100 active:scale-95 text-stone-600 flex items-center justify-center transition-all border border-stone-200"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
