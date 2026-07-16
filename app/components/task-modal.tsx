"use client";

import { FormEvent, useEffect, useRef } from "react";
import { team, type DeliveryProject } from "../lib/delivery";
import { localizeEntity, type Locale } from "../lib/i18n";

type Props = {
  project: DeliveryProject;
  locale: Locale;
  onClose(): void;
  onCreate(input: { title: string; owner: string; milestoneId: string }): void;
};

export function TaskModal({ project, locale, onClose, onCreate }: Props) {
  const dialogRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    titleRef.current?.focus();
    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") { event.preventDefault(); onClose(); return; }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>("button, input, select, [href], [tabindex]:not([tabindex='-1'])"))
        .filter((element) => !element.hasAttribute("disabled"));
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => { document.removeEventListener("keydown", handleKeyDown); previousFocus?.focus(); };
  }, [onClose]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onCreate({ title: String(form.get("title")), owner: String(form.get("owner")), milestoneId: String(form.get("milestone")) });
  }

  const zh = locale === "zh";
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section ref={dialogRef} className="task-modal" role="dialog" aria-modal="true" aria-labelledby="task-modal-title" aria-describedby="task-modal-note">
      <button className="modal-close" onClick={onClose} aria-label={zh ? "关闭" : "Close"}>×</button>
      <p className="eyebrow">{zh ? "新工作项" : "NEW WORK ITEM"}</p>
      <h2 id="task-modal-title">{zh ? "添加交付任务" : "Add a delivery task"}</h2>
      <form onSubmit={submit}>
        <label>{zh ? "任务名称" : "Task title"}<input ref={titleRef} name="title" required placeholder={zh ? "需要完成什么？" : "What needs to be completed?"} /></label>
        <label>{zh ? "负责人" : "Owner"}<select name="owner">{team.map((person) => <option key={person}>{person}</option>)}</select></label>
        <label>{zh ? "里程碑" : "Milestone"}<select name="milestone">{project.milestones.map((milestone) => <option key={milestone.id} value={milestone.id}>{localizeEntity(locale, milestone.name)}</option>)}</select></label>
        <p id="task-modal-note">{zh ? "此演示仅保存在当前浏览器中。" : "This demo change is stored only in this browser."}</p>
        <button className="primary-button">{zh ? "添加任务" : "Add task"}</button>
      </form>
    </section>
  </div>;
}

