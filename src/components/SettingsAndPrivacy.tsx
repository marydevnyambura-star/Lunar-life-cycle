import React, { useState } from 'react';
import { UserSettings, CycleRecord, DailyLog } from '../types';
import { ShieldCheck, Lock, EyeOff, Bell, Download, Upload, RotateCcw, Check, Sparkles } from 'lucide-react';

interface SettingsAndPrivacyProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  cycles: CycleRecord[];
  logs: Record<string, DailyLog>;
  onImportData: (data: { settings: UserSettings; cycles: CycleRecord[]; logs: Record<string, DailyLog> }) => void;
  onResetData: () => void;
}

export const SettingsAndPrivacy: React.FC<SettingsAndPrivacyProps> = ({
  settings,
  onUpdateSettings,
  cycles,
  logs,
  onImportData,
  onResetData
}) => {
  const [pinInput, setPinInput] = useState(settings.pinCode);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSettingChange = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    const updated = { ...settings, [key]: value };
    onUpdateSettings(updated);
    showNotice();
  };

  const showNotice = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleExportData = () => {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      settings,
      cycles,
      logs
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lumacycle_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.cycles && parsed.logs) {
          onImportData({
            settings: parsed.settings || settings,
            cycles: parsed.cycles,
            logs: parsed.logs
          });
          alert('Backup data successfully restored!');
        } else {
          alert('Invalid backup format.');
        }
      } catch (err) {
        alert('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Privacy Guarantee Card */}
      <div className="bg-stone-900 text-white p-6 rounded-2xl border border-stone-800 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-stone-800 text-emerald-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold font-display text-white">
              Private, Encrypted, Local By Design
            </h3>
            <p className="mt-1 text-xs text-stone-300 leading-relaxed max-w-2xl">
              Your menstrual health, intimate logs, and fertility notes are stored strictly inside your browser's private local storage. No third-party ad trackers, no reproductive profiling, and no data sales.
            </p>
          </div>
        </div>
      </div>

      {/* Cycle Parameters */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-5">
        <h3 className="text-base font-bold text-stone-900 font-display">
          Cycle & Algorithm Settings
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="text-xs font-medium text-stone-700 block mb-1.5">
              Average Cycle Length (Days)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="20"
                max="50"
                value={settings.avgCycleLength}
                onChange={e => handleSettingChange('avgCycleLength', parseInt(e.target.value) || 28)}
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
              <span className="text-xs text-stone-500">days</span>
            </div>
            <p className="text-[11px] text-stone-400 mt-1">Normal: 24–35 days</p>
          </div>

          <div>
            <label className="text-xs font-medium text-stone-700 block mb-1.5">
              Average Period Duration (Days)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="2"
                max="12"
                value={settings.avgPeriodDuration}
                onChange={e => handleSettingChange('avgPeriodDuration', parseInt(e.target.value) || 5)}
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
              <span className="text-xs text-stone-500">days</span>
            </div>
            <p className="text-[11px] text-stone-400 mt-1">Normal: 3–7 days</p>
          </div>

          <div>
            <label className="text-xs font-medium text-stone-700 block mb-1.5">
              Luteal Phase Length (Days)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="10"
                max="16"
                value={settings.lutealLength}
                onChange={e => handleSettingChange('lutealLength', parseInt(e.target.value) || 14)}
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
              <span className="text-xs text-stone-500">days</span>
            </div>
            <p className="text-[11px] text-stone-400 mt-1">Typically 12–14 days</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-stone-100">
          <div>
            <label className="text-xs font-medium text-stone-700 block mb-1.5">
              Basal Temperature Unit
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSettingChange('tempUnit', 'C')}
                className={`flex-1 py-2 text-xs font-medium rounded-xl border transition-all ${
                  settings.tempUnit === 'C'
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                Celsius (°C)
              </button>
              <button
                type="button"
                onClick={() => handleSettingChange('tempUnit', 'F')}
                className={`flex-1 py-2 text-xs font-medium rounded-xl border transition-all ${
                  settings.tempUnit === 'F'
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                Fahrenheit (°F)
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-stone-700 block mb-1.5">
              Weight Unit
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSettingChange('weightUnit', 'kg')}
                className={`flex-1 py-2 text-xs font-medium rounded-xl border transition-all ${
                  settings.weightUnit === 'kg'
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                Kilograms (kg)
              </button>
              <button
                type="button"
                onClick={() => handleSettingChange('weightUnit', 'lbs')}
                className={`flex-1 py-2 text-xs font-medium rounded-xl border transition-all ${
                  settings.weightUnit === 'lbs'
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                Pounds (lbs)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Security & Discreet Mode */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-5">
        <h3 className="text-base font-bold text-stone-900 font-display">
          Privacy & Screen Shield
        </h3>

        <div className="space-y-4">
          {/* Discreet mode */}
          <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-stone-50 border border-stone-200">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <EyeOff className="w-4 h-4 text-stone-600" />
                <span className="text-xs sm:text-sm font-semibold text-stone-900">
                  Discreet / Commute Mode
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Neutralizes explicit terms (e.g. replaces "Period Bleed" with "Phase 1") for privacy around onlookers.
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.privacyMode}
              onChange={e => handleSettingChange('privacyMode', e.target.checked)}
              className="w-5 h-5 text-stone-900 rounded-sm cursor-pointer mt-0.5"
            />
          </div>

          {/* Passcode Lock */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-stone-600" />
                  <span className="text-xs sm:text-sm font-semibold text-stone-900">
                    PIN Passcode Protection
                  </span>
                </div>
                <p className="text-xs text-stone-500">
                  Require a 4-digit numeric code to unlock your period logs.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.pinEnabled}
                onChange={e => handleSettingChange('pinEnabled', e.target.checked)}
                className="w-5 h-5 text-stone-900 rounded-sm cursor-pointer mt-0.5"
              />
            </div>

            {settings.pinEnabled && (
              <div className="pt-2 flex items-center gap-3">
                <label className="text-xs font-medium text-stone-700">4-Digit PIN:</label>
                <input
                  type="password"
                  maxLength={4}
                  value={pinInput}
                  onChange={e => {
                    setPinInput(e.target.value);
                    if (e.target.value.length === 4) {
                      handleSettingChange('pinCode', e.target.value);
                    }
                  }}
                  className="w-24 px-3 py-1.5 text-center text-sm tracking-widest font-mono bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
                <span className="text-[11px] text-stone-500">Current PIN active</span>
              </div>
            )}
          </div>

          {/* Birth control reminder */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs sm:text-sm font-semibold text-stone-900">
                    Contraceptive Pill Reminder
                  </span>
                </div>
                <p className="text-xs text-stone-500">
                  Displays daily notification banner and check-off reminder.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.pillReminderEnabled}
                onChange={e => handleSettingChange('pillReminderEnabled', e.target.checked)}
                className="w-5 h-5 text-emerald-600 rounded-sm cursor-pointer mt-0.5"
              />
            </div>

            {settings.pillReminderEnabled && (
              <div className="pt-2 flex items-center gap-3">
                <label className="text-xs font-medium text-stone-700">Reminder Time:</label>
                <input
                  type="time"
                  value={settings.pillReminderTime}
                  onChange={e => handleSettingChange('pillReminderTime', e.target.value)}
                  className="px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Backup and Data Management */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-stone-900 font-display">
          Data Backup & Portability
        </h3>
        <p className="text-xs text-stone-500">
          Save an encrypted JSON copy of your cycles, notes, and symptom logs to keep permanently.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportData}
            className="px-4 py-2 rounded-xl text-xs font-medium bg-stone-900 text-white hover:bg-stone-800 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Export JSON Backup</span>
          </button>

          <label className="px-4 py-2 rounded-xl text-xs font-medium bg-white text-stone-700 border border-stone-300 hover:bg-stone-50 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs">
            <Upload className="w-4 h-4 text-stone-500" />
            <span>Restore from File</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={() => {
              if (confirm('Reset to standard demo cycle data? This will overwrite your current logs with realistic starter data.')) {
                onResetData();
              }
            }}
            className="px-4 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Settings saved</span>
        </div>
      )}
    </div>
  );
};
