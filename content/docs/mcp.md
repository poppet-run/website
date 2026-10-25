+++
title = "MCP tools"
description = "Connect trusted local tool servers, and allow only the tools you choose for chat and scheduled tasks."
+++

# MCP tools

Poppet can connect to local MCP servers over stdio, and to remote MCP servers over Streamable HTTP. It offers their tools in chat, messaging, and scheduled tasks. Only the tools you list are offered. MCP is off until you add an enabled server to `config.json`.

A local server runs as a program with your account's permissions. A remote server receives the arguments and headers you send it. Review and trust the executable or endpoint before you enable it. Tool allowlists are not a sandbox.

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

### HTTP servers

An entry with `url` instead of `command` connects over Streamable HTTP:

```json
{
  "id": "remote",
  "enabled": true,
  "url": "https://mcp.example.com/mcp",
  "headers": {
    "Authorization": { "credential": "remote", "prefix": "Bearer " },
    "X-Team": { "env": "REMOTE_TEAM" }
  },
  "tools": ["lookup_record"],
  "scheduledTools": []
}
```

- An entry has either `command` or `url`, never both. HTTP entries cannot use `args`, `cwd`, or `environment`.
- URLs must use `https:`. Plain `http:` works only for `localhost`, `127.0.0.1`, and `[::1]`. A URL cannot contain a username, password, or fragment.
- Put secrets in `headers`, not in the URL path or query, because server logs may record those.
- Each header value is an `{ "env": "NAME" }` or `{ "credential": "name" }` reference, as above. An optional `prefix`, such as `"Bearer "`, is added in front. Values must be visible ASCII.
- Header names must be unique, ignoring case. Poppet manages `Accept`, `Content-Type`, `Content-Length`, `Host`, `Last-Event-ID`, `Mcp-Session-Id`, and `Mcp-Protocol-Version`, so you cannot set them.
- A missing reference makes that server unavailable. Header values are redacted from results, like environment values.

Set `mcpServers` to `[]` to turn all servers off. Restart the worker after any change.

## Check and use tools

```fish
poppet mcp servers
poppet mcp status
poppet mcp tools reference
poppet chat new "Use reference to look up record 123"
```

`servers` and `status` show each server's permissions, transport, connection state, and diagnostics without starting anything. For HTTP servers they show the endpoint's origin, not its full URL. `tools <server>` starts the server to list its allowed tools. These commands use the running worker when there is one.

A server connects the first time a chat needs it. If it fails, the built-in tools keep working. Poppet tries to reconnect after 30 seconds, doubling the wait up to 10 minutes. `mcp servers` shows when the next try is due.

Tool calls are not retried automatically. If a call fails after it was sent, Poppet records it as uncertain and does not repeat it. Check the server's state before asking for the action again.

## Permissions

Only tools in `tools` are offered to the model. In chat, a tool call still needs your explicit request in the current message.

`scheduledTools` is empty by default. Add a tool there only after you have checked that it is read-only. Scheduled runs can use only tools listed in both `tools` and `scheduledTools`. Server annotations do not grant access.

Results from MCP servers are treated as data. They cannot authorize memory changes, task changes, or page reads.

## Limits

- Up to 8 servers. Each server can expose up to 128 tools.
- Tool descriptions are up to 4096 characters. Input and output schemas are up to 16 KiB.
- Vendor schema keywords that start with `x-`, such as FastMCP's `x-fastmcp-wrap-result`, are ignored when Poppet checks a schema. Property names that start with `x-` are still checked.
- Each tool call can take up to 10 seconds. Starting a server and listing its tools has an 8-second limit.
- HTTP JSON responses and individual server-sent events are capped at 256 KiB while streaming. Redirects stay on the endpoint's origin, or move to its HTTPS version, and must keep the request method.
- A dropped HTTP stream fails that connection. Poppet then reconnects with a new session, on the same backoff schedule as stdio servers.
- Closing an HTTP server ends its session within 5 seconds.
- Tool results fit within the 16 KiB tool-output limit. Long text is shortened and marked as truncated.

Poppet supports tool discovery and calls over stdio and Streamable HTTP. OAuth, the legacy HTTP+SSE transport, resources, prompts, and sampling are not supported. For a server that needs OAuth, run a stdio bridge that handles the sign-in.
