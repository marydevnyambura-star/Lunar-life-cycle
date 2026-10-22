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
  Info,
  Clock,
  AlertCircle
} from 'lucide-react';
import { CycleRecord, DailyLog, UserSettings, DayPrediction } from '../types';
import {
  formatDateStr,
  parseDateStr,
  getDayPrediction,
  diffDays,
  formatDisplayDate,
  formatShortDate,
  calculateIntelligentPrediction
} from '../utils/cycleCalculations';

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

  const prediction = calculateIntelligentPrediction(currentDateStr, cycles, settings);

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
      <div className="bg-white rounded-3xl border border-[#C8A2E8]/40 p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-purple-50">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Quick Month & Year Selectors */}
            <div className="flex items-center gap-2">
              <select
                value={month}
                onChange={e => handleMonthSelect(parseInt(e.target.value))}
                className="text-lg sm:text-2xl font-bold text-[#321442] font-display bg-transparent border-b-2 border-dashed border-[#C8A2E8] hover:border-[#7B2CBF] focus:outline-none cursor-pointer py-0.5"
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
                className="text-lg sm:text-2xl font-bold text-[#321442] font-display bg-transparent border-b-2 border-dashed border-[#C8A2E8] hover:border-[#7B2CBF] focus:outline-none cursor-pointer py-0.5"
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
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[#F6F0FC] text-[#542080] hover:bg-purple-100 border border-[#C8A2E8]/40 transition-colors cursor-pointer"
            >
              Today
            </button>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
            <button
              onClick={() => onOpenRecordPeriodForDate(selectedDateStr)}
              className="px-3.5 py-2 text-xs font-bold text-white bg-[#EC4899] hover:bg-pink-600 rounded-xl transition-all flex items-center gap-1.5 shadow-sm shadow-pink-200 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Past Period</span>
            </button>

            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                aria-label="Previous month"
                className="p-2 rounded-xl border border-[#C8A2E8]/40 text-[#542080] hover:bg-[#F6F0FC] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                aria-label="Next month"
                className="p-2 rounded-xl border border-[#C8A2E8]/40 text-[#542080] hover:bg-[#F6F0FC] transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Prediction Status Pill Banner */}
        <div className="mt-3 p-3 rounded-2xl bg-[#F6F0FC] border border-[#C8A2E8]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${prediction.statusBadgeColor}`}>
              {prediction.statusLabel}
            </span>
            <span className="text-[#321442] font-medium">
              Next period estimated: <strong>{formatShortDate(parseDateStr(prediction.predictedStartDate))}</strong> (Window: {formatShortDate(parseDateStr(prediction.predictedRangeStart))} – {formatShortDate(parseDateStr(prediction.predictedRangeEnd))})
            </span>
          </div>
          <span className="text-[11px] text-stone-500">
            {prediction.confidenceLabel}
          </span>
        </div>

        {/* Calendar Grid */}
        <div className="mt-4">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-[#7B2CBF] pb-2">
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
              const pred = getDayPrediction(cell.dateStr, cycleStartDateStr, settings, logs, cycles);
              const isToday = cell.dateStr === currentDateStr;
              const isSelected = cell.dateStr === selectedDateStr;

              // Visual styling logic
              let dayBg = 'bg-[#F6F0FC]/60 hover:bg-purple-100/70 text-[#321442]';

              if (pred.isPeriod) {
                dayBg = 'bg-[#FCE7F3] border border-pink-300 text-pink-900 font-bold';
              } else if (pred.isPredictedWindow) {
                dayBg = 'bg-purple-50/70 border-2 border-dashed border-[#C8A2E8] text-[#542080]';
              } else if (pred.isPredictedPeriod) {
                dayBg = 'bg-pink-50/60 border border-dashed border-pink-300 text-pink-700';
              } else if (pred.isOvulation) {
                dayBg = 'bg-amber-100/80 border border-amber-300 text-amber-950 font-bold';
              } else if (pred.isFertile) {
                dayBg = 'bg-amber-50/70 border border-amber-200 text-amber-900';
              } else if (pred.isPms) {
                dayBg = 'bg-purple-100/50 border border-purple-200 text-[#542080]';
              }

              if (!cell.isCurrentMonth) {
                dayBg += ' opacity-35';
              }

              return (
                <button
                  key={cell.dateStr}
                  onClick={() => setSelectedDateStr(cell.dateStr)}
                  className={`min-h-[58px] sm:min-h-[72px] p-1.5 sm:p-2 rounded-2xl flex flex-col justify-between items-center transition-all relative cursor-pointer ${dayBg} ${
                    isSelected ? 'ring-2 ring-[#542080] shadow-sm' : ''
                  }`}
                >
                  <div className="w-full flex items-center justify-between text-xs">
                    <span
                      className={`inline-block font-mono text-[11px] sm:text-xs ${
                        isToday
                          ? 'w-5 h-5 rounded-full bg-[#542080] text-white flex items-center justify-center font-bold shadow-xs'
                          : ''
                      }`}
                    >
                      {cell.dayNum}
                    </span>

                    {pred.isOvulation && (
                      <span className="text-[10px] text-amber-600" title="Estimated Ovulation">
                        ✨
                      </span>
                    )}
                    {pred.isPeriod && (
                      <Droplets className="w-3 h-3 text-[#EC4899] fill-[#EC4899]" />
                    )}
                  </div>

                  {/* Micro indicator badges */}
                  <div className="w-full flex items-center justify-center gap-1 mt-auto">
                    {pred.hasLog && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#7B2CBF]" title="Logged symptoms"></span>
                    )}
                    {pred.isFertile && !pred.isOvulation && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Estimated fertile day"></span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-purple-50 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-stone-600">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#EC4899]"></span>
            <span>Recorded Period Flow</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-md border-2 border-dashed border-[#C8A2E8] bg-purple-50"></span>
            <span>Predicted Range (Estimate)</span>
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
            <span className="w-1.5 h-1.5 rounded-full bg-[#7B2CBF]"></span>
            <span>Symptoms Logged</span>
          </div>
        </div>
      </div>

      {/* Selected Day Detail Card */}
      <div className="bg-white rounded-3xl border border-[#C8A2E8]/40 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-purple-50">
          <div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-[#7B2CBF]" />
              <h3 className="text-base font-bold text-[#321442] font-display">
                {formatDisplayDate(parseDateStr(selectedDateStr))}
              </h3>
              {selectedDateStr === currentDateStr && (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#542080] text-white shadow-2xs">
                  Today (Actual Date)
                </span>
              )}
            </div>
            <p className="text-xs text-stone-600 mt-1">
              Cycle Day {selectedPrediction.cycleDay || 1} · {selectedPrediction.phase.charAt(0).toUpperCase() + selectedPrediction.phase.slice(1)} Phase
              {selectedPrediction.isPeriod && ' · (Recorded Period Bleed)'}
              {selectedPrediction.isPredictedWindow && ' · (Inside Predicted Window)'}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            {cycleOnSelectedDate ? (
              <button
                onClick={() => onOpenRecordPeriodForDate(selectedDateStr, cycleOnSelectedDate)}
                className="px-3.5 py-2 text-xs font-bold text-[#542080] bg-purple-50 hover:bg-purple-100 rounded-xl transition-all flex items-center gap-1.5 border border-[#C8A2E8]/40 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Period Record</span>
              </button>
            ) : (
              <button
                onClick={() => onOpenRecordPeriodForDate(selectedDateStr)}
                className="px-3.5 py-2 text-xs font-bold text-white bg-[#EC4899] rounded-xl hover:bg-pink-600 active:scale-[0.98] transition-all flex items-center gap-1.5 shadow-sm shadow-pink-200 cursor-pointer"
              >
                <Droplets className="w-3.5 h-3.5 fill-white" />
                <span>Record Period on this Date</span>
              </button>
            )}

            <button
              onClick={() => onOpenLogForDate(selectedDateStr)}
              className="px-3.5 py-2 text-xs font-bold text-[#321442] bg-[#F6F0FC] hover:bg-purple-100 rounded-xl transition-all flex items-center gap-1.5 border border-[#C8A2E8]/40 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#7B2CBF]" />
              <span>Log Symptoms & Pain</span>
            </button>
          </div>
        </div>

        {/* Selected Day Status Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 bg-[#F6F0FC] rounded-2xl border border-[#C8A2E8]/40 text-xs">
            <span className="text-stone-500 block text-[11px]">Period Flow Status:</span>
            <span className="font-bold text-[#321442] mt-0.5 block">
              {selectedPrediction.isPeriod
                ? `Recorded Flow (${selectedPrediction.flow || 'medium'})`
                : selectedPrediction.isPredictedWindow
                ? 'Predicted Period Window (Estimate)'
                : 'No Period Flow'}
            </span>
          </div>

          <div className="p-3 bg-[#F6F0FC] rounded-2xl border border-[#C8A2E8]/40 text-xs">
            <span className="text-stone-500 block text-[11px]">Fertility Estimate:</span>
            <span className="font-bold text-[#321442] mt-0.5 block">
              {selectedPrediction.isOvulation
                ? 'Estimated Ovulation Day ✨'
                : selectedPrediction.isFertile
                ? 'Estimated Fertile Window'
                : 'Low Conception Probability'}
            </span>
          </div>

          <div className="p-3 bg-[#F6F0FC] rounded-2xl border border-[#C8A2E8]/40 text-xs">
            <span className="text-stone-500 block text-[11px]">Logged Symptoms & Pain:</span>
            <span className="font-bold text-[#321442] mt-0.5 block">
              {selectedLog
                ? `${selectedLog.symptoms?.length || 0} symptoms · ${selectedLog.overallPain ? `${selectedLog.overallPain} pain` : 'mild'}`
                : 'No symptoms logged'}
            </span>
          </div>
        </div>

        {/* Logged Notes / Symptoms Preview */}
        {selectedLog && (
          <div className="p-4 bg-[#F6F0FC] rounded-2xl border border-[#C8A2E8]/40 text-xs space-y-2">
            {selectedLog.symptoms && selectedLog.symptoms.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-stone-500 font-medium">Logged Symptoms:</span>
                {selectedLog.symptoms.map(s => (
                  <span
                    key={s}
                    className="px-2 py-0.5 bg-white rounded-md border border-[#C8A2E8]/40 text-[#542080] capitalize font-semibold"
                  >
                    {s.replace('_', ' ')}
                  </span>
                ))}
              </div>
            )}
            {selectedLog.medication && selectedLog.medication.taken && (
              <div className="flex items-center gap-1.5 text-[#542080]">
                <Clock className="w-3.5 h-3.5 text-[#7B2CBF]" />
                <span>Medication taken: <strong>{selectedLog.medication.name}</strong></span>
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
