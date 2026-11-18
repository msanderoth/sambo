import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { SamboCheckbox } from "@/components/sambo/SamboCheckbox";
import { Button } from "@/components/ui/button";
import { actions, useSambo } from "@/lib/sambo-store";
import { RECURRENCE_LABELS, completionPoints } from "@/lib/sambo-logic";
import { toast } from "sonner";

export function TaskDetail({ taskId, onClose }: { taskId: string | null; onClose: () => void }) {
  const { tasks, profile } = useSambo();
  const task = tasks.find((t) => t.id === taskId);
  const related = task ? tasks.filter((t) => task.relatedIds.includes(t.id)) : [];
  return (
    <Sheet open={!!task} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl [&>button]:text-task-ink [&>button]:opacity-100 [&>button]:data-[state=open]:bg-transparent [&>button>svg]:size-6">
        {task && (
          <>
            <SheetHeader>
              <SheetTitle className="text-2xl">{task.title}</SheetTitle>
              <SheetDescription>
                {[task.category, task.subcategory].filter(Boolean).join(" · ") || "Ingen kategori"}
                {task.dueDate && ` · ${task.dueDate}`}
                {task.recurrence && ` · ${RECURRENCE_LABELS[task.recurrence.kind]}${task.recurrence.days ? ` (${task.recurrence.days} dagar)` : ""}`}
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-4 px-4 pb-6">
              {task.description && <p>{task.description}</p>}
              {task.items.length > 0 && (
                <ul className="space-y-2">
                  {task.items.map((i) => (
                    <li key={i.id} className="flex items-center gap-3">
                      <SamboCheckbox id={i.id} checked={i.done} onCheckedChange={() => actions.toggleItem(task!.id, i.id)} />
                      <label htmlFor={i.id} className={i.done ? "line-through opacity-60" : ""}>{i.text}</label>
                    </li>
                  ))}
                </ul>
              )}
              {related.length > 0 && (
                <div>
                  <p className="text-sm font-semibold">Relaterade uppgifter</p>
                  <ul className="text-sm">{related.map((r) => <li key={r.id}>• {r.title}{r.completedAt ? " ✓" : ""}</li>)}</ul>
                </div>
              )}
              {task.completedAt ? (
                <p className="text-sm">Slutförd av {task.completedBy}</p>
              ) : (
                <Button className="w-full" onClick={() => { actions.completeTask(task.id); toast.success(`+${completionPoints(task)} poäng till ${profile}!`); onClose(); }}>
                  Slutför (+{completionPoints(task)} poäng)
                </Button>
              )}
              <Button variant="ghost" className="w-full" onClick={() => { actions.deleteTask(task.id); onClose(); }}>Ta bort</Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
