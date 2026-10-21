import React, { useState, useEffect } from 'react';
import { X, Calendar, Droplets, Check, Sparkles, AlertCircle, Clock, Info, ArrowRight } from 'lucide-react';
import { FlowIntensity, Symptom, CycleRecord } from '../types';
import { formatDateStr, parseDateStr, addDays, diffDays, formatDisplayDate } from '../utils/cycleCalculations';

interface RecordPeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDateStr: string;
  defaultDuration: number;
  editingCycle?: CycleRecord | null;
  initialStartDate?: string;
  onSaveCycle: (cycleData: {
    id?: string;
    startDate: string;
    endDate?: string;
    periodDuration: number;
    flow?: FlowIntensity;
    symptoms?: Symptom[];
    notes?: string;
  }) => void;
}

export const RecordPeriodModal: React.FC<RecordPeriodModalProps> = ({
  isOpen,
  onClose,
  currentDateStr,
  defaultDuration,
  editingCycle,
  initialStartDate,
  onSaveCycle
}) => {
  const [startDate, setStartDate] = useState<string>(currentDateStr);
  const [hasEnded, setHasEnded] = useState<boolean>(true);
  const [endDate, setEndDate] = useState<string>('');
  const [duration, setDuration] = useState<number>(defaultDuration || 5);
  const [flow, setFlow] = useState<FlowIntensity>('medium');
  const [symptoms, setSymptoms] = useState<Symptom[]>(['cramps']);
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Year and Month quick jump helpers for historical entry
  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Initialize or reset when modal opens or editingCycle changes
  useEffect(() => {
    if (!isOpen) return;

    setErrorMsg('');

    if (editingCycle) {
      setStartDate(editingCycle.startDate);
      const dur = editingCycle.periodDuration || defaultDuration || 5;
      setDuration(dur);
      if (editingCycle.endDate) {
        setHasEnded(true);
        setEndDate(editingCycle.endDate);
      } else {
        const computedEnd = formatDateStr(addDays(parseDateStr(editingCycle.startDate), dur - 1));
        setEndDate(computedEnd);
        setHasEnded(!editingCycle.isOngoing);
      }
      setNotes('');
    } else {
      const initial = initialStartDate || currentDateStr;
      setStartDate(initial);
      const defaultDur = defaultDuration || 5;
      setDuration(defaultDur);
      const computedEnd = formatDateStr(addDays(parseDateStr(initial), defaultDur - 1));
      setEndDate(computedEnd);
      // If it's a date in the past, it has likely ended
      const diff = diffDays(parseDateStr(currentDateStr), parseDateStr(initial));
      setHasEnded(diff >= defaultDur);
      setFlow('medium');
      setSymptoms(['cramps']);
      setNotes('');
    }
  }, [isOpen, editingCycle, initialStartDate, currentDateStr, defaultDuration]);

  if (!isOpen) return null;

  // Handle Start Date change
  const handleStartDateChange = (newStart: string) => {
    setStartDate(newStart);
    setErrorMsg('');
    if (newStart && duration > 0) {
      const startObj = parseDateStr(newStart);
      const newEnd = formatDateStr(addDays(startObj, duration - 1));
      setEndDate(newEnd);
    }
  };

  // Handle End Date change
  const handleEndDateChange = (newEnd: string) => {
    setEndDate(newEnd);
    setErrorMsg('');
    if (startDate && newEnd) {
      const startObj = parseDateStr(startDate);
      const endObj = parseDateStr(newEnd);
      const days = diffDays(endObj, startObj) + 1;
      if (days < 1) {
        setErrorMsg('Period end date cannot be earlier than start date.');
      } else if (days > 20) {
        setErrorMsg('Flow duration exceeds 20 days. Please verify dates.');
      } else {
        setDuration(days);
      }
    }
  };

  // Handle Duration change
  const handleDurationChange = (newDur: number) => {
    const validDur = Math.max(1, Math.min(16, newDur));
    setDuration(validDur);
    setErrorMsg('');
    if (startDate) {
      const startObj = parseDateStr(startDate);
      setEndDate(formatDateStr(addDays(startObj, validDur - 1)));
    }
  };

  // Quick jump to month/year
  const handleQuickMonthYear = (mIdx: number, yr: number) => {
    const d = new Date(yr, mIdx, 15);
    const dateStr = formatDateStr(d);
    handleStartDateChange(dateStr);
  };

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
    if (!startDate) {
      setErrorMsg('Please specify a period start date.');
      return;
    }

    if (hasEnded && endDate) {
      const startObj = parseDateStr(startDate);
      const endObj = parseDateStr(endDate);
      if (diffDays(endObj, startObj) < 0) {
        setErrorMsg('Period end date cannot be before start date.');
        return;
      }
    }

    onSaveCycle({
      id: editingCycle ? editingCycle.id : undefined,
      startDate,
      endDate: hasEnded ? endDate : undefined,
      periodDuration: duration,
      flow,
      symptoms,
      notes
    });

    onClose();
  };

  const startObj = parseDateStr(startDate);
  const startMonth = startObj.getMonth();
  const startYear = startObj.getFullYear();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-rose-100 overflow-hidden my-6">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-rose-500 via-rose-600 to-pink-500 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <Droplets className="w-5 h-5 fill-white text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display tracking-tight text-white">
                {editingCycle ? 'Edit Menstrual Period' : 'Record Menstrual Period'}
              </h2>
              <p className="text-xs text-rose-100">
                {editingCycle
                  ? 'Update dates or duration for this recorded cycle'
                  : 'Log present or past periods (any month or year) to calibrate predictions'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Month & Year jump buttons for past periods */}
          <div className="bg-stone-50 rounded-2xl p-3 border border-stone-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block mb-2">
              Quick Month Picker for Past Months:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { label: 'Current Month', date: currentDateStr },
                {
                  label: 'September 2026',
                  date: '2026-09-23'
                },
                {
                  label: 'August 2026',
                  date: '2026-08-26'
                },
                {
                  label: 'July 2026',
                  date: '2026-07-29'
                }
              ].map(preset => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleStartDateChange(preset.date)}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                    startDate === preset.date
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section 1: Exact Start Date */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-rose-500" />
              <span>Period Start Date (Required)</span>
            </label>
            <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200">
              <input
                type="date"
                required
                value={startDate}
                onChange={e => handleStartDateChange(e.target.value)}
                className="w-full bg-white px-3 py-2 rounded-xl border border-stone-200 text-sm font-mono font-medium text-stone-900 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>
            <p className="text-[11px] text-stone-500">
              Selected: <span className="font-semibold text-stone-700">{formatDisplayDate(parseDateStr(startDate))}</span>
            </p>
          </div>

          {/* Section 2: Period End Date & Duration */}
          <div className="space-y-3 p-4 bg-stone-50 rounded-2xl border border-stone-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-2">
                <Clock className="w-4 h-4 text-rose-500" />
                <span>Period End Date & Bleed Duration</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-stone-600">
                <input
                  type="checkbox"
                  checked={hasEnded}
                  onChange={e => setHasEnded(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span>Period has ended</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-xs font-medium text-stone-600 block mb-1">
                  Bleed Duration (days)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDurationChange(duration - 1)}
                    disabled={duration <= 1}
                    className="w-9 h-9 rounded-xl border border-stone-200 bg-white hover:bg-stone-100 flex items-center justify-center font-bold text-stone-700 disabled:opacity-40"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="16"
                    value={duration}
                    onChange={e => handleDurationChange(parseInt(e.target.value) || 5)}
                    className="w-16 text-center py-2 bg-white rounded-xl border border-stone-200 text-sm font-bold font-mono text-stone-900"
                  />
                  <button
                    type="button"
                    onClick={() => handleDurationChange(duration + 1)}
                    disabled={duration >= 16}
                    className="w-9 h-9 rounded-xl border border-stone-200 bg-white hover:bg-stone-100 flex items-center justify-center font-bold text-stone-700 disabled:opacity-40"
                  >
                    +
                  </button>
                  <span className="text-xs text-stone-500">days</span>
                </div>
              </div>

              {hasEnded && (
                <div>
                  <label className="text-xs font-medium text-stone-600 block mb-1">
                    Period End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => handleEndDateChange(e.target.value)}
                    className="w-full bg-white px-3 py-2 rounded-xl border border-stone-200 text-xs font-mono font-medium text-stone-900 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Flow Intensity */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-2">
              <Droplets className="w-4 h-4 text-rose-500" />
              <span>Flow Intensity</span>
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
                    className={`py-2 px-2 rounded-xl text-center border transition-all cursor-pointer ${
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

          {/* Section 4: Symptoms */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
              Symptoms on Start Day
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {symptomList.map(sym => {
                const isSelected = symptoms.includes(sym.id);
                return (
                  <button
                    key={sym.id}
                    type="button"
                    onClick={() => toggleSymptom(sym.id)}
                    className={`py-2 px-2 rounded-xl text-center border text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-rose-50 border-rose-300 text-rose-800 ring-1 ring-rose-300'
                        : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <span className="text-base block mb-0.5">{sym.icon}</span>
                    <span className="text-[11px] font-semibold">{sym.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: Real-time Calculation Preview */}
          <div className="p-4 bg-rose-50/60 rounded-2xl border border-rose-200 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-rose-900">
              <Sparkles className="w-4 h-4 text-rose-600" />
              <span>Cycle Recalculation Notice</span>
            </div>
            <p className="text-stone-700">
              Recording this period starting on <strong className="text-stone-900">{startDate}</strong> will automatically calculate the cycle length (days to the next period) and dynamically update your personal average cycle length and future predicted dates.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 active:scale-[0.98] transition-all shadow-sm shadow-rose-200 cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{editingCycle ? 'Update Period Record' : 'Save Period Record'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
