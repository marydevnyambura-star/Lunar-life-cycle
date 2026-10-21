import React, { useState, useEffect } from 'react';
import { CycleDial } from './CycleDial';
import { CycleRecord, DailyLog, UserSettings, CyclePhase, Mood } from '../types';
import { getCurrentCycleStatus, parseDateStr, formatDateStr, addDays, getDayPrediction, PHASE_GUIDE, formatDisplayDate } from '../utils/cycleCalculations';
import {
  Droplets,
  Pill,
  Check,
  Plus,
  Heart,
  Sparkles,
  Coffee,
  Moon,
  Activity,
  Calendar as CalendarIcon,
  ArrowRight,
  Flame,
  Zap,
  Smile,
  Compass,
  Clock
} from 'lucide-react';

interface TodayDashboardProps {
  currentDateStr: string;
  cycles: CycleRecord[];
  logs: Record<string, DailyLog>;
  settings: UserSettings;
  onOpenLog: (dateStr?: string) => void;
  onOpenRecordPeriodStart: () => void;
  onTogglePeriodBleedToday: () => void;
  onTogglePillToday: () => void;
  onUpdateWaterToday: (amount: number) => void;
  onQuickMoodSelect: (mood: Mood) => void;
  onNavigateToTab: (tab: 'calendar' | 'phases' | 'history' | 'profile' | 'settings') => void;
}

export const TodayDashboard: React.FC<TodayDashboardProps> = ({
  currentDateStr,
  cycles,
  logs,
  settings,
  onOpenLog,
  onOpenRecordPeriodStart,
  onTogglePeriodBleedToday,
  onTogglePillToday,
  onUpdateWaterToday,
  onQuickMoodSelect,
  onNavigateToTab
}) => {
  const status = getCurrentCycleStatus(currentDateStr, cycles, settings);
  const todayLog = logs[currentDateStr];
  const isPeriodToday = !!todayLog?.isPeriod;
  const phaseDetails = PHASE_GUIDE[status.currentPhase];

  const todayObj = parseDateStr(currentDateStr);
  const formattedDate = formatDisplayDate(todayObj);

  // Live time synchronization
  const [liveTime, setLiveTime] = useState<string>(() => {
    return new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTime(new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Generate 7-day mini ribbon (3 days before, today, 3 days after)
  const ribbonDays = [-3, -2, -1, 0, 1, 2, 3].map(offset => {
    const d = addDays(todayObj, offset);
    const dStr = formatDateStr(d);
    const pred = getDayPrediction(dStr, status.cycleStartDateStr, settings, logs, cycles);
    return {
      dateStr: dStr,
      dayNum: d.getDate(),
      dayName: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
      isToday: offset === 0,
      prediction: pred
    };
  });

  // Lively Phase Energy & Hormone Meters
  const phaseMeters: Record<CyclePhase, {
    energy: number;
    focus: number;
    social: number;
    restNeed: number;
    vibeQuote: string;
    vibeBadge: string;
    bgAccent: string;
  }> = {
    menstrual: {
      energy: 40,
      focus: 60,
      social: 45,
      restNeed: 95,
      vibeQuote: 'Honor your inward rhythm. Nourish with warm iron-rich soups, gentle stretching, and deep sleep.',
      vibeBadge: '🩸 Inner Winter · Intuitive & Restorative',
      bgAccent: 'from-rose-500/10 via-pink-500/5 to-transparent'
    },
    follicular: {
      energy: 85,
      focus: 90,
      social: 80,
      restNeed: 35,
      vibeQuote: 'Estradiol is surging! Your brain chemistry is primed for high creativity, ambitious brainstorming, and progressive strength.',
      vibeBadge: '🌱 Inner Spring · Vitality & Sharp Focus',
      bgAccent: 'from-violet-500/10 via-indigo-500/5 to-transparent'
    },
    ovulation: {
      energy: 95,
      focus: 95,
      social: 98,
      restNeed: 30,
      vibeQuote: 'Peak biological radiance! Highest communicative confidence, magnetic energy, and peak fertility window.',
      vibeBadge: '✨ Inner Summer · Peak Radiance & Charisma',
      bgAccent: 'from-amber-500/15 via-orange-500/5 to-transparent'
    },
    luteal: {
      energy: 65,
      focus: 85,
      social: 55,
      restNeed: 80,
      vibeQuote: 'Progesterone is guiding your nest. Excellent window to organize finances, complete tasks, and wind down early.',
      vibeBadge: '🍂 Inner Autumn · Grounded & Detail-Oriented',
      bgAccent: 'from-teal-500/10 via-emerald-500/5 to-transparent'
    }
  };

  const currentVibe = phaseMeters[status.currentPhase];

  const quickMoodList: { id: Mood; emoji: string; label: string }[] = [
    { id: 'calm', emoji: '🌿', label: 'Calm' },
    { id: 'happy', emoji: '☀️', label: 'Happy' },
    { id: 'energetic', emoji: '⚡', label: 'Energetic' },
    { id: 'sensitive', emoji: '💧', label: 'Sensitive' },
    { id: 'irritable', emoji: '🔥', label: 'Irritable' },
    { id: 'exhausted', emoji: '🛌', label: 'Tired' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Action Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{settings.privacyMode ? 'Daily Health Log' : 'Menstrual Cycle Companion'}</span>
            </span>
          </div>
          <div className="flex flex-wrap items-baseline gap-3">
            <h1 className="text-2xl sm:text-4xl font-extrabold font-display text-stone-900 tracking-tight">
              {formattedDate}
            </h1>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-stone-200 text-stone-700 text-xs font-mono font-bold shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-rose-500" />
              <span>{liveTime}</span>
            </div>
          </div>
          <p className="text-xs text-stone-500 mt-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            <span>{status.estimateLabel} · <span className="text-stone-400">All predictions are estimates</span></span>
          </p>
        </div>

        {/* Pill Reminder Quick Action & Period Start Trigger */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenRecordPeriodStart}
            className="py-2.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md shadow-rose-200 transition-all cursor-pointer"
          >
            <Droplets className="w-4 h-4 fill-white" />
            <span>Record Period Start</span>
          </button>

          {settings.pillReminderEnabled && (
            <div className="flex items-center gap-3 p-2.5 sm:p-3 bg-white rounded-2xl border border-stone-200 shadow-xs">
              <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Pill className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-stone-900 leading-tight">Pill</p>
                <p className="text-stone-400 text-[10px] font-mono">{settings.pillReminderTime}</p>
              </div>
              <button
                onClick={onTogglePillToday}
                className={`ml-1 px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  todayLog?.pillTaken
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {todayLog?.pillTaken ? (
                  <>
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>Taken</span>
                  </>
                ) : (
                  <span>Take</span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Lively Period Start Notice Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50/50 border border-rose-200/80 p-4 sm:p-5 shadow-xs">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-rose-200">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-stone-900 font-display">
                Did your period start today or recently?
              </h2>
              <p className="text-xs text-stone-600 mt-0.5 max-w-xl">
                Tap to record your start date. LumaCycle will immediately recalculate your biological cycle day, upcoming fertile window, and personalized hormone rhythm.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenRecordPeriodStart}
            className="self-start sm:self-auto px-4 py-2 bg-stone-900 hover:bg-stone-800 active:scale-95 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs whitespace-nowrap transition-all"
          >
            <span>Set Start Date</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 7-Day Mini Horizontal Ribbon with lively dots */}
      <div className="bg-white p-3.5 rounded-3xl border border-stone-200 shadow-xs">
        <div className="flex items-center justify-between pb-2.5 px-1 text-xs">
          <span className="font-bold text-stone-800 flex items-center gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5 text-stone-500" />
            <span>Cycle Week Forecast</span>
          </span>
          <button
            onClick={() => onNavigateToTab('calendar')}
            className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 text-xs"
          >
            <span>Open Calendar</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center">
          {ribbonDays.map(item => {
            const pred = item.prediction;
            let dotColor = 'bg-stone-300';
            if (pred.isPeriod) dotColor = 'bg-rose-500 ring-2 ring-rose-200';
            else if (pred.isOvulation) dotColor = 'bg-amber-400 ring-2 ring-amber-200';
            else if (pred.isFertile) dotColor = 'bg-amber-300';
            else if (pred.phase === 'follicular') dotColor = 'bg-violet-400';
            else if (pred.phase === 'luteal') dotColor = 'bg-teal-400';

            return (
              <button
                key={item.dateStr}
                onClick={() => onOpenLog(item.dateStr)}
                className={`py-2 px-1 rounded-2xl flex flex-col items-center gap-1 transition-all ${
                  item.isToday
                    ? 'bg-stone-900 text-white shadow-md shadow-stone-300'
                    : 'bg-stone-50 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <span className={`text-[10px] font-bold uppercase ${item.isToday ? 'text-stone-300' : 'text-stone-600'}`}>
                  {item.dayName}
                </span>
                <span className="font-mono text-xs font-bold">
                  {item.dayNum}
                </span>
                <span className={`w-2.5 h-2.5 rounded-full mt-0.5 ${dotColor}`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 2-Column Split: Cycle Wheel + Today's Summary & Phase Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 cols on lg): Cycle Dial */}
        <div className="lg:col-span-5 flex justify-center">
          <CycleDial
            cycleDay={status.cycleDay}
            totalCycleDays={status.totalCycleDays}
            periodDuration={status.periodDuration}
            ovulationCycleDay={status.ovulationCycleDay}
            currentPhase={status.currentPhase}
            daysUntilNextPeriod={status.daysUntilNextPeriod}
            conceptionChance={status.conceptionChance}
            isPeriodToday={isPeriodToday}
            flowToday={todayLog?.flow}
            privacyMode={settings.privacyMode}
            onOpenLog={() => onOpenLog(currentDateStr)}
            onOpenRecordPeriodStart={onOpenRecordPeriodStart}
            onTogglePeriodQuick={onTogglePeriodBleedToday}
          />
        </div>

        {/* Right Column (7 cols on lg): Lively Energy Meters + Today's Vitals */}
        <div className="lg:col-span-7 space-y-6">
          {/* Lively Card 1: Today's Biological Energy & Hormone Vibe */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-rose-500" />
                <div>
                  <h2 className="text-base font-bold text-stone-900 font-display">
                    Today's Biological Vibe
                  </h2>
                  <p className="text-[11px] text-stone-600">
                    Calculated from your active hormonal phase
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-stone-100 text-stone-800">
                {currentVibe.vibeBadge}
              </span>
            </div>

            {/* Motivational Body Wisdom Quote */}
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed bg-stone-50 p-3.5 rounded-2xl border border-stone-200/70 italic">
              "{currentVibe.vibeQuote}"
            </p>

            {/* Biological Rhythms Progress Bars */}
            <div className="grid grid-cols-2 gap-4 pt-1">
              {/* Energy */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-stone-600 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>Physical Stamina</span>
                  </span>
                  <span className="font-mono text-stone-900">{currentVibe.energy}%</span>
                </div>
                <div className="h-2.5 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-rose-500 rounded-full transition-all duration-700"
                    style={{ width: `${currentVibe.energy}%` }}
                  />
                </div>
              </div>

              {/* Mental Focus */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-stone-600 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                    <span>Creative Focus</span>
                  </span>
                  <span className="font-mono text-stone-900">{currentVibe.focus}%</span>
                </div>
                <div className="h-2.5 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-400 to-indigo-500 rounded-full transition-all duration-700"
                    style={{ width: `${currentVibe.focus}%` }}
                  />
                </div>
              </div>

              {/* Social Drive */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-stone-600 flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    <span>Social & Drive</span>
                  </span>
                  <span className="font-mono text-stone-900">{currentVibe.social}%</span>
                </div>
                <div className="h-2.5 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-pink-400 to-rose-500 rounded-full transition-all duration-700"
                    style={{ width: `${currentVibe.social}%` }}
                  />
                </div>
              </div>

              {/* Rest Need */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-stone-600 flex items-center gap-1">
                    <Moon className="w-3.5 h-3.5 text-teal-600" />
                    <span>Restorative Need</span>
                  </span>
                  <span className="font-mono text-stone-900">{currentVibe.restNeed}%</span>
                </div>
                <div className="h-2.5 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full transition-all duration-700"
                    style={{ width: `${currentVibe.restNeed}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Quick Mood Selection Chips */}
            <div className="pt-3 border-t border-stone-100 space-y-2">
              <span className="text-xs font-bold text-stone-700 block">
                How are you feeling right now?
              </span>
              <div className="flex flex-wrap gap-2">
                {quickMoodList.map(item => {
                  const isLogged = todayLog?.moods?.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => onQuickMoodSelect(item.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all active:scale-95 ${
                        isLogged
                          ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100 hover:border-stone-300'
                      }`}
                    >
                      <span>{item.emoji}</span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Lively Card 2: Today's Health & Hydration Summary */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-stone-700" />
                <h2 className="text-base font-bold text-stone-900 font-display">
                  Daily Vitals & Flow
                </h2>
              </div>
              <button
                onClick={() => onOpenLog(currentDateStr)}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
              >
                <span>Full Log</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Flow */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                <span className="text-[11px] text-stone-600 font-medium">Flow</span>
                <p className="mt-1 text-sm font-bold text-stone-900 capitalize flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-rose-500 fill-rose-500" />
                  <span>{todayLog?.flow || (isPeriodToday ? 'Active' : 'None')}</span>
                </p>
              </div>

              {/* Water glasses */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col justify-between">
                <span className="text-[11px] text-stone-600 font-medium">Hydration</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm font-bold text-stone-900 font-mono">
                    {todayLog?.waterGlasses ?? 6} cups
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onUpdateWaterToday(Math.max(0, (todayLog?.waterGlasses ?? 6) - 1))}
                      className="w-5 h-5 rounded-md bg-white border border-stone-300 text-stone-700 text-xs flex items-center justify-center font-bold hover:bg-stone-100"
                    >
                      -
                    </button>
                    <button
                      onClick={() => onUpdateWaterToday((todayLog?.waterGlasses ?? 6) + 1)}
                      className="w-5 h-5 rounded-md bg-white border border-stone-300 text-stone-700 text-xs flex items-center justify-center font-bold hover:bg-stone-100"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Sleep */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                <span className="text-[11px] text-stone-600 font-medium">Sleep</span>
                <p className="mt-1 text-sm font-bold text-stone-900 font-mono flex items-center gap-1.5">
                  <Moon className="w-4 h-4 text-stone-500" />
                  <span>{todayLog?.sleepHours ?? 8} hrs</span>
                </p>
              </div>
            </div>

            {/* Logged Symptoms preview */}
            {todayLog && (todayLog.symptoms.length > 0 || todayLog.moods.length > 0) ? (
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <span className="text-xs font-bold text-stone-700">Logged Today</span>
                <div className="flex flex-wrap gap-1.5">
                  {todayLog.symptoms.map(s => (
                    <span
                      key={s}
                      className="text-xs font-semibold text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-lg capitalize"
                    >
                      {s.replace('_', ' ')}
                    </span>
                  ))}
                  {todayLog.moods.map(m => (
                    <span
                      key={m}
                      className="text-xs font-semibold text-violet-900 bg-violet-50 border border-violet-200 px-2.5 py-0.5 rounded-lg capitalize"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* Lively Card 3: Phase-Synced Nutrition & Movement */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                  Sync Your Biology
                </span>
                <h2 className="text-base font-bold text-stone-900 font-display">
                  {phaseDetails.title} Suggestions
                </h2>
              </div>
              <button
                onClick={() => onNavigateToTab('phases')}
                className="text-xs font-bold text-stone-600 hover:text-stone-900 flex items-center gap-1"
              >
                <span>Hormone Guide</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wide flex items-center gap-1.5">
                  <span>🥗</span>
                  <span>Recommended Nutrition</span>
                </span>
                <p className="text-xs text-emerald-950 mt-1 leading-relaxed">
                  {phaseDetails.nutrition[0]} & {phaseDetails.nutrition[1].toLowerCase()}.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-violet-50/70 border border-violet-200/80">
                <span className="text-xs font-bold text-violet-900 uppercase tracking-wide flex items-center gap-1.5">
                  <span>🧘</span>
                  <span>Optimal Movement</span>
                </span>
                <p className="text-xs text-violet-950 mt-1 leading-relaxed">
                  {phaseDetails.movement[0]} & {phaseDetails.movement[1].toLowerCase()}.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
