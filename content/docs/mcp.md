+++
title = "MCP tools"
description = "Connect trusted local tool servers, and allow only the tools you choose for chat and scheduled tasks."
+++

# MCP tools

Poppet can connect to local MCP servers over stdio and offer their tools in chat, messaging, and scheduled tasks. Only the tools you list are offered. MCP is off until you add an enabled server to `config.json`.

A server runs as a program with your account's permissions. Review and trust the executable before you enable it. Tool allowlists are not a sandbox.

## Configure a server

Add `mcpServers` to `config.json`:

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

Replace the command, arguments, and tool names with your server's values. `args` and `tools` are required. `cwd`, `environment`, and `scheduledTools` are optional.

- `id` is lowercase, starts with a letter, uses letters, digits, and hyphens, and is at most 64 characters.
- The command runs directly, with no shell. Use an absolute path, especially for the background worker.
- A relative `cwd` resolves beside `config.json`. Without it, the server uses Poppet's working directory.
- Never put secret values in the command, its arguments, or `config.json`.

The server gets a small standard environment, plus only the values you name. `{ "env": "NAME" }` passes one environment variable. `{ "credential": "name" }` reads a protected key from `<data directory>/auth/name.json`. The file must be `0600`, with a `0700` directory. Environment values are not added to the model's instructions, and matching values in the server's output are redacted. Background workers do not see your shell environment, so use a credential reference for them.

Set `mcpServers` to `[]` to turn all servers off. Restart the worker after any change.

## Check and use tools

```fish
poppet mcp servers
poppet mcp status
poppet mcp tools reference
poppet chat new "Use reference to look up record 123"
```

`servers` and `status` show each server's permissions, connection state, and diagnostics without starting anything. `tools <server>` starts the server to list its allowed tools. These commands use the running worker when there is one.

A server connects the first time a chat needs it. If it fails, the built-in tools keep working. Poppet tries to reconnect after 30 seconds, doubling the wait up to 10 minutes. `mcp servers` shows when the next try is due.

Tool calls are not retried automatically. If a call fails after it was sent, Poppet records it as uncertain and does not repeat it. Check the server's state before asking for the action again.

## Permissions

Only tools in `tools` are offered to the model. In chat, a tool call still needs your explicit request in the current message.

`scheduledTools` is empty by default. Add a tool there only after you have checked that it is read-only. Scheduled runs can use only tools listed in both `tools` and `scheduledTools`. Server annotations do not grant access.

Results from MCP servers are treated as data. They cannot authorize memory changes, task changes, or page reads.

## Limits

- Up to 8 servers. Each server can expose up to 128 tools.
- Tool descriptions are up to 4096 characters. Input and output schemas are up to 16 KiB.
- Each tool call can take up to 10 seconds. Starting a server and listing its tools has an 8-second limit.
- Tool results fit within the 16 KiB tool-output limit. Long text is shortened and marked as truncated.

Poppet supports tool discovery and calls over stdio. Remote HTTP servers, OAuth, resources, prompts, and sampling are not supported.
