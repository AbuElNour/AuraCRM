const tools = {
  public_company_research: ({ company }) => ({
    company,
    summary: `${company} is a synthetic account used for this local demonstration.`,
    source: "synthetic://company-directory"
  }),
  summarize_timeline: ({ events = [] }) => ({
    summary: events.length ? `${events.length} customer events are available.` : "No events are available."
  })
};

export class ToolRegistry {
  constructor(allowed = Object.keys(tools)) {
    this.allowed = new Set(allowed);
  }

  list() {
    return [...this.allowed].sort();
  }

  invoke(name, args) {
    if (!this.allowed.has(name) || !tools[name]) throw new Error("tool is not allowlisted");
    return tools[name](args);
  }
}

