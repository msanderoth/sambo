import { useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CREATE_POINTS, completionPoints, nextDueDate, type PointEvent, type Profile, type Task } from "./sambo-logic";

// Tasks, points and categories are shared via Lovable Cloud; the active profile stays per device.
interface State { profile: Profile; tasks: Task[]; points: PointEvent[]; customCategories: string[]; ready: boolean }
const PROFILE_KEY = "sambo-profile";
const empty: State = { profile: "M", tasks: [], points: [], customCategories: [], ready: false };
let state: State = empty;
let started = false;
const listeners = new Set<() => void>();

function set(next: Partial<State>) { state = { ...state, ...next }; listeners.forEach((l) => l()); }
export const uid = () => crypto.randomUUID();

async function refresh() {
  const [t, p, c] = await Promise.all([
    supabase.from("tasks").select("data").order("created_at"),
    supabase.from("point_events").select("*").order("at"),
    supabase.from("custom_categories").select("name").order("created_at"),
  ]);
  set({
    ready: true,
    tasks: (t.data ?? []).map((r) => r.data as unknown as Task),
    points: (p.data ?? []).map((r) => ({ profile: r.profile as Profile, points: r.points, category: r.category, kind: r.kind as PointEvent["kind"], at: r.at })),
    customCategories: (c.data ?? []).map((r) => r.name),
  });
}

function start() {
  if (started || typeof window === "undefined") return;
  started = true;
  const saved = localStorage.getItem(PROFILE_KEY);
  if (saved === "J" || saved === "M") state = { ...state, profile: saved };
  void refresh();
  const ch = supabase.channel(`sambo-${Math.random().toString(36).slice(2)}`);
  for (const table of ["tasks", "point_events", "custom_categories"]) {
    ch.on("postgres_changes", { event: "*", schema: "public", table }, () => void refresh());
  }
  ch.subscribe();
}

export function useSambo() {
  return useSyncExternalStore(
    (l) => { start(); listeners.add(l); return () => listeners.delete(l); },
    () => state,
    () => empty,
  );
}

function fail(e: unknown) { console.error(e); void refresh(); }
async function saveTask(t: Task) {
  const { error } = await supabase.from("tasks").upsert({ id: t.id, data: t as never, updated_at: new Date().toISOString() });
  if (error) fail(error);
}
async function addPoints(e: PointEvent) {
  const { error } = await supabase.from("point_events").insert(e);
  if (error) fail(error);
}
function patchTask(id: string, f: (t: Task) => Task) {
  const t = state.tasks.find((x) => x.id === id);
  if (!t) return;
  const n = f(t);
  set({ tasks: state.tasks.map((x) => (x.id === id ? n : x)) });
  void saveTask(n);
}

export const actions = {
  toggleProfile() {
    const profile: Profile = state.profile === "M" ? "J" : "M";
    localStorage.setItem(PROFILE_KEY, profile);
    set({ profile });
  },
  addCategory(name: string) {
    const n = name.trim();
    if (!n || state.customCategories.includes(n)) return;
    set({ customCategories: [...state.customCategories, n] });
    void supabase.from("custom_categories").insert({ name: n }).then(({ error }) => error && fail(error));
  },
  createTask(t: Omit<Task, "id" | "createdAt" | "createdBy">) {
    const task: Task = { ...t, id: uid(), createdAt: new Date().toISOString(), createdBy: state.profile };
    const ev: PointEvent = { profile: state.profile, points: CREATE_POINTS, category: task.category ?? "Övrigt", kind: "create", at: task.createdAt };
    set({ tasks: [...state.tasks, task], points: [...state.points, ev] });
    void saveTask(task).then(() => addPoints(ev));
    return task;
  },
  toggleItem(taskId: string, itemId: string) {
    patchTask(taskId, (t) => ({ ...t, items: t.items.map((i) => (i.id === itemId ? { ...i, done: !i.done } : i)) }));
  },
  deleteTask(id: string) {
    set({ tasks: state.tasks.filter((t) => t.id !== id) });
    void supabase.from("tasks").delete().eq("id", id).then(({ error }) => error && fail(error));
  },
  completeTask(id: string) {
    const t = state.tasks.find((x) => x.id === id);
    if (!t || t.completedAt) return;
    const now = new Date();
    const ev: PointEvent = { profile: state.profile, points: completionPoints(t), category: t.category ?? "Övrigt", kind: "complete", at: now.toISOString() };
    set({ points: [...state.points, ev] });
    patchTask(id, (x) => ({ ...x, completedAt: now.toISOString(), completedBy: state.profile }));
    if (t.recurrence) {
      const next: Task = { ...t, id: uid(), createdAt: now.toISOString(), items: t.items.map((i) => ({ ...i, done: false })), dueDate: nextDueDate(t.recurrence, t.dueDate, now) };
      set({ tasks: [...state.tasks, next] });
      void saveTask(next);
    }
    void addPoints(ev);
  },
};
