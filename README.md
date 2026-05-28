# LinkedIn Adaptive Agent

An AI-powered agent that reads your LinkedIn profile via MCP (Model Context Protocol) and generates personalized, actionable optimization suggestions using Google Gemini.

Built as a real-world learning project to explore LLM APIs, MCP servers, and agentic workflows.

## What It Does

**Phase 1 (Complete):** Connects to your LinkedIn profile through the LinkedIn MCP server, fetches your full profile data including experience and education, and sends it to Google Gemini with a tailored system prompt to generate specific improvement suggestions saved to a local Markdown file.

**Phase 2 (Planned):** Apply profile changes automatically using Playwright browser automation.

**Phase 3 (Planned):** Search for jobs matching your optimized profile and rank them by relevance.

## Architecture

```
src/core/McpClient.ts       — MCP protocol client using the official SDK
                              handles initialize handshake, tool discovery,
                              and tool calls over stdio

src/core/MemoryEngine.ts    — reads system prompt Markdown files and
                              appends timestamped logs to execution history

src/steps/step1_analyze.ts  — fetches your LinkedIn profile via get_my_profile,
                              sends it to Gemini with analyzer.md instructions,
                              saves suggestions to memory/execution_history/

memory/system_prompts/      — LLM instruction files (edit these to tune output)
memory/execution_history/   — timestamped analysis logs (gitignored, stays local)
```

The key architectural lesson this project taught: MCP servers require a proper initialization handshake before any tool calls. The sequence is `initialize` → `notifications/initialized` → `tools/list` → `tools/call`. Skipping this causes every request to fail with `-32001` timeout errors. The official `@modelcontextprotocol/sdk` handles this correctly — do not implement the protocol manually.

## Prerequisites

- Node.js 18+
- Python + `uv` installed ([astral.sh/uv](https://astral.sh/uv))
- A LinkedIn account
- A free Google Gemini API key ([aistudio.google.com](https://aistudio.google.com))

## Setup

**1. Clone and install dependencies:**

```bash
git clone https://github.com/AbdelmounaimB/linkedin-adaptive-agent
cd linkedin-adaptive-agent
npm install
```

**2. Configure environment variables:**

```bash
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

**3. Authenticate with LinkedIn:**

This project uses the [linkedin-scraper-mcp](https://github.com/stickerdaniel/linkedin-mcp-server) server which opens a real browser session. You need to log in once to cache your session:

```bash
uvx linkedin-scraper-mcp@latest --login
```

A browser window will open. Log into LinkedIn, wait for your feed to fully load, then close the browser. Your session is saved locally under `~/.linkedin-mcp/`.

**4. Run Phase 1:**

```bash
npx tsx src/index.ts
```

Results are saved to `memory/execution_history/feedback_log.md`.

## How to Tune the Output

The quality of suggestions depends entirely on the system prompt in `memory/system_prompts/analyzer.md`. Edit this file to:

- Change your target role or location
- Add more context about your background
- Request different output formats
- Focus on specific profile sections

The LLM only knows what you tell it. A detailed, context-rich system prompt produces specific, actionable suggestions. A generic one produces generic advice.

## What I Learned Building This

**MCP protocol fundamentals.** Community examples and AI assistants often skip the initialization handshake, which causes silent failures that look like timeout issues. Understanding the actual JSON-RPC sequence was the key breakthrough.

**Tool discovery before building.** The correct workflow is: start the MCP server, call `tools/list` to see the real tool names and parameter schemas, then build your application against verified facts. Building against assumed tool names wastes hours.

**System prompt quality over model choice.** The difference between a vague system prompt and a context-rich one is larger than the difference between most LLMs. Prompt engineering is the highest-leverage skill in this stack.

**TypeScript ESM gotchas.** Switching to `"type": "module"` requires explicit `.js` extensions on imports, `node:` prefixes on built-in modules, and replacing `__dirname` with `fileURLToPath(import.meta.url)`. These are not optional suggestions — the code will not run without them.

## Tech Stack

| Tool | Purpose |
|---|---|
| TypeScript + tsx | Application language and runtime |
| @modelcontextprotocol/sdk | Official MCP client (handles protocol correctly) |
| linkedin-scraper-mcp | LinkedIn data via browser automation |
| @google/genai | Gemini API for profile analysis |
| dotenv | Environment variable management |

## Project Status

- [x] Phase 1: Profile analysis and suggestions
- [ ] Phase 2: Automated profile updates via Playwright
- [ ] Phase 3: Job search and matching

---

*This project is for personal use and learning purposes. Use responsibly and in accordance with LinkedIn's Terms of Service.*
