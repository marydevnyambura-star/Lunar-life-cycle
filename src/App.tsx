/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  auth,
  onAuthStateChanged,
  signOut,
  User
} from './firebase';
import {
  fetchOrCreateUserProfile,
  fetchUserSettings,
  saveUserSettingsToDb,
  fetchUserCycles,
  saveUserCycleToDb,
  deleteUserCycleFromDb,
  fetchUserDailyLogs,
  saveUserDailyLogToDb,
  defaultSettings
} from './services/userDataService';
import { AuthLanding } from './components/AuthLanding';
import { TopNavigation } from './components/TopNavigation';
import { TodayDashboard } from './components/TodayDashboard';
import { CalendarSection } from './components/CalendarSection';
import { HormonePhasesGuide } from './components/HormonePhasesGuide';
import { CycleHistoryView } from './components/CycleHistoryView';
import { MyProfileView } from './components/MyProfileView';
import { SettingsAndPrivacy } from './components/SettingsAndPrivacy';
import { DailyLoggerModal } from './components/DailyLoggerModal';
import { RecordPeriodModal } from './components/RecordPeriodModal';
import { PinLockModal } from './components/PinLockModal';
import { MobileTabBar } from './components/MobileTabBar';
import {
  getInitialSeedData,
  parseDateStr,
  formatDateStr,
  diffDays,
  addDays,
  getCurrentCycleStatus,
  getLocalTodayStr,
  recalculateAllCycles
} from './utils/cycleCalculations';
import { UserSettings, CycleRecord, DailyLog, FlowIntensity, Symptom, Mood } from './types';
import { Sparkles, Heart } from 'lucide-react';

export default function App() {
  // Automatically detected local current date (e.g. Wednesday, 21st October 2026)
  const [currentDateStr, setCurrentDateStr] = useState<string>(getLocalTodayStr());

  // Automatic daily rollover and local timezone synchronization
  useEffect(() => {
    const checkDate = () => {
      const today = getLocalTodayStr();
      setCurrentDateStr(prev => (prev !== today ? today : prev));
    };

    const interval = setInterval(checkDate, 60000);
    window.addEventListener('focus', checkDate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', checkDate);
    };
  }, []);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [dataLoading, setDataLoading] = useState<boolean>(false);

  // User Health & Cycle State (Strictly per-user, isolated)
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [cycles, setCycles] = useState<CycleRecord[]>([]);
  const [logs, setLogs] = useState<Record<string, DailyLog>>({});

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'today' | 'calendar' | 'phases' | 'history' | 'profile' | 'settings'>('today');

  // Passcode Lock state (if enabled in settings)
  const [isLocked, setIsLocked] = useState<boolean>(false);

  // Modal Logger states
  const [loggerModalOpen, setLoggerModalOpen] = useState<boolean>(false);
  const [loggerModalDate, setLoggerModalDate] = useState<string>(currentDateStr);

  // Record Period Modal (supports historical past months/years + editing existing cycles)
  const [recordPeriodModalOpen, setRecordPeriodModalOpen] = useState<boolean>(false);
  const [editingCycle, setEditingCycle] = useState<CycleRecord | null>(null);
  const [recordModalInitialDate, setRecordModalInitialDate] = useState<string>(currentDateStr);

  // Lively Feedback Toast
  const [livelyToast, setLivelyToast] = useState<{ message: string; sub?: string } | null>(null);

  const showLivelyToast = (message: string, sub?: string) => {
    setLivelyToast({ message, sub });
    setTimeout(() => {
      setLivelyToast(null);
    }, 4000);
  };

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthLoading(false);
      if (user) {
        setCurrentUser(user);
        await loadUserData(user);
      } else {
        // Clear all sensitive data immediately upon logout or switch
        setCurrentUser(null);
        setCycles([]);
        setLogs({});
        setSettings(defaultSettings);
        setIsLocked(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch or initialize this authenticated user's records from Firestore
  const loadUserData = async (user: User) => {
    setDataLoading(true);
    try {
      // 1. User profile
      await fetchOrCreateUserProfile(user.uid, user.email || '', user.displayName, user.photoURL);

      // 2. User settings
      const userSettings = await fetchUserSettings(user.uid);
      setSettings(userSettings);
      if (userSettings.pinEnabled) {
        setIsLocked(true);
      }

      // 3. User cycles
      let userCycles = await fetchUserCycles(user.uid);

      // 4. User logs
      let userLogs = await fetchUserDailyLogs(user.uid);

      // If this is a brand new account with 0 cycles, seed initial starter cycle so they have an active dashboard
      if (userCycles.length === 0 && Object.keys(userLogs).length === 0) {
        const seed = getInitialSeedData();
        for (const c of seed.cycles) {
          await saveUserCycleToDb(user.uid, c);
        }
        for (const logKey of Object.keys(seed.logs)) {
          await saveUserDailyLogToDb(user.uid, seed.logs[logKey]);
        }
        userCycles = seed.cycles;
        userLogs = seed.logs;
      } else {
        // Recalculate existing cycles to ensure cycle lengths between all periods are up to date
        userCycles = recalculateAllCycles(userCycles, userSettings.avgPeriodDuration || 5);
      }

      setCycles(userCycles);
      setLogs(userLogs);
    } catch (err) {
      console.error('Error loading authenticated user data from Firestore:', err);
    } finally {
      setDataLoading(false);
    }
  };

  // Sign out handler
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setCycles([]);
      setLogs({});
      setSettings(defaultSettings);
      setActiveTab('today');
    } catch (e) {
      console.error('Sign out error:', e);
    }
  };

  // Handler for data deletion
  const handleDataDeleted = () => {
    setCycles([]);
    setLogs({});
    setActiveTab('today');
    showLivelyToast('All records cleared', 'Your tracking data has been safely removed.');
  };

  // Current Cycle Calculation
  const cycleStatus = getCurrentCycleStatus(currentDateStr, cycles, settings);

  // Daily Logger Trigger
  const handleOpenLogger = (dateStr?: string) => {
    setLoggerModalDate(dateStr || currentDateStr);
    setLoggerModalOpen(true);
  };

  // Open Record Period Modal (supports new period or editing existing)
  const handleOpenRecordPeriod = (dateStr?: string, cycleToEdit?: CycleRecord) => {
    setEditingCycle(cycleToEdit || null);
    setRecordModalInitialDate(dateStr || currentDateStr);
    setRecordPeriodModalOpen(true);
  };

  // Save / Update Menstrual Period Record
  const handleSavePeriodRecord = async (data: {
    id?: string;
    startDate: string;
    endDate?: string;
    periodDuration: number;
    flow?: FlowIntensity;
    symptoms?: Symptom[];
    notes?: string;
  }) => {
    if (!currentUser) return;

    const targetId = data.id || `c-${Date.now()}`;
    const newCycle: CycleRecord = {
      id: targetId,
      startDate: data.startDate,
      endDate: data.endDate,
      periodDuration: data.periodDuration,
      isOngoing: false
    };

    // Combine with other cycles and recalculate cycle length between all period start dates
    const otherCycles = cycles.filter(c => c.id !== targetId);
    const combined = [...otherCycles, newCycle];
    const recalculated = recalculateAllCycles(combined, settings.avgPeriodDuration || 5);

    setCycles(recalculated);

    // Save recalculated cycles to Firestore
    for (const c of recalculated) {
      await saveUserCycleToDb(currentUser.uid, c);
    }

    // Update Daily Log for the period start date
    const existingLog = logs[data.startDate];
    const updatedLog: DailyLog = {
      ...(existingLog || {
        date: data.startDate,
        moods: []
      }),
      isPeriod: true,
      flow: data.flow || 'medium',
      symptoms: Array.from(new Set([...(existingLog?.symptoms || []), ...(data.symptoms || [])])),
      notes: data.notes || existingLog?.notes
    };

    setLogs(prev => ({
      ...prev,
      [data.startDate]: updatedLog
    }));
    await saveUserDailyLogToDb(currentUser.uid, updatedLog);

    // Also mark bleed days up to periodDuration if not yet recorded
    const startObj = parseDateStr(data.startDate);
    for (let i = 1; i < data.periodDuration; i++) {
      const bleedDateStr = formatDateStr(addDays(startObj, i));
      if (!logs[bleedDateStr]?.isPeriod) {
        const bleedLog: DailyLog = {
          ...(logs[bleedDateStr] || { date: bleedDateStr, moods: [] }),
          isPeriod: true,
          flow: data.flow || 'light'
        };
        setLogs(prev => ({ ...prev, [bleedDateStr]: bleedLog }));
        await saveUserDailyLogToDb(currentUser.uid, bleedLog);
      }
    }

    showLivelyToast(
      data.id ? 'Period record updated' : `Period recorded: ${data.startDate}`,
      'Cycle length to next period and predictions recalibrated!'
    );
  };

  // Delete Cycle Record
  const handleDeleteCycle = async (cycleId: string) => {
    if (!currentUser) return;

    const remaining = cycles.filter(c => c.id !== cycleId);
    const recalculated = recalculateAllCycles(remaining, settings.avgPeriodDuration || 5);
    setCycles(recalculated);

    await deleteUserCycleFromDb(currentUser.uid, cycleId);

    // Update any adjacent cycles whose cycleLength changed
    for (const c of recalculated) {
      await saveUserCycleToDb(currentUser.uid, c);
    }

    showLivelyToast('Record removed', 'Cycle history and predictions updated.');
  };

  // Quick Mood Tap
  const handleQuickMoodSelect = async (mood: Mood) => {
    if (!currentUser) return;
    const todayLog = logs[currentDateStr];
    const existingMoods = todayLog?.moods || [];
    const newMoods = existingMoods.includes(mood)
      ? existingMoods.filter(m => m !== mood)
      : [...existingMoods, mood];

    const updatedLog: DailyLog = {
      ...(todayLog || {
        date: currentDateStr,
        isPeriod: false,
        symptoms: []
      }),
      moods: newMoods
    };

    setLogs(prev => ({ ...prev, [currentDateStr]: updatedLog }));
    await saveUserDailyLogToDb(currentUser.uid, updatedLog);
  };

  // Save Daily Log
  const handleSaveDailyLog = async (newLog: DailyLog) => {
    if (!currentUser) return;

    setLogs(prev => ({
      ...prev,
      [newLog.date]: newLog
    }));

    await saveUserDailyLogToDb(currentUser.uid, newLog);

    if (newLog.isPeriod) {
      const existingCycle = cycles.find(c => {
        const start = parseDateStr(c.startDate);
        const logDate = parseDateStr(newLog.date);
        const diff = diffDays(logDate, start);
        return diff >= 0 && diff < 10;
      });

      if (!existingCycle) {
        const newRecord: CycleRecord = {
          id: `c-${Date.now()}`,
          startDate: newLog.date,
          periodDuration: settings.avgPeriodDuration,
          isOngoing: true
        };
        const recalculated = recalculateAllCycles([newRecord, ...cycles], settings.avgPeriodDuration);
        setCycles(recalculated);
        for (const c of recalculated) {
          await saveUserCycleToDb(currentUser.uid, c);
        }
      }
    }

    showLivelyToast('Daily log saved', 'Your symptoms and vitals have been recorded.');
  };

  // Quick Toggle Period Bleed for Today
  const handleTogglePeriodBleedToday = async () => {
    if (!currentUser) return;

    const todayLog = logs[currentDateStr];
    const isCurrentlyBleeding = !!todayLog?.isPeriod;

    if (isCurrentlyBleeding) {
      const updatedLog: DailyLog = {
        ...(todayLog || {
          date: currentDateStr,
          symptoms: [],
          moods: []
        }),
        isPeriod: false,
        flow: 'none'
      };
      setLogs(prev => ({ ...prev, [currentDateStr]: updatedLog }));
      await saveUserDailyLogToDb(currentUser.uid, updatedLog);
      showLivelyToast('Period marked as ended', 'Entering your follicular phase.');
    } else {
      const updatedLog: DailyLog = {
        ...(todayLog || {
          date: currentDateStr,
          symptoms: [],
          moods: []
        }),
        isPeriod: true,
        flow: 'medium'
      };
      setLogs(prev => ({ ...prev, [currentDateStr]: updatedLog }));
      await saveUserDailyLogToDb(currentUser.uid, updatedLog);

      const hasRecentCycle = cycles.some(c => {
        const diff = diffDays(parseDateStr(currentDateStr), parseDateStr(c.startDate));
        return diff >= 0 && diff <= 10;
      });

      if (!hasRecentCycle) {
        const newRecord: CycleRecord = {
          id: `c-${Date.now()}`,
          startDate: currentDateStr,
          periodDuration: settings.avgPeriodDuration,
          isOngoing: true
        };
        const recalculated = recalculateAllCycles([newRecord, ...cycles], settings.avgPeriodDuration);
        setCycles(recalculated);
        for (const c of recalculated) {
          await saveUserCycleToDb(currentUser.uid, c);
        }
      }

      showLivelyToast('Period started today', 'Cycle Day 1 begun!');
    }
  };

  // Toggle Pill Taken Today
  const handleTogglePillToday = async () => {
    if (!currentUser) return;

    const todayLog = logs[currentDateStr];
    const currentPill = !!todayLog?.pillTaken;
    const updatedLog: DailyLog = {
      ...(todayLog || {
        date: currentDateStr,
        isPeriod: false,
        symptoms: [],
        moods: []
      }),
      pillTaken: !currentPill
    };
    setLogs(prev => ({ ...prev, [currentDateStr]: updatedLog }));
    await saveUserDailyLogToDb(currentUser.uid, updatedLog);
  };

  // Update Hydration Water Glasses
  const handleUpdateWaterToday = async (amount: number) => {
    if (!currentUser) return;

    const todayLog = logs[currentDateStr];
    const updatedLog: DailyLog = {
      ...(todayLog || {
        date: currentDateStr,
        isPeriod: false,
        symptoms: [],
        moods: []
      }),
      waterGlasses: amount
    };
    setLogs(prev => ({ ...prev, [currentDateStr]: updatedLog }));
    await saveUserDailyLogToDb(currentUser.uid, updatedLog);
  };

  // Update Settings
  const handleUpdateSettings = async (newSettings: UserSettings) => {
    if (!currentUser) return;
    setSettings(newSettings);
    await saveUserSettingsToDb(currentUser.uid, newSettings);
  };

  // Toggle Discreet Privacy Mode
  const handleTogglePrivacy = async () => {
    if (!currentUser) return;
    const updated = { ...settings, privacyMode: !settings.privacyMode };
    setSettings(updated);
    await saveUserSettingsToDb(currentUser.uid, updated);
  };

  // Reset to Demo Data in User's Private Cloud Storage
  const handleResetData = async () => {
    if (!currentUser) return;
    const seed = getInitialSeedData();
    setSettings(seed.settings);
    setCycles(seed.cycles);
    setLogs(seed.logs);

    await saveUserSettingsToDb(currentUser.uid, seed.settings);
    for (const c of seed.cycles) {
      await saveUserCycleToDb(currentUser.uid, c);
    }
    for (const k of Object.keys(seed.logs)) {
      await saveUserDailyLogToDb(currentUser.uid, seed.logs[k]);
    }
  };

  // Import Backup into User's Account
  const handleImportData = async (data: {
    settings: UserSettings;
    cycles: CycleRecord[];
    logs: Record<string, DailyLog>;
  }) => {
    if (!currentUser) return;
    const recalculated = recalculateAllCycles(data.cycles, data.settings.avgPeriodDuration);
    setSettings(data.settings);
    setCycles(recalculated);
    setLogs(data.logs);

    await saveUserSettingsToDb(currentUser.uid, data.settings);
    for (const c of recalculated) {
      await saveUserCycleToDb(currentUser.uid, c);
    }
    for (const k of Object.keys(data.logs)) {
      await saveUserDailyLogToDb(currentUser.uid, data.logs[k]);
    }
  };

  // 1. Initial Auth Loading Screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-3xl bg-rose-500 animate-pulse flex items-center justify-center text-white mb-3 shadow-md shadow-rose-200">
          <Sparkles className="w-6 h-6" />
        </div>
        <p className="text-xs font-semibold text-stone-600">
          Preparing your private cycle sanctuary...
        </p>
      </div>
    );
  }

  // 2. Unauthenticated Gate: Welcoming Landing Page
  if (!currentUser) {
    return <AuthLanding onAuthSuccess={() => {}} />;
  }

  // 3. Authenticated Personal Dashboard
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-900 flex flex-col antialiased selection:bg-rose-100 selection:text-rose-900">
      {/* Passcode Lock Screen when protected */}
      {isLocked && (
        <PinLockModal
          correctPin={settings.pinCode || '1234'}
          onUnlock={() => setIsLocked(false)}
        />
      )}

      {/* Top Navigation Bar with Verified Identity & Profile trigger */}
      <TopNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickLog={() => handleOpenLogger(currentDateStr)}
        privacyMode={settings.privacyMode}
        onTogglePrivacy={handleTogglePrivacy}
        userDisplayName={currentUser.displayName}
        userPhotoURL={currentUser.photoURL}
        onSignOut={handleSignOut}
      />

      {/* Loading overlay for database sync */}
      {dataLoading && (
        <div className="bg-rose-50 border-b border-rose-200 py-1.5 px-4 text-center text-xs text-rose-700 flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 animate-spin text-rose-500" />
          <span>Synchronizing your private health records...</span>
        </div>
      )}

      {/* Lively Toast Notification */}
      {livelyToast && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 bg-stone-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-start gap-3 border border-stone-800 animate-fade-in max-w-sm">
          <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mt-0.5 shrink-0">
            <Heart className="w-3.5 h-3.5 fill-rose-500" />
          </div>
          <div className="text-xs">
            <p className="font-bold text-white">{livelyToast.message}</p>
            {livelyToast.sub && <p className="text-stone-300 text-[11px] mt-0.5">{livelyToast.sub}</p>}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12">
        {activeTab === 'today' && (
          <TodayDashboard
            currentDateStr={currentDateStr}
            cycles={cycles}
            logs={logs}
            settings={settings}
            onOpenLog={handleOpenLogger}
            onOpenRecordPeriodStart={() => handleOpenRecordPeriod(currentDateStr)}
            onTogglePeriodBleedToday={handleTogglePeriodBleedToday}
            onTogglePillToday={handleTogglePillToday}
            onUpdateWaterToday={handleUpdateWaterToday}
            onQuickMoodSelect={handleQuickMoodSelect}
            onNavigateToTab={setActiveTab}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarSection
            currentDateStr={currentDateStr}
            cycleStartDateStr={cycleStatus.cycleStartDateStr}
            settings={settings}
            logs={logs}
            cycles={cycles}
            onOpenLogForDate={handleOpenLogger}
            onOpenRecordPeriodForDate={(dateStr, cycleToEdit) => handleOpenRecordPeriod(dateStr, cycleToEdit)}
          />
        )}

        {activeTab === 'phases' && (
          <HormonePhasesGuide
            currentPhase={cycleStatus.currentPhase}
            cycles={cycles}
            settings={settings}
          />
        )}

        {activeTab === 'history' && (
          <CycleHistoryView
            cycles={cycles}
            settings={settings}
            onOpenRecordModal={(cycleToEdit) => handleOpenRecordPeriod(undefined, cycleToEdit)}
            onDeleteCycle={handleDeleteCycle}
            currentDateStr={currentDateStr}
          />
        )}

        {activeTab === 'profile' && (
          <MyProfileView
            user={currentUser}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onSignOut={handleSignOut}
            onDataDeleted={handleDataDeleted}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsAndPrivacy
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            cycles={cycles}
            logs={logs}
            onImportData={handleImportData}
            onResetData={handleResetData}
          />
        )}
      </main>

      {/* Record & Edit Menstrual Period Modal (Current or Past Months) */}
      <RecordPeriodModal
        isOpen={recordPeriodModalOpen}
        onClose={() => {
          setRecordPeriodModalOpen(false);
          setEditingCycle(null);
        }}
        currentDateStr={currentDateStr}
        defaultDuration={settings.avgPeriodDuration}
        editingCycle={editingCycle}
        initialStartDate={recordModalInitialDate}
        onSaveCycle={handleSavePeriodRecord}
      />

      {/* Daily Logger Modal Bottom Sheet / Center Modal */}
      <DailyLoggerModal
        isOpen={loggerModalOpen}
        onClose={() => setLoggerModalOpen(false)}
        selectedDate={loggerModalDate}
        onSaveLog={handleSaveDailyLog}
        existingLog={logs[loggerModalDate]}
        settings={settings}
      />

      {/* Mobile Sticky Bottom Tab Bar */}
      <MobileTabBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </div>
  );
}
