# Login Flow - Visual Guide

## 🔄 New Authentication Flow

```
┌─────────────────────┐
│   Login Page        │
│   Enter Email/Pass  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Authenticating...  │
│  Loading user data  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────────────────────┐
│          Household Selection Screen                  │
│                                                      │
│  ┌──────────────────────────────────────┐          │
│  │ 🏠 Household Found                    │          │
│  │ You are already a member of:          │          │
│  │ "The Smith Family"                    │          │
│  │                                        │          │
│  │ [ Enter Dashboard → ]                 │          │
│  └──────────────────────────────────────┘          │
│                                                      │
│  ┌─────────────────┐  ┌─────────────────┐          │
│  │ 🏠 Create       │  │ 👥 Join         │          │
│  │ Household       │  │ Household       │          │
│  │                 │  │                 │          │
│  │ Start fresh.    │  │ Enter invite    │          │
│  │ Invite partner  │  │ code to sync.   │          │
│  │                 │  │                 │          │
│  │ [Get Started]   │  │ [Enter Code]    │          │
│  └─────────────────┘  └─────────────────┘          │
│                                                      │
└──────────────────────────────────────────────────────┘
           │
           │ (User clicks one of the options)
           │
           ▼
┌─────────────────────┐
│   Loading...        │
│   Entering household│
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Main Dashboard     │
│  🏠 Family Finance  │
└─────────────────────┘
```

## 🎯 Key Points

### 1️⃣ **Always Show Selection Screen**
- Even if user is already a member of a household
- User sees "Household Found" card but must click to enter
- No automatic entry

### 2️⃣ **Three Options Available**
1. **Enter Found Household** (if exists)
2. **Create New Household**
3. **Join Different Household**

### 3️⃣ **Explicit User Action Required**
- User must click a button to proceed
- Loading states shown during transition
- Clear feedback with toast messages

## 📋 User Actions

### Option 1: Enter Existing Household

```
Click "Enter Dashboard"
  ↓
Loading household data...
  ↓
Toast: "Welcome back to [Household Name]!"
  ↓
Dashboard appears
```

### Option 2: Create New Household

```
Click "Create Household"
  ↓
Enter household name
  ↓
Click "Create & Continue"
  ↓
Loading...
  ↓
Toast: "Household created successfully!"
  ↓
Dashboard appears
```

### Option 3: Join via Code

```
Click "Join Household"
  ↓
Enter invite code
  ↓
Click "Join Household"
  ↓
Loading...
  ↓
Toast: "Joined household successfully!"
  ↓
Dashboard appears
```

## 🔒 Security & Data

### What Loads on Login
- ✅ User profile data
- ✅ Personal accounts (not visible yet)
- ✅ Personal costs (not visible yet)
- ❌ Household data (NOT loaded)

### What Loads on Household Selection
- ✅ Household information
- ✅ All members' data
- ✅ Shared goals
- ✅ Household accounts & costs

## 🎨 UI Details

### Found Household Card
```
┌────────────────────────────────────────┐
│ 🏠 Household Found                      │
│                                         │
│ [Home Icon]  You are already a member  │
│              of "The Smith Family"      │
│                                         │
│              [Enter Dashboard →]        │
│                                         │
│ ✨ Premium card with glow effect        │
│ ✨ Primary color accent                 │
└────────────────────────────────────────┘
```

### Create Household Card
```
┌────────────────────────┐
│ 🏠 Create Household    │
│                        │
│ [Icon]                 │
│                        │
│ Start fresh. Invite    │
│ your partner later     │
│ with a unique code.    │
│                        │
│ [Get Started]          │
│                        │
│ ✨ Glass effect card   │
└────────────────────────┘
```

### Join Household Card
```
┌────────────────────────┐
│ 👥 Join Household      │
│                        │
│ [Icon]                 │
│                        │
│ Enter the invite code  │
│ shared by your partner │
│ to sync up.            │
│                        │
│ [Enter Code]           │
│                        │
│ ✨ Blue accent card    │
└────────────────────────┘
```

## ⚙️ Technical Flow

### 1. Login (App.tsx)
```typescript
if (!data.user) {
    return <LoginPage />;
}
```

### 2. Household Selection (App.tsx)
```typescript
if (!data.household) {
    return <HouseholdSetup />;
}
```

### 3. Main App (App.tsx)
```typescript
return <AppShell>
    <Dashboard />
</AppShell>;
```

## 🔄 State Management

### Before (Automatic)
```typescript
// On login
loadFromServer(userId); // Loads everything including household
→ data.household is set automatically
→ User enters app immediately
```

### After (Explicit)
```typescript
// On login
loadFromServer(userId, { skipHousehold: true }); // Skip household
→ data.household is null
→ Selection screen shows

// When user clicks "Enter Dashboard"
enterHousehold(foundHousehold);
→ Loads full household data
→ data.household is set
→ User enters app
```

## 📱 Mobile Experience

Same flow on mobile with responsive layout:

- Cards stack vertically on small screens
- Touch-friendly button sizes
- Smooth animations with Motion
- Premium glass/glow effects maintained

---

**Benefits:**
- 🎯 Clear user choice
- 🔒 Explicit data loading
- 🚀 Fast initial login
- 💎 Premium UX maintained
- ✨ Smooth transitions

**Result:** Users have full control over which household to enter! 🎉
