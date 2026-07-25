const EMAIL = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const CARD = /\b(?:\d[ -]*?){13,16}\b/g;

export function redactSensitive(value) {
  return String(value).replace(EMAIL, "[REDACTED_EMAIL]").replace(CARD, "[REDACTED_PAYMENT]");
}

export function requireRole(role, operation) {
  if (operation === "read") return true;
  if (!["editor", "admin"].includes(role)) {
    throw new Error("write operation requires editor or admin role");
  }
  return true;
}

export function requireApproval(action, approved) {
  if (["send_email", "change_stage"].includes(action) && !approved) {
    return { allowed: false, approvalRequired: true, reason: "human approval required" };
  }
  return { allowed: true, approvalRequired: false, reason: "policy checks passed" };
}

