import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { SamboCheckbox } from "@/components/sambo/SamboCheckbox";
import { CreateTaskDialog } from "@/components/sambo/CreateTaskDialog";
import { Button } from "@/components/ui/button";
import { actions, useSambo } from "@/lib/sambo-store";
import { RECURRENCE_LABELS, completionPoints, type Task } from "@/lib/sambo-logic";
import { toast } from "sonner";

export function TaskDetail({ taskId, onClose }: { taskId: string | null; onClose: () => void }) {
  const { tasks, profile } = useSambo();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const task = tasks.find((t) => t.id === taskId);
  const related = task ? tasks.filter((t) => task.relatedIds.includes(t.id)) : [];
  const remove = () => {
    if (!task) return;
    actions.deleteTask(task.id);
    setConfirmDelete(false);
    onClose();
  };
  return (
    <>
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
                        <SamboCheckbox id={i.id} checked={i.done} onCheckedChange={() => actions.toggleItem(task.id, i.id)} />
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
                  <Button className="h-10 w-full rounded-full bg-task-ink px-4 text-base font-normal text-task-field shadow-task-field hover:bg-task-ink/90" onClick={() => { actions.completeTask(task.id); toast.success(`+${completionPoints(task)} poäng till ${profile}!`); onClose(); }}>
                    Slutför (+{completionPoints(task)} poäng)
                  </Button>
                )}
                <div className="flex gap-2">
                  <Button variant="ghost" className="h-10 flex-1 rounded-full bg-task-field px-4 text-base font-normal text-task-ink shadow-task-field hover:bg-task-field/80 hover:text-task-ink" onClick={() => setConfirmDelete(true)}>Ta bort</Button>
                  <Button className="h-10 flex-1 rounded-full bg-task-ink px-4 text-base font-normal text-task-field shadow-task-field hover:bg-task-ink/90" onClick={() => { setEditingTask(task); onClose(); }}>Redigera</Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent
          aria-describedby={undefined}
          className="w-[calc(100%-2rem)] max-w-xs gap-0 rounded-[20px] border-0 bg-task-sheet p-6 text-task-ink shadow-none sm:rounded-[20px] [&>.dialog-dismiss]:hidden"
        >
          <DialogTitle className="text-center text-xl font-bold">Vill du ta bort uppgiften?</DialogTitle>
          <div className="mt-6 flex gap-2">
            <Button
              variant="ghost"
              className="h-10 flex-1 rounded-full bg-task-field text-base font-normal text-task-ink shadow-task-field hover:bg-task-field/80 hover:text-task-ink"
              onClick={() => setConfirmDelete(false)}
            >
              Tillbaka
            </Button>
            <Button
              className="h-10 flex-1 rounded-full bg-task-ink text-base font-normal text-task-field shadow-task-field hover:bg-task-ink/90"
              onClick={remove}
            >
              Ta bort
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <CreateTaskDialog
        open={!!editingTask}
        onOpenChange={(open) => { if (!open) setEditingTask(null); }}
        task={editingTask}
      />
    </>
  );
}
