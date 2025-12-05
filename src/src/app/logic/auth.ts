/**
 * Authentication Logic
 * 
 * User authentication, session management, and authorization
 * 
 * ⚠️ PRODUCTION ONLY - NOT executed in Figma Make preview mode
 */

import { createSupabaseClient } from './supabase';

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string) {
  const supabase = createSupabaseClient();
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
}

/**
 * Sign up new user
 */
export async function signUp(
  email: string,
  password: string,
  metadata?: Record<string, any>
) {
  const supabase = createSupabaseClient();
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });
  
  if (error) throw error;
  return data;
}

/**
 * Sign out current user
 */
export async function signOut() {
  const supabase = createSupabaseClient();
  
  const { error } = await supabase.auth.signOut();
  
  if (error) throw error;
}

/**
 * Get current session
 */
export async function getSession() {
  const supabase = createSupabaseClient();
  
  const { data, error } = await supabase.auth.getSession();
  
  if (error) throw error;
  return data.session;
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  const supabase = createSupabaseClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) throw error;
  return user;
}

/**
 * Refresh session
 */
export async function refreshSession() {
  const supabase = createSupabaseClient();
  
  const { data, error } = await supabase.auth.refreshSession();
  
  if (error) throw error;
  return data.session;
}

/**
 * Reset password request
 */
export async function resetPasswordRequest(email: string) {
  const supabase = createSupabaseClient();
  
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  
  if (error) throw error;
}

/**
 * Update password
 */
export async function updatePassword(newPassword: string) {
  const supabase = createSupabaseClient();
  
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  
  if (error) throw error;
}

/**
 * Update user metadata
 */
export async function updateUserMetadata(metadata: Record<string, any>) {
  const supabase = createSupabaseClient();
  
  const { error } = await supabase.auth.updateUser({
    data: metadata,
  });
  
  if (error) throw error;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const session = await getSession();
    return !!session;
  } catch {
    return false;
  }
}

/**
 * Get access token
 */
export async function getAccessToken(): Promise<string | null> {
  try {
    const session = await getSession();
    return session?.access_token || null;
  } catch {
    return null;
  }
}

/**
 * OAuth sign in (Google, Facebook, etc.)
 */
export async function signInWithOAuth(provider: 'google' | 'facebook' | 'github') {
  const supabase = createSupabaseClient();
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: window.location.origin,
    },
  });
  
  if (error) throw error;
  return data;
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(
  callback: (event: string, session: any) => void
) {
  const supabase = createSupabaseClient();
  
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      callback(event, session);
    }
  );
  
  return subscription;
}
