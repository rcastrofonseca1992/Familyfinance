/**
 * Supabase Logic
 * 
 * Supabase client configuration and database helpers
 * 
 * ⚠️ PRODUCTION ONLY - NOT executed in Figma Make preview mode
 */

import { createClient } from '@supabase/supabase-js';

/**
 * Create Supabase client
 * 
 * In production, this imports from /utils/supabase/info
 * In preview mode, this is never called
 */
export function createSupabaseClient() {
  // Import production config
  let projectId = '';
  let publicAnonKey = '';
  
  try {
    // Dynamic import to avoid errors in preview mode
    const info = require('../../utils/supabase/info');
    projectId = info.projectId;
    publicAnonKey = info.publicAnonKey;
  } catch (error) {
    console.error('Failed to load Supabase config:', error);
    throw new Error('Supabase configuration not available');
  }
  
  if (!projectId || !publicAnonKey) {
    throw new Error('Missing Supabase credentials');
  }
  
  const supabaseUrl = `https://${projectId}.supabase.co`;
  return createClient(supabaseUrl, publicAnonKey);
}

/**
 * Fetch all goals for current user
 */
export async function fetchGoals(userId: string) {
  const supabase = createSupabaseClient();
  
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

/**
 * Fetch all accounts for current household
 */
export async function fetchAccounts(householdId: string) {
  const supabase = createSupabaseClient();
  
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('household_id', householdId)
    .order('balance', { ascending: false });
  
  if (error) throw error;
  return data;
}

/**
 * Fetch all debts for current household
 */
export async function fetchDebts(householdId: string) {
  const supabase = createSupabaseClient();
  
  const { data, error } = await supabase
    .from('debts')
    .select('*')
    .eq('household_id', householdId)
    .order('total_amount', { ascending: false });
  
  if (error) throw error;
  return data;
}

/**
 * Fetch all incomes for current household
 */
export async function fetchIncomes(householdId: string) {
  const supabase = createSupabaseClient();
  
  const { data, error } = await supabase
    .from('incomes')
    .select('*')
    .eq('household_id', householdId)
    .order('amount', { ascending: false });
  
  if (error) throw error;
  return data;
}

/**
 * Fetch all fixed costs for current household
 */
export async function fetchFixedCosts(householdId: string) {
  const supabase = createSupabaseClient();
  
  const { data, error } = await supabase
    .from('fixed_costs')
    .select('*')
    .eq('household_id', householdId)
    .order('amount', { ascending: false });
  
  if (error) throw error;
  return data;
}

/**
 * Fetch household data
 */
export async function fetchHousehold(householdId: string) {
  const supabase = createSupabaseClient();
  
  const { data, error } = await supabase
    .from('households')
    .select('*')
    .eq('id', householdId)
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Fetch user data
 */
export async function fetchUser(userId: string) {
  const supabase = createSupabaseClient();
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Create new goal
 */
export async function createGoal(goalData: any) {
  const supabase = createSupabaseClient();
  
  const { data, error } = await supabase
    .from('goals')
    .insert([goalData])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Update goal
 */
export async function updateGoal(goalId: string, updates: any) {
  const supabase = createSupabaseClient();
  
  const { data, error } = await supabase
    .from('goals')
    .update(updates)
    .eq('id', goalId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Delete goal
 */
export async function deleteGoal(goalId: string) {
  const supabase = createSupabaseClient();
  
  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', goalId);
  
  if (error) throw error;
}

/**
 * Upload image to Supabase Storage
 */
export async function uploadImage(
  bucket: string,
  path: string,
  file: File
): Promise<string> {
  const supabase = createSupabaseClient();
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      upsert: true,
      cacheControl: '3600',
    });
  
  if (error) throw error;
  
  // Get public URL
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  
  return urlData.publicUrl;
}

/**
 * Get storage URL for file
 */
export function getStorageUrl(bucket: string, path: string): string {
  const supabase = createSupabaseClient();
  
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  
  return data.publicUrl;
}
