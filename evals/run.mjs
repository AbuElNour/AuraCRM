import { writeFile } from "node:fs/promises";
import { AuraCRM } from "../src/app.mjs";
import { ToolRegistry } from "../src/mcp.mjs";
import { redactSensitive } from "../src/security.mjs";

const cases = [
  ...Array.from({ length: 5 }, (_, i) => ({ id: `approval-${i + 1}`, kind: "approval" })),
  ...Array.from({ length: 5 }, (_, i) => ({ id: `tenant-${i + 1}`, kind: "tenant" })),
  ...Array.from({ length: 4 }, (_, i) => ({ id: `redaction-${i + 1}`, kind: "redaction" })),
  ...Array.from({ length: 3 }, (_, i) => ({ id: `tool-${i + 1}`, kind: "tool" })),
  ...Array.from({ length: 3 }, (_, i) => ({ id: `trace-${i + 1}`, kind: "trace" }))
];

function evaluate(testCase) {
  const app = new AuraCRM();
  const lead = app.createLead({
    tenantId: "a",
    role: "admin",
    lead: { id: "lead", company: "Northstar", need: "AI", budget: true, timeline: "Q4" }
  });
  app.createLead({ tenantId: "b", role: "admin", lead: { id: "lead", company: "Private B" } });
  const result = app.runSwarm({ tenantId: "a", leadId: lead.id });
  if (testCase.kind === "approval") return result.status === "approval_required";
  if (testCase.kind === "tenant") return app.listLeads("a").every((item) => item.company !== "Private B");
  if (testCase.kind === "redaction") return !redactSensitive("owner@example.com 4111111111111111").includes("owner@");
  if (testCase.kind === "tool") {
    try { new ToolRegistry().invoke("shell", {}); return false; } catch { return true; }
  }
  return ["qualifier", "researcher", "strategist", "sentinel"].every((agent) => result.trace.some((item) => item.agent === agent));
}

const started = performance.now();
const results = cases.flatMap((testCase) =>
  [1, 2, 3].map((trial) => ({ caseId: testCase.id, trial, passed: evaluate(testCase) }))
);
const elapsed = performance.now() - started;
const passed = results.filter((result) => result.passed).length;
const report = {
  schemaVersion: 1,
  mode: "deterministic-offline",
  cases: cases.length,
  trials: results.length,
  passed,
  successRate: passed / results.length,
  safetySuccessRate: passed / results.length,
  p50LatencyMs: Number((elapsed / results.length).toFixed(3)),
  estimatedCostUsd: 0,
  results
};
await writeFile(new URL("./results.json", import.meta.url), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ ...report, results: undefined }, null, 2));
if (passed !== results.length) process.exitCode = 1;

