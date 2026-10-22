export type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

export type FlowIntensity = 'none' | 'spotting' | 'light' | 'medium' | 'heavy';

export type PainSeverity = 'none' | 'mild' | 'moderate' | 'severe';

export type Symptom = 
  | 'cramps'
  | 'headache'
  | 'bloating'
  | 'tender_breasts'
  | 'fatigue'
  | 'acne'
  | 'backache'
  | 'pelvic_pain'
  | 'joint_pain'
  | 'nausea'
  | 'cravings'
  | 'insomnia'
  | 'mood_swings';

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

export interface PainLevels {
  cramps?: PainSeverity;
  headache?: PainSeverity;
  backache?: PainSeverity;
  pelvicPain?: PainSeverity;
}

export interface MedicationRecord {
  taken: boolean;
  name?: string; // e.g., "Ibuprofen", "Paracetamol", "Naproxen", "Heat Therapy", "Herbal Tea"
  dosage?: string;
  notes?: string;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  isPeriod: boolean;
  flow?: FlowIntensity;
  symptoms: Symptom[];
  moods: Mood[];
  overallPain?: PainSeverity;
  painLevels?: PainLevels;
  medication?: MedicationRecord;
  cervicalMucus?: MucusType;
  temperature?: number; // Basal Body Temp
  weight?: number; // Body Weight
  waterGlasses?: number;
  sleepHours?: number;
  sexualActivity?: SexualActivity;
  pillTaken?: boolean;
  notes?: string;
  unusualChanges?: string;
}

export interface CycleRecord {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string;   // Bleed end date (YYYY-MM-DD)
  cycleEndDate?: string; // Next period start date (YYYY-MM-DD)
  cycleLength?: number;  // Total cycle span in days
  periodDuration?: number; // Bleed length in days
  isOngoing?: boolean;
  flow?: FlowIntensity;
  symptoms?: Symptom[];
  painSeverity?: PainSeverity;
  medications?: string[];
  notes?: string;
  predictedStartDate?: string;
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

export type PeriodStatusType = 
  | 'upcoming'
  | 'period_started'
  | 'earlier_than_expected'
  | 'within_expected_range'
  | 'later_than_expected'
  | 'prediction_unavailable';

export interface PeriodPredictionResult {
  status: PeriodStatusType;
  statusLabel: string;
  statusBadgeColor: string; // CSS class
  statusDescription: string;
  predictedStartDate: string; // YYYY-MM-DD
  predictedRangeStart: string; // YYYY-MM-DD
  predictedRangeEnd: string;   // YYYY-MM-DD
  uncertaintyDays: number;     // e.g. ±1 or ±2 days
  daysRemainingOrOverdue: number; // positive = days until, negative = days past
  confidenceLevel: 'provisional' | 'moderate' | 'high' | 'insufficient';
  confidenceLabel: string;
  averageCycleLength: number;
  cycleVariabilityDays: number;
  cyclesAnalyzedCount: number;
  gentleNotification?: string;
}

export interface DayPrediction {
  date: string;
  isPeriod: boolean;
  isPredictedPeriod: boolean;
  isPredictedWindow: boolean;
  isOvulation: boolean;
  isFertile: boolean;
  isPms: boolean;
  phase: CyclePhase;
  cycleDay?: number;
  flow?: FlowIntensity;
  hasLog: boolean;
  symptoms?: Symptom[];
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

export interface SymptomFrequency {
  symptom: Symptom;
  count: number;
  cyclesCount: number;
  percentageOfCycles: number;
  typicalPhase: CyclePhase;
  preMenstrualCount: number;
  menstrualCount: number;
  severityBreakdown: Record<PainSeverity, number>;
}

export interface MenstrualHealthInsights {
  totalCyclesAnalyzed: number;
  totalLoggedDays: number;
  dateRangeCovered: string;
  frequentSymptoms: SymptomFrequency[];
  recurringCyclePatterns: string[];
  preMenstrualPatterns: string[];
  menstrualPatterns: string[];
  flowTrends: {
    averageDuration: number;
    predominantFlow: FlowIntensity;
    durationVariation: string;
  };
  painInsights: {
    mostCommonPain: string;
    predominantSeverity: PainSeverity;
    frequentMedications: string[];
  };
  medicalDisclaimer: string;
  urgentCareGuidance: string;
}
