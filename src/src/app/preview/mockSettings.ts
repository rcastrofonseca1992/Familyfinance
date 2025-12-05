import { AppSettings } from './types';

/**
 * Mock settings management for preview environment
 * Simulates theme, language, and locale preferences
 */

let currentSettings: AppSettings = {
  theme: 'system',
  language: 'pt',
  currency: 'EUR',
  notifications: true,
};

let settingsListeners: Array<(settings: AppSettings) => void> = [];

export const getMockSettings = (): AppSettings => currentSettings;

export const updateMockSettings = (updates: Partial<AppSettings>): void => {
  currentSettings = { ...currentSettings, ...updates };
  
  // Notify listeners
  settingsListeners.forEach(listener => listener(currentSettings));
  
  // Store in localStorage for persistence during preview session
  localStorage.setItem('preview_settings', JSON.stringify(currentSettings));
};

export const onSettingsChange = (callback: (settings: AppSettings) => void) => {
  settingsListeners.push(callback);
  
  // Return unsubscribe function
  return () => {
    settingsListeners = settingsListeners.filter(l => l !== callback);
  };
};

// Load settings from localStorage on init
const storedSettings = localStorage.getItem('preview_settings');
if (storedSettings) {
  try {
    currentSettings = JSON.parse(storedSettings);
  } catch (e) {
    console.warn('Failed to parse stored preview settings');
  }
}

/**
 * Mock navigation for preview
 */
export const mockNavigation = {
  currentPage: 'dashboard',
  navigate: (page: string) => {
    mockNavigation.currentPage = page;
    navigationListeners.forEach(listener => listener(page));
  },
};

let navigationListeners: Array<(page: string) => void> = [];

export const onNavigate = (callback: (page: string) => void) => {
  navigationListeners.push(callback);
  
  return () => {
    navigationListeners = navigationListeners.filter(l => l !== callback);
  };
};
