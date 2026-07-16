export type TaskStatus = "not-started" | "in-progress" | "blocked" | "done";
export type ReviewStatus = "pending" | "approved" | "changes-requested";

export type DeliveryTask = {
  id: string;
  title: string;
  owner: string;
  milestoneId: string;
  status: TaskStatus;
  due: string;
};

export type DeliveryProject = {
  name: string;
  client: string;
  budget: number;
  spent: number;
  dueDate: string;
  milestones: { id: string; name: string; due: string; state: "complete" | "active" | "upcoming" }[];
  tasks: DeliveryTask[];
  deliverables: { id: string; title: string; version: string; owner: string; status: ReviewStatus }[];
  risks: { id: string; title: string; impact: "high" | "medium"; owner: string; status: "open" | "mitigated" }[];
  activity: { id: string; message: string; at: string }[];
};

export const team = ["Maya Chen", "Jon Bell", "Priya Shah"];

const taskStatuses: TaskStatus[] = ["not-started", "in-progress", "blocked", "done"];
const reviewStatuses: ReviewStatus[] = ["pending", "approved", "changes-requested"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function isDeliveryProject(value: unknown): value is DeliveryProject {
  if (!isRecord(value)) return false;
  const { name, client, budget, spent, dueDate, milestones, tasks, deliverables, risks, activity } = value;
  return isNonEmptyString(name)
    && isNonEmptyString(client)
    && typeof budget === "number" && Number.isFinite(budget) && budget > 0
    && typeof spent === "number" && Number.isFinite(spent) && spent >= 0
    && isNonEmptyString(dueDate)
    && Array.isArray(milestones) && milestones.length > 0 && milestones.every((item) => isRecord(item)
      && isNonEmptyString(item.id) && isNonEmptyString(item.name) && isNonEmptyString(item.due)
      && ["complete", "active", "upcoming"].includes(String(item.state)))
    && Array.isArray(tasks) && tasks.length > 0 && tasks.every((item) => isRecord(item)
      && isNonEmptyString(item.id) && isNonEmptyString(item.title) && isNonEmptyString(item.owner)
      && isNonEmptyString(item.milestoneId) && isNonEmptyString(item.due)
      && taskStatuses.includes(item.status as TaskStatus))
    && Array.isArray(deliverables) && deliverables.every((item) => isRecord(item)
      && isNonEmptyString(item.id) && isNonEmptyString(item.title) && isNonEmptyString(item.version)
      && isNonEmptyString(item.owner) && reviewStatuses.includes(item.status as ReviewStatus))
    && Array.isArray(risks) && risks.every((item) => isRecord(item)
      && isNonEmptyString(item.id) && isNonEmptyString(item.title) && isNonEmptyString(item.owner)
      && ["high", "medium"].includes(String(item.impact)) && ["open", "mitigated"].includes(String(item.status)))
    && Array.isArray(activity) && activity.every((item) => isRecord(item)
      && isNonEmptyString(item.id) && isNonEmptyString(item.message) && isNonEmptyString(item.at));
}

export function parseStoredProject(raw: string | null): DeliveryProject | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isDeliveryProject(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export const seedProject: DeliveryProject = {
  name: "Northstar Commerce Redesign",
  client: "Northstar Retail",
  budget: 25000,
  spent: 17800,
  dueDate: "2026-08-28T17:00:00.000Z",
  milestones: [
    { id: "milestone-1", name: "Discovery & direction", due: "Jul 18", state: "complete" },
    { id: "milestone-2", name: "Design system", due: "Aug 01", state: "active" },
    { id: "milestone-3", name: "Build & launch", due: "Aug 28", state: "upcoming" },
  ],
  tasks: [
    { id: "task-1", title: "Stakeholder interviews synthesized", owner: "Maya Chen", milestoneId: "milestone-1", status: "done", due: "Jul 11" },
    { id: "task-2", title: "Checkout journey approved", owner: "Jon Bell", milestoneId: "milestone-1", status: "done", due: "Jul 15" },
    { id: "task-3", title: "Core component inventory", owner: "Priya Shah", milestoneId: "milestone-2", status: "done", due: "Jul 22" },
    { id: "task-4", title: "Responsive product templates", owner: "Maya Chen", milestoneId: "milestone-2", status: "done", due: "Jul 25" },
    { id: "task-5", title: "Accessibility review", owner: "Priya Shah", milestoneId: "milestone-2", status: "in-progress", due: "Jul 29" },
    { id: "task-6", title: "Production content migration", owner: "Jon Bell", milestoneId: "milestone-3", status: "blocked", due: "Aug 12" },
  ],
  deliverables: [
    { id: "deliverable-1", title: "Checkout prototype", version: "Version 3", owner: "Maya Chen", status: "pending" },
    { id: "deliverable-2", title: "Component library", version: "Release candidate", owner: "Priya Shah", status: "pending" },
    { id: "deliverable-3", title: "Research brief", version: "Final", owner: "Jon Bell", status: "approved" },
  ],
  risks: [
    { id: "risk-1", title: "Product copy is five days late", impact: "high", owner: "Client team", status: "open" },
    { id: "risk-2", title: "Payment provider sandbox access", impact: "medium", owner: "Jon Bell", status: "open" },
    { id: "risk-3", title: "Mobile navigation scope", impact: "medium", owner: "Maya Chen", status: "mitigated" },
  ],
  activity: [
    { id: "activity-1", message: "Maya shared Checkout prototype · Version 3", at: "Today, 9:42 AM" },
    { id: "activity-2", message: "Priya completed Responsive product templates", at: "Yesterday, 4:18 PM" },
  ],
};

export function summarizeProject(project: DeliveryProject) {
  const completedTasks = project.tasks.filter((task) => task.status === "done").length;
  return {
    progress: Math.round((completedTasks / project.tasks.length) * 100),
    budgetUsed: Math.round((project.spent / project.budget) * 100),
    completedTasks,
    totalTasks: project.tasks.length,
    pendingApprovals: project.deliverables.filter((item) => item.status === "pending").length,
    openRisks: project.risks.filter((risk) => risk.status === "open").length,
  };
}

export function toggleTask(project: DeliveryProject, taskId: string): DeliveryProject {
  return {
    ...project,
    tasks: project.tasks.map((task) => task.id === taskId ? { ...task, status: task.status === "done" ? "in-progress" : "done" } : task),
  };
}

export function reviewDeliverable(project: DeliveryProject, deliverableId: string, status: Exclude<ReviewStatus, "pending">, activityMessage?: string): DeliveryProject {
  const deliverable = project.deliverables.find((item) => item.id === deliverableId);
  if (!deliverable) return project;
  const verb = status === "approved" ? "approved" : "requested changes to";
  return {
    ...project,
    deliverables: project.deliverables.map((item) => item.id === deliverableId ? { ...item, status } : item),
    activity: [{ id: `activity-${Date.now()}`, message: activityMessage ?? `Client ${verb} ${deliverable.title}`, at: "Just now" }, ...project.activity],
  };
}

export function addTask(project: DeliveryProject, input: Pick<DeliveryTask, "title" | "owner" | "milestoneId">, id = `task-${Date.now()}`): DeliveryProject {
  const title = input.title.trim();
  if (!title) throw new Error("Task title is required");
  const task: DeliveryTask = { id, title, owner: input.owner, milestoneId: input.milestoneId, status: "not-started", due: "Not set" };
  return { ...project, tasks: [task, ...project.tasks] };
}

