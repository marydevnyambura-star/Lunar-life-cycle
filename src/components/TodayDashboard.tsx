import React, { useState, useEffect } from 'react';
import { CycleDial } from './CycleDial';
import { CycleRecord, DailyLog, UserSettings, CyclePhase, Mood } from '../types';
import {
  getCurrentCycleStatus,
  calculateIntelligentPrediction,
  generateHealthInsights,
  parseDateStr,
  formatDateStr,
  addDays,
  getDayPrediction,
  PHASE_GUIDE,
  formatDisplayDate,
  formatShortDate
} from '../utils/cycleCalculations';
import { HealthInsightsSection } from './HealthInsightsSection';
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
  Clock,
  AlertCircle,
  HelpCircle,
  BarChart3,
  ShieldAlert
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
  onNavigateToTab: (tab: 'calendar' | 'insights' | 'phases' | 'history' | 'profile' | 'settings') => void;
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
  const prediction = status.prediction;
  const insights = generateHealthInsights(cycles, logs, settings);

  const todayLog = logs[currentDateStr];
  const isPeriodToday = !!todayLog?.isPeriod;
  const phaseDetails = PHASE_GUIDE[status.currentPhase];

  const todayObj = parseDateStr(currentDateStr);
  const formattedDate = formatDisplayDate(todayObj);

  // Live time synchronization in local timezone
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

  // Mood options
  const moodChips: { id: Mood; emoji: string; label: string }[] = [
    { id: 'calm', emoji: '🌿', label: 'Calm' },
    { id: 'happy', emoji: '☀️', label: 'Happy' },
    { id: 'energetic', emoji: '⚡', label: 'Energetic' },
    { id: 'sensitive', emoji: '💧', label: 'Sensitive' },
    { id: 'irritable', emoji: '🔥', label: 'Irritable' },
    { id: 'exhausted', emoji: '🛌', label: 'Tired' }
  ];

  // Sorted cycles for visual history trend
  const sortedCycles = [...cycles].sort((a, b) => b.startDate.localeCompare(a.startDate));

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Action Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-[#7B2CBF] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#EC4899]" />
              <span>{settings.privacyMode ? 'Daily Health Log' : 'LumaCycle Companion'}</span>
            </span>
          </div>
          <div className="flex flex-wrap items-baseline gap-3">
            <h1 className="text-2xl sm:text-4xl font-extrabold font-display text-[#321442] tracking-tight">
              {formattedDate}
            </h1>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#C8A2E8]/40 text-[#542080] text-xs font-mono font-bold shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-[#EC4899]" />
              <span>{liveTime}</span>
            </div>
          </div>
          <p className="text-xs text-stone-600 mt-1.5 flex items-center gap-1.5 flex-wrap">
            <span className="w-2 h-2 rounded-full bg-[#EC4899]"></span>
            <span className="font-medium text-[#542080]">{status.estimateLabel}</span>
            <span className="text-stone-400">· Predictions are estimates</span>
          </p>
        </div>

        {/* Pill Reminder & Record Period Start Action */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenRecordPeriodStart}
            className="py-2.5 px-4 rounded-2xl bg-[#EC4899] hover:bg-pink-600 active:scale-[0.98] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md shadow-pink-200 transition-all cursor-pointer"
          >
            <Droplets className="w-4 h-4 fill-white" />
            <span>Record Period Start</span>
          </button>

          {settings.pillReminderEnabled && (
            <div className="flex items-center gap-3 p-2.5 sm:p-3 bg-white rounded-2xl border border-[#C8A2E8]/40 shadow-xs">
              <div className="w-7 h-7 rounded-xl bg-purple-50 text-[#7B2CBF] flex items-center justify-center shrink-0">
                <Pill className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-[#321442] leading-tight">Pill</p>
                <p className="text-stone-400 text-[10px] font-mono">{settings.pillReminderTime}</p>
              </div>
              <button
                onClick={onTogglePillToday}
                className={`ml-1 px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  todayLog?.pillTaken
                    ? 'bg-[#7B2CBF] text-white shadow-xs'
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

      {/* Intelligent Prediction & Early / Late Period Status Card */}
      <div className="bg-white rounded-3xl border border-[#C8A2E8]/40 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#542080] to-[#7B2CBF] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5 text-pink-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#321442] font-display">
                  Intelligent Period Prediction
                </h2>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${prediction.statusBadgeColor}`}>
                  {prediction.statusLabel}
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-0.5">
                {prediction.statusDescription}
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab('calendar')}
            className="self-start sm:self-auto text-xs font-bold text-[#7B2CBF] hover:text-[#542080] flex items-center gap-1 cursor-pointer"
          >
            <span>View Calendar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Prediction Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 bg-[#F6F0FC] rounded-2xl border border-[#C8A2E8]/40 text-xs">
            <span className="text-stone-500 block text-[11px]">Next Period Estimated Date:</span>
            <span className="text-base font-extrabold text-[#542080] mt-0.5 block font-display">
              {prediction.predictedStartDate ? formatShortDate(parseDateStr(prediction.predictedStartDate)) : 'Calculating'}
            </span>
            <span className="text-[11px] text-stone-600 mt-0.5 block">
              Range: {formatShortDate(parseDateStr(prediction.predictedRangeStart))} – {formatShortDate(parseDateStr(prediction.predictedRangeEnd))} (±{prediction.uncertaintyDays}d)
            </span>
          </div>

          <div className="p-3.5 bg-[#F6F0FC] rounded-2xl border border-[#C8A2E8]/40 text-xs">
            <span className="text-stone-500 block text-[11px]">Countdown & Status:</span>
            <span className="text-base font-extrabold text-[#EC4899] mt-0.5 block font-display">
              {prediction.status === 'period_started'
                ? 'Period Active'
                : prediction.daysRemainingOrOverdue > 0
                ? `${prediction.daysRemainingOrOverdue} days remaining`
                : prediction.daysRemainingOrOverdue === 0
                ? 'Due today'
                : `${Math.abs(prediction.daysRemainingOrOverdue)} days past expected date`}
            </span>
            <span className="text-[11px] text-stone-600 mt-0.5 block capitalize">
              Cycle day {status.cycleDay} · {status.currentPhase} phase
            </span>
          </div>

          <div className="p-3.5 bg-[#F6F0FC] rounded-2xl border border-[#C8A2E8]/40 text-xs">
            <span className="text-stone-500 block text-[11px]">Prediction Accuracy & Source:</span>
            <span className="text-xs font-bold text-[#321442] mt-0.5 block capitalize">
              {prediction.confidenceLevel} Accuracy
            </span>
            <span className="text-[11px] text-stone-600 mt-0.5 block">
              {prediction.confidenceLabel}
            </span>
          </div>
        </div>

        {/* Gentle Notification when Period is Late or Range is Open */}
        {prediction.gentleNotification && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold">{prediction.gentleNotification}</p>
              <p className="text-[11px] text-amber-800">
                A variation of several days is biologically typical due to stress, travel, or natural hormonal rhythm. Cycle predictions cannot diagnose pregnancy or medical issues.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 7-Day Mini Horizontal Ribbon with lively dots */}
      <div className="bg-white p-3.5 rounded-3xl border border-[#C8A2E8]/40 shadow-xs">
        <div className="flex items-center justify-between pb-2.5 px-1 text-xs">
          <span className="font-bold text-[#321442] flex items-center gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5 text-[#7B2CBF]" />
            <span>Cycle Week Forecast</span>
          </span>
          <button
            onClick={() => onNavigateToTab('calendar')}
            className="text-[#7B2CBF] hover:text-[#542080] font-semibold flex items-center gap-1 text-xs cursor-pointer"
          >
            <span>Open Calendar</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center">
          {ribbonDays.map(item => {
            const pred = item.prediction;
            let dotColor = 'bg-stone-300';
            if (pred.isPeriod) dotColor = 'bg-[#EC4899] ring-2 ring-pink-200';
            else if (pred.isPredictedWindow) dotColor = 'bg-[#C8A2E8] ring-2 ring-purple-200';
            else if (pred.isOvulation) dotColor = 'bg-amber-400 ring-2 ring-amber-200';
            else if (pred.isFertile) dotColor = 'bg-amber-300';
            else if (pred.phase === 'follicular') dotColor = 'bg-[#C8A2E8]';
            else if (pred.phase === 'luteal') dotColor = 'bg-[#7B2CBF]';

            return (
              <button
                key={item.dateStr}
                onClick={() => onOpenLog(item.dateStr)}
                className={`py-2 px-1 rounded-2xl flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  item.isToday
                    ? 'bg-[#542080] text-white shadow-md shadow-purple-300'
                    : 'bg-[#F6F0FC] text-[#321442] hover:bg-purple-100'
                }`}
              >
                <span className={`text-[10px] font-bold uppercase ${item.isToday ? 'text-purple-200' : 'text-stone-500'}`}>
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

      {/* Main 2-Column Split: Cycle Wheel + Today's Summary & Quick Logs */}
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

        {/* Right Column (7 cols on lg): Quick Mood & Vitals + Cycle History Trend */}
        <div className="lg:col-span-7 space-y-6">
          {/* Quick Mood Tap Strip */}
          <div className="bg-white rounded-3xl border border-[#C8A2E8]/40 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-purple-50">
              <span className="text-xs font-bold text-[#321442] flex items-center gap-1.5">
                <Smile className="w-3.5 h-3.5 text-[#EC4899]" />
                <span>How are you feeling today?</span>
              </span>
              <button
                onClick={() => onOpenLog(currentDateStr)}
                className="text-xs font-bold text-[#7B2CBF] hover:text-[#542080] cursor-pointer"
              >
                + Log More
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {moodChips.map(chip => {
                const isSelected = todayLog?.moods?.includes(chip.id);
                return (
                  <button
                    key={chip.id}
                    onClick={() => onQuickMoodSelect(chip.id)}
                    className={`py-2 px-1.5 rounded-2xl flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#FCE7F3] border-[#EC4899] text-[#321442] shadow-xs'
                        : 'bg-[#F6F0FC] border-[#C8A2E8]/40 text-stone-600 hover:bg-purple-100'
                    }`}
                  >
                    <span className="text-lg">{chip.emoji}</span>
                    <span className="text-[10px] font-bold">{chip.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cycle Length Visual Trend Bar */}
          {sortedCycles.length > 1 && (
            <div className="bg-white rounded-3xl border border-[#C8A2E8]/40 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-purple-50">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#7B2CBF]" />
                  <h3 className="text-sm font-bold text-[#321442] font-display">
                    Recorded Cycle Length Variations
                  </h3>
                </div>
                <button
                  onClick={() => onNavigateToTab('history')}
                  className="text-xs font-bold text-[#7B2CBF] hover:text-[#542080] cursor-pointer"
                >
                  All Cycles
                </button>
              </div>

              <div className="space-y-2.5">
                {sortedCycles.slice(0, 4).map(c => {
                  const len = c.cycleLength || status.totalCycleDays;
                  const maxLen = 42;
                  const widthPct = Math.min(100, Math.max(25, (len / maxLen) * 100));

                  return (
                    <div key={c.id} className="flex items-center gap-3 text-xs">
                      <span className="w-24 text-stone-600 font-mono text-[11px] shrink-0">
                        {formatShortDate(parseDateStr(c.startDate))}
                      </span>
                      <div className="flex-1 bg-[#F6F0FC] rounded-full h-4 overflow-hidden relative border border-[#C8A2E8]/30">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            c.isOngoing
                              ? 'bg-[#EC4899]'
                              : 'bg-gradient-to-r from-[#542080] to-[#7B2CBF]'
                          }`}
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>
                      <span className="w-16 text-right font-mono font-bold text-[#321442]">
                        {c.isOngoing ? 'Active' : `${len}d`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Health Insights Section Preview */}
      <HealthInsightsSection
        insights={insights}
        onNavigateToHistory={() => onNavigateToTab('history')}
        compact={true}
      />
    </div>
  );
};
