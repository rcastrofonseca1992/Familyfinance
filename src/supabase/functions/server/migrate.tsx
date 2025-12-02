import { createClient } from "npm:@supabase/supabase-js@2";

/**
 * MIGRATION SCRIPT: KV Store to Relational Schema
 * 
 * This script migrates data from the old KV store structure to the new relational tables.
 * Run this once after creating the new tables manually.
 * 
 * Usage: Call the /make-server-d9780f4d/migrate endpoint with admin access
 */

function getAdminClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
}

export async function migrateData() {
  const supabase = getAdminClient();
  const results = {
    users: 0,
    households: 0,
    members: 0,
    incomeSources: 0,
    accounts: 0,
    recurringCosts: 0,
    debts: 0,
    goals: 0,
    snapshots: 0,
    settings: 0,
    errors: [] as string[]
  };

  try {
    // 1. Get all KV data
    const { data: kvData } = await supabase
      .from('kv_store_d9780f4d')
      .select('key, value');

    if (!kvData) {
      throw new Error('No KV data found');
    }

    console.log(`Found ${kvData.length} KV records to process`);

    // 2. Process households first
    const householdData: any = {};
    
    for (const row of kvData) {
      if (row.key.startsWith('household/') && row.key.endsWith('/data')) {
        const householdId = row.key.split('/')[1];
        try {
          const data = typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
          householdData[householdId] = data;
          
          // Insert household
          const { error } = await supabase
            .from('households')
            .upsert({
              id: data.id,
              name: data.name,
              join_code: data.joinCode,
              owner_id: data.members?.find((m: any) => m.role === 'owner')?.id
            }, { onConflict: 'id' });

          if (error) {
            results.errors.push(`Household ${householdId}: ${error.message}`);
          } else {
            results.households++;
          }

          // Insert members
          if (data.members && Array.isArray(data.members)) {
            for (const member of data.members) {
              const { error: memberError } = await supabase
                .from('household_members')
                .upsert({
                  household_id: data.id,
                  user_id: member.id,
                  role: member.role
                }, { onConflict: 'household_id,user_id' });

              if (memberError) {
                results.errors.push(`Member ${member.id}: ${memberError.message}`);
              } else {
                results.members++;
              }

              // Ensure user exists in users table
              const { data: existingUser } = await supabase
                .from('users')
                .select('id')
                .eq('id', member.id)
                .single();

              if (!existingUser) {
                const { error: userError } = await supabase
                  .from('users')
                  .insert({
                    id: member.id,
                    name: member.name,
                    email: member.email
                  });

                if (userError) {
                  results.errors.push(`User ${member.id}: ${userError.message}`);
                } else {
                  results.users++;
                }
              }

              // Insert income sources
              if (member.incomeSources && Array.isArray(member.incomeSources)) {
                for (const source of member.incomeSources) {
                  const { error: incomeError } = await supabase
                    .from('income_sources')
                    .upsert({
                      id: source.id,
                      user_id: member.id,
                      name: source.name,
                      amount: source.amount
                    }, { onConflict: 'id' });

                  if (incomeError) {
                    results.errors.push(`Income ${source.id}: ${incomeError.message}`);
                  } else {
                    results.incomeSources++;
                  }
                }
              }
            }
          }

          // Insert monthly snapshots
          if (data.monthlySnapshots && Array.isArray(data.monthlySnapshots)) {
            for (const snapshot of data.monthlySnapshots) {
              const { error: snapshotError } = await supabase
                .from('monthly_snapshots')
                .upsert({
                  household_id: data.id,
                  month: snapshot.month,
                  net_worth: snapshot.netWorth,
                  total_cash: snapshot.totalCash,
                  timestamp: snapshot.timestamp
                }, { onConflict: 'household_id,month' });

              if (snapshotError) {
                results.errors.push(`Snapshot ${snapshot.month}: ${snapshotError.message}`);
              } else {
                results.snapshots++;
              }
            }
          }
        } catch (e) {
          results.errors.push(`Parse household ${householdId}: ${e.message}`);
        }
      }
    }

    // 3. Process user finance data
    for (const row of kvData) {
      if (row.key.startsWith('user/') && row.key.endsWith('/finance')) {
        const userId = row.key.split('/')[1];
        try {
          const data = typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
          
          // Find user's household
          const { data: membership } = await supabase
            .from('household_members')
            .select('household_id')
            .eq('user_id', userId)
            .single();

          const householdId = membership?.household_id;

          // Insert accounts
          if (data.accounts && Array.isArray(data.accounts)) {
            for (const account of data.accounts) {
              const { error: accountError } = await supabase
                .from('accounts')
                .upsert({
                  id: account.id,
                  name: account.name,
                  balance: account.balance,
                  institution: account.institution,
                  type: account.type,
                  currency: account.currency,
                  owner_id: userId,
                  household_id: householdId,
                  include_in_household: account.includeInHousehold ?? true,
                  apy: account.apy ?? 0
                }, { onConflict: 'id' });

              if (accountError) {
                results.errors.push(`Account ${account.id}: ${accountError.message}`);
              } else {
                results.accounts++;
              }
            }
          }

          // Insert recurring costs
          if (data.recurringCosts && Array.isArray(data.recurringCosts)) {
            for (const cost of data.recurringCosts) {
              const { error: costError } = await supabase
                .from('recurring_costs')
                .upsert({
                  id: cost.id,
                  name: cost.name,
                  amount: cost.amount,
                  category: cost.category,
                  owner_id: userId,
                  household_id: householdId,
                  include_in_household: cost.includeInHousehold ?? true
                }, { onConflict: 'id' });

              if (costError) {
                results.errors.push(`Cost ${cost.id}: ${costError.message}`);
              } else {
                results.recurringCosts++;
              }
            }
          }

          // Insert debts
          if (data.debts && Array.isArray(data.debts)) {
            for (const debt of data.debts) {
              const { error: debtError } = await supabase
                .from('debts')
                .upsert({
                  id: debt.id,
                  name: debt.name,
                  total_amount: debt.totalAmount,
                  remaining_amount: debt.remainingAmount,
                  monthly_payment: debt.monthlyPayment,
                  interest_rate: debt.interestRate ?? 0,
                  owner_id: userId,
                  household_id: householdId,
                  include_in_household: debt.includeInHousehold ?? true
                }, { onConflict: 'id' });

              if (debtError) {
                results.errors.push(`Debt ${debt.id}: ${debtError.message}`);
              } else {
                results.debts++;
              }
            }
          }

          // Insert goals (only if user is owner)
          if (data.goals && Array.isArray(data.goals) && householdId) {
            const { data: member } = await supabase
              .from('household_members')
              .select('role')
              .eq('household_id', householdId)
              .eq('user_id', userId)
              .single();

            if (member?.role === 'owner') {
              for (const goal of data.goals) {
                const { error: goalError } = await supabase
                  .from('goals')
                  .upsert({
                    id: goal.id,
                    household_id: householdId,
                    name: goal.name,
                    category: goal.category,
                    is_main: goal.isMain ?? false,
                    target_amount: goal.targetAmount,
                    current_amount: goal.currentAmount ?? 0,
                    deadline: goal.deadline,
                    property_value: goal.propertyValue
                  }, { onConflict: 'id' });

                if (goalError) {
                  results.errors.push(`Goal ${goal.id}: ${goalError.message}`);
                } else {
                  results.goals++;
                }
              }
            }
          }

          // Insert user settings
          const { error: settingsError } = await supabase
            .from('user_settings')
            .upsert({
              user_id: userId,
              currency: data.currency ?? 'EUR',
              theme: data.theme ?? 'light',
              emergency_fund_goal: data.emergencyFundGoal ?? 10000,
              is_variable_income: data.isVariableIncome ?? false,
              variable_spending: data.variableSpending ?? 0
            }, { onConflict: 'user_id' });

          if (settingsError) {
            results.errors.push(`Settings ${userId}: ${settingsError.message}`);
          } else {
            results.settings++;
          }
        } catch (e) {
          results.errors.push(`Parse user ${userId}: ${e.message}`);
        }
      }
    }

    return results;
  } catch (e) {
    console.error('Migration error:', e);
    throw e;
  }
}
