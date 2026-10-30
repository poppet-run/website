+++
title = "MCP tools"
description = "Connect trusted local and remote tool servers, and allow only the tools you choose for chat and scheduled tasks."
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

Replace the command, arguments, and tool names with your server's values. `args` and `tools` are required. `cwd`, `environment`, `scheduledTools`, and `availableAfterUntrusted` are optional.

- `id` is lowercase, starts with a letter, uses letters, digits, and hyphens, and is at most 64 characters.
- The command runs directly, with no shell. Use an absolute path, especially for the background worker.
- A relative `cwd` resolves beside `config.json`. Without it, the server uses Poppet's working directory.
- Never put secret values in the command, its arguments, or `config.json`.

The server gets a small standard environment, plus only the values you name. `{ "env": "NAME" }` passes one environment variable. `{ "credential": "name" }` reads a protected key from `<data directory>/auth/name.json`. The file must be `0600`, with a `0700` directory. Environment values are not added to the model's instructions, and matching values in the server's output are redacted. Background workers do not see your shell environment, so use a credential reference for them.

### HTTP servers

Add a remote server from the CLI:

```sh
poppet mcp add remote https://mcp.example.com/mcp --auth api-key
poppet mcp tools remote
poppet mcp allow remote lookup_record
```

`add` saves an enabled server with no tools allowed and does not connect to it.
`--auth` is required: `none` sends no credentials, `api-key` reads a key
from a hidden prompt or `--api-key <key>`, saves it as the protected credential
`mcp-<id>`, and sends it as `Authorization: Bearer <key>`. `oauth` configures
OAuth for a separate `mcp login` step.

`mcp tools <id>` discovers tools and shows their `allowed` and `scheduled`
permissions. `mcp allow <id> <tools...>` adds discovered names to the interactive
allowlist. `mcp allow <id> --all` saves all names discovered now; tools the
server adds later remain blocked. It cannot be combined with explicit names
or `--scheduled`. Use `mcp allow <id> <tools...> --scheduled` for explicitly
reviewed read-only tools; this grants both interactive and scheduled access.
Unknown tools and failed discovery leave permissions unchanged.

`mcp deny <id> <tools...>` removes both permissions without connecting to the
server. Add `--scheduled` to remove only scheduled access. These commands work
with both HTTP and configured stdio servers. Restart the worker after adding,
removing, or changing permissions. Until then inspection through that worker
reflects its existing configuration.

Custom API-key header names and prefixes belong in `headers` in `config.json`.
For example, use `"X-API-Key": { "credential": "mcp-remote" }` instead of the
Authorization entry for an unprefixed key. `poppet mcp remove <id>` deletes
the entry, its `mcp-<id>` credential, and any saved sign-in.

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

An entry has either `command` or `url`, never both, and HTTP entries take no
`args`, `cwd`, or `environment`. URLs must use `https:`; plain `http:` is
accepted only for `localhost`, `127.0.0.1`, and `[::1]`. URLs cannot contain a
username, password, or fragment. Put secrets in `headers`, not the path or
query, which server logs may record.

Each header names an `{ "env": "NAME" }` or `{ "credential": "name" }` reference,
as for stdio environments, with an optional non-secret `prefix` such as
`"Bearer "`. Values must be non-empty visible ASCII. Header names are unique
regardless of case. `Accept`, `Content-Type`, `Content-Length`, `Host`,
`Last-Event-ID`, `Mcp-Session-Id`, and `Mcp-Protocol-Version` belong to the
transport and cannot be configured. A missing reference makes that server
unavailable. Resolved header values are redacted from results and rejected in
tool definitions, like selected environment values.

### OAuth sign-in

```sh
poppet mcp add notes https://mcp.example.com/mcp --auth oauth
poppet mcp login notes
poppet mcp tools notes
poppet mcp allow notes search
```

`add` saves `"oauth": {}` in the entry. `login` starts sign-in and discovers the
server's authorization server from its protected resource metadata, registers
itself as a public client when the authorization server offers dynamic
registration, and opens the browser with PKCE and a resource indicator. The
callback, `--no-browser`, pasted callback addresses, and SSH forwarding work as
for [ChatGPT sign-in](providers/openai-chatgpt.md). `login --no-browser` prints
the sign-in link. Run `poppet mcp login <id>` to sign in again and
`poppet mcp logout <id>` to delete tokens while keeping the registration;
logging out does not revoke the grant at the authorization server.

`oauth` accepts optional `clientId`, `clientSecret` (a `{ "credential": "name" }`
reference, never a literal), `scopes`, and `callbackPort` (1024–65535) in
`config.json`. `mcp login <id> --callback-port <port>` overrides the port for
that sign-in without changing configuration. Use a pre-registered
client when the authorization server has no dynamic registration; register a
fixed loopback redirect such as `http://127.0.0.1:1455/auth/callback` and set
the same `callbackPort`. Without `scopes`, Poppet requests what the server's
metadata advertises. An OAuth entry cannot also configure an `Authorization`
header; other headers are sent only to the MCP endpoint. Client metadata
documents and unattended grants are unsupported.

Tokens live in `<data directory>/auth/mcp-oauth-<id>.json`, protected like API
keys and bound to the configured URL: changing the URL requires a new sign-in.
Discovery, registration, and token requests use HTTPS (plain HTTP only to
loopback) and the same size cap as MCP messages. Access tokens are redacted
from results and rejected in tool definitions.

A run never opens a browser. When the server rejects an access token, Poppet
refreshes it under the record's lock; a worker and a CLI process never both
spend one refresh token, and the second adopts the first's result. A rejected
or missing refresh token, a missing sign-in, or a changed URL puts the server in
`needs-login`: its tools are unavailable, other servers keep working, and no
backoff applies. The next request after `mcp login` reconnects, including in a
running worker. A server asking for more scope fails that call with a
diagnostic naming the scope; add it to `scopes` and sign in again.
`mcp servers` reports `signIn` with `signedIn`, `expiresAt`, and granted
`scopes`, never token values. Active connections check saved sign-in before
sending requests, so logout blocks further calls without restarting the worker.
Calls already sent before logout may still complete.

Set `mcpServers` to `[]` in `config.json` to disable every server. Worker settings
change after restart, including allowlist changes.


## Check and use tools

```sh
poppet mcp servers
poppet mcp tools reference
poppet chat new "Use reference to look up record 123"
```

`servers` shows each server's permissions, transport, connection state, and diagnostics without starting anything. For HTTP servers it shows the endpoint's origin, not its full URL. `tools <server>` starts the server to list all discovered tools and their interactive and scheduled permissions. These commands use the running worker when there is one.

A server connects the first time a chat needs it. If it fails, the built-in tools keep working. Poppet tries to reconnect after 30 seconds, doubling the wait up to 10 minutes. `mcp servers` shows when the next try is due.

Poppet does not retry tool calls. If a call fails after it was sent, Poppet records it as uncertain and does not repeat it. Check the server's state before asking for the action again.

## Permissions

Only tools in `tools` are offered to the model. In chat, a tool call still needs your explicit request in the current message.

`scheduledTools` is empty by default. Add a tool there only after you have checked that it is read-only. Scheduled runs can use only tools listed in both `tools` and `scheduledTools`. Server annotations do not grant access.

Poppet treats results from MCP servers as data. They cannot authorize memory changes, task changes, or page reads.

By default, MCP tools are withdrawn for the rest of a run once a fetched page, search result, or MCP result enters it. This limits the run to one round of MCP calls.

Set `"availableAfterUntrusted": true` on a server only if you trust it to keep receiving calls after that content. This can support workflows that read the server's documentation before making another call. Text from a page, email, or earlier result can then influence later calls to that server, within its tool allowlist. The setting works for both stdio and HTTP servers. It does not restore memory or task mutation tools, grant access to returned URLs, or change scheduled-tool restrictions.

## Limits

- Up to 8 servers. Each server can expose up to 128 tools.
- Tool descriptions are up to 4096 characters. Input and output schemas are up to 16 KiB.
- Poppet ignores vendor schema keywords that start with `x-`, such as FastMCP's `x-fastmcp-wrap-result`, when it checks a schema. Property names that start with `x-` are still checked.
- Each tool call can take up to 10 seconds. Starting a server and listing its tools has an 8-second limit.
- HTTP JSON responses and individual server-sent events are capped at 256 KiB while streaming. Redirects stay on the endpoint's origin, or move to its HTTPS version, and must keep the request method.
- A dropped HTTP stream fails that connection. Poppet then reconnects with a new session, on the same backoff schedule as stdio servers.
- Closing an HTTP server ends its session within 5 seconds.
- Tool results fit within the 16 KiB tool-output limit. Long text is shortened and marked as truncated.

Poppet supports tool discovery and calls over stdio and Streamable HTTP. The legacy HTTP+SSE transport, resources, prompts, sampling, elicitation, and media forwarding are not supported.
