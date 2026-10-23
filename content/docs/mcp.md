+++
title = "MCP tools"
description = "Connect trusted local tool servers with separate permissions for chat and scheduled tasks."
next = "/docs/configuration"
+++

# MCP tools

MCP lets Poppet use tools from other programs. Choose a local server you trust, and find the tool names it provides. Allow one tool first, check it, and try it in a chat before you let scheduled tasks use it.

Poppet can connect to local stdio MCP servers and offer the tools you allow in CLI,
messaging, and scheduled runs. MCP stays off until you add an enabled server to
`config.json`. Servers run code with your account's permissions, so review and trust
the executable before you enable it. A tool allowlist is not an operating-system sandbox.

[Browser automation](browser.md) uses that same hook and the same tool loop. It has
its own configuration, run-owned resources, and no scheduled access. It is not a generic MCP
server entry and is not part of the MCP allowlist.

## Configure a server

Add `mcpServers` to your existing `<data directory>/config.json`:

```json
{
  "mcpServers": [
    {
      "id": "reference",
      "enabled": true,
      "command": "/absolute/path/to/trusted-server",
      "args": ["--stdio"],
      "cwd": "server-data",
      "environment": {
        "API_TOKEN": { "env": "REFERENCE_API_TOKEN" }
      },
      "tools": ["lookup_record"],
      "scheduledTools": []
    }
  ]
}
```

Replace the executable, arguments, and tool names with your server's values. `args` and
`tools` are required arrays. `cwd`, `environment`, and `scheduledTools` are optional. IDs must
be unique. They start with a lowercase letter, followed by lowercase letters, digits, and
hyphens, up to 64 characters. Commands run from an argument array with no shell. Install the
servers yourself. Never put secret values in commands, arguments, or general configuration.

A relative `cwd` in the file resolves beside `config.json`. Without `cwd`, the server uses
Poppet's working directory. A bare executable name uses the inherited `PATH`. For a background
worker, an absolute executable path is safer.

`POPPET_MCP_SERVERS` accepts a JSON array and replaces the whole file list. Setting it to `[]`
turns off every server for that process. Paths in environment variables resolve against that
process's working directory. Worker settings take effect after a restart, including changes to
the allowlists.

Child processes get a small standard environment, which holds `HOME`, `PATH`, `USER`,
`LOGNAME`, `SHELL`, and `TERM` on macOS, plus only the references you name. They do not inherit
every provider key or channel token. `{ "env": "NAME" }` selects a single environment value.
`{ "credential": "name" }` selects an existing protected API-key entry from
`<data directory>/auth/name.json`. That file's format is `{"version":1,"provider":"name","key":"<secret>"}`.
Create it yourself, with a `0700` auth directory and a `0600` regular file. Symlinks are rejected.
MCP inspection does not create or write credentials. If a selected reference is missing, that
server is unavailable.

The macOS LaunchAgent saves only the data directory. Shell secret variables are therefore not
available to an installed worker, so use protected credential references for it. Selected values
are never added to model instructions. Exact matches in returned text or structured JSON are
redacted. Poppet hides server stderr and avoids logging raw protocol failures, since those can
contain credentials.

## Inspect and use tools

```fish
bun run start mcp servers
bun run start mcp status
bun run start mcp tools reference
bun run start chat new "Use reference to look up record 123"
```

`servers` and `status` show the configured permissions, connection state, PID, available
tools, and diagnostics. They never start servers and never need a model. `tools <server>`
starts discovery when it is needed, and it prints only the allowed tools, their model
definitions, and their scheduled permissions. All three commands use the owning worker when
one is running. Without a worker, discovery runs in a local scope and closes the server before
it returns. There is no socket command for running tools directly.

The first agent run that needs a server connects to it. The worker keeps its connections between
requests. A standalone CLI request closes them when its scope ends. If one server fails,
the built-in tools keep working. A failed connection stays unavailable until the process that
owns it restarts. Calls are never retried or replayed automatically.

Model tool names use a stable hash of the server ID and the original tool name, under
`poppet_mcp`. `chat show <session>` stores `serverId` and `toolName` separately, so inspection
and recovery do not depend on a discovery catalog.

## Permissions and untrusted content

Only the names discovered in `tools` are offered. Changes made through chat also need your
current explicit request. `scheduledTools` is empty by default, and it must be a subset of
`tools` that you have reviewed and confirmed is read-only. Server annotations cannot grant
scheduled access. Poppet cannot verify that a server's tools do what they claim.

Each run takes a snapshot of the tool catalog. Change notifications from the server cannot
widen that snapshot. Restart the owning process to refresh discovery. Server instructions
are ignored. Descriptions, schemas, and results are untrusted data. They cannot authorize
changes to notes, memory, or tasks, widen permissions, or grant URL access. URLs returned by
MCP do not get web-search grants. Scheduled runs keep the built-in restrictions on changes.
Poppet sends the validated arguments and the selected child credentials. It does not
automatically attach chat history or global memory.

## Limits and schema compatibility

Poppet supports tool discovery and invocation only. Remote HTTP and OAuth servers, resources,
prompts, sampling, elicitation, MCP tasks, and media are not supported. Resource links and media
are marked as omitted, and they are never fetched.

- Up to 8 configured servers, 8 discovery pages per server, 128 discovered tools, and 256 KiB of
  discovery JSON per server.
- Each stdio read buffer is capped at 256 KiB, before JSON parsing. An oversized protocol message
  closes the connection.
- Allowed descriptions are up to 4096 characters. Input and output schemas are up to 16 KiB, with a
  depth of 16 and 512 nodes. Draft-07 and 2020-12 schemas are supported. Some regular expressions,
  references, and unsupported formats or keywords make discovery fail, with a diagnostic. Required MCP
  task execution is not supported.
- The model receives a strict object with one required `input` string. That string holds the original
  JSON arguments. Poppet checks the decoded object against the server's original schema. It adds no
  defaults, converts no values, and drops no unknown fields. Optional server fields stay optional, even
  with a provider that enforces strict schemas. Arguments are capped at 64 KiB.
- Tool definitions count toward the context budget. Calls share the run's and tool-call limits, and every
  batch is checked before any of it runs.
- Startup and discovery together have an 8-second deadline per server, and each protocol request has a
  5-second deadline. A tool invocation has a 10-second deadline. Process cleanup can take another 5
  seconds, while closing stdin escalates to signals.
- Serialized results fit within `POPPET_TOOL_BYTES`. Text is shortened without splitting Unicode characters.
  Oversized structured JSON is left out as a whole. Results report `truncated`, `omittedContent`,
  `omittedStructuredContent`, and `redacted`.

A tool that reports an error leaves a failed record. A transport or protocol failure after the call was
sent leaves an unknown outcome. So does a cancellation while the call is running. The external state may
have changed, so check the server before you ask for another attempt, including after a restart.
