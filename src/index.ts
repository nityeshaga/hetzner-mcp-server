#!/usr/bin/env node
/**
 * Hetzner Cloud MCP Server
 *
 * This MCP server provides tools to manage Hetzner Cloud infrastructure
 * including servers, SSH keys, and reference data (server types, images, locations).
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { registerReferenceTools } from "./tools/reference.js";
import { registerSSHKeyTools } from "./tools/ssh-keys.js";
import { registerServerTools } from "./tools/servers.js";

// Create MCP server instance
const server = new McpServer({
  name: "hetzner-mcp-server",
  version: "1.0.0"
});

// Register all tools
registerReferenceTools(server);
registerSSHKeyTools(server);
registerServerTools(server);

// Main function
async function main(): Promise<void> {
  // Check for API token
  if (!process.env.HETZNER_API_TOKEN) {
    console.error("ERROR: HETZNER_API_TOKEN environment variable is required");
    console.error("");
    console.error("To get an API token:");
    console.error("1. Go to https://console.hetzner.cloud/projects");
    console.error("2. Select your project");
    console.error("3. Go to Security > API Tokens");
    console.error("4. Generate a new token with Read & Write permissions");
    process.exit(1);
  }

  // Start server with stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log to stderr (stdout is reserved for MCP protocol)
  console.error("Hetzner MCP server running via stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
