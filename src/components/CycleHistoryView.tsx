import React, { useState } from 'react';
import { CycleRecord, UserSettings } from '../types';
import { calculateCycleStats, parseDateStr, formatDisplayDate, formatShortDate } from '../utils/cycleCalculations';
import { Plus, Calendar, Trash2, Clock, CheckCircle2, AlertCircle, Edit3, Filter, Sparkles, Droplets, Info } from 'lucide-react';

interface CycleHistoryViewProps {
  cycles: CycleRecord[];
  settings: UserSettings;
  onOpenRecordModal: (cycleToEdit?: CycleRecord) => void;
  onDeleteCycle: (cycleId: string) => void;
  currentDateStr: string;
}

export const CycleHistoryView: React.FC<CycleHistoryViewProps> = ({
  cycles,
  settings,
  onOpenRecordModal,
  onDeleteCycle,
  currentDateStr
}) => {
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>('all');
  const [cycleToDelete, setCycleToDelete] = useState<CycleRecord | null>(null);

  const stats = calculateCycleStats(cycles, settings);
  const sortedCycles = [...cycles].sort((a, b) => b.startDate.localeCompare(a.startDate));

  // Extract unique month-year strings from cycles (e.g. "October 2026", "September 2026")
  const monthYearOptions = Array.from(
    new Set(
      sortedCycles.map(c => {
        const d = parseDateStr(c.startDate);
        return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      })
    )
  );

  // Filter cycles based on selected month filter
  const filteredCycles = selectedMonthFilter === 'all'
    ? sortedCycles
    : sortedCycles.filter(c => {
        const d = parseDateStr(c.startDate);
        const myStr = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        return myStr === selectedMonthFilter;
      });

  const confirmDelete = () => {
    if (cycleToDelete) {
      onDeleteCycle(cycleToDelete.id);
      setCycleToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Modal */}
      {cycleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[#C8A2E8]/40 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-pink-100 text-[#EC4899] flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-[#321442] font-display">
                Delete Menstrual Period Record?
              </h3>
              <p className="text-xs text-stone-600 mt-1">
                Are you sure you want to remove the period record starting on{' '}
                <strong className="text-[#321442]">{formatDisplayDate(parseDateStr(cycleToDelete.startDate))}</strong>?
              </p>
              <p className="text-[11px] text-[#542080] mt-2 bg-[#F6F0FC] p-2.5 rounded-xl border border-[#C8A2E8]/40">
                Deleting this record will automatically recalculate cycle lengths and predictions between adjacent periods.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCycleToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-[#EC4899] text-white text-xs font-bold hover:bg-pink-600 transition-colors shadow-sm shadow-pink-200 cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-3xl border border-[#C8A2E8]/40 shadow-xs">
          <span className="text-xs text-stone-500 font-medium">Average Cycle Length</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="font-display text-2xl sm:text-3xl font-extrabold text-[#542080] tabular-nums">
              {stats.averageCycleLength}
            </span>
            <span className="text-xs text-stone-500 font-semibold">days</span>
          </div>
          <span className="text-[11px] text-[#7B2CBF] mt-1 block font-medium">
            {stats.estimateLabel}
          </span>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-[#C8A2E8]/40 shadow-xs">
          <span className="text-xs text-stone-500 font-medium">Avg Flow Duration</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="font-display text-2xl sm:text-3xl font-extrabold text-[#EC4899] tabular-nums">
              {stats.averagePeriodDuration}
            </span>
            <span className="text-xs text-stone-500 font-semibold">days</span>
          </div>
          <span className="text-[11px] text-stone-500 mt-1 block">
            Typical flow duration (2–8 days)
          </span>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-[#C8A2E8]/40 shadow-xs">
          <span className="text-xs text-stone-500 font-medium">Cycle Regularity</span>
          <div className="mt-1">
            <span className="font-display text-base font-bold text-[#321442]">
              {stats.regularityScore}
            </span>
          </div>
          <span className="text-[11px] text-[#7B2CBF] mt-1 block font-medium">
            {stats.isEmpirical ? 'Calculated from recorded cycles' : 'Record past months to analyze'}
          </span>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-[#C8A2E8]/40 shadow-xs">
          <span className="text-xs text-stone-500 font-medium">Recorded Periods</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="font-display text-2xl sm:text-3xl font-extrabold text-[#542080] tabular-nums">
              {cycles.length}
            </span>
            <span className="text-xs text-stone-500 font-semibold">periods</span>
          </div>
          <span className="text-[11px] text-stone-500 mt-1 block">
            {stats.completedCycleCount} completed intervals
          </span>
        </div>
      </div>

      {/* Cycle Calculation Methodology Info Card */}
      <div className="p-4 bg-purple-50/80 rounded-3xl border border-[#C8A2E8]/40 text-xs text-[#321442] flex items-start gap-3">
        <Info className="w-4 h-4 text-[#7B2CBF] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-[#542080]">
            How LumaCycle Calculates Cycle Lengths & Predictions
          </p>
          <p className="text-stone-600 leading-relaxed text-[11px]">
            Cycle length is calculated as the exact number of days between the <strong>first day of one period</strong> and the <strong>first day of the next period</strong>. When you log or edit periods from previous months and years, your personalized average cycle length and variability recalculate dynamically. All predictions are clearly labeled estimates.
          </p>
        </div>
      </div>

      {/* Action Bar & Month Filter */}
      <div className="bg-white rounded-3xl border border-[#C8A2E8]/40 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[#321442] font-display">
            Menstrual History Records
          </h3>
          <p className="text-xs text-stone-500">
            View, add, edit, or delete past period records across months and years
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Month Filter */}
          {monthYearOptions.length > 1 && (
            <div className="flex items-center gap-1.5 bg-[#F6F0FC] px-2.5 py-1.5 rounded-xl border border-[#C8A2E8]/40 text-xs">
              <Filter className="w-3.5 h-3.5 text-[#7B2CBF]" />
              <select
                value={selectedMonthFilter}
                onChange={e => setSelectedMonthFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold text-[#542080] focus:outline-none cursor-pointer"
              >
                <option value="all">All Months ({sortedCycles.length})</option>
                {monthYearOptions.map(my => (
                  <option key={my} value={my}>
                    {my}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Record Period Start / Backfill Button */}
          <button
            onClick={() => onOpenRecordModal()}
            className="px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#EC4899] hover:bg-pink-600 active:scale-[0.98] rounded-2xl transition-all flex items-center gap-2 shadow-sm shadow-pink-200 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Past Period</span>
          </button>
        </div>
      </div>

      {/* List of Cycle Records */}
      <div className="space-y-3">
        {filteredCycles.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-[#C8A2E8]/60 space-y-3">
            <Calendar className="w-8 h-8 text-purple-300 mx-auto" />
            <p className="text-xs font-semibold text-stone-600">
              No period records found for the selected view.
            </p>
            <button
              onClick={() => onOpenRecordModal()}
              className="text-xs font-bold text-[#EC4899] hover:underline"
            >
              Record a period now
            </button>
          </div>
        ) : (
          filteredCycles.map(c => {
            const startDateObj = parseDateStr(c.startDate);
            const endDateObj = c.endDate ? parseDateStr(c.endDate) : null;
            const flowDuration = c.periodDuration || settings.avgPeriodDuration || 5;

            return (
              <div
                key={c.id}
                className="p-4 sm:p-5 bg-white rounded-3xl border border-[#C8A2E8]/40 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#7B2CBF]/40 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                      c.isOngoing ? 'bg-pink-100 text-[#EC4899]' : 'bg-purple-100 text-[#542080]'
                    }`}
                  >
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display font-bold text-[#321442] text-sm sm:text-base">
                        {formatDisplayDate(startDateObj)}
                      </span>
                      {c.isOngoing && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 border border-pink-300">
                          Current Active Cycle
                        </span>
                      )}
                      {c.flow && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F6F0FC] text-[#7B2CBF] border border-[#C8A2E8]/40 capitalize">
                          {c.flow} flow
                        </span>
                      )}
                      {c.painSeverity && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-[#542080] border border-purple-200 capitalize">
                          {c.painSeverity} pain
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-x-3 gap-y-1 text-xs text-stone-500 mt-1 flex-wrap">
                      <span>
                        Bleed: <strong className="text-[#321442]">{flowDuration} days</strong>
                        {endDateObj ? ` (Ended ${formatShortDate(endDateObj)})` : ''}
                      </span>
                      {c.cycleLength ? (
                        <>
                          <span>•</span>
                          <span className="bg-[#F6F0FC] px-2 py-0.5 rounded-md border border-[#C8A2E8]/40 font-semibold text-[#542080]">
                            Cycle length: <strong>{c.cycleLength} days</strong> to next period
                          </span>
                        </>
                      ) : (
                        c.isOngoing && (
                          <>
                            <span>•</span>
                            <span className="text-[#EC4899] font-semibold">
                              Estimated cycle length: {stats.averageCycleLength} days
                            </span>
                          </>
                        )
                      )}
                    </div>

                    {c.symptoms && c.symptoms.length > 0 && (
                      <div className="flex items-center gap-1 mt-2 flex-wrap">
                        {c.symptoms.map(s => (
                          <span
                            key={s}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-[#F6F0FC] text-[#542080] border border-[#C8A2E8]/30 capitalize"
                          >
                            {s.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Edit & Delete Action Buttons */}
                <div className="flex items-center justify-end gap-2 self-end md:self-auto border-t md:border-t-0 pt-2 md:pt-0 w-full md:w-auto">
                  <button
                    onClick={() => onOpenRecordModal(c)}
                    className="px-3 py-1.5 text-xs font-semibold text-[#542080] hover:text-[#321442] hover:bg-purple-100 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Edit dates or duration of this period"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => setCycleToDelete(c)}
                    className="p-2 text-stone-400 hover:text-pink-600 rounded-xl hover:bg-pink-50 transition-colors cursor-pointer"
                    title="Delete this record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
