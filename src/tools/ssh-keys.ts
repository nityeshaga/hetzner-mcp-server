import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { makeApiRequest, handleApiError } from "../api.js";
import {
  ResponseFormat,
  ListSSHKeysResponse,
  GetSSHKeyResponse,
  CreateSSHKeyResponse,
  HetznerSSHKey
} from "../types.js";

const ResponseFormatSchema = z.nativeEnum(ResponseFormat).default(ResponseFormat.MARKDOWN);

function formatSSHKey(key: HetznerSSHKey): string {
  const lines = [
    `## ${key.name} (ID: ${key.id})`,
    `- **Fingerprint**: ${key.fingerprint}`,
    `- **Created**: ${new Date(key.created).toLocaleString()}`
  ];
  if (Object.keys(key.labels).length > 0) {
    lines.push(`- **Labels**: ${Object.entries(key.labels).map(([k, v]) => `${k}=${v}`).join(", ")}`);
  }
  return lines.join("\n");
}

export function registerSSHKeyTools(server: McpServer): void {
  // List SSH Keys
  server.registerTool(
    "hetzner_list_ssh_keys",
    {
      title: "List SSH Keys",
      description: `List all SSH keys in the project.

Returns all SSH public keys that have been added to this project.
SSH keys are used to authenticate when connecting to servers.`,
      inputSchema: z.object({
        response_format: ResponseFormatSchema.describe("Output format: 'markdown' or 'json'")
      }).strict(),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async (params) => {
      try {
        const data = await makeApiRequest<ListSSHKeysResponse>("/ssh_keys");
        const keys = data.ssh_keys;

        if (params.response_format === ResponseFormat.JSON) {
          return {
            content: [{ type: "text", text: JSON.stringify(keys, null, 2) }]
          };
        }

        if (keys.length === 0) {
          return {
            content: [{ type: "text", text: "No SSH keys found. Use `hetzner_create_ssh_key` to add one." }]
          };
        }

        const lines = ["# SSH Keys", "", `Found ${keys.length} SSH key(s):`, ""];
        for (const key of keys) {
          lines.push(formatSSHKey(key));
          lines.push("");
        }

        return {
          content: [{ type: "text", text: lines.join("\n") }]
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: handleApiError(error) }],
          isError: true
        };
      }
    }
  );

  // Get SSH Key
  server.registerTool(
    "hetzner_get_ssh_key",
    {
      title: "Get SSH Key",
      description: `Get details of a specific SSH key by ID.`,
      inputSchema: z.object({
        id: z.number().int().positive().describe("The SSH key ID"),
        response_format: ResponseFormatSchema.describe("Output format: 'markdown' or 'json'")
      }).strict(),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async (params) => {
      try {
        const data = await makeApiRequest<GetSSHKeyResponse>(`/ssh_keys/${params.id}`);
        const key = data.ssh_key;

        if (params.response_format === ResponseFormat.JSON) {
          return {
            content: [{ type: "text", text: JSON.stringify(key, null, 2) }]
          };
        }

        const lines = ["# SSH Key Details", "", formatSSHKey(key), "", "**Public Key**:", "```", key.public_key, "```"];
        return {
          content: [{ type: "text", text: lines.join("\n") }]
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: handleApiError(error) }],
          isError: true
        };
      }
    }
  );

  // Create SSH Key
  server.registerTool(
    "hetzner_create_ssh_key",
    {
      title: "Create SSH Key",
      description: `Add a new SSH public key to the project.

The SSH key can then be used when creating servers to enable SSH access.

Args:
  - name: A name for the SSH key (e.g., "my-laptop")
  - public_key: The SSH public key content (starts with "ssh-rsa", "ssh-ed25519", etc.)
  - labels: Optional key-value labels for organization`,
      inputSchema: z.object({
        name: z.string().min(1).max(255).describe("Name for the SSH key"),
        public_key: z.string().min(1).describe("The SSH public key content"),
        labels: z.record(z.string()).optional().describe("Optional labels as key-value pairs"),
        response_format: ResponseFormatSchema.describe("Output format: 'markdown' or 'json'")
      }).strict(),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true
      }
    },
    async (params) => {
      try {
        const requestBody: Record<string, unknown> = {
          name: params.name,
          public_key: params.public_key
        };
        if (params.labels) {
          requestBody.labels = params.labels;
        }

        const data = await makeApiRequest<CreateSSHKeyResponse>("/ssh_keys", "POST", requestBody);
        const key = data.ssh_key;

        if (params.response_format === ResponseFormat.JSON) {
          return {
            content: [{ type: "text", text: JSON.stringify(key, null, 2) }]
          };
        }

        const lines = [
          "# SSH Key Created",
          "",
          formatSSHKey(key),
          "",
          "You can now use this SSH key when creating servers by specifying its name or ID."
        ];
        return {
          content: [{ type: "text", text: lines.join("\n") }]
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: handleApiError(error) }],
          isError: true
        };
      }
    }
  );

  // Delete SSH Key
  server.registerTool(
    "hetzner_delete_ssh_key",
    {
      title: "Delete SSH Key",
      description: `Delete an SSH key from the project.

This does NOT affect existing servers that were created with this key.
They will continue to work with the key.`,
      inputSchema: z.object({
        id: z.number().int().positive().describe("The SSH key ID to delete")
      }).strict(),
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async (params) => {
      try {
        await makeApiRequest(`/ssh_keys/${params.id}`, "DELETE");

        return {
          content: [{ type: "text", text: `SSH key ${params.id} has been deleted.` }]
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: handleApiError(error) }],
          isError: true
        };
      }
    }
  );
}
