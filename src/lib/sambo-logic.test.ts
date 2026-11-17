import { describe, expect, it } from "vitest";
import { completionPoints, nextDueDate, dueGroup, showsOnTimed, showsOnBacklog, type Task } from "./sambo-logic";

const task = (over: Partial<Task>): Task => ({
  id: "x", title: "t", type: "task", items: [], relatedIds: [], createdBy: "Minna", createdAt: "2026-11-17T10:00:00Z",
  ...over,
});

describe("sambo rules", () => {
  it("simple task gives 10 points", () => {
    expect(completionPoints({ items: [], description: "", relatedIds: [] })).toBe(10);
  });
  it("bigger tasks give more points", () => {
    expect(completionPoints({ items: [{ id: "1", text: "a", done: true }, { id: "2", text: "b", done: true }], description: "x", relatedIds: ["r"] })).toBe(19);
  });
  it("monthly recurrence advances one month from due date", () => {
    expect(nextDueDate({ kind: "monthly" }, "2027-01-13", new Date(2027, 0, 20))).toBe("2027-02-13");
  });
  it("after-completion recurrence counts from completion day", () => {
    expect(nextDueDate({ kind: "after_completion", days: 10 }, "2027-01-01", new Date(2027, 0, 5))).toBe("2027-01-15");
  });
  it("groups tomorrow", () => {
    expect(dueGroup("2026-11-13", new Date(2026, 10, 12))).toBe("Imorgon");
  });
  it("shopping list with a due date shows on Tidsbegränsat", () => {
    expect(showsOnTimed(task({ type: "shopping", dueDate: "2026-11-18" }))).toBe(true);
  });
  it("shopping list without a due date does not show on Tidsbegränsat", () => {
    expect(showsOnTimed(task({ type: "shopping" }))).toBe(false);
  });
  it("completed shopping list with a due date does not show on Tidsbegränsat", () => {
    expect(showsOnTimed(task({ type: "shopping", dueDate: "2026-11-18", completedAt: "2026-11-17T12:00:00Z" }))).toBe(false);
  });
  it("shopping list without a due date shows in Backlog", () => {
    expect(showsOnBacklog(task({ type: "shopping" }))).toBe(true);
  });
  it("timed task shows in Backlog", () => {
    expect(showsOnBacklog(task({ dueDate: "2026-11-18" }))).toBe(true);
  });
  it("completed task does not show in Backlog", () => {
    expect(showsOnBacklog(task({ dueDate: "2026-11-18", completedAt: "2026-11-17T12:00:00Z" }))).toBe(false);
  });
  it("plain task without a due date shows in Backlog", () => {
    expect(showsOnBacklog(task({}))).toBe(true);
  });
});
