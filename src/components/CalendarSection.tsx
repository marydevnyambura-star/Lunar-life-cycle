import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Droplets,
  Sparkles,
  Plus,
  Calendar as CalendarIcon,
  Heart,
  Check,
  Moon,
  Zap,
  Edit3,
  Info
} from 'lucide-react';
import { CycleRecord, DailyLog, UserSettings, DayPrediction } from '../types';
import { formatDateStr, parseDateStr, getDayPrediction, diffDays, formatDisplayDate } from '../utils/cycleCalculations';

interface CalendarSectionProps {
  currentDateStr: string;
  cycleStartDateStr: string;
  settings: UserSettings;
  logs: Record<string, DailyLog>;
  cycles: CycleRecord[];
  onOpenLogForDate: (dateStr: string) => void;
  onOpenRecordPeriodForDate: (dateStr?: string, cycleToEdit?: CycleRecord) => void;
}

export const CalendarSection: React.FC<CalendarSectionProps> = ({
  currentDateStr,
  cycleStartDateStr,
  settings,
  logs,
  cycles,
  onOpenLogForDate,
  onOpenRecordPeriodForDate
}) => {
  const today = parseDateStr(currentDateStr);
  const [viewDate, setViewDate] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDateStr, setSelectedDateStr] = useState<string>(currentDateStr);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const yearOptions = [
    year - 2, year - 1, year, year + 1, year + 2
  ];

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleJumpToToday = () => {
    const freshToday = parseDateStr(currentDateStr);
    setViewDate(new Date(freshToday.getFullYear(), freshToday.getMonth(), 1));
    setSelectedDateStr(currentDateStr);
  };

  const handleMonthSelect = (mIdx: number) => {
    setViewDate(new Date(year, mIdx, 1));
  };

  const handleYearSelect = (newYear: number) => {
    setViewDate(new Date(newYear, month, 1));
  };

  // Build grid days
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const calendarCells: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

  // Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const dateObj = new Date(year, month - 1, d);
    calendarCells.push({
      dateStr: formatDateStr(dateObj),
      dayNum: d,
      isCurrentMonth: false
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    calendarCells.push({
      dateStr: formatDateStr(dateObj),
      dayNum: d,
      isCurrentMonth: true
    });
  }

  // Next month leading days to complete grid
  const remainingCells = 42 - calendarCells.length;
  for (let d = 1; d <= (remainingCells <= 7 ? remainingCells : remainingCells - 7); d++) {
    const dateObj = new Date(year, month + 1, d);
    calendarCells.push({
      dateStr: formatDateStr(dateObj),
      dayNum: d,
      isCurrentMonth: false
    });
  }

  const selectedPrediction = getDayPrediction(selectedDateStr, cycleStartDateStr, settings, logs, cycles);
  const selectedLog = logs[selectedDateStr];

  // Check if a cycle starts on the selected date
  const cycleOnSelectedDate = cycles.find(c => c.startDate === selectedDateStr);

  return (
    <div className="space-y-6">
      {/* Top Banner / Controls */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Quick Month & Year Selectors */}
            <div className="flex items-center gap-2">
              <select
                value={month}
                onChange={e => handleMonthSelect(parseInt(e.target.value))}
                className="text-lg sm:text-2xl font-bold text-stone-900 font-display bg-transparent border-b border-dashed border-stone-300 hover:border-stone-900 focus:outline-none cursor-pointer py-0.5"
              >
                {monthNames.map((name, idx) => (
                  <option key={name} value={idx}>
                    {name}
                  </option>
                ))}
              </select>

              <select
                value={year}
                onChange={e => handleYearSelect(parseInt(e.target.value))}
                className="text-lg sm:text-2xl font-bold text-stone-900 font-display bg-transparent border-b border-dashed border-stone-300 hover:border-stone-900 focus:outline-none cursor-pointer py-0.5"
              >
                {[year - 2, year - 1, year, year + 1, year + 2].map(y => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleJumpToToday}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors cursor-pointer"
            >
              Today
            </button>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => onOpenRecordPeriodForDate(selectedDateStr)}
              className="px-3.5 py-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              title="Record a period in this month or on selected date"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Past Period</span>
            </button>

            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                aria-label="Previous month"
                className="p-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                aria-label="Next month"
                className="p-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="mt-4">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-stone-500 pb-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {calendarCells.map(cell => {
              const prediction = getDayPrediction(cell.dateStr, cycleStartDateStr, settings, logs, cycles);
              const isToday = cell.dateStr === currentDateStr;
              const isSelected = cell.dateStr === selectedDateStr;

              // Visual styling logic
              let dayBg = 'bg-stone-50/50 hover:bg-stone-100/70 text-stone-800';

              if (prediction.isPeriod) {
                dayBg = 'bg-rose-100/80 border border-rose-300 text-rose-900 font-semibold';
              } else if (prediction.isPredictedPeriod) {
                dayBg = 'bg-rose-50/60 border border-dashed border-rose-300 text-rose-700';
              } else if (prediction.isOvulation) {
                dayBg = 'bg-amber-100/80 border border-amber-300 text-amber-950 font-semibold';
              } else if (prediction.isFertile) {
                dayBg = 'bg-amber-50/60 border border-amber-200 text-amber-900';
              } else if (prediction.isPms) {
                dayBg = 'bg-violet-50/40 border border-violet-200 text-violet-900';
              }

              if (!cell.isCurrentMonth) {
                dayBg += ' opacity-40';
              }

              return (
                <button
                  key={cell.dateStr}
                  onClick={() => setSelectedDateStr(cell.dateStr)}
                  className={`min-h-[58px] sm:min-h-[72px] p-1.5 sm:p-2 rounded-xl flex flex-col justify-between items-center transition-all relative cursor-pointer ${dayBg} ${
                    isSelected ? 'ring-2 ring-stone-900 shadow-xs' : ''
                  }`}
                >
                  <div className="w-full flex items-center justify-between text-xs">
                    <span
                      className={`inline-block font-mono text-[11px] sm:text-xs ${
                        isToday
                          ? 'w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center font-bold'
                          : ''
                      }`}
                    >
                      {cell.dayNum}
                    </span>

                    {prediction.isOvulation && (
                      <span className="text-[10px] text-amber-600" title="Estimated Ovulation">
                        ✨
                      </span>
                    )}
                    {prediction.isPeriod && (
                      <Droplets className="w-3 h-3 text-rose-600 fill-rose-600" />
                    )}
                  </div>

                  {/* Micro indicator badges */}
                  <div className="w-full flex items-center justify-center gap-1 mt-auto">
                    {prediction.hasLog && (
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-700" title="Daily log entry"></span>
                    )}
                    {prediction.isFertile && !prediction.isOvulation && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Estimated fertile day"></span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-stone-100 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-stone-600">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-400"></span>
            <span>Recorded Period Bleed</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-md border border-dashed border-rose-400 bg-rose-50"></span>
            <span>Predicted Period (Estimate)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-400"></span>
            <span>Estimated Fertile Window</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-amber-500 font-bold">✨</span>
            <span>Estimated Ovulation Day</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-700"></span>
            <span>Symptoms Logged</span>
          </div>
        </div>
      </div>

      {/* Selected Day Detail Card */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-stone-500" />
              <h3 className="text-base font-bold text-stone-900 font-display">
                {formatDisplayDate(parseDateStr(selectedDateStr))}
              </h3>
              {selectedDateStr === currentDateStr && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-900 text-white">
                  Today
                </span>
              )}
            </div>
            <p className="text-xs text-stone-600 mt-1">
              Cycle Day {selectedPrediction.cycleDay || 1} · {selectedPrediction.phase.charAt(0).toUpperCase() + selectedPrediction.phase.slice(1)} Phase
              {selectedPrediction.isPredictedPeriod && ' · (Predicted Period Estimate)'}
              {selectedPrediction.isPeriod && ' · (Recorded Period Bleed)'}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            {cycleOnSelectedDate ? (
              <button
                onClick={() => onOpenRecordPeriodForDate(selectedDateStr, cycleOnSelectedDate)}
                className="px-3.5 py-2 text-xs font-bold text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-stone-600" />
                <span>Edit Period Record</span>
              </button>
            ) : (
              <button
                onClick={() => onOpenRecordPeriodForDate(selectedDateStr)}
                className="px-3.5 py-2 text-xs font-bold text-white bg-rose-600 rounded-xl hover:bg-rose-700 active:scale-[0.98] transition-all flex items-center gap-1.5 shadow-sm shadow-rose-200 cursor-pointer"
              >
                <Droplets className="w-3.5 h-3.5 fill-white" />
                <span>Record Period on this Date</span>
              </button>
            )}

            <button
              onClick={() => onOpenLogForDate(selectedDateStr)}
              className="px-3.5 py-2 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-stone-600" />
              <span>Log Symptoms & Mood</span>
            </button>
          </div>
        </div>

        {/* Selected Day Status Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
            <span className="text-stone-500 block text-[11px]">Period Status:</span>
            <span className="font-semibold text-stone-900 mt-0.5 block">
              {selectedPrediction.isPeriod
                ? `Active Flow (${selectedPrediction.flow || 'medium'})`
                : selectedPrediction.isPredictedPeriod
                ? 'Predicted Period (Estimate)'
                : 'No Period Flow'}
            </span>
          </div>

          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
            <span className="text-stone-500 block text-[11px]">Fertility Estimate:</span>
            <span className="font-semibold text-stone-900 mt-0.5 block">
              {selectedPrediction.isOvulation
                ? 'Estimated Ovulation Day ✨'
                : selectedPrediction.isFertile
                ? 'Estimated Fertile Window'
                : 'Low Conception Probability'}
            </span>
          </div>

          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
            <span className="text-stone-500 block text-[11px]">Logged Daily Observations:</span>
            <span className="font-semibold text-stone-900 mt-0.5 block">
              {selectedLog
                ? `${selectedLog.symptoms.length} symptoms · ${selectedLog.moods.length} moods`
                : 'No notes or symptoms logged'}
            </span>
          </div>
        </div>

        {/* Logged Notes / Symptoms Preview */}
        {selectedLog && (
          <div className="p-3.5 bg-stone-50/80 rounded-xl border border-stone-200 text-xs space-y-2">
            {selectedLog.symptoms.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-stone-500 font-medium">Logged Symptoms:</span>
                {selectedLog.symptoms.map(s => (
                  <span
                    key={s}
                    className="px-2 py-0.5 bg-white rounded-md border border-stone-200 text-stone-700 capitalize font-medium"
                  >
                    {s.replace('_', ' ')}
                  </span>
                ))}
              </div>
            )}
            {selectedLog.moods.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-stone-500 font-medium">Logged Moods:</span>
                {selectedLog.moods.map(m => (
                  <span
                    key={m}
                    className="px-2 py-0.5 bg-white rounded-md border border-stone-200 text-stone-700 capitalize font-medium"
                  >
                    {m}
                  </span>
                ))}
              </div>
            )}
            {selectedLog.notes && (
              <p className="text-stone-600 italic">"{selectedLog.notes}"</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
