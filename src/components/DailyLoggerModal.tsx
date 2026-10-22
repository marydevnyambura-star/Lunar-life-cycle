import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Droplets,
  Smile,
  Zap,
  Sparkles,
  Moon,
  Coffee,
  Heart,
  Thermometer,
  Scale,
  Clock,
  Pill,
  Activity,
  AlertCircle
} from 'lucide-react';
import { DailyLog, FlowIntensity, Symptom, Mood, MucusType, UserSettings, PainSeverity } from '../types';

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
  { id: 'pelvic_pain', label: 'Pelvic Pain', icon: '🌸' },
  { id: 'backache', label: 'Backache', icon: '🦴' },
  { id: 'headache', label: 'Headache', icon: '🤕' },
  { id: 'bloating', label: 'Bloating', icon: '🫧' },
  { id: 'tender_breasts', label: 'Tender Breasts', icon: '💗' },
  { id: 'fatigue', label: 'Fatigue', icon: '🥱' },
  { id: 'acne', label: 'Acne / Breakouts', icon: '✨' },
  { id: 'cravings', label: 'Food Cravings', icon: '🍫' },
  { id: 'nausea', label: 'Nausea', icon: '💫' },
  { id: 'joint_pain', label: 'Joint Pain', icon: '🦵' },
  { id: 'insomnia', label: 'Insomnia', icon: '🌙' },
  { id: 'mood_swings', label: 'Mood Shifts', icon: '🎭' }
];

const MOOD_OPTIONS: { id: Mood; label: string; emoji: string }[] = [
  { id: 'calm', label: 'Calm', emoji: '🌿' },
  { id: 'happy', label: 'Happy', emoji: '☀️' },
  { id: 'energetic', label: 'Energetic', emoji: '⚡' },
  { id: 'sensitive', label: 'Sensitive', emoji: '💧' },
  { id: 'irritable', label: 'Irritable', emoji: '🔥' },
  { id: 'anxious', label: 'Anxious', emoji: '🌀' },
  { id: 'sad', label: 'Sad', emoji: '🌧️' },
  { id: 'exhausted', label: 'Exhausted', emoji: '🛌' }
];

const MUCUS_OPTIONS: { id: MucusType; label: string; desc: string }[] = [
  { id: 'dry', label: 'Dry / None', desc: 'Typical early follicular or late luteal' },
  { id: 'sticky', label: 'Sticky', desc: 'Thick, low fertility' },
  { id: 'creamy', label: 'Creamy', desc: 'Lotion-like, approaching fertile window' },
  { id: 'eggwhite', label: 'Egg-White', desc: 'Clear, stretchy, peak fertility' },
  { id: 'watery', label: 'Watery', desc: 'Slippery and wet, highly fertile' }
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
  const [overallPain, setOverallPain] = useState<PainSeverity>(existingLog?.overallPain ?? 'none');
  const [symptoms, setSymptoms] = useState<Symptom[]>(existingLog?.symptoms ?? []);
  const [moods, setMoods] = useState<Mood[]>(existingLog?.moods ?? []);
  const [medTaken, setMedTaken] = useState<boolean>(existingLog?.medication?.taken ?? false);
  const [medName, setMedName] = useState<string>(existingLog?.medication?.name ?? '');
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
  const [unusualChanges, setUnusualChanges] = useState<string>(existingLog?.unusualChanges ?? '');

  useEffect(() => {
    if (existingLog) {
      setDate(existingLog.date);
      setIsPeriod(existingLog.isPeriod);
      setFlow(existingLog.flow ?? 'none');
      setOverallPain(existingLog.overallPain ?? 'none');
      setSymptoms(existingLog.symptoms ?? []);
      setMoods(existingLog.moods ?? []);
      setMedTaken(existingLog.medication?.taken ?? false);
      setMedName(existingLog.medication?.name ?? '');
      setCervicalMucus(existingLog.cervicalMucus);
      setTemperature(existingLog.temperature ? existingLog.temperature.toString() : '');
      setWeight(existingLog.weight ? existingLog.weight.toString() : '');
      setWaterGlasses(existingLog.waterGlasses ?? 6);
      setSleepHours(existingLog.sleepHours ?? 7.5);
      setPillTaken(existingLog.pillTaken ?? false);
      setSexualActive(existingLog.sexualActivity?.active ?? false);
      setSexualProtected(existingLog.sexualActivity?.protected ?? true);
      setNotes(existingLog.notes ?? '');
      setUnusualChanges(existingLog.unusualChanges ?? '');
    } else {
      setDate(selectedDate);
      setIsPeriod(false);
      setFlow('none');
      setOverallPain('none');
      setSymptoms([]);
      setMoods([]);
      setMedTaken(false);
      setMedName('');
      setCervicalMucus(undefined);
      setTemperature('');
      setWeight('');
      setWaterGlasses(6);
      setSleepHours(7.5);
      setPillTaken(false);
      setSexualActive(false);
      setSexualProtected(true);
      setNotes('');
      setUnusualChanges('');
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

    const log: DailyLog = {
      date,
      isPeriod,
      flow,
      overallPain,
      symptoms,
      moods,
      medication: medTaken || medName.trim() ? { taken: true, name: medName.trim() || 'Pain relief' } : undefined,
      cervicalMucus,
      temperature: temperature ? parseFloat(temperature) : undefined,
      weight: weight ? parseFloat(weight) : undefined,
      waterGlasses,
      sleepHours,
      pillTaken,
      sexualActivity: {
        active: sexualActive,
        protected: sexualProtected
      },
      notes: notes.trim() || undefined,
      unusualChanges: unusualChanges.trim() || undefined
    };

    onSaveLog(log);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#C8A2E8]/40 overflow-hidden my-6">
        {/* Modal Top Header in Purple Gradient */}
        <div className="bg-gradient-to-r from-[#542080] via-[#7B2CBF] to-[#EC4899] px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display tracking-tight text-white">
                Daily Health & Symptoms Log
              </h2>
              <p className="text-xs text-purple-100">
                Log flow, pain severity, symptoms, and medication for {date}
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

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Date Picker Row */}
          <div className="flex items-center gap-3 p-3 bg-[#F6F0FC] rounded-2xl border border-[#C8A2E8]/40">
            <Clock className="w-4 h-4 text-[#7B2CBF]" />
            <span className="text-xs font-semibold text-[#542080]">Logging Date:</span>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="bg-white px-3 py-1.5 rounded-xl border border-[#C8A2E8]/40 text-xs font-mono font-bold text-[#321442] focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]"
            />
          </div>

          {/* Section 1: Menstrual Bleeding & Flow */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#321442] flex items-center gap-2">
                <Droplets className="w-4 h-4 text-[#EC4899]" />
                <span>Period Flow Intensity</span>
              </label>
              {isPeriod && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-[#EC4899]">
                  Period Bleed Active
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(
                [
                  { id: 'none', label: 'None', desc: 'No bleeding' },
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
                    onClick={() => handleFlowSelect(item.id)}
                    className={`py-2 px-2 rounded-2xl text-center border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#FCE7F3] border-[#EC4899] text-pink-900 ring-2 ring-pink-300 shadow-xs'
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

          {/* Section 2: Pain Severity */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#321442] flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#EC4899]" />
              <span>Overall Pain Severity (Cramps, Headache, Pelvic Pain)</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(
                [
                  { id: 'none', label: 'None', desc: 'No pain' },
                  { id: 'mild', label: 'Mild', desc: 'Manageable' },
                  { id: 'moderate', label: 'Moderate', desc: 'Noticeable' },
                  { id: 'severe', label: 'Severe', desc: 'Disruptive' }
                ] as const
              ).map(item => {
                const isSelected = overallPain === item.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setOverallPain(item.id)}
                    className={`py-2 px-2 rounded-2xl text-center border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-100 border-[#7B2CBF] text-[#542080] ring-2 ring-purple-300 shadow-xs'
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

          {/* Section 3: Physical Symptoms */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#321442] flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#7B2CBF]" />
              <span>Physical Symptoms</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SYMPTOM_OPTIONS.map(opt => {
                const isSelected = symptoms.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleSymptom(opt.id)}
                    className={`p-2.5 rounded-2xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#FCE7F3] border-[#EC4899] text-[#321442] ring-1 ring-pink-300 shadow-xs'
                        : 'bg-white border-[#C8A2E8]/40 text-stone-600 hover:bg-purple-50'
                    }`}
                  >
                    <span className="text-lg">{opt.icon}</span>
                    <span className="text-xs font-semibold">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Mood & Emotional State */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#321442] flex items-center gap-2">
              <Smile className="w-4 h-4 text-[#EC4899]" />
              <span>Mood & Mental State</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {MOOD_OPTIONS.map(opt => {
                const isSelected = moods.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleMood(opt.id)}
                    className={`p-2.5 rounded-2xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-100 border-[#7B2CBF] text-[#542080] ring-1 ring-purple-300 shadow-xs'
                        : 'bg-white border-[#C8A2E8]/40 text-stone-600 hover:bg-purple-50'
                    }`}
                  >
                    <span className="text-lg">{opt.emoji}</span>
                    <span className="text-xs font-semibold">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: Medication & Pain Relief */}
          <div className="space-y-2 p-4 bg-[#F6F0FC] rounded-2xl border border-[#C8A2E8]/40">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#321442] flex items-center gap-2">
                <Pill className="w-4 h-4 text-[#7B2CBF]" />
                <span>Medication / Pain Relief Taken</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#542080]">
                <input
                  type="checkbox"
                  checked={medTaken}
                  onChange={e => setMedTaken(e.target.checked)}
                  className="rounded text-[#EC4899] focus:ring-[#EC4899]"
                />
                <span>Took medication today</span>
              </label>
            </div>

            <div className="flex items-center gap-2 flex-wrap pt-1">
              {['Ibuprofen', 'Paracetamol', 'Naproxen', 'Heating Pad', 'Herbal Infusion'].map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMedTaken(true);
                    setMedName(m);
                  }}
                  className={`text-xs px-2.5 py-1 rounded-xl border transition-all cursor-pointer ${
                    medName === m
                      ? 'bg-[#7B2CBF] text-white border-[#7B2CBF]'
                      : 'bg-white border-[#C8A2E8]/40 text-[#542080] hover:bg-purple-100'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Medication name or dosage (e.g. Ibuprofen 400mg, Chamomile tea)..."
              value={medName}
              onChange={e => {
                setMedName(e.target.value);
                if (e.target.value.trim()) setMedTaken(true);
              }}
              className="w-full bg-white px-3.5 py-2 rounded-xl border border-[#C8A2E8]/40 text-xs text-[#321442] focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]"
            />
          </div>

          {/* Section 6: Water & Sleep */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-[#F6F0FC] rounded-2xl border border-[#C8A2E8]/40 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#321442] flex items-center gap-2">
                <Coffee className="w-4 h-4 text-[#7B2CBF]" />
                <span>Water Hydration</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setWaterGlasses(Math.max(0, waterGlasses - 1))}
                  className="w-9 h-9 rounded-xl border border-[#C8A2E8]/40 bg-white hover:bg-purple-100 flex items-center justify-center font-bold text-[#542080] cursor-pointer"
                >
                  -
                </button>
                <span className="font-mono text-base font-extrabold text-[#321442] px-3">
                  {waterGlasses} glasses
                </span>
                <button
                  type="button"
                  onClick={() => setWaterGlasses(waterGlasses + 1)}
                  className="w-9 h-9 rounded-xl border border-[#C8A2E8]/40 bg-white hover:bg-purple-100 flex items-center justify-center font-bold text-[#542080] cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <div className="p-4 bg-[#F6F0FC] rounded-2xl border border-[#C8A2E8]/40 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#321442] flex items-center gap-2">
                <Moon className="w-4 h-4 text-[#7B2CBF]" />
                <span>Sleep Duration</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSleepHours(Math.max(0, sleepHours - 0.5))}
                  className="w-9 h-9 rounded-xl border border-[#C8A2E8]/40 bg-white hover:bg-purple-100 flex items-center justify-center font-bold text-[#542080] cursor-pointer"
                >
                  -
                </button>
                <span className="font-mono text-base font-extrabold text-[#321442] px-3">
                  {sleepHours} hrs
                </span>
                <button
                  type="button"
                  onClick={() => setSleepHours(sleepHours + 0.5)}
                  className="w-9 h-9 rounded-xl border border-[#C8A2E8]/40 bg-white hover:bg-purple-100 flex items-center justify-center font-bold text-[#542080] cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Section 7: Notes on Unusual Changes */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#321442]">
              Notes & Unusual Observations
            </label>
            <textarea
              rows={2}
              placeholder="Log any unusual bodily changes, spotting, food sensitivities, or reflections..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-[#F6F0FC] px-3.5 py-2.5 rounded-2xl border border-[#C8A2E8]/40 text-xs text-[#321442] focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]"
            />
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
              <span>Save Daily Log</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
