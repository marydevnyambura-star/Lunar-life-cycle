import React, { useState } from 'react';
import { CycleRecord, UserSettings } from '../types';
import { calculateCycleStats, parseDateStr, formatDisplayDate } from '../utils/cycleCalculations';
import { Plus, Calendar, Trash2, Clock, CheckCircle2, AlertCircle, Edit3, Filter, Sparkles, ChevronRight, Info } from 'lucide-react';

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
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-stone-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-stone-900 font-display">
                Delete Menstrual Period Record?
              </h3>
              <p className="text-xs text-stone-600 mt-1">
                Are you sure you want to remove the period record starting on{' '}
                <strong className="text-stone-900">{formatDisplayDate(parseDateStr(cycleToDelete.startDate))}</strong>?
              </p>
              <p className="text-[11px] text-stone-500 mt-2 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                Deleting this record will automatically recalculate cycle lengths and predictions between adjacent periods.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCycleToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors shadow-sm shadow-rose-200"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-500 font-medium">Average Cycle Length</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="font-display text-2xl sm:text-3xl font-bold text-stone-900 tabular-nums">
              {stats.averageCycleLength}
            </span>
            <span className="text-xs text-stone-500">days</span>
          </div>
          <span className="text-[11px] text-stone-500 mt-1 block">
            {stats.estimateLabel}
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-500 font-medium">Avg Flow Duration</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="font-display text-2xl sm:text-3xl font-bold text-rose-600 tabular-nums">
              {stats.averagePeriodDuration}
            </span>
            <span className="text-xs text-stone-500">days</span>
          </div>
          <span className="text-[11px] text-stone-500 mt-1 block">
            Typical flow duration (2–8 days)
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-500 font-medium">Cycle Regularity</span>
          <div className="mt-1">
            <span className="font-display text-base font-bold text-stone-900">
              {stats.regularityScore}
            </span>
          </div>
          <span className="text-[11px] text-emerald-600 mt-1 block">
            {stats.isEmpirical ? 'Based on consecutive periods' : 'Record past months to analyze'}
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-500 font-medium">Recorded Cycles</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="font-display text-2xl sm:text-3xl font-bold text-stone-900 tabular-nums">
              {cycles.length}
            </span>
            <span className="text-xs text-stone-500">periods</span>
          </div>
          <span className="text-[11px] text-stone-500 mt-1 block">
            {stats.completedCycleCount} completed intervals
          </span>
        </div>
      </div>

      {/* Cycle Calculation Methodology Info Card */}
      <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 text-xs text-stone-700 flex items-start gap-3">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-amber-950">
            How LumaCycle Calculates Your Cycle Length & Predictions
          </p>
          <p className="text-stone-600 leading-relaxed">
            Cycle length is calculated as the number of days between the <strong>first day of one period</strong> and the <strong>first day of the next period</strong>. When you log or edit periods from September 2026, August 2026, or earlier months, your personal average cycle length recalculates automatically. All period, fertile window, and ovulation predictions are clearly labeled scientific estimates.
          </p>
        </div>
      </div>

      {/* Action Bar & Month Filter */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-stone-900 font-display">
            Menstrual History & Past Records
          </h3>
          <p className="text-xs text-stone-500">
            View, add, edit, or delete past period records across months and years
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Month Filter */}
          {monthYearOptions.length > 1 && (
            <div className="flex items-center gap-1.5 bg-stone-50 px-2.5 py-1.5 rounded-xl border border-stone-200 text-xs">
              <Filter className="w-3.5 h-3.5 text-stone-500" />
              <select
                value={selectedMonthFilter}
                onChange={e => setSelectedMonthFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold text-stone-700 focus:outline-none cursor-pointer"
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
            className="px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-[0.98] rounded-2xl transition-all flex items-center gap-2 shadow-sm shadow-rose-200 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Past Period</span>
          </button>
        </div>
      </div>

      {/* List of Cycle Records */}
      <div className="space-y-3">
        {filteredCycles.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-stone-200 space-y-3">
            <Calendar className="w-8 h-8 text-stone-300 mx-auto" />
            <p className="text-xs font-semibold text-stone-600">
              No period records found for the selected view.
            </p>
            <button
              onClick={() => onOpenRecordModal()}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 underline"
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
                className="p-4 sm:p-5 bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-stone-300 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                      c.isOngoing ? 'bg-rose-100 text-rose-700' : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display font-bold text-stone-900 text-sm sm:text-base">
                        {formatDisplayDate(startDateObj)}
                      </span>
                      {c.isOngoing && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                          Current Cycle
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-x-3 gap-y-1 text-xs text-stone-500 mt-1 flex-wrap">
                      <span>
                        Bleed: <strong className="text-stone-700">{flowDuration} days</strong>
                        {endDateObj ? ` (Ended ${endDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})` : ''}
                      </span>
                      {c.cycleLength ? (
                        <>
                          <span>•</span>
                          <span className="bg-stone-50 px-2 py-0.5 rounded-md border border-stone-200 font-medium text-stone-700">
                            Cycle length: <strong>{c.cycleLength} days</strong> to next period
                          </span>
                        </>
                      ) : (
                        c.isOngoing && (
                          <>
                            <span>•</span>
                            <span className="text-rose-600 font-medium">
                              Estimated cycle length: {stats.averageCycleLength} days
                            </span>
                          </>
                        )
                      )}
                    </div>
                  </div>
                </div>

                {/* Edit & Delete Action Buttons */}
                <div className="flex items-center justify-end gap-2 self-end md:self-auto border-t md:border-t-0 pt-2 md:pt-0 w-full md:w-auto">
                  <button
                    onClick={() => onOpenRecordModal(c)}
                    className="px-3 py-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Edit dates or duration of this period"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => setCycleToDelete(c)}
                    className="p-2 text-stone-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
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
