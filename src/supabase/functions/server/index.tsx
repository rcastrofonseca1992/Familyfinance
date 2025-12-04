import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import { migrateData } from "./migrate.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "apikey"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Additional explicit CORS headers for maximum compatibility
app.use("*", async (c, next) => {
  c.res.headers.set("Access-Control-Allow-Origin", "*");
  c.res.headers.set("Access-Control-Allow-Headers", "*");
  c.res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  return next();
});

// Handle OPTIONS preflight requests
app.options("*", (c) => {
  return c.text("ok", 200);
});

// --- Helper: Get Admin Supabase Client ---
function getAdminClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
}

// --- Helper: Get Authenticated User ---
async function getAuthUser(c: any) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader) {
    console.error("🔒 No Authorization header found");
    return null;
  }
  
  const token = authHeader.replace('Bearer ', '');
  console.log(`🔍 Verifying token (length: ${token.length}, preview: ${token.substring(0, 30)}...)`);
  
  // Create client with ANON key (this is the correct way to verify user JWTs)
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  );
  
  // Set the auth token for this request
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error) {
    console.error("🔒 Auth error:", error.message, error);
    return null;
  }
  if (!user) {
    console.error("🔒 No user found for token");
    return null;
  }
  console.log(`✅ User authenticated: ${user.id} (${user.email})`);
  return user;
}

// --- Helper: Generate Join Code ---
function generateJoinCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// ===========================================
// AUTHENTICATION
// ===========================================

app.post("/make-server-d9780f4d/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    const supabase = getAdminClient();
    
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true
    });

    if (authError) {
      console.error("Signup error:", authError);
      return c.json({ error: authError.message }, 400);
    }

    // Create user record in users table
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        name,
        email
      });

    if (userError) {
      console.error("User record creation error:", userError);
      return c.json({ error: "Failed to create user record" }, 500);
    }

    // Create default user settings
    await supabase
      .from('user_settings')
      .insert({
        user_id: authData.user.id
      });

    return c.json(authData);
  } catch (e) {
    console.error("Signup exception:", e);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});
// ===========================================
// FUN FACTS - Multilingual Fun Fact Engine
// ===========================================

// Fun facts database in both Portuguese and English
const FUN_FACTS = {
  pt: [
    { fact: "O polvo tem três corações.", source: "wikipedia" },
    { fact: "O mel nunca estraga. Mel de 3000 anos foi encontrado em tumbas egípcias e ainda estava comestível.", source: "arqueologia" },
    { fact: "As bananas são ligeiramente radioativas devido ao potássio que contêm.", source: "física" },
    { fact: "Um dia em Vénus é mais longo que um ano em Vénus.", source: "astronomia" },
    { fact: "Os flamingos nascem cinzentos, tornando-se rosa devido à sua dieta.", source: "biologia" },
    { fact: "O coração da baleia azul é tão grande que um humano poderia nadar através das suas artérias.", source: "biologia" },
    { fact: "Existe mais poder de computação num smartphone moderno do que em toda a NASA quando enviou o homem à Lua.", source: "tecnologia" },
    { fact: "As aranhas não podem voar, mas podem viajar centenas de quilómetros usando correntes de ar.", source: "natureza" },
    { fact: "Um grupo de corujas chama-se parlamento.", source: "linguística" },
    { fact: "A Torre Eiffel pode crescer até 15 cm no verão devido à expansão térmica do ferro.", source: "física" },
    { fact: "Os elefantes são os únicos animais que não conseguem saltar.", source: "zoologia" },
    { fact: "O continente antártico é o deserto mais seco do planeta.", source: "geografia" },
    { fact: "As impressões digitais dos coalas são quase idênticas às humanas.", source: "biologia" },
    { fact: "Um raio é cinco vezes mais quente que a superfície do sol.", source: "meteorologia" },
    { fact: "O cérebro humano usa 20% da energia total do corpo, apesar de representar apenas 2% do peso.", source: "neurociência" }
  ],
  en: [
    { fact: "Octopuses have three hearts.", source: "wikipedia" },
    { fact: "Honey never spoils. 3000-year-old honey was found in Egyptian tombs and was still edible.", source: "archaeology" },
    { fact: "Bananas are slightly radioactive due to the potassium they contain.", source: "physics" },
    { fact: "A day on Venus is longer than a year on Venus.", source: "astronomy" },
    { fact: "Flamingos are born grey and turn pink due to their diet.", source: "biology" },
    { fact: "A blue whale's heart is so large a human could swim through its arteries.", source: "biology" },
    { fact: "There's more computing power in a modern smartphone than all of NASA had when they sent a man to the Moon.", source: "technology" },
    { fact: "Spiders can't fly, but they can travel hundreds of miles using air currents.", source: "nature" },
    { fact: "A group of owls is called a parliament.", source: "linguistics" },
    { fact: "The Eiffel Tower can grow up to 15cm in summer due to thermal expansion of iron.", source: "physics" },
    { fact: "Elephants are the only animals that can't jump.", source: "zoology" },
    { fact: "Antarctica is the driest desert on the planet.", source: "geography" },
    { fact: "Koala fingerprints are almost identical to human fingerprints.", source: "biology" },
    { fact: "Lightning is five times hotter than the surface of the sun.", source: "meteorology" },
    { fact: "The human brain uses 20% of the body's total energy despite being only 2% of its weight.", source: "neuroscience" }
  ]
};

app.get("/make-server-d9780f4d/funfact", async (c) => {
  try {
    const lang = c.req.query("lang") ?? "en";
    
    // Validate language
    const language = (lang === "pt" || lang === "pt-PT") ? "pt" : "en";
    
    // Get facts for the language
    const facts = FUN_FACTS[language];
    
    // Return random fact
    const randomIndex = Math.floor(Math.random() * facts.length);
    const selectedFact = facts[randomIndex];
    
    console.log(`Returning ${language} fun fact: ${selectedFact.fact.substring(0, 50)}...`);
    
    return c.json({
      lang: language,
      source: selectedFact.source,
      fact: selectedFact.fact
    });
  } catch (err) {
    console.error(`Fun fact error: ${err}`);
    return c.json({ 
      error: true, 
      message: String(err) 
    }, 500);
  }
});

// ===========================================
// HOUSEHOLD MANAGEMENT
// ===========================================

app.post("/make-server-d9780f4d/household/create", async (c) => {
  try {
    const user = await getAuthUser(c);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const { name, userId, userName, userEmail } = await c.req.json();
    
    if (user.id !== userId) return c.json({ error: "User ID mismatch" }, 403);

    const supabase = getAdminClient();
    const joinCode = generateJoinCode();

    // Create household
    const { data: household, error: householdError } = await supabase
      .from('households')
      .insert({
        name,
        join_code: joinCode,
        owner_id: userId
      })
      .select()
      .single();

    if (householdError) {
      console.error("Household creation error:", householdError);
      return c.json({ error: "Failed to create household" }, 500);
    }

    // Add owner as member
    const { error: memberError } = await supabase
      .from('household_members')
      .insert({
        household_id: household.id,
        user_id: userId,
        role: 'owner'
      });

    if (memberError) {
      console.error("Member creation error:", memberError);
      return c.json({ error: "Failed to add owner to household" }, 500);
    }

    console.log(`Created household: ${name} for user ${userId}`);

    // Return formatted response
    return c.json({
      id: household.id,
      name: household.name,
      joinCode: household.join_code,
      members: [{
        id: userId,
        name: userName,
        email: userEmail,
        role: 'owner',
        netIncome: 0,
        incomeSources: []
      }]
    });
  } catch (e) {
    console.error("Create household error:", e);
    return c.json({ error: "Failed to create household" }, 500);
  }
});

app.post("/make-server-d9780f4d/household/join", async (c) => {
  try {
    const user = await getAuthUser(c);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const { joinCode, userId, userName, userEmail } = await c.req.json();
    
    if (user.id !== userId) return c.json({ error: "User ID mismatch" }, 403);
    if (!joinCode) return c.json({ error: "Join code required" }, 400);

    const supabase = getAdminClient();
    const normalizedCode = joinCode.trim().toUpperCase();
    
    // Find household by join code
    const { data: household, error: householdError } = await supabase
      .from('households')
      .select('id, name, join_code, owner_id')
      .eq('join_code', normalizedCode)
      .single();

    if (householdError || !household) {
      return c.json({ error: "Invalid join code" }, 404);
    }

    // Check if already a member
    const { data: existingMember } = await supabase
      .from('household_members')
      .select('user_id')
      .eq('household_id', household.id)
      .eq('user_id', userId)
      .single();

    if (!existingMember) {
      // Add as partner
      const { error: memberError } = await supabase
        .from('household_members')
        .insert({
          household_id: household.id,
          user_id: userId,
          role: 'partner'
        });

      if (memberError) {
        console.error("Join household error:", memberError);
        return c.json({ error: "Failed to join household" }, 500);
      }
    }

    // Load full household data
    const householdData = await loadHouseholdData(supabase, household.id);
    return c.json(householdData);
  } catch (e) {
    console.error("Join household error:", e);
    return c.json({ error: "Failed to join household" }, 500);
  }
});

app.post("/make-server-d9780f4d/household/member", async (c) => {
  try {
    const user = await getAuthUser(c);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const { requesterId, householdId, targetMemberId, role, action } = await c.req.json();
    
    if (user.id !== requesterId) return c.json({ error: "User ID mismatch" }, 403);
    if (!householdId || !targetMemberId) return c.json({ error: "Missing required fields" }, 400);

    const supabase = getAdminClient();

    // Check requester's role
    const { data: requester } = await supabase
      .from('household_members')
      .select('role')
      .eq('household_id', householdId)
      .eq('user_id', requesterId)
      .single();

    if (!requester) return c.json({ error: "Requester not in household" }, 403);

    if (action === 'remove') {
      // Owner can remove anyone, partners can only remove themselves
      if (requesterId !== targetMemberId && requester.role !== 'owner') {
        return c.json({ error: "Only owners can remove other members" }, 403);
      }
      
      const { error } = await supabase
        .from('household_members')
        .delete()
        .eq('household_id', householdId)
        .eq('user_id', targetMemberId);

      if (error) {
        console.error("Remove member error:", error);
        return c.json({ error: "Failed to remove member" }, 500);
      }
    } else if (role) {
      // Only owner can change roles
      if (requester.role !== 'owner') {
        return c.json({ error: "Only owners can manage roles" }, 403);
      }
      
      const { error } = await supabase
        .from('household_members')
        .update({ role })
        .eq('household_id', householdId)
        .eq('user_id', targetMemberId);

      if (error) {
        console.error("Update role error:", error);
        return c.json({ error: "Failed to update role" }, 500);
      }
    }

    // Return updated household data
    const householdData = await loadHouseholdData(supabase, householdId);
    return c.json(householdData);
  } catch (e) {
    console.error("Manage member error:", e);
    return c.json({ error: "Failed to update member" }, 500);
  }
});

app.post("/make-server-d9780f4d/household/update", async (c) => {
  try {
    const user = await getAuthUser(c);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const { requesterId, householdId, name } = await c.req.json();
    
    if (user.id !== requesterId) return c.json({ error: "User ID mismatch" }, 403);
    if (!householdId || !name) return c.json({ error: "Missing required fields" }, 400);

    const supabase = getAdminClient();

    // Check if owner
    const { data: member } = await supabase
      .from('household_members')
      .select('role')
      .eq('household_id', householdId)
      .eq('user_id', requesterId)
      .single();

    if (!member || member.role !== 'owner') {
      return c.json({ error: "Only owners can update household settings" }, 403);
    }

    // Update household name
    const { error } = await supabase
      .from('households')
      .update({ name })
      .eq('id', householdId);

    if (error) {
      console.error("Update household error:", error);
      return c.json({ error: "Failed to update household" }, 500);
    }

    // Return updated household data
    const householdData = await loadHouseholdData(supabase, householdId);
    return c.json(householdData);
  } catch (e) {
    console.error("Update household error:", e);
    return c.json({ error: "Failed to update household" }, 500);
  }
});

app.get("/make-server-d9780f4d/household/user/:userId", async (c) => {
  const userId = c.req.param("userId");
  
  try {
    const supabase = getAdminClient();
    
    // Find household membership
    const { data: membership } = await supabase
      .from('household_members')
      .select('household_id')
      .eq('user_id', userId)
      .single();
    
    if (!membership) return c.json({ found: false });

    // Load household data
    const household = await loadHouseholdData(supabase, membership.household_id);
    return c.json({ found: true, household });
  } catch (e) {
    return c.json({ found: false });
  }
});

// ===========================================
// FINANCE DATA MANAGEMENT
// ===========================================

app.post("/make-server-d9780f4d/finance/save", async (c) => {
  try {
    const user = await getAuthUser(c);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const { userId, data } = await c.req.json();
    if (!userId || !data) return c.json({ error: "Missing input" }, 400);

    if (user.id !== userId) {
      console.error(`Security Alert: User ${user.id} attempted to write data for ${userId}`);
      return c.json({ error: "Access Denied: You can only modify your own data" }, 403);
    }

    // ===========================================
    // A) DATA VALIDATION GUARDS
    // ===========================================
    
    // Validate accounts
    if (data.accounts !== undefined) {
      if (!Array.isArray(data.accounts)) {
        console.error("DATA GUARD: accounts is not an array", typeof data.accounts);
        return c.json({ error: "Refusing to overwrite: accounts must be an array" }, 400);
      }
    }
    
    // Validate incomeSources
    if (data.user?.incomeSources !== undefined) {
      if (!Array.isArray(data.user.incomeSources)) {
        console.error("DATA GUARD: incomeSources is not an array", typeof data.user.incomeSources);
        return c.json({ error: "Refusing to overwrite: incomeSources must be an array" }, 400);
      }
    }
    
    // Validate recurringCosts
    if (data.recurringCosts !== undefined) {
      if (!Array.isArray(data.recurringCosts)) {
        console.error("DATA GUARD: recurringCosts is not an array", typeof data.recurringCosts);
        return c.json({ error: "Refusing to overwrite: recurringCosts must be an array" }, 400);
      }
    }
    
    // Validate debts
    if (data.debts !== undefined) {
      if (!Array.isArray(data.debts)) {
        console.error("DATA GUARD: debts is not an array", typeof data.debts);
        return c.json({ error: "Refusing to overwrite: debts must be an array" }, 400);
      }
    }
    
    // Validate goals
    if (data.goals !== undefined) {
      if (!Array.isArray(data.goals)) {
        console.error("DATA GUARD: goals is not an array", typeof data.goals);
        return c.json({ error: "Refusing to overwrite: goals must be an array" }, 400);
      }
    }

    const supabase = getAdminClient();

    // Get household ID
    const { data: membership } = await supabase
      .from('household_members')
      .select('household_id')
      .eq('user_id', userId)
      .single();

    const householdId = membership?.household_id;

    // ===========================================
    // B) MINIMUM SAFETY RULES - Prevent data wipe
    // ===========================================
    
    // Check existing data counts
    const { count: existingAccountsCount } = await supabase
      .from('accounts')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', userId);
    
    const { count: existingIncomeCount } = await supabase
      .from('income_sources')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    const { count: existingCostsCount } = await supabase
      .from('recurring_costs')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', userId);
    
    const { count: existingDebtsCount } = await supabase
      .from('debts')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', userId);
    
    let existingGoalsCount = 0;
    if (householdId) {
      const { count } = await supabase
        .from('goals')
        .select('*', { count: 'exact', head: true })
        .eq('household_id', householdId);
      existingGoalsCount = count || 0;
    }
    
    // Safety check: prevent wiping existing data with empty payload
    if (data.accounts !== undefined && data.accounts.length === 0 && (existingAccountsCount || 0) > 0) {
      console.error(`SAFETY GUARD: Empty accounts payload detected — refusing to wipe ${existingAccountsCount} existing accounts.`);
      return c.json({ error: `Empty payload detected — refusing to wipe ${existingAccountsCount} accounts.` }, 400);
    }
    
    if (data.user?.incomeSources !== undefined && data.user.incomeSources.length === 0 && (existingIncomeCount || 0) > 0) {
      console.error(`SAFETY GUARD: Empty incomeSources payload detected — refusing to wipe ${existingIncomeCount} existing income sources.`);
      return c.json({ error: `Empty payload detected — refusing to wipe ${existingIncomeCount} income sources.` }, 400);
    }
    
    if (data.recurringCosts !== undefined && data.recurringCosts.length === 0 && (existingCostsCount || 0) > 0) {
      console.error(`SAFETY GUARD: Empty recurringCosts payload detected — refusing to wipe ${existingCostsCount} existing costs.`);
      return c.json({ error: `Empty payload detected — refusing to wipe ${existingCostsCount} recurring costs.` }, 400);
    }
    
    if (data.debts !== undefined && data.debts.length === 0 && (existingDebtsCount || 0) > 0) {
      console.error(`SAFETY GUARD: Empty debts payload detected — refusing to wipe ${existingDebtsCount} existing debts.`);
      return c.json({ error: `Empty payload detected — refusing to wipe ${existingDebtsCount} debts.` }, 400);
    }
    
    if (data.goals !== undefined && existingGoalsCount > 0) {
      console.error(`SAFETY GUARD: Empty goals payload detected — refusing to wipe ${existingGoalsCount} existing goals.`);
      return c.json({ error: `Empty payload detected — refusing to wipe ${existingGoalsCount} goals.` }, 400);
    }

    // ===========================================
    // C) CREATE BACKUPS BEFORE OVERWRITING
    // ===========================================
    
    const backupTimestamp = new Date().toISOString();
    
    // Backup accounts
    if (data.accounts !== undefined && (existingAccountsCount || 0) > 0) {
      const { data: existingAccounts } = await supabase
        .from('accounts')
        .select('*')
        .eq('owner_id', userId);
      
      if (existingAccounts && existingAccounts.length > 0) {
        await supabase.from('accounts_backup').insert(
          existingAccounts.map(acc => ({
            ...acc,
            backup_timestamp: backupTimestamp,
            original_id: acc.id
          }))
        );
        console.log(`✅ Backed up ${existingAccounts.length} accounts`);
      }
    }
    
    // Backup income sources
    if (data.user?.incomeSources !== undefined && (existingIncomeCount || 0) > 0) {
      const { data: existingIncome } = await supabase
        .from('income_sources')
        .select('*')
        .eq('user_id', userId);
      
      if (existingIncome && existingIncome.length > 0) {
        await supabase.from('income_sources_backup').insert(
          existingIncome.map(inc => ({
            ...inc,
            backup_timestamp: backupTimestamp,
            original_id: inc.id
          }))
        );
        console.log(`✅ Backed up ${existingIncome.length} income sources`);
      }
    }
    
    // Backup recurring costs
    if (data.recurringCosts !== undefined && (existingCostsCount || 0) > 0) {
      const { data: existingCosts } = await supabase
        .from('recurring_costs')
        .select('*')
        .eq('owner_id', userId);
      
      if (existingCosts && existingCosts.length > 0) {
        await supabase.from('recurring_costs_backup').insert(
          existingCosts.map(cost => ({
            ...cost,
            backup_timestamp: backupTimestamp,
            original_id: cost.id
          }))
        );
        console.log(`✅ Backed up ${existingCosts.length} recurring costs`);
      }
    }
    
    // Backup debts
    if (data.debts !== undefined && (existingDebtsCount || 0) > 0) {
      const { data: existingDebts } = await supabase
        .from('debts')
        .select('*')
        .eq('owner_id', userId);
      
      if (existingDebts && existingDebts.length > 0) {
        await supabase.from('debts_backup').insert(
          existingDebts.map(debt => ({
            ...debt,
            backup_timestamp: backupTimestamp,
            original_id: debt.id
          }))
        );
        console.log(`✅ Backed up ${existingDebts.length} debts`);
      }
    }
    
    // Backup goals
    if (data.goals !== undefined && householdId && existingGoalsCount > 0) {
      const { data: existingGoals } = await supabase
        .from('goals')
        .select('*')
        .eq('household_id', householdId);
      
      if (existingGoals && existingGoals.length > 0) {
        await supabase.from('goals_backup').insert(
          existingGoals.map(goal => ({
            ...goal,
            backup_timestamp: backupTimestamp,
            original_id: goal.id
          }))
        );
        console.log(`✅ Backed up ${existingGoals.length} goals`);
      }
    }

    // ===========================================
    // PROCEED WITH SAVE OPERATIONS
    // ===========================================

    // Save income sources
    if (data.user?.incomeSources) {
      // Delete existing income sources
      await supabase
        .from('income_sources')
        .delete()
        .eq('user_id', userId);

      // Insert new ones
      if (data.user.incomeSources.length > 0) {
        await supabase
          .from('income_sources')
          .insert(
            data.user.incomeSources.map((source: any) => ({
              id: source.id,
              user_id: userId,
              name: source.name,
              amount: source.amount
            }))
          );
      }
    }

    // Save accounts
    if (data.accounts) {
      // Delete existing accounts owned by this user
      await supabase
        .from('accounts')
        .delete()
        .eq('owner_id', userId);

      // Insert new ones
      if (data.accounts.length > 0) {
        await supabase
          .from('accounts')
          .insert(
            data.accounts.map((account: any) => ({
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
            }))
          );
      }
    }

    // Save recurring costs
    if (data.recurringCosts) {
      // Delete existing costs owned by this user
      await supabase
        .from('recurring_costs')
        .delete()
        .eq('owner_id', userId);

      // Insert new ones
      if (data.recurringCosts.length > 0) {
        await supabase
          .from('recurring_costs')
          .insert(
            data.recurringCosts.map((cost: any) => ({
              id: cost.id,
              name: cost.name,
              amount: cost.amount,
              category: cost.category,
              owner_id: userId,
              household_id: householdId,
              include_in_household: cost.includeInHousehold ?? true
            }))
          );
      }
    }

    // Save debts if present
    if (data.debts) {
      // Delete existing debts owned by this user
      await supabase
        .from('debts')
        .delete()
        .eq('owner_id', userId);

      // Insert new ones
      if (data.debts.length > 0) {
        await supabase
          .from('debts')
          .insert(
            data.debts.map((debt: any) => ({
              id: debt.id,
              name: debt.name,
              total_amount: debt.totalAmount,
              remaining_amount: debt.remainingAmount,
              monthly_payment: debt.monthlyPayment,
              interest_rate: debt.interestRate ?? 0,
              owner_id: userId,
              household_id: householdId,
              include_in_household: debt.includeInHousehold ?? true
            }))
          );
      }
    }

    // Save goals (household-level, only owner can save)
    if (data.goals && householdId) {
      // Check if user is owner
      const { data: member } = await supabase
        .from('household_members')
        .select('role')
        .eq('household_id', householdId)
        .eq('user_id', userId)
        .single();

      if (member?.role === 'owner') {
        // Delete existing goals for household
        await supabase
          .from('goals')
          .delete()
          .eq('household_id', householdId);

        // Insert new ones
        if (data.goals.length > 0) {
          await supabase
            .from('goals')
            .insert(
              data.goals.map((goal: any) => ({
                id: goal.id,
                household_id: householdId,
                name: goal.name,
                category: goal.category,
                is_main: goal.isMain ?? false,
                target_amount: goal.targetAmount,
                current_amount: goal.currentAmount ?? 0,
                deadline: goal.deadline,
                property_value: goal.propertyValue
              }))
            );
        }
      }
    }

    // Save user settings
    await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        currency: data.currency ?? 'EUR',
        theme: data.theme ?? 'light',
        emergency_fund_goal: data.emergencyFundGoal ?? 10000,
        is_variable_income: data.isVariableIncome ?? false,
        variable_spending: data.variableSpending ?? 0
      });

    return c.json({ success: true });
  } catch (e) {
    console.error("Save finance data error:", e);
    return c.json({ error: "Failed to save data" }, 500);
  }
});

app.get("/make-server-d9780f4d/finance/load-household/:userId", async (c) => {
  const userId = c.req.param("userId");
  
  console.log(`📥 [load-household] Request for userId: ${userId}`);
  
  const user = await getAuthUser(c);
  
  if (!user) {
    console.error(`❌ [load-household] No authenticated user found`);
    return c.json({ error: "Unauthorized" }, 401);
  }
  
  console.log(`✅ [load-household] Authenticated user: ${user.id}`);
  
  if (user.id !== userId) {
    console.error(`❌ [load-household] User ID mismatch: ${user.id} !== ${userId}`);
    return c.json({ error: "Access Denied" }, 403);
  }

  try {
    const supabase = getAdminClient();

    // Get user's household membership
    const { data: membership } = await supabase
      .from('household_members')
      .select('household_id, role')
      .eq('user_id', userId)
      .single();

    if (!membership) {
      console.log(`⚠️ [load-household] No household membership found for user ${userId}`);
      return c.json({ found: false });
    }

    console.log(`📊 [load-household] Loading data for household ${membership.household_id}`);

    const householdId = membership.household_id;

    // Load all household data in parallel
    const [
      householdData,
      userSettings,
      incomeSources,
      accounts,
      recurringCosts,
      debts,
      goals,
      snapshots
    ] = await Promise.all([
      loadHouseholdData(supabase, householdId),
      loadUserSettings(supabase, userId),
      loadIncomeSources(supabase, householdId),
      loadAccounts(supabase, householdId),
      loadRecurringCosts(supabase, householdId),
      loadDebts(supabase, householdId),
      loadGoals(supabase, householdId),
      loadSnapshots(supabase, householdId)
    ]);

    // Find current user in household
    const currentUserMember = householdData.members.find((m: any) => m.id === userId);
    
    // Build response matching expected format
    const aggregatedData = {
      user: {
        id: userId,
        name: currentUserMember?.name || '',
        email: currentUserMember?.email || '',
        role: membership.role,
        netIncome: currentUserMember?.netIncome || 0,
        incomeSources: currentUserMember?.incomeSources || []
      },
      household: {
        ...householdData,
        monthlySnapshots: snapshots
      },
      accounts,
      recurringCosts,
      debts,
      goals,
      ...userSettings
    };

    return c.json({ found: true, data: aggregatedData });
  } catch (e) {
    console.error("Load household finance data error:", e);
    return c.json({ error: "Failed to load data" }, 500);
  }
});

app.get("/make-server-d9780f4d/finance/load/:userId", async (c) => {
  const userId = c.req.param("userId");
  const user = await getAuthUser(c);
  
  if (!user || user.id !== userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const supabase = getAdminClient();

    // Load user settings and income sources
    const [userSettings, incomeSources] = await Promise.all([
      loadUserSettings(supabase, userId),
      supabase
        .from('income_sources')
        .select('*')
        .eq('user_id', userId)
    ]);

    const data = {
      user: {
        id: userId,
        name: user.user_metadata?.name || '',
        email: user.email || '',
        netIncome: incomeSources.data?.reduce((sum: number, s: any) => sum + parseFloat(s.amount), 0) || 0,
        incomeSources: incomeSources.data?.map((s: any) => ({
          id: s.id,
          name: s.name,
          amount: parseFloat(s.amount),
          ownerId: s.user_id
        })) || []
      },
      accounts: [],
      recurringCosts: [],
      debts: [],
      goals: [],
      ...userSettings
    };

    return c.json({ found: true, data });
  } catch (e) {
    console.error("Load finance data error:", e);
    return c.json({ error: "Failed to load data" }, 500);
  }
});

// ===========================================
// MONTHLY SNAPSHOTS
// ===========================================

app.post("/make-server-d9780f4d/household/save", async (c) => {
  try {
    const user = await getAuthUser(c);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const { userId, household } = await c.req.json();
    
    if (user.id !== userId) return c.json({ error: "User ID mismatch" }, 403);
    if (!household || !household.id) return c.json({ error: "Missing household data" }, 400);

    const supabase = getAdminClient();

    // Verify user is owner
    const { data: member } = await supabase
      .from('household_members')
      .select('role')
      .eq('household_id', household.id)
      .eq('user_id', userId)
      .single();

    if (!member || member.role !== 'owner') {
      return c.json({ error: "Only owners can save household data" }, 403);
    }

    // Save monthly snapshots if present
    if (household.monthlySnapshots && Array.isArray(household.monthlySnapshots)) {
      for (const snapshot of household.monthlySnapshots) {
        await supabase
          .from('monthly_snapshots')
          .upsert({
            household_id: household.id,
            month: snapshot.month,
            net_worth: snapshot.netWorth,
            total_cash: snapshot.totalCash,
            timestamp: snapshot.timestamp
          }, {
            onConflict: 'household_id,month'
          });
      }
    }

    console.log(`Household data saved independently by owner ${userId}`);
    return c.json({ success: true });
  } catch (e) {
    console.error("Save household error:", e);
    return c.json({ error: "Failed to save household" }, 500);
  }
});

// ===========================================
// HELPER FUNCTIONS
// ===========================================

async function loadHouseholdData(supabase: any, householdId: string) {
  // Load household info
  const { data: household } = await supabase
    .from('households')
    .select('id, name, join_code, owner_id')
    .eq('id', householdId)
    .single();

  // Load members with their income
  const { data: members } = await supabase
    .from('household_members')
    .select(`
      user_id,
      role,
      users (
        name,
        email
      )
    `)
    .eq('household_id', householdId);

  // Load income sources for all members
  const memberIds = members?.map((m: any) => m.user_id) || [];
  const { data: allIncome } = await supabase
    .from('income_sources')
    .select('*')
    .in('user_id', memberIds);

  // Build members array with income
  const membersWithIncome = members?.map((m: any) => {
    const income = allIncome?.filter((i: any) => i.user_id === m.user_id) || [];
    const netIncome = income.reduce((sum: number, i: any) => sum + parseFloat(i.amount), 0);
    
    return {
      id: m.user_id,
      name: m.users.name,
      email: m.users.email,
      role: m.role,
      netIncome,
      incomeSources: income.map((i: any) => ({
        id: i.id,
        name: i.name,
        amount: parseFloat(i.amount),
        ownerId: i.user_id
      }))
    };
  }) || [];

  return {
    id: household.id,
    name: household.name,
    joinCode: household.join_code,
    members: membersWithIncome
  };
}

async function loadUserSettings(supabase: any, userId: string) {
  const { data: settings } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  return {
    currency: settings?.currency || 'EUR',
    theme: settings?.theme || 'light',
    emergencyFundGoal: settings?.emergency_fund_goal || 10000,
    isVariableIncome: settings?.is_variable_income || false,
    variableSpending: settings?.variable_spending || 0
  };
}

async function loadIncomeSources(supabase: any, householdId: string) {
  // Get all members
  const { data: members } = await supabase
    .from('household_members')
    .select('user_id')
    .eq('household_id', householdId);

  const memberIds = members?.map((m: any) => m.user_id) || [];
  
  const { data } = await supabase
    .from('income_sources')
    .select('*')
    .in('user_id', memberIds);

  return data?.map((i: any) => ({
    id: i.id,
    name: i.name,
    amount: parseFloat(i.amount),
    ownerId: i.user_id
  })) || [];
}

async function loadAccounts(supabase: any, householdId: string) {
  const { data } = await supabase
    .from('accounts')
    .select('*')
    .eq('household_id', householdId);

  return data?.map((a: any) => ({
    id: a.id,
    name: a.name,
    balance: parseFloat(a.balance),
    institution: a.institution,
    type: a.type,
    currency: a.currency,
    ownerId: a.owner_id,
    includeInHousehold: a.include_in_household,
    apy: parseFloat(a.apy)
  })) || [];
}

async function loadRecurringCosts(supabase: any, householdId: string) {
  const { data } = await supabase
    .from('recurring_costs')
    .select('*')
    .eq('household_id', householdId);

  return data?.map((c: any) => ({
    id: c.id,
    name: c.name,
    amount: parseFloat(c.amount),
    category: c.category,
    ownerId: c.owner_id,
    includeInHousehold: c.include_in_household
  })) || [];
}

async function loadDebts(supabase: any, householdId: string) {
  const { data } = await supabase
    .from('debts')
    .select('*')
    .eq('household_id', householdId);

  return data?.map((d: any) => ({
    id: d.id,
    name: d.name,
    totalAmount: parseFloat(d.total_amount),
    remainingAmount: parseFloat(d.remaining_amount),
    monthlyPayment: parseFloat(d.monthly_payment),
    interestRate: parseFloat(d.interest_rate),
    ownerId: d.owner_id,
    includeInHousehold: d.include_in_household
  })) || [];
}

async function loadGoals(supabase: any, householdId: string) {
  const { data } = await supabase
    .from('goals')
    .select('*')
    .eq('household_id', householdId);

  return data?.map((g: any) => ({
    id: g.id,
    name: g.name,
    category: g.category,
    isMain: g.is_main,
    targetAmount: parseFloat(g.target_amount),
    currentAmount: parseFloat(g.current_amount),
    deadline: g.deadline,
    propertyValue: g.property_value ? parseFloat(g.property_value) : undefined
  })) || [];
}

async function loadSnapshots(supabase: any, householdId: string) {
  const { data } = await supabase
    .from('monthly_snapshots')
    .select('*')
    .eq('household_id', householdId)
    .order('month', { ascending: false });

  return data?.map((s: any) => ({
    month: s.month,
    netWorth: parseFloat(s.net_worth),
    totalCash: parseFloat(s.total_cash),
    timestamp: s.timestamp
  })) || [];
}

// ===========================================
// HEALTH CHECK
// ===========================================

app.get("/make-server-d9780f4d/health", (c) => c.json({ status: "ok" }));

// Debug endpoint - check what token we're receiving
app.post("/make-server-d9780f4d/debug-auth", async (c) => {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader) {
    return c.json({ 
      error: "No auth header",
      headers: Object.fromEntries(c.req.raw.headers.entries())
    });
  }
  
  const token = authHeader.replace('Bearer ', '');
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  );
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  return c.json({
    receivedHeader: authHeader.substring(0, 50) + "...",
    tokenLength: token.length,
    tokenPreview: token.substring(0, 30) + "...",
    authError: error ? { message: error.message, status: error.status, name: error.name } : null,
    user: user ? { id: user.id, email: user.email } : null,
    supabaseUrl: Deno.env.get('SUPABASE_URL'),
    hasAnonKey: !!Deno.env.get('SUPABASE_ANON_KEY')
  });
});

// ===========================================
// DATA MIGRATION (ONE-TIME USE)
// ===========================================

app.post("/make-server-d9780f4d/migrate", async (c) => {
  try {
    const user = await getAuthUser(c);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    console.log("Starting migration from KV store to relational schema...");
    const results = await migrateData();
    console.log("Migration completed:", results);
    
    return c.json({
      success: true,
      message: "Migration completed",
      results
    });
  } catch (e) {
    console.error("Migration failed:", e);
    return c.json({ error: "Migration failed", details: e.message }, 500);
  }
});

// ===========================================
// USER SETTINGS
// ===========================================

app.post("/make-server-d9780f4d/user-settings", async (c) => {
  try {
    const user = await getAuthUser(c);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const { userId, language } = await c.req.json();
    
    if (user.id !== userId) return c.json({ error: "User ID mismatch" }, 403);
    if (!language) return c.json({ error: "Language is required" }, 400);

    const supabase = getAdminClient();

    // Update user settings with language preference
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        language: language
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error("Update user settings error:", error);
      return c.json({ error: "Failed to update language setting" }, 500);
    }

    return c.json({ success: true, language });
  } catch (e) {
    console.error("Update user settings error:", e);
    return c.json({ error: "Failed to update language setting" }, 500);
  }
});

Deno.serve(app.fetch);