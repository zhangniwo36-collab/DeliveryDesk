"use client";

import { FormEvent, useEffect, useRef } from "react";
import { team, type DeliveryProject } from "../lib/delivery";

type Props = {
  project: DeliveryProject;
  locale: "en" | "zh";
  onClose(): void;
  onCreate(input: { title: string; owner: string; milestoneId: string }): void;
};

export function TaskModal({ project, locale, onClose, onCreate }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { closeRef.current?.focus(); }, []);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onCreate({ title: String(form.get("title")), owner: String(form.get("owner")), milestoneId: String(form.get("milestone")) });
  }

  const zh = locale === "zh";
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="task-modal" role="dialog" aria-modal="true" aria-labelledby="task-modal-title">
      <button ref={closeRef} className="modal-close" onClick={onClose} aria-label={zh ? "鍏抽棴" : "Close"}>脳</button>
      <p className="eyebrow">{zh ? "鏂板伐浣滈」" : "NEW WORK ITEM"}</p>
      <h2 id="task-modal-title">{zh ? "娣诲姞浜や粯浠诲姟" : "Add a delivery task"}</h2>
      <form onSubmit={submit}>
        <label>{zh ? "浠诲姟鍚嶇О" : "Task title"}<input name="title" required autoFocus placeholder={zh ? "闇€瑕佸畬鎴愪粈涔堬紵" : "What needs to be completed?"} /></label>
        <label>{zh ? "璐熻矗浜? : "Owner"}<select name="owner">{team.map((person) => <option key={person}>{person}</option>)}</select></label>
        <label>{zh ? "閲岀▼纰? : "Milestone"}<select name="milestone">{project.milestones.map((milestone) => <option key={milestone.id} value={milestone.id}>{milestone.name}</option>)}</select></label>
        <p>{zh ? "姝ゆ紨绀轰粎淇濆瓨鍦ㄥ綋鍓嶆祻瑙堝櫒涓€? : "This demo change is stored only in this browser."}</p>
        <button className="primary-button">{zh ? "娣诲姞浠诲姟" : "Add task"}</button>
      </form>
    </section>
  </div>;
}

