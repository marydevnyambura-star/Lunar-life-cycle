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
    { id: 'menstrual', label: 'Menstrual', days: 'Days 1–5', color: 'border-[#EC4899] text-[#EC4899] bg-[#FCE7F3]' },
    { id: 'follicular', label: 'Follicular', days: 'Days 6–13', color: 'border-[#7B2CBF] text-[#7B2CBF] bg-[#F6F0FC]' },
    { id: 'ovulation', label: 'Ovulatory', days: 'Days 14–16', color: 'border-amber-400 text-amber-800 bg-amber-50' },
    { id: 'luteal', label: 'Luteal', days: 'Days 17–28', color: 'border-[#542080] text-[#542080] bg-purple-50/70' },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Editorial Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-[#C8A2E8]/40 bg-gradient-to-r from-[#542080] via-[#7B2CBF] to-[#321442] text-white min-h-[220px] sm:min-h-[250px] flex items-center shadow-sm">
        <img
          src="/src/assets/images/wellness_cycle_syncing_1791965481349.jpg"
          alt="Cycle Harmony & Hormonal Balance"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-luminosity"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <div className="relative z-10 p-6 sm:p-10 max-w-2xl">
          <span className="text-xs font-semibold tracking-wider uppercase text-[#FCE7F3]">
            Biological Rhythms & Cycle Syncing
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-display mt-1 text-white tracking-tight">
            Understanding Your 4 Cycle Seasons
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-purple-100/90 leading-relaxed">
            Your body shifts through distinct hormonal phases every month. By syncing your nutrition,
            movement, and daily productivity with your active season, you work in harmony with your biology.
          </p>
        </div>
      </div>

      {/* Phase Segmented Switcher */}
      <div className="bg-white p-2.5 rounded-3xl border border-[#C8A2E8]/40 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {phaseList.map(item => {
            const isSelected = selectedPhase === item.id;
            const isCurrent = currentPhase === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setSelectedPhase(item.id)}
                className={`py-3.5 px-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? `${item.color} shadow-sm font-semibold ring-2 ring-[#7B2CBF]/30`
                    : 'bg-[#F6F0FC]/60 border-[#C8A2E8]/30 text-[#321442] hover:bg-[#F6F0FC]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-display font-bold">{item.label}</span>
                  {isCurrent && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#321442] text-white">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#7B2CBF]/80 mt-0.5 font-mono">{item.days}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Phase Deep Dive */}
      <div className="bg-white rounded-3xl border border-[#C8A2E8]/40 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-[#F6F0FC] pb-4">
          <div className="flex items-baseline gap-3">
            <h3 className="text-xl sm:text-2xl font-bold text-[#321442] font-display">
              {phaseInfo.title}
            </h3>
            <span className="text-xs text-[#7B2CBF] font-mono">({phaseInfo.dayRange})</span>
          </div>
          <p className="mt-2 text-sm text-[#321442]/85 leading-relaxed">
            {phaseInfo.summary}
          </p>
        </div>

        {/* 2-Column Split: Hormone & Energy */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-[#F6F0FC] border border-[#C8A2E8]/30">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#542080] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#EC4899]" />
              <span>Hormonal Landscape</span>
            </h4>
            <p className="mt-2 text-xs sm:text-sm text-[#321442] leading-relaxed">
              {phaseInfo.hormones}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F6F0FC] border border-[#C8A2E8]/30">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#542080] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#7B2CBF]" />
              <span>Energy & Focus Rhythm</span>
            </h4>
            <p className="mt-2 text-xs sm:text-sm text-[#321442] leading-relaxed">
              {phaseInfo.energy}
            </p>
          </div>
        </div>

        {/* Visual Cards for Nutrition and Movement */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Nutrition Card */}
          <div className="rounded-2xl border border-[#C8A2E8]/40 bg-[#F6F0FC]/60 overflow-hidden flex flex-col">
            <div className="h-44 w-full bg-purple-100 overflow-hidden relative">
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
              <ul className="space-y-2 text-xs sm:text-sm text-[#321442]">
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
          <div className="rounded-2xl border border-[#C8A2E8]/40 bg-[#F6F0FC]/60 overflow-hidden flex flex-col">
            <div className="h-44 w-full bg-purple-100 overflow-hidden relative">
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
                  <Dumbbell className="w-4 h-4 text-[#C8A2E8]" />
                  <span>Optimal Movement & Exercise</span>
                </span>
              </div>
            </div>
            <div className="p-4 flex-1">
              <ul className="space-y-2 text-xs sm:text-sm text-[#321442]">
                {phaseInfo.movement.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#7B2CBF] font-bold mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Self Care Note */}
        <div className="p-4 rounded-2xl bg-[#FCE7F3] border border-[#EC4899]/30 flex items-start gap-3">
          <Heart className="w-4 h-4 text-[#EC4899] mt-0.5 shrink-0" />
          <div>
            <span className="text-xs font-bold text-[#542080] uppercase tracking-wider">
              Self-Care Sanctuary
            </span>
            <p className="text-xs sm:text-sm text-[#321442] mt-0.5 leading-relaxed">
              {phaseInfo.selfCare}
            </p>
          </div>
        </div>
      </div>

      {/* Clinical Guidance Reminder */}
      <div className="p-4 rounded-2xl bg-white border border-[#C8A2E8]/40 flex items-start gap-3 text-xs text-[#7B2CBF]/80">
        <ShieldCheck className="w-4 h-4 text-[#7B2CBF] mt-0.5 shrink-0" />
        <p className="leading-relaxed">
          <strong className="text-[#321442]">Medical Guidance:</strong> Typical cycle lengths range between 21 and 35 days. If your cycles consistently fluctuate by more than 7–9 days, or if you experience severe pelvic pain or sudden unusual bleeding, consulting a licensed healthcare practitioner or gynecologist is always recommended.
        </p>
      </div>
    </div>
  );
};
