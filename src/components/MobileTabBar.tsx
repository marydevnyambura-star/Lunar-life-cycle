import React from 'react';
import { Calendar, Compass, Clock, Settings, CircleDot } from 'lucide-react';

interface MobileTabBarProps {
  activeTab: 'today' | 'calendar' | 'phases' | 'history' | 'profile' | 'settings';
  setActiveTab: (tab: 'today' | 'calendar' | 'phases' | 'history' | 'profile' | 'settings') => void;
}

export const MobileTabBar: React.FC<MobileTabBarProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'today' as const, label: 'Today', icon: CircleDot },
    { id: 'calendar' as const, label: 'Calendar', icon: Calendar },
    { id: 'history' as const, label: 'History', icon: Clock },
    { id: 'phases' as const, label: 'Phases', icon: Compass },
    { id: 'profile' as const, label: 'Profile', icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200">
      <div className="grid grid-cols-5 items-center h-16 px-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 transition-colors ${
                isActive ? 'text-rose-600 font-semibold' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              <span className="text-[10px] tracking-tight mt-1 whitespace-nowrap">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
