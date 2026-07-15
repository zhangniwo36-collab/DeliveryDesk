"use client";

import { useEffect, useMemo, useState } from "react";
import { addTask, reviewDeliverable, seedProject, summarizeProject, toggleTask, type DeliveryProject, type ReviewStatus, type TaskStatus } from "../lib/delivery";
import { TaskModal } from "./task-modal";

type Locale = "en" | "zh";
const STORAGE_KEY = "deliverydesk-demo-v1";
const LANGUAGE_KEY = "deliverydesk-language";

const copy = {
  en: { workspace: "Client delivery workspace", overview: "Overview", milestones: "Milestones", approvals: "Approvals", risks: "Risks", demo: "LOCAL-FIRST DEMO", demoNote: "No sign-in, API key, or client data required.", eyebrow: "CLIENT DELIVERY / WEEK 6", headline: "Project delivery, without the status chase.", reset: "Reset demo", add: "+ Add task", progress: "Overall progress", budget: "Budget used", approval: "Awaiting approval", risk: "Open risks", plan: "Delivery plan", tasks: "Work in progress", filter: "All milestones", due: "Due", owner: "Owner", approvalQueue: "Approval queue", approvalNote: "Client decisions needed", approve: "Approve", changes: "Request changes", approved: "Approved", requested: "Changes requested", riskRegister: "Risk register", activity: "Recent activity", export: "Export report 鈫? },
  zh: { workspace: "瀹㈡埛浜や粯宸ヤ綔鍖?, overview: "椤圭洰姒傝", milestones: "閲岀▼纰?, approvals: "寰呭鎵?, risks: "椋庨櫓", demo: "鏈湴浼樺厛婕旂ず", demoNote: "鏃犻渶鐧诲綍銆丄PI Key 鎴栫湡瀹炲鎴锋暟鎹€?, eyebrow: "瀹㈡埛浜や粯 / 绗?6 鍛?, headline: "璁╅」鐩氦浠樹笉鍐嶉潬鍙嶅杩介棶銆?, reset: "閲嶇疆婕旂ず", add: "+ 娣诲姞浠诲姟", progress: "鏁翠綋杩涘害", budget: "棰勭畻浣跨敤", approval: "绛夊緟瀹℃壒", risk: "寮€鏀鹃闄?, plan: "浜や粯璁″垝", tasks: "杩涜涓殑宸ヤ綔", filter: "鍏ㄩ儴閲岀▼纰?, due: "鎴", owner: "璐熻矗浜?, approvalQueue: "瀹℃壒闃熷垪", approvalNote: "闇€瑕佸鎴峰喅绛?, approve: "鎵瑰噯", changes: "瑕佹眰淇敼", approved: "宸叉壒鍑?, requested: "宸茶姹備慨鏀?, riskRegister: "椋庨櫓鐧昏", activity: "鏈€杩戞椿鍔?, export: "瀵煎嚭鎶ュ憡 鈫? },
} as const;

const statusLabel: Record<Locale, Record<TaskStatus, string>> = {
  en: { "not-started": "Not started", "in-progress": "In progress", blocked: "Blocked", done: "Complete" },
  zh: { "not-started": "鏈紑濮?, "in-progress": "杩涜涓?, blocked: "鍙楅樆", done: "宸插畬鎴? },
};

export function DeliveryWorkspace() {
  const [project, setProject] = useState<DeliveryProject>(seedProject);
  const [locale, setLocale] = useState<Locale>("en");
  const [milestone, setMilestone] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try { const stored = localStorage.getItem(STORAGE_KEY); if (stored) setProject(JSON.parse(stored)); } catch { /* use safe demo data */ }
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
  function review(id: string, status: Exclude<ReviewStatus, "pending">) { setProject((current) => reviewDeliverable(current, id, status)); }

  return <main className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="#top"><span>D</span>DeliveryDesk</a>
      <div className="workspace-name"><strong>Northstar Studio</strong><small>{text.workspace}</small></div>
      <nav aria-label="Project workspace"><a className="active" href="#overview">01 <span>{text.overview}</span></a><a href="#milestones">02 <span>{text.milestones}</span></a><a href="#approvals">03 <span>{text.approvals}</span><b>{summary.pendingApprovals}</b></a><a href="#risks">04 <span>{text.risks}</span></a></nav>
      <div className="sidebar-demo"><strong>{text.demo}</strong><p>{text.demoNote}</p></div>
      <a className="source-link" href="https://github.com/zhangniwo36-collab/DeliveryDesk" target="_blank" rel="noreferrer">Source & engineering notes 鈫?/a>
    </aside>

    <section className="workspace" id="top">
      <header className="topbar"><div><p className="eyebrow">{text.eyebrow}</p><h1>{text.headline}</h1><span>{project.name} 路 {project.client}</span></div><div className="topbar-actions"><div className="language-switch" role="group" aria-label="Language"><button className={locale === "zh" ? "active" : ""} onClick={() => setLanguage("zh")}>涓枃</button><button className={locale === "en" ? "active" : ""} onClick={() => setLanguage("en")}>English</button></div><button className="quiet-button" onClick={resetDemo}>{text.reset}</button><button className="primary-button" onClick={() => setModalOpen(true)}>{text.add}</button></div></header>

      <section className="metrics" id="overview" aria-label="Project metrics">
        <Metric label={text.progress} value={`${summary.progress}%`} note={`${summary.completedTasks} / ${summary.totalTasks} tasks`} progress={summary.progress} />
        <Metric label={text.budget} value={`${summary.budgetUsed}%`} note={`$${project.spent.toLocaleString()} / $${project.budget.toLocaleString()}`} progress={summary.budgetUsed} />
        <Metric label={text.approval} value={String(summary.pendingApprovals)} note={text.approvalNote} />
        <Metric label={text.risk} value={String(summary.openRisks)} note={locale === "zh" ? "1 椤归珮褰卞搷" : "1 high impact"} warn />
      </section>

      <section className="milestone-strip" id="milestones"><header><p className="eyebrow">{text.plan}</p><strong>Target launch 路 Aug 28</strong></header><div className="milestone-track">{project.milestones.map((item, index) => <article key={item.id} className={item.state}><span>{index + 1}</span><div><strong>{item.name}</strong><small>{item.due} 路 {item.state}</small></div></article>)}</div></section>

      <div className="content-grid">
        <div className="main-column">
          <section className="tasks-panel"><header><div><p className="eyebrow">{text.tasks}</p><h2>{visibleTasks.length} delivery tasks</h2></div><label><span className="sr-only">{text.filter}</span><select value={milestone} onChange={(event) => setMilestone(event.target.value)}><option value="all">{text.filter}</option>{project.milestones.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label></header><div className="task-list">{visibleTasks.map((task) => <button key={task.id} className="task-row" onClick={() => setProject((current) => toggleTask(current, task.id))}><span className={`task-check ${task.status}`} aria-hidden="true">{task.status === "done" ? "鉁? : ""}</span><span className="task-title"><strong>{task.title}</strong><small>{project.milestones.find((item) => item.id === task.milestoneId)?.name}</small></span><span><small>{text.owner}</small>{task.owner}</span><span><small>{text.due}</small>{task.due}</span><b className={`status ${task.status}`}>{statusLabel[locale][task.status]}</b></button>)}</div></section>
          <section className="risk-panel" id="risks"><header><div><p className="eyebrow">{text.riskRegister}</p><h2>Watch before launch</h2></div><button className="export-button" onClick={exportReport}>{text.export}</button></header>{project.risks.map((risk) => <article key={risk.id}><span className={`risk-mark ${risk.impact}`}>{risk.impact === "high" ? "!" : "路"}</span><strong>{risk.title}</strong><span>{risk.owner}</span><b>{risk.status}</b></article>)}</section>
        </div>

        <aside className="right-rail">
          <section className="approval-panel" id="approvals"><header><p className="eyebrow">{text.approvalQueue}</p><h2>{text.approvalNote}</h2></header>{project.deliverables.map((item) => <article key={item.id}><div><span className="file-mark">鈫?/span><p><strong>{item.title}</strong><small>{item.version} 路 {item.owner}</small></p></div>{item.status === "pending" ? <div className="review-actions"><button onClick={() => review(item.id, "changes-requested")}>{text.changes}</button><button className="approve-button" onClick={() => review(item.id, "approved")}>{text.approve}</button></div> : <b className={`reviewed ${item.status}`}>{item.status === "approved" ? text.approved : text.requested}</b>}</article>)}</section>
          <section className="activity-panel"><header><p className="eyebrow">{text.activity}</p></header>{project.activity.slice(0, 4).map((item) => <article key={item.id}><span></span><p>{item.message}<small>{item.at}</small></p></article>)}</section>
        </aside>
      </div>
    </section>
    {modalOpen && <TaskModal project={project} locale={locale} onClose={() => setModalOpen(false)} onCreate={(input) => { setProject((current) => addTask(current, input)); setModalOpen(false); }} />}
  </main>;
}

function Metric({ label, value, note, progress, warn = false }: { label: string; value: string; note: string; progress?: number; warn?: boolean }) {
  return <article className={warn ? "warning" : ""}><span>{label}</span><strong>{value}</strong><small>{note}</small>{progress !== undefined && <div className="metric-progress"><i style={{ width: `${progress}%` }} /></div>}</article>;
}

