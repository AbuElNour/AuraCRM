import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { AuraCRM } from "./app.mjs";

const app = new AuraCRM();
app.createLead({
  tenantId: "demo",
  role: "admin",
  lead: { id: "lead-1", company: "Northstar Labs", need: "Agentic service desk", budget: true, timeline: "Q4" }
});

const root = dirname(dirname(fileURLToPath(import.meta.url)));

function json(response, status, body) {
  response.writeHead(status, { "content-type": "application/json", "x-content-type-options": "nosniff" });
  response.end(JSON.stringify(body));
}

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {};
}

const server = createServer(async (request, response) => {
  try {
    if (request.url === "/" && request.method === "GET") {
      const page = await readFile(join(root, "public", "index.html"));
      response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      return response.end(page);
    }
    if (request.url === "/health") return json(response, 200, { status: "healthy", mode: "synthetic" });
    if (request.url === "/api/leads" && request.method === "GET") {
      return json(response, 200, { data: app.listLeads("demo") });
    }
    if (request.url === "/api/swarm/run" && request.method === "POST") {
      const body = await readJson(request);
      return json(response, 200, app.runSwarm({ tenantId: "demo", leadId: body.leadId ?? "lead-1", approved: body.approved }));
    }
    return json(response, 404, { error: "not_found" });
  } catch (error) {
    return json(response, 400, { error: "request_failed", message: error.message });
  }
});

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  server.listen(Number(process.env.PORT ?? 3000), "127.0.0.1", () => {
    console.log("AuraCRM synthetic demo: http://127.0.0.1:3000");
  });
}

export { server };

