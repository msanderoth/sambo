export type TaskType = "task" | "list" | "shopping";
export type Profile = "Minna" | "Joel";
export type RecurrenceKind =
  | "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "after_completion" | "custom";
export interface Recurrence { kind: RecurrenceKind; days?: number | undefined }
export interface ListItem { id: string; text: string; done: boolean }
export interface Task {
  id: string;
  title: string;
  type: TaskType;
  category?: string | undefined;
  subcategory?: string | undefined;
  description?: string | undefined;
  items: ListItem[];
  dueDate?: string | undefined; // yyyy-mm-dd
  recurrence?: Recurrence | undefined;
  relatedIds: string[];
  createdBy: Profile;
  createdAt: string;
  completedBy?: Profile | undefined;
  completedAt?: string | undefined;
}
export interface PointEvent { profile: Profile; points: number; category: string; kind: "create" | "complete"; at: string }

export const CATEGORIES = ["Hem", "Bil", "Event", "Resa"] as const;
export const HOME_SUBCATEGORIES = ["Kök", "Badrum", "Vardagsrum", "Kontor", "Sovrum", "Hall", "Förråd"];

export const RECURRENCE_LABELS: Record<RecurrenceKind, string> = {
  daily: "Dagligen", weekly: "Veckovis", monthly: "Månadsvis", quarterly: "Kvartalsvis",
  yearly: "Årligen", after_completion: "Efter avslutad uppgift", custom: "Eget intervall",
};

/** Points for creating a task: flat 2. */
export const CREATE_POINTS = 2;

/** Points for completing a task, scaled by how extensive it is. */
export function completionPoints(t: Pick<Task, "items" | "description" | "relatedIds">): number {
  let p = 10;
  p += t.items.length * 2;
  if (t.description && t.description.trim().length > 0) p += 2;
  p += t.relatedIds.length * 3;
  return p;
}

function fmt(d: Date) {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
}
function parse(s: string) { const [y = 0, m = 1, d = 1] = s.split("-").map(Number); return new Date(y, m - 1, d); }

/** Next due date when a recurring task is completed. */
export function nextDueDate(r: Recurrence, dueDate: string | undefined, completedOn: Date): string {
  const base = r.kind === "after_completion" || r.kind === "custom" || !dueDate ? new Date(completedOn) : parse(dueDate);
  const d = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  switch (r.kind) {
    case "daily": d.setDate(d.getDate() + 1); break;
    case "weekly": d.setDate(d.getDate() + 7); break;
    case "monthly": d.setMonth(d.getMonth() + 1); break;
    case "quarterly": d.setMonth(d.getMonth() + 3); break;
    case "yearly": d.setFullYear(d.getFullYear() + 1); break;
    case "after_completion":
    case "custom": d.setDate(d.getDate() + Math.max(1, r.days ?? 7)); break;
  }
  return fmt(d);
}

export type DueGroup = "Försenat" | "Idag" | "Imorgon" | "Den här veckan" | "Senare";
export function dueGroup(dueDate: string, today: Date): DueGroup {
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diff = Math.round((parse(dueDate).getTime() - t.getTime()) / 86400000);
  if (diff < 0) return "Försenat";
  if (diff === 0) return "Idag";
  if (diff === 1) return "Imorgon";
  const dow = (t.getDay() + 6) % 7; // monday=0
  if (diff <= 6 - dow) return "Den här veckan";
  return "Senare";
}

export function isStarted(t: Task) { return t.items.some((i) => i.done); }

/** Tidsbegränsat: every open task that has a due date, shopping lists included. */
export function showsOnTimed(t: Task): boolean {
  return !t.completedAt && !!t.dueDate;
}

/** Backlog: every open task, with or without a due date, shopping lists included. */
export function showsOnBacklog(t: Task): boolean {
  return !t.completedAt;
}
