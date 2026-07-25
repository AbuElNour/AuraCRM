import { ToolRegistry } from "./mcp.mjs";
import { redactSensitive, requireApproval } from "./security.mjs";

export class LeadSwarm {
  constructor({ tools = new ToolRegistry() } = {}) {
    this.tools = tools;
  }

  run(lead, { approved = false } = {}) {
    const trace = [];
    const score = Math.min(
      100,
      (lead.company ? 25 : 0) + (lead.need ? 35 : 0) + (lead.budget ? 20 : 0) + (lead.timeline ? 20 : 0)
    );
    trace.push({ agent: "qualifier", outcome: "scored", score });

    const research = this.tools.invoke("public_company_research", { company: lead.company ?? "Example Co" });
    trace.push({ agent: "researcher", outcome: "grounded", source: research.source });

    const proposedAction = score >= 70 ? "send_email" : "request_details";
    const recommendation =
      score >= 70 ? "Schedule a discovery call and share a synthetic solution brief." : "Request missing qualification details.";
    trace.push({ agent: "strategist", outcome: "proposed", action: proposedAction });

    const policy = requireApproval(proposedAction, approved);
    trace.push({ agent: "sentinel", outcome: policy.reason, approvalRequired: policy.approvalRequired });
    return {
      status: policy.approvalRequired ? "approval_required" : "completed",
      score,
      recommendation: redactSensitive(recommendation),
      research,
      proposedAction,
      trace
    };
  }
}

