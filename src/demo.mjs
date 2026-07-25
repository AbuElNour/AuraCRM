import { AuraCRM } from "./app.mjs";

const app = new AuraCRM();
const lead = app.createLead({
  tenantId: "demo",
  role: "admin",
  lead: { company: "Northstar Labs", need: "Agentic CRM", budget: true, timeline: "Q4" }
});

console.log(JSON.stringify(app.runSwarm({ tenantId: "demo", leadId: lead.id }), null, 2));
console.log(JSON.stringify(app.runSwarm({ tenantId: "demo", leadId: lead.id, approved: true }), null, 2));

