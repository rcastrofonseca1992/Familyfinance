# Figma Make Preview Module

Isolated UI preview system with mock data for Family Finance Dashboard.

---

## 🎯 What This Is

A **fully isolated preview environment** that provides:
- ✅ Pure UI components safe for Figma Make regeneration
- ✅ Complete mock data system (no Supabase calls)
- ✅ Production-ready components you can import
- ✅ Proper separation between UI and business logic

---

## 🚀 Quick Start

### Import Components
```typescript
import { DashboardPage, GoalCard, type Goal } from '@/app/exports';

<DashboardPage 
  goals={myGoals} 
  accounts={myAccounts} 
  debts={myDebts} 
/>
```

### Import Logic (Production Only)
```typescript
import { finance, auth, helpers } from '@/app/exports';

// Calculate compound interest
const result = finance.calculateCompoundInterest(
  10000,  // principal
  500,    // monthly contribution
  7,      // annual rate %
  60      // months
);

// Validate email
const valid = helpers.isValidEmail('user@example.com');
```

### Use Mock Data
```typescript
import { mockGoals, mockAccounts } from '@/app/exports';

<GoalCard goal={mockGoals[0]} />
```

---

## 📂 Structure

```
/src/app/
├── app.config.ts          # Mode detection & configuration
├── logic/                 # Production logic (NOT in preview)
│   ├── finance.ts        # Financial calculations
│   ├── supabase.ts       # Database operations
│   ├── auth.ts           # Authentication
│   ├── networth.ts       # Net worth calculations
│   └── helpers.ts        # Utilities
├── components/            # Pure UI components
├── pages/                 # Full page layouts
├── preview/               # Mock system for preview mode
├── exports.ts             # Public API
└── USAGE_GUIDE.md        # Complete documentation
```

---

## 🔒 Key Principle

**Separation of Concerns:**
- **UI Components** (`/components/`, `/pages/`) → Figma Make safe
- **Business Logic** (`/logic/`) → Production only, never executed in preview
- **Mock System** (`/preview/`) → Preview mode only

---

## 📚 Full Documentation

See [USAGE_GUIDE.md](./USAGE_GUIDE.md) for:
- Complete API reference
- Integration examples
- Testing strategies
- Architecture details
- Best practices

---

## ⚙️ Mode Detection

The system automatically detects if running in preview or production:

```typescript
import { IS_PREVIEW, FEATURES } from '@/app/exports';

if (IS_PREVIEW) {
  // Preview: Use mock data
} else {
  // Production: Use real Supabase
}
```

**Preview Mode** (inside Figma Make iframe):
- ✅ Mock data
- ✅ No network calls
- ✅ Dev utilities in console

**Production Mode** (standalone):
- ✅ Real authentication
- ✅ Real database
- ✅ RLS policies enforced

---

## 🧪 Available Exports

### Components
- `GoalCard`, `AccountCard`, `DebtCard`, `IncomeCard`, `FixedCostCard`

### Pages
- `DashboardPage`, `GoalsPage`, `PersonalFinancePage`

### Logic (Production Only)
- `finance` - Financial calculations
- `supabase` - Database operations
- `auth` - Authentication
- `networth` - Net worth calculations
- `helpers` - Utilities

### Types
- `Goal`, `Account`, `Debt`, `Income`, `FixedCost`, `Transaction`, `User`, `Household`

### Mock Data
- `mockGoals`, `mockAccounts`, `mockDebts`, `mockIncomes`, `mockFixedCosts`

### Configuration
- `IS_PREVIEW`, `APP_MODE`, `FEATURES`, `API_CONFIG`

---

## 🎨 Usage Example

```typescript
import { 
  DashboardPage, 
  type Goal, 
  type Account,
  mockGoals,
  mockAccounts,
  IS_PREVIEW 
} from '@/app/exports';

function MyApp() {
  const [goals, setGoals] = useState<Goal[]>(
    IS_PREVIEW ? mockGoals : []
  );
  
  useEffect(() => {
    if (!IS_PREVIEW) {
      // Fetch real data in production
      fetchGoals().then(setGoals);
    }
  }, []);
  
  return (
    <DashboardPage
      goals={goals}
      accounts={mockAccounts}
      onGoalClick={(goal) => navigate(`/goals/${goal.id}`)}
    />
  );
}
```

---

## 🔧 Development

### Console Utilities (Preview Mode Only)
```javascript
// Available in browser console during preview
devUtils.logDatabaseState()      // View all mock data
devUtils.addTestGoal()            // Add test goal
devUtils.getFinancialSummary()   // Get summary
devUtils.resetDatabase()          // Reset to defaults
```

---

## ⚠️ Important Notes

1. **Never import logic in UI components** - Pass calculated values as props
2. **Logic files are production-only** - They never run in preview mode
3. **Safe to regenerate** - Figma Make only touches UI components
4. **Type-safe** - All components and functions are fully typed

---

## 🚀 Integration

### Step 1: Import what you need
```typescript
import { DashboardPage, finance, type Goal } from '@/app/exports';
```

### Step 2: Use in production
```typescript
// Calculate values outside component
const projectedValue = finance.calculateCompoundInterest(
  goal.currentAmount,
  goal.monthlyContribution,
  goal.expectedAPY,
  monthsRemaining
);

// Pass to component
<DashboardPage goals={goals} />
```

### Step 3: Done! ✅

---

**For complete documentation, see [USAGE_GUIDE.md](./USAGE_GUIDE.md)**
