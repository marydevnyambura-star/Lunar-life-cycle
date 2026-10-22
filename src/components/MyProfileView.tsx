import React, { useState } from 'react';
import { User, signOut, auth, deleteUser } from '../firebase';
import { UserSettings } from '../types';
import {
  ShieldCheck,
  User as UserIcon,
  Mail,
  Calendar,
  LogOut,
  Trash2,
  Lock,
  Clock,
  Check,
  AlertTriangle,
  Heart,
  Sparkles
} from 'lucide-react';
import { deleteAllUserDataFromDb, saveUserSettingsToDb } from '../services/userDataService';

interface MyProfileViewProps {
  user: User;
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  onSignOut: () => void;
  onDataDeleted: () => void;
}

export const MyProfileView: React.FC<MyProfileViewProps> = ({
  user,
  settings,
  onUpdateSettings,
  onSignOut,
  onDataDeleted
}) => {
  const [localSettings, setLocalSettings] = useState<UserSettings>(settings);
  const [savingSettings, setSavingSettings] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showDeleteDataModal, setShowDeleteDataModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const createdAtFormatted = user.metadata.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Recently';

  const lastSignInFormatted = user.metadata.lastSignInTime
    ? new Date(user.metadata.lastSignInTime).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Current Session';

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setErrorMsg(null);
    try {
      await saveUserSettingsToDb(user.uid, localSettings);
      onUpdateSettings(localSettings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update preferences.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleDeleteDataOnly = async () => {
    setActionLoading(true);
    setErrorMsg(null);
    try {
      await deleteAllUserDataFromDb(user.uid);
      setShowDeleteDataModal(false);
      onDataDeleted();
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not delete personal tracking data.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteEntireAccount = async () => {
    setActionLoading(true);
    setErrorMsg(null);
    try {
      // 1. Delete all Firestore records first
      await deleteAllUserDataFromDb(user.uid);
      // 2. Delete Auth record
      await deleteUser(user);
      setShowDeleteAccountModal(false);
      onSignOut();
    } catch (err: any) {
      if (err.code === 'auth/requires-recent-login') {
        setErrorMsg('For your security, please sign out and sign back in before deleting your account.');
      } else {
        setErrorMsg(err.message || 'Failed to delete account.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#321442] tracking-tight flex items-center gap-2">
          <span>My Personal Profile</span>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FCE7F3] text-[#EC4899] border border-[#EC4899]/20">
            LumaCycle
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-[#7B2CBF]/80 mt-1">
          Manage your verified Google identity, cycle baseline parameters, and health data sovereignty.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <div className="flex-1">{errorMsg}</div>
        </div>
      )}

      {/* Card 1: Verified Google Identity (Immutable) */}
      <div className="bg-white rounded-3xl border border-[#C8A2E8]/40 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#F6F0FC]">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-full object-cover border-2 border-[#C8A2E8]/60 shadow-sm"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#7B2CBF] to-[#EC4899] text-white font-display font-bold text-2xl flex items-center justify-center border-2 border-white shadow-sm">
                {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold font-display text-[#321442]">
                  {user.displayName || 'LumaCycle Member'}
                </h2>
                <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Verified Google Account</span>
                </span>
              </div>
              <p className="text-xs text-[#7B2CBF]/70 mt-0.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#C8A2E8]" />
                <span>{user.email || 'No email attached'}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onSignOut}
            className="px-4 py-2 rounded-xl border border-[#C8A2E8]/50 text-[#542080] hover:text-[#321442] hover:bg-[#F6F0FC] text-xs font-semibold flex items-center gap-2 self-start sm:self-auto transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-[#7B2CBF]" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Identity Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-[#F6F0FC] border border-[#C8A2E8]/30">
            <span className="text-[11px] text-[#7B2CBF] font-semibold block">Unique User ID</span>
            <span className="font-mono text-[#321442] text-[11px] truncate block mt-1" title={user.uid}>
              {user.uid}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F6F0FC] border border-[#C8A2E8]/30">
            <span className="text-[11px] text-[#7B2CBF] font-semibold block">Account Created</span>
            <span className="text-[#321442] font-semibold block mt-1">
              {createdAtFormatted}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F6F0FC] border border-[#C8A2E8]/30">
            <span className="text-[11px] text-[#7B2CBF] font-semibold block">Last Active Session</span>
            <span className="text-[#321442] font-semibold block mt-1">
              {lastSignInFormatted}
            </span>
          </div>
        </div>

        <p className="text-[11px] text-[#7B2CBF]/60 italic">
          *Note: To protect authentication integrity, your Google name and email are verified by the identity provider and cannot be altered inside the application.
        </p>
      </div>

      {/* Card 2: Menstrual Tracking Preferences (Editable) */}
      <form onSubmit={handleSavePreferences} className="bg-white rounded-3xl border border-[#C8A2E8]/40 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#F6F0FC]">
          <div>
            <h2 className="text-lg font-bold font-display text-[#321442]">
              Tracking & Algorithm Preferences
            </h2>
            <p className="text-xs text-[#7B2CBF]/70 mt-0.5">
              Customize cycle parameters and unit settings saved to your private database profile.
            </p>
          </div>

          <button
            type="submit"
            disabled={savingSettings}
            className="px-4 py-2 bg-gradient-to-r from-[#7B2CBF] to-[#542080] hover:from-[#542080] hover:to-[#321442] text-white rounded-xl text-xs font-semibold active:scale-[0.98] transition-all flex items-center gap-1.5 shadow-sm shadow-purple-200 disabled:opacity-50 cursor-pointer"
          >
            {savingSettings ? (
              <span>Saving...</span>
            ) : saveSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save Preferences</span>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Cycle Length */}
          <div>
            <label className="text-xs font-semibold text-[#321442] block mb-1.5">
              Baseline Cycle Length
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="20"
                max="50"
                value={localSettings.avgCycleLength}
                onChange={e =>
                  setLocalSettings({ ...localSettings, avgCycleLength: parseInt(e.target.value) || 28 })
                }
                className="w-full px-3 py-2 text-sm bg-[#F6F0FC] border border-[#C8A2E8]/50 rounded-xl font-mono text-[#321442] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]"
              />
              <span className="text-xs text-[#7B2CBF]/80">days</span>
            </div>
            <p className="text-[11px] text-[#7B2CBF]/60 mt-1">Normal: 24–35 days</p>
          </div>

          {/* Period Duration */}
          <div>
            <label className="text-xs font-semibold text-[#321442] block mb-1.5">
              Typical Period Flow Duration
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="2"
                max="12"
                value={localSettings.avgPeriodDuration}
                onChange={e =>
                  setLocalSettings({ ...localSettings, avgPeriodDuration: parseInt(e.target.value) || 5 })
                }
                className="w-full px-3 py-2 text-sm bg-[#F6F0FC] border border-[#C8A2E8]/50 rounded-xl font-mono text-[#321442] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]"
              />
              <span className="text-xs text-[#7B2CBF]/80">days</span>
            </div>
            <p className="text-[11px] text-[#7B2CBF]/60 mt-1">Normal: 3–7 days</p>
          </div>

          {/* Luteal Phase */}
          <div>
            <label className="text-xs font-semibold text-[#321442] block mb-1.5">
              Luteal Phase Span
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="10"
                max="16"
                value={localSettings.lutealLength}
                onChange={e =>
                  setLocalSettings({ ...localSettings, lutealLength: parseInt(e.target.value) || 14 })
                }
                className="w-full px-3 py-2 text-sm bg-[#F6F0FC] border border-[#C8A2E8]/50 rounded-xl font-mono text-[#321442] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]"
              />
              <span className="text-xs text-[#7B2CBF]/80">days</span>
            </div>
            <p className="text-[11px] text-[#7B2CBF]/60 mt-1">Typically 12–14 days</p>
          </div>
        </div>

        {/* Units & Preferences */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#F6F0FC]">
          <div>
            <label className="text-xs font-semibold text-[#321442] block mb-1.5">
              Basal Temperature Unit
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLocalSettings({ ...localSettings, tempUnit: 'C' })}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                  localSettings.tempUnit === 'C'
                    ? 'bg-[#542080] text-white border-[#542080] shadow-xs'
                    : 'bg-[#F6F0FC] text-[#321442] border-[#C8A2E8]/50 hover:bg-[#FCE7F3]'
                }`}
              >
                Celsius (°C)
              </button>
              <button
                type="button"
                onClick={() => setLocalSettings({ ...localSettings, tempUnit: 'F' })}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                  localSettings.tempUnit === 'F'
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
                onClick={() => setLocalSettings({ ...localSettings, weightUnit: 'kg' })}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                  localSettings.weightUnit === 'kg'
                    ? 'bg-[#542080] text-white border-[#542080] shadow-xs'
                    : 'bg-[#F6F0FC] text-[#321442] border-[#C8A2E8]/50 hover:bg-[#FCE7F3]'
                }`}
              >
                Kilograms (kg)
              </button>
              <button
                type="button"
                onClick={() => setLocalSettings({ ...localSettings, weightUnit: 'lbs' })}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                  localSettings.weightUnit === 'lbs'
                    ? 'bg-[#542080] text-white border-[#542080] shadow-xs'
                    : 'bg-[#F6F0FC] text-[#321442] border-[#C8A2E8]/50 hover:bg-[#FCE7F3]'
                }`}
              >
                Pounds (lbs)
              </button>
            </div>
          </div>
        </div>

        {/* Birth control toggle in profile */}
        <div className="p-4 rounded-2xl bg-[#F6F0FC] border border-[#C8A2E8]/40 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#321442] block">
              Daily Contraceptive Pill Reminder
            </span>
            <span className="text-[11px] text-[#7B2CBF]/70">
              Show daily tracking checkmark at {localSettings.pillReminderTime}
            </span>
          </div>
          <input
            type="checkbox"
            checked={localSettings.pillReminderEnabled}
            onChange={e =>
              setLocalSettings({ ...localSettings, pillReminderEnabled: e.target.checked })
            }
            className="w-5 h-5 text-[#EC4899] accent-[#EC4899] rounded-sm cursor-pointer"
          />
        </div>
      </form>

      {/* Card 3: Account Deletion and Permanent Data Erasure */}
      <div className="bg-white rounded-3xl border border-rose-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div>
          <h2 className="text-lg font-bold font-display text-rose-950 flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-rose-600" />
            <span>Data Sovereignty & Permanent Erasure</span>
          </h2>
          <p className="text-xs text-[#7B2CBF]/80 mt-1">
            You hold absolute sovereignty over your intimate cycle records. You can wipe all menstrual and symptom records or delete your entire Google-linked account permanently.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => setShowDeleteDataModal(true)}
            className="py-2.5 px-4 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer"
          >
            Clear All Menstrual & Health Records
          </button>

          <button
            type="button"
            onClick={() => setShowDeleteAccountModal(true)}
            className="py-2.5 px-4 rounded-xl bg-rose-600 text-white hover:bg-rose-700 text-xs font-semibold transition-colors shadow-xs cursor-pointer"
          >
            Permanently Delete My Entire Account
          </button>
        </div>
      </div>

      {/* Modal: Clear Data Only Confirmation */}
      {showDeleteDataModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#321442]/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-[#C8A2E8]/40">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#321442] font-display">
              Clear All Health Data?
            </h3>
            <p className="text-xs text-[#7B2CBF]/80 leading-relaxed">
              This will permanently delete all your recorded cycles, daily logs, flow entries, symptoms, and notes from your database. Your login account will remain active.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowDeleteDataModal(false)}
                disabled={actionLoading}
                className="px-4 py-2 text-xs text-[#542080] hover:text-[#321442] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDataOnly}
                disabled={actionLoading}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700 cursor-pointer"
              >
                {actionLoading ? 'Deleting...' : 'Yes, Delete All Data'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Delete Entire Account Confirmation */}
      {showDeleteAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#321442]/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-[#C8A2E8]/40">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#321442] font-display">
              Permanently Delete Account?
            </h3>
            <p className="text-xs text-[#7B2CBF]/80 leading-relaxed">
              This will permanently erase your authenticated Google account connection and wipe all cycles, calendar records, and health notes from our database. This action is irreversible.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowDeleteAccountModal(false)}
                disabled={actionLoading}
                className="px-4 py-2 text-xs text-[#542080] hover:text-[#321442] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteEntireAccount}
                disabled={actionLoading}
                className="px-4 py-2 bg-rose-700 text-white rounded-xl text-xs font-semibold hover:bg-rose-800 cursor-pointer"
              >
                {actionLoading ? 'Erasing Account...' : 'Permanently Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
