import { createFileRoute } from "@tanstack/react-router";
import { Page } from "@/components/sambo/AppShell";
import { Section } from "@/components/sambo/TaskCard";
import { useSambo } from "@/lib/sambo-store";
import type { Profile } from "@/lib/sambo-logic";
import { StatsPie } from "@/components/sambo/StatsPie";

export const Route = createFileRoute("/statistik")({
  head: () => ({ meta: [{ title: "Statistik – SAMBO" }, { name: "description", content: "Se vem som gjort mest, totalt och per kategori." }, { property: "og:title", content: "Statistik – SAMBO" }, { property: "og:description", content: "Se vem som gjort mest, totalt och per kategori." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: Stats,
});

const PEOPLE: Profile[] = ["Minna", "Joel"];
function Stats() {
  const { points, tasks } = useSambo();
  const total = (p: Profile) => points.filter((e) => e.profile === p).reduce((s, e) => s + e.points, 0);
  const totals: [number, number] = [total("Minna"), total("Joel")];
  const cats = Array.from(new Set(points.map((e) => e.category)));
  const leader = totals[0] === totals[1] ? "Lika!" : totals[0] > totals[1] ? "Minna leder" : "Joel leder";
  return (
    <Page title="Statistik">
      <Section title={`Totalt · ${leader}`}>
        <StatsPie title="Poängfördelning" unit="p" slices={PEOPLE.map((p) => ({ label: p, value: total(p) }))} />
      </Section>
      <Section title="Per person">
        <div className="space-y-5">
          {PEOPLE.map((p) => (
            <div key={p} className="space-y-3">
              <h3 className="font-bold">{p}</h3>
              <StatsPie title="Uppgifter" unit="st" slices={[
                { label: "Skapade", value: tasks.filter((t) => t.createdBy === p).length },
                { label: "Slutförda", value: tasks.filter((t) => t.completedBy === p).length },
              ]} />
            </div>
          ))}
        </div>
      </Section>
      <Section title="Per kategori">
        <div className="space-y-3">
          {cats.length === 0 && <p>Ingen statistik ännu.</p>}
          {cats.map((c) => (
            <StatsPie key={c} title={c} unit="p" slices={PEOPLE.map((p) => ({ label: p, value: points.filter((e) => e.category === c && e.profile === p).reduce((s, e) => s + e.points, 0) }))} />
          ))}
        </div>
      </Section>
    </Page>
  );
}
