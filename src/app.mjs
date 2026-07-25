import { LeadSwarm } from "./swarm.mjs";
import { TenantStore } from "./store.mjs";
import { requireRole } from "./security.mjs";

export class AuraCRM {
  constructor() {
    this.store = new TenantStore();
    this.swarm = new LeadSwarm();
  }

  createLead({ tenantId, role = "viewer", lead }) {
    requireRole(role, "write");
    return this.store.create(tenantId, { type: "lead", ...lead });
  }

  listLeads(tenantId) {
    return this.store.list(tenantId);
  }

  runSwarm({ tenantId, leadId, approved = false }) {
    const lead = this.store.get(tenantId, leadId);
    if (!lead) throw new Error("lead not found in tenant");
    return this.swarm.run(lead, { approved });
  }
}

