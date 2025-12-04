# 🚀 Quick Setup - Data Protection System

## ⚡ 2-Minute Setup

### Step 1: Run SQL Migration

1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy/paste the entire content from `/supabase/migrations/create_backup_tables.sql`
5. Click **Run** (green button)

You should see:
```
Success. No rows returned
```

### Step 2: Verify Tables Created

Run this query in SQL Editor:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_name LIKE '%backup%' 
ORDER BY table_name;
```

Expected result - 5 tables:
- ✅ accounts_backup
- ✅ debts_backup
- ✅ goals_backup
- ✅ income_sources_backup
- ✅ recurring_costs_backup

### Step 3: Test Protection

Your app will now:
- ✅ **Reject invalid data types** (e.g., `accounts: "not an array"`)
- ✅ **Block empty payloads** that would wipe existing data
- ✅ **Auto-backup data** before every update

---

## 🧪 Quick Test

Try to save empty data through your app (it should fail):

```javascript
// This should return an error like:
// "Empty payload detected — refusing to wipe X accounts."
```

---

## 📊 Check Your Backups

```sql
-- View all your backups
SELECT * FROM list_user_backups('your-user-id-here');
```

---

## 🆘 Emergency Recovery

If you lose data:

```sql
-- 1. Find the backup timestamp
SELECT DISTINCT backup_timestamp, COUNT(*) as records
FROM accounts_backup
WHERE owner_id = 'your-user-id'
GROUP BY backup_timestamp
ORDER BY backup_timestamp DESC;

-- 2. Restore from that timestamp
-- See /DATA_PROTECTION_GUIDE.md for full restore commands
```

---

## ✅ You're Protected!

Your data is now protected by **three layers**:

1. 🛡️ **Type Validation** - Wrong types rejected
2. 🚫 **Wipe Prevention** - Empty arrays blocked  
3. 💾 **Auto Backups** - Every change backed up

**Full documentation:** See `/DATA_PROTECTION_GUIDE.md`

**Need help?** Check Edge Function logs in Supabase for detailed error messages.
