import { useSyncExternalStore } from "react";
import { CREATE_POINTS, completionPoints, nextDueDate, type PointEvent, type Profile, type Task } from "./sambo-logic";

interface State { profile: Profile; tasks: Task[]; points: PointEvent[]; customCategories: string[] }
const KEY = "sambo-state-v1";
const empty: State = { profile: "Minna", tasks: [], points: [], customCategories: [] };
let state: State = empty;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try { const raw = localStorage.getItem(KEY); if (raw) state = { ...empty, ...JSON.parse(raw) }; } catch { /* ignore */ }
}
function set(next: Partial<State>) {
  state = { ...state, ...next };
  localStorage.setItem(KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
}
export const uid = () => Math.random().toString(36).slice(2, 10);

export function useSambo() {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    () => { load(); return state; },
    () => empty,
  );
}

export const actions = {
  toggleProfile() { set({ profile: state.profile === "Minna" ? "Joel" : "Minna" }); },
  addCategory(name: string) { if (name.trim()) set({ customCategories: [...state.customCategories, name.trim()] }); },
  createTask(t: Omit<Task, "id" | "createdAt" | "createdBy">) {
    const task: Task = { ...t, id: uid(), createdAt: new Date().toISOString(), createdBy: state.profile };
    set({
      tasks: [...state.tasks, task],
      points: [...state.points, { profile: state.profile, points: CREATE_POINTS, category: task.category ?? "Övrigt", kind: "create", at: task.createdAt }],
    });
    return task;
  },
  toggleItem(taskId: string, itemId: string) {
    set({ tasks: state.tasks.map((t) => t.id !== taskId ? t : { ...t, items: t.items.map((i) => i.id === itemId ? { ...i, done: !i.done } : i) }) });
  },
  deleteTask(id: string) { set({ tasks: state.tasks.filter((t) => t.id !== id) }); },
  completeTask(id: string) {
    const t = state.tasks.find((x) => x.id === id);
    if (!t || t.completedAt) return;
    const now = new Date();
    const done: Task = { ...t, completedAt: now.toISOString(), completedBy: state.profile };
    const tasks = state.tasks.map((x) => (x.id === id ? done : x));
    if (t.recurrence) {
      tasks.push({ ...t, id: uid(), createdAt: now.toISOString(), items: t.items.map((i) => ({ ...i, done: false })), dueDate: nextDueDate(t.recurrence, t.dueDate, now) });
    }
    set({ tasks, points: [...state.points, { profile: state.profile, points: completionPoints(t), category: t.category ?? "Övrigt", kind: "complete", at: now.toISOString() }] });
  },
};
