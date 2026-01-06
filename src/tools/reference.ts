import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { makeApiRequest, handleApiError } from "../api.js";
import {
  ResponseFormat,
  ListServerTypesResponse,
  ListImagesResponse,
  ListLocationsResponse,
  HetznerServerType,
  HetznerImage,
  HetznerLocation
} from "../types.js";

const ResponseFormatSchema = z.nativeEnum(ResponseFormat).default(ResponseFormat.MARKDOWN);

export function registerReferenceTools(server: McpServer): void {
  // List Server Types
  server.registerTool(
    "hetzner_list_server_types",
    {
      title: "List Server Types",
      description: `List all available server types (instance sizes) with their specs and pricing.

Returns information about available server configurations including:
- Name (e.g., "cx22", "cpx11")
- CPU cores and type
- Memory (GB)
- Disk size (GB)
- Hourly and monthly pricing

Use this to find the right server type when creating a new server.`,
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
        const data = await makeApiRequest<ListServerTypesResponse>("/server_types");
        const serverTypes = data.server_types;

        if (params.response_format === ResponseFormat.JSON) {
          return {
            content: [{ type: "text", text: JSON.stringify(serverTypes, null, 2) }]
          };
        }

        const lines = ["# Available Server Types", ""];
        for (const st of serverTypes) {
          lines.push(`## ${st.name}`);
          lines.push(`- **Description**: ${st.description}`);
          lines.push(`- **CPU**: ${st.cores} cores (${st.cpu_type})`);
          lines.push(`- **Memory**: ${st.memory} GB`);
          lines.push(`- **Disk**: ${st.disk} GB`);
          lines.push(`- **Architecture**: ${st.architecture}`);
          if (st.prices.length > 0) {
            const price = st.prices[0];
            lines.push(`- **Price**: €${price.price_monthly.gross}/month (€${price.price_hourly.gross}/hour)`);
          }
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

  // List Images
  server.registerTool(
    "hetzner_list_images",
    {
      title: "List Images",
      description: `List available OS images for creating servers.

Returns system images (operating systems) like Ubuntu, Debian, CentOS, etc.
Each image includes:
- Name (e.g., "ubuntu-24.04")
- OS flavor and version
- Architecture (x86 or arm)

Use this to find the right image when creating a new server.`,
      inputSchema: z.object({
        type: z.enum(["system", "snapshot", "backup", "app"]).optional()
          .describe("Filter by image type. Defaults to 'system' (OS images)"),
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
        const queryParams: Record<string, string> = {};
        if (params.type) {
          queryParams.type = params.type;
        } else {
          queryParams.type = "system"; // Default to system images
        }

        const data = await makeApiRequest<ListImagesResponse>("/images", "GET", undefined, queryParams);
        const images = data.images.filter(img => img.status === "available");

        if (params.response_format === ResponseFormat.JSON) {
          return {
            content: [{ type: "text", text: JSON.stringify(images, null, 2) }]
          };
        }

        const lines = ["# Available Images", ""];

        // Group by OS flavor
        const byFlavor: Record<string, HetznerImage[]> = {};
        for (const img of images) {
          const flavor = img.os_flavor || "other";
          if (!byFlavor[flavor]) byFlavor[flavor] = [];
          byFlavor[flavor].push(img);
        }

        for (const [flavor, imgs] of Object.entries(byFlavor)) {
          lines.push(`## ${flavor.charAt(0).toUpperCase() + flavor.slice(1)}`);
          for (const img of imgs) {
            lines.push(`- **${img.name}** - ${img.description} (${img.architecture})`);
          }
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

  // List Locations
  server.registerTool(
    "hetzner_list_locations",
    {
      title: "List Locations",
      description: `List available datacenter locations.

Returns all Hetzner datacenter locations where you can create servers:
- Location code (e.g., "fsn1", "nbg1", "hel1")
- City and country
- Network zone

Use this to choose where to deploy your server.`,
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
        const data = await makeApiRequest<ListLocationsResponse>("/locations");
        const locations = data.locations;

        if (params.response_format === ResponseFormat.JSON) {
          return {
            content: [{ type: "text", text: JSON.stringify(locations, null, 2) }]
          };
        }

        const lines = ["# Available Locations", ""];
        for (const loc of locations) {
          lines.push(`## ${loc.name}`);
          lines.push(`- **City**: ${loc.city}, ${loc.country}`);
          lines.push(`- **Description**: ${loc.description}`);
          lines.push(`- **Network Zone**: ${loc.network_zone}`);
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
}
