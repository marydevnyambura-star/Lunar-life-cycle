import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Droplets, Sparkles, Plus, Calendar as CalendarIcon, Heart, Check, Moon, Zap, Edit3 } from 'lucide-react';
import { CycleRecord, DailyLog, UserSettings, DayPrediction } from '../types';
import { formatDateStr, parseDateStr, getDayPrediction, diffDays } from '../utils/cycleCalculations';

interface CalendarSectionProps {
  currentDateStr: string;
  cycleStartDateStr: string;
  settings: UserSettings;
  logs: Record<string, DailyLog>;
  cycles: CycleRecord[];
  onOpenLogForDate: (dateStr: string) => void;
}

export const CalendarSection: React.FC<CalendarSectionProps> = ({
  currentDateStr,
  cycleStartDateStr,
  settings,
  logs,
  cycles,
  onOpenLogForDate
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

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleJumpToToday = () => {
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDateStr(currentDateStr);
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

  // Next month leading days to complete the 35 or 42 grid
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

  return (
    <div className="space-y-6">
      {/* Top Banner / Controls */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 font-display">
              {monthNames[month]} {year}
            </h2>
            <button
              onClick={handleJumpToToday}
              className="text-xs font-semibold px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors"
            >
              Today
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              aria-label="Previous month"
              className="p-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              aria-label="Next month"
              className="p-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="mt-4">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-stone-600 pb-2">
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
              let badgeStyle = '';

              if (prediction.isPeriod) {
                dayBg = 'bg-rose-100/70 border border-rose-300 text-rose-900 font-semibold';
              } else if (prediction.isPredictedPeriod) {
                dayBg = 'bg-rose-50/50 border border-dashed border-rose-300 text-rose-700';
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
                  className={`min-h-[58px] sm:min-h-[72px] p-1.5 sm:p-2 rounded-xl flex flex-col justify-between items-center transition-all relative ${dayBg} ${
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
                      <span className="text-[10px] text-amber-600" title="Predicted Ovulation">
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
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-700"></span>
                    )}
                    {prediction.isFertile && !prediction.isOvulation && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
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
            <span>Period Bleed</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-md border border-dashed border-rose-400 bg-rose-50"></span>
            <span>Predicted Period</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-400"></span>
            <span>Fertile Window</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-amber-500 font-bold">✨</span>
            <span>Ovulation Day</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-700"></span>
            <span>Logged Data</span>
          </div>
        </div>
      </div>

      {/* Selected Day Detail Card */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-stone-500" />
              <h3 className="text-base font-bold text-stone-900 font-display">
                {parseDateStr(selectedDateStr).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </h3>
            </div>
            <p className="text-xs text-stone-600 mt-0.5">
              Cycle Day {selectedPrediction.cycleDay || 1} · {selectedPrediction.phase.charAt(0).toUpperCase() + selectedPrediction.phase.slice(1)} Phase
            </p>
          </div>

          <button
            onClick={() => onOpenLogForDate(selectedDateStr)}
            className="px-4 py-2 text-xs font-medium text-white bg-stone-900 rounded-xl hover:bg-stone-800 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shrink-0 self-start sm:self-auto"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{selectedLog ? 'Edit Daily Log' : 'Log Details for Date'}</span>
          </button>
        </div>

        {/* Selected Day Content */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Tile 1: Status & Flow */}
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
            <span className="text-xs font-semibold text-stone-600">Cycle Status</span>
            <div className="mt-2 flex items-center gap-2">
              {selectedPrediction.isPeriod ? (
                <>
                  <Droplets className="w-4 h-4 text-rose-500 fill-rose-500" />
                  <span className="text-sm font-bold text-rose-700 capitalize">
                    {selectedLog?.flow ? `${selectedLog.flow} Flow` : 'Period Bleed'}
                  </span>
                </>
              ) : selectedPrediction.isOvulation ? (
                <>
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-bold text-amber-800">Peak Ovulation Day</span>
                </>
              ) : selectedPrediction.isFertile ? (
                <>
                  <Heart className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-bold text-amber-800">Fertile Window</span>
                </>
              ) : (
                <span className="text-sm font-medium text-stone-700">No Bleed Expected</span>
              )}
            </div>
            {selectedPrediction.isPredictedPeriod && (
              <p className="text-[11px] text-rose-600 mt-1">Predicted start of next cycle</p>
            )}
          </div>

          {/* Tile 2: Logged Symptoms & Moods */}
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
            <span className="text-xs font-semibold text-stone-600">Symptoms & Moods</span>
            {selectedLog && (selectedLog.symptoms.length > 0 || selectedLog.moods.length > 0) ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {selectedLog.symptoms.map(s => (
                  <span
                    key={s}
                    className="text-[11px] font-medium text-amber-900 bg-amber-100/70 px-2 py-0.5 rounded-md"
                  >
                    {s.replace('_', ' ')}
                  </span>
                ))}
                {selectedLog.moods.map(m => (
                  <span
                    key={m}
                    className="text-[11px] font-medium text-violet-900 bg-violet-100/70 px-2 py-0.5 rounded-md"
                  >
                    {m}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-500 mt-2">No symptoms or moods logged for this day.</p>
            )}
          </div>

          {/* Tile 3: Vitals & Notes */}
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
            <span className="text-xs font-semibold text-stone-600">Vitals & Journal</span>
            {selectedLog ? (
              <div className="mt-2 space-y-1 text-xs text-stone-700">
                <div className="flex items-center justify-between">
                  <span>Water / Sleep:</span>
                  <span className="font-mono">
                    {selectedLog.waterGlasses ?? 0} cups · {selectedLog.sleepHours ?? 0} hrs
                  </span>
                </div>
                {selectedLog.temperature && (
                  <div className="flex items-center justify-between">
                    <span>Basal Temp:</span>
                    <span className="font-mono">{selectedLog.temperature}°{settings.tempUnit}</span>
                  </div>
                )}
                {selectedLog.notes && (
                  <p className="text-stone-600 italic text-[11px] pt-1 line-clamp-2">
                    "{selectedLog.notes}"
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-stone-500 mt-2">Tap 'Log Details' to record vitals or notes.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
