"use client";

import { useEffect, useMemo, useState } from "react";
import { addTask, parseStoredProject, reviewDeliverable, seedProject, summarizeProject, toggleTask, type DeliveryProject, type ReviewStatus, type TaskStatus } from "../lib/delivery";
import { localizeEntity, type Locale } from "../lib/i18n";
import { TaskModal } from "./task-modal";

const STORAGE_KEY = "deliverydesk-demo-v1";
const LANGUAGE_KEY = "deliverydesk-language";

const copy = {
  en: { workspace: "Client delivery workspace", overview: "Overview", milestones: "Milestones", approvals: "Approvals", risks: "Risks", demo: "LOCAL-FIRST DEMO", demoNote: "No sign-in, API key, or client data required.", eyebrow: "CLIENT DELIVERY / WEEK 6", headline: "Project delivery, without the status chase.", reset: "Reset demo", add: "+ Add task", progress: "Overall progress", budget: "Budget used", approval: "Awaiting approval", risk: "Open risks", plan: "Delivery plan", tasks: "Work in progress", filter: "All milestones", due: "Due", owner: "Owner", approvalQueue: "Approval queue", approvalNote: "Client decisions needed", approve: "Approve", changes: "Request changes", approved: "Approved", requested: "Changes requested", riskRegister: "Risk register", activity: "Recent activity", export: "Export report ↓", source: "Source & engineering notes ↗", navLabel: "Project workspace", metricsLabel: "Project metrics", targetLaunch: "Target launch", targetDate: "Aug 28", taskUnit: "tasks", taskCount: "delivery tasks", watchBeforeLaunch: "Watch before launch", highImpact: "1 high impact", complete: "complete", active: "active", upcoming: "upcoming", open: "open", mitigated: "mitigated" },
  zh: { workspace: "客户交付工作区", overview: "项目概览", milestones: "里程碑", approvals: "待审批", risks: "风险", demo: "本地优先演示", demoNote: "无需登录、API Key 或真实客户数据。", eyebrow: "客户交付 / 第 6 周", headline: "让项目交付不再靠反复追问。", reset: "重置演示", add: "+ 添加任务", progress: "整体进度", budget: "预算使用", approval: "等待审批", risk: "开放风险", plan: "交付计划", tasks: "进行中的工作", filter: "全部里程碑", due: "截止", owner: "负责人", approvalQueue: "审批队列", approvalNote: "需要客户决策", approve: "批准", changes: "要求修改", approved: "已批准", requested: "已要求修改", riskRegister: "风险登记", activity: "最近活动", export: "导出报告 ↓", source: "源码与工程说明 ↗", navLabel: "项目工作区", metricsLabel: "项目指标", targetLaunch: "目标上线", targetDate: "8月28日", taskUnit: "项任务", taskCount: "项交付任务", watchBeforeLaunch: "上线前关注事项", highImpact: "1 项高影响", complete: "已完成", active: "进行中", upcoming: "即将开始", open: "开放", mitigated: "已缓解" },
} as const;

const statusLabel: Record<Locale, Record<TaskStatus, string>> = {
  en: { "not-started": "Not started", "in-progress": "In progress", blocked: "Blocked", done: "Complete" },
  zh: { "not-started": "未开始", "in-progress": "进行中", blocked: "受阻", done: "已完成" },
};

export function DeliveryWorkspace() {
  const [project, setProject] = useState<DeliveryProject>(seedProject);
  const [locale, setLocale] = useState<Locale>("en");
  const [milestone, setMilestone] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const storedProject = parseStoredProject(localStorage.getItem(STORAGE_KEY));
      if (storedProject) setProject(storedProject);
      const language = localStorage.getItem(LANGUAGE_KEY);
      setLocale(language === "zh" || (!language && navigator.language.startsWith("zh")) ? "zh" : "en");
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => { if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(project)); }, [project, hydrated]);
  useEffect(() => { document.documentElement.lang = locale === "zh" ? "zh-CN" : "en"; }, [locale]);

  const summary = summarizeProject(project);
  const visibleTasks = useMemo(() => project.tasks.filter((task) => milestone === "all" || task.milestoneId === milestone), [project.tasks, milestone]);
  const text = copy[locale];

  function setLanguage(next: Locale) { setLocale(next); localStorage.setItem(LANGUAGE_KEY, next); }
  function resetDemo() { setProject(seedProject); setMilestone("all"); localStorage.removeItem(STORAGE_KEY); }
  function exportReport() {
    const report = JSON.stringify({ project: project.name, summary, tasks: project.tasks, approvals: project.deliverables, risks: project.risks }, null, 2);
    const url = URL.createObjectURL(new Blob([report], { type: "application/json" }));
    const link = document.createElement("a"); link.href = url; link.download = "deliverydesk-project-report.json"; link.click(); URL.revokeObjectURL(url);
  }
  function review(id: string, status: Exclude<ReviewStatus, "pending">) {
    setProject((current) => {
      const deliverable = current.deliverables.find((item) => item.id === id);
      const message = locale === "zh" && deliverable
        ? `客户${status === "approved" ? "批准了" : "要求修改"}${localizeEntity(locale, deliverable.title)}`
        : undefined;
      return reviewDeliverable(current, id, status, message);
    });
  }

  return <main className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="#top"><span>D</span>DeliveryDesk</a>
      <div className="workspace-name"><strong>Northstar Studio</strong><small>{text.workspace}</small></div>
      <nav aria-label={text.navLabel}><a className="active" href="#overview">01 <span>{text.overview}</span></a><a href="#milestones">02 <span>{text.milestones}</span></a><a href="#approvals">03 <span>{text.approvals}</span><b>{summary.pendingApprovals}</b></a><a href="#risks">04 <span>{text.risks}</span></a></nav>
      <div className="sidebar-demo"><strong>{text.demo}</strong><p>{text.demoNote}</p></div>
      <a className="source-link" href="https://github.com/zhangniwo36-collab/DeliveryDesk" target="_blank" rel="noreferrer">{text.source}</a>
    </aside>

    <section className="workspace" id="top">
      <header className="topbar"><div><p className="eyebrow">{text.eyebrow}</p><h1>{text.headline}</h1><span>{project.name} · {project.client}</span></div><div className="topbar-actions"><div className="language-switch" role="group" aria-label="Language"><button className={locale === "zh" ? "active" : ""} onClick={() => setLanguage("zh")}>中文</button><button className={locale === "en" ? "active" : ""} onClick={() => setLanguage("en")}>English</button></div><button className="quiet-button" onClick={resetDemo}>{text.reset}</button><button className="primary-button" onClick={() => setModalOpen(true)}>{text.add}</button></div></header>

      <section className="metrics" id="overview" aria-label={text.metricsLabel}>
        <Metric label={text.progress} value={`${summary.progress}%`} note={`${summary.completedTasks} / ${summary.totalTasks} ${text.taskUnit}`} progress={summary.progress} />
        <Metric label={text.budget} value={`${summary.budgetUsed}%`} note={`$${project.spent.toLocaleString()} / $${project.budget.toLocaleString()}`} progress={summary.budgetUsed} />
        <Metric label={text.approval} value={String(summary.pendingApprovals)} note={text.approvalNote} />
        <Metric label={text.risk} value={String(summary.openRisks)} note={text.highImpact} warn />
      </section>

      <section className="milestone-strip" id="milestones"><header><p className="eyebrow">{text.plan}</p><strong>{text.targetLaunch} · {text.targetDate}</strong></header><div className="milestone-track">{project.milestones.map((item, index) => <article key={item.id} className={item.state}><span>{index + 1}</span><div><strong>{localizeEntity(locale, item.name)}</strong><small>{localizeEntity(locale, item.due)} · {text[item.state]}</small></div></article>)}</div></section>

      <div className="content-grid">
        <div className="main-column">
          <section className="tasks-panel"><header><div><p className="eyebrow">{text.tasks}</p><h2>{visibleTasks.length} {text.taskCount}</h2></div><label><span className="sr-only">{text.filter}</span><select value={milestone} onChange={(event) => setMilestone(event.target.value)}><option value="all">{text.filter}</option>{project.milestones.map((item) => <option key={item.id} value={item.id}>{localizeEntity(locale, item.name)}</option>)}</select></label></header><div className="task-list">{visibleTasks.map((task) => <button key={task.id} className="task-row" onClick={() => setProject((current) => toggleTask(current, task.id))}><span className={`task-check ${task.status}`} aria-hidden="true">{task.status === "done" ? "✓" : ""}</span><span className="task-title"><strong>{localizeEntity(locale, task.title)}</strong><small>{localizeEntity(locale, project.milestones.find((item) => item.id === task.milestoneId)?.name ?? "")}</small></span><span><small>{text.owner}</small>{task.owner}</span><span><small>{text.due}</small>{localizeEntity(locale, task.due)}</span><b className={`status ${task.status}`}>{statusLabel[locale][task.status]}</b></button>)}</div></section>
          <section className="risk-panel" id="risks"><header><div><p className="eyebrow">{text.riskRegister}</p><h2>{text.watchBeforeLaunch}</h2></div><button className="export-button" onClick={exportReport}>{text.export}</button></header>{project.risks.map((risk) => <article key={risk.id}><span className={`risk-mark ${risk.impact}`}>{risk.impact === "high" ? "!" : "·"}</span><strong>{localizeEntity(locale, risk.title)}</strong><span>{localizeEntity(locale, risk.owner)}</span><b>{text[risk.status]}</b></article>)}</section>
        </div>

        <aside className="right-rail">
          <section className="approval-panel" id="approvals"><header><p className="eyebrow">{text.approvalQueue}</p><h2>{text.approvalNote}</h2></header>{project.deliverables.map((item) => <article key={item.id}><div><span className="file-mark">↗</span><p><strong>{localizeEntity(locale, item.title)}</strong><small>{localizeEntity(locale, item.version)} · {item.owner}</small></p></div>{item.status === "pending" ? <div className="review-actions"><button onClick={() => review(item.id, "changes-requested")}>{text.changes}</button><button className="approve-button" onClick={() => review(item.id, "approved")}>{text.approve}</button></div> : <b className={`reviewed ${item.status}`}>{item.status === "approved" ? text.approved : text.requested}</b>}</article>)}</section>
          <section className="activity-panel"><header><p className="eyebrow">{text.activity}</p></header>{project.activity.slice(0, 4).map((item) => <article key={item.id}><span></span><p>{localizeEntity(locale, item.message)}<small>{localizeEntity(locale, item.at)}</small></p></article>)}</section>
        </aside>
      </div>
    </section>
    {modalOpen && <TaskModal project={project} locale={locale} onClose={() => setModalOpen(false)} onCreate={(input) => { setProject((current) => addTask(current, input)); setModalOpen(false); }} />}
  </main>;
}

function Metric({ label, value, note, progress, warn = false }: { label: string; value: string; note: string; progress?: number; warn?: boolean }) {
  return <article className={warn ? "warning" : ""}><span>{label}</span><strong>{value}</strong><small>{note}</small>{progress !== undefined && <div className="metric-progress"><i style={{ width: `${progress}%` }} /></div>}</article>;
}

