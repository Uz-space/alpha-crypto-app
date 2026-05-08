import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "No auth" }), { status: 401, headers: corsHeaders });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify caller is admin
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    if (!userData.user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const { data: isAdmin } = await userClient.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (!isAdmin) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: corsHeaders });

    // Admin client
    const admin = createClient(supabaseUrl, serviceKey);
    const { data: list, error } = await admin.auth.admin.listUsers({ perPage: 200 });
    if (error) throw error;

    // Get login events for stats
    const { data: events } = await admin
      .from("login_events")
      .select("user_id, created_at");

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const stats = new Map<string, { total: number; today: number }>();
    (events ?? []).forEach((e: any) => {
      const s = stats.get(e.user_id) ?? { total: 0, today: 0 };
      s.total += 1;
      if (new Date(e.created_at) >= startOfDay) s.today += 1;
      stats.set(e.user_id, s);
    });

    // Get roles
    const { data: roles } = await admin.from("user_roles").select("user_id, role");
    const roleMap = new Map<string, string[]>();
    (roles ?? []).forEach((r: any) => {
      const arr = roleMap.get(r.user_id) ?? [];
      arr.push(r.role);
      roleMap.set(r.user_id, arr);
    });

    const users = list.users.map((u) => {
      const email = u.email ?? "";
      const username = email.includes("@") ? email.split("@")[0] : email;
      const s = stats.get(u.id) ?? { total: 0, today: 0 };
      return {
        id: u.id,
        username,
        email,
        last_sign_in_at: u.last_sign_in_at,
        created_at: u.created_at,
        total_logins: s.total,
        today_logins: s.today,
        roles: roleMap.get(u.id) ?? [],
      };
    });

    return new Response(JSON.stringify({ users }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
  }
});
