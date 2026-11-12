import { useState } from "react";
import { X } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
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

  const reset = () => { setTitle(""); setType("task"); setCategory(NONE); setSub(NONE); setDescription(""); setItems([]); setNewItem(""); setDueDate(""); setRec(NONE); setDays(7); setRelated([]); setError(""); };
  const addItem = () => { if (newItem.trim()) { setItems([...items, newItem.trim()]); setNewItem(""); } };

  const submit = () => {
    const r = titleSchema.safeParse(title);
    if (!r.success) { setError(r.error.issues[0].message); return; }
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Ny uppgift</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="title">Titel *</Label>
            <Input id="title" value={title} maxLength={120} onChange={(e) => { setTitle(e.target.value); setError(""); }} autoFocus />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <div className="space-y-1">
            <Label>Typ</Label>
            <ToggleGroup type="single" variant="outline" value={type} onValueChange={(v) => v && setType(v as TaskType)} className="w-full">
              <ToggleGroupItem value="task" className="flex-1">Uppgift</ToggleGroupItem>
              <ToggleGroupItem value="list" className="flex-1">Lista</ToggleGroupItem>
              <ToggleGroupItem value="shopping" className="flex-1">Inköpslista</ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label>Kategori</Label>
              <Select value={category} onValueChange={(v) => { setCategory(v); setSub(NONE); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Ingen</SelectItem>
                  {[...CATEGORIES, ...customCategories].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {category === "Hem" && (
              <div className="space-y-1">
                <Label>Rum</Label>
                <Select value={sub} onValueChange={setSub}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>Inget</SelectItem>
                    {HOME_SUBCATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="desc">Beskrivning</Label>
            <Textarea id="desc" value={description} maxLength={1000} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>{type === "shopping" ? "Varor" : "Lista"}</Label>
            {items.map((it, i) => (
              <div key={i} className="flex items-center justify-between rounded-md bg-secondary px-3 py-1 text-sm">
                {it}<button aria-label="Ta bort" onClick={() => setItems(items.filter((_, j) => j !== i))}><X className="h-4 w-4" /></button>
              </div>
            ))}
            <div className="flex gap-2">
              <Input value={newItem} maxLength={200} placeholder="Lägg till punkt" onChange={(e) => setNewItem(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem(); } }} />
              <Button type="button" variant="outline" onClick={addItem}>Lägg till</Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="due">Slutdatum</Label>
              <Input id="due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Återkommande</Label>
              <Select value={rec} onValueChange={setRec}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Nej</SelectItem>
                  {Object.entries(RECURRENCE_LABELS).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          {(rec === "custom" || rec === "after_completion") && (
            <div className="flex items-center gap-2">
              <Label htmlFor="days">Var</Label>
              <Input id="days" type="number" min={1} max={3650} className="w-24" value={days} onChange={(e) => setDays(Number(e.target.value) || 1)} />
              <span className="text-sm">dagar{rec === "after_completion" ? " efter avslut" : ""}</span>
            </div>
          )}
          {open_.length > 0 && (
            <div className="space-y-1">
              <Label>Relaterade uppgifter</Label>
              <div className="max-h-32 space-y-1 overflow-y-auto rounded-md border p-2">
                {open_.map((t) => (
                  <label key={t.id} className="flex items-center gap-2 text-sm">
                    <Checkbox checked={related.includes(t.id)} onCheckedChange={(c) => setRelated(c ? [...related, t.id] : related.filter((x) => x !== t.id))} />
                    {t.title}
                  </label>
                ))}
              </div>
            </div>
          )}
          <Button className="w-full" onClick={submit}>Skapa uppgift</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
