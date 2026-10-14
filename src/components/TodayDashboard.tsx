import React from 'react';
import { CycleDial } from './CycleDial';
import { CycleRecord, DailyLog, UserSettings, CyclePhase } from '../types';
import { getCurrentCycleStatus, parseDateStr, formatDateStr, addDays, getDayPrediction, PHASE_GUIDE } from '../utils/cycleCalculations';
import { Droplets, Pill, Check, Plus, Heart, Sparkles, Coffee, Moon, Activity, Calendar as CalendarIcon, ArrowRight } from 'lucide-react';

interface TodayDashboardProps {
  currentDateStr: string;
  cycles: CycleRecord[];
  logs: Record<string, DailyLog>;
  settings: UserSettings;
  onOpenLog: (dateStr?: string) => void;
  onTogglePeriodBleedToday: () => void;
  onTogglePillToday: () => void;
  onUpdateWaterToday: (amount: number) => void;
  onNavigateToTab: (tab: 'calendar' | 'phases' | 'history' | 'settings') => void;
}

export const TodayDashboard: React.FC<TodayDashboardProps> = ({
  currentDateStr,
  cycles,
  logs,
  settings,
  onOpenLog,
  onTogglePeriodBleedToday,
  onTogglePillToday,
  onUpdateWaterToday,
  onNavigateToTab
}) => {
  const status = getCurrentCycleStatus(currentDateStr, cycles, settings);
  const todayLog = logs[currentDateStr];
  const isPeriodToday = !!todayLog?.isPeriod;
  const phaseDetails = PHASE_GUIDE[status.currentPhase];

  const todayObj = parseDateStr(currentDateStr);
  const formattedDate = todayObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

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

  return (
    <div className="space-y-6">
      {/* Top Welcome & Pill Reminder Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            {settings.privacyMode ? 'Daily Health Log' : 'Menstrual Cycle Tracker'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-stone-900 tracking-tight">
            {formattedDate}
          </h1>
        </div>

        {/* Pill Reminder Quick Action */}
        {settings.pillReminderEnabled && (
          <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-stone-200 shadow-xs self-start sm:self-auto">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Pill className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <p className="font-semibold text-stone-900">Contraceptive Pill</p>
              <p className="text-stone-500 text-[11px] font-mono">{settings.pillReminderTime}</p>
            </div>
            <button
              onClick={onTogglePillToday}
              className={`ml-2 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                todayLog?.pillTaken
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {todayLog?.pillTaken ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Taken</span>
                </>
              ) : (
                <span>Mark Taken</span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* 7-Day Mini Horizontal Ribbon */}
      <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex items-center justify-between pb-2 px-1 text-xs">
          <span className="font-semibold text-stone-700">This Week</span>
          <button
            onClick={() => onNavigateToTab('calendar')}
            className="text-stone-500 hover:text-stone-900 font-medium flex items-center gap-1 text-[11px]"
          >
            <span>Full Month</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center">
          {ribbonDays.map(item => {
            const pred = item.prediction;
            let dotColor = 'bg-stone-300';
            if (pred.isPeriod) dotColor = 'bg-rose-500';
            else if (pred.isOvulation) dotColor = 'bg-amber-400';
            else if (pred.isFertile) dotColor = 'bg-amber-300';
            else if (pred.phase === 'follicular') dotColor = 'bg-violet-400';
            else if (pred.phase === 'luteal') dotColor = 'bg-teal-400';

            return (
              <button
                key={item.dateStr}
                onClick={() => onOpenLog(item.dateStr)}
                className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 transition-all ${
                  item.isToday
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-50 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <span className={`text-[10px] font-semibold uppercase ${item.isToday ? 'text-stone-300' : 'text-stone-400'}`}>
                  {item.dayName}
                </span>
                <span className="font-mono text-xs font-bold">
                  {item.dayNum}
                </span>
                <span className={`w-2 h-2 rounded-full mt-0.5 ${item.isToday && pred.isPeriod ? 'bg-rose-400 ring-2 ring-white' : dotColor}`} />
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
            onTogglePeriodQuick={onTogglePeriodBleedToday}
          />
        </div>

        {/* Right Column (7 cols on lg): Today's Vitals & Phase Syncing Guidance */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Today's Logged Vitals & Symptoms */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-stone-700" />
                <h3 className="text-base font-bold text-stone-900 font-display">
                  Today's Health Summary
                </h3>
              </div>
              <button
                onClick={() => onOpenLog(currentDateStr)}
                className="text-xs font-medium text-rose-600 hover:text-rose-700"
              >
                {todayLog ? 'Edit Details' : '+ Log Now'}
              </button>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Flow */}
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-[11px] text-stone-500 font-medium">Flow Intensity</span>
                <p className="mt-1 text-sm font-bold text-stone-900 capitalize flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-rose-500" />
                  <span>{todayLog?.flow || (isPeriodToday ? 'Active Bleed' : 'None')}</span>
                </p>
              </div>

              {/* Water glasses */}
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex flex-col justify-between">
                <span className="text-[11px] text-stone-500 font-medium">Hydration</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm font-bold text-stone-900 font-mono">
                    {todayLog?.waterGlasses ?? 6} glasses
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onUpdateWaterToday(Math.max(0, (todayLog?.waterGlasses ?? 6) - 1))}
                      className="w-5 h-5 rounded bg-white border border-stone-300 text-stone-700 text-xs flex items-center justify-center font-bold hover:bg-stone-100"
                    >
                      -
                    </button>
                    <button
                      onClick={() => onUpdateWaterToday((todayLog?.waterGlasses ?? 6) + 1)}
                      className="w-5 h-5 rounded bg-white border border-stone-300 text-stone-700 text-xs flex items-center justify-center font-bold hover:bg-stone-100"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Sleep */}
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-[11px] text-stone-500 font-medium">Rest & Sleep</span>
                <p className="mt-1 text-sm font-bold text-stone-900 font-mono flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5 text-stone-500" />
                  <span>{todayLog?.sleepHours ?? 8} hrs</span>
                </p>
              </div>
            </div>

            {/* Logged Symptoms & Moods preview */}
            {todayLog && (todayLog.symptoms.length > 0 || todayLog.moods.length > 0) ? (
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <span className="text-xs font-semibold text-stone-600">Logged Sensations</span>
                <div className="flex flex-wrap gap-1.5">
                  {todayLog.symptoms.map(s => (
                    <span
                      key={s}
                      className="text-xs font-medium text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-lg capitalize"
                    >
                      {s.replace('_', ' ')}
                    </span>
                  ))}
                  {todayLog.moods.map(m => (
                    <span
                      key={m}
                      className="text-xs font-medium text-violet-900 bg-violet-50 border border-violet-200 px-2.5 py-0.5 rounded-lg capitalize"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-stone-50 text-xs text-stone-500 flex items-center justify-between">
                <span>No symptoms or moods logged for today yet.</span>
                <button
                  onClick={() => onOpenLog(currentDateStr)}
                  className="font-medium text-stone-900 hover:underline"
                >
                  Log Now
                </button>
              </div>
            )}

            {/* Notes if any */}
            {todayLog?.notes && (
              <p className="text-xs text-stone-600 bg-stone-50 p-3 rounded-xl border border-stone-200 italic">
                "{todayLog.notes}"
              </p>
            )}
          </div>

          {/* Card 2: Phase Syncing Daily Guide */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Phase-Synced Guidance
                </span>
                <h3 className="text-base font-bold text-stone-900 font-display">
                  {phaseDetails.title} Recommendation
                </h3>
              </div>
              <button
                onClick={() => onNavigateToTab('phases')}
                className="text-xs font-medium text-stone-600 hover:text-stone-900 flex items-center gap-1"
              >
                <span>Read Full Guide</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
              {phaseDetails.summary}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wide flex items-center gap-1.5">
                  <span>🥗</span>
                  <span>Recommended Nutrition</span>
                </span>
                <p className="text-xs text-emerald-950 mt-1 leading-relaxed">
                  {phaseDetails.nutrition[0]} & {phaseDetails.nutrition[1].toLowerCase()}.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-violet-50/60 border border-violet-200/80">
                <span className="text-xs font-bold text-violet-900 uppercase tracking-wide flex items-center gap-1.5">
                  <span>🧘</span>
                  <span>Ideal Movement</span>
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
