import React, { useState, useEffect } from 'react';
import { X, Check, Droplets, Smile, Zap, Sparkles, Moon, Coffee, Heart, Thermometer, Scale, Clock, Pill } from 'lucide-react';
import { DailyLog, FlowIntensity, Symptom, Mood, MucusType, UserSettings } from '../types';

interface DailyLoggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  onSaveLog: (log: DailyLog) => void;
  existingLog?: DailyLog;
  settings: UserSettings;
}

const SYMPTOM_OPTIONS: { id: Symptom; label: string; icon: string }[] = [
  { id: 'cramps', label: 'Cramps', icon: '⚡' },
  { id: 'tender_breasts', label: 'Tender Breasts', icon: '🌸' },
  { id: 'headache', label: 'Headache', icon: '🤕' },
  { id: 'bloating', label: 'Bloating', icon: '🫧' },
  { id: 'fatigue', label: 'Fatigue', icon: '🥱' },
  { id: 'backache', label: 'Backache', icon: '🦴' },
  { id: 'acne', label: 'Acne', icon: '✨' },
  { id: 'cravings', label: 'Cravings', icon: '🍫' },
  { id: 'nausea', label: 'Nausea', icon: '💫' },
  { id: 'insomnia', label: 'Insomnia', icon: '🌙' },
];

const MOOD_OPTIONS: { id: Mood; label: string; emoji: string }[] = [
  { id: 'calm', label: 'Calm', emoji: '🌿' },
  { id: 'happy', label: 'Happy', emoji: '☀️' },
  { id: 'energetic', label: 'Energetic', emoji: '⚡' },
  { id: 'sensitive', label: 'Sensitive', emoji: '💧' },
  { id: 'irritable', label: 'Irritable', emoji: '🔥' },
  { id: 'anxious', label: 'Anxious', emoji: '🌀' },
  { id: 'sad', label: 'Sad', emoji: '🌧️' },
  { id: 'exhausted', label: 'Exhausted', emoji: '🛌' },
];

const MUCUS_OPTIONS: { id: MucusType; label: string; desc: string }[] = [
  { id: 'dry', label: 'Dry / None', desc: 'Typical early follicular or late luteal' },
  { id: 'sticky', label: 'Sticky', desc: 'Thick, low fertility' },
  { id: 'creamy', label: 'Creamy', desc: 'Lotion-like, approaching fertile window' },
  { id: 'eggwhite', label: 'Egg-White', desc: 'Clear, stretchy, peak fertility' },
  { id: 'watery', label: 'Watery', desc: 'Slippery and wet, highly fertile' },
];

export const DailyLoggerModal: React.FC<DailyLoggerModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onSaveLog,
  existingLog,
  settings
}) => {
  const [date, setDate] = useState(selectedDate);
  const [isPeriod, setIsPeriod] = useState<boolean>(existingLog?.isPeriod ?? false);
  const [flow, setFlow] = useState<FlowIntensity>(existingLog?.flow ?? 'none');
  const [symptoms, setSymptoms] = useState<Symptom[]>(existingLog?.symptoms ?? []);
  const [moods, setMoods] = useState<Mood[]>(existingLog?.moods ?? []);
  const [cervicalMucus, setCervicalMucus] = useState<MucusType | undefined>(existingLog?.cervicalMucus);
  const [temperature, setTemperature] = useState<string>(
    existingLog?.temperature ? existingLog.temperature.toString() : ''
  );
  const [weight, setWeight] = useState<string>(
    existingLog?.weight ? existingLog.weight.toString() : ''
  );
  const [waterGlasses, setWaterGlasses] = useState<number>(existingLog?.waterGlasses ?? 6);
  const [sleepHours, setSleepHours] = useState<number>(existingLog?.sleepHours ?? 7.5);
  const [pillTaken, setPillTaken] = useState<boolean>(existingLog?.pillTaken ?? false);
  const [sexualActive, setSexualActive] = useState<boolean>(existingLog?.sexualActivity?.active ?? false);
  const [sexualProtected, setSexualProtected] = useState<boolean>(
    existingLog?.sexualActivity?.protected ?? true
  );
  const [notes, setNotes] = useState<string>(existingLog?.notes ?? '');

  useEffect(() => {
    if (existingLog) {
      setDate(existingLog.date);
      setIsPeriod(existingLog.isPeriod);
      setFlow(existingLog.flow ?? 'none');
      setSymptoms(existingLog.symptoms ?? []);
      setMoods(existingLog.moods ?? []);
      setCervicalMucus(existingLog.cervicalMucus);
      setTemperature(existingLog.temperature ? existingLog.temperature.toString() : '');
      setWeight(existingLog.weight ? existingLog.weight.toString() : '');
      setWaterGlasses(existingLog.waterGlasses ?? 6);
      setSleepHours(existingLog.sleepHours ?? 7.5);
      setPillTaken(existingLog.pillTaken ?? false);
      setSexualActive(existingLog.sexualActivity?.active ?? false);
      setSexualProtected(existingLog.sexualActivity?.protected ?? true);
      setNotes(existingLog.notes ?? '');
    } else {
      setDate(selectedDate);
      setIsPeriod(false);
      setFlow('none');
      setSymptoms([]);
      setMoods([]);
      setCervicalMucus(undefined);
      setTemperature('');
      setWeight('');
      setWaterGlasses(6);
      setSleepHours(7.5);
      setPillTaken(false);
      setSexualActive(false);
      setSexualProtected(true);
      setNotes('');
    }
  }, [existingLog, selectedDate, isOpen]);

  if (!isOpen) return null;

  const toggleSymptom = (sym: Symptom) => {
    setSymptoms(prev =>
      prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym]
    );
  };

  const toggleMood = (mood: Mood) => {
    setMoods(prev =>
      prev.includes(mood) ? prev.filter(m => m !== mood) : [...prev, mood]
    );
  };

  const handleFlowSelect = (val: FlowIntensity) => {
    setFlow(val);
    if (val !== 'none') {
      setIsPeriod(true);
    } else {
      setIsPeriod(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTemp = temperature ? parseFloat(temperature) : undefined;
    const parsedWeight = weight ? parseFloat(weight) : undefined;

    const log: DailyLog = {
      date,
      isPeriod: isPeriod || (flow !== 'none'),
      flow: flow === 'none' ? undefined : flow,
      symptoms,
      moods,
      cervicalMucus,
      temperature: Number.isNaN(parsedTemp) ? undefined : parsedTemp,
      weight: Number.isNaN(parsedWeight) ? undefined : parsedWeight,
      waterGlasses,
      sleepHours,
      pillTaken,
      sexualActivity: {
        active: sexualActive,
        protected: sexualProtected
      },
      notes: notes.trim() ? notes.trim() : undefined
    };

    onSaveLog(log);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden my-6">
        {/* Modal Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white/95 backdrop-blur-md border-b border-stone-200">
          <div>
            <h2 className="text-lg font-bold text-stone-900 font-display">
              {settings.privacyMode ? 'Log Daily Details' : 'Log Period & Symptoms'}
            </h2>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-stone-500">
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="font-medium text-stone-700 bg-transparent border-0 p-0 focus:ring-0 focus:outline-none cursor-pointer hover:text-rose-600"
              />
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Section 1: Menstrual Bleed / Flow */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-stone-900 flex items-center gap-2">
                <Droplets className="w-4 h-4 text-rose-500" />
                <span>{settings.privacyMode ? 'Cycle Flow' : 'Period Flow'}</span>
              </label>
              {isPeriod && (
                <span className="text-xs font-medium text-rose-600">Active</span>
              )}
            </div>

            <div className="grid grid-cols-5 gap-2">
              {(
                [
                  { id: 'none', label: 'None' },
                  { id: 'spotting', label: 'Spotting' },
                  { id: 'light', label: 'Light' },
                  { id: 'medium', label: 'Medium' },
                  { id: 'heavy', label: 'Heavy' }
                ] as const
              ).map(item => {
                const isSelected = flow === item.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => handleFlowSelect(item.id)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-medium border transition-all ${
                      isSelected
                        ? item.id === 'none'
                          ? 'bg-stone-100 border-stone-300 text-stone-800'
                          : 'bg-rose-50 border-rose-300 text-rose-700 ring-1 ring-rose-400'
                        : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Symptoms */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-stone-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Physical Symptoms</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SYMPTOM_OPTIONS.map(s => {
                const active = symptoms.includes(s.id);
                return (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => toggleSymptom(s.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border flex items-center justify-between text-left transition-all ${
                      active
                        ? 'bg-amber-50 border-amber-300 text-amber-900 ring-1 ring-amber-400'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-sm">{s.icon}</span>
                      <span>{s.label}</span>
                    </span>
                    {active && <Check className="w-3.5 h-3.5 text-amber-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Moods */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-stone-900 flex items-center gap-2">
              <Smile className="w-4 h-4 text-violet-500" />
              <span>Mood & Mental State</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {MOOD_OPTIONS.map(m => {
                const active = moods.includes(m.id);
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => toggleMood(m.id)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-medium border flex items-center justify-between transition-all ${
                      active
                        ? 'bg-violet-50 border-violet-300 text-violet-900 ring-1 ring-violet-400'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <span>{m.emoji}</span>
                      <span>{m.label}</span>
                    </span>
                    {active && <Check className="w-3.5 h-3.5 text-violet-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Cervical Fluid */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-stone-900 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>Cervical Fluid / Mucus</span>
              </span>
              {cervicalMucus && (
                <button
                  type="button"
                  onClick={() => setCervicalMucus(undefined)}
                  className="text-xs text-stone-400 hover:text-stone-600"
                >
                  Clear
                </button>
              )}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {MUCUS_OPTIONS.map(muc => {
                const active = cervicalMucus === muc.id;
                return (
                  <button
                    type="button"
                    key={muc.id}
                    onClick={() => setCervicalMucus(active ? undefined : muc.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border text-left transition-all ${
                      active
                        ? 'bg-teal-50 border-teal-300 text-teal-900 ring-1 ring-teal-400'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <p className="font-semibold">{muc.label}</p>
                    <p className="text-[10px] text-stone-500 mt-0.5 line-clamp-1">{muc.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: Vitals (Temp, Weight, Water, Sleep) */}
          <div className="pt-2 border-t border-stone-100 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600">
              Vitals & Habits
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Basal Temperature */}
              <div>
                <label className="text-xs font-medium text-stone-700 flex items-center gap-1.5 mb-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-rose-500" />
                  <span>Basal Body Temp (°{settings.tempUnit})</span>
                </label>
                <input
                  type="number"
                  step="0.05"
                  placeholder={settings.tempUnit === 'C' ? '36.5' : '97.7'}
                  value={temperature}
                  onChange={e => setTemperature(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500 font-mono"
                />
              </div>

              {/* Weight */}
              <div>
                <label className="text-xs font-medium text-stone-700 flex items-center gap-1.5 mb-1.5">
                  <Scale className="w-3.5 h-3.5 text-stone-500" />
                  <span>Weight ({settings.weightUnit})</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder={settings.weightUnit === 'kg' ? '60.0' : '132.0'}
                  value={weight}
                  onChange={e => setWeight(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-500 font-mono"
                />
              </div>
            </div>

            {/* Water and Sleep Steppers */}
            <div className="grid grid-cols-2 gap-4">
              {/* Water glasses */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-stone-800">Water</p>
                  <p className="text-xs text-stone-500">{waterGlasses} glasses</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setWaterGlasses(Math.max(0, waterGlasses - 1))}
                    className="w-7 h-7 rounded-lg bg-white border border-stone-200 text-stone-700 flex items-center justify-center font-bold text-sm hover:bg-stone-100"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => setWaterGlasses(waterGlasses + 1)}
                    className="w-7 h-7 rounded-lg bg-white border border-stone-200 text-stone-700 flex items-center justify-center font-bold text-sm hover:bg-stone-100"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Sleep Hours */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-stone-800">Sleep</p>
                  <p className="text-xs text-stone-500">{sleepHours} hrs</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSleepHours(Math.max(3, Number((sleepHours - 0.5).toFixed(1))))}
                    className="w-7 h-7 rounded-lg bg-white border border-stone-200 text-stone-700 flex items-center justify-center font-bold text-sm hover:bg-stone-100"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => setSleepHours(Math.min(14, Number((sleepHours + 0.5).toFixed(1))))}
                    className="w-7 h-7 rounded-lg bg-white border border-stone-200 text-stone-700 flex items-center justify-center font-bold text-sm hover:bg-stone-100"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Birth control pill & Intimacy */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <label className="p-3 rounded-xl border border-stone-200 bg-white flex items-center justify-between cursor-pointer hover:bg-stone-50">
                <span className="flex items-center gap-2 text-xs font-medium text-stone-800">
                  <Pill className="w-4 h-4 text-emerald-600" />
                  <span>Contraceptive Pill Taken</span>
                </span>
                <input
                  type="checkbox"
                  checked={pillTaken}
                  onChange={e => setPillTaken(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500 cursor-pointer"
                />
              </label>

              <label className="p-3 rounded-xl border border-stone-200 bg-white flex items-center justify-between cursor-pointer hover:bg-stone-50">
                <span className="flex items-center gap-2 text-xs font-medium text-stone-800">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span>Sexual Intimacy</span>
                </span>
                <input
                  type="checkbox"
                  checked={sexualActive}
                  onChange={e => setSexualActive(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded-sm focus:ring-rose-500 cursor-pointer"
                />
              </label>
            </div>

            {sexualActive && (
              <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100 flex items-center justify-between text-xs text-stone-700">
                <span>Protection Used?</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSexualProtected(true)}
                    className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                      sexualProtected
                        ? 'bg-white text-stone-900 border border-stone-200 shadow-xs'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    Protected
                  </button>
                  <button
                    type="button"
                    onClick={() => setSexualProtected(false)}
                    className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                      !sexualProtected
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    Unprotected
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section 6: Notes */}
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <label className="text-xs font-medium text-stone-700">
              Personal Notes & Observations
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Energy levels, emotional reflections, changes in diet or cramps..."
              className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400"
            />
          </div>

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs sm:text-sm font-medium text-white bg-rose-600 rounded-xl hover:bg-rose-700 active:scale-[0.98] transition-all shadow-sm shadow-rose-200"
            >
              Save Daily Log
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
