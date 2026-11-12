import { History } from "lucide-react";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import type { Task } from "@/lib/sambo-logic";
import { CategoryIcon } from "./icons";

export function TaskCard({ task, onOpen }: { task: Task; onOpen: (t: Task) => void }) {
  const done = task.items.filter((i) => i.done).length;
  const showMeta = task.items.length > 0 || task.dueDate || task.recurrence;
  return (
    <button onClick={() => onOpen(task)} className="w-full rounded-lg bg-card p-3 text-left text-card-foreground transition hover:brightness-[0.98]">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-lg font-bold leading-tight">{task.title}</h3>
        {task.category && <CategoryIcon category={task.category} className="h-5 w-5 shrink-0" />}
      </div>
      {task.description && <p className="mt-1 line-clamp-2 text-sm">{task.description}</p>}
      {showMeta && (
        <div className="mt-2 grid grid-cols-[auto_1fr_auto] items-center gap-2 text-sm">
          <span>{task.items.length > 0 && <span className="rounded-full bg-accent px-2 py-0.5 font-semibold">{done}/{task.items.length}</span>}</span>
          <span className="text-center">{task.dueDate && format(new Date(task.dueDate + "T00:00"), "d MMMM yyyy", { locale: sv })}</span>
          <span>{task.recurrence && <History className="h-5 w-5" />}</span>
        </div>
      )}
    </button>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-medium">{title}</h2>
      {children}
    </section>
  );
}

export function EmptyState({ text }: { text: string }) {
  return <p className="rounded-lg border-2 border-dashed border-primary/30 p-6 text-center text-sm">{text}</p>;
}
