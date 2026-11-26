+++
title = "MCP tools"
description = "Give Poppet tools from other apps and services, and choose exactly which tools it can use."
+++

# MCP tools

MCP is a standard way for apps and services to offer tools to an AI assistant. An MCP server might let Poppet look up records in a database, read your notes, or create calendar events. Poppet can connect to MCP servers that run as programs on your computer, and to remote servers on the internet.

MCP is off until you add a server. You then choose which of its tools Poppet can use. Poppet never uses a tool you have not allowed.

A server that runs on your computer can do anything your user account can. A remote server receives everything Poppet sends it. Only add servers you trust. Allowing only some tools limits what Poppet asks for, but it does not limit what the server itself can do.

## Add a remote server

Add the server, sign in if it needs it, see its tools, and allow the ones you want:

```sh
poppet mcp add notes https://mcp.example.com/mcp --auth oauth
poppet mcp login notes
poppet mcp tools notes
poppet mcp allow notes search
poppet worker restart
```

The first word after `add` is a name you choose for the server, using lowercase letters, digits, and hyphens. `--auth` tells Poppet how to sign in:

| `--auth` | Use when |
| -------- | -------- |
| `oauth` | The server asks you to sign in through your browser. Run `poppet mcp login <name>` next. |
| `api-key` | The server gives you an API key. Poppet asks for it without showing it. |
| `none` | The server needs no sign-in. |

`mcp add` does not allow any tools. `mcp tools` connects to the server and lists its tools, and shows which ones you have allowed. `mcp allow` allows the tools you name. `mcp allow <name> --all` allows every tool the server has now. Tools the server adds later stay blocked until you allow them.

Restart the worker after you add a server or change its tools.

### Sign in with OAuth

`poppet mcp login <name>` opens your browser to sign in. On a computer without a browser, add `--no-browser`, and follow the same steps as [ChatGPT sign-in on a remote machine](providers/openai-chatgpt.md#headless-and-remote-machines).

If your sign-in expires, Poppet stops using that server's tools until you sign in again. Your other servers keep working. Run `poppet mcp login <name>` again. You do not need to restart the worker.

`poppet mcp logout <name>` deletes your saved sign-in. It does not revoke Poppet's access on the service. Do that in the service's own settings.

Some servers need extra OAuth settings, such as a client ID or scopes. See [OAuth settings](#oauth-settings).

## Add a server that runs on your computer

A local MCP server is a program that Poppet starts. Add it to `config.json`:

```json
{
  "mcpServers": [
    {
      "id": "reference",
      "enabled": true,
      "command": "/absolute/path/to/trusted-server",
      "args": ["--stdio"],
      "tools": ["lookup_record"]
    }
  ]
}
```

Replace the command, arguments, and tool names with the values from your server's instructions. Then check it and allow its tools:

```sh
poppet mcp tools reference
poppet mcp allow reference lookup_record
poppet worker restart
```

- `id` is a name you choose, using lowercase letters, digits, and hyphens.
- `command` is the full path to the program. Poppet runs it directly, not through a shell.
- `args` lists the arguments to pass. Use `[]` for none.
- `tools` lists the tools Poppet can use. `mcp allow` and `mcp deny` change this list for you.
- `cwd` is optional. It sets the folder the program runs in, relative to `config.json`.

### Give a server a secret

Never put passwords or API keys in `config.json` or in the command. Instead, add an `environment` entry that tells Poppet where to find the secret:

```json
"environment": {
  "API_TOKEN": { "credential": "reference-token" }
}
```

`{ "credential": "reference-token" }` reads the secret from `auth/reference-token.json` in your data directory. That file must be readable only by you. `{ "env": "NAME" }` passes on a variable from your shell instead, but the background worker cannot see your shell's variables, so use a credential file for it.

Poppet hides these values if the server ever sends them back.

## Check your servers

```sh
poppet mcp servers
poppet mcp tools reference
poppet chat new "Use reference to look up record 123"
```

`mcp servers` shows each server, whether it is connected, which tools you allowed, and any problems. It does not start or contact anything. `mcp tools` connects to one server and lists all its tools.

Poppet connects to a server the first time a chat needs it. By default, connecting and each tool-list request have a 5-second timeout, within an 8-second startup timeout. Change these with [`timeouts.mcpConnectSeconds` and `timeouts.mcpStartupSeconds`](configuration.md#timeouts-and-limits). If the server fails, Poppet keeps working without it and tries again later, waiting longer each time, up to 10 minutes.

Poppet skips a tool it cannot use, for example because its description is too long. `mcp servers` lists any skipped tools and why.

Tools can use standard JSON Schema and OpenAPI formats such as dates, timestamps, URIs, UUIDs, and 32-bit integers. Poppet checks arguments against these formats before calling a tool. An unsupported format still causes Poppet to skip the tool.

If a tool call fails partway through, Poppet does not repeat it, because the action may already have happened. Check the service before you ask again.

## Permissions

Poppet uses an allowed tool only when your current message asks for it.

### After Poppet reads untrusted content

A web page or tool result could contain text written to trick Poppet. Once Poppet reads a web page or an MCP result during an answer, it stops using MCP tools for the rest of that answer. You can then ask again in a new message.

If you trust a server enough to keep using it after that, add `"availableAfterUntrusted": true` to its entry. This helps with servers where Poppet first reads documentation and then acts. Text Poppet has read can then influence its next calls to that server.

### Scheduled tasks

Scheduled tasks cannot use any MCP tool until you allow it for tasks. Only allow tools that read information and cannot change anything:

```sh
poppet mcp allow reference lookup_record --scheduled
```

This adds the tool to the server's `scheduledTools` list. To let tasks use tools that change things, see [schedule a reviewed action](#schedule-a-reviewed-action).

### Remove a permission

```sh
poppet mcp deny reference lookup_record
poppet mcp deny reference lookup_record --scheduled
poppet mcp remove reference
```

`mcp deny` stops Poppet using a tool. With `--scheduled`, it only stops scheduled tasks using it. `mcp remove` deletes the server, along with any key or sign-in Poppet saved for it. To turn off every server at once, set `mcpServers` to `[]`. Restart the worker after any change.

## Review an action

For tools that change things, such as `update_record`, you can ask Poppet to review every call first. Add the tool to the server's `reviewedTools` list in `config.json`, and keep it in `tools`:

```json
{
  "tools": ["lookup_record", "update_record"],
  "scheduledTools": ["lookup_record"],
  "reviewedTools": ["update_record"]
}
```

A tool cannot be in both `reviewedTools` and `scheduledTools`, since `scheduledTools` is only for tools that change nothing. Restart the worker after editing. Before each call to a reviewed tool, Poppet asks your model whether the call matches what you asked for, as it does for [commands](commands.md#how-review-works). The review can allow the call, deny it, or ask you.

When it asks you, Poppet shows the server, the tool, what it expects the call to do, and the exact details it will send. You can only answer in a [messaging gateway](gateways/_index.md) conversation, with **Approve once** or **Deny** where the gateway shows buttons, or with `/approve <id>` or `/deny <id>`. An approval covers one call, and expires after two minutes by default, set with [`timeouts.approvalSeconds`](configuration.md#timeouts-and-limits). In the terminal and web chat, the call does not run. Ask again in a gateway.

The details of the call appear in the thread, so use a private channel if they are private.

Poppet does not use reviewed tools after reading a web page, command output, MCP result, or attachment, even with `availableAfterUntrusted`. Ask for the action in a new message.

`poppet chat show <session-id>` shows each review, its reason, and the result.

## Schedule a reviewed action

To let a scheduled task use a reviewed tool, also add it to `scheduledReviewedTools`:

```json
{
  "tools": ["lookup_record", "update_record"],
  "reviewedTools": ["update_record"],
  "scheduledReviewedTools": ["update_record"]
}
```

Poppet reviews each call against the task's prompt. Only an allowed call runs. If the review denies the call or needs your approval, the run fails, because nobody is there to approve it. Actions that already finished are not undone, and the task's schedule continues. `poppet tasks show <task-id>` shows each review and its result.

## Server settings

This is the full list of settings for a server in `mcpServers`.

| Setting | Required | What it does |
| ------- | -------- | ------------ |
| `id` | Yes | A name you choose, up to 64 lowercase letters, digits, and hyphens, starting with a letter |
| `enabled` | Yes | `false` turns the server off without removing it |
| `command` | Local servers | The full path of the program to run |
| `args` | Local servers | Arguments for the program |
| `cwd` | No | The folder the program runs in |
| `environment` | No | Secrets and variables to pass to the program |
| `url` | Remote servers | The server's address. It must use `https`, unless the server is on this computer. |
| `headers` | No | Extra headers to send to a remote server, such as an API key |
| `oauth` | No | Browser sign-in settings for a remote server |
| `tools` | Yes | Tools Poppet can use |
| `scheduledTools` | No | Read-only tools that scheduled tasks can use |
| `reviewedTools` | No | Tools that Poppet reviews before each call |
| `scheduledReviewedTools` | No | Reviewed tools that scheduled tasks can use |
| `availableAfterUntrusted` | No | Keep using this server after reading untrusted content |

A server has either `command` or `url`, not both.

### API key headers

`--auth api-key` sends your key as `Authorization: Bearer <key>`. If your server expects the key in a different header, set it in `headers` instead:

```json
"headers": {
  "X-API-Key": { "credential": "mcp-notes" }
}
```

`mcp add` saves the key as the credential `mcp-<id>`. Add `"prefix": "Bearer "` to put text before the key.

### OAuth settings

Most servers need only `"oauth": {}`, which `mcp add --auth oauth` saves for you. If the service gives you a client ID, add it with any scopes you need:

```json
"oauth": {
  "clientId": "your-client-id",
  "clientSecret": { "credential": "notes-client-secret" },
  "scopes": ["read", "write"],
  "callbackPort": 1455
}
```

When you register Poppet with the service, use `http://127.0.0.1:1455/auth/callback` as the redirect address, with the same port as `callbackPort`. If a tool says it needs more access, add the scope it names to `scopes`, and run `poppet mcp login <name>` again. Changing a server's `url` also means signing in again.

## Limits

- Up to 8 servers. Each server defaults to at most 128 discovered tools and 256 KiB of tool-list JSON, set with `limits.mcpTools` and `limits.mcpDiscoveryBytes`.
- Each tool call can take up to 10 seconds by default, set with `timeouts.mcpToolCallSeconds`.
- Each tool result can be up to 16 KiB by default, set with `limits.toolBytes`. Longer results are cut short.
- A server message can be up to 4 MiB. Larger messages close the connection. This does not increase the tool result limit above.

Poppet uses MCP tools only. It does not support MCP resources, prompts, or servers that use the older HTTP with SSE connection.
