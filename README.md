# Hetzner MCP Server

[![npm version](https://badge.fury.io/js/hetzner-mcp-server.svg)](https://www.npmjs.com/package/hetzner-mcp-server)

An MCP server that lets Claude Code manage your Hetzner Cloud servers.

```bash
npm install -g hetzner-mcp-server
```

---

## What is MCP?

**MCP (Model Context Protocol)** is a way for AI assistants like Claude to interact with external services and APIs. Think of it like giving Claude "hands" to do things on your behalf.

**How it works:**
1. You install an MCP server (like this one) on your computer
2. You configure Claude Code to use it
3. Claude can now use "tools" that the MCP server provides
4. When you ask Claude to "create a server", it uses these tools to actually do it

**Your understanding is correct:** MCP exposes certain API capabilities as tool calls for the AI agent. The AI can then decide when to use these tools to help you accomplish tasks.

---

## What is Hetzner Cloud?

[Hetzner](https://www.hetzner.com/cloud) is a cloud hosting provider (like AWS, DigitalOcean, or Linode) where you can rent virtual servers. You pay by the hour for the servers you use.

### What is a "Project" in Hetzner?

A **Project** is like a folder or container that groups related resources together. When you sign up for Hetzner Cloud:

1. You create **Projects** to organize your work (e.g., "My Blog", "Client Website", "Test Environment")
2. Inside each project, you create **Servers** (the actual virtual machines)
3. Each project also contains related resources: SSH keys, firewall rules, networks, etc.

**Example:** You might have:
- Project "Personal Blog" → 1 server running your blog
- Project "Client Work" → 3 servers for different client websites
- Project "Testing" → Temporary servers you spin up and delete

Each project is completely separate - servers in one project can't see servers in another.

---

## What Can This MCP Do?

### It CAN:
- **Create servers** (this costs money!)
- **Delete servers** (permanent, irreversible)
- **Power on/off servers** (like pressing the power button)
- **Reboot servers**
- **List all your servers** and see their details (IP address, status, specs)
- **Manage SSH keys** (the keys used to log into your servers)
- **Show available options** (server sizes, OS images, datacenter locations)

### It CANNOT:
- Create new Projects (you do that manually in the Hetzner web console)
- Manage billing or payment methods
- Access other projects (it only sees the project whose token you provide)
- Manage advanced features like load balancers, volumes, or firewalls (not implemented yet)

### Important: This Can Spend Your Money!

When you create a server through this MCP, **Hetzner will charge you real money**. Servers are billed hourly. For example:
- A small `cx22` server costs ~€0.006/hour (~€4/month)
- A larger `cx52` server costs ~€0.119/hour (~€86/month)

Always check pricing with `hetzner_list_server_types` before creating servers, and **delete servers you're not using** to avoid charges.

---

## Hetzner MCP + Kamal = Your Own PaaS

Combine this MCP with [Kamal](https://kamal-deploy.org/) (DHH's deployment tool) and the [kamal-deploy skill](https://github.com/nityeshaga/claude-code-essentials/tree/main/plugins/basics/skills/kamal-deploy) to get a complete deployment platform inside Claude Code.

**The mental model:**
- **Hetzner MCP** = Provisions the servers (the computers)
- **Kamal** = Deploys your app to those servers (the software)
- **Together** = Your own Vercel/Render/Hatchbox alternative

### Feature Comparison

| Feature | Hetzner MCP + Kamal | Hatchbox | Vercel | Render |
|---------|---------------------|----------|--------|--------|
| **Create/manage servers** | ✅ Via MCP | ✅ Web UI | ❌ Serverless | ✅ Managed |
| **Deploy apps** | ✅ Kamal | ✅ Git push | ✅ Git push | ✅ Git push |
| **Zero-downtime deploys** | ✅ | ✅ | ✅ | ✅ |
| **SSL certificates** | ✅ Let's Encrypt | ✅ Auto | ✅ Auto | ✅ Auto |
| **Databases** | ✅ Kamal accessories | ✅ Managed | ❌ External | ✅ Managed |
| **Redis** | ✅ Kamal accessories | ✅ Managed | ❌ External | ✅ Managed |
| **Background jobs** | ✅ Kamal workers | ✅ Sidekiq | ⚠️ Cron only | ✅ Workers |
| **Rollback** | ✅ `kamal rollback` | ✅ One-click | ✅ One-click | ✅ One-click |
| **Custom domains** | ✅ | ✅ | ✅ | ✅ |
| **SSH access to server** | ✅ Full root | ✅ Limited | ❌ None | ❌ None |
| **Docker support** | ✅ Native | ❌ No | ✅ Yes | ✅ Yes |
| **Non-Ruby apps** | ✅ Any Docker app | ❌ Ruby only | ✅ Any | ✅ Any |
| **Multiple apps per server** | ✅ Manual | ✅ Clusters | N/A | N/A |
| **Web UI dashboard** | ❌ CLI only | ✅ | ✅ | ✅ |
| **Automatic backups** | ❌ DIY | ✅ | N/A | ✅ |
| **Managed security updates** | ❌ DIY | ✅ | ✅ | ✅ |
| **Monitoring/alerts** | ❌ DIY | ✅ | ✅ | ✅ |

### Cost Comparison (typical Rails app)

| Platform | Monthly Cost | What You Get |
|----------|--------------|--------------|
| **Hetzner + Kamal** | ~€4-8/mo | Full server, unlimited apps |
| **Hatchbox** | $10-29/mo + server | Managed Rails deployment |
| **Vercel** | $20+/mo | Serverless, limited compute |
| **Render** | $7-25/mo per service | Managed containers |

### When to Use What

**Choose Hetzner MCP + Kamal if you:**
- Want full control over your infrastructure
- Are comfortable with CLI (Claude helps!)
- Want the cheapest option for production apps
- Need to run any Docker-based app (not just Rails)
- Want to learn how deployment actually works

**Choose Hatchbox if you:**
- Only deploy Rails apps
- Want a polished web UI
- Need team access management
- Prefer fully managed backups/updates
- Don't want to think about servers

**Choose Vercel if you:**
- Build Next.js/frontend apps
- Want zero server management
- Need edge functions/CDN
- Don't need persistent servers

**Choose Render if you:**
- Want managed containers without complexity
- Need managed databases included
- Want simple scaling
- Prefer web UI over CLI

### Quick Start with Kamal

1. Install the [kamal-deploy skill](https://github.com/nityeshaga/claude-code-essentials/tree/main/plugins/basics/skills/kamal-deploy) from claude-code-essentials
2. Ask Claude: "Create a cx22 server with Ubuntu for my-app" (uses this MCP)
3. Ask Claude: "Help me set up Kamal to deploy my Rails app to this server"
4. Run `kamal setup` and you're live!

---

## How Authentication Works

### The API Token

To use Hetzner's API, you need an **API Token**. This is like a password that:
1. Proves you are who you say you are
2. Grants access to a specific project
3. Has permission levels (read-only or read+write)

**One token = One project.** If you have 3 projects and want Claude to manage all of them, you'd need 3 different tokens (and 3 MCP configurations).

### Token Permissions

When you create a token, you choose its permissions:
- **Read**: Can view servers, list resources, but can't change anything
- **Read & Write**: Can view AND create/delete/modify resources

For this MCP to be useful, you need **Read & Write** permissions.

### Security Considerations

Your API token is powerful - anyone with it can create/delete servers in your project. Keep it safe:

1. **Never share your token** or commit it to git
2. **Store it in environment variables**, not in code
3. **Use a dedicated project for testing** so mistakes don't affect production
4. **Delete unused tokens** in the Hetzner console
5. **Review what Claude is doing** before confirming destructive actions

---

## Getting an API Token

1. Go to [Hetzner Cloud Console](https://console.hetzner.cloud/projects)
2. Click on the project you want to manage (or create a new one)
3. In the left sidebar, click **Security**
4. Click **API Tokens**
5. Click **Generate API Token**
6. Enter a name (e.g., "Claude Code MCP")
7. Select **Read & Write** permissions
8. Click **Generate API Token**
9. **Copy the token immediately** - it won't be shown again!

---

## Installation

### Prerequisites
- Node.js 18 or higher
- npm
- A Hetzner Cloud account with an API token

### Option 1: Install from npm (Recommended)

```bash
npm install -g hetzner-mcp-server
```

Then configure Claude Code to use it (see below).

### Option 2: Clone and Build

```bash
# Clone the repository
git clone https://github.com/nityeshaga/hetzner-mcp-server.git
cd hetzner-mcp-server

# Install dependencies
npm install

# Build the TypeScript code
npm run build
```

---

## Configuring Claude Code

Add the MCP server config to **`~/.claude.json`** (your user-level Claude Code config file).

> **Important:** The config goes in `~/.claude.json`, NOT `~/.claude/settings.json` or `~/.claude/.mcp.json`. Run `/mcp` in Claude Code to verify the correct config location for your setup.

### If installed via npm (Option 1):

Open `~/.claude.json` and add `hetzner` to the `mcpServers` object:

```json
{
  "mcpServers": {
    "hetzner": {
      "type": "stdio",
      "command": "npx",
      "args": ["hetzner-mcp-server"],
      "env": {
        "HETZNER_API_TOKEN": "your-api-token-here"
      }
    }
  }
}
```

If you already have other MCP servers configured (like `figma`), just add `hetzner` alongside them:

```json
{
  "mcpServers": {
    "figma": { ... },
    "hetzner": {
      "type": "stdio",
      "command": "npx",
      "args": ["hetzner-mcp-server"],
      "env": {
        "HETZNER_API_TOKEN": "your-api-token-here"
      }
    }
  }
}
```

### If cloned from GitHub (Option 2):

```json
{
  "mcpServers": {
    "hetzner": {
      "type": "stdio",
      "command": "node",
      "args": ["/path/to/hetzner-mcp-server/dist/index.js"],
      "env": {
        "HETZNER_API_TOKEN": "your-api-token-here"
      }
    }
  }
}
```

Replace `/path/to/hetzner-mcp-server` with the actual path where you cloned the repo.

Replace `your-api-token-here` with your actual Hetzner API token.

Then **restart Claude Code** for the changes to take effect.

---

## Using the MCP

Once configured, you can talk to Claude naturally:

### Viewing Resources
- "List all my servers"
- "Show me server 12345"
- "What SSH keys do I have?"
- "What server types are available and how much do they cost?"
- "What locations can I deploy to?"
- "What OS images are available?"

### Creating Servers
- "Create a new server called my-app with Ubuntu 24.04"
- "Spin up a cx22 server in Falkenstein running Debian"
- "Create a server named test-server with my SSH key attached"

### Managing Servers
- "Power off server 12345"
- "Reboot my-app server"
- "Delete the test-server" (be careful - this is permanent!)

### Managing SSH Keys
- "Add my SSH public key" (then paste the key)
- "List my SSH keys"
- "Delete SSH key 789"

---

## Available Tools (14 total)

### Server Tools (7)
| Tool | What it does |
|------|--------------|
| `hetzner_list_servers` | Shows all servers in the project |
| `hetzner_get_server` | Shows details of one server (IP, status, specs) |
| `hetzner_create_server` | Creates a new server (costs money!) |
| `hetzner_delete_server` | Permanently deletes a server |
| `hetzner_power_on_server` | Turns on a powered-off server |
| `hetzner_power_off_server` | Hard power off (like pulling the plug) |
| `hetzner_reboot_server` | Hard reboot (like pressing reset button) |

### SSH Key Tools (4)
| Tool | What it does |
|------|--------------|
| `hetzner_list_ssh_keys` | Shows all SSH keys in the project |
| `hetzner_get_ssh_key` | Shows details of one SSH key |
| `hetzner_create_ssh_key` | Adds a new SSH public key |
| `hetzner_delete_ssh_key` | Removes an SSH key |

### Reference Tools (3)
| Tool | What it does |
|------|--------------|
| `hetzner_list_server_types` | Shows available sizes and prices |
| `hetzner_list_images` | Shows available operating systems |
| `hetzner_list_locations` | Shows available datacenters |

---

## Example Workflow

Here's how you might use this MCP to deploy a new project:

### 1. Check what's available
```
You: "What server types are available?"
Claude: [Lists server types with CPU, RAM, disk, and pricing]

You: "What locations can I use?"
Claude: [Lists Falkenstein, Nuremberg, Helsinki, etc.]
```

### 2. Add your SSH key (if not already added)
```
You: "Add my SSH key called 'my-laptop'"
Claude: "What's the public key content?"
You: [Paste your ~/.ssh/id_rsa.pub content]
Claude: "SSH key 'my-laptop' created with ID 12345"
```

### 3. Create a server
```
You: "Create a cx22 server with Ubuntu 24.04 in Falkenstein, name it my-app, and use my SSH key"
Claude: "Server 'my-app' created!
  - ID: 67890
  - IP: 123.45.67.89
  - Status: initializing
  SSH key authentication is configured."
```

### 4. Connect to your server
```bash
ssh root@123.45.67.89
```

### 5. When done, delete the server (to stop charges)
```
You: "Delete server my-app"
Claude: "Are you sure? This is permanent."
You: "Yes, delete it"
Claude: "Server 67890 is being deleted."
```

---

## Troubleshooting

### "HETZNER_API_TOKEN environment variable is required"
You haven't configured the token in your Claude Code settings. Make sure:
1. The token is in `~/.claude/settings.json`
2. You've restarted Claude Code

### "Error: Authentication failed"
Your API token is invalid. Generate a new one in the Hetzner console.

### "Error: Permission denied"
Your token doesn't have write permissions. Generate a new token with "Read & Write".

### "Error: Resource not found"
The server/SSH key ID doesn't exist. Use the list commands to see what's available.

---

## Development

```bash
# Install dependencies
npm install

# Build (compile TypeScript to JavaScript)
npm run build

# Development mode (auto-rebuild on changes)
npm run dev
```

---

## License

MIT
