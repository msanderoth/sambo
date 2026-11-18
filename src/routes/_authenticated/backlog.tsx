import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Page } from "@/components/sambo/AppShell";
import { TaskCard, Section, EmptyState } from "@/components/sambo/TaskCard";
import { TaskDetail } from "@/components/sambo/TaskDetail";
import { useSambo } from "@/lib/sambo-store";
import { isStarted, showsOnBacklog } from "@/lib/sambo-logic";

export const Route = createFileRoute("/_authenticated/backlog")({
  head: () => ({ meta: [{ title: "Backlog – SAMBO" }, { name: "description", content: "Uppgifter utan slutdatum, uppdelat i påbörjat och ej påbörjat." }, { property: "og:title", content: "Backlog – SAMBO" }, { property: "og:description", content: "Uppgifter utan slutdatum, uppdelat i påbörjat och ej påbörjat." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: Backlog,
});

function Backlog() {
  const { tasks } = useSambo();
  const [sel, setSel] = useState<string | null>(null);
  const open = tasks.filter(showsOnBacklog);
  const started = open.filter(isStarted), notStarted = open.filter((t) => !isStarted(t));
  return (
    <Page title="Backlog">
      {open.length === 0 && <EmptyState text="Backloggen är tom. Uppgifter utan slutdatum hamnar här." />}
      {started.length > 0 && <Section title="Påbörjat">{started.map((t) => <TaskCard key={t.id} task={t} onOpen={(x) => setSel(x.id)} />)}</Section>}
      {notStarted.length > 0 && <Section title="Ej påbörjat">{notStarted.map((t) => <TaskCard key={t.id} task={t} onOpen={(x) => setSel(x.id)} />)}</Section>}
      <TaskDetail taskId={sel} onClose={() => setSel(null)} />
    </Page>
  );
}
