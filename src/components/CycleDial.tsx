import React from 'react';
import { Droplets, Sparkles, Heart, Activity } from 'lucide-react';
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
  onTogglePeriodQuick
}) => {
  // SVG dimensions
  const size = 320;
  const strokeWidth = 20;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;

  // Clamped cycle day for rendering
  const clampedDay = Math.min(Math.max(1, cycleDay), totalCycleDays);
  const currentAngleFraction = (clampedDay - 1) / totalCycleDays;
  const currentAngleRad = currentAngleFraction * 2 * Math.PI - Math.PI / 2;
  const indicatorX = center + radius * Math.cos(currentAngleRad);
  const indicatorY = center + radius * Math.sin(currentAngleRad);

  // Phase color definitions
  const phaseColors: Record<CyclePhase, { stroke: string; bg: string; text: string; label: string }> = {
    menstrual: {
      stroke: '#F43F5E', // rose-500
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      text: 'text-rose-600',
      label: privacyMode ? 'Phase 1 · Bleed' : 'Menstrual Phase'
    },
    follicular: {
      stroke: '#8B5CF6', // violet-500
      bg: 'bg-violet-50 text-violet-700 border-violet-200',
      text: 'text-violet-600',
      label: privacyMode ? 'Phase 2 · Pre-Peak' : 'Follicular Phase'
    },
    ovulation: {
      stroke: '#F59E0B', // amber-500
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      text: 'text-amber-600',
      label: privacyMode ? 'Phase 3 · Peak Window' : 'Ovulatory Phase'
    },
    luteal: {
      stroke: '#0D9488', // teal-600
      bg: 'bg-teal-50 text-teal-700 border-teal-200',
      text: 'text-teal-600',
      label: privacyMode ? 'Phase 4 · Post-Peak' : 'Luteal Phase'
    }
  };

  const currentTheme = phaseColors[currentPhase];

  // Arc calculation helpers
  const getArc = (startDay: number, endDay: number) => {
    const fractionStart = (startDay - 1) / totalCycleDays;
    const fractionEnd = endDay / totalCycleDays;
    const length = (fractionEnd - fractionStart) * circumference;
    const offset = -fractionStart * circumference + circumference * 0.25; // rotate to 12 o'clock
    return {
      strokeDasharray: `${length} ${circumference - length}`,
      strokeDashoffset: -offset
    };
  };

  // 4 Phase arcs
  const menstrualArc = getArc(1, periodDuration);
  const follicularArc = getArc(periodDuration + 1, Math.max(periodDuration + 1, ovulationCycleDay - 3));
  const fertileArc = getArc(Math.max(periodDuration + 1, ovulationCycleDay - 2), Math.min(totalCycleDays, ovulationCycleDay + 1));
  const lutealArc = getArc(Math.min(totalCycleDays, ovulationCycleDay + 2), totalCycleDays);

  return (
    <div className="relative flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-stone-200 shadow-sm max-w-lg mx-auto w-full">
      {/* SVG Cycle Wheel */}
      <div className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] flex items-center justify-center">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-full transform -rotate-90 origin-center"
        >
          {/* Background track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#F5F5F0"
            strokeWidth={strokeWidth}
          />

          {/* Menstrual Phase Arc (Rose) */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#FDA4AF" // rose-300
            strokeWidth={strokeWidth}
            strokeDasharray={menstrualArc.strokeDasharray}
            strokeDashoffset={menstrualArc.strokeDashoffset}
            strokeLinecap="round"
          />

          {/* Follicular Phase Arc (Violet) */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#DDD6FE" // violet-200
            strokeWidth={strokeWidth}
            strokeDasharray={follicularArc.strokeDasharray}
            strokeDashoffset={follicularArc.strokeDashoffset}
          />

          {/* Fertile / Ovulation Arc (Amber) */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#FDE68A" // amber-200
            strokeWidth={strokeWidth}
            strokeDasharray={fertileArc.strokeDasharray}
            strokeDashoffset={fertileArc.strokeDashoffset}
          />

          {/* Luteal Phase Arc (Teal) */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#99F6E4" // teal-200
            strokeWidth={strokeWidth}
            strokeDasharray={lutealArc.strokeDasharray}
            strokeDashoffset={lutealArc.strokeDashoffset}
          />

          {/* Active progress indicator bead */}
          <circle
            cx={indicatorX}
            cy={indicatorY}
            r={10}
            fill={currentTheme.stroke}
            stroke="#FFFFFF"
            strokeWidth={3}
            className="filter drop-shadow-sm transition-all duration-300"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 pointer-events-none">
          <span className="text-xs font-semibold tracking-wider uppercase text-stone-600 mb-1">
            {currentTheme.label}
          </span>

          <div className="flex items-baseline justify-center gap-1">
            <span className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-stone-900 tabular-nums">
              Day {cycleDay}
            </span>
          </div>

          <p className="text-xs text-stone-600 mt-1 max-w-[190px]">
            {isPeriodToday
              ? (privacyMode ? 'Bleed active today' : `Period: Day ${cycleDay}`)
              : daysUntilNextPeriod === 0
              ? 'Next cycle due today'
              : `Next period in ${daysUntilNextPeriod} days`}
          </p>

          <div className="mt-3 flex items-center gap-1.5 text-xs text-stone-600">
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            <span>Chance of conception: </span>
            <span className="font-semibold text-stone-800">{conceptionChance}</span>
          </div>
        </div>
      </div>

      {/* Quick Action Bar under Dial */}
      <div className="mt-6 w-full flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={onTogglePeriodQuick}
          className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-medium border flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
            isPeriodToday
              ? 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
              : 'bg-white text-stone-700 border-stone-300 hover:border-rose-400 hover:text-rose-600'
          }`}
        >
          <Droplets className={`w-4 h-4 ${isPeriodToday ? 'text-rose-600 fill-rose-600' : 'text-stone-600'}`} />
          <span>
            {isPeriodToday
              ? (privacyMode ? 'Bleed Logged Today (Tap to End)' : 'Period Started (Tap to End)')
              : (privacyMode ? 'Log Bleed Today' : 'Log Period Started Today')}
          </span>
        </button>

        <button
          onClick={onOpenLog}
          className="w-full sm:w-auto shrink-0 py-2.5 px-5 rounded-xl text-xs sm:text-sm font-medium bg-stone-900 text-white hover:bg-stone-800 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
        >
          <Activity className="w-4 h-4" />
          <span>Log Details</span>
        </button>
      </div>

      {/* Phase legend ticks */}
      <div className="mt-5 w-full pt-4 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-600 px-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
          <span>Menstrual</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-violet-400"></span>
          <span>Follicular</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
          <span>Ovulation</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-400"></span>
          <span>Luteal</span>
        </div>
      </div>
    </div>
  );
};
