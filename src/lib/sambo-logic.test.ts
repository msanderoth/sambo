import { describe, expect, it } from "vitest";
import { completionPoints, nextDueDate, dueGroup } from "./sambo-logic";

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
});
