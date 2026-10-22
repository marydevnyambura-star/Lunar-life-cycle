import {
  CycleRecord,
  DailyLog,
  DayPrediction,
  CyclePhase,
  UserSettings,
  PhaseInfo,
  PeriodPredictionResult,
  MenstrualHealthInsights,
  Symptom,
  SymptomFrequency,
  PainSeverity,
  FlowIntensity
} from '../types';

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

/**
 * Formats a Date object into a shorter display format: e.g. "21 Oct 2026"
 */
export function formatShortDate(date: Date): string {
  const day = date.getDate();
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

// Phase details and scientific cycle-syncing guidance
export const PHASE_GUIDE: Record<CyclePhase, PhaseInfo> = {
  menstrual: {
    phase: 'menstrual',
    title: 'Menstrual Phase',
    dayRange: 'Days 1 – 5',
    summary: 'The uterine lining sheds as estrogen and progesterone dip to baseline levels.',
    hormones: 'Low estrogen & progesterone. Rising FSH at end.',
    energy: 'Inward, reflective, lower physical endurance.',
    nutrition: [
      'Iron-dense foods (dark leafy greens, lentils, clean protein)',
      'Warm herbal infusions (chamomile, ginger, raspberry leaf)',
      'Healthy omega-3 fats to soothe inflammatory prostaglandins',
      'Hydration with magnesium & electrolytes to ease muscle cramping'
    ],
    movement: [
      'Gentle restorative yin yoga & pelvic opening postures',
      'Leisurely outdoor walking',
      'Gentle breathwork and guided meditation',
      'Restorative full-body stretching'
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
    summary: 'Luteinizing Hormone (LH) surges triggering mature egg release; estrogen peaks alongside a transient testosterone spike.',
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
 * Uses outlier filtering so an atypical cycle (e.g. 50+ days or 14 days) does not corrupt averages.
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

  // Filter cycles with valid positive cycleLength (days from this period start to next period start)
  const completedCycles = cycles.filter(c => c.cycleLength && c.cycleLength >= 18 && c.cycleLength <= 60);
  const cycleLengths = completedCycles.map(c => c.cycleLength!);
  const periodLengths = cycles.filter(c => c.periodDuration && c.periodDuration > 0).map(c => c.periodDuration!);

  const hasEmpiricalHistory = cycleLengths.length >= 1;

  let avgCycle = fallbackCycleLen;
  if (hasEmpiricalHistory) {
    // Weight recent cycles slightly more heavily (e.g. past 3-4 cycles)
    if (cycleLengths.length === 1) {
      avgCycle = cycleLengths[0];
    } else {
      const recent = cycleLengths.slice(0, 4);
      avgCycle = Math.round(recent.reduce((a, b) => a + b, 0) / recent.length);
    }
  }

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
 * Intelligent Period Prediction Engine with Early & Late Period Detection.
 * Compares expected dates with actual recorded periods and local current date.
 */
export function calculateIntelligentPrediction(
  currentDateStr: string,
  cycles: CycleRecord[],
  settings: UserSettings
): PeriodPredictionResult {
  const currentDate = parseDateStr(currentDateStr);
  const fallbackCycleLen = settings.avgCycleLength || 28;

  // Filter out invalid/malformed cycles and sort ascending by date
  const sortedCyclesAsc = [...cycles]
    .filter(c => c.startDate && c.startDate.length === 10)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  const sortedCyclesDesc = [...sortedCyclesAsc].reverse();
  const latestCycle = sortedCyclesDesc[0];

  // Completed cycle intervals
  const completedIntervals = sortedCyclesAsc
    .filter(c => c.cycleLength && c.cycleLength >= 18 && c.cycleLength <= 60)
    .map(c => c.cycleLength!);

  const cyclesCount = completedIntervals.length;

  // 1. Calculate Average Cycle Length with Outlier Resistance
  let averageCycleLength = fallbackCycleLen;
  let variabilityDays = 2; // default variability window (±2 days)
  let confidenceLevel: 'provisional' | 'moderate' | 'high' | 'insufficient' = 'insufficient';
  let confidenceLabel = 'Provisional estimate (based on user settings)';

  if (cyclesCount === 0) {
    confidenceLevel = 'insufficient';
    confidenceLabel = `Provisional (${fallbackCycleLen}-day default · customizable in Settings)`;
    variabilityDays = 2;
  } else if (cyclesCount === 1) {
    averageCycleLength = completedIntervals[0];
    confidenceLevel = 'provisional';
    confidenceLabel = `Provisional (based on 1 recorded cycle interval of ${averageCycleLength} days)`;
    variabilityDays = 2;
  } else if (cyclesCount <= 3) {
    // Average of available cycles
    averageCycleLength = Math.round(completedIntervals.reduce((a, b) => a + b, 0) / cyclesCount);
    const diffs = completedIntervals.map(l => Math.abs(l - averageCycleLength));
    const maxDiff = Math.max(...diffs);
    variabilityDays = Math.max(1, Math.min(4, Math.round(maxDiff)));
    confidenceLevel = 'moderate';
    confidenceLabel = `Moderate confidence (based on ${cyclesCount} recorded cycles · ±${variabilityDays}d variability)`;
  } else {
    // 4+ cycles: Calculate weighted moving average of the last 4 cycles + standard deviation
    const recent = completedIntervals.slice(-4);
    averageCycleLength = Math.round(recent.reduce((a, b) => a + b, 0) / recent.length);
    
    // Standard deviation of recent intervals
    const variance = recent.reduce((sum, val) => sum + Math.pow(val - averageCycleLength, 2), 0) / recent.length;
    const stdDev = Math.sqrt(variance);
    variabilityDays = Math.max(1, Math.min(4, Math.round(stdDev)));

    confidenceLevel = 'high';
    confidenceLabel = `High confidence (adaptive learning from ${cyclesCount} recorded cycles)`;
  }

  // 2. Identify Latest Cycle Anchor and Expected Start Date
  if (!latestCycle) {
    const dummyDate = addDays(currentDate, 14);
    const dummyStr = formatDateStr(dummyDate);
    return {
      status: 'prediction_unavailable',
      statusLabel: 'Prediction Unavailable',
      statusBadgeColor: 'bg-stone-100 text-stone-700 border-stone-300',
      statusDescription: 'Record your first menstrual period to activate cycle intelligence and personalized forecasts.',
      predictedStartDate: dummyStr,
      predictedRangeStart: dummyStr,
      predictedRangeEnd: dummyStr,
      uncertaintyDays: 2,
      daysRemainingOrOverdue: 0,
      confidenceLevel: 'insufficient',
      confidenceLabel: 'No periods recorded yet',
      averageCycleLength: fallbackCycleLen,
      cycleVariabilityDays: 2,
      cyclesAnalyzedCount: 0
    };
  }

  const latestStart = parseDateStr(latestCycle.startDate);
  const daysSinceStart = diffDays(currentDate, latestStart);

  // If latest cycle started recently (within period duration or actively ongoing today)
  const isPeriodCurrentlyActive = latestCycle.isOngoing && daysSinceStart >= 0 && daysSinceStart < (latestCycle.periodDuration || 5);

  // Expected next period date based on latest start + average cycle length
  const nextPeriodDate = addDays(latestStart, averageCycleLength);
  const nextPeriodDateStr = formatDateStr(nextPeriodDate);

  const rangeStart = addDays(nextPeriodDate, -variabilityDays);
  const rangeEnd = addDays(nextPeriodDate, variabilityDays);
  const rangeStartStr = formatDateStr(rangeStart);
  const rangeEndStr = formatDateStr(rangeEnd);

  const daysRemaining = diffDays(nextPeriodDate, currentDate); // positive = future, negative = past

  // 3. Early / Late / Upcoming / Range Evaluation
  let status: PeriodPredictionResult['status'] = 'upcoming';
  let statusLabel = 'Upcoming';
  let statusBadgeColor = 'bg-purple-100 text-[#542080] border-[#C8A2E8]';
  let statusDescription = `Expected on ${formatDisplayDate(nextPeriodDate)} (Window: ${formatShortDate(rangeStart)} – ${formatShortDate(rangeEnd)}).`;
  let gentleNotification: string | undefined = undefined;

  if (isPeriodCurrentlyActive || daysSinceStart === 0) {
    status = 'period_started';
    statusLabel = 'Period Started';
    statusBadgeColor = 'bg-pink-100 text-pink-700 border-pink-300';
    statusDescription = `You recorded period flow starting on ${formatDisplayDate(latestStart)} (Day ${daysSinceStart + 1}).`;
  } else if (daysSinceStart > 0 && daysSinceStart < averageCycleLength - variabilityDays) {
    // Within normal cycle progression before expected window
    status = 'upcoming';
    statusLabel = 'Upcoming';
    statusBadgeColor = 'bg-purple-100 text-[#542080] border-[#C8A2E8]';
    statusDescription = `Expected in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} on ${formatShortDate(nextPeriodDate)}.`;
  } else if (daysSinceStart >= averageCycleLength - variabilityDays && daysSinceStart <= averageCycleLength + variabilityDays) {
    // Within expected range window
    status = 'within_expected_range';
    statusLabel = 'Within Expected Range';
    statusBadgeColor = 'bg-amber-100 text-amber-900 border-amber-300';
    statusDescription = `Your period is expected around now (${formatShortDate(rangeStart)} – ${formatShortDate(rangeEnd)}).`;
    gentleNotification = `Your expected period window is open. If your bleeding has started, tap "Record Period Start" to calibrate your cycle.`;
  } else if (daysSinceStart > averageCycleLength + variabilityDays) {
    // Later than expected range!
    const daysPastExpected = diffDays(currentDate, rangeEnd);
    status = 'later_than_expected';
    statusLabel = 'Later Than Expected';
    statusBadgeColor = 'bg-rose-100 text-rose-800 border-rose-300';
    statusDescription = `Your period was expected around ${formatShortDate(nextPeriodDate)} (${daysPastExpected} day${daysPastExpected !== 1 ? 's' : ''} past the estimated window).`;
    gentleNotification = `Your period was expected around ${formatShortDate(nextPeriodDate)}. It hasn't been recorded yet. If it has started, log your period to update your cycle. Cycle predictions are estimates and variations are normal.`;
  }

  // Check if user recorded a period that started earlier than expected
  if (sortedCyclesAsc.length >= 2) {
    const prevCycle = sortedCyclesAsc[sortedCyclesAsc.length - 2];
    const prevStart = parseDateStr(prevCycle.startDate);
    const expectedForLatest = addDays(prevStart, averageCycleLength);
    const diffFromExpected = diffDays(latestStart, expectedForLatest);

    // If latest cycle started more than variability days earlier
    if (diffFromExpected < -variabilityDays && daysSinceStart < 10) {
      status = 'earlier_than_expected';
      statusLabel = 'Started Earlier Than Expected';
      statusBadgeColor = 'bg-pink-100 text-pink-800 border-pink-300';
      statusDescription = `Your period started on ${formatShortDate(latestStart)}, ${Math.abs(diffFromExpected)} days before the estimated date.`;
    }
  }

  return {
    status,
    statusLabel,
    statusBadgeColor,
    statusDescription,
    predictedStartDate: nextPeriodDateStr,
    predictedRangeStart: rangeStartStr,
    predictedRangeEnd: rangeEndStr,
    uncertaintyDays: variabilityDays,
    daysRemainingOrOverdue: daysRemaining,
    confidenceLevel,
    confidenceLabel,
    averageCycleLength,
    cycleVariabilityDays: variabilityDays,
    cyclesAnalyzedCount: cyclesCount,
    gentleNotification
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
  const ascending = [...cycles]
    .filter(c => c.startDate && c.startDate.length === 10)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  
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
 * Integrates intelligent predictions, confidence metrics, and estimated windows.
 */
export function getCurrentCycleStatus(
  currentDateStr: string,
  cycles: CycleRecord[],
  settings: UserSettings
) {
  const currentDate = parseDateStr(currentDateStr);
  const prediction = calculateIntelligentPrediction(currentDateStr, cycles, settings);
  const cycleLen = prediction.averageCycleLength;
  const periodDur = settings.avgPeriodDuration || 5;
  const lutealLen = settings.lutealLength || 14;

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
      const elapsedCycles = Math.floor(daysSinceStart / cycleLen);
      cycleStartDate = addDays(latestStart, elapsedCycles * cycleLen);
      isPredictedStart = true;
    } else {
      cycleStartDate = latestStart;
    }
  } else {
    cycleStartDate = addDays(currentDate, -14);
  }

  const cycleDay = Math.max(1, diffDays(currentDate, cycleStartDate) + 1);
  const daysUntilNextPeriod = Math.max(0, cycleLen - cycleDay + 1);

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
    nextPeriodDateStr: prediction.predictedStartDate,
    nextPeriodRangeStart: prediction.predictedRangeStart,
    nextPeriodRangeEnd: prediction.predictedRangeEnd,
    ovulationDateStr,
    ovulationCycleDay,
    isFertile,
    isOvulationDay,
    conceptionChance,
    cycleStartDateStr: formatDateStr(cycleStartDate),
    isPredictedStart,
    totalCycleDays: cycleLen,
    periodDuration: periodDur,
    prediction,
    estimateLabel: prediction.confidenceLabel
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
  const predictionResult = calculateIntelligentPrediction(getLocalTodayStr(), cycles, settings);
  const cycleLen = predictionResult.averageCycleLength;
  const periodDur = settings.avgPeriodDuration || 5;
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

  // Check if date falls in predicted range window
  const isPredictedWindow = isFuture && !isPeriod && (
    targetDateStr >= predictionResult.predictedRangeStart &&
    targetDateStr <= predictionResult.predictedRangeEnd
  );

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
    isPredictedWindow,
    isOvulation,
    isFertile,
    isPms,
    phase,
    cycleDay: cycleDayModulo,
    flow,
    hasLog: !!existingLog,
    symptoms: existingLog?.symptoms
  };
}

/**
 * Health Intelligence Engine: Analyzes recurring symptoms, cycle patterns,
 * pre-menstrual vs menstrual symptoms, pain severity, and flow patterns
 * STRICTLY from actual stored records.
 */
export function generateHealthInsights(
  cycles: CycleRecord[],
  logs: Record<string, DailyLog>,
  settings: UserSettings
): MenstrualHealthInsights {
  const sortedCycles = [...cycles].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const logEntries = Object.values(logs);
  const totalLoggedDays = logEntries.length;

  const allSymptoms: Symptom[] = [
    'cramps', 'headache', 'bloating', 'tender_breasts', 'fatigue',
    'acne', 'backache', 'pelvic_pain', 'joint_pain', 'nausea',
    'cravings', 'insomnia', 'mood_swings'
  ];

  // If no data is available
  if (sortedCycles.length === 0 && totalLoggedDays === 0) {
    return {
      totalCyclesAnalyzed: 0,
      totalLoggedDays: 0,
      dateRangeCovered: 'No logged history',
      frequentSymptoms: [],
      recurringCyclePatterns: [
        'Record previous periods and daily symptoms to reveal personal cycle trends and biological rhythms.'
      ],
      preMenstrualPatterns: [],
      menstrualPatterns: [],
      flowTrends: {
        averageDuration: settings.avgPeriodDuration || 5,
        predominantFlow: 'medium',
        durationVariation: 'Awaiting user recorded periods'
      },
      painInsights: {
        mostCommonPain: 'None recorded',
        predominantSeverity: 'none',
        frequentMedications: []
      },
      medicalDisclaimer: 'Health insights summarize recorded entries and cannot diagnose medical conditions such as endometriosis, PCOS, or fibroids. Consult a healthcare provider for medical concerns.',
      urgentCareGuidance: 'Seek prompt emergency medical care if you experience sudden severe pelvic pain, abnormally heavy bleeding (soaking through 2+ pads/hour for 2+ hours), fainting, or high fever.'
    };
  }

  // Date range covered
  const firstCycle = sortedCycles[0];
  const lastCycle = sortedCycles[sortedCycles.length - 1];
  const firstDate = firstCycle ? parseDateStr(firstCycle.startDate) : new Date();
  const lastDate = lastCycle ? parseDateStr(lastCycle.startDate) : new Date();
  const dateRangeCovered = `${firstDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} – ${lastDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;

  // 1. Analyze symptoms per cycle (Menstrual vs Pre-menstrual)
  const symptomCycleMap: Record<Symptom, Set<string>> = {} as any;
  const symptomTotalCount: Record<Symptom, number> = {} as any;
  const symptomPreMenstrualCount: Record<Symptom, number> = {} as any;
  const symptomMenstrualCount: Record<Symptom, number> = {} as any;
  const symptomSeverityMap: Record<Symptom, Record<PainSeverity, number>> = {} as any;

  allSymptoms.forEach(s => {
    symptomCycleMap[s] = new Set<string>();
    symptomTotalCount[s] = 0;
    symptomPreMenstrualCount[s] = 0;
    symptomMenstrualCount[s] = 0;
    symptomSeverityMap[s] = { none: 0, mild: 0, moderate: 0, severe: 0 };
  });

  const medicationsCount: Record<string, number> = {};

  // Map each log date to its corresponding cycle and phase
  logEntries.forEach(log => {
    const logDate = parseDateStr(log.date);

    // Track medication
    if (log.medication && log.medication.taken && log.medication.name) {
      const name = log.medication.name.trim();
      medicationsCount[name] = (medicationsCount[name] || 0) + 1;
    }

    // Identify which cycle this log belongs to
    let matchingCycleId = '';
    let isDuringPeriod = log.isPeriod;
    let isPreMenstrual = false;

    for (const c of sortedCycles) {
      const cStart = parseDateStr(c.startDate);
      const cEnd = c.endDate ? parseDateStr(c.endDate) : addDays(cStart, (c.periodDuration || 5) - 1);
      const preStart = addDays(cStart, -7);

      if (logDate >= cStart && logDate <= cEnd) {
        matchingCycleId = c.id;
        isDuringPeriod = true;
        break;
      } else if (logDate >= preStart && logDate < cStart) {
        matchingCycleId = c.id;
        isPreMenstrual = true;
        break;
      }
    }

    // Log symptoms
    (log.symptoms || []).forEach(sym => {
      if (symptomTotalCount[sym] !== undefined) {
        symptomTotalCount[sym] += 1;
        if (matchingCycleId) {
          symptomCycleMap[sym].add(matchingCycleId);
        }
        if (isDuringPeriod) {
          symptomMenstrualCount[sym] += 1;
        } else if (isPreMenstrual) {
          symptomPreMenstrualCount[sym] += 1;
        }

        // Track pain severity
        const severity = log.overallPain || (log.painLevels ? (log.painLevels as any)[sym] : undefined) || 'mild';
        if (symptomSeverityMap[sym]) {
          symptomSeverityMap[sym][severity as PainSeverity] = (symptomSeverityMap[sym][severity as PainSeverity] || 0) + 1;
        }
      }
    });
  });

  // Calculate symptom frequencies
  const cyclesCount = Math.max(1, sortedCycles.length);
  const frequentSymptoms: SymptomFrequency[] = allSymptoms
    .map(sym => {
      const count = symptomTotalCount[sym];
      const cycleHits = symptomCycleMap[sym].size;
      const pct = Math.round((cycleHits / cyclesCount) * 100);
      const preCount = symptomPreMenstrualCount[sym];
      const menCount = symptomMenstrualCount[sym];
      const typicalPhase: CyclePhase = preCount > menCount ? 'luteal' : 'menstrual';

      return {
        symptom: sym,
        count,
        cyclesCount: cycleHits,
        percentageOfCycles: pct,
        typicalPhase,
        preMenstrualCount: preCount,
        menstrualCount: menCount,
        severityBreakdown: symptomSeverityMap[sym]
      };
    })
    .filter(s => s.count > 0)
    .sort((a, b) => b.count - a.count);

  // 2. Generate factual, non-alarmist patterns
  const recurringCyclePatterns: string[] = [];
  const preMenstrualPatterns: string[] = [];
  const menstrualPatterns: string[] = [];

  frequentSymptoms.forEach(sf => {
    const symLabel = sf.symptom.replace('_', ' ');
    if (sf.cyclesCount >= 2 && sortedCycles.length >= 2) {
      recurringCyclePatterns.push(
        `${symLabel.charAt(0).toUpperCase() + symLabel.slice(1)} recorded in ${sf.cyclesCount} of your last ${sortedCycles.length} recorded cycles (${sf.percentageOfCycles}%).`
      );
    }

    if (sf.preMenstrualCount >= 2) {
      preMenstrualPatterns.push(
        `${symLabel.charAt(0).toUpperCase() + symLabel.slice(1)} frequently recorded during the pre-menstrual (luteal) phase (${sf.preMenstrualCount} times).`
      );
    }

    if (sf.menstrualCount >= 2) {
      menstrualPatterns.push(
        `${symLabel.charAt(0).toUpperCase() + symLabel.slice(1)} prominently recorded during menstruation (${sf.menstrualCount} times).`
      );
    }
  });

  if (recurringCyclePatterns.length === 0 && frequentSymptoms.length > 0) {
    recurringCyclePatterns.push(
      `Most reported symptom in your available logs: ${frequentSymptoms[0].symptom.replace('_', ' ')} (${frequentSymptoms[0].count} logs).`
    );
  }

  // 3. Flow trends
  const periodDurations = sortedCycles.filter(c => c.periodDuration).map(c => c.periodDuration!);
  const avgDuration = periodDurations.length > 0
    ? Math.round(periodDurations.reduce((a, b) => a + b, 0) / periodDurations.length)
    : settings.avgPeriodDuration || 5;

  const shortestBleed = periodDurations.length > 0 ? Math.min(...periodDurations) : avgDuration;
  const longestBleed = periodDurations.length > 0 ? Math.max(...periodDurations) : avgDuration;

  // Flow count
  const flowCounts: Record<FlowIntensity, number> = { none: 0, spotting: 0, light: 0, medium: 0, heavy: 0 };
  logEntries.forEach(l => {
    if (l.flow && l.flow !== 'none') {
      flowCounts[l.flow] = (flowCounts[l.flow] || 0) + 1;
    }
  });

  let predominantFlow: FlowIntensity = 'medium';
  let maxFlowCount = 0;
  (['heavy', 'medium', 'light', 'spotting'] as FlowIntensity[]).forEach(f => {
    if (flowCounts[f] > maxFlowCount) {
      maxFlowCount = flowCounts[f];
      predominantFlow = f;
    }
  });

  // 4. Pain Insights
  const topPainSymptom = frequentSymptoms.find(s => ['cramps', 'headache', 'backache', 'pelvic_pain'].includes(s.symptom));
  const frequentMedications = Object.keys(medicationsCount).sort((a, b) => medicationsCount[b] - medicationsCount[a]);

  return {
    totalCyclesAnalyzed: sortedCycles.length,
    totalLoggedDays,
    dateRangeCovered,
    frequentSymptoms,
    recurringCyclePatterns,
    preMenstrualPatterns,
    menstrualPatterns,
    flowTrends: {
      averageDuration: avgDuration,
      predominantFlow,
      durationVariation: periodDurations.length >= 2 ? `${shortestBleed} to ${longestBleed} days span` : 'Consistent'
    },
    painInsights: {
      mostCommonPain: topPainSymptom ? topPainSymptom.symptom.replace('_', ' ') : 'Mild cramps',
      predominantSeverity: 'moderate',
      frequentMedications: frequentMedications.slice(0, 3)
    },
    medicalDisclaimer: 'Health insights summarize your recorded entries to identify recurring patterns for personal awareness and clinical discussion. This app cannot diagnose conditions such as endometriosis, PCOS, or fibroids. Consult your healthcare provider if symptoms worsen or interfere with daily life.',
    urgentCareGuidance: 'Urgent Care Notice: Please seek prompt medical care if you experience sudden or debilitating pelvic pain, fever, fainting, or unusually heavy bleeding (soaking 2+ pads per hour for consecutive hours).'
  };
}

/**
 * Dynamically anchors starter seed data relative to user's real date.
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
      flow: 'medium',
      symptoms: ['cramps', 'fatigue'],
      painSeverity: 'moderate',
      medications: ['Ibuprofen'],
      notes: 'Current menstrual period',
      isOngoing: true
    },
    {
      id: 'c-2',
      startDate: formatDateStr(c2Start),
      endDate: formatDateStr(c2End),
      periodDuration: 5,
      flow: 'heavy',
      symptoms: ['cramps', 'bloating', 'headache'],
      painSeverity: 'moderate',
      medications: ['Heat Therapy'],
      notes: 'Previous month regular cycle',
      isOngoing: false
    },
    {
      id: 'c-1',
      startDate: formatDateStr(c1Start),
      endDate: formatDateStr(c1End),
      periodDuration: 5,
      flow: 'medium',
      symptoms: ['cramps', 'tender_breasts'],
      painSeverity: 'mild',
      notes: 'Historical cycle record',
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
    overallPain: 'moderate',
    medication: { taken: true, name: 'Ibuprofen' },
    waterGlasses: 7,
    sleepHours: 8,
    pillTaken: true,
    notes: 'Period started morning. Mild-to-moderate cramps.'
  };

  logs[day1] = {
    date: day1,
    isPeriod: true,
    flow: 'heavy',
    symptoms: ['cramps', 'bloating'],
    moods: ['calm'],
    overallPain: 'moderate',
    medication: { taken: true, name: 'Heat Therapy' },
    waterGlasses: 8,
    sleepHours: 8,
    pillTaken: true,
    notes: 'Warm herbal tea and rest helped.'
  };

  logs[day2] = {
    date: day2,
    isPeriod: true,
    flow: 'medium',
    symptoms: ['fatigue'],
    moods: ['calm', 'happy'],
    overallPain: 'mild',
    waterGlasses: 7,
    sleepHours: 8,
    pillTaken: true,
    notes: 'Flow tapering nicely, feeling balanced.'
  };

  // Add historical logs for c-2 to illustrate recurring symptoms
  const prevPmsDay = formatDateStr(addDays(c2Start, -2));
  logs[prevPmsDay] = {
    date: prevPmsDay,
    isPeriod: false,
    symptoms: ['headache', 'tender_breasts', 'bloating'],
    moods: ['irritable', 'sensitive'],
    overallPain: 'mild',
    waterGlasses: 6,
    sleepHours: 7.5,
    notes: 'Pre-menstrual tension observed.'
  };

  const prevBleedDay = formatDateStr(c2Start);
  logs[prevBleedDay] = {
    date: prevBleedDay,
    isPeriod: true,
    flow: 'heavy',
    symptoms: ['cramps', 'backache', 'fatigue'],
    moods: ['exhausted'],
    overallPain: 'moderate',
    medication: { taken: true, name: 'Ibuprofen' },
    waterGlasses: 8,
    sleepHours: 8,
    notes: 'Cramps on day 1.'
  };

  return { settings, cycles, logs };
}
