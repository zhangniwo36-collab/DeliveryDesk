export type Locale = "en" | "zh";

export const entityCopy: Record<string, string> = {
  "Discovery & direction": "探索与方向",
  "Design system": "设计系统",
  "Build & launch": "构建与发布",
  "Stakeholder interviews synthesized": "利益相关者访谈总结",
  "Checkout journey approved": "结账流程已确认",
  "Core component inventory": "核心组件清单",
  "Responsive product templates": "响应式产品模板",
  "Accessibility review": "无障碍审查",
  "Production content migration": "生产内容迁移",
  "Checkout prototype": "结账原型",
  "Component library": "组件库",
  "Research brief": "研究简报",
  "Version 3": "第 3 版",
  "Release candidate": "候选发布版",
  "Final": "最终版",
  "Product copy is five days late": "产品文案已延期五天",
  "Payment provider sandbox access": "支付服务商沙盒访问权限",
  "Mobile navigation scope": "移动端导航范围",
  "Client team": "客户团队",
  "Maya shared Checkout prototype · Version 3": "Maya 分享了结账原型 · 第 3 版",
  "Priya completed Responsive product templates": "Priya 完成了响应式产品模板",
  "Today, 9:42 AM": "今天 9:42",
  "Yesterday, 4:18 PM": "昨天 16:18",
  "Just now": "刚刚",
  "Jul 11": "7月11日",
  "Jul 15": "7月15日",
  "Jul 18": "7月18日",
  "Jul 22": "7月22日",
  "Jul 25": "7月25日",
  "Jul 29": "7月29日",
  "Aug 01": "8月1日",
  "Aug 12": "8月12日",
  "Aug 28": "8月28日",
  "Not set": "未设置",
};

export function localizeEntity(locale: Locale, value: string): string {
  return locale === "zh" ? entityCopy[value] ?? value : value;
}

