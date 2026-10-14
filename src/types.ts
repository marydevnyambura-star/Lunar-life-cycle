export type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

export type FlowIntensity = 'none' | 'spotting' | 'light' | 'medium' | 'heavy';

export type Symptom = 
  | 'cramps'
  | 'headache'
  | 'bloating'
  | 'tender_breasts'
  | 'fatigue'
  | 'acne'
  | 'backache'
  | 'nausea'
  | 'cravings'
  | 'insomnia';

export type Mood = 
  | 'calm'
  | 'happy'
  | 'energetic'
  | 'sensitive'
  | 'irritable'
  | 'anxious'
  | 'sad'
  | 'exhausted';

export type MucusType = 'dry' | 'sticky' | 'creamy' | 'eggwhite' | 'watery';

export interface SexualActivity {
  active: boolean;
  protected?: boolean;
  notes?: string;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  isPeriod: boolean;
  flow?: FlowIntensity;
  symptoms: Symptom[];
  moods: Mood[];
  cervicalMucus?: MucusType;
  temperature?: number; // Basal Body Temp
  weight?: number; // Body Weight
  waterGlasses?: number;
  sleepHours?: number;
  sexualActivity?: SexualActivity;
  pillTaken?: boolean;
  notes?: string;
}

export interface CycleRecord {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string;   // Bleed end date (YYYY-MM-DD)
  cycleEndDate?: string; // Next period start date (YYYY-MM-DD)
  cycleLength?: number;  // Total cycle span in days
  periodDuration?: number; // Bleed length in days
  isOngoing?: boolean;
}

export interface UserSettings {
  avgCycleLength: number; // default 28
  avgPeriodDuration: number; // default 5
  lutealLength: number; // default 14
  tempUnit: 'C' | 'F';
  weightUnit: 'kg' | 'lbs';
  pillReminderEnabled: boolean;
  pillReminderTime: string;
  privacyMode: boolean; // masks intimate text with neutral labels
  pinEnabled: boolean;
  pinCode: string; // 4-digit code
}

export interface DayPrediction {
  date: string;
  isPeriod: boolean;
  isPredictedPeriod: boolean;
  isOvulation: boolean;
  isFertile: boolean;
  isPms: boolean;
  phase: CyclePhase;
  cycleDay?: number;
  flow?: FlowIntensity;
  hasLog: boolean;
}

export interface PhaseInfo {
  phase: CyclePhase;
  title: string;
  dayRange: string;
  summary: string;
  hormones: string;
  energy: string;
  nutrition: string[];
  movement: string[];
  selfCare: string;
}
