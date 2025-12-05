import { MockAuthState, User } from './types';
import { mockUser } from './mockUser';

/**
 * Mock authentication system for preview environment
 * Simulates login/logout without real Supabase calls
 */

let currentUser: User | null = mockUser; // Start logged in for preview
let authListeners: Array<(user: User | null) => void> = [];

export const createMockAuth = (): MockAuthState => ({
  isAuthenticated: currentUser !== null,
  user: currentUser,

  login: async (email: string, password: string) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Accept any credentials in preview mode
    currentUser = {
      ...mockUser,
      email,
    };
    
    // Notify listeners
    authListeners.forEach(listener => listener(currentUser));
  },

  logout: async () => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    currentUser = null;
    
    // Notify listeners
    authListeners.forEach(listener => listener(null));
  },

  signup: async (email: string, password: string, name: string) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    currentUser = {
      id: `user-${Date.now()}`,
      email,
      name,
      language: 'pt',
      currency: 'EUR',
      createdAt: new Date().toISOString(),
    };
    
    // Notify listeners
    authListeners.forEach(listener => listener(currentUser));
  },
});

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  authListeners.push(callback);
  
  // Return unsubscribe function
  return () => {
    authListeners = authListeners.filter(l => l !== callback);
  };
};

export const getCurrentUser = () => currentUser;

export const setMockUser = (user: User | null) => {
  currentUser = user;
  authListeners.forEach(listener => listener(currentUser));
};
