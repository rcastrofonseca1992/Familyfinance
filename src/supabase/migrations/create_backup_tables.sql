-- =====================================================
-- BACKUP TABLES FOR DATA PROTECTION
-- =====================================================
-- These tables automatically store backups before any
-- data overwrites in the main tables.
-- Created to prevent accidental data loss.
-- =====================================================

-- ACCOUNTS BACKUP TABLE
CREATE TABLE IF NOT EXISTS accounts_backup (
  id UUID NOT NULL,
  name TEXT NOT NULL,
  balance NUMERIC NOT NULL DEFAULT 0,
  institution TEXT,
  type TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  owner_id UUID NOT NULL,
  household_id UUID,
  include_in_household BOOLEAN DEFAULT true,
  apy NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Backup metadata
  backup_timestamp TIMESTAMPTZ NOT NULL,
  original_id UUID NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_accounts_backup_owner ON accounts_backup(owner_id);
CREATE INDEX IF NOT EXISTS idx_accounts_backup_timestamp ON accounts_backup(backup_timestamp DESC);

-- INCOME SOURCES BACKUP TABLE
CREATE TABLE IF NOT EXISTS income_sources_backup (
  id UUID NOT NULL,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Backup metadata
  backup_timestamp TIMESTAMPTZ NOT NULL,
  original_id UUID NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_income_backup_user ON income_sources_backup(user_id);
CREATE INDEX IF NOT EXISTS idx_income_backup_timestamp ON income_sources_backup(backup_timestamp DESC);

-- RECURRING COSTS BACKUP TABLE
CREATE TABLE IF NOT EXISTS recurring_costs_backup (
  id UUID NOT NULL,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  category TEXT,
  owner_id UUID NOT NULL,
  household_id UUID,
  include_in_household BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Backup metadata
  backup_timestamp TIMESTAMPTZ NOT NULL,
  original_id UUID NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_costs_backup_owner ON recurring_costs_backup(owner_id);
CREATE INDEX IF NOT EXISTS idx_costs_backup_timestamp ON recurring_costs_backup(backup_timestamp DESC);

-- DEBTS BACKUP TABLE
CREATE TABLE IF NOT EXISTS debts_backup (
  id UUID NOT NULL,
  name TEXT NOT NULL,
  total_amount NUMERIC NOT NULL,
  remaining_amount NUMERIC NOT NULL,
  monthly_payment NUMERIC NOT NULL,
  interest_rate NUMERIC DEFAULT 0,
  owner_id UUID NOT NULL,
  household_id UUID,
  include_in_household BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Backup metadata
  backup_timestamp TIMESTAMPTZ NOT NULL,
  original_id UUID NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_debts_backup_owner ON debts_backup(owner_id);
CREATE INDEX IF NOT EXISTS idx_debts_backup_timestamp ON debts_backup(backup_timestamp DESC);

-- GOALS BACKUP TABLE
CREATE TABLE IF NOT EXISTS goals_backup (
  id UUID NOT NULL,
  household_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  is_main BOOLEAN DEFAULT false,
  target_amount NUMERIC NOT NULL,
  current_amount NUMERIC DEFAULT 0,
  deadline DATE,
  property_value NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Backup metadata
  backup_timestamp TIMESTAMPTZ NOT NULL,
  original_id UUID NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_goals_backup_household ON goals_backup(household_id);
CREATE INDEX IF NOT EXISTS idx_goals_backup_timestamp ON goals_backup(backup_timestamp DESC);

-- =====================================================
-- RESTORE FUNCTIONS (FOR EMERGENCY DATA RECOVERY)
-- =====================================================

-- Function to list all backups for a user
CREATE OR REPLACE FUNCTION list_user_backups(p_user_id UUID)
RETURNS TABLE (
  table_name TEXT,
  backup_time TIMESTAMPTZ,
  record_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 'accounts_backup'::TEXT, backup_timestamp, COUNT(*)::BIGINT
  FROM accounts_backup
  WHERE owner_id = p_user_id
  GROUP BY backup_timestamp
  
  UNION ALL
  
  SELECT 'income_sources_backup'::TEXT, backup_timestamp, COUNT(*)::BIGINT
  FROM income_sources_backup
  WHERE user_id = p_user_id
  GROUP BY backup_timestamp
  
  UNION ALL
  
  SELECT 'recurring_costs_backup'::TEXT, backup_timestamp, COUNT(*)::BIGINT
  FROM recurring_costs_backup
  WHERE owner_id = p_user_id
  GROUP BY backup_timestamp
  
  UNION ALL
  
  SELECT 'debts_backup'::TEXT, backup_timestamp, COUNT(*)::BIGINT
  FROM debts_backup
  WHERE owner_id = p_user_id
  GROUP BY backup_timestamp
  
  ORDER BY backup_time DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE accounts_backup IS 'Automatic backups of accounts before updates. Includes backup_timestamp for point-in-time recovery.';
COMMENT ON TABLE income_sources_backup IS 'Automatic backups of income sources before updates. Includes backup_timestamp for point-in-time recovery.';
COMMENT ON TABLE recurring_costs_backup IS 'Automatic backups of recurring costs before updates. Includes backup_timestamp for point-in-time recovery.';
COMMENT ON TABLE debts_backup IS 'Automatic backups of debts before updates. Includes backup_timestamp for point-in-time recovery.';
COMMENT ON TABLE goals_backup IS 'Automatic backups of goals before updates. Includes backup_timestamp for point-in-time recovery.';

-- =====================================================
-- GRANT PERMISSIONS (adjust for your security setup)
-- =====================================================

-- These tables should only be written to by the service role
-- and read by authorized users through RPC functions

ALTER TABLE accounts_backup ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_sources_backup ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_costs_backup ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts_backup ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals_backup ENABLE ROW LEVEL SECURITY;
