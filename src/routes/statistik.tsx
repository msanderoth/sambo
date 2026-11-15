import { createFileRoute } from "@tanstack/react-router";
import { Page } from "@/components/sambo/AppShell";
import { Section } from "@/components/sambo/TaskCard";
import { useSambo } from "@/lib/sambo-store";
import type { Profile } from "@/lib/sambo-logic";

export const Route = createFileRoute("/statistik")({
  head: () => ({ meta: [{ title: "Statistik – SAMBO" }, { name: "description", content: "Se vem som gjort mest, totalt och per kategori." }, { property: "og:title", content: "Statistik – SAMBO" }, { property: "og:description", content: "Se vem som gjort mest, totalt och per kategori." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: Stats,
});

const PEOPLE: Profile[] = ["Minna", "Joel"];
function Stats() {
  const { points, tasks } = useSambo();
  const total = (p: Profile) => points.filter((e) => e.profile === p).reduce((s, e) => s + e.points, 0);
  const totals: [number, number] = [total("Minna"), total("Joel")];
  const max = Math.max(1, ...totals);
  const cats = Array.from(new Set(points.map((e) => e.category)));
  const leader = totals[0] === totals[1] ? "Lika!" : totals[0] > totals[1] ? "Minna leder" : "Joel leder";
  return (
    <Page title="Statistik">
      <Section title={`Totalt · ${leader}`}>
        <div className="space-y-3 rounded-lg bg-card p-4">
          {PEOPLE.map((p, i) => (
            <div key={p}>
              <div className="flex justify-between text-sm font-semibold"><span>{p}</span><span>{totals[i]} p</span></div>
              <div className="mt-1 h-3 rounded-full bg-background"><div className="h-3 rounded-full bg-primary" style={{ width: `${((totals[i] ?? 0) / max) * 100}%` }} /></div>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Per person">
        <div className="grid grid-cols-2 gap-3">
          {PEOPLE.map((p) => (
            <div key={p} className="rounded-lg bg-card p-4 text-sm">
              <p className="text-lg font-bold">{p}</p>
              <p>Skapade: {tasks.filter((t) => t.createdBy === p).length}</p>
              <p>Slutförda: {tasks.filter((t) => t.completedBy === p).length}</p>
              <p>Poäng: {total(p)}</p>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Per kategori">
        <div className="space-y-2 rounded-lg bg-card p-4 text-sm">
          {cats.length === 0 && <p>Ingen statistik ännu.</p>}
          {cats.map((c) => (
            <div key={c} className="grid grid-cols-3"><span className="font-semibold">{c}</span>
              {PEOPLE.map((p) => <span key={p} className="text-right">{p}: {points.filter((e) => e.category === c && e.profile === p).reduce((s, e) => s + e.points, 0)} p</span>)}
            </div>
          ))}
        </div>
      </Section>
    </Page>
  );
}
