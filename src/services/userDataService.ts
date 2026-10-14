import {
  db,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  handleFirestoreError,
  OperationType
} from '../firebase';
import { UserSettings, CycleRecord, DailyLog } from '../types';

export interface UserProfileData {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  createdAt: string;
  updatedAt: string;
}

export const defaultSettings: UserSettings = {
  avgCycleLength: 28,
  avgPeriodDuration: 5,
  lutealLength: 14,
  tempUnit: 'C',
  weightUnit: 'kg',
  pillReminderEnabled: true,
  pillReminderTime: '21:00',
  privacyMode: false,
  pinEnabled: false,
  pinCode: '1234'
};

/**
 * Loads or initializes the user profile in Firestore
 */
export async function fetchOrCreateUserProfile(
  uid: string,
  email: string,
  displayName?: string | null,
  photoURL?: string | null
): Promise<UserProfileData> {
  const userRef = doc(db, 'users', uid);
  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserProfileData;
    }

    const newProfile: UserProfileData = {
      uid,
      email: email || '',
      displayName: displayName || (email ? email.split('@')[0] : 'User'),
      photoURL: photoURL || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await setDoc(userRef, newProfile);
    return newProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}`);
  }
}

/**
 * Loads user settings from /users/{uid}/settings/preferences
 */
export async function fetchUserSettings(uid: string): Promise<UserSettings> {
  const ref = doc(db, 'users', uid, 'settings', 'preferences');
  try {
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      return {
        ...defaultSettings,
        avgCycleLength: data.avgCycleLength ?? defaultSettings.avgCycleLength,
        avgPeriodDuration: data.avgPeriodDuration ?? defaultSettings.avgPeriodDuration,
        lutealLength: data.lutealLength ?? defaultSettings.lutealLength,
        tempUnit: data.tempUnit ?? defaultSettings.tempUnit,
        weightUnit: data.weightUnit ?? defaultSettings.weightUnit,
        pillReminderEnabled: data.pillReminderEnabled ?? defaultSettings.pillReminderEnabled,
        pillReminderTime: data.pillReminderTime ?? defaultSettings.pillReminderTime,
        privacyMode: data.privacyMode ?? defaultSettings.privacyMode,
        pinEnabled: data.pinEnabled ?? defaultSettings.pinEnabled,
        pinCode: data.pinCode ?? defaultSettings.pinCode
      };
    }
    return defaultSettings;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${uid}/settings/preferences`);
  }
}

/**
 * Saves user settings
 */
export async function saveUserSettingsToDb(uid: string, settings: UserSettings): Promise<void> {
  const ref = doc(db, 'users', uid, 'settings', 'preferences');
  try {
    await setDoc(ref, {
      userId: uid,
      avgCycleLength: settings.avgCycleLength,
      avgPeriodDuration: settings.avgPeriodDuration,
      lutealLength: settings.lutealLength,
      tempUnit: settings.tempUnit,
      weightUnit: settings.weightUnit,
      pillReminderEnabled: settings.pillReminderEnabled,
      pillReminderTime: settings.pillReminderTime,
      privacyMode: settings.privacyMode,
      pinEnabled: settings.pinEnabled,
      pinCode: settings.pinCode,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}/settings/preferences`);
  }
}

/**
 * Fetches all cycles for the current user
 */
export async function fetchUserCycles(uid: string): Promise<CycleRecord[]> {
  const colRef = collection(db, 'users', uid, 'cycles');
  try {
    const snap = await getDocs(colRef);
    const cycles: CycleRecord[] = [];
    snap.forEach(docSnap => {
      cycles.push(docSnap.data() as CycleRecord);
    });
    return cycles.sort((a, b) => b.startDate.localeCompare(a.startDate));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `users/${uid}/cycles`);
  }
}

/**
 * Saves or updates a cycle record for the user
 */
export async function saveUserCycleToDb(uid: string, cycle: CycleRecord): Promise<void> {
  const ref = doc(db, 'users', uid, 'cycles', cycle.id);
  try {
    await setDoc(ref, {
      id: cycle.id,
      userId: uid,
      startDate: cycle.startDate,
      endDate: cycle.endDate || null,
      cycleEndDate: cycle.cycleEndDate || null,
      cycleLength: cycle.cycleLength || null,
      periodDuration: cycle.periodDuration || 5,
      isOngoing: !!cycle.isOngoing,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}/cycles/${cycle.id}`);
  }
}

/**
 * Deletes a cycle record for the user
 */
export async function deleteUserCycleFromDb(uid: string, cycleId: string): Promise<void> {
  const ref = doc(db, 'users', uid, 'cycles', cycleId);
  try {
    await deleteDoc(ref);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${uid}/cycles/${cycleId}`);
  }
}

/**
 * Fetches all daily logs for the user
 */
export async function fetchUserDailyLogs(uid: string): Promise<Record<string, DailyLog>> {
  const colRef = collection(db, 'users', uid, 'logs');
  try {
    const snap = await getDocs(colRef);
    const logsMap: Record<string, DailyLog> = {};
    snap.forEach(docSnap => {
      const data = docSnap.data() as DailyLog;
      logsMap[data.date] = data;
    });
    return logsMap;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `users/${uid}/logs`);
  }
}

/**
 * Saves a daily log for the user
 */
export async function saveUserDailyLogToDb(uid: string, log: DailyLog): Promise<void> {
  const ref = doc(db, 'users', uid, 'logs', log.date);
  try {
    await setDoc(ref, {
      id: log.date,
      userId: uid,
      date: log.date,
      isPeriod: log.isPeriod,
      flow: log.flow || 'none',
      symptoms: log.symptoms || [],
      moods: log.moods || [],
      cervicalMucus: log.cervicalMucus || null,
      temperature: log.temperature ?? null,
      weight: log.weight ?? null,
      waterGlasses: log.waterGlasses ?? 6,
      sleepHours: log.sleepHours ?? 8,
      pillTaken: !!log.pillTaken,
      sexualActivity: log.sexualActivity || { active: false },
      notes: log.notes || '',
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}/logs/${log.date}`);
  }
}

/**
 * Permanently deletes all personal data belonging to the user from Firestore
 */
export async function deleteAllUserDataFromDb(uid: string): Promise<void> {
  try {
    // Delete all cycles
    const cyclesSnap = await getDocs(collection(db, 'users', uid, 'cycles'));
    for (const d of cyclesSnap.docs) {
      await deleteDoc(d.ref);
    }

    // Delete all daily logs
    const logsSnap = await getDocs(collection(db, 'users', uid, 'logs'));
    for (const d of logsSnap.docs) {
      await deleteDoc(d.ref);
    }

    // Delete settings
    await deleteDoc(doc(db, 'users', uid, 'settings', 'preferences'));

    // Delete user profile
    await deleteDoc(doc(db, 'users', uid));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${uid}`);
  }
}
