import React from 'react';
import { Eye, EyeOff, Lock, Plus, Sparkles } from 'lucide-react';

interface TopNavigationProps {
  activeTab: 'today' | 'calendar' | 'insights' | 'phases' | 'history' | 'profile' | 'settings';
  setActiveTab: (tab: 'today' | 'calendar' | 'insights' | 'phases' | 'history' | 'profile' | 'settings') => void;
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
    <header className="sticky top-0 z-30 bg-[#F6F0FC]/90 backdrop-blur-md border-b border-[#C8A2E8]/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('today')}
            className="flex items-center gap-2.5 text-left group transition-transform active:scale-95 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#542080] via-[#7B2CBF] to-[#EC4899] flex items-center justify-center text-white shadow-sm shadow-purple-300">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 stroke-[2.2]">
                <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
                <path d="M12 7c-2 2-3 4-3 6a3 3 0 0 0 6 0c0-2-1-4-3-6Z" fill="currentColor" />
              </svg>
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-[#321442] whitespace-nowrap">
              LumaCycle
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-5 lg:gap-7 text-sm font-medium text-stone-600">
          <button
            onClick={() => setActiveTab('today')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer ${
              activeTab === 'today'
                ? 'text-[#7B2CBF] font-bold border-b-2 border-[#7B2CBF]'
                : 'hover:text-[#321442]'
            }`}
          >
            Cycle Today
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer ${
              activeTab === 'calendar'
                ? 'text-[#7B2CBF] font-bold border-b-2 border-[#7B2CBF]'
                : 'hover:text-[#321442]'
            }`}
          >
            Calendar
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer flex items-center gap-1 ${
              activeTab === 'insights'
                ? 'text-[#7B2CBF] font-bold border-b-2 border-[#7B2CBF]'
                : 'hover:text-[#321442]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#EC4899]" />
            <span>Health Insights</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer ${
              activeTab === 'history'
                ? 'text-[#7B2CBF] font-bold border-b-2 border-[#7B2CBF]'
                : 'hover:text-[#321442]'
            }`}
          >
            History
          </button>
          <button
            onClick={() => setActiveTab('phases')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer ${
              activeTab === 'phases'
                ? 'text-[#7B2CBF] font-bold border-b-2 border-[#7B2CBF]'
                : 'hover:text-[#321442]'
            }`}
          >
            Hormone Guide
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer ${
              activeTab === 'profile'
                ? 'text-[#7B2CBF] font-bold border-b-2 border-[#7B2CBF]'
                : 'hover:text-[#321442]'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer ${
              activeTab === 'settings'
                ? 'text-[#7B2CBF] font-bold border-b-2 border-[#7B2CBF]'
                : 'hover:text-[#321442]'
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
            className={`p-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 border cursor-pointer ${
              privacyMode
                ? 'bg-[#FCE7F3] text-[#7B2CBF] border-[#C8A2E8]'
                : 'bg-white text-stone-600 border-[#C8A2E8]/40 hover:text-[#321442] hover:bg-purple-50/50'
            }`}
          >
            {privacyMode ? <EyeOff className="w-4 h-4 text-[#7B2CBF]" /> : <Eye className="w-4 h-4" />}
            <span className="hidden sm:inline text-xs">
              {privacyMode ? 'Discreet On' : 'Discreet'}
            </span>
          </button>

          <button
            onClick={onOpenQuickLog}
            className="px-3.5 py-2 text-xs sm:text-sm font-bold text-white bg-[#EC4899] hover:bg-pink-600 active:scale-[0.98] rounded-xl transition-all flex items-center gap-1.5 shadow-sm shadow-pink-200 whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Log Daily</span>
          </button>

          {/* User Profile Mini Trigger */}
          <button
            onClick={() => setActiveTab('profile')}
            title="My Profile"
            className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#C8A2E8] hover:ring-2 hover:ring-[#7B2CBF] transition-all flex items-center justify-center bg-white shrink-0 cursor-pointer"
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
              <span className="font-bold text-xs text-[#542080]">
                {(userDisplayName || 'U').charAt(0).toUpperCase()}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
