import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

// Username sign-in: the server resolves the household's email so it is never exposed to visitors.
export const signInWithUsername = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ username: z.string().trim().min(1).max(30), password: z.string().min(1).max(200) }).parse(d))
  .handler(async ({ data }) => {
    const fail = { ok: false as const, error: "Fel användarnamn eller lösenord" };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: hh } = await supabaseAdmin.from("households").select("id").eq("username", data.username.toLowerCase()).maybeSingle();
    if (!hh) return fail;
    const { data: members } = await supabaseAdmin.from("household_members").select("user_id").eq("household_id", hh.id).order("created_at").limit(1);
    const uid = members?.[0]?.user_id;
    if (!uid) return fail;
    const { data: u } = await supabaseAdmin.auth.admin.getUserById(uid);
    const email = u.user?.email;
    if (!email) return fail;
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
    const client = createClient(process.env["SUPABASE_URL"]!, key, {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
      ...(key.startsWith("sb_") ? { global: { fetch: (input, init) => { const h = new Headers(init?.headers); if (h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization"); h.set("apikey", key); return fetch(input, { ...init, headers: h }); } } } : {}),
    });
    const { data: s, error } = await client.auth.signInWithPassword({ email, password: data.password });
    if (error || !s.session) return { ok: false as const, error: error?.message?.includes("confirmed") ? "Bekräfta e-posten först via länken i mejlet" : fail.error };
    return { ok: true as const, access_token: s.session.access_token, refresh_token: s.session.refresh_token };
  });
