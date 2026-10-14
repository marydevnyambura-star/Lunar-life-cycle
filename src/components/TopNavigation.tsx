import React from 'react';
import { Eye, EyeOff, Lock, Plus } from 'lucide-react';

interface TopNavigationProps {
  activeTab: 'today' | 'calendar' | 'phases' | 'history' | 'profile' | 'settings';
  setActiveTab: (tab: 'today' | 'calendar' | 'phases' | 'history' | 'profile' | 'settings') => void;
  onOpenQuickLog: () => void;
  privacyMode: boolean;
  onTogglePrivacy: () => void;
  userDisplayName?: string | null;
  userPhotoURL?: string | null;
  onSignOut: () => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  activeTab,
  setActiveTab,
  onOpenQuickLog,
  privacyMode,
  onTogglePrivacy,
  userDisplayName,
  userPhotoURL,
  onSignOut
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FAF9F6]/90 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('today')}
            className="flex items-center gap-2.5 text-left group transition-transform active:scale-95"
          >
            <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-white shadow-sm shadow-rose-200">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 stroke-[2.2]">
                <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
                <path d="M12 7c-2 2-3 4-3 6a3 3 0 0 0 6 0c0-2-1-4-3-6Z" fill="currentColor" />
              </svg>
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-stone-900 whitespace-nowrap">
              LumaCycle
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-5 lg:gap-7 text-sm font-medium text-stone-600">
          <button
            onClick={() => setActiveTab('today')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'today'
                ? 'text-rose-600 font-semibold border-b-2 border-rose-500'
                : 'hover:text-stone-900'
            }`}
          >
            Cycle Today
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'calendar'
                ? 'text-rose-600 font-semibold border-b-2 border-rose-500'
                : 'hover:text-stone-900'
            }`}
          >
            Calendar
          </button>
          <button
            onClick={() => setActiveTab('phases')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'phases'
                ? 'text-rose-600 font-semibold border-b-2 border-rose-500'
                : 'hover:text-stone-900'
            }`}
          >
            Hormone Guide
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'history'
                ? 'text-rose-600 font-semibold border-b-2 border-rose-500'
                : 'hover:text-stone-900'
            }`}
          >
            My History
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'profile'
                ? 'text-rose-600 font-semibold border-b-2 border-rose-500'
                : 'hover:text-stone-900'
            }`}
          >
            My Profile
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'settings'
                ? 'text-rose-600 font-semibold border-b-2 border-rose-500'
                : 'hover:text-stone-900'
            }`}
          >
            Settings
          </button>
        </nav>

        {/* Zone 3: Primary Action & Profile Affordance */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onTogglePrivacy}
            title={privacyMode ? 'Disable Discreet Mode' : 'Enable Discreet Mode (blur/neutralize sensitive labels)'}
            className={`p-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 border ${
              privacyMode
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-white text-stone-600 border-stone-200 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            {privacyMode ? <EyeOff className="w-4 h-4 text-amber-700" /> : <Eye className="w-4 h-4" />}
            <span className="hidden sm:inline text-xs">
              {privacyMode ? 'Discreet On' : 'Discreet'}
            </span>
          </button>

          <button
            onClick={onOpenQuickLog}
            className="px-3.5 py-2 text-xs sm:text-sm font-medium text-white bg-rose-600 rounded-lg hover:bg-rose-700 active:scale-[0.98] transition-all flex items-center gap-1.5 shadow-sm shadow-rose-200 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Log Daily</span>
          </button>

          {/* User Profile Mini Trigger */}
          <button
            onClick={() => setActiveTab('profile')}
            title="My Profile"
            className="w-9 h-9 rounded-full overflow-hidden border border-stone-300 hover:ring-2 hover:ring-rose-400 transition-all flex items-center justify-center bg-stone-100 shrink-0"
          >
            {userPhotoURL ? (
              <img
                src={userPhotoURL}
                alt={userDisplayName || 'User'}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <span className="font-bold text-xs text-stone-700">
                {(userDisplayName || 'U').charAt(0).toUpperCase()}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
