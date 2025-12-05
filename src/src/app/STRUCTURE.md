# Figma Make - Complete File Structure

## 📁 Directory Tree

```
/src/app/                                    ← Root of all Figma Make code
│
├── components/                              ← Pure UI Components
│   ├── GoalCard.tsx                        ├─ Premium goal card with progress
│   ├── AccountCard.tsx                     ├─ Account overview card
│   ├── DebtCard.tsx                        ├─ Debt tracking card
│   ├── IncomeCard.tsx                      ├─ Income source card
│   └── FixedCostCard.tsx                   └─ Fixed cost/subscription card
│
├── pages/                                   ← Full Page Components
│   ├── DashboardPage.tsx                   ├─ Main overview page
│   ├── GoalsPage.tsx                       ├─ Goals list with filtering
│   └── PersonalFinancePage.tsx             └─ Income, accounts, costs, debts
│
├── preview/                                 ← Preview & Mock System
│   ├── AppPreview.tsx                      ├─ Main preview component
│   ├── types.ts                            ├─ TypeScript type definitions
│   ├── mockAuth.ts                         ├─ Authentication simulation
│   ├── mockDatabase.ts                     ├─ Database + API simulation
│   ├── mockSettings.ts                     ├─ Settings & navigation
│   ├── mockGoals.ts                        ├─ 6 sample goals (all categories)
│   ├── mockAccounts.ts                     ├─ 4 sample accounts
│   ├── mockDebts.ts                        ├─ 4 sample debts
│   ├── mockTransactions.ts                 ├─ Incomes, costs, transactions
│   ├── mockUser.ts                         ├─ User & household data
│   └── devUtils.ts                         └─ Development utilities
│
├── styles/                                  ← Preview-specific styles
│   └── README.txt                          └─ Points to /styles/globals.css
│
├── index.tsx                                ← Entry point (auto-detects iframe)
├── exports.ts                               ← Public API for easy imports
├── README.md                                ← Quick start guide
├── USAGE_GUIDE.md                           ← Complete documentation
└── STRUCTURE.md                             └─ This file
```

---

## 📊 Component Dependencies

### GoalCard
- **Props**: `goal: Goal`, `onClick?: () => void`
- **Imports**: Lucide icons, types
- **Used In**: DashboardPage, GoalsPage

### AccountCard
- **Props**: `account: Account`, `onClick?: () => void`
- **Imports**: Lucide icons, types
- **Used In**: DashboardPage, PersonalFinancePage

### DebtCard
- **Props**: `debt: Debt`, `onClick?: () => void`
- **Imports**: Lucide icons, types
- **Used In**: DashboardPage, PersonalFinancePage

### IncomeCard
- **Props**: `income: Income`, `onClick?: () => void`
- **Imports**: Lucide icons, types
- **Used In**: PersonalFinancePage

### FixedCostCard
- **Props**: `fixedCost: FixedCost`, `onClick?: () => void`
- **Imports**: Lucide icons, types
- **Used In**: PersonalFinancePage

---

## 📄 Page Dependencies

### DashboardPage
- **Props**: 
  - `goals: Goal[]`
  - `accounts: Account[]`
  - `debts: Debt[]`
  - `onGoalClick?: (goal: Goal) => void`
  - `onNavigate?: (page: string) => void`
- **Uses**: GoalCard
- **Features**: 
  - Net worth summary
  - Goals progress
  - Quick actions

### GoalsPage
- **Props**:
  - `goals: Goal[]`
  - `onGoalClick?: (goal: Goal) => void`
  - `onBack?: () => void`
- **Uses**: GoalCard
- **Features**:
  - Category filtering
  - Empty states
  - Add button

### PersonalFinancePage
- **Props**:
  - `accounts: Account[]`
  - `debts: Debt[]`
  - `incomes: Income[]`
  - `fixedCosts: FixedCost[]`
  - `onBack?: () => void`
- **Uses**: AccountCard, DebtCard, IncomeCard, FixedCostCard
- **Features**:
  - Collapsible sections
  - Financial flow calculation
  - Summary cards

---

## 🔄 Data Flow

```
┌─────────────────────────────────────────┐
│          Preview Mode (Iframe)          │
└─────────────────────────────────────────┘
                    ↓
         ┌──────────────────┐
         │   index.tsx      │  ← Detects iframe
         │ IS_PREVIEW=true  │
         └──────────────────┘
                    ↓
         ┌──────────────────┐
         │  AppPreview.tsx  │  ← Main component
         └──────────────────┘
                    ↓
         ┌──────────────────┐
         │ getMockDatabase()│  ← Load mock data
         └──────────────────┘
                    ↓
         ┌──────────────────┐
         │  Pages render    │  ← Pass mock data as props
         │  with mock data  │
         └──────────────────┘
                    ↓
         ┌──────────────────┐
         │ Components render│  ← Pure UI with props
         │  with props      │
         └──────────────────┘

┌─────────────────────────────────────────┐
│       Production Mode (Standalone)      │
└─────────────────────────────────────────┘
                    ↓
         ┌──────────────────┐
         │   index.tsx      │  ← Detects standalone
         │ IS_PREVIEW=false │
         └──────────────────┘
                    ↓
         ┌──────────────────┐
         │   /src/main.tsx  │  ← Real app loads
         └──────────────────┘
                    ↓
         ┌──────────────────┐
         │ Import Make      │  ← Import components
         │  components      │     from /src/app/
         └──────────────────┘
                    ↓
         ┌──────────────────┐
         │  Pages render    │  ← Pass real data from
         │  with real data  │     Supabase context
         └──────────────────┘
```

---

## 🗄️ Mock Database Schema

```typescript
MockDatabase {
  user: User | null                    // Current logged-in user
  household: Household | null          // User's household
  goals: Goal[]                        // 6 goals (all categories)
  accounts: Account[]                  // 4 accounts
  debts: Debt[]                        // 4 debts
  incomes: Income[]                    // 3 income sources
  fixedCosts: FixedCost[]             // 7 fixed costs
  transactions: Transaction[]          // Sample transactions
  settings: AppSettings                // Theme, language, etc.
}
```

### Mock API Methods

```typescript
mockAPI {
  // Goals
  getGoals()
  getGoal(id)
  createGoal(goal)
  updateGoal(id, updates)
  deleteGoal(id)
  
  // Accounts
  getAccounts()
  createAccount(account)
  updateAccount(id, updates)
  deleteAccount(id)
  
  // Debts
  getDebts()
  createDebt(debt)
  updateDebt(id, updates)
  deleteDebt(id)
  
  // Others
  getIncomes()
  getFixedCosts()
  getTransactions()
  getSettings()
  updateSettings(updates)
  getUser()
  updateUser(updates)
  getHousehold()
}
```

---

## 🎨 Design Patterns

### Component Pattern
```typescript
// All components follow this pattern:
interface ComponentProps {
  data: DataType;
  onClick?: () => void;
}

export const Component: React.FC<ComponentProps> = ({ data, onClick }) => {
  // Pure component - no side effects
  // No Supabase calls
  // No global state
  // Accept all data via props
  
  return (
    <div onClick={onClick}>
      {/* Render with data */}
    </div>
  );
};
```

### Page Pattern
```typescript
// All pages follow this pattern:
interface PageProps {
  data: DataType[];
  onAction?: (item: DataType) => void;
  onNavigate?: (page: string) => void;
  onBack?: () => void;
}

export const Page: React.FC<PageProps> = ({
  data,
  onAction,
  onNavigate,
  onBack,
}) => {
  // Local UI state only
  const [filter, setFilter] = useState('all');
  
  // Computed values
  const filteredData = /* ... */;
  
  return (
    <div>
      {/* Render page with components */}
    </div>
  );
};
```

---

## 🚀 Import Patterns

### Individual Component
```typescript
import { GoalCard } from './app/components/GoalCard';
```

### Individual Page
```typescript
import { DashboardPage } from './app/pages/DashboardPage';
```

### Type Only
```typescript
import type { Goal, Account } from './app/preview/types';
```

### Everything from Exports
```typescript
import {
  GoalCard,
  DashboardPage,
  type Goal,
  mockGoals,
} from './app/exports';
```

### Mock System
```typescript
import {
  getMockDatabase,
  mockAPI,
  createMockAuth,
} from './app/exports';
```

---

## 📦 Bundle Analysis

### Components (Small)
- GoalCard: ~2KB
- AccountCard: ~1KB
- DebtCard: ~1KB
- IncomeCard: ~1KB
- FixedCostCard: ~1KB

### Pages (Medium)
- DashboardPage: ~5KB
- GoalsPage: ~4KB
- PersonalFinancePage: ~6KB

### Preview System (Large, only in preview)
- AppPreview: ~5KB
- mockDatabase: ~3KB
- mockGoals: ~2KB
- mockAccounts: ~1KB
- mockDebts: ~1KB
- mockTransactions: ~2KB
- Other mocks: ~2KB

**Total Preview**: ~21KB (not included in production)  
**Total Components**: ~15KB (tree-shakeable in production)

---

## 🔧 Development Utilities

### Console Commands (Available in Preview Mode)

```javascript
// Log current state
devUtils.logDatabaseState()

// Financial summary
devUtils.getFinancialSummary()

// Add test data
devUtils.addTestGoal()
devUtils.addTestAccount()

// Clear data
devUtils.clearAllGoals()
devUtils.resetDatabase()

// Simulate states
devUtils.simulateLogout()
devUtils.simulateLogin()

// Toggle settings
devUtils.toggleTheme()
devUtils.toggleLanguage()
```

---

## 📝 File Sizes

```
components/
  GoalCard.tsx         2.1 KB
  AccountCard.tsx      1.4 KB
  DebtCard.tsx         1.5 KB
  IncomeCard.tsx       1.1 KB
  FixedCostCard.tsx    1.2 KB

pages/
  DashboardPage.tsx        5.3 KB
  GoalsPage.tsx            4.1 KB
  PersonalFinancePage.tsx  6.8 KB

preview/
  AppPreview.tsx       5.2 KB
  types.ts             2.8 KB
  mockAuth.ts          1.5 KB
  mockDatabase.ts      3.2 KB
  mockSettings.ts      1.3 KB
  mockGoals.ts         2.1 KB
  mockAccounts.ts      0.9 KB
  mockDebts.ts         1.1 KB
  mockTransactions.ts  2.3 KB
  mockUser.ts          0.6 KB
  devUtils.ts          2.9 KB

Root files:
  index.tsx            0.8 KB
  exports.ts           1.5 KB
  README.md            3.2 KB
  USAGE_GUIDE.md      12.8 KB
  STRUCTURE.md         8.5 KB

Total Size: ~72 KB
```

---

## 🎯 Quick Reference

| Need | File | Export |
|------|------|--------|
| Goal card | `/components/GoalCard.tsx` | `GoalCard` |
| Account card | `/components/AccountCard.tsx` | `AccountCard` |
| Dashboard | `/pages/DashboardPage.tsx` | `DashboardPage` |
| Types | `/preview/types.ts` | `Goal`, `Account`, etc. |
| Mock data | `/preview/mockGoals.ts` | `mockGoals` |
| Preview | `/preview/AppPreview.tsx` | `AppPreview` |
| All exports | `/exports.ts` | Everything |

---

**Generated by Figma Make**  
Version: 1.0.0  
Last Updated: December 5, 2024
