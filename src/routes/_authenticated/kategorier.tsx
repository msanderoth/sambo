import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowBackIcon as ArrowLeft } from "@/components/sambo/icons";
import { Page } from "@/components/sambo/AppShell";
import { TaskCard, Section, EmptyState } from "@/components/sambo/TaskCard";
import { TaskDetail } from "@/components/sambo/TaskDetail";
import { CategoryIcon, AddBoxIcon as SquarePlus } from "@/components/sambo/icons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { actions, useSambo } from "@/lib/sambo-store";
import { CATEGORIES, HOME_SUBCATEGORIES } from "@/lib/sambo-logic";

export const Route = createFileRoute("/_authenticated/kategorier")({
  head: () => ({ meta: [{ title: "Kategorier – SAMBO" }, { name: "description", content: "Se uppgifter per kategori: hem, bil, event och resa." }, { property: "og:title", content: "Kategorier – SAMBO" }, { property: "og:description", content: "Se uppgifter per kategori: hem, bil, event och resa." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: Categories,
});

const LABEL: Record<string, string> = { Resa: "Resor" };
function Categories() {
  const { tasks, customCategories } = useSambo();
  const [cat, setCat] = useState<string | null>(null);
  const [sel, setSel] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const tile = "flex h-32 flex-col items-center justify-center gap-2 rounded-lg bg-card shadow-task-field transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

  if (cat) {
    const list = tasks.filter((t) => t.category === cat && !t.completedAt);
    const groups = cat === "Hem" ? [...HOME_SUBCATEGORIES, undefined] : [undefined];
    return (
      <Page title={LABEL[cat] ?? cat}>
        <button
          type="button"
          onClick={() => setCat(null)}
          className="flex items-center gap-1 rounded-sm text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />Alla kategorier
        </button>
        {list.length === 0 && <EmptyState text="Inga uppgifter i den här kategorin." />}
        {groups.map((g) => {
          const items = list.filter((t) => (cat === "Hem" ? t.subcategory === g : true));
          return items.length ? <Section key={g ?? "x"} title={g ?? (cat === "Hem" ? "Övrigt" : "Uppgifter")}>{items.map((t) => <TaskCard key={t.id} task={t} onOpen={(x) => setSel(x.id)} />)}</Section> : null;
        })}
        <TaskDetail taskId={sel} onClose={() => setSel(null)} />
      </Page>
    );
  }
  return (
    <Page title="Kategorier">
      <div className="grid grid-cols-2 gap-4">
        {[...CATEGORIES, ...customCategories].map((c) => (
          <button key={c} type="button" className={tile} onClick={() => setCat(c)}>
            <CategoryIcon category={c} className="h-8 w-8" />{LABEL[c] ?? c}
          </button>
        ))}
        {adding ? (
          <form
            className={tile + " border-2 border-primary px-3"}
            onSubmit={(e) => {
              e.preventDefault();
              if (name.trim()) actions.addCategory(name.trim().slice(0, 40));
              setName("");
              setAdding(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setName("");
                setAdding(false);
              }
            }}
          >
            <Label htmlFor="new-category-name" className="sr-only">Kategorinamn</Label>
            <Input
              id="new-category-name"
              autoFocus
              value={name}
              maxLength={40}
              placeholder="Namn"
              aria-label="Kategorinamn"
              className="task-sheet-field w-full"
              onChange={(e) => setName(e.target.value)}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                type="button"
                className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                onClick={() => { setName(""); setAdding(false); }}
              >
                Avbryt
              </Button>
              <Button
                size="sm"
                type="submit"
                className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Spara
              </Button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            className={tile + " border-2 border-primary bg-transparent"}
            onClick={() => setAdding(true)}
          >
            <SquarePlus className="h-8 w-8" />Ny kategori
          </button>
        )}
      </div>
    </Page>
  );
}
