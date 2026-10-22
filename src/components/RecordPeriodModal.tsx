import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Droplets,
  Check,
  Sparkles,
  AlertCircle,
  Clock,
  Info,
  ArrowRight,
  ShieldAlert,
  Pill,
  Heart
} from 'lucide-react';
import { FlowIntensity, Symptom, CycleRecord, PainSeverity } from '../types';
import {
  formatDateStr,
  parseDateStr,
  addDays,
  diffDays,
  formatDisplayDate
} from '../utils/cycleCalculations';

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
    painSeverity?: PainSeverity;
    medications?: string[];
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
  const [painSeverity, setPainSeverity] = useState<PainSeverity>('moderate');
  const [medication, setMedication] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

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
      setFlow(editingCycle.flow || 'medium');
      setSymptoms(editingCycle.symptoms || ['cramps']);
      setPainSeverity(editingCycle.painSeverity || 'moderate');
      setMedication(editingCycle.medications?.[0] || '');
      setNotes(editingCycle.notes || '');
    } else {
      const initial = initialStartDate || currentDateStr;
      setStartDate(initial);
      const defaultDur = defaultDuration || 5;
      setDuration(defaultDur);
      const computedEnd = formatDateStr(addDays(parseDateStr(initial), defaultDur - 1));
      setEndDate(computedEnd);
      const diff = diffDays(parseDateStr(currentDateStr), parseDateStr(initial));
      setHasEnded(diff >= defaultDur);
      setFlow('medium');
      setSymptoms(['cramps']);
      setPainSeverity('moderate');
      setMedication('');
      setNotes('');
    }
  }, [isOpen, editingCycle, initialStartDate, currentDateStr, defaultDuration]);

  if (!isOpen) return null;

  const handleStartDateChange = (newStart: string) => {
    setStartDate(newStart);
    setErrorMsg('');
    if (newStart && duration > 0) {
      const startObj = parseDateStr(newStart);
      const newEnd = formatDateStr(addDays(startObj, duration - 1));
      setEndDate(newEnd);
    }
  };

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

  const handleDurationChange = (newDur: number) => {
    const validDur = Math.max(1, Math.min(16, newDur));
    setDuration(validDur);
    setErrorMsg('');
    if (startDate) {
      const startObj = parseDateStr(startDate);
      setEndDate(formatDateStr(addDays(startObj, validDur - 1)));
    }
  };

  const symptomList: { id: Symptom; label: string; icon: string }[] = [
    { id: 'cramps', label: 'Cramps', icon: '⚡' },
    { id: 'pelvic_pain', label: 'Pelvic Pain', icon: '🌸' },
    { id: 'backache', label: 'Back Pain', icon: '🦴' },
    { id: 'headache', label: 'Headache', icon: '🤕' },
    { id: 'bloating', label: 'Bloating', icon: '🫧' },
    { id: 'tender_breasts', label: 'Breast Tenderness', icon: '💗' },
    { id: 'fatigue', label: 'Fatigue', icon: '🥱' },
    { id: 'acne', label: 'Acne', icon: '✨' },
    { id: 'nausea', label: 'Nausea', icon: '💫' },
    { id: 'cravings', label: 'Cravings', icon: '🍫' },
    { id: 'insomnia', label: 'Insomnia', icon: '🌙' },
    { id: 'mood_swings', label: 'Mood Shifts', icon: '🎭' }
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
      painSeverity,
      medications: medication.trim() ? [medication.trim()] : [],
      notes
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#C8A2E8]/40 overflow-hidden my-6">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#542080] via-[#7B2CBF] to-[#EC4899] px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <Droplets className="w-5 h-5 fill-white text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display tracking-tight text-white">
                {editingCycle ? 'Edit Menstrual Period' : 'Record Menstrual Period'}
              </h2>
              <p className="text-xs text-purple-100">
                {editingCycle
                  ? 'Update dates, flow, pain severity, or symptoms for this cycle'
                  : 'Log present or historical periods to power intelligent cycle predictions'}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-pink-50 border border-pink-200 text-pink-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Month Picker for Past Months */}
          <div className="bg-[#F6F0FC] rounded-2xl p-3 border border-[#C8A2E8]/40">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7B2CBF] block mb-2">
              Quick Past Month Presets:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { label: 'Today', date: currentDateStr },
                { label: 'September 2026', date: '2026-09-23' },
                { label: 'August 2026', date: '2026-08-26' },
                { label: 'July 2026', date: '2026-07-29' }
              ].map(preset => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleStartDateChange(preset.date)}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
                    startDate === preset.date
                      ? 'bg-[#7B2CBF] text-white border-[#7B2CBF] shadow-xs'
                      : 'bg-white border-[#C8A2E8]/40 text-[#542080] hover:bg-purple-100'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section 1: Exact Start Date */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#321442] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#EC4899]" />
              <span>Period Start Date (Required)</span>
            </label>
            <div className="flex items-center gap-3 p-3 bg-[#F6F0FC] rounded-2xl border border-[#C8A2E8]/40">
              <input
                type="date"
                required
                value={startDate}
                onChange={e => handleStartDateChange(e.target.value)}
                className="w-full bg-white px-3 py-2 rounded-xl border border-[#C8A2E8]/40 text-sm font-mono font-bold text-[#321442] focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]"
              />
            </div>
            <p className="text-[11px] text-stone-500">
              Selected: <span className="font-semibold text-[#542080]">{formatDisplayDate(parseDateStr(startDate))}</span>
            </p>
          </div>

          {/* Section 2: Period End Date & Duration */}
          <div className="space-y-3 p-4 bg-[#F6F0FC] rounded-2xl border border-[#C8A2E8]/40">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#321442] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#7B2CBF]" />
                <span>Bleed Duration & End Date</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#542080]">
                <input
                  type="checkbox"
                  checked={hasEnded}
                  onChange={e => setHasEnded(e.target.checked)}
                  className="rounded text-[#EC4899] focus:ring-[#EC4899]"
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
                    className="w-9 h-9 rounded-xl border border-[#C8A2E8]/40 bg-white hover:bg-purple-100 flex items-center justify-center font-bold text-[#542080] disabled:opacity-40 cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="16"
                    value={duration}
                    onChange={e => handleDurationChange(parseInt(e.target.value) || 5)}
                    className="w-16 text-center py-2 bg-white rounded-xl border border-[#C8A2E8]/40 text-sm font-bold font-mono text-[#321442]"
                  />
                  <button
                    type="button"
                    onClick={() => handleDurationChange(duration + 1)}
                    disabled={duration >= 16}
                    className="w-9 h-9 rounded-xl border border-[#C8A2E8]/40 bg-white hover:bg-purple-100 flex items-center justify-center font-bold text-[#542080] disabled:opacity-40 cursor-pointer"
                  >
                    +
                  </button>
                  <span className="text-xs text-stone-500 font-medium">days</span>
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
                    className="w-full bg-white px-3 py-2 rounded-xl border border-[#C8A2E8]/40 text-xs font-mono font-medium text-[#321442] focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Flow Intensity */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#321442] flex items-center gap-2">
              <Droplets className="w-4 h-4 text-[#EC4899]" />
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
                    className={`py-2 px-2 rounded-2xl text-center border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#FCE7F3] border-[#EC4899] text-pink-700 ring-2 ring-pink-300 shadow-xs'
                        : 'bg-white border-[#C8A2E8]/40 text-stone-700 hover:bg-purple-50'
                    }`}
                  >
                    <p className="text-xs font-bold">{item.label}</p>
                    <p className="text-[10px] text-stone-400 mt-0.5">{item.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Pain Severity */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#321442] flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#EC4899]" />
              <span>Reported Pain Severity (Cramps, Headaches, Pelvic Pain)</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(
                [
                  { id: 'none', label: 'None', desc: 'No pain' },
                  { id: 'mild', label: 'Mild', desc: 'Manageable' },
                  { id: 'moderate', label: 'Moderate', desc: 'Noticeable' },
                  { id: 'severe', label: 'Severe', desc: 'Disruptive' }
                ] as const
              ).map(p => {
                const isSelected = painSeverity === p.id;
                return (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => setPainSeverity(p.id)}
                    className={`py-2 px-2 rounded-2xl text-center border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-100 border-[#7B2CBF] text-[#542080] ring-2 ring-purple-300 shadow-xs'
                        : 'bg-white border-[#C8A2E8]/40 text-stone-700 hover:bg-purple-50'
                    }`}
                  >
                    <p className="text-xs font-bold">{p.label}</p>
                    <p className="text-[10px] text-stone-400 mt-0.5">{p.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: Symptoms Checklist */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#321442]">
              Symptoms Observed
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {symptomList.map(sym => {
                const isSelected = symptoms.includes(sym.id);
                return (
                  <button
                    key={sym.id}
                    type="button"
                    onClick={() => toggleSymptom(sym.id)}
                    className={`py-2 px-2 rounded-2xl text-center border text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#FCE7F3] border-[#EC4899] text-[#321442] ring-1 ring-pink-300'
                        : 'bg-white border-[#C8A2E8]/40 text-stone-600 hover:bg-purple-50'
                    }`}
                  >
                    <span className="text-base block mb-0.5">{sym.icon}</span>
                    <span className="text-[11px] leading-tight block">{sym.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 6: Pain Relief / Medication Taken */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#321442] flex items-center gap-2">
              <Pill className="w-4 h-4 text-[#7B2CBF]" />
              <span>Medication or Pain Relief Taken (Optional)</span>
            </label>
            <div className="flex gap-2 flex-wrap mb-1.5">
              {['Ibuprofen', 'Paracetamol', 'Naproxen', 'Heat Therapy', 'Herbal Tea'].map(med => (
                <button
                  key={med}
                  type="button"
                  onClick={() => setMedication(med)}
                  className={`text-[11px] px-2.5 py-1 rounded-xl border transition-all cursor-pointer ${
                    medication === med
                      ? 'bg-[#7B2CBF] text-white border-[#7B2CBF]'
                      : 'bg-white border-[#C8A2E8]/40 text-stone-700 hover:bg-purple-50'
                  }`}
                >
                  {med}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="e.g., Ibuprofen 400mg, Hot water bottle..."
              value={medication}
              onChange={e => setMedication(e.target.value)}
              className="w-full bg-[#F6F0FC] px-3.5 py-2 rounded-xl border border-[#C8A2E8]/40 text-xs text-[#321442] focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]"
            />
          </div>

          {/* Section 7: Notes on Unusual Changes */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#321442]">
              Notes on Unusual Changes in Cycle
            </label>
            <textarea
              rows={2}
              placeholder="Any notable changes, travel, high stress, or biological observations..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-[#F6F0FC] px-3.5 py-2 rounded-xl border border-[#C8A2E8]/40 text-xs text-[#321442] focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]"
            />
          </div>

          {/* Section 8: Real-time Calculation Notice */}
          <div className="p-4 bg-purple-50/80 rounded-2xl border border-purple-200/80 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-[#542080]">
              <Sparkles className="w-4 h-4 text-[#EC4899]" />
              <span>Intelligent Recalculation Notice</span>
            </div>
            <p className="text-stone-700 text-[11px] leading-relaxed">
              Recording this period starting on <strong className="text-[#321442]">{startDate}</strong> will automatically calculate the cycle length to the next period, update your personal average cycle length and variability window, and calibrate future predictions.
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
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#542080] via-[#7B2CBF] to-[#EC4899] text-white text-xs font-bold hover:brightness-105 active:scale-[0.98] transition-all shadow-md shadow-purple-300/60 cursor-pointer flex items-center gap-2"
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
