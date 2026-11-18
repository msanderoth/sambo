import { createFileRoute } from "@tanstack/react-router";
import { Page } from "@/components/sambo/AppShell";
import { Section } from "@/components/sambo/TaskCard";
import { useSambo } from "@/lib/sambo-store";
import type { Profile } from "@/lib/sambo-logic";
import { StatsPie } from "@/components/sambo/StatsPie";
import { CardSwiper } from "@/components/sambo/CardSwiper";

export const Route = createFileRoute("/_authenticated/statistik")({
  head: () => ({ meta: [{ title: "Statistik – SAMBO" }, { name: "description", content: "Se vem som gjort mest, totalt och per kategori." }, { property: "og:title", content: "Statistik – SAMBO" }, { property: "og:description", content: "Se vem som gjort mest, totalt och per kategori." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: Stats,
});

const PEOPLE: Profile[] = ["M", "J"];
function Stats() {
  const { points } = useSambo();
  const total = (p: Profile) => points.filter((e) => e.profile === p).reduce((s, e) => s + e.points, 0);
  const totals: [number, number] = [total("M"), total("J")];
  const cats = Array.from(new Set(points.map((e) => e.category)));
  const leader = totals[0] === totals[1] ? "Lika!" : totals[0] > totals[1] ? "M leder" : "J leder";
  return (
    <Page title="Statistik">
      <Section title={`Totalt · ${leader}`}>
        <StatsPie title="Poängfördelning" unit="p" slices={PEOPLE.map((p) => ({ label: p, value: total(p) }))} />
      </Section>
      <Section title="Per person">
        <CardSwiper label="person">
          {PEOPLE.map((p) => (
            <div key={p} className="w-full shrink-0 snap-center">
              <StatsPie title={`${p} · poäng per kategori`} unit="p" slices={cats.map((c) => ({ label: c, value: points.filter((e) => e.category === c && e.profile === p).reduce((s, e) => s + e.points, 0) }))} />
            </div>
          ))}
        </CardSwiper>
      </Section>
      <Section title="Per kategori">
        <CardSwiper label="kategori">
          {cats.length === 0 && <p>Ingen statistik ännu.</p>}
          {cats.map((c) => (
            <div key={c} className="w-full shrink-0 snap-center">
              <StatsPie title={c} unit="p" slices={PEOPLE.map((p) => ({ label: p, value: points.filter((e) => e.category === c && e.profile === p).reduce((s, e) => s + e.points, 0) }))} />
            </div>
          ))}
        </CardSwiper>
      </Section>
    </Page>
  );
}
