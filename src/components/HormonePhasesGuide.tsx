import React, { useState } from 'react';
import { PHASE_GUIDE } from '../utils/cycleCalculations';
import { CyclePhase, CycleRecord, UserSettings } from '../types';
import { Sparkles, Apple, Dumbbell, Heart, Activity, Info, ShieldCheck } from 'lucide-react';

interface HormonePhasesGuideProps {
  currentPhase: CyclePhase;
  cycles: CycleRecord[];
  settings: UserSettings;
}

export const HormonePhasesGuide: React.FC<HormonePhasesGuideProps> = ({
  currentPhase,
  cycles,
  settings
}) => {
  const [selectedPhase, setSelectedPhase] = useState<CyclePhase>(currentPhase);
  const phaseInfo = PHASE_GUIDE[selectedPhase];

  const phaseList: { id: CyclePhase; label: string; days: string; color: string }[] = [
    { id: 'menstrual', label: 'Menstrual', days: 'Days 1-5', color: 'border-rose-400 text-rose-700 bg-rose-50' },
    { id: 'follicular', label: 'Follicular', days: 'Days 6-13', color: 'border-violet-400 text-violet-700 bg-violet-50' },
    { id: 'ovulation', label: 'Ovulatory', days: 'Days 14-16', color: 'border-amber-400 text-amber-800 bg-amber-50' },
    { id: 'luteal', label: 'Luteal', days: 'Days 17-28', color: 'border-teal-400 text-teal-800 bg-teal-50' },
  ];

  return (
    <div className="space-y-8">
      {/* Editorial Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-900 text-white min-h-[220px] sm:min-h-[260px] flex items-center">
        <img
          src="/src/assets/images/wellness_cycle_syncing_1791965481349.jpg"
          alt="Cycle Harmony & Hormonal Balance"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-luminosity"
          onError={(e) => {
            // Styled graceful fallback container
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <div className="relative z-10 p-6 sm:p-10 max-w-2xl">
          <span className="text-xs font-semibold tracking-wider uppercase text-rose-300">
            Biological Rhythms & Cycle Syncing
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-display mt-1 text-white tracking-tight">
            Understanding Your 4 Cycle Phases
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-stone-200 leading-relaxed">
            Your body shifts through distinct hormonal seasons every month. By syncing your nutrition,
            movement, and daily productivity with your active phase, you work with your biology rather than against it.
          </p>
        </div>
      </div>

      {/* Phase Segmented Switcher */}
      <div className="bg-white p-2 rounded-2xl border border-stone-200 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {phaseList.map(item => {
            const isSelected = selectedPhase === item.id;
            const isCurrent = currentPhase === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setSelectedPhase(item.id)}
                className={`py-3 px-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? `${item.color} shadow-xs font-semibold ring-1 ring-stone-900/10`
                    : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-display">{item.label}</span>
                  {isCurrent && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-stone-900 text-white">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-stone-500 mt-0.5 font-mono">{item.days}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Phase Deep Dive */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-stone-100 pb-4">
          <div className="flex items-baseline gap-3">
            <h3 className="text-xl sm:text-2xl font-bold text-stone-900 font-display">
              {phaseInfo.title}
            </h3>
            <span className="text-xs text-stone-500 font-mono">({phaseInfo.dayRange})</span>
          </div>
          <p className="mt-2 text-sm text-stone-700 leading-relaxed">
            {phaseInfo.summary}
          </p>
        </div>

        {/* 2-Column Split: Hormone & Energy */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-500" />
              <span>Hormonal Landscape</span>
            </h4>
            <p className="mt-2 text-xs sm:text-sm text-stone-800 leading-relaxed">
              {phaseInfo.hormones}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Energy & Focus Rhythm</span>
            </h4>
            <p className="mt-2 text-xs sm:text-sm text-stone-800 leading-relaxed">
              {phaseInfo.energy}
            </p>
          </div>
        </div>

        {/* Visual Cards for Nutrition and Movement */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Nutrition Card */}
          <div className="rounded-xl border border-stone-200 bg-stone-50/70 overflow-hidden flex flex-col">
            <div className="h-44 w-full bg-stone-200 overflow-hidden relative">
              <img
                src="/src/assets/images/nutrition_hormone_balance_1791965482284.jpg"
                alt="Nutritious Foods for Hormone Health"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                <span className="text-white text-xs font-bold tracking-wide uppercase flex items-center gap-1.5">
                  <Apple className="w-4 h-4 text-emerald-400" />
                  <span>Phase Nutrition & Seed Syncing</span>
                </span>
              </div>
            </div>
            <div className="p-4 flex-1">
              <ul className="space-y-2 text-xs sm:text-sm text-stone-700">
                {phaseInfo.nutrition.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Movement Card */}
          <div className="rounded-xl border border-stone-200 bg-stone-50/70 overflow-hidden flex flex-col">
            <div className="h-44 w-full bg-stone-200 overflow-hidden relative">
              <img
                src="/src/assets/images/movement_gentle_flow_1791965482639.jpg"
                alt="Movement and Workouts"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                <span className="text-white text-xs font-bold tracking-wide uppercase flex items-center gap-1.5">
                  <Dumbbell className="w-4 h-4 text-violet-300" />
                  <span>Optimal Movement & Exercise</span>
                </span>
              </div>
            </div>
            <div className="p-4 flex-1">
              <ul className="space-y-2 text-xs sm:text-sm text-stone-700">
                {phaseInfo.movement.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-violet-600 font-bold mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Self Care Note */}
        <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 flex items-start gap-3">
          <Heart className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              Self-Care Sanctuary
            </span>
            <p className="text-xs sm:text-sm text-amber-900 mt-0.5 leading-relaxed">
              {phaseInfo.selfCare}
            </p>
          </div>
        </div>
      </div>

      {/* Clinical Guidance Reminder */}
      <div className="p-4 rounded-xl bg-stone-100/70 border border-stone-200 flex items-start gap-3 text-xs text-stone-600">
        <ShieldCheck className="w-4 h-4 text-stone-500 mt-0.5 shrink-0" />
        <p className="leading-relaxed">
          <strong className="text-stone-800">Medical Reassurance:</strong> Normal menstrual cycles range from 21 to 35 days. If your cycles consistently fluctuate by more than 7–9 days, or if you experience debilitating pelvic pain or sudden unusual bleeding, consulting a licensed healthcare practitioner or gynecologist is always recommended.
        </p>
      </div>
    </div>
  );
};
