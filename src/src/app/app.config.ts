/**
 * App Configuration
 * 
 * Defines app mode (preview/production) and endpoints
 * Exposes configuration to Figma Make
 */

// Detect if running inside Figma Make iframe
export const IS_PREVIEW = typeof window !== 'undefined' && window.self !== window.top;

// App mode
export const APP_MODE = IS_PREVIEW ? 'preview' : 'production';

// API Configuration
export const API_CONFIG = {
  supabase: {
    // These are populated from /utils/supabase/info.tsx in production
    projectId: IS_PREVIEW ? 'preview-mode' : '',
    publicAnonKey: IS_PREVIEW ? 'preview-mode' : '',
  },
  endpoints: {
    server: IS_PREVIEW 
      ? '/mock-api' 
      : '/functions/v1/make-server-d9780f4d',
    goals: '/goals',
    accounts: '/accounts',
    debts: '/debts',
    incomes: '/incomes',
    fixedCosts: '/fixed-costs',
    transactions: '/transactions',
    household: '/household',
    user: '/user',
  },
};

// Feature Flags
export const FEATURES = {
  auth: !IS_PREVIEW,
  realDatabase: !IS_PREVIEW,
  rlsPolicies: !IS_PREVIEW,
  edgeFunctions: !IS_PREVIEW,
  storage: !IS_PREVIEW,
  devTools: IS_PREVIEW,
};

// Log current mode
if (typeof window !== 'undefined') {
  const banner = IS_PREVIEW
    ? `
╔═══════════════════════════════════════════════════╗
║       🎨 FIGMA MAKE PREVIEW MODE 🎨              ║
╠═══════════════════════════════════════════════════╣
║  ✓ Mock data active                              ║
║  ✓ No Supabase calls                             ║
║  ✓ Dev utils available                           ║
║  ✓ Safe to regenerate                            ║
╚═══════════════════════════════════════════════════╝
    `
    : `
╔═══════════════════════════════════════════════════╗
║       🔒 PRODUCTION MODE ACTIVE 🔒               ║
╠═══════════════════════════════════════════════════╣
║  ✓ Real Supabase auth required                   ║
║  ✓ Real database operations                      ║
║  ✓ RLS policies enforced                         ║
║  ✓ Strict authentication                         ║
╚═══════════════════════════════════════════════════╝
    `;
  
  console.log(banner);
}

// Export config object
export default {
  mode: APP_MODE,
  isPreview: IS_PREVIEW,
  api: API_CONFIG,
  features: FEATURES,
};
