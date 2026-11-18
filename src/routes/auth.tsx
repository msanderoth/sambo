import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { signInWithUsername } from "@/lib/auth.functions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import samboLogo from "@/assets/sambo-logo.svg.asset.json";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({ redirect: typeof s["redirect"] === "string" ? s["redirect"] : undefined }),
  head: () => ({ meta: [{ title: "Logga in – SAMBO" }, { name: "description", content: "Logga in på ert hushåll i SAMBO." }, { property: "og:title", content: "Logga in – SAMBO" }, { property: "og:description", content: "Logga in på ert hushåll i SAMBO." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: AuthPage,
});

const signupSchema = z.object({
  username: z.string().trim().toLowerCase().regex(/^[a-z0-9_.-]{3,30}$/, "Användarnamnet ska vara 3–30 tecken: bokstäver a–z, siffror, punkt, bindestreck eller understreck"),
  email: z.string().trim().email("Ogiltig e-postadress").max(255),
  password: z.string().min(8, "Lösenordet måste vara minst 8 tecken").max(200),
});

function AuthPage() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  const done = () => navigate({ to: redirect?.startsWith("/") && !redirect.startsWith("//") ? redirect : "/", replace: true });

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(""); setInfo(""); setBusy(true);
    try {
      if (mode === "in") {
        const id = username.trim();
        if (id.includes("@")) {
          const { error } = await supabase.auth.signInWithPassword({ email: id, password });
          if (error) return setError(error.message.includes("confirmed") ? "Bekräfta e-posten först via länken i mejlet" : "Fel användarnamn eller lösenord");
        } else {
          const r = await signInWithUsername({ data: { username: id, password } });
          if (!r.ok) return setError(r.error);
          await supabase.auth.setSession({ access_token: r.access_token, refresh_token: r.refresh_token });
        }
        await done();
      } else {
        const p = signupSchema.safeParse({ username, email, password });
        if (!p.success) return setError(p.error.issues[0]?.message ?? "Kontrollera fälten");
        const { data, error } = await supabase.auth.signUp({ email: p.data.email, password: p.data.password, options: { emailRedirectTo: window.location.origin, data: { username: p.data.username } } });
        if (error) return setError(/already registered/i.test(error.message) ? "E-postadressen används redan" : /weak|pwned/i.test(error.message) ? "Lösenordet är för lätt att gissa, välj ett annat" : error.message.includes("Database error") ? "Användarnamnet är upptaget eller ogiltigt" : error.message);
        if (data.session) await done();
        else { setInfo("Kolla din e-post och klicka på länken för att bekräfta kontot. Sedan kan du logga in."); setMode("in"); }
      }
    } catch { setError("Något gick fel, försök igen"); }
    finally { setBusy(false); }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 pt-3 text-task-ink">
      <img src={samboLogo.url} alt="SAMBO" width={123} height={40} className="mx-auto h-12 w-auto" />
      <h1 className="mb-7 mt-1 text-center text-xl font-bold uppercase">{mode === "in" ? "Logga in" : "Skapa hushåll"}</h1>
      <form onSubmit={submit} className="space-y-6">
        <div className="space-y-1">
          <Label htmlFor="username" className="text-base font-semibold">{mode === "in" ? "Användarnamn eller e-post" : "Användarnamn"}</Label>
          <Input id="username" className="task-sheet-field" autoComplete="username" value={username} maxLength={255} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        {mode === "up" && <div className="space-y-1">
          <Label htmlFor="email" className="text-base font-semibold">E-post</Label>
          <Input id="email" type="email" className="task-sheet-field" autoComplete="email" value={email} maxLength={255} onChange={(e) => setEmail(e.target.value)} required />
        </div>}
        <div className="space-y-1">
          <Label htmlFor="password" className="text-base font-semibold">Lösenord</Label>
          <Input id="password" type="password" className="task-sheet-field" autoComplete={mode === "in" ? "current-password" : "new-password"} value={password} maxLength={200} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        {info && <p role="status" className="text-sm">{info}</p>}
        <div className="flex items-center justify-between gap-4">
          <button type="button" className="text-sm underline" onClick={() => { setMode(mode === "in" ? "up" : "in"); setError(""); setInfo(""); }}>
            {mode === "in" ? "Nytt hushåll? Skapa konto" : "Har redan konto? Logga in"}
          </button>
          <Button type="submit" disabled={busy} className="h-10 rounded-full bg-task-ink px-6 text-base font-normal text-task-field shadow-task-field hover:bg-task-ink/90">
            {mode === "in" ? "Logga in" : "Skapa"}
          </Button>
        </div>
      </form>
    </div>
  );
}
