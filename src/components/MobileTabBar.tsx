import React from 'react';
import { Calendar, Compass, Clock, Settings, CircleDot, Sparkles } from 'lucide-react';

interface MobileTabBarProps {
  activeTab: 'today' | 'calendar' | 'insights' | 'phases' | 'history' | 'profile' | 'settings';
  setActiveTab: (tab: 'today' | 'calendar' | 'insights' | 'phases' | 'history' | 'profile' | 'settings') => void;
}

export const MobileTabBar: React.FC<MobileTabBarProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'today' as const, label: 'Today', icon: CircleDot },
    { id: 'calendar' as const, label: 'Calendar', icon: Calendar },
    { id: 'insights' as const, label: 'Insights', icon: Sparkles },
    { id: 'history' as const, label: 'History', icon: Clock },
    { id: 'profile' as const, label: 'Profile', icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#C8A2E8]/40">
      <div className="grid grid-cols-5 items-center h-16 px-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 transition-colors cursor-pointer relative ${
                isActive ? 'text-[#7B2CBF] font-bold' : 'text-stone-500 hover:text-[#542080]'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5] text-[#EC4899]' : 'stroke-[1.8]'}`} />
              <span className="text-[10px] tracking-tight mt-1 whitespace-nowrap">
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#EC4899] absolute top-1 right-1/2 translate-x-3" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
