/**
 * Figma Make Preview Mode Detection & Mock Data
 * 
 * This file provides utilities to detect when the app is running inside Figma Make
 * and provides mock data to bypass authentication and database calls.
 * 
 * CRITICAL: Never remove or modify this logic. Production auth must remain strict.
 */

// 1. Detect Figma Make preview mode
export const isFigmaPreview = (() => {
  try {
    return typeof window !== 'undefined' && window?.self !== window?.top; // in iframe → Figma Make
  } catch {
    return true; // iframe cross-origin → treat as preview mode
  }
})();

// 2. Mock User (always returned in preview mode)
export const mockUser = {
  id: "PREVIEW_USER",
  name: "Ricardo Fonseca",
  email: "preview@example.com",
  role: "owner" as const,
  netIncome: 4300,
  incomeSources: [
    { id: "inc1", name: "Salário", amount: 3500, ownerId: "PREVIEW_USER" },
    { id: "inc2", name: "Freelance", amount: 800, ownerId: "PREVIEW_USER" }
  ]
};

// 3. Mock Household
export const mockHousehold = {
  id: "PREVIEW_HH",
  name: "Fonseca Household",
  joinCode: "ABC123",
  members: [mockUser],
  monthlySnapshots: [
    { month: "2024-11", netWorth: 38500, totalCash: 40000, timestamp: "2024-11-01T00:00:00Z" },
    { month: "2024-12", netWorth: 43103, totalCash: 43103, timestamp: "2024-12-01T00:00:00Z" }
  ]
};

// 4. Mock Finance Data
export const mockFinanceData = {
  user: mockUser,
  household: mockHousehold,
  accounts: [
    { 
      id: "ACC1", 
      name: "Conta Ordenado", 
      balance: 15000, 
      type: "cash" as const, 
      institution: "Imagin",
      currency: "EUR",
      ownerId: "PREVIEW_USER", 
      includeInHousehold: true 
    },
    { 
      id: "ACC2", 
      name: "Conta Poupança", 
      balance: 28103, 
      type: "savings" as const, 
      institution: "Imagin",
      currency: "EUR",
      ownerId: "PREVIEW_USER", 
      includeInHousehold: true,
      apy: 2.5
    }
  ],
  recurringCosts: [
    { id: "C1", name: "Renda", amount: 900, category: "housing", ownerId: "PREVIEW_USER", includeInHousehold: true },
    { id: "C2", name: "Netflix", amount: 15.99, category: "entertainment", ownerId: "PREVIEW_USER", includeInHousehold: true },
    { id: "C3", name: "Ginásio", amount: 45, category: "health", ownerId: "PREVIEW_USER", includeInHousehold: true }
  ],
  debts: [
    { 
      id: "D1", 
      name: "Empréstimo Automóvel", 
      totalAmount: 12000,
      remainingAmount: 6200, 
      monthlyPayment: 280,
      interestRate: 4.5,
      ownerId: "PREVIEW_USER"
    }
  ],
  goals: [
    { 
      id: "G1", 
      name: "Casa Própria", 
      targetAmount: 150000, 
      currentAmount: 43103, 
      deadline: "2028-12-01", 
      category: "mortgage" as const,
      isMain: true,
      propertyValue: 500000
    },
    { 
      id: "G2", 
      name: "Viagem Japão", 
      targetAmount: 8000, 
      currentAmount: 2300, 
      deadline: "2026-06-01", 
      category: "trip" as const,
      isMain: false
    }
  ],
  emergencyFundGoal: 15000,
  isVariableIncome: false,
  currency: "EUR",
  theme: "light" as const,
  variableSpending: 0,
  monthlySnapshots: mockHousehold.monthlySnapshots
};

// 5. Safe user getter (returns mock in preview, real in production)
export async function getSafeUser() {
  if (isFigmaPreview) {
    console.log("🎨 Figma Preview Mode: Returning mock user");
    return mockUser;
  }

  // In production, attempt to get real user
  try {
    const { supabase } = await import('../lib/supabase');
    const { data } = await supabase.auth.getUser();
    return data?.user || null;
  } catch (err) {
    console.error("Failed to get user:", err);
    return null;
  }
}

// 6. Safe data loader (returns mock in preview, attempts real fetch in production)
export async function safeLoadData<T>(
  loader: () => Promise<T>,
  mockData: T,
  logPrefix: string = "Data"
): Promise<T> {
  if (isFigmaPreview) {
    console.log(`🎨 Figma Preview Mode: ${logPrefix} → using mock data`);
    return mockData;
  }

  try {
    return await loader();
  } catch (err) {
    console.error(`${logPrefix} load failed:`, err);
    // In production, throw the error (don't fall back to mock)
    throw err;
  }
}

// 7. Safe data saver (blocks writes in preview, allows in production)
export async function safeSaveData<T>(
  saver: () => Promise<T>,
  logPrefix: string = "Data"
): Promise<{ success: boolean; preview?: boolean; data?: T }> {
  if (isFigmaPreview) {
    console.warn(`⏭️ SAVE BLOCKED: ${logPrefix} → Preview mode cannot modify real data`);
    return { success: true, preview: true };
  }

  try {
    const data = await saver();
    return { success: true, data };
  } catch (err) {
    console.error(`${logPrefix} save failed:`, err);
    throw err;
  }
}

// 8. Export log message for debugging
export function logPreviewMode() {
  if (isFigmaPreview) {
    console.log(`
╔═══════════════════════════════════════════════════╗
║     🎨 FIGMA MAKE PREVIEW MODE ACTIVE 🎨         ║
╠═══════════════════════════════════════════════════╣
║  ✓ Auth bypassed (using mock user)               ║
║  ✓ Database bypassed (using mock data)           ║
║  ✓ All writes blocked (read-only preview)        ║
║  ✓ Full UI visible (no login required)           ║
╚═══════════════════════════════════════════════════╝
    `);
  } else {
    console.log(`
╔═══════════════════════════════════════════════════╗
║       🔒 PRODUCTION MODE ACTIVE 🔒               ║
╠═══════════════════════════════════════════════════╣
║  ✓ Real Supabase auth required                   ║
║  ✓ Real database operations                      ║
║  ✓ RLS policies enforced                         ║
║  ✓ Strict authentication                         ║
╚═══════════════════════════════════════════════════╝
    `);
  }
}

/**
 * CRITICAL RULES - NEVER REMOVE:
 * 
 * 1. Figma Preview Mode is MANDATORY for design workflow
 * 2. Production MUST always enforce real auth - NO EXCEPTIONS
 * 3. Never remove the detection logic, mocks, or safety blocks
 * 4. All components must check isFigmaPreview before auth checks
 * 5. All server calls must be wrapped with safe loaders/savers
 * 6. Mock data must be deterministic and representative
 * 7. Preview mode = READ ONLY (no writes to production)
 * 8. Production mode = STRICT AUTH (no bypass allowed)
 */
