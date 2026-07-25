import test from "node:test";
import assert from "node:assert/strict";
import { AuraCRM } from "../src/app.mjs";
import { redactSensitive } from "../src/security.mjs";
import { ToolRegistry } from "../src/mcp.mjs";

test("tenant isolation blocks cross-tenant lead reads", () => {
  const app = new AuraCRM();
  app.createLead({ tenantId: "a", role: "admin", lead: { id: "same", company: "A" } });
  app.createLead({ tenantId: "b", role: "admin", lead: { id: "same", company: "B" } });
  assert.equal(app.listLeads("a")[0].company, "A");
  assert.equal(app.listLeads("b")[0].company, "B");
});

test("viewer cannot create a lead", () => {
  const app = new AuraCRM();
  assert.throws(() => app.createLead({ tenantId: "a", role: "viewer", lead: {} }), /requires editor/);
});

test("high-scoring swarm action requires approval", () => {
  const app = new AuraCRM();
  const lead = app.createLead({
    tenantId: "a",
    role: "admin",
    lead: { company: "Example", need: "AI", budget: true, timeline: "Q4" }
  });
  assert.equal(app.runSwarm({ tenantId: "a", leadId: lead.id }).status, "approval_required");
  assert.equal(app.runSwarm({ tenantId: "a", leadId: lead.id, approved: true }).status, "completed");
});

test("PII and payment patterns are redacted", () => {
  assert.equal(redactSensitive("mail a@example.com card 4111 1111 1111 1111"), "mail [REDACTED_EMAIL] card [REDACTED_PAYMENT]");
});

test("unallowlisted MCP tool is rejected", () => {
  assert.throws(() => new ToolRegistry(["summarize_timeline"]).invoke("shell", {}), /not allowlisted/);
});

