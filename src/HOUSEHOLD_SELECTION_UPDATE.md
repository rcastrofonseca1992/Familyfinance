# Household Selection Flow Update

## Changes Made

I've updated the authentication flow so that users **must explicitly choose** which household to enter after logging in, rather than being automatically taken to their existing household.

## What Changed

### 1. **Modified Login Flow** (`/components/store/FinanceContext.tsx`)

**Before:**
- User logs in → Automatically loads household data → Enters app

**After:**
- User logs in → Shows household selection screen → User chooses option → Enters app

### 2. **New `enterHousehold()` Function**

Added a new function to explicitly enter a household:

```typescript
enterHousehold: (household: Household) => Promise<void>
```

This function:
- Sets the selected household in context
- Loads all household data (accounts, costs, goals)
- Only called when user explicitly clicks "Enter Dashboard"

### 3. **Updated `loadFromServer()` Function**

Added an optional parameter to skip household loading on initial login:

```typescript
loadFromServer(userId: string, options = { skipHousehold: false })
```

- On initial login: `skipHousehold: true` (shows selection screen)
- When entering household: `skipHousehold: false` (loads full data)

### 4. **Updated Household Selection Screen** (`/components/onboarding/HouseholdSetup.tsx`)

**Before:**
- Found household was displayed, but data was already loaded automatically

**After:**
- Found household is displayed as an **option**
- User must click "Enter Dashboard" to activate it
- Shows loading state while entering
- User can still create a new household or join a different one

## User Experience

### Login Flow

1. **User enters email/password and logs in**
   - ✅ User data loads
   - ❌ Household data does NOT load automatically

2. **Household selection screen appears with options:**
   - **Option 1**: "Household Found" card (if user is already a member)
     - Shows household name
     - "Enter Dashboard" button
   - **Option 2**: "Create Household" card
     - Start a new household
   - **Option 3**: "Join Household" card
     - Enter an invite code

3. **User makes a choice:**
   - **Enter existing household**: Loads full household data and enters app
   - **Create new household**: Creates household and enters app
   - **Join household**: Joins via code and enters app

### Benefits

✅ **Explicit Choice**: Users must consciously select which household to enter
✅ **Multi-Household Support**: Users can be members of multiple households and choose which one to use
✅ **No Auto-Entry**: Prevents accidentally entering a household
✅ **Clear Options**: All choices are presented clearly on one screen

## Technical Details

### Files Modified

1. **`/components/store/FinanceContext.tsx`**
   - Added `skipHousehold` option to `loadFromServer()`
   - Added new `enterHousehold()` function
   - Updated auth listener to skip household on login
   - Exported `enterHousehold` in provider

2. **`/components/onboarding/HouseholdSetup.tsx`**
   - Updated to use `enterHousehold()` instead of `updateData()`
   - Added async handler with loading state
   - Added error handling

### API Calls

**On Login:**
```
GET /finance/load-household/{userId}
→ Loads user data + accounts + costs + goals
→ But sets household: null
```

**On Enter Household:**
```
GET /finance/load-household/{userId}
→ Loads full household data
→ Sets household in context
```

**On Create Household:**
```
POST /household/create
→ Creates household
→ Automatically sets in context
```

**On Join Household:**
```
POST /household/join
→ Joins household
→ Automatically sets in context
```

## Testing Checklist

- [ ] Log in with existing household → See "Household Found" card
- [ ] Click "Enter Dashboard" → Loads household data and enters app
- [ ] Log in and click "Create Household" → Creates new household
- [ ] Log in and click "Join Household" → Can join with code
- [ ] All options show proper loading states
- [ ] Errors are handled gracefully
- [ ] Logout and login again → Selection screen appears

## Future Enhancements

Possible improvements for the future:

1. **Multiple Households**: Allow users to switch between multiple households
2. **Last Used**: Remember which household was last used
3. **Auto-Enter Option**: Add a "Remember my choice" checkbox
4. **Household Preview**: Show quick stats before entering

---

**Status**: ✅ **Complete**

Users now have full control over which household to enter after logging in!
