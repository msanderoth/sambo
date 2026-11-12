import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Page } from "@/components/sambo/AppShell";
import { TaskCard, EmptyState } from "@/components/sambo/TaskCard";
import { TaskDetail } from "@/components/sambo/TaskDetail";
import { useSambo } from "@/lib/sambo-store";

export const Route = createFileRoute("/inkopslistor")({
  head: () => ({ meta: [{ title: "Inköpslistor – SAMBO" }, { name: "description", content: "Alla era gemensamma inköpslistor på ett ställe." }, { property: "og:title", content: "Inköpslistor – SAMBO" }, { property: "og:description", content: "Alla era gemensamma inköpslistor på ett ställe." }] }),
  component: Shopping,
});

function Shopping() {
  const { tasks } = useSambo();
  const [sel, setSel] = useState<string | null>(null);
  const lists = tasks.filter((t) => t.type === "shopping" && !t.completedAt);
  return (
    <Page title="Inköpslistor">
      {lists.length === 0 && <EmptyState text="Inga inköpslistor. Skapa en uppgift av typen Inköpslista." />}
      <div className="space-y-3">{lists.map((t) => <TaskCard key={t.id} task={t} onOpen={(x) => setSel(x.id)} />)}</div>
      <TaskDetail taskId={sel} onClose={() => setSel(null)} />
    </Page>
  );
}
