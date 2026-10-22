import React from 'react';
import { MenstrualHealthInsights, SymptomFrequency, PainSeverity } from '../types';
import {
  Sparkles,
  Heart,
  AlertTriangle,
  Activity,
  CheckCircle2,
  Clock,
  Droplets,
  Calendar,
  Info,
  ShieldAlert,
  ChevronRight,
  Pill
} from 'lucide-react';

interface HealthInsightsSectionProps {
  insights: MenstrualHealthInsights;
  onNavigateToHistory?: () => void;
  compact?: boolean;
}

export const HealthInsightsSection: React.FC<HealthInsightsSectionProps> = ({
  insights,
  onNavigateToHistory,
  compact = false
}) => {
  const symptomLabels: Record<string, string> = {
    cramps: 'Cramps',
    headache: 'Headache',
    bloating: 'Bloating',
    tender_breasts: 'Tender Breasts',
    fatigue: 'Fatigue',
    acne: 'Skin Breakouts / Acne',
    backache: 'Lower Back Pain',
    pelvic_pain: 'Pelvic Pain',
    joint_pain: 'Joint Pain',
    nausea: 'Nausea',
    cravings: 'Food Cravings',
    insomnia: 'Sleep Disruption',
    mood_swings: 'Mood Shifts'
  };

  const severityColors: Record<PainSeverity, string> = {
    none: 'bg-stone-100 text-stone-600',
    mild: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    moderate: 'bg-amber-50 text-amber-800 border-amber-200',
    severe: 'bg-rose-50 text-rose-800 border-rose-200'
  };

  return (
    <div className="space-y-5">
      {/* Top Banner / Analysis Scope Card */}
      <div className="bg-gradient-to-br from-[#542080] via-[#7B2CBF] to-[#9D4EDD] text-white rounded-3xl p-5 sm:p-6 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-6 -mr-6 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-xs mb-2">
              <Sparkles className="w-3.5 h-3.5 text-pink-300" />
              <span>Personalized Health Intelligence</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold font-display tracking-tight text-white">
              Recurring Symptoms & Cycle Patterns
            </h2>
            <p className="text-xs text-purple-100 mt-1 max-w-xl">
              Analyzed from <strong>{insights.totalCyclesAnalyzed} recorded cycles</strong> ({insights.dateRangeCovered}) across <strong>{insights.totalLoggedDays} daily log entries</strong>. All statistics reflect your actual logged data.
            </p>
          </div>

          {onNavigateToHistory && (
            <button
              onClick={onNavigateToHistory}
              className="self-start md:self-auto px-4 py-2 bg-white text-[#542080] hover:bg-purple-50 text-xs font-bold rounded-2xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <span>View Full Cycle History</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Primary Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Recurring Cycle Patterns */}
        <div className="bg-white rounded-3xl border border-[#C8A2E8]/40 p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-purple-50">
            <div className="w-8 h-8 rounded-xl bg-pink-100 text-[#EC4899] flex items-center justify-center shrink-0">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#321442] font-display">
                Cycle-to-Cycle Recurring Patterns
              </h3>
              <p className="text-[11px] text-stone-500">
                Symptoms appearing across multiple distinct cycles
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {insights.recurringCyclePatterns.length === 0 ? (
              <p className="text-xs text-stone-500 italic py-2">
                No repeated cycle symptoms detected yet. As you record additional periods and symptoms, patterns will appear here.
              </p>
            ) : (
              insights.recurringCyclePatterns.map((pattern, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-[#F6F0FC] border border-[#C8A2E8]/40 text-xs text-[#321442] flex items-start gap-2.5"
                >
                  <span className="w-2 h-2 rounded-full bg-[#EC4899] mt-1.5 shrink-0" />
                  <span className="leading-relaxed font-medium">{pattern}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Card 2: Pre-Menstrual vs Menstrual Timing */}
        <div className="bg-white rounded-3xl border border-[#C8A2E8]/40 p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-purple-50">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#7B2CBF] flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#321442] font-display">
                Phase-Specific Timing Insights
              </h3>
              <p className="text-[11px] text-stone-500">
                Symptoms occurring in pre-menstrual (luteal) vs menstrual bleeding days
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {insights.preMenstrualPatterns.length === 0 && insights.menstrualPatterns.length === 0 ? (
              <p className="text-xs text-stone-500 italic py-2">
                Log symptoms before and during your period to see timing-specific correlations.
              </p>
            ) : (
              <>
                {insights.preMenstrualPatterns.map((item, idx) => (
                  <div
                    key={`pre-${idx}`}
                    className="p-3 rounded-2xl bg-purple-50/70 border border-purple-200/60 text-xs text-[#321442] flex items-start gap-2.5"
                  >
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-200/70 text-[#542080] shrink-0 mt-0.5">
                      Pre-Period
                    </span>
                    <span className="leading-relaxed font-medium">{item}</span>
                  </div>
                ))}

                {insights.menstrualPatterns.map((item, idx) => (
                  <div
                    key={`men-${idx}`}
                    className="p-3 rounded-2xl bg-pink-50/70 border border-pink-200/60 text-xs text-[#321442] flex items-start gap-2.5"
                  >
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-200/70 text-pink-800 shrink-0 mt-0.5">
                      During Flow
                    </span>
                    <span className="leading-relaxed font-medium">{item}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Card 3: Frequently Reported Symptoms Breakdown */}
      <div className="bg-white rounded-3xl border border-[#C8A2E8]/40 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-purple-50">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#321442] font-display">
              Most Frequently Reported Symptoms
            </h3>
            <p className="text-xs text-stone-500">
              Frequency ranking and percentage of cycles affected in your records
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#F6F0FC] text-[#542080] border border-[#C8A2E8]/40 self-start sm:self-auto">
            {insights.frequentSymptoms.length} distinct symptoms recorded
          </span>
        </div>

        {insights.frequentSymptoms.length === 0 ? (
          <p className="text-xs text-stone-500 italic py-4 text-center">
            No symptoms logged yet. Use the Daily Log button on the dashboard to track how your body feels.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {insights.frequentSymptoms.slice(0, compact ? 4 : 6).map(sf => {
              const label = symptomLabels[sf.symptom] || sf.symptom;
              return (
                <div
                  key={sf.symptom}
                  className="p-3.5 rounded-2xl bg-[#F6F0FC] border border-[#C8A2E8]/40 space-y-2 hover:border-[#7B2CBF]/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#321442] capitalize">{label}</span>
                    <span className="text-[11px] font-mono font-bold text-[#7B2CBF] px-2 py-0.5 rounded-md bg-white border border-[#C8A2E8]/30">
                      {sf.count} logs
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-white rounded-full h-2 overflow-hidden border border-[#C8A2E8]/30">
                    <div
                      className="h-full bg-gradient-to-r from-[#7B2CBF] to-[#EC4899] rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(15, sf.percentageOfCycles))}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-stone-600">
                    <span>In {sf.cyclesCount} of {insights.totalCyclesAnalyzed} cycles</span>
                    <span className="font-semibold text-[#542080]">{sf.percentageOfCycles}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Flow & Pain Summary Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-white border border-[#C8A2E8]/40 text-xs">
            <span className="text-stone-500 block text-[11px]">Average Bleed Duration:</span>
            <span className="text-base font-extrabold text-[#542080] mt-0.5 block font-display">
              {insights.flowTrends.averageDuration} days
            </span>
            <span className="text-[10px] text-stone-400 mt-0.5 block">
              Variation: {insights.flowTrends.durationVariation}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-[#C8A2E8]/40 text-xs">
            <span className="text-stone-500 block text-[11px]">Predominant Flow:</span>
            <span className="text-base font-extrabold text-[#EC4899] mt-0.5 block font-display capitalize">
              {insights.flowTrends.predominantFlow} Flow
            </span>
            <span className="text-[10px] text-stone-400 mt-0.5 block">
              Most logged flow intensity
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-[#C8A2E8]/40 text-xs">
            <span className="text-stone-500 block text-[11px]">Primary Pain Relief / Meds:</span>
            <span className="text-xs font-bold text-[#321442] mt-0.5 block truncate">
              {insights.painInsights.frequentMedications.length > 0
                ? insights.painInsights.frequentMedications.join(', ')
                : 'None recorded'}
            </span>
            <span className="text-[10px] text-stone-400 mt-0.5 block">
              Commonly logged relief
            </span>
          </div>
        </div>
      </div>

      {/* Clinical Safety & Urgent Care Guidance Cards */}
      <div className="space-y-3">
        {/* Safety Disclaimer Banner */}
        <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200/80 text-xs text-[#321442] flex items-start gap-3">
          <Info className="w-4 h-4 text-[#7B2CBF] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-[#542080]">Clinical Information & Discussion Aid</p>
            <p className="text-stone-600 leading-relaxed text-[11px]">
              {insights.medicalDisclaimer}
            </p>
          </div>
        </div>

        {/* Urgent Care Advisory Notice */}
        <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200/80 text-xs text-rose-950 flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-rose-900">Urgent Care Guidance</p>
            <p className="text-stone-700 leading-relaxed text-[11px]">
              {insights.urgentCareGuidance}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
