import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

export class McpClient {
  private clients: Map<string, Client> = new Map();
  private config: any;

  constructor() {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const configPath = path.resolve(__dirname, "../../config/mcp-config.json");
    this.config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  }

  async connect(serverName: string): Promise<Client> {
    if (this.clients.has(serverName)) return this.clients.get(serverName)!;

    const def = this.config.mcpServers[serverName];
    if (!def) throw new Error(`Server '${serverName}' not found in mcp-config.json`);

    const transport = new StdioClientTransport({
      command: def.command,
      args: def.args,
    });

    const client = new Client({ name: "linkedin-agent", version: "1.0.0" });
    await client.connect(transport);

    this.clients.set(serverName, client);
    return client;
  }

  async callTool(serverName: string, toolName: string, args: Record<string, any>) {
    const client = await this.connect(serverName);
    return await client.callTool({ name: toolName, arguments: args });
  }

  async listTools(serverName: string) {
    const client = await this.connect(serverName);
    return await client.listTools();
  }

  async shutdown() {
    for (const client of this.clients.values()) await client.close();
    this.clients.clear();
  }
}