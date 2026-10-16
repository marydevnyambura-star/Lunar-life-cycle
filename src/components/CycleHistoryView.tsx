import React, { useState } from 'react';
import { CycleRecord, UserSettings } from '../types';
import { calculateCycleStats, parseDateStr } from '../utils/cycleCalculations';
import { Plus, Calendar, Trash2, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

interface CycleHistoryViewProps {
  cycles: CycleRecord[];
  settings: UserSettings;
  onAddCycle: (startDate: string, duration: number) => void;
  onDeleteCycle: (cycleId: string) => void;
}

export const CycleHistoryView: React.FC<CycleHistoryViewProps> = ({
  cycles,
  settings,
  onAddCycle,
  onDeleteCycle
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStartDate, setNewStartDate] = useState('');
  const [newDuration, setNewDuration] = useState(5);

  const stats = calculateCycleStats(cycles, settings);
  const sortedCycles = [...cycles].sort((a, b) => b.startDate.localeCompare(a.startDate));

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStartDate) return;
    onAddCycle(newStartDate, newDuration);
    setNewStartDate('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-500 font-medium">Avg Cycle Length</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="font-display text-2xl sm:text-3xl font-bold text-stone-900 tabular-nums">
              {stats.averageCycleLength}
            </span>
            <span className="text-xs text-stone-500">days</span>
          </div>
          <span className="text-[11px] text-stone-400 mt-0.5 block">21–35 days normal</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-500 font-medium">Avg Period Bleed</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="font-display text-2xl sm:text-3xl font-bold text-rose-600 tabular-nums">
              {stats.averagePeriodDuration}
            </span>
            <span className="text-xs text-stone-500">days</span>
          </div>
          <span className="text-[11px] text-stone-400 mt-0.5 block">Typical flow span</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-500 font-medium">Cycle Regularity</span>
          <div className="mt-1">
            <span className="font-display text-base sm:text-lg font-bold text-stone-900">
              {stats.regularityScore}
            </span>
          </div>
          <span className="text-[11px] text-emerald-600 mt-0.5 block">Healthy biological rhythm</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-500 font-medium">Recorded Cycles</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="font-display text-2xl sm:text-3xl font-bold text-stone-900 tabular-nums">
              {cycles.length}
            </span>
            <span className="text-xs text-stone-500">recorded</span>
          </div>
          <span className="text-[11px] text-stone-400 mt-0.5 block">Stored locally</span>
        </div>
      </div>

      {/* Cycle Length Visual Trend Bar */}
      {sortedCycles.length > 1 && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs">
          <h3 className="text-sm font-bold text-stone-900 font-display">
            Historical Cycle Lengths
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Days from period start to the next period start
          </p>

          <div className="mt-4 space-y-3">
            {sortedCycles.slice(0, 6).map((c) => {
              const len = c.cycleLength || stats.averageCycleLength;
              const maxLen = 40;
              const widthPct = Math.min(100, Math.max(20, (len / maxLen) * 100));

              return (
                <div key={c.id} className="flex items-center gap-3 text-xs">
                  <span className="w-24 text-stone-600 font-mono text-[11px] shrink-0">
                    {parseDateStr(c.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <div className="flex-1 bg-stone-100 rounded-full h-4 overflow-hidden relative">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        c.isOngoing ? 'bg-rose-400' : 'bg-stone-800'
                      }`}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                  <span className="w-16 text-right font-mono font-medium text-stone-800">
                    {c.isOngoing ? 'Current' : `${len} days`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Bar & Record Period Start Date */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-stone-900 font-display">
            Recorded Cycles & Periods
          </h3>
          <p className="text-xs text-stone-500">
            Review your historical period start dates and cycle patterns
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-[0.98] rounded-2xl transition-all flex items-center gap-2 shadow-sm shadow-rose-200 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Close Form' : 'Record Period Start Date'}</span>
        </button>
      </div>

      {/* Add Past Period Form */}
      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="p-5 bg-stone-50 rounded-2xl border border-stone-300 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
            Backfill Past Period Start Date
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-stone-700 block mb-1">
                Period Start Date
              </label>
              <input
                type="date"
                required
                value={newStartDate}
                onChange={e => setNewStartDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-stone-700 block mb-1">
                Bleed Duration (days)
              </label>
              <input
                type="number"
                min="1"
                max="14"
                value={newDuration}
                onChange={e => setNewDuration(parseInt(e.target.value) || 5)}
                className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500 font-mono"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-medium text-white bg-stone-900 rounded-lg hover:bg-stone-800"
            >
              Save Past Cycle
            </button>
          </div>
        </form>
      )}

      {/* List of Cycle Records */}
      <div className="space-y-3">
        {sortedCycles.map(c => {
          const startDateObj = parseDateStr(c.startDate);
          return (
            <div
              key={c.id}
              className="p-4 sm:p-5 bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start sm:items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  c.isOngoing ? 'bg-rose-100 text-rose-700' : 'bg-stone-100 text-stone-700'
                }`}>
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-stone-900 text-sm sm:text-base">
                      {startDateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                    {c.isOngoing && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                        Current Active Cycle
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Flow duration: <span className="font-medium text-stone-700">{c.periodDuration || settings.avgPeriodDuration} days</span>
                    {c.cycleLength ? ` · Cycle length: ${c.cycleLength} days` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 self-end sm:self-auto">
                <button
                  onClick={() => onDeleteCycle(c.id)}
                  title="Remove this record"
                  className="p-2 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
