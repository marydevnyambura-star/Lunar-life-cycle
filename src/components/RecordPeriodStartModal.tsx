import React, { useState } from 'react';
import { X, Calendar, Droplets, Check, Sparkles, AlertCircle, Heart } from 'lucide-react';
import { FlowIntensity, Symptom } from '../types';
import { formatDateStr, parseDateStr, addDays } from '../utils/cycleCalculations';

interface RecordPeriodStartModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDateStr: string;
  defaultDuration: number;
  onSavePeriodStart: (startDate: string, flow: FlowIntensity, duration: number, symptoms: Symptom[]) => void;
}

export const RecordPeriodStartModal: React.FC<RecordPeriodStartModalProps> = ({
  isOpen,
  onClose,
  currentDateStr,
  defaultDuration,
  onSavePeriodStart
}) => {
  const today = parseDateStr(currentDateStr);
  const yesterday = addDays(today, -1);
  const twoDaysAgo = addDays(today, -2);

  const [selectedDate, setSelectedDate] = useState<string>(currentDateStr);
  const [flow, setFlow] = useState<FlowIntensity>('medium');
  const [duration, setDuration] = useState<number>(defaultDuration || 5);
  const [symptoms, setSymptoms] = useState<Symptom[]>(['cramps']);

  if (!isOpen) return null;

  const quickDates = [
    { label: 'Today', dateStr: currentDateStr },
    { label: 'Yesterday', dateStr: formatDateStr(yesterday) },
    { label: '2 days ago', dateStr: formatDateStr(twoDaysAgo) }
  ];

  const symptomList: { id: Symptom; label: string; icon: string }[] = [
    { id: 'cramps', label: 'Cramps', icon: '⚡' },
    { id: 'tender_breasts', label: 'Tender Breasts', icon: '🌸' },
    { id: 'bloating', label: 'Bloating', icon: '🫧' },
    { id: 'fatigue', label: 'Fatigue', icon: '🥱' },
    { id: 'backache', label: 'Backache', icon: '🦴' },
    { id: 'headache', label: 'Headache', icon: '🤕' }
  ];

  const toggleSymptom = (s: Symptom) => {
    setSymptoms(prev =>
      prev.includes(s) ? prev.filter(item => item !== s) : [...prev, s]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePeriodStart(selectedDate, flow, duration, symptoms);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-rose-100 overflow-hidden my-6">
        {/* Decorative lively top gradient header */}
        <div className="bg-gradient-to-r from-rose-500 via-rose-600 to-pink-500 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <Droplets className="w-5 h-5 fill-white text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display tracking-tight text-white">
                Record Period Start
              </h2>
              <p className="text-xs text-rose-100">
                Log when your period started to calibrate your cycle
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Section 1: When did your period start? */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-rose-500" />
              <span>When did your period start?</span>
            </label>

            {/* Quick date selector chips */}
            <div className="grid grid-cols-3 gap-2">
              {quickDates.map(item => {
                const isSelected = selectedDate === item.dateStr;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setSelectedDate(item.dateStr)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'bg-rose-50 border-rose-400 text-rose-700 shadow-xs ring-1 ring-rose-400'
                        : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Custom Date Input */}
            <div className="mt-2 flex items-center gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200">
              <span className="text-xs font-medium text-stone-600 shrink-0">Exact Start Date:</span>
              <input
                type="date"
                required
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="w-full bg-white px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-mono font-medium text-stone-900 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Section 2: Flow Intensity on First Day */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-2">
              <Droplets className="w-4 h-4 text-rose-500" />
              <span>Flow Intensity on Start Day</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(
                [
                  { id: 'spotting', label: 'Spotting', desc: 'Minimal drops' },
                  { id: 'light', label: 'Light', desc: 'Mild flow' },
                  { id: 'medium', label: 'Medium', desc: 'Regular flow' },
                  { id: 'heavy', label: 'Heavy', desc: 'High flow' }
                ] as const
              ).map(item => {
                const isSelected = flow === item.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setFlow(item.id)}
                    className={`py-2.5 px-2 rounded-2xl text-center border transition-all ${
                      isSelected
                        ? 'bg-rose-50 border-rose-400 text-rose-700 ring-1 ring-rose-400 shadow-xs'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <p className="text-xs font-bold">{item.label}</p>
                    <p className="text-[10px] text-stone-400 mt-0.5">{item.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Expected Duration */}
          <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-stone-800 block">
                Estimated Bleed Duration
              </span>
              <span className="text-[11px] text-stone-500">
                You can always mark when it ends anytime
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDuration(Math.max(2, duration - 1))}
                className="w-8 h-8 rounded-xl bg-white border border-stone-200 text-stone-700 font-bold hover:bg-stone-100 flex items-center justify-center text-sm"
              >
                -
              </button>
              <span className="font-mono text-sm font-bold text-rose-700 w-12 text-center">
                {duration} days
              </span>
              <button
                type="button"
                onClick={() => setDuration(Math.min(10, duration + 1))}
                className="w-8 h-8 rounded-xl bg-white border border-stone-200 text-stone-700 font-bold hover:bg-stone-100 flex items-center justify-center text-sm"
              >
                +
              </button>
            </div>
          </div>

          {/* Section 4: Initial Symptoms */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Any symptoms today? (Optional)</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {symptomList.map(s => {
                const active = symptoms.includes(s.id);
                return (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => toggleSymptom(s.id)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-medium border flex items-center justify-between transition-all ${
                      active
                        ? 'bg-amber-50 border-amber-300 text-amber-900 ring-1 ring-amber-400 font-semibold'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <span>{s.icon}</span>
                      <span>{s.label}</span>
                    </span>
                    {active && <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reassurance note */}
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-[11px] text-stone-500 flex items-start gap-2.5">
            <Heart className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
            <p className="leading-relaxed">
              Recording this start date will reset your cycle dial to <strong className="text-stone-800">Menstrual Phase (Day 1)</strong> and automatically recalculate your next fertile window and ovulation day.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-500 hover:text-stone-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white text-xs sm:text-sm font-bold shadow-md shadow-rose-200 transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Save Period Start</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
