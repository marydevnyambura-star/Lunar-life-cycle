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
      version: '2.0',
      exportedAt: new Date().toISOString(),
      settings,
      cycles,
      logs
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lumacycle_health_backup_${new Date().toISOString().slice(0, 10)}.json`;
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
      <div className="bg-gradient-to-br from-[#542080] via-[#7B2CBF] to-[#321442] text-white p-6 sm:p-8 rounded-3xl border border-[#C8A2E8]/30 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#EC4899]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex items-start gap-4">
          <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md text-[#FCE7F3] shrink-0 border border-white/20">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold font-display text-white">
                Private, Encrypted, Account-Protected
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EC4899]/30 text-pink-200 border border-[#EC4899]/40">
                LumaCycle Vault
              </span>
            </div>
            <p className="mt-1.5 text-xs sm:text-sm text-purple-100/90 leading-relaxed max-w-2xl">
              Your menstrual dates, cycle variability, symptom history, and notes are strictly associated with your verified Google account. No third-party advertising trackers, no reproductive data monetization, and no cross-site surveillance.
            </p>
          </div>
        </div>
      </div>

      {/* Cycle Parameters */}
      <div className="bg-white rounded-3xl border border-[#C8A2E8]/40 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[#321442] font-display">
            Cycle Baseline & Algorithm Parameters
          </h3>
          <p className="text-xs text-[#7B2CBF]/80 mt-0.5">
            These values serve as the baseline prior to dynamic historical adaptation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="text-xs font-semibold text-[#321442] block mb-1.5">
              Baseline Cycle Length
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="20"
                max="50"
                value={settings.avgCycleLength}
                onChange={e => handleSettingChange('avgCycleLength', parseInt(e.target.value) || 28)}
                className="w-full px-3 py-2 text-sm bg-[#F6F0FC] border border-[#C8A2E8]/50 rounded-xl font-mono text-[#321442] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]"
              />
              <span className="text-xs text-[#7B2CBF]/80">days</span>
            </div>
            <p className="text-[11px] text-[#7B2CBF]/60 mt-1">Typical: 24–35 days</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#321442] block mb-1.5">
              Typical Period Flow Duration
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="2"
                max="12"
                value={settings.avgPeriodDuration}
                onChange={e => handleSettingChange('avgPeriodDuration', parseInt(e.target.value) || 5)}
                className="w-full px-3 py-2 text-sm bg-[#F6F0FC] border border-[#C8A2E8]/50 rounded-xl font-mono text-[#321442] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]"
              />
              <span className="text-xs text-[#7B2CBF]/80">days</span>
            </div>
            <p className="text-[11px] text-[#7B2CBF]/60 mt-1">Typical: 3–7 days</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#321442] block mb-1.5">
              Luteal Phase Span
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="10"
                max="16"
                value={settings.lutealLength}
                onChange={e => handleSettingChange('lutealLength', parseInt(e.target.value) || 14)}
                className="w-full px-3 py-2 text-sm bg-[#F6F0FC] border border-[#C8A2E8]/50 rounded-xl font-mono text-[#321442] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]"
              />
              <span className="text-xs text-[#7B2CBF]/80">days</span>
            </div>
            <p className="text-[11px] text-[#7B2CBF]/60 mt-1">Typically 12–14 days</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#F6F0FC]">
          <div>
            <label className="text-xs font-semibold text-[#321442] block mb-1.5">
              Basal Temperature Unit
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSettingChange('tempUnit', 'C')}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                  settings.tempUnit === 'C'
                    ? 'bg-[#542080] text-white border-[#542080] shadow-xs'
                    : 'bg-[#F6F0FC] text-[#321442] border-[#C8A2E8]/50 hover:bg-[#FCE7F3]'
                }`}
              >
                Celsius (°C)
              </button>
              <button
                type="button"
                onClick={() => handleSettingChange('tempUnit', 'F')}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                  settings.tempUnit === 'F'
                    ? 'bg-[#542080] text-white border-[#542080] shadow-xs'
                    : 'bg-[#F6F0FC] text-[#321442] border-[#C8A2E8]/50 hover:bg-[#FCE7F3]'
                }`}
              >
                Fahrenheit (°F)
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#321442] block mb-1.5">
              Weight Unit
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSettingChange('weightUnit', 'kg')}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                  settings.weightUnit === 'kg'
                    ? 'bg-[#542080] text-white border-[#542080] shadow-xs'
                    : 'bg-[#F6F0FC] text-[#321442] border-[#C8A2E8]/50 hover:bg-[#FCE7F3]'
                }`}
              >
                Kilograms (kg)
              </button>
              <button
                type="button"
                onClick={() => handleSettingChange('weightUnit', 'lbs')}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                  settings.weightUnit === 'lbs'
                    ? 'bg-[#542080] text-white border-[#542080] shadow-xs'
                    : 'bg-[#F6F0FC] text-[#321442] border-[#C8A2E8]/50 hover:bg-[#FCE7F3]'
                }`}
              >
                Pounds (lbs)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Security & Discreet Mode */}
      <div className="bg-white rounded-3xl border border-[#C8A2E8]/40 p-6 sm:p-8 shadow-xs space-y-5">
        <h3 className="text-base sm:text-lg font-bold text-[#321442] font-display">
          Privacy & Screen Shield
        </h3>

        <div className="space-y-4">
          {/* Discreet mode */}
          <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-[#F6F0FC] border border-[#C8A2E8]/30">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <EyeOff className="w-4 h-4 text-[#7B2CBF]" />
                <span className="text-xs sm:text-sm font-bold text-[#321442]">
                  Discreet / Commute Mode
                </span>
              </div>
              <p className="text-xs text-[#7B2CBF]/80">
                Neutralizes explicit phrases (replaces "Period Flow" with "Phase 1") for privacy around onlookers.
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.privacyMode}
              onChange={e => handleSettingChange('privacyMode', e.target.checked)}
              className="w-5 h-5 text-[#EC4899] accent-[#EC4899] rounded-sm cursor-pointer mt-0.5"
            />
          </div>

          {/* Passcode Lock */}
          <div className="p-4 rounded-2xl bg-[#F6F0FC] border border-[#C8A2E8]/30 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#7B2CBF]" />
                  <span className="text-xs sm:text-sm font-bold text-[#321442]">
                    PIN Passcode Protection
                  </span>
                </div>
                <p className="text-xs text-[#7B2CBF]/80">
                  Require a 4-digit numeric code to unlock your intimate health logs.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.pinEnabled}
                onChange={e => handleSettingChange('pinEnabled', e.target.checked)}
                className="w-5 h-5 text-[#EC4899] accent-[#EC4899] rounded-sm cursor-pointer mt-0.5"
              />
            </div>

            {settings.pinEnabled && (
              <div className="pt-2 flex items-center gap-3">
                <label className="text-xs font-semibold text-[#321442]">4-Digit PIN:</label>
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
                  className="w-24 px-3 py-1.5 text-center text-sm tracking-widest font-mono bg-white border border-[#C8A2E8] rounded-xl text-[#321442] focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]"
                />
                <span className="text-[11px] text-[#7B2CBF]/70">Current PIN active</span>
              </div>
            )}
          </div>

          {/* Birth control reminder */}
          <div className="p-4 rounded-2xl bg-[#F6F0FC] border border-[#C8A2E8]/30 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#EC4899]" />
                  <span className="text-xs sm:text-sm font-bold text-[#321442]">
                    Contraceptive Pill Reminder
                  </span>
                </div>
                <p className="text-xs text-[#7B2CBF]/80">
                  Displays daily notification banner and quick check-off button.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.pillReminderEnabled}
                onChange={e => handleSettingChange('pillReminderEnabled', e.target.checked)}
                className="w-5 h-5 text-[#EC4899] accent-[#EC4899] rounded-sm cursor-pointer mt-0.5"
              />
            </div>

            {settings.pillReminderEnabled && (
              <div className="pt-2 flex items-center gap-3">
                <label className="text-xs font-semibold text-[#321442]">Reminder Time:</label>
                <input
                  type="time"
                  value={settings.pillReminderTime}
                  onChange={e => handleSettingChange('pillReminderTime', e.target.value)}
                  className="px-3 py-1.5 text-xs bg-white border border-[#C8A2E8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7B2CBF] font-mono text-[#321442]"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Backup and Data Management */}
      <div className="bg-white rounded-3xl border border-[#C8A2E8]/40 p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="text-base sm:text-lg font-bold text-[#321442] font-display">
          Data Backup & Portability
        </h3>
        <p className="text-xs text-[#7B2CBF]/80">
          Save an offline JSON snapshot of your cycles, symptom logs, pain severity, and medications to store anywhere.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportData}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#7B2CBF] to-[#542080] hover:from-[#542080] hover:to-[#321442] text-white transition-all flex items-center gap-1.5 shadow-sm shadow-purple-200 cursor-pointer"
          >
            <Download className="w-4 h-4 text-purple-200" />
            <span>Export JSON Backup</span>
          </button>

          <label className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white text-[#542080] border border-[#C8A2E8]/60 hover:bg-[#F6F0FC] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs">
            <Upload className="w-4 h-4 text-[#7B2CBF]" />
            <span>Restore from File</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={() => {
              if (confirm('Reset to standard starter cycle data? This will overwrite your current logs with realistic starter data.')) {
                onResetData();
              }
            }}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-rose-500" />
            <span>Reset Starter Data</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#321442] text-white px-4 py-2.5 rounded-2xl text-xs font-medium flex items-center gap-2 shadow-xl border border-[#C8A2E8]/40 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Preferences updated</span>
        </div>
      )}
    </div>
  );
};
