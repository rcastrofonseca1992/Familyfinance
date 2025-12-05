import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { MarketData, DEFAULT_MARKET_DATA, fetchBDEMarketData } from '../../lib/bde';
import { supabase } from '../../lib/supabase';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { toast } from 'sonner@2.0.3';
import { isFigmaPreview, mockFinanceData, safeSaveData, logPreviewMode } from '../../lib/figma-preview';
import { transformPreviewDataToFinanceData } from '../../src/app/preview/transformToFinanceData';

// Helper function to create auth headers with apikey
const authHeaders = (token: string) => ({
  "Authorization": `Bearer ${token}`,
  "apikey": publicAnonKey,
  "Content-Type": "application/json"
});

export interface Account {
  id: string;
  name: string;
  type: 'savings' | 'investment' | 'cash' | 'debt';
  balance: number;
  institution: string;
  currency: string;
  ownerId: string; // 'user' | 'partner' | 'joint'
  includeInHousehold: boolean;
  apy?: number; // Annual Percentage Yield (Interest Rate)
}

export interface RecurringCost {
  id: string;
  name: string;
  amount: number;
  category: string;
  frequency?: 'monthly' | 'yearly' | 'weekly';
  ownerId: string; // 'user' | 'partner' | 'joint'
  includeInHousehold: boolean;
}

export interface Debt {
  id: string;
  name: string;
  totalAmount: number;
  remainingAmount: number;
  monthlyPayment: number;
  interestRate: number;
  category?: string; // e.g., 'Loan', 'Credit Card', 'Mortgage', etc.
  ownerId: string;
}

export interface IncomeSource {
  id: string;
  name: string;
  amount: number; // Monthly Net
  ownerId: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'partner';
  netIncome: number; // Legacy total, kept for compat
  incomeSources: IncomeSource[];
}

export interface Household {
  id: string;
  name: string;
  joinCode?: string;
  members: UserProfile[];
  monthlySnapshots?: MonthlySnapshot[]; // Household-level tracking (owner maintains this)
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // ISO date
  category: 'home' | 'trip' | 'kids' | 'emergency' | 'other' | 'mortgage' | 'car' | 'general';
  isMain?: boolean;
  propertyValue?: number; // Full price of the property (for Home goals)
}

export interface MonthlySnapshot {
  month: string; // Format: YYYY-MM
  netWorth: number;
  totalCash: number;
  timestamp: string; // ISO date when snapshot was taken
}

export interface FinanceData {
  user: UserProfile | null;
  household: Household | null;
  
  accounts: Account[];
  recurringCosts: RecurringCost[];
  goals: Goal[];
  debts?: Debt[]; // Optional for backward compatibility
  
  // Global Settings
  emergencyFundGoal: number;
  isVariableIncome: boolean; // New field for Emergency Fund logic
  currency: string;
  theme: 'light' | 'dark' | 'system';
  
  // Legacy/Shim for existing components until full refactor
  variableSpending: number;
  
  // Market Data
  marketData: MarketData;
  
  // Historical Snapshots (DEPRECATED - now stored in household.monthlySnapshots)
  // Kept for backward compatibility during migration
  monthlySnapshots?: MonthlySnapshot[];
  
  // Email verification status
  isEmailVerified?: boolean;
}

const defaultData: FinanceData = {
  user: null, 
  household: null,
  accounts: [],
  recurringCosts: [],
  goals: [],
  debts: [],
  emergencyFundGoal: 10000,
  isVariableIncome: false,
  currency: 'EUR',
  theme: 'light',
  variableSpending: 0,
  marketData: DEFAULT_MARKET_DATA,
  monthlySnapshots: []
};

// 🧪 Load mock data for Figma Make preview
const figmaMockData: FinanceData = {
  ...defaultData,
  user: {
    id: "demo",
    name: "Ricardo",
    email: "demo@example.com",
    role: "owner",
    netIncome: 4300,
    incomeSources: [
      { id: "inc1", name: "Salário", amount: 3500, ownerId: "demo" },
      { id: "inc2", name: "Freelance", amount: 800, ownerId: "demo" }
    ]
  },
  household: {
    id: "demo-house",
    name: "Fonseca Household",
    members: [],
    monthlySnapshots: []
  },
  goals: [
    {
      id: "g1",
      name: "House",
      targetAmount: 150000,
      currentAmount: 43103,
      deadline: "2028-01-01",
      category: "mortgage",
      isMain: true,
      propertyValue: 500000
    }
  ],
  accounts: [
    { id: "acc1", name: "Checking Account", balance: 15000, type: "cash", institution: "Imagin", currency: "EUR", ownerId: "demo", includeInHousehold: true },
    { id: "acc2", name: "Savings", balance: 28103, type: "savings", institution: "Imagin", currency: "EUR", ownerId: "demo", includeInHousehold: true, apy: 2.5 }
  ],
  recurringCosts: [
    { id: "rc1", name: "Rent", amount: 900, category: "housing", ownerId: "demo", includeInHousehold: true },
    { id: "rc2", name: "Netflix", amount: 15.99, category: "entertainment", ownerId: "demo", includeInHousehold: true }
  ],
  emergencyFundGoal: 15000
};

// Dev initial state - cleaned for production readiness
const devInitialData: FinanceData = {
  ...defaultData,
};

interface FinanceContextType {
  data: FinanceData;
  updateData: (newData: Partial<FinanceData>) => void;
  resetData: () => void;
  
  // Auth Actions
  login: (email: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  createHousehold: (name: string) => Promise<void>;
  joinHousehold: (code: string) => Promise<void>;
  enterHousehold: (household: Household) => Promise<void>;
  leaveHousehold: () => void;
  
  // CRUD Helpers
  addAccount: (account: Omit<Account, 'id'>) => void;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  
  addRecurringCost: (cost: Omit<RecurringCost, 'id'>) => void;
  updateRecurringCost: (id: string, updates: Partial<RecurringCost>) => void;
  deleteRecurringCost: (id: string) => void;
  
  addGoal: (goal: Omit<Goal, 'id' | 'currentAmount'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  
  // Income Helpers
  addIncomeSource: (source: Omit<IncomeSource, 'id'>) => void;
  updateIncomeSource: (id: string, updates: Partial<IncomeSource>) => void;
  deleteIncomeSource: (id: string) => void;

  // View Mode
  viewMode: 'household' | 'personal';
  setViewMode: (mode: 'household' | 'personal') => void;

  // Initialization State
  isInitialized: boolean;

  // Computations
  getHouseholdIncome: () => number;
  getPersonalTotalIncome: () => number;
  getHouseholdSavings: () => number;
  getHouseholdFixedCosts: () => number;
  getPersonalNetWorth: () => number;
  getHouseholdNetWorth: () => number;
  getHouseholdTotalCash: () => number;
  getWeightedInvestmentReturn: () => number;
  getMonthlyComparison: () => { percentChange: number; hasData: boolean; previousNetWorth?: number; currentNetWorth?: number };
  
  checkServerHousehold: () => Promise<{ found: boolean; household?: Household }>;
  
  // Household Management
  updateHouseholdMember: (memberId: string, updates: { role?: 'owner' | 'partner', action?: 'remove' }) => Promise<void>;
  updateHouseholdSettings: (settings: { name: string }) => Promise<void>;
  
  // Manual data refresh
  refreshData: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 🎇 Auto-detect Figma Make preview mode
  const [data, setData] = useState<FinanceData>(defaultData);
  const [isInitialized, setIsInitialized] = useState(false);
  const [viewMode, setViewMode] = useState<'household' | 'personal'>('household');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 🧪 Load mock data for Figma Make preview
  useEffect(() => {
      if (isFigmaPreview) {
          console.log("🎨 Loading comprehensive mock data for Figma Make preview");
          const previewData = transformPreviewDataToFinanceData();
          setData(previewData);
          setIsInitialized(true);
          return;
      }
  }, [isFigmaPreview]);

  // Fetch BDE Data on mount
  useEffect(() => {
      // Skip in Figma preview
      if (isFigmaPreview) return;
      
      const loadMarketData = async () => {
          const marketData = await fetchBDEMarketData();
          setData(prev => ({ ...prev, marketData }));
      };
      
      const isStale = data.marketData.lastUpdated 
         ? (new Date().getTime() - new Date(data.marketData.lastUpdated).getTime() > 24 * 60 * 60 * 1000)
         : true;

      if (isStale || data.marketData.source === 'SIMULATED') {
           loadMarketData();
      }
  }, [isInitialized]);

  // Theme Handling
  useEffect(() => {
    const root = window.document.documentElement;
    
    const applyTheme = (theme: 'light' | 'dark' | 'system') => {
        root.classList.remove('light', 'dark');
        
        if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            root.classList.add(systemTheme);
        } else {
            root.classList.add(theme);
        }
    };

    applyTheme(data.theme);

    if (data.theme === 'system') {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => applyTheme('system');
        
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [data.theme]);

  // Monthly Snapshot Tracking (Household-level, Owner only)
  const snapshotTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
      if (!isInitialized || !data.user || !data.household) return;
      
      // Only the household owner should track/update snapshots
      const isOwner = data.user.role === 'owner';
      if (!isOwner) return;
      
      const updateMonthlySnapshot = () => {
          const now = new Date();
          const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
          
          const netWorth = getHouseholdNetWorth();
          const totalCash = getHouseholdTotalCash();
          
          // Debounce snapshot updates to avoid excessive saves
          if (snapshotTimeoutRef.current) clearTimeout(snapshotTimeoutRef.current);
          snapshotTimeoutRef.current = setTimeout(() => {
              setData(prev => {
                  if (!prev.household) return prev;
                  
                  const snapshots = prev.household.monthlySnapshots || [];
                  const existingSnapshotIndex = snapshots.findIndex(s => s.month === currentMonth);
                  
                  const newSnapshot: MonthlySnapshot = {
                      month: currentMonth,
                      netWorth,
                      totalCash,
                      timestamp: now.toISOString()
                  };
                  
                  let updatedSnapshots: MonthlySnapshot[];
                  if (existingSnapshotIndex >= 0) {
                      // Update existing snapshot for current month
                      updatedSnapshots = [...snapshots];
                      updatedSnapshots[existingSnapshotIndex] = newSnapshot;
                  } else {
                      // Add new snapshot
                      updatedSnapshots = [...snapshots, newSnapshot];
                  }
                  
                  // Keep only last 12 months of snapshots
                  updatedSnapshots.sort((a, b) => b.month.localeCompare(a.month));
                  updatedSnapshots = updatedSnapshots.slice(0, 12);
                  
                  const next = { 
                      ...prev, 
                      household: {
                          ...prev.household,
                          monthlySnapshots: updatedSnapshots
                      }
                  };
                  
                  // Save to server after updating snapshots
                  if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
                  saveTimeoutRef.current = setTimeout(() => saveToServer(next), 2000);
                  
                  return next;
              });
          }, 500); // Debounce snapshot calculation by 500ms
      };
      
      // Update snapshot whenever accounts change
      updateMonthlySnapshot();
  }, [data.accounts, data.user, data.household, isInitialized]);

  // ... Server Sync Helpers ...

  const saveToServer = async (currentData: FinanceData) => {
      // 🎇 Skip server sync in Figma Make preview
      if (isFigmaPreview) {
          console.warn("⏭️ Skipping server sync (Figma Make preview)");
          return;
      }
      
      if (!currentData.user) return;
      
      // Filter to only save items owned by this user
      // This prevents overwriting other members' data with stale copies
      const ownedAccounts = currentData.accounts.filter(a => a.ownerId === currentData.user?.id);
      const ownedCosts = currentData.recurringCosts.filter(c => c.ownerId === currentData.user?.id);
      
      // Goals are shared for now (improvements needed for specific ownership)
      
      const { marketData, household, monthlySnapshots, ...rest } = currentData;
      
      // User's finance data should NOT contain household object
      const dataToSave = {
          ...rest,
          accounts: ownedAccounts,
          recurringCosts: ownedCosts
      };

      try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.access_token) throw new Error("No active session");

          // 1. Save user's personal finance data
          await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-d9780f4d/finance/save`, {
              method: 'POST',
              headers: authHeaders(session.access_token),
              body: JSON.stringify({
                  userId: currentData.user.id,
                  data: dataToSave
              })
          });
          
          // 2. If user is the household owner, save household data separately
          if (currentData.household && currentData.user.role === 'owner') {
              await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-d9780f4d/household/save`, {
                  method: 'POST',
                  headers: authHeaders(session.access_token),
                  body: JSON.stringify({
                      userId: currentData.user.id,
                      household: currentData.household
                  })
              });
          }
          
          // console.log("Data synced to cloud");
      } catch (e) {
          console.error("Failed to sync to server", e);
      }
  };

  const loadFromServer = async (userId: string, options = { skipHousehold: false }) => {
      // 🎇 Skip server load in Figma Make preview
      if (isFigmaPreview) {
          console.warn("⏭️ Figma preview = skipping server load");
          return;
      }
      
      try {
          console.log("🔍 Step 1: Getting session...");
          
          // Get a fresh session (this will auto-refresh if needed)
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
              console.error("❌ Session error:", sessionError);
              toast.error("Session error - please log in again");
              return;
          }
          
          if (!session) {
              console.error("❌ No session found");
              toast.error("No active session - please log in");
              return;
          }
          
          if (!session.access_token) {
              console.error("❌ Session exists but no access token");
              toast.error("Invalid session - please log in again");
              return;
          }

          console.log(`✅ Step 2: Session valid, token length: ${session.access_token.length}`);
          console.log(`🔑 Token preview: ${session.access_token.substring(0, 30)}...`);
          console.log(`👤 Session user: ${session.user?.id}`);
          console.log(`⏰ Token expires at: ${new Date(session.expires_at! * 1000).toISOString()}`);

          console.log(`📥 Step 3: Loading data from server for user: ${userId}`);

          const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-d9780f4d/finance/load-household/${userId}`, {
               method: 'GET',
               headers: authHeaders(session.access_token)
          });
          
          console.log(`📡 Step 4: Response status: ${response.status}`);
          
          if (response.ok) {
              const { found, data: serverData } = await response.json();
              console.log(`📊 Server data loaded:`, {
                  found,
                  hasUser: !!serverData?.user,
                  hasHousehold: !!serverData?.household,
                  accountsCount: serverData?.accounts?.length || 0,
                  incomeSourcesCount: serverData?.user?.incomeSources?.length || 0,
                  recurringCostsCount: serverData?.recurringCosts?.length || 0,
                  debtsCount: serverData?.debts?.length || 0,
                  goalsCount: serverData?.goals?.length || 0
              });
              
              if (found && serverData) {
                   setData(prev => {
                       // Security: Ensure we don't overwrite the authenticated user identity 
                       // with potential stale data from the server blob
                       const mergedUser = prev.user ? {
                           ...serverData.user,
                           // Force keep the auth session identity
                           id: prev.user.id,
                           email: prev.user.email,
                           name: prev.user.name
                       } : serverData.user;

                       console.log(`✅ Updating context with server data`);

                       return { 
                           ...prev,
                           ...serverData,
                           user: mergedUser,
                           // Don't auto-set household - require explicit user action
                           household: options.skipHousehold ? null : serverData.household,
                           // Keep local market data
                           marketData: prev.marketData 
                       };
                   });
                   toast.success("Data refreshed from server");
              } else {
                  console.warn(`⚠️ No data found on server for user ${userId}`);
                  toast.info("No data found on server - starting fresh");
              }
          } else {
              const errorText = await response.text();
              console.error(`❌ Failed to load from server: ${response.status}`, errorText);
              toast.error(`Failed to load data: ${response.status}`);
          }
      } catch (e) {
          console.error("❌ Exception in loadFromServer:", e);
          toast.error("Failed to load data from server");
      }
  };

  const updateData = (newData: Partial<FinanceData>) => {
    setData(prev => {
        const next = { ...prev, ...newData };
        
        // Debounce save to server
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => {
            saveToServer(next);
        }, 2000); // 2 second debounce
        
        return next;
    });
  };

  const resetData = () => {
    setData(defaultData);
    localStorage.removeItem('finance_data_v3');
  };
  
  // Clear sensitive user data but keep app settings
  const clearUserData = () => {
      setData(prev => ({
          ...defaultData,
          user: null,
          household: null,
          accounts: [],
          recurringCosts: [],
          goals: [],
          theme: prev.theme,
          marketData: prev.marketData
      }));
      // We do NOT delete the namespaced data on logout, to support offline multi-user switching.
      // localStorage.removeItem('finance_data_v3'); 
  };
  
  // Supabase Auth Listener
  useEffect(() => {
      // Skip auth listener in Figma preview
      if (isFigmaPreview) return;
      
      supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.user) {
             // Handled by onAuthStateChange below
          } else {
             setIsInitialized(true);
          }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session?.user) {
              // Check email verification status
              const isEmailVerified = !!session.user.email_confirmed_at;
              
              // User authenticated - Load strictly from server (No Local Storage)
              setData(prev => {
                  // If user ID hasn't changed, don't trigger reload (session refresh)
                  if (prev.user?.id === session.user.id) {
                      console.log("Auth state change detected but user ID unchanged - keeping existing data");
                      // Update email verification status even on session refresh
                      return { ...prev, isEmailVerified };
                  }
                  
                  // New user login - Initialize with authenticated user but EMPTY data until server responds
                  console.log("New user detected - initializing with empty data");
                  return { 
                      ...defaultData, 
                      theme: prev.theme,
                      marketData: prev.marketData,
                      isEmailVerified,
                      user: {
                          id: session.user.id,
                          name: session.user.user_metadata.name || 'User',
                          email: session.user.email || '',
                          role: 'owner',
                          netIncome: 0,
                          incomeSources: []
                      }
                  };
              });
              
              // Only load server data if this is a NEW user (not a session refresh)
              setData(prev => {
                  if (prev.user?.id !== session.user.id) {
                      setIsInitialized(true);
                      // Load server data for this user but skip household - user must choose explicitly
                      loadFromServer(session.user.id, { skipHousehold: true });
                  } else {
                      setIsInitialized(true);
                  }
                  return prev;
              });
              
          } else {
              // Logged out or session expired
              clearUserData();
              setIsInitialized(true);
          }
      });
      return () => subscription.unsubscribe();
  }, []);

  // Auth Actions
  const login = async (email: string, password?: string) => {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password: password || ''
    });
    
    if (error) throw error;
    
    // Block unconfirmed users at login
    if (authData.user && !authData.user.email_confirmed_at) {
      // Sign them out immediately
      await supabase.auth.signOut();
      throw new Error('Please confirm your email before logging in. Check your inbox for the verification link.');
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    clearUserData();
  };

  const createHousehold = async (name: string) => {
    if (!data.user) return;
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) throw new Error("No active session");

        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-d9780f4d/household/create`, {
            method: 'POST',
            headers: authHeaders(session.access_token),
            body: JSON.stringify({
                name,
                userId: data.user.id,
                userName: data.user.name,
                userEmail: data.user.email
            })
        });
        
        if (!response.ok) {
             const err = await response.json();
             console.error("Failed to create household:", err);
             return;
        }
        
        const newHousehold = await response.json();
        setData(prev => ({ ...prev, household: newHousehold }));
    } catch (e) {
        console.error("Error creating household:", e);
    }
  };

  const joinHousehold = async (code: string) => {
      if (!data.user) return;
      const cleanCode = code.trim().toUpperCase();
      if (!cleanCode) return;
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) throw new Error("No active session");

        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-d9780f4d/household/join`, {
            method: 'POST',
            headers: authHeaders(session.access_token),
            body: JSON.stringify({
                joinCode: cleanCode,
                userId: data.user.id,
                userName: data.user.name,
                userEmail: data.user.email
            })
        });
        
        if (!response.ok) {
             const err = await response.json();
             console.error("Failed to join household:", err);
             throw new Error(err.error || "Failed to join");
        }
        
        const household = await response.json();
        setData(prev => ({ ...prev, household: household }));
    } catch (e) {
        console.error("Error joining household:", e);
        throw e; 
    }
  };

  const enterHousehold = async (household: Household) => {
      if (!data.user) return;
      
      try {
          // Set the household in context
          setData(prev => ({ ...prev, household }));
          
          // Load full household data including accounts, costs, goals
          await loadFromServer(data.user.id, { skipHousehold: false });
      } catch (e) {
          console.error("Error entering household:", e);
          throw e;
      }
  };

  const leaveHousehold = () => {
      // Clear household but keep user data
      setData(prev => ({
          ...prev,
          household: null,
          accounts: [],
          recurringCosts: [],
          goals: []
      }));
      toast.success("Left household. You can now join or create a new one.");
  };

  const checkServerHousehold = async () => {
      if (!data.user) return { found: false };
      try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!session?.access_token) {
              console.error("Cannot check household: No active session");
              return { found: false };
          }

          const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-d9780f4d/household/user/${data.user.id}`, {
              method: 'GET',
              headers: authHeaders(session.access_token)
          });
          
          if (!response.ok) return { found: false };
          
          const result = await response.json();
          return result;
      } catch (e) {
          console.error("Error checking household:", e);
          return { found: false };
      }
  };

  const updateHouseholdMember = async (memberId: string, updates: { role?: 'owner' | 'partner', action?: 'remove' }) => {
      if (!data.user || !data.household) return;
      
      try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.access_token) throw new Error("No active session");

          const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-d9780f4d/household/member`, {
              method: 'POST',
              headers: authHeaders(session.access_token),
              body: JSON.stringify({
                  requesterId: data.user.id,
                  householdId: data.household.id,
                  targetMemberId: memberId,
                  ...updates
              })
          });

          if (!response.ok) {
              const err = await response.json();
              throw new Error(err.error || "Failed to update member");
          }

          // Refetch all data to ensure we don't lose merged member details (like net income)
          // because the response only contains the raw household object
          await loadFromServer(data.user.id);
          
          if (updates.action === 'remove' && memberId === data.user.id) {
              // User removed themselves
              toast.success("You have left the household");
              // reload or reset logic?
          } else {
              toast.success("Household updated successfully");
          }

      } catch (e) {
          console.error("Error updating household member:", e);
          toast.error("Failed to update member");
          throw e;
      }
  };

  const updateHouseholdSettings = async (settings: { name: string }) => {
      if (!data.user || !data.household) return;
      try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.access_token) throw new Error("No active session");

          const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-d9780f4d/household/update`, {
              method: 'POST',
              headers: authHeaders(session.access_token),
              body: JSON.stringify({
                  requesterId: data.user.id,
                  householdId: data.household.id,
                  name: settings.name
              })
          });

          if (!response.ok) {
              const err = await response.json();
              throw new Error(err.error || "Failed to update household");
          }

          const updatedHousehold = await response.json();
          setData(prev => ({ ...prev, household: updatedHousehold }));
          toast.success("Household updated");

      } catch (e) {
          console.error("Error updating household:", e);
          toast.error("Failed to update household");
          throw e;
      }
  };

  // Helper to mutate state and schedule a server save
  const mutateAndSave = (modifier: (prev: FinanceData) => FinanceData) => {
      setData(prev => {
          const next = modifier(prev);
          if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
          // Save after 1 second to debounce typing, but ensure it saves
          saveTimeoutRef.current = setTimeout(() => saveToServer(next), 1000);
          return next;
      });
  };

  // CRUD Helpers
  const addAccount = (account: Omit<Account, 'id'>) => {
      const newAccount: Account = { ...account, id: crypto.randomUUID() };
      mutateAndSave(prev => ({ ...prev, accounts: [...prev.accounts, newAccount] }));
  };
  
  const updateAccount = (id: string, updates: Partial<Account>) => {
      mutateAndSave(prev => ({
          ...prev,
          accounts: prev.accounts.map(a => a.id === id ? { ...a, ...updates } : a)
      }));
  };
  
  const deleteAccount = (id: string) => {
      mutateAndSave(prev => ({
          ...prev,
          accounts: prev.accounts.filter(a => a.id !== id)
      }));
  };

  const addRecurringCost = (cost: Omit<RecurringCost, 'id'>) => {
      const newCost: RecurringCost = { ...cost, id: crypto.randomUUID() };
      mutateAndSave(prev => ({ ...prev, recurringCosts: [...prev.recurringCosts, newCost] }));
  };

  const updateRecurringCost = (id: string, updates: Partial<RecurringCost>) => {
      mutateAndSave(prev => ({
          ...prev,
          recurringCosts: prev.recurringCosts.map(c => c.id === id ? { ...c, ...updates } : c)
      }));
  };

  const deleteRecurringCost = (id: string) => {
      mutateAndSave(prev => ({
          ...prev,
          recurringCosts: prev.recurringCosts.filter(c => c.id !== id)
      }));
  };
  
  const addGoal = (goal: Omit<Goal, 'id' | 'currentAmount'>) => {
      const newGoal: Goal = { ...goal, id: crypto.randomUUID(), currentAmount: 0, isMain: goal.isMain || false };
      mutateAndSave(prev => ({ ...prev, goals: [...prev.goals, newGoal] }));
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
      mutateAndSave(prev => ({
          ...prev,
          goals: prev.goals.map(g => g.id === id ? { ...g, ...updates } : g)
      }));
  };

  const deleteGoal = (id: string) => {
      mutateAndSave(prev => ({
          ...prev,
          goals: prev.goals.filter(g => g.id !== id)
      }));
  };

  // Income Helpers
  const addIncomeSource = (source: Omit<IncomeSource, 'id'>) => {
      mutateAndSave(prev => {
          if (!prev.user) return prev;
          const newSource: IncomeSource = { ...source, id: crypto.randomUUID() };
          
          // Update User
          const updatedUser = { 
              ...prev.user, 
              incomeSources: [...prev.user.incomeSources, newSource] 
          };
          // Update legacy netIncome total
          updatedUser.netIncome = updatedUser.incomeSources.reduce((sum, s) => sum + s.amount, 0);

          // Sync with household members
          let updatedHousehold = prev.household;
          if (prev.household && prev.household.members) {
              updatedHousehold = {
                  ...prev.household,
                  members: prev.household.members.map(m => 
                      m.id === updatedUser.id ? updatedUser : m
                  )
              };
          }

          return { ...prev, user: updatedUser, household: updatedHousehold };
      });
  };

  const updateIncomeSource = (id: string, updates: Partial<IncomeSource>) => {
      mutateAndSave(prev => {
          if (!prev.user) return prev;
          const updatedSources = prev.user.incomeSources.map(s => s.id === id ? { ...s, ...updates } : s);
          const updatedUser = {
              ...prev.user,
              incomeSources: updatedSources,
              netIncome: updatedSources.reduce((sum, s) => sum + s.amount, 0)
          };

          // Sync with household members
          let updatedHousehold = prev.household;
          if (prev.household && prev.household.members) {
              updatedHousehold = {
                  ...prev.household,
                  members: prev.household.members.map(m => 
                      m.id === updatedUser.id ? updatedUser : m
                  )
              };
          }

          return { ...prev, user: updatedUser, household: updatedHousehold };
      });
  };

  const deleteIncomeSource = (id: string) => {
      mutateAndSave(prev => {
          if (!prev.user) return prev;
          const updatedSources = prev.user.incomeSources.filter(s => s.id !== id);
          const updatedUser = {
              ...prev.user,
              incomeSources: updatedSources,
              netIncome: updatedSources.reduce((sum, s) => sum + s.amount, 0)
          };

          // Sync with household members
          let updatedHousehold = prev.household;
          if (prev.household && prev.household.members) {
              updatedHousehold = {
                  ...prev.household,
                  members: prev.household.members.map(m => 
                      m.id === updatedUser.id ? updatedUser : m
                  )
              };
          }

          return { ...prev, user: updatedUser, household: updatedHousehold };
      });
  };


  // Computations
  const getPersonalTotalIncome = () => {
      if (!data.user) return 0;
      if (data.user.incomeSources && data.user.incomeSources.length > 0) {
           return data.user.incomeSources.reduce((sum, s) => sum + Number(s.amount || 0), 0);
      }
      return Number(data.user.netIncome) || 0;
  };

  const getHouseholdIncome = () => {
    // Always return the sum of all household members, regardless of viewMode.
    if (!data.household || !data.household.members) {
        return getPersonalTotalIncome();
    }
    
    return data.household.members.reduce((sum, member) => {
        const userToUse = (member.id === data.user?.id) ? data.user : member;
        if (!userToUse) return sum;
        
        if (userToUse.incomeSources && userToUse.incomeSources.length > 0) {
             return sum + userToUse.incomeSources.reduce((s, source) => s + Number(source.amount || 0), 0);
        }
        return sum + (Number(userToUse.netIncome) || 0);
    }, 0);
  };

  const getHouseholdSavings = () => {
     const targetAccounts = viewMode === 'personal' 
        ? data.accounts.filter(acc => acc.ownerId === data.user?.id)
        : data.accounts.filter(acc => acc.includeInHousehold);
        
     return targetAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  };

  const getHouseholdFixedCosts = () => {
      const targetCosts = viewMode === 'personal'
        ? data.recurringCosts.filter(c => c.ownerId === data.user?.id)
        : data.recurringCosts.filter(c => c.includeInHousehold);
      
      return targetCosts.reduce((sum, c) => sum + c.amount, 0);
  };
  
  const getPersonalNetWorth = () => {
      if (!data.user) return 0;
      return data.accounts
        .filter(acc => acc.ownerId === data.user?.id)
        .reduce((sum, acc) => sum + acc.balance, 0);
  };

  const getHouseholdNetWorth = () => {
      const targetAccounts = viewMode === 'personal' 
        ? data.accounts.filter(acc => acc.ownerId === data.user?.id)
        : data.accounts.filter(acc => acc.includeInHousehold);

      const assets = targetAccounts
          .filter(a => a.type !== 'debt')
          .reduce((sum, a) => sum + a.balance, 0);
      const liabilities = targetAccounts
          .filter(a => a.type === 'debt')
          .reduce((sum, a) => sum + a.balance, 0);
      return assets - liabilities;
  };

  const getHouseholdTotalCash = () => {
      const targetAccounts = viewMode === 'personal' 
        ? data.accounts.filter(acc => acc.ownerId === data.user?.id)
        : data.accounts.filter(acc => acc.includeInHousehold);
        
      return targetAccounts
          .filter(a => (a.type === 'cash' || a.type === 'savings'))
          .reduce((sum, a) => sum + a.balance, 0);
  }

  const getWeightedInvestmentReturn = () => {
      const householdAccounts = viewMode === 'personal' 
        ? data.accounts.filter(acc => acc.ownerId === data.user?.id)
        : data.accounts.filter(acc => acc.includeInHousehold);
        
      const totalBalance = householdAccounts.reduce((sum, a) => sum + a.balance, 0);
      
      if (totalBalance === 0) return 0;

      const weightedSum = householdAccounts.reduce((sum, a) => {
          const rate = a.apy || 0;
          return sum + (a.balance * rate);
      }, 0);
      
      return weightedSum / totalBalance;
  }

  const getMonthlyComparison = () => {
      // Read from household snapshots (new) with fallback to user-level (legacy)
      const snapshots = data.household?.monthlySnapshots || data.monthlySnapshots || [];
      
      if (snapshots.length === 0) return { percentChange: 0, hasData: false };
      
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthStr = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;
      
      const lastMonthSnapshot = snapshots.find(s => s.month === lastMonthStr);
      
      if (!lastMonthSnapshot) return { percentChange: 0, hasData: false };
      
      const currentNetWorth = getHouseholdNetWorth();
      const previousNetWorth = lastMonthSnapshot.netWorth;
      
      if (previousNetWorth === 0) return { percentChange: 0, hasData: true };
      
      const percentChange = ((currentNetWorth - previousNetWorth) / Math.abs(previousNetWorth)) * 100;
      
      return { 
          percentChange, 
          hasData: true,
          previousNetWorth,
          currentNetWorth
      };
  }

  const refreshData = async () => {
      if (!data.user) return;
      await loadFromServer(data.user.id);
  };

  return (
    <FinanceContext.Provider value={{ 
        data, 
        updateData, 
        resetData, 
        login, 
        logout, 
        createHousehold, 
        joinHousehold,
        enterHousehold,
        leaveHousehold,
        addAccount,
        updateAccount,
        deleteAccount,
        addRecurringCost,
        updateRecurringCost,
        deleteRecurringCost,
        addGoal,
        updateGoal,
        deleteGoal,
        addIncomeSource,
        updateIncomeSource,
        deleteIncomeSource,
        getHouseholdIncome,
        getPersonalTotalIncome,
        getHouseholdSavings,
        getHouseholdFixedCosts,
        getPersonalNetWorth,
        getHouseholdNetWorth,
        getHouseholdTotalCash,
        getWeightedInvestmentReturn,
        getMonthlyComparison,
        checkServerHousehold,
        updateHouseholdMember,
        updateHouseholdSettings,
        viewMode,
        setViewMode,
        isInitialized,
        refreshData
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) throw new Error("useFinance must be used within FinanceProvider");
  return context;
};