import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

// --- Admin KV (Bypass RLS for Household Management) ---
const adminKv = {
  get: async (key: string) => {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data } = await supabase.from("kv_store_d9780f4d").select("value").eq("key", key).maybeSingle();
    return data?.value;
  },
  set: async (key: string, value: any) => {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { error } = await supabase.from("kv_store_d9780f4d").upsert({ key, value });
    if (error) throw new Error(error.message);
  },
  del: async (key: string) => {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { error } = await supabase.from("kv_store_d9780f4d").delete().eq("key", key);
    if (error) throw new Error(error.message);
  }
};

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// --- Auth Helper ---
async function getAuthUser(c: any) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader) return null;
  
  const token = authHeader.replace('Bearer ', '');
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  );
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

// --- Signup ---
app.post("/make-server-d9780f4d/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true
    })

    if (error) {
        console.error("Signup error:", error);
        return c.json({ error: error.message }, 400);
    }
    return c.json(data);
  } catch (e) {
      console.error("Signup exception:", e);
      return c.json({ error: "Internal Server Error" }, 500);
    }
});

// --- Household Management ---

function generateJoinCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

app.post("/make-server-d9780f4d/household/create", async (c) => {
    try {
        const user = await getAuthUser(c);
        if (!user) return c.json({ error: "Unauthorized" }, 401);

        const { name, userId, userName, userEmail } = await c.req.json();
        
        // Strict Owner Check
        if (user.id !== userId) return c.json({ error: "User ID mismatch" }, 403);

        const joinCode = generateJoinCode();
        const householdId = crypto.randomUUID();

        const household = {
            id: householdId,
            name,
            joinCode,
            members: [{
                id: userId,
                name: userName,
                email: userEmail,
                role: 'owner',
                netIncome: 0,
                incomeSources: []
            }]
        };

        console.log(`Creating household: ${name} for user ${userId}`);

        // New Key Scheme
        await adminKv.set(`household/code/${joinCode}`, householdId);
        await adminKv.set(`household/${householdId}/data`, JSON.stringify(household));
        await adminKv.set(`user/${userId}/household`, householdId);

        return c.json(household);
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

        const normalizedCode = joinCode.trim().toUpperCase();
        
        // Lookup ID (try new key first, then old)
        let householdId = await adminKv.get(`household/code/${normalizedCode}`);
        if (!householdId) {
            // Legacy check
            householdId = await adminKv.get(`household:code:${normalizedCode}`);
            if (householdId) {
                // Migrate code map
                await adminKv.set(`household/code/${normalizedCode}`, householdId);
            }
        }
        
        if (!householdId) {
            return c.json({ error: "Invalid join code" }, 404);
        }

        // Get Data (try new key first, then old)
        let rawHousehold = await adminKv.get(`household/${householdId}/data`);
        if (!rawHousehold) {
            rawHousehold = await adminKv.get(`household:data:${householdId}`);
        }

        if (!rawHousehold) return c.json({ error: "Household not found" }, 404);

        let household;
        try {
            household = typeof rawHousehold === 'string' ? JSON.parse(rawHousehold) : rawHousehold;
        } catch (e) {
            household = rawHousehold;
        }

        // Add Member if not exists
        if (!household.members.find((m: any) => m.id === userId)) {
            household.members.push({
                id: userId,
                name: userName,
                email: userEmail,
                role: 'partner',
                netIncome: 0,
                incomeSources: []
            });
            
            // Write to NEW key
            await adminKv.set(`household/${householdId}/data`, JSON.stringify(household));
            // Map User -> Household (New Key)
            await adminKv.set(`user/${userId}/household`, householdId);
        }

        return c.json(household);
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

        // Get Household
        let rawHousehold = await adminKv.get(`household/${householdId}/data`);
        if (!rawHousehold) rawHousehold = await adminKv.get(`household:data:${householdId}`);
        
        if (!rawHousehold) return c.json({ error: "Household not found" }, 404);

        let household;
        try {
            household = typeof rawHousehold === 'string' ? JSON.parse(rawHousehold) : rawHousehold;
        } catch (e) {
            household = rawHousehold;
        }

        const requester = household.members.find((m: any) => m.id === requesterId);
        if (!requester) return c.json({ error: "Requester not in household" }, 403);

        // Permissions Check
        if (action === 'remove') {
            // Owner can remove anyone (except themselves if they are the only owner? - simplifed: allow removing self)
            // Partners can remove themselves
            if (requesterId !== targetMemberId && requester.role !== 'owner') {
                 return c.json({ error: "Only owners can remove other members" }, 403);
            }
            
            household.members = household.members.filter((m: any) => m.id !== targetMemberId);
            
            // If removed self, delete user->household mapping
            if (targetMemberId) {
                 await adminKv.del(`user/${targetMemberId}/household`);
            }
        } else if (role) {
             // Only owner can change roles
             if (requester.role !== 'owner') {
                 return c.json({ error: "Only owners can manage roles" }, 403);
             }
             
             const memberIndex = household.members.findIndex((m: any) => m.id === targetMemberId);
             if (memberIndex !== -1) {
                 household.members[memberIndex].role = role;
             }
        }

        // Save
        await adminKv.set(`household/${householdId}/data`, JSON.stringify(household));
        return c.json(household);

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

        // Get Household
        let rawHousehold = await adminKv.get(`household/${householdId}/data`);
        if (!rawHousehold) rawHousehold = await adminKv.get(`household:data:${householdId}`);
        
        if (!rawHousehold) return c.json({ error: "Household not found" }, 404);

        let household;
        try {
            household = typeof rawHousehold === 'string' ? JSON.parse(rawHousehold) : rawHousehold;
        } catch (e) {
            household = rawHousehold;
        }

        const requester = household.members.find((m: any) => m.id === requesterId);
        if (!requester) return c.json({ error: "Requester not in household" }, 403);
        if (requester.role !== 'owner') return c.json({ error: "Only owners can update household settings" }, 403);

        // Update
        household.name = name;
        
        // Save
        await adminKv.set(`household/${householdId}/data`, JSON.stringify(household));
        return c.json(household);

    } catch (e) {
        console.error("Update household error:", e);
        return c.json({ error: "Failed to update household" }, 500);
    }
});

app.get("/make-server-d9780f4d/household/user/:userId", async (c) => {
    const userId = c.req.param("userId");
    
    try {
        // Check new key
        let householdId = await adminKv.get(`user/${userId}/household`);
        if (!householdId) {
            // Check legacy key
            householdId = await adminKv.get(`user:household:${userId}`);
        }
        
        if (!householdId) return c.json({ found: false });

        // Check data existence and return it
        let rawHousehold = await adminKv.get(`household/${householdId}/data`);
        if (!rawHousehold) rawHousehold = await adminKv.get(`household:data:${householdId}`);

        if (!rawHousehold) return c.json({ found: false });

        let household;
        try {
            household = typeof rawHousehold === 'string' ? JSON.parse(rawHousehold) : rawHousehold;
        } catch (e) {
            household = rawHousehold;
        }

        return c.json({ found: true, household });
    } catch (e) {
        return c.json({ found: false });
    }
});

// --- Finance Data Persistence ---

app.post("/make-server-d9780f4d/finance/save", async (c) => {
    try {
        const user = await getAuthUser(c);
        if (!user) return c.json({ error: "Unauthorized" }, 401);

        const { userId, data } = await c.req.json();
        if (!userId || !data) return c.json({ error: "Missing input" }, 400);

        // STRICT: Ensure authenticated user matches the data owner
        if (user.id !== userId) {
             console.error(`Security Alert: User ${user.id} attempted to write data for ${userId}`);
             return c.json({ error: "Access Denied: You can only modify your own data" }, 403);
        }

        // SUPER STRICT: Ensure the DATA BLOB ITSELF belongs to the user
        // This prevents "mixed" blobs from being saved to the correct key
        if (data.user && data.user.id && data.user.id !== user.id) {
             console.error(`Security Alert: User ${user.id} attempted to save data belonging to ${data.user.id}`);
             return c.json({ error: "User mismatch: refusing to write finance data" }, 403);
        }

        // 1. Use NEW Namespaced Key: user/<userId>/finance
        const newKey = `user/${userId}/finance`;
        // Using adminKv to ensure write even if RLS is finicky, though Anon Key *should* work for own data.
        // But strictly speaking, Service Role is safer for server-side logic.
        await adminKv.set(newKey, JSON.stringify(data));

        // 2. MIGRATION: Delete LEGACY Key if it exists
        // This ensures we don't leave stale "finance:data:UUID" keys around
        const legacyKey = `finance:data:${userId}`;
        try {
             await adminKv.del(legacyKey);
        } catch (err) {
             // ignore
        }
        
        return c.json({ success: true });
    } catch (e) {
        console.error("Save finance data error:", e);
        return c.json({ error: "Failed to save data" }, 500);
    }
});

app.get("/make-server-d9780f4d/finance/load-household/:userId", async (c) => {
    const userId = c.req.param("userId");
    const user = await getAuthUser(c);
    
    // Strict Read Policy
    if (!user) return c.json({ error: "Unauthorized" }, 401);
    if (user.id !== userId) return c.json({ error: "Access Denied" }, 403);

    try {
        // 1. Resolve Household ID (New -> Old)
        let householdId = await adminKv.get(`user/${userId}/household`);
        if (!householdId) householdId = await adminKv.get(`user:household:${userId}`);
        
        let members = [userId];
        let householdData = null;

        if (householdId) {
             let rawHousehold = await adminKv.get(`household/${householdId}/data`);
             if (!rawHousehold) rawHousehold = await adminKv.get(`household:data:${householdId}`);
             
             if (rawHousehold) {
                 try {
                     householdData = typeof rawHousehold === 'string' ? JSON.parse(rawHousehold) : rawHousehold;
                     if (householdData && householdData.members) {
                         members = householdData.members.map((m: any) => m.id);
                     }
                 } catch (e) {
                     console.error("Error parsing household", e);
                 }
             }
        }

        // 2. Load data for all members
        const newKeys = members.map(id => `user/${id}/finance`);
        const oldKeys = members.map(id => `finance:data:${id}`);
        
        // Use adminKv for mget (custom implementation needed since adminKv doesn't have mget yet)
        // or just iterate. mget is better.
        // Let's implement mget in adminKv or just map promises.
        
        const mget = async (keys: string[]) => {
             const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
             const { data } = await supabase.from("kv_store_d9780f4d").select("value").in("key", keys);
             // We need to map results back to order? 
             // Postgres 'in' does not guarantee order.
             // But our logic relies on index.
             // Let's just do Promise.all(keys.map(k => get(k)))
             return Promise.all(keys.map(k => adminKv.get(k)));
        };

        const [newResults, oldResults] = await Promise.all([
            mget(newKeys),
            mget(oldKeys)
        ]);
        
        const aggregatedData: any = {
            accounts: [],
            recurringCosts: [],
            goals: [],
            user: null,
            household: householdData
        };
        
        const keysToDelete: string[] = [];

        // 3. Merge Data with STRICT Verification & SELF-HEALING
        members.forEach((memberId: string, index: number) => {
            let raw = newResults[index];
            let keyToDelete = null;
            let loadedFromLegacy = false;
            
            // If new key exists, check it first
            if (raw) {
                try {
                    const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
                     if (data.user && data.user.id && data.user.id !== memberId) {
                         console.warn(`[Security] Mismatch detected in KV blob (new key), ignoring. Member: ${memberId}, Data: ${data.user.id}`);
                         keyToDelete = newKeys[index];
                         raw = null; // Invalidate this data
                     }
                } catch (e) {
                    // If parse fails, it's garbage.
                }
            }

            // Fallback to legacy if new key was missing OR corrupt/invalidated
            if (!raw && oldResults[index]) {
                raw = oldResults[index];
                loadedFromLegacy = true;
                // Check legacy validity
                try {
                    const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
                     if (data.user && data.user.id && data.user.id !== memberId) {
                         console.warn(`[Security] Mismatch detected in KV blob (legacy key), ignoring. Member: ${memberId}, Data: ${data.user.id}`);
                         keyToDelete = oldKeys[index]; // Mark legacy key for deletion
                         raw = null; // Invalidate this data
                     }
                } catch (e) {
                    // If parse fails, it's garbage.
                }
            }
            
            // Queue deletion if ANY key was found corrupt
            if (keyToDelete) {
                keysToDelete.push(keyToDelete);
            }
            
            if (!raw) return; // No valid data found for this member

            try {
                const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
                
                // Double check (Redundant but safe)
                if (data.user && data.user.id && data.user.id !== memberId) return;

                // Set main user
                if (memberId === userId) {
                    aggregatedData.user = data.user;
                    aggregatedData.emergencyFundGoal = data.emergencyFundGoal;
                    aggregatedData.currency = data.currency;
                    aggregatedData.theme = data.theme;
                    aggregatedData.variableSpending = data.variableSpending;
                    aggregatedData.marketData = data.marketData;
                }

                // Update household member profile
                if (aggregatedData.household && aggregatedData.household.members && data.user) {
                    const memberIndex = aggregatedData.household.members.findIndex((m: any) => m.id === memberId);
                    if (memberIndex !== -1) {
                         aggregatedData.household.members[memberIndex] = {
                             ...aggregatedData.household.members[memberIndex],
                             name: data.user.name,
                             email: data.user.email,
                             netIncome: data.user.netIncome,
                             incomeSources: data.user.incomeSources
                         };
                    }
                }

                // Merge lists
                if (data.accounts) aggregatedData.accounts.push(...data.accounts);
                if (data.recurringCosts) aggregatedData.recurringCosts.push(...data.recurringCosts);
                if (data.goals) aggregatedData.goals.push(...data.goals);
                
            } catch (e) {
                console.error(`Error parsing data for member ${memberId}`, e);
            }
        });

        // EXECUTE SELF-HEALING
        if (keysToDelete.length > 0) {
            // Clean array
            const uniqueKeys = [...new Set(keysToDelete)];
            // Use adminKv.del for each (since we didn't implement mdel on adminKv global, and kv.mdel fails RLS)
            await Promise.all(uniqueKeys.map(k => adminKv.del(k)));
            console.log(`Successfully deleted ${uniqueKeys.length} corrupt keys to self-heal.`);
        }

        if (!aggregatedData.user) {
             return c.json({ found: false });
        }
        
        // STRICT ROLE ENFORCEMENT
        // Override the user's self-reported role with the authority from the Household object
        if (aggregatedData.user && aggregatedData.household && aggregatedData.household.members) {
            const memberRecord = aggregatedData.household.members.find((m: any) => m.id === aggregatedData.user.id);
            if (memberRecord) {
                aggregatedData.user.role = memberRecord.role;
            }
        }
        
        // Deduplicate
        const unique = (arr: any[]) => Array.from(new Map(arr.map((item: any) => [item.id, item])).values());
        aggregatedData.accounts = unique(aggregatedData.accounts);
        aggregatedData.recurringCosts = unique(aggregatedData.recurringCosts);
        aggregatedData.goals = unique(aggregatedData.goals);

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
        // Try new key
        let rawData = await kv.get(`user/${userId}/finance`);
        if (rawData) {
             try {
                 const data = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
                 if (data.user && data.user.id !== userId) {
                     console.warn(`[Security] Mismatch detected in KV blob (new key), ignoring.`);
                     await kv.del(`user/${userId}/finance`);
                     rawData = null;
                 }
             } catch(e) {}
        }
        
        // Fallback to old key + Self-Healing
        if (!rawData) {
            const legacyKey = `finance:data:${userId}`;
            rawData = await kv.get(legacyKey);
            
            if (rawData) {
                 try {
                     const data = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
                     // Verify ID
                     if (data.user && data.user.id !== userId) {
                         console.warn(`[Security] Mismatch detected in KV blob (legacy key), ignoring.`);
                         await kv.del(legacyKey);
                         return c.json({ found: false });
                     }
                 } catch (e) {
                     // ignore parse error
                 }
            }
        }
        
        if (!rawData) return c.json({ found: false });

        let data;
        try {
            data = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
        } catch (e) {
            data = rawData;
        }

        return c.json({ found: true, data });
    } catch (e) {
        return c.json({ error: "Failed to load data" }, 500);
    }
});

app.get("/make-server-d9780f4d/health", (c) => c.json({ status: "ok" }));

Deno.serve(app.fetch);