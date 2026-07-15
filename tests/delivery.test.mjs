import assert from "node:assert/strict";
import test from "node:test";

import {
  addTask,
  reviewDeliverable,
  seedProject,
  summarizeProject,
  toggleTask,
} from "../app/lib/delivery.ts";

test("summarizes delivery progress, budget, and outstanding approvals", () => {
  const summary = summarizeProject(seedProject);
  assert.deepEqual(summary, {
    progress: 67,
    budgetUsed: 71,
    completedTasks: 4,
    totalTasks: 6,
    pendingApprovals: 2,
    openRisks: 2,
  });
});

test("completing a task updates project progress without mutating the seed", () => {
  const updated = toggleTask(seedProject, "task-5");
  assert.equal(updated.tasks.find((task) => task.id === "task-5")?.status, "done");
  assert.equal(summarizeProject(updated).progress, 83);
  assert.equal(seedProject.tasks.find((task) => task.id === "task-5")?.status, "in-progress");
});

test("records an approval decision and removes it from the pending count", () => {
  const updated = reviewDeliverable(seedProject, "deliverable-1", "approved");
  assert.equal(updated.deliverables[0].status, "approved");
  assert.equal(summarizeProject(updated).pendingApprovals, 1);
  assert.match(updated.activity[0].message, /approved/i);
});

test("adds a trimmed task to the selected milestone", () => {
  const updated = addTask(seedProject, {
    title: "  Confirm launch checklist  ",
    owner: "Maya Chen",
    milestoneId: "milestone-3",
  }, "task-new");
  assert.equal(updated.tasks[0].title, "Confirm launch checklist");
  assert.equal(updated.tasks[0].milestoneId, "milestone-3");
  assert.equal(updated.tasks[0].status, "not-started");
});

test("rejects empty task titles", () => {
  assert.throws(() => addTask(seedProject, { title: "   ", owner: "Maya Chen", milestoneId: "milestone-1" }), /title is required/i);
});

