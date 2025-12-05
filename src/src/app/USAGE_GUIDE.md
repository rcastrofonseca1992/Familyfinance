# Figma Make Usage Guide
## Family Finance Dashboard - Isolated Preview Environment

---

## 📁 Architecture Overview

```
/src/app/                          ← ALL Figma Make-generated code
  ├── components/                  ← Pure UI components
  │   ├── GoalCard.tsx
  │   ├── AccountCard.tsx
  │   ├── DebtCard.tsx
  │   ├── IncomeCard.tsx
  │   └── FixedCostCard.tsx
  │
  ├── pages/                       ← Full page components
  │   ├── DashboardPage.tsx
  │   ├── GoalsPage.tsx
  │   └── PersonalFinancePage.tsx
  │
  ├── preview/                     ← Mock/preview system
  │   ├── AppPreview.tsx           (Main preview component)
  │   ├── mockAuth.ts              (Authentication mock)
  │   ├── mockDatabase.ts          (Database mock with API)
  │   ├── mockGoals.ts             (Goals data)
  │   ├── mockAccounts.ts          (Accounts data)
  │   ├── mockDebts.ts             (Debts data)
  │   ├── mockTransactions.ts      (Incomes, fixed costs, transactions)
  │   ├── mockUser.ts              (User & household data)
  │   ├── mockSettings.ts          (Settings & navigation)
  │   └── types.ts                 (TypeScript types)
  │
  ├── styles/                      ← Preview-specific styles (if needed)
  ├── index.tsx                    ← Entry point (auto-detects preview mode)
  └── USAGE_GUIDE.md              ← This file
```

---

## 🎨 How Preview Mode Works

### Automatic Detection

The entry point `/src/app/index.tsx` automatically detects if the app is running inside an iframe:

```typescript
const IS_PREVIEW = window.self !== window.top;

if (IS_PREVIEW) {
  // Load AppPreview with mock data
} else {
  // Use production app via /src/main.tsx
}
```

### When Preview Mode Activates

✅ **Inside Figma Make iframe** → Preview mode with mocks  
✅ **Development server** → Can test both modes  
❌ **Production build** → Real app uses `/src/main.tsx`

### Console Indicators

Preview mode logs this banner:
```
╔═══════════════════════════════════════════════════╗
║       🎨 FIGMA MAKE PREVIEW MODE 🎨             ║
╠═══════════════════════════════════════════════════╣
║  ✓ Mock data active                              ║
║  ✓ No Supabase calls                             ║
║  ✓ Isolated preview environment                  ║
║  ✓ Full UI functionality                         ║
╚═══════════════════════════════════════════════════╝
```

---

## 🔌 Integrating with Production App

### Option 1: Import Individual Components

Use Make components in your real app:

```typescript
// In your real app code
import { GoalCard } from '@/app/components/GoalCard';
import { DashboardPage } from '@/app/pages/DashboardPage';

// Pass real data from your Supabase context
<DashboardPage
  goals={realGoals}
  accounts={realAccounts}
  debts={realDebts}
  onGoalClick={handleGoalClick}
  onNavigate={handleNavigate}
/>
```

### Option 2: Import Entire Pages

Replace your current pages with Make pages:

```typescript
// Replace existing dashboard
import { DashboardPage } from '@/app/pages/DashboardPage';
import { useFinance } from '@/contexts/FinanceContext';

function Dashboard() {
  const { goals, accounts, debts } = useFinance();
  
  return (
    <DashboardPage
      goals={goals}
      accounts={accounts}
      debts={debts}
      onGoalClick={openGoalDetail}
      onNavigate={navigate}
    />
  );
}
```

### Option 3: Use Types

Share types between Make and production:

```typescript
import type { Goal, Account, Debt } from '@/app/preview/types';

// Use these types in your production code
const myGoal: Goal = {
  id: '123',
  name: 'My Goal',
  // ... rest of goal data
};
```

---

## 🛠️ Extending the Mock System

### Adding New Mock Data

1. **Edit mock files** in `/src/app/preview/`:
   ```typescript
   // /src/app/preview/mockGoals.ts
   export const mockGoals: Goal[] = [
     {
       id: 'goal-7',
       name: 'New Goal',
       category: 'travel',
       // ... rest of data
     },
   ];
   ```

2. **Add new mock entities**:
   ```typescript
   // /src/app/preview/mockNewFeature.ts
   import { NewFeature } from './types';
   
   export const mockNewFeatures: NewFeature[] = [
     // ... your mock data
   ];
   ```

3. **Update mockDatabase.ts**:
   ```typescript
   import { mockNewFeatures } from './mockNewFeature';
   
   export const createMockDatabase = (): MockDatabase => ({
     // ... existing data
     newFeatures: [...mockNewFeatures],
   });
   ```

### Adding New API Endpoints

```typescript
// In mockDatabase.ts
export const mockAPI = {
  // ... existing endpoints
  
  getNewFeature: async (id: string) => {
    return database.newFeatures.find(f => f.id === id);
  },
  
  createNewFeature: async (feature: Omit<NewFeature, 'id'>) => {
    const newFeature = {
      ...feature,
      id: `feature-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    database.newFeatures.push(newFeature);
    return newFeature;
  },
};
```

---

## 🔄 Regenerating Make Output

### Safe Regeneration Process

1. **Commit current work** to Git:
   ```bash
   git add src/app/
   git commit -m "Save current Make output"
   ```

2. **Regenerate in Figma Make**:
   - Make changes in Figma
   - Regenerate the code
   - Make will overwrite `/src/app/`

3. **Review changes**:
   ```bash
   git diff src/app/
   ```

4. **Keep or discard**:
   ```bash
   # Keep changes
   git add src/app/
   git commit -m "Updated Make output"
   
   # Or revert if something broke
   git checkout src/app/
   ```

### What Gets Preserved

✅ **Protected** (never touched by Make):
- `/src/` (except `/src/app/`)
- `/components/` (your real components)
- `/supabase/`
- `package.json`
- `vite.config.ts`

⚠️ **Regenerated** (Make will overwrite):
- `/src/app/**`

### Comparing Cursor vs Figma Changes

```bash
# See what Cursor changed
git diff main src/app/

# See what Figma changed
git diff HEAD~1 src/app/

# Compare both
git log --oneline --graph src/app/
```

---

## ✏️ Files You Can Safely Edit

### ✅ Safe to Edit

- `/src/app/preview/mock*.ts` - Add/modify mock data
- `/src/app/preview/types.ts` - Add new types
- `/src/app/components/*.tsx` - Customize components
- `/src/app/pages/*.tsx` - Customize pages
- `/src/app/USAGE_GUIDE.md` - Update documentation

### ⚠️ Edit with Caution

- `/src/app/preview/AppPreview.tsx` - Main preview logic
- `/src/app/index.tsx` - Entry point logic

### ❌ Do Not Edit (Auto-generated)

- Nothing! All files are editable, but regenerating Make will overwrite everything in `/src/app/`

**Best Practice**: Make a copy outside `/src/app/` if you want to preserve custom changes:

```typescript
// Copy to your own folder
/src/customComponents/MyGoalCard.tsx  ← Your customized version
/src/app/components/GoalCard.tsx      ← Make-generated version
```

---

## 🧪 Testing Preview Mode

### Method 1: Inside Figma Make

Simply use the Figma Make preview - it automatically runs in preview mode.

### Method 2: Local Development

Create an HTML file that iframes your app:

```html
<!-- preview-test.html -->
<!DOCTYPE html>
<html>
<head>
  <title>Preview Mode Test</title>
</head>
<body>
  <iframe 
    src="http://localhost:5173" 
    style="width: 100%; height: 100vh; border: none;"
  ></iframe>
</body>
</html>
```

Open this file in a browser to test preview mode locally.

### Method 3: Force Preview Mode

Edit `/src/app/index.tsx` temporarily:

```typescript
// Force preview mode for testing
const IS_PREVIEW = true; // window.self !== window.top;
```

---

## 📊 Mock Data Reference

### Goals
- **6 goals** covering all categories
- Realistic Portuguese data
- Images from Unsplash
- Complete financial projections

### Accounts
- **4 accounts**: Checking (2), Savings (1), Investment (1)
- Total: €75,151.25
- Different institutions

### Debts
- **4 debts**: Credit card, Personal loan, Mortgage, Auto loan
- Total: €209,500.00
- Realistic interest rates and payments

### Incomes
- **3 sources**: Main salary, spouse salary, freelance
- Total: €6,500/month

### Fixed Costs
- **7 costs**: Rent, utilities, subscriptions, insurance
- Total: €1,525.99/month

---

## 🐛 Troubleshooting

### Preview Mode Not Activating

**Symptom**: Real app loads instead of preview  
**Solution**: Ensure you're inside an iframe or set `IS_PREVIEW = true`

### Styles Not Loading

**Symptom**: UI looks unstyled  
**Solution**: Check that `/styles/globals.css` is imported in `/src/app/index.tsx`

### Mock Data Not Showing

**Symptom**: Empty screens in preview  
**Solution**: 
1. Check console for errors
2. Verify mock data files are imported in `mockDatabase.ts`
3. Ensure `getMockDatabase()` is called in `AppPreview.tsx`

### TypeScript Errors

**Symptom**: Type mismatches  
**Solution**:
1. Update `/src/app/preview/types.ts`
2. Ensure mock data matches type definitions
3. Run `npm run build` to check

---

## 🚀 Deployment

### Preview Mode in Production

Preview mode is **automatically disabled** in production builds because:
- It's not running in an iframe (`IS_PREVIEW = false`)
- The production app uses `/src/main.tsx`

### Deploying Make Components

To use Make components in production:

1. Import them into your real app (see "Integration" section)
2. Pass real Supabase data instead of mocks
3. Build and deploy normally

### Keeping Make Output Updated

Create a Git workflow:

```bash
# Branch for Make changes
git checkout -b make-updates

# Regenerate in Figma Make
# ... Make overwrites /src/app/

# Commit Make changes
git add src/app/
git commit -m "Update Make output from Figma"

# Merge into main
git checkout main
git merge make-updates
```

---

## 📝 Best Practices

### 1. **Isolate Custom Code**

Don't mix custom code with Make output:
```
✅ /src/myComponents/CustomGoalCard.tsx
❌ /src/app/components/GoalCard.tsx (will be overwritten)
```

### 2. **Use Types for Integration**

Share types between Make and production:
```typescript
import type { Goal } from '@/app/preview/types';
```

### 3. **Commit Make Output**

Always commit Make changes separately:
```bash
git add src/app/
git commit -m "feat: Updated Make components"
```

### 4. **Test Both Modes**

Test in both preview and production:
- Preview: Mock data, iframe
- Production: Real data, standalone

### 5. **Document Changes**

Update this guide when you modify the architecture:
```markdown
## 2024-12-05: Added New Feature
- Added PersonalFinancePage
- Updated mock data with incomes
```

---

## 📞 Support

### Common Questions

**Q: Can I modify Make components?**  
A: Yes, but they'll be overwritten when you regenerate. Copy them outside `/src/app/` for permanent changes.

**Q: How do I add new mock data?**  
A: Edit files in `/src/app/preview/mock*.ts` and update `mockDatabase.ts`.

**Q: Can I use Make components with real data?**  
A: Absolutely! Import them and pass real props instead of mocks.

**Q: Will regenerating break my app?**  
A: No, only `/src/app/` is affected. Your production code is safe.

---

## 🎯 Next Steps

1. **Explore the preview** in Figma Make
2. **Import components** into your production app
3. **Customize mock data** for your use case
4. **Extend with new features** as needed
5. **Commit and deploy** when ready

---

**Generated by Figma Make**  
Last Updated: December 5, 2024  
Version: 1.0.0