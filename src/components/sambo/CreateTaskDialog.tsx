import { useEffect, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { z } from "zod";
import { CalendarMonthIcon } from "./icons";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SamboCheckbox } from "@/components/sambo/SamboCheckbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { actions, uid, useSambo } from "@/lib/sambo-store";
import { CATEGORIES, HOME_SUBCATEGORIES, RECURRENCE_LABELS, CREATE_POINTS, type RecurrenceKind, type TaskType } from "@/lib/sambo-logic";

const titleSchema = z.string().trim().min(1, "Titel krävs").max(120);
const NONE = "__none";

export function CreateTaskDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { tasks, customCategories } = useSambo();
  const [title, setTitle] = useState("");
  const [type, setType] = useState<TaskType>("task");
  const [category, setCategory] = useState(NONE);
  const [sub, setSub] = useState(NONE);
  const [description, setDescription] = useState("");
  const [items, setItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [rec, setRec] = useState<string>(NONE);
  const [days, setDays] = useState(7);
  const [related, setRelated] = useState<string[]>([]);
  const [error, setError] = useState("");
  const descRef = useRef<HTMLTextAreaElement>(null);

  // Beskrivningsfältet växer med texten, har minimihöjd 80px och kan inte dras i storlek.
  useEffect(() => {
    const el = descRef.current;
    if (!el) return;
    const border = el.offsetHeight - el.clientHeight;
    el.style.height = "auto";
    el.style.height = `${Math.max(80, el.scrollHeight + border)}px`;
  }, [description, open]);

  const reset = () => { setTitle(""); setType("task"); setCategory(NONE); setSub(NONE); setDescription(""); setItems([]); setNewItem(""); setDueDate(""); setRec(NONE); setDays(7); setRelated([]); setError(""); };
  const addItem = () => { if (newItem.trim()) { setItems([...items, newItem.trim()]); setNewItem(""); } document.getElementById("new-item")?.focus(); };

  const submit = () => {
    const r = titleSchema.safeParse(title);
    if (!r.success) { setError(r.error.issues[0]?.message ?? "Titel krävs"); return; }
    const kind = rec === NONE ? undefined : (rec as RecurrenceKind);
    actions.createTask({
      title: r.data, type,
      category: category === NONE ? undefined : category,
      subcategory: category === "Hem" && sub !== NONE ? sub : undefined,
      description: description.trim() || undefined,
      items: (newItem.trim() ? [...items, newItem.trim()] : items).map((text) => ({ id: uid(), text, done: false })),
      dueDate: dueDate || undefined,
      recurrence: kind ? { kind, days: kind === "custom" || kind === "after_completion" ? days : undefined } : undefined,
      relatedIds: related,
    });
    toast.success(`Uppgift skapad! +${CREATE_POINTS} poäng`);
    reset(); onOpenChange(false);
  };

  const open_ = tasks.filter((t) => !t.completedAt);
  const pillButton = "h-10 rounded-full bg-task-ink px-4 text-base font-normal text-task-field shadow-task-field hover:bg-task-ink/90";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined} className="task-sheet top-auto bottom-0 block max-h-[calc(100dvh-140px)] w-full max-w-md translate-y-0 gap-0 overflow-clip rounded-t-[20px] sm:bottom-4 sm:rounded-[20px] border-0 bg-task-sheet p-0 text-task-ink shadow-none sm:max-h-[calc(100dvh-32px)] [&>.dialog-dismiss]:top-4 [&>.dialog-dismiss]:opacity-100 [&>.dialog-dismiss>svg]:size-6">
        <div className="max-h-[calc(100dvh-140px)] overflow-y-auto px-4 pb-4 pt-5 sm:max-h-[calc(100dvh-32px)]">
        <DialogHeader className="mb-7 sm:text-center"><DialogTitle className="text-center text-xl font-bold uppercase tracking-normal">Ny uppgift</DialogTitle></DialogHeader>
        <form id="create-task-form" onSubmit={(e) => { e.preventDefault(); submit(); }}>
          <div className="space-y-2">
            <Label htmlFor="title" className="text-base font-semibold">Titel</Label>
            <Input id="title" className="task-sheet-field" value={title} maxLength={120} onChange={(e) => { setTitle(e.target.value); setError(""); }} autoFocus aria-invalid={!!error} aria-describedby={error ? "title-error" : undefined} />
            {error && <p id="title-error" className="text-sm text-destructive">{error}</p>}
            <div role="group" aria-label="Typ" className="flex h-10 rounded-full bg-task-field shadow-task-field">
              <Button type="button" aria-pressed={type !== "shopping"} onClick={() => setType("task")} variant="ghost" className={`h-10 flex-1 rounded-full text-base font-normal ${type !== "shopping" ? "bg-task-ink text-task-field hover:bg-task-ink/90 hover:text-task-field" : "text-task-ink hover:bg-task-field"}`}>Uppgift</Button>
              <Button type="button" aria-pressed={type === "shopping"} onClick={() => setType("shopping")} variant="ghost" className={`h-10 flex-1 rounded-full text-base font-normal ${type === "shopping" ? "bg-task-ink text-task-field hover:bg-task-ink/90 hover:text-task-field" : "text-task-ink hover:bg-task-field"}`}>Inköpslista</Button>
            </div>
            <Select value={category} onValueChange={(v) => { setCategory(v); setSub(NONE); }}>
              <SelectTrigger aria-label="Kategori" className="task-sheet-field"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Kategori</SelectItem>
                {[...CATEGORIES, ...customCategories].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            {category === "Hem" && <Select value={sub} onValueChange={setSub}>
              <SelectTrigger aria-label="Rum" className="task-sheet-field"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value={NONE}>Rum</SelectItem>{HOME_SUBCATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>}
          </div>
          <div className="mt-8 space-y-1">
            <Label htmlFor="desc" className="text-base font-semibold">Beskrivning</Label>
            <Textarea id="desc" ref={descRef} className="task-sheet-field min-h-20 resize-none rounded-[20px] py-3" value={description} maxLength={1000} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="mt-8 space-y-1">
            <Label htmlFor="new-item" className="text-base font-semibold">Lista</Label>
            {items.length > 0 && <ul className="py-1 pl-4">
              {items.map((it, i) => <li key={i} className="flex min-h-7 items-center gap-2 text-base">
                <span aria-hidden="true" className="h-5 w-5 shrink-0 rounded-full border-2 border-task-ink" />
                <span className="min-w-0 flex-1 break-words">{it}</span>
                <Button type="button" variant="ghost" size="icon" aria-label={`Ta bort ${it}`} className="h-7 w-10 text-task-ink [&_svg]:size-6" onClick={() => setItems(items.filter((_, j) => j !== i))}><X /></Button>
              </li>)}
            </ul>}
            <div className="flex gap-2">
              <Input id="new-item" className="task-sheet-field flex-1" value={newItem} maxLength={200} onChange={(e) => setNewItem(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem(); } }} />
              <Button type="button" className={pillButton} onClick={addItem}>Lägg till</Button>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-2">
            <div className="min-w-0 space-y-1">
              <Label htmlFor="due" className="text-base font-semibold">Slutdatum</Label>
              <div className="relative">
                <Input id="due" className="task-sheet-field task-sheet-date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                <CalendarMonthIcon aria-hidden="true" className="pointer-events-none absolute right-4 top-2 h-6 w-6" />
              </div>
            </div>
            <div className="min-w-0 space-y-1">
              <Label htmlFor="recurrence" className="text-base font-semibold">Återkommande</Label>
              <Select value={rec} onValueChange={setRec}>
                <SelectTrigger id="recurrence" className="task-sheet-field"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value={NONE}>Nej</SelectItem>{Object.entries(RECURRENCE_LABELS).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          {(rec === "custom" || rec === "after_completion") && <div className="mt-3 flex flex-wrap items-center gap-2">
            <Label htmlFor="days">Var</Label><Input id="days" className="task-sheet-field w-20" type="number" min={1} max={3650} value={days} onChange={(e) => setDays(Number(e.target.value) || 1)} /><span className="text-sm">dagar{rec === "after_completion" ? " efter avslut" : ""}</span>
          </div>}
          <div className="mt-2 space-y-1">
            <Label htmlFor="related" className="text-base font-semibold">Relaterade uppgifter</Label>
            <Popover>
              <PopoverTrigger asChild><Button id="related" type="button" variant="ghost" className="task-sheet-field w-full justify-between font-normal hover:bg-task-field"><span className="truncate">{related.length ? `${related.length} valda` : "Ingen"}</span><ChevronDown /></Button></PopoverTrigger>
              <PopoverContent className="max-h-48 w-[var(--radix-popover-trigger-width)] overflow-y-auto bg-task-field text-task-ink">
                {open_.length === 0 && <p className="text-sm">Inga uppgifter</p>}
                {open_.map((t) => <label key={t.id} className="flex items-center gap-2 py-2 text-sm"><SamboCheckbox checked={related.includes(t.id)} onCheckedChange={(c) => setRelated(c ? [...related, t.id] : related.filter((x) => x !== t.id))} /><span className="break-words">{t.title}</span></label>)}
              </PopoverContent>
            </Popover>
          </div>
          <div className="mt-8 flex justify-end">
            <Button type="submit" className={pillButton}>Spara</Button>
          </div>
        </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
