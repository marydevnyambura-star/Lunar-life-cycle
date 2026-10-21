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

/**
 * Returns today's date formatted as YYYY-MM-DD in the user's local timezone.
 */
export function getLocalTodayStr(): string {
  const now = new Date();
  return formatDateStr(now);
}

/**
 * Returns ordinal suffix for dates (e.g. 1st, 2nd, 3rd, 21st, 22nd, 23rd, etc.)
 */
export function getOrdinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

/**
 * Formats a Date object into human readable format: e.g. "Wednesday, 21st October 2026"
 */
export function formatDisplayDate(date: Date): string {
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
  const day = date.getDate();
  const suffix = getOrdinalSuffix(day);
  const month = date.toLocaleDateString('en-US', { month: 'long' });
  const year = date.getFullYear();
  return `${weekday}, ${day}${suffix} ${month} ${year}`;
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
 * Calculates cycle statistics from recorded cycles.
 * Uses historical cycles to calculate actual average cycle length between consecutive periods.
 * If insufficient history exists, falls back to the user's custom settings or default estimate.
 */
export function calculateCycleStats(cycles: CycleRecord[], defaultSettings: UserSettings) {
  const fallbackCycleLen = defaultSettings.avgCycleLength || 28;
  const fallbackPeriodDur = defaultSettings.avgPeriodDuration || 5;

  if (!cycles || cycles.length === 0) {
    return {
      averageCycleLength: fallbackCycleLen,
      averagePeriodDuration: fallbackPeriodDur,
      isEmpirical: false,
      completedCycleCount: 0,
      regularityScore: 'Default Estimate (Record 2+ periods)',
      shortestCycle: fallbackCycleLen,
      longestCycle: fallbackCycleLen,
      recordedCount: 0,
      estimateLabel: `Default estimate (${fallbackCycleLen} days · customize in Settings)`
    };
  }

  // Cycles with valid positive cycleLength (days from this period start to next period start)
  const completedCycles = cycles.filter(c => c.cycleLength && c.cycleLength >= 15 && c.cycleLength <= 65);
  const cycleLengths = completedCycles.map(c => c.cycleLength!);
  const periodLengths = cycles.filter(c => c.periodDuration && c.periodDuration > 0).map(c => c.periodDuration!);

  const hasEmpiricalHistory = cycleLengths.length >= 1;

  const avgCycle = hasEmpiricalHistory
    ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length)
    : fallbackCycleLen;

  const avgPeriod = periodLengths.length > 0
    ? Math.round(periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length)
    : fallbackPeriodDur;

  const shortest = cycleLengths.length > 0 ? Math.min(...cycleLengths) : avgCycle;
  const longest = cycleLengths.length > 0 ? Math.max(...cycleLengths) : avgCycle;
  const variance = longest - shortest;

  let regularityScore = 'Regular';
  if (!hasEmpiricalHistory) {
    regularityScore = 'Need 2+ recorded periods to calculate regularity';
  } else if (variance <= 2) {
    regularityScore = 'Very Regular (±1 day)';
  } else if (variance <= 4) {
    regularityScore = 'Normal (±2 days)';
  } else if (variance <= 7) {
    regularityScore = 'Moderate Variation (±4 days)';
  } else {
    regularityScore = 'Irregular Variation';
  }

  const estimateLabel = hasEmpiricalHistory
    ? `Calculated from your past ${completedCycles.length} recorded cycle${completedCycles.length > 1 ? 's' : ''} (${avgCycle} days)`
    : `Custom estimate (${fallbackCycleLen} days · from Settings)`;

  return {
    averageCycleLength: avgCycle,
    averagePeriodDuration: avgPeriod,
    isEmpirical: hasEmpiricalHistory,
    completedCycleCount: completedCycles.length,
    regularityScore,
    shortestCycle: shortest,
    longestCycle: longest,
    recordedCount: cycles.length,
    estimateLabel
  };
}

/**
 * Takes any list of cycle records, sorts chronologically, recalculates cycle length
 * (number of days between the first day of one period and the first day of the next period),
 * sets period duration and end dates, and marks ongoing status.
 */
export function recalculateAllCycles(
  cycles: CycleRecord[],
  defaultAvgPeriodDuration: number = 5
): CycleRecord[] {
  if (!cycles || cycles.length === 0) return [];

  // Sort ascending by startDate
  const ascending = [...cycles].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const todayStr = getLocalTodayStr();
  const todayObj = parseDateStr(todayStr);

  const processed: CycleRecord[] = [];

  for (let i = 0; i < ascending.length; i++) {
    const current = { ...ascending[i] };
    const curStart = parseDateStr(current.startDate);
    const periodDur = current.periodDuration && current.periodDuration > 0
      ? current.periodDuration
      : defaultAvgPeriodDuration;
    current.periodDuration = periodDur;

    // Calculate endDate if not provided or derive from duration
    if (!current.endDate) {
      current.endDate = formatDateStr(addDays(curStart, periodDur - 1));
    } else {
      const endObj = parseDateStr(current.endDate);
      const span = diffDays(endObj, curStart) + 1;
      if (span > 0) {
        current.periodDuration = span;
      }
    }

    // If there is a subsequent cycle in chronological order:
    if (i < ascending.length - 1) {
      const nextStart = parseDateStr(ascending[i + 1].startDate);
      const cycleLen = diffDays(nextStart, curStart);
      current.cycleLength = cycleLen > 0 ? cycleLen : undefined;
      current.cycleEndDate = ascending[i + 1].startDate;
      current.isOngoing = false;
    } else {
      // This is the latest recorded cycle
      current.cycleLength = undefined;
      current.cycleEndDate = undefined;
      const daysSinceStart = diffDays(todayObj, curStart);
      current.isOngoing = daysSinceStart >= 0 && daysSinceStart < 50;
    }

    processed.push(current);
  }

  // Return sorted descending by startDate (latest first)
  return processed.sort((a, b) => b.startDate.localeCompare(a.startDate));
}

/**
 * Computes current cycle status relative to reference date (today).
 * Dynamically uses calculated average cycle length from historical data or user settings.
 */
export function getCurrentCycleStatus(
  currentDateStr: string,
  cycles: CycleRecord[],
  settings: UserSettings
) {
  const currentDate = parseDateStr(currentDateStr);
  const stats = calculateCycleStats(cycles, settings);
  const cycleLen = stats.averageCycleLength;
  const periodDur = stats.averagePeriodDuration;
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

  const isFertile = cycleDay >= ovulationCycleDay - 5 && cycleDay <= ovulationCycleDay + 1;
  const isOvulationDay = cycleDay === ovulationCycleDay;

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
    periodDuration: periodDur,
    estimateLabel: stats.estimateLabel,
    isEmpirical: stats.isEmpirical
  };
}

/**
 * Predicts and tags any given calendar day.
 * Distinguishes confirmed logged/historical periods from predicted estimates.
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
  const stats = calculateCycleStats(cycles, settings);
  const cycleLen = stats.averageCycleLength;
  const periodDur = stats.averagePeriodDuration;
  const lutealLen = settings.lutealLength || 14;
  const ovDay = Math.max(10, cycleLen - lutealLen);

  const existingLog = logs[targetDateStr];
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

  const isFuture = daysDiff > 0;
  const isPeriod = isLoggedPeriod || isHistoricalPeriod;
  const isPredictedPeriod = !isPeriod && isFuture && (cycleDayModulo <= periodDur);

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
    isPredictedPeriod,
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
 * Dynamically anchors starter demo/seed data relative to the user's current date (new Date()).
 * Never uses a hardcoded fixed date.
 */
export function getInitialSeedData() {
  const today = new Date();

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

  // Seed 2 completed historical cycles and 1 current cycle relative to today
  const c3Start = addDays(today, -4);
  const c3End = addDays(c3Start, 4);

  const c2Start = addDays(c3Start, -28);
  const c2End = addDays(c2Start, 4);

  const c1Start = addDays(c2Start, -29);
  const c1End = addDays(c1Start, 4);

  const rawCycles: CycleRecord[] = [
    {
      id: 'c-3',
      startDate: formatDateStr(c3Start),
      endDate: formatDateStr(c3End),
      periodDuration: 5,
      isOngoing: true
    },
    {
      id: 'c-2',
      startDate: formatDateStr(c2Start),
      endDate: formatDateStr(c2End),
      periodDuration: 5,
      isOngoing: false
    },
    {
      id: 'c-1',
      startDate: formatDateStr(c1Start),
      endDate: formatDateStr(c1End),
      periodDuration: 5,
      isOngoing: false
    }
  ];

  const cycles = recalculateAllCycles(rawCycles, 5);

  const logs: Record<string, DailyLog> = {};
  const day0 = formatDateStr(c3Start);
  const day1 = formatDateStr(addDays(c3Start, 1));
  const day2 = formatDateStr(addDays(c3Start, 2));

  logs[day0] = {
    date: day0,
    isPeriod: true,
    flow: 'medium',
    symptoms: ['cramps', 'fatigue'],
    moods: ['sensitive'],
    waterGlasses: 7,
    sleepHours: 8,
    pillTaken: true,
    notes: 'Period started morning. Mild cramps.'
  };

  logs[day1] = {
    date: day1,
    isPeriod: true,
    flow: 'heavy',
    symptoms: ['cramps', 'bloating'],
    moods: ['calm'],
    waterGlasses: 8,
    sleepHours: 8,
    pillTaken: true,
    notes: 'Warm herbal tea and rest.'
  };

  logs[day2] = {
    date: day2,
    isPeriod: true,
    flow: 'medium',
    symptoms: [],
    moods: ['calm', 'happy'],
    waterGlasses: 7,
    sleepHours: 8,
    pillTaken: true,
    notes: 'Flow steady, feeling balanced.'
  };

  return { settings, cycles, logs };
}
