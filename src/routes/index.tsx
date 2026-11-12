import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Page } from "@/components/sambo/AppShell";
import { TaskCard, Section, EmptyState } from "@/components/sambo/TaskCard";
import { TaskDetail } from "@/components/sambo/TaskDetail";
import { useSambo } from "@/lib/sambo-store";
import { dueGroup, type DueGroup } from "@/lib/sambo-logic";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Tidsbegränsat – SAMBO" }, { name: "description", content: "Uppgifter med slutdatum, sorterade efter vad som är närmast." }, { property: "og:title", content: "Tidsbegränsat – SAMBO" }, { property: "og:description", content: "Uppgifter med slutdatum, sorterade efter vad som är närmast." }] }),
  component: Index,
});

const ORDER: DueGroup[] = ["Försenat", "Idag", "Imorgon", "Den här veckan", "Senare"];
function Index() {
  const { tasks } = useSambo();
  const [sel, setSel] = useState<string | null>(null);
  const dated = tasks.filter((t) => t.dueDate && !t.completedAt).sort((a, b) => a.dueDate!.localeCompare(b.dueDate!));
  const today = new Date();
  return (
    <Page title="Tidsbegränsat">
      {dated.length === 0 && <EmptyState text="Inga uppgifter med slutdatum ännu. Tryck på + för att skapa en." />}
      {ORDER.map((g) => {
        const list = dated.filter((t) => dueGroup(t.dueDate!, today) === g);
        return list.length ? <Section key={g} title={g}>{list.map((t) => <TaskCard key={t.id} task={t} onOpen={(x) => setSel(x.id)} />)}</Section> : null;
      })}
      <TaskDetail taskId={sel} onClose={() => setSel(null)} />
    </Page>
  );
}
