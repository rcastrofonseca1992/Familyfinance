// src/utils/authDeviceStorage.ts

export interface NotinowLastUser {
    email: string;
    lastLoginAt: string; // ISO string
  }
  
  const STORAGE_KEY = 'notinow_last_user';
  
  export function saveLastUser(email: string) {
    try {
      const payload: NotinowLastUser = {
        email,
        lastLoginAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (err) {
      // Fail silently – storage is just a UX enhancement
      console.warn('[authDeviceStorage] Failed to save last user', err);
    }
  }
  
  export function getLastUser(): NotinowLastUser | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
  
      const parsed = JSON.parse(raw) as NotinowLastUser;
      if (!parsed.email || typeof parsed.email !== 'string') return null;
  
      return parsed;
    } catch (err) {
      console.warn('[authDeviceStorage] Failed to read last user', err);
      return null;
    }
  }
  
  export function clearLastUser() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn('[authDeviceStorage] Failed to clear last user', err);
    }
  }
  