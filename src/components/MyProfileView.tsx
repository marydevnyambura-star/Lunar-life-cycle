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
  Heart
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
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-stone-900 tracking-tight">
          My Personal Profile
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Manage your verified identity, cycle parameters, and privacy sovereignty.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <div className="flex-1">{errorMsg}</div>
        </div>
      )}

      {/* Card 1: Verified Google Identity (Immutable) */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-full object-cover border-2 border-stone-100 shadow-sm"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-700 font-display font-bold text-xl flex items-center justify-center border-2 border-rose-200">
                {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold font-display text-stone-900">
                  {user.displayName || 'LumaCycle Member'}
                </h2>
                <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verified Identity</span>
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-stone-400" />
                <span>{user.email || 'No email attached'}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onSignOut}
            className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 hover:text-stone-900 hover:bg-stone-50 text-xs font-medium flex items-center gap-2 self-start sm:self-auto transition-colors"
          >
            <LogOut className="w-4 h-4 text-stone-500" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Identity Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80">
            <span className="text-[11px] text-stone-600 font-medium block">Unique User ID</span>
            <span className="font-mono text-stone-800 text-[11px] truncate block mt-1" title={user.uid}>
              {user.uid}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80">
            <span className="text-[11px] text-stone-600 font-medium block">Account Created</span>
            <span className="text-stone-900 font-medium block mt-1">
              {createdAtFormatted}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80">
            <span className="text-[11px] text-stone-600 font-medium block">Last Active Session</span>
            <span className="text-stone-900 font-medium block mt-1">
              {lastSignInFormatted}
            </span>
          </div>
        </div>

        <p className="text-[11px] text-stone-400 italic">
          *Note: To protect authentication integrity, your Google name and email are verified by the identity provider and cannot be spoofed inside the application.
        </p>
      </div>

      {/* Card 2: Menstrual Tracking Preferences (Editable) */}
      <form onSubmit={handleSavePreferences} className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div>
            <h2 className="text-lg font-bold font-display text-stone-900">
              Tracking & Algorithm Preferences
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Customize cycle calculations and unit settings saved to your private database profile.
            </p>
          </div>

          <button
            type="submit"
            disabled={savingSettings}
            className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-medium hover:bg-stone-800 active:scale-[0.98] transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-50"
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
            <label className="text-xs font-semibold text-stone-700 block mb-1.5">
              Typical Cycle Length
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
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
              <span className="text-xs text-stone-500">days</span>
            </div>
            <p className="text-[11px] text-stone-400 mt-1">Normal: 24–35 days</p>
          </div>

          {/* Period Duration */}
          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1.5">
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
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
              <span className="text-xs text-stone-500">days</span>
            </div>
            <p className="text-[11px] text-stone-400 mt-1">Normal: 3–7 days</p>
          </div>

          {/* Luteal Phase */}
          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1.5">
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
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
              <span className="text-xs text-stone-500">days</span>
            </div>
            <p className="text-[11px] text-stone-400 mt-1">Typically 12–14 days</p>
          </div>
        </div>

        {/* Units & Preferences */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-stone-100">
          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1.5">
              Basal Temperature Unit
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLocalSettings({ ...localSettings, tempUnit: 'C' })}
                className={`flex-1 py-2 text-xs font-medium rounded-xl border transition-all ${
                  localSettings.tempUnit === 'C'
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                Celsius (°C)
              </button>
              <button
                type="button"
                onClick={() => setLocalSettings({ ...localSettings, tempUnit: 'F' })}
                className={`flex-1 py-2 text-xs font-medium rounded-xl border transition-all ${
                  localSettings.tempUnit === 'F'
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                Fahrenheit (°F)
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1.5">
              Weight Unit
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLocalSettings({ ...localSettings, weightUnit: 'kg' })}
                className={`flex-1 py-2 text-xs font-medium rounded-xl border transition-all ${
                  localSettings.weightUnit === 'kg'
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                Kilograms (kg)
              </button>
              <button
                type="button"
                onClick={() => setLocalSettings({ ...localSettings, weightUnit: 'lbs' })}
                className={`flex-1 py-2 text-xs font-medium rounded-xl border transition-all ${
                  localSettings.weightUnit === 'lbs'
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                Pounds (lbs)
              </button>
            </div>
          </div>
        </div>

        {/* Birth control toggle in profile */}
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-stone-900 block">
              Daily Contraceptive Pill Reminder
            </span>
            <span className="text-[11px] text-stone-500">
              Show daily tracking checkmark at {localSettings.pillReminderTime}
            </span>
          </div>
          <input
            type="checkbox"
            checked={localSettings.pillReminderEnabled}
            onChange={e =>
              setLocalSettings({ ...localSettings, pillReminderEnabled: e.target.checked })
            }
            className="w-5 h-5 text-emerald-600 rounded-sm cursor-pointer"
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
          <p className="text-xs text-stone-600 mt-1">
            In compliance with privacy-by-design standards (including Kenya's Data Protection Act), you have absolute sovereignty over your intimate health history.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => setShowDeleteDataModal(true)}
            className="py-2.5 px-4 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-medium transition-colors"
          >
            Clear All Menstrual & Health Records
          </button>

          <button
            type="button"
            onClick={() => setShowDeleteAccountModal(true)}
            className="py-2.5 px-4 rounded-xl bg-rose-600 text-white hover:bg-rose-700 text-xs font-medium transition-colors shadow-xs"
          >
            Permanently Delete My Entire Account
          </button>
        </div>
      </div>

      {/* Modal: Clear Data Only Confirmation */}
      {showDeleteDataModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-stone-200">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-stone-900 font-display">
              Clear All Health Data?
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              This will permanently delete all your recorded cycles, daily logs, flow entries, symptoms, and notes from your database. Your login account will remain active.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowDeleteDataModal(false)}
                disabled={actionLoading}
                className="px-4 py-2 text-xs text-stone-600 hover:text-stone-900"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDataOnly}
                disabled={actionLoading}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-medium hover:bg-rose-700"
              >
                {actionLoading ? 'Deleting...' : 'Yes, Delete All Data'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Delete Entire Account Confirmation */}
      {showDeleteAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-stone-200">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-stone-900 font-display">
              Permanently Delete Account?
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              This will permanently erase your authenticated Google account connection and wipe all cycles, calendar records, and health notes from our database. This action is irreversible.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowDeleteAccountModal(false)}
                disabled={actionLoading}
                className="px-4 py-2 text-xs text-stone-600 hover:text-stone-900"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteEntireAccount}
                disabled={actionLoading}
                className="px-4 py-2 bg-rose-700 text-white rounded-xl text-xs font-medium hover:bg-rose-800"
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
