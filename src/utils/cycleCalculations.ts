import { CycleRecord, DailyLog, DayPrediction, CyclePhase, UserSettings, PhaseInfo } from '../types';

export function formatDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateStr(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function diffDays(d1: Date, d2: Date): number {
  const t1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate()).getTime();
  const t2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate()).getTime();
  return Math.round((t1 - t2) / (1000 * 60 * 60 * 24));
}

// Phase details and scientific cycle-syncing guidance
export const PHASE_GUIDE: Record<CyclePhase, PhaseInfo> = {
  menstrual: {
    phase: 'menstrual',
    title: 'Menstrual Phase',
    dayRange: 'Days 1 – 5',
    summary: 'The uterine lining sheds as estrogen and progesterone dip to their lowest baseline levels.',
    hormones: 'Low estrogen & progesterone. Rising FSH at end.',
    energy: 'Inward, reflective, lower physical endurance.',
    nutrition: [
      'Iron-dense foods (dark greens, lentils, lean protein)',
      'Warm herbal infusions (chamomile, ginger, raspberry leaf)',
      'Healthy omega-3 fats to soothe inflammatory prostaglandins',
      'Hydration with electrolytes to ease muscle cramping'
    ],
    movement: [
      'Gentle yin yoga & pelvic opening postures',
      'Leisurely outdoor walking',
      'Breathwork and meditation',
      'Restorative stretching'
    ],
    selfCare: 'Honor quiet downtime, take warm magnesium baths, and keep schedules flexible.'
  },
  follicular: {
    phase: 'follicular',
    title: 'Follicular Phase',
    dayRange: 'Days 6 – 13',
    summary: 'FSH stimulates follicle growth in ovaries while rising estradiol builds fresh stamina and optimism.',
    hormones: 'Steadily climbing estradiol (estrogen); low progesterone.',
    energy: 'Surging vitality, sharper cognitive focus, high motivation.',
    nutrition: [
      'Fermented probiotic foods to metabolize active estrogen',
      'Sprouted seeds (pumpkin & flaxseed seed-syncing)',
      'Bright citrus fruits, avocado, and cruciferous veggies',
      'Clean proteins to support muscle recovery'
    ],
    movement: [
      'Progressive strength training and weight lifting',
      'Vinyasa dynamic flow and Pilates',
      'Higher cadence cardio & running',
      'Learning new movement techniques or sports'
    ],
    selfCare: 'Great window for brainstorming, social gatherings, public speaking, and starting new projects.'
  },
  ovulation: {
    phase: 'ovulation',
    title: 'Ovulatory Phase',
    dayRange: 'Days 14 – 16',
    summary: 'Luteinizing Hormone (LH) surges triggering mature egg release; estrogen peaks alongside a brief testosterone spike.',
    hormones: 'Peak estrogen, LH surge, transient testosterone rise.',
    energy: 'Peak confidence, magnetic charisma, highest communicative drive.',
    nutrition: [
      'Antioxidant-rich berries and vibrant bell peppers',
      'Fiber-rich legumes to facilitate liver hormone clearance',
      'Sunflower & sesame seeds for luteal transition',
      'Light, fresh Mediterranean-style meals'
    ],
    movement: [
      'HIIT & high-intensity interval workouts',
      'Peak personal-record strength lifts',
      'Upbeat dance, cycling, or energetic sprints',
      'Group athletic classes'
    ],
    selfCare: 'Peak fertility window. Excellent time for important conversations, negotiations, and creative collaboration.'
  },
  luteal: {
    phase: 'luteal',
    title: 'Luteal Phase',
    dayRange: 'Days 17 – 28',
    summary: 'The corpus luteum secretes progesterone to nourish uterine lining. Basal body temperature slightly elevates.',
    hormones: 'Dominant progesterone, secondary modest estrogen bump.',
    energy: 'Detail-oriented, grounded initially; tapering physical stamina near PMS.',
    nutrition: [
      'Complex slow-burning carbohydrates (sweet potato, oats, quinoa)',
      'Magnesium-dense dark chocolate (70%+), pumpkin seeds, spinach',
      'B-vitamin rich foods to support serotonin synthesis',
      'Reduced refined caffeine and excess sodium to curb fluid retention'
    ],
    movement: [
      'Moderate pilates and deliberate resistance circuits',
      'Steady-state hiking and restorative swimming',
      'Low-impact sculpt sessions',
      'Deep fascia foam rolling'
    ],
    selfCare: 'Organize spaces, complete ongoing tasks, prioritize consistent 8-hour sleep hygiene.'
  }
};

/**
 * Computes current cycle status relative to reference date (today).
 */
export function getCurrentCycleStatus(
  currentDateStr: string,
  cycles: CycleRecord[],
  settings: UserSettings
) {
  const currentDate = parseDateStr(currentDateStr);
  const cycleLen = settings.avgCycleLength || 28;
  const periodDur = settings.avgPeriodDuration || 5;
  const lutealLen = settings.lutealLength || 14;

  // Sort cycles by startDate descending
  const sortedCycles = [...cycles].sort((a, b) => b.startDate.localeCompare(a.startDate));
  const latestCycle = sortedCycles[0];

  let cycleStartDate: Date;
  let isPredictedStart = false;

  if (latestCycle) {
    const latestStart = parseDateStr(latestCycle.startDate);
    const daysSinceStart = diffDays(currentDate, latestStart);

    if (daysSinceStart >= 0 && daysSinceStart < cycleLen + 7) {
      cycleStartDate = latestStart;
    } else if (daysSinceStart >= cycleLen + 7) {
      // Multiple cycles might have elapsed without an explicit log
      const elapsedCycles = Math.floor(daysSinceStart / cycleLen);
      cycleStartDate = addDays(latestStart, elapsedCycles * cycleLen);
      isPredictedStart = true;
    } else {
      // Today is before the latest cycle? Fallback
      cycleStartDate = latestStart;
    }
  } else {
    // Default fallback: 14 days ago
    cycleStartDate = addDays(currentDate, -14);
  }

  const cycleDay = Math.max(1, diffDays(currentDate, cycleStartDate) + 1);
  const daysUntilNextPeriod = Math.max(0, cycleLen - cycleDay + 1);
  const nextPeriodDate = addDays(cycleStartDate, cycleLen);
  const nextPeriodDateStr = formatDateStr(nextPeriodDate);

  // Ovulation is usually approx (cycleLen - lutealLen)
  const ovulationCycleDay = Math.max(10, cycleLen - lutealLen);
  const ovulationDate = addDays(cycleStartDate, ovulationCycleDay - 1);
  const ovulationDateStr = formatDateStr(ovulationDate);

  // Phase determination
  let currentPhase: CyclePhase = 'follicular';
  if (cycleDay <= periodDur) {
    currentPhase = 'menstrual';
  } else if (cycleDay < ovulationCycleDay - 1) {
    currentPhase = 'follicular';
  } else if (cycleDay <= ovulationCycleDay + 1) {
    currentPhase = 'ovulation';
  } else {
    currentPhase = 'luteal';
  }

  // Fertile window: ovulationDay - 5 to ovulationDay + 1
  const isFertile = cycleDay >= ovulationCycleDay - 5 && cycleDay <= ovulationCycleDay + 1;
  const isOvulationDay = cycleDay === ovulationCycleDay;

  // Pregnancy chance
  let conceptionChance: 'Low' | 'Moderate' | 'High' | 'Very High' = 'Low';
  if (isOvulationDay) {
    conceptionChance = 'Very High';
  } else if (cycleDay >= ovulationCycleDay - 2 && cycleDay <= ovulationCycleDay) {
    conceptionChance = 'High';
  } else if (isFertile) {
    conceptionChance = 'Moderate';
  } else {
    conceptionChance = 'Low';
  }

  return {
    cycleDay,
    currentPhase,
    daysUntilNextPeriod,
    nextPeriodDateStr,
    ovulationDateStr,
    ovulationCycleDay,
    isFertile,
    isOvulationDay,
    conceptionChance,
    cycleStartDateStr: formatDateStr(cycleStartDate),
    isPredictedStart,
    totalCycleDays: cycleLen,
    periodDuration: periodDur
  };
}

/**
 * Predicts and tags any given calendar day.
 */
export function getDayPrediction(
  targetDateStr: string,
  currentCycleStartStr: string,
  settings: UserSettings,
  logs: Record<string, DailyLog>,
  cycles: CycleRecord[]
): DayPrediction {
  const targetDate = parseDateStr(targetDateStr);
  const currentCycleStart = parseDateStr(currentCycleStartStr);
  const cycleLen = settings.avgCycleLength || 28;
  const periodDur = settings.avgPeriodDuration || 5;
  const lutealLen = settings.lutealLength || 14;
  const ovDay = Math.max(10, cycleLen - lutealLen);

  const existingLog = logs[targetDateStr];

  // Direct check if explicitly recorded as period in logs
  const isLoggedPeriod = !!existingLog?.isPeriod;
  const flow = existingLog?.flow;

  // Check if inside historical recorded period duration in cycles
  let isHistoricalPeriod = false;
  for (const c of cycles) {
    const cStart = parseDateStr(c.startDate);
    const dur = c.periodDuration || periodDur;
    const diff = diffDays(targetDate, cStart);
    if (diff >= 0 && diff < dur) {
      isHistoricalPeriod = true;
      break;
    }
  }

  // Calculate position within cycles
  const daysDiff = diffDays(targetDate, currentCycleStart);
  let cycleDayModulo = (daysDiff % cycleLen + cycleLen) % cycleLen + 1;

  // Check if predicted period
  const isFuture = daysDiff > 0;
  const isPredictedPeriod = !isLoggedPeriod && !isHistoricalPeriod && (cycleDayModulo <= periodDur);

  const isPeriod = isLoggedPeriod || isHistoricalPeriod;
  const isOvulation = cycleDayModulo === ovDay;
  const isFertile = cycleDayModulo >= ovDay - 5 && cycleDayModulo <= ovDay + 1;
  const isPms = cycleDayModulo >= cycleLen - 4 && cycleDayModulo <= cycleLen;

  let phase: CyclePhase = 'follicular';
  if (isPeriod || cycleDayModulo <= periodDur) {
    phase = 'menstrual';
  } else if (cycleDayModulo < ovDay - 1) {
    phase = 'follicular';
  } else if (cycleDayModulo <= ovDay + 1) {
    phase = 'ovulation';
  } else {
    phase = 'luteal';
  }

  return {
    date: targetDateStr,
    isPeriod,
    isPredictedPeriod: isFuture && isPredictedPeriod,
    isOvulation,
    isFertile,
    isPms,
    phase,
    cycleDay: cycleDayModulo,
    flow,
    hasLog: !!existingLog
  };
}

/**
 * Calculates cycle statistics from recorded cycles.
 */
export function calculateCycleStats(cycles: CycleRecord[], defaultSettings: UserSettings) {
  if (!cycles || cycles.length === 0) {
    return {
      averageCycleLength: defaultSettings.avgCycleLength,
      averagePeriodDuration: defaultSettings.avgPeriodDuration,
      regularityScore: 'Normal (±1 day)',
      shortestCycle: defaultSettings.avgCycleLength,
      longestCycle: defaultSettings.avgCycleLength,
      recordedCount: 0
    };
  }

  const finishedCycles = cycles.filter(c => c.cycleLength && c.cycleLength > 0);
  const cycleLengths = finishedCycles.map(c => c.cycleLength!);
  const periodLengths = cycles.filter(c => c.periodDuration).map(c => c.periodDuration!);

  const avgCycle = cycleLengths.length > 0
    ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length)
    : defaultSettings.avgCycleLength;

  const avgPeriod = periodLengths.length > 0
    ? Math.round(periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length)
    : defaultSettings.avgPeriodDuration;

  const shortest = cycleLengths.length > 0 ? Math.min(...cycleLengths) : avgCycle;
  const longest = cycleLengths.length > 0 ? Math.max(...cycleLengths) : avgCycle;
  const variance = longest - shortest;

  let regularityScore = 'Very Regular (±1 day)';
  if (variance <= 2) {
    regularityScore = 'Very Regular (±1 day)';
  } else if (variance <= 4) {
    regularityScore = 'Normal (±2 days)';
  } else if (variance <= 7) {
    regularityScore = 'Moderate Variation (±4 days)';
  } else {
    regularityScore = 'Irregular Variation';
  }

  return {
    averageCycleLength: avgCycle,
    averagePeriodDuration: avgPeriod,
    regularityScore,
    shortestCycle: shortest,
    longestCycle: longest,
    recordedCount: cycles.length
  };
}

/**
 * Provides default initial seed data anchored around the current reference date (2026-10-16).
 * Today (Oct 16, 2026) is Day 5 of the current menstrual cycle, started Oct 12, 2026.
 */
export function getInitialSeedData() {
  const settings: UserSettings = {
    avgCycleLength: 28,
    avgPeriodDuration: 5,
    lutealLength: 14,
    tempUnit: 'C',
    weightUnit: 'kg',
    pillReminderEnabled: true,
    pillReminderTime: '21:00',
    privacyMode: false,
    pinEnabled: false,
    pinCode: '1234'
  };

  const cycles: CycleRecord[] = [
    {
      id: 'c-3',
      startDate: '2026-10-12',
      endDate: '2026-10-16',
      periodDuration: 5,
      isOngoing: true
    },
    {
      id: 'c-2',
      startDate: '2026-09-14',
      endDate: '2026-09-18',
      cycleEndDate: '2026-10-11',
      cycleLength: 28,
      periodDuration: 5,
      isOngoing: false
    },
    {
      id: 'c-1',
      startDate: '2026-08-17',
      endDate: '2026-08-21',
      cycleEndDate: '2026-09-13',
      cycleLength: 28,
      periodDuration: 5,
      isOngoing: false
    }
  ];

  const logs: Record<string, DailyLog> = {
    '2026-10-12': {
      date: '2026-10-12',
      isPeriod: true,
      flow: 'medium',
      symptoms: ['cramps', 'fatigue', 'backache'],
      moods: ['sensitive', 'exhausted'],
      waterGlasses: 6,
      sleepHours: 7.5,
      pillTaken: true,
      notes: 'Period started morning. Mild lower back tension.'
    },
    '2026-10-13': {
      date: '2026-10-13',
      isPeriod: true,
      flow: 'heavy',
      symptoms: ['cramps', 'bloating'],
      moods: ['calm', 'sensitive'],
      waterGlasses: 8,
      sleepHours: 8,
      pillTaken: true,
      notes: 'Used heating pad, chamomile tea helped soothe cramps.'
    },
    '2026-10-14': {
      date: '2026-10-14',
      isPeriod: true,
      flow: 'medium',
      symptoms: ['cramps'],
      moods: ['calm', 'happy'],
      waterGlasses: 7,
      sleepHours: 8,
      pillTaken: true,
      temperature: 36.4,
      weight: 58.5,
      notes: 'Feeling noticeably more balanced today.'
    },
    '2026-10-15': {
      date: '2026-10-15',
      isPeriod: true,
      flow: 'light',
      symptoms: [],
      moods: ['happy', 'calm'],
      waterGlasses: 8,
      sleepHours: 8,
      pillTaken: true,
      temperature: 36.5,
      weight: 58.4,
      notes: 'Flow tapering down nicely, energy returning.'
    },
    '2026-10-16': {
      date: '2026-10-16',
      isPeriod: true,
      flow: 'spotting',
      symptoms: [],
      moods: ['energetic', 'happy'],
      waterGlasses: 7,
      sleepHours: 8.5,
      pillTaken: true,
      temperature: 36.5,
      weight: 58.2,
      notes: 'Final spotting today (Day 5). Feeling refreshed and motivated!'
    }
  };

  return { settings, cycles, logs };
}
