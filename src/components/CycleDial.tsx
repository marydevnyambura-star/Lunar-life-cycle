import React from 'react';
import { Droplets, Sparkles, Heart, Activity, Calendar, ArrowRight } from 'lucide-react';
import { CyclePhase, FlowIntensity } from '../types';

interface CycleDialProps {
  cycleDay: number;
  totalCycleDays: number;
  periodDuration: number;
  ovulationCycleDay: number;
  currentPhase: CyclePhase;
  daysUntilNextPeriod: number;
  conceptionChance: 'Low' | 'Moderate' | 'High' | 'Very High';
  isPeriodToday: boolean;
  flowToday?: FlowIntensity;
  privacyMode: boolean;
  onOpenLog: () => void;
  onOpenRecordPeriodStart: () => void;
  onTogglePeriodQuick: () => void;
}

export const CycleDial: React.FC<CycleDialProps> = ({
  cycleDay,
  totalCycleDays,
  periodDuration,
  ovulationCycleDay,
  currentPhase,
  daysUntilNextPeriod,
  conceptionChance,
  isPeriodToday,
  flowToday,
  privacyMode,
  onOpenLog,
  onOpenRecordPeriodStart,
  onTogglePeriodQuick
}) => {
  // SVG dimensions
  const size = 320;
  const strokeWidth = 22;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;

  // Clamped cycle day for rendering
  const clampedDay = Math.min(Math.max(1, cycleDay), totalCycleDays);
  const currentAngleFraction = (clampedDay - 1) / totalCycleDays;
  const currentAngleRad = currentAngleFraction * 2 * Math.PI - Math.PI / 2;
  const indicatorX = center + radius * Math.cos(currentAngleRad);
  const indicatorY = center + radius * Math.sin(currentAngleRad);

  // Phase color definitions & lively ambience in Purple & Pink
  const phaseThemes: Record<CyclePhase, {
    stroke: string;
    bgGlow: string;
    text: string;
    badgeBg: string;
    label: string;
    vibe: string;
    icon: string;
  }> = {
    menstrual: {
      stroke: '#EC4899', // Bright Pink
      bgGlow: 'from-pink-500/15 via-purple-500/5 to-transparent',
      text: 'text-[#EC4899]',
      badgeBg: 'bg-[#FCE7F3] text-pink-700 border-pink-300',
      label: privacyMode ? 'Phase 1 · Flow' : 'Menstrual Phase',
      vibe: 'Rest & Restore',
      icon: '🩸'
    },
    follicular: {
      stroke: '#C8A2E8', // Lavender
      bgGlow: 'from-purple-500/15 via-lavender-500/5 to-transparent',
      text: 'text-[#7B2CBF]',
      badgeBg: 'bg-purple-100 text-[#542080] border-[#C8A2E8]',
      label: privacyMode ? 'Phase 2 · Rising' : 'Follicular Phase',
      vibe: 'Vitality & Creative Spark',
      icon: '🌱'
    },
    ovulation: {
      stroke: '#F59E0B', // Gold / Amber
      bgGlow: 'from-amber-500/15 via-pink-500/5 to-transparent',
      text: 'text-amber-700',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-200',
      label: privacyMode ? 'Phase 3 · Peak' : 'Ovulatory Phase',
      vibe: 'Peak Confidence & Energy',
      icon: '✨'
    },
    luteal: {
      stroke: '#7B2CBF', // Royal Purple
      bgGlow: 'from-purple-600/15 via-pink-500/5 to-transparent',
      text: 'text-[#7B2CBF]',
      badgeBg: 'bg-purple-50 text-[#542080] border-purple-200',
      label: privacyMode ? 'Phase 4 · Grounding' : 'Luteal Phase',
      vibe: 'Focus & Replenish',
      icon: '🌿'
    }
  };

  const currentTheme = phaseThemes[currentPhase];

  // Arc calculation helpers
  const getArc = (startDay: number, endDay: number) => {
    const fractionStart = (startDay - 1) / totalCycleDays;
    const fractionEnd = endDay / totalCycleDays;
    const length = (fractionEnd - fractionStart) * circumference;
    const offset = -fractionStart * circumference + circumference * 0.25;
    return {
      strokeDasharray: `${length} ${circumference - length}`,
      strokeDashoffset: -offset
    };
  };

  const menstrualArc = getArc(1, periodDuration);
  const follicularArc = getArc(periodDuration + 1, Math.max(periodDuration + 1, ovulationCycleDay - 3));
  const fertileArc = getArc(Math.max(periodDuration + 1, ovulationCycleDay - 2), Math.min(totalCycleDays, ovulationCycleDay + 1));
  const lutealArc = getArc(Math.min(totalCycleDays, ovulationCycleDay + 2), totalCycleDays);

  return (
    <div className="relative flex flex-col items-center justify-center p-6 sm:p-7 bg-white rounded-3xl border border-[#C8A2E8]/40 shadow-xs max-w-lg mx-auto w-full overflow-hidden transition-all duration-300 hover:shadow-md">
      {/* Dynamic ambient radial backdrop */}
      <div className={`absolute inset-0 bg-radial ${currentTheme.bgGlow} pointer-events-none transition-colors duration-700`} />

      {/* Top Lively Phase Chip */}
      <div className="relative z-10 mb-2 flex items-center gap-2">
        <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 shadow-xs ${currentTheme.badgeBg}`}>
          <span>{currentTheme.icon}</span>
          <span>{currentTheme.label}</span>
          <span className="opacity-40">·</span>
          <span className="font-medium text-[11px] opacity-90">{currentTheme.vibe}</span>
        </span>
      </div>

      {/* SVG Cycle Wheel */}
      <div className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] flex items-center justify-center my-1">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-full transform -rotate-90 origin-center filter drop-shadow-xs"
        >
          {/* Subtle outer track glow */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#F6F0FC"
            strokeWidth={strokeWidth}
          />

          {/* Menstrual Phase Arc (Bright Pink) */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#EC4899"
            strokeWidth={strokeWidth}
            strokeDasharray={menstrualArc.strokeDasharray}
            strokeDashoffset={menstrualArc.strokeDashoffset}
            strokeLinecap="round"
          />

          {/* Follicular Phase Arc (Lavender) */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#C8A2E8"
            strokeWidth={strokeWidth}
            strokeDasharray={follicularArc.strokeDasharray}
            strokeDashoffset={follicularArc.strokeDashoffset}
          />

          {/* Fertile / Ovulation Arc (Amber Gold) */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#FBBF24"
            strokeWidth={strokeWidth}
            strokeDasharray={fertileArc.strokeDasharray}
            strokeDashoffset={fertileArc.strokeDashoffset}
          />

          {/* Luteal Phase Arc (Royal Purple) */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#7B2CBF"
            strokeWidth={strokeWidth}
            strokeDasharray={lutealArc.strokeDasharray}
            strokeDashoffset={lutealArc.strokeDashoffset}
          />

          {/* Active progress indicator bead with glow ring */}
          <circle
            cx={indicatorX}
            cy={indicatorY}
            r={13}
            fill={currentTheme.stroke}
            opacity={0.3}
            className="animate-ping origin-center"
          />
          <circle
            cx={indicatorX}
            cy={indicatorY}
            r={11}
            fill={currentTheme.stroke}
            stroke="#FFFFFF"
            strokeWidth={3.5}
            className="filter drop-shadow-md transition-all duration-300"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
          <span className="text-[11px] font-bold tracking-wider uppercase text-[#7B2CBF] mb-0.5">
            CYCLE TRACKER
          </span>

          <div className="flex items-baseline justify-center gap-1.5">
            <span className="font-display text-4xl sm:text-5xl font-black tracking-tight text-[#321442] tabular-nums">
              Day {cycleDay}
            </span>
          </div>

          <p className="text-xs font-semibold text-stone-700 mt-1 max-w-[200px]">
            {isPeriodToday
              ? (privacyMode ? 'Bleed active today' : `Period: Day ${cycleDay}`)
              : daysUntilNextPeriod === 0
              ? 'Next period due today!'
              : `Next period in ${daysUntilNextPeriod} days`}
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F6F0FC] border border-[#C8A2E8]/50 text-[11px] text-[#542080] shadow-2xs">
            <Heart className="w-3.5 h-3.5 text-[#EC4899] fill-pink-200" />
            <span>Conception chance: </span>
            <span className="font-bold text-[#321442]">{conceptionChance}</span>
          </div>
        </div>
      </div>

      {/* Record Period Start Quick CTA Card */}
      <div className="w-full mt-5 space-y-2.5">
        <button
          onClick={onOpenRecordPeriodStart}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#542080] via-[#7B2CBF] to-[#EC4899] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-purple-300/60 hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Droplets className="w-4 h-4 fill-white" />
          <span>Record When Period Started</span>
          <ArrowRight className="w-4 h-4 ml-1 opacity-80" />
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onTogglePeriodQuick}
            className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer ${
              isPeriodToday
                ? 'bg-pink-50 text-pink-700 border-pink-300 hover:bg-pink-100'
                : 'bg-[#F6F0FC] text-[#542080] border-[#C8A2E8]/50 hover:bg-purple-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#EC4899]" />
            <span>{isPeriodToday ? 'Mark Bleed Ended' : 'Quick Today Flow'}</span>
          </button>

          <button
            onClick={onOpenLog}
            className="py-2 px-3 rounded-xl text-xs font-semibold bg-[#542080] text-white hover:bg-[#7B2CBF] transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5 text-pink-300" />
            <span>Log Symptoms</span>
          </button>
        </div>
      </div>

      {/* Lively Phase Ticks */}
      <div className="mt-5 w-full pt-4 border-t border-purple-100 flex items-center justify-between text-[11px] text-stone-600 px-1 font-medium">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#EC4899]"></span>
          <span>Menstrual</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#C8A2E8]"></span>
          <span>Follicular</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
          <span>Ovulation</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#7B2CBF]"></span>
          <span>Luteal</span>
        </div>
      </div>
    </div>
  );
};
