# Database Migration Guide: KV Store → Relational Schema

## ✅ What's Done

1. **SQL Schema Created**: You've manually created all tables in Supabase
2. **Server Code Refactored**: All endpoints now use SQL queries instead of KV store
3. **Migration Script Ready**: Automated migration tool created
4. **UI Tool Available**: Simple component to trigger migration

## 📋 Tables Created

- `users` - User profiles
- `households` - Household information
- `household_members` - Household membership (junction table)
- `income_sources` - User income sources
- `accounts` - Financial accounts
- `recurring_costs` - Monthly recurring expenses  
- `debts` - Debt tracking
- `goals` - Household financial goals
- `monthly_snapshots` - Historical net worth tracking
- `user_settings` - User preferences

## 🚀 How to Run the Migration

### Option 1: Using the UI Tool

1. **Import the Migration Tool**:
   ```tsx
   import { MigrationTool } from './components/MigrationTool';
   ```

2. **Add it temporarily to your app** (e.g., in Settings):
   ```tsx
   <MigrationTool />
   ```

3. **Click "Start Migration"** - it will:
   - Read all data from KV store
   - Transform and insert into new tables
   - Show you a detailed report
   - Display any errors

4. **Refresh the app** once complete

5. **Remove the MigrationTool** component after migration

### Option 2: Using the API Directly

```bash
curl -X POST https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-d9780f4d/migrate \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

## 🎯 What the Migration Does

### Data Transformation

**Households**:
- Creates household records with proper IDs
- Extracts join codes
- Sets owner relationships

**Users**:
- Creates user records in `users` table
- Migrates user settings to `user_settings`
- Preserves all user metadata

**Household Members**:
- Creates junction table records
- Preserves roles (owner/partner)
- Links users to households

**Income Sources**:
- Extracts from household member data
- Links to users properly
- Preserves amounts and names

**Accounts**:
- Migrates all financial accounts
- Links to owners and households
- Preserves balances, APY, types

**Recurring Costs**:
- Migrates subscriptions and expenses
- Links to owners and households
- Preserves categories and amounts

**Debts**:
- Migrates debt information
- Links to owners and households
- Preserves payment schedules

**Goals**:
- Migrates household goals
- Links to households
- Preserves targets and deadlines

**Monthly Snapshots**:
- Migrates historical data
- Links to households
- Preserves net worth history

## 🔒 Data Safety

- Migration uses `upsert` with conflict resolution
- Existing auth users are preserved
- Original KV data remains untouched
- Can be run multiple times safely
- Errors are logged but don't stop migration

## ✨ Benefits of New Schema

### Performance
- ✅ Faster queries with proper indexes
- ✅ Efficient JOINs instead of multiple KV lookups
- ✅ Better query optimization by Postgres

### Data Integrity
- ✅ Foreign key constraints
- ✅ Type safety at database level
- ✅ CASCADE deletes handled automatically
- ✅ Unique constraints on join codes

### Scalability
- ✅ No more loading entire household blobs
- ✅ Partial updates possible
- ✅ Better concurrency handling
- ✅ Prepared for future features

### Developer Experience
- ✅ Standard SQL queries
- ✅ Clear table relationships
- ✅ Easy to add new features
- ✅ Familiar patterns for most developers

## 📊 API Changes

### No Breaking Changes! 

The API responses remain identical to before:

```typescript
// Load endpoint still returns:
{
  found: true,
  data: {
    user: { ... },
    household: { ... },
    accounts: [ ... ],
    recurringCosts: [ ... ],
    debts: [ ... ],
    goals: [ ... ],
    // etc.
  }
}
```

The frontend doesn't need any changes!

## 🎉 Post-Migration

### Verify Migration

1. **Check the migration results** - all counts should match your data
2. **Log in and verify** all data displays correctly
3. **Test key operations**:
   - Adding/editing accounts
   - Creating/updating goals
   - Saving monthly snapshots
   - Household member management

### Monitor Performance

Watch the Supabase Dashboard for:
- Query performance improvements
- Database size
- Index usage

### Optional: Clean Up KV Data

After confirming everything works:

```sql
-- Only do this after verifying migration success!
DELETE FROM kv_store_d9780f4d 
WHERE key LIKE 'user/%' 
   OR key LIKE 'household/%';
```

## 🆘 Troubleshooting

### Migration Fails

1. **Check logs** in Supabase Functions dashboard
2. **Verify table structure** matches the schema
3. **Check foreign key constraints** are correct
4. **Run migration again** - it's idempotent

### Data Missing After Migration

1. **Check migration results** for errors
2. **Verify user IDs** match between auth and tables
3. **Check household memberships** are correct
4. **Review server logs** for save errors

### Performance Issues

1. **Add indexes** if queries are slow:
   ```sql
   CREATE INDEX idx_custom ON table_name(column_name);
   ```

2. **Check query plans**:
   ```sql
   EXPLAIN ANALYZE SELECT ...;
   ```

## 📞 Support

If you encounter issues:

1. Check the server logs in Supabase Functions
2. Check the browser console for errors
3. Review the migration results for specific errors
4. Verify table schemas match exactly

## 🎯 Next Steps

After successful migration:

1. ✅ Remove the MigrationTool component
2. ✅ Monitor application for a few days
3. ✅ Consider adding more indexes if needed
4. ✅ Optionally clean up old KV data
5. ✅ Enjoy the benefits of relational data!

---

**Migration Status**: Ready to Execute ✅
**Risk Level**: Low (data preserved, can retry)
**Estimated Time**: ~30 seconds for typical datasets
