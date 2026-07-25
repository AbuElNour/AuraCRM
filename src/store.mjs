export class TenantStore {
  #entities = new Map();
  #audit = [];

  create(tenantId, entity) {
    const id = entity.id ?? `lead-${this.#entities.size + 1}`;
    const record = { ...entity, id, tenantId };
    this.#entities.set(`${tenantId}:${id}`, record);
    this.#audit.push({ event: "entity.created", tenantId, entityId: id });
    return structuredClone(record);
  }

  list(tenantId) {
    return [...this.#entities.values()]
      .filter((entity) => entity.tenantId === tenantId)
      .map((entity) => structuredClone(entity));
  }

  get(tenantId, id) {
    const value = this.#entities.get(`${tenantId}:${id}`);
    return value ? structuredClone(value) : null;
  }

  audit(tenantId) {
    return this.#audit.filter((event) => event.tenantId === tenantId).map((event) => ({ ...event }));
  }
}

