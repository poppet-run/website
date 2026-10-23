+++
title = "Troubleshooting"
description = "Check setup, provider access, background workers, messaging connections, and optional tools."
+++

# Troubleshooting

Run these commands from your Poppet checkout. Keep the full error message when reporting a problem.

## Poppet will not start

```fish
bun --version
bun run start --help
bun run start config
```

Use Bun 1.4.3 and install dependencies with `bun install --frozen-lockfile`. A configuration error can come from malformed JSON, an unknown key, an invalid value, or an invalid environment override. Fix the reported field before trying chat again. See [configuration](configuration.md).

## Settings differ from config.json

Check the output of `bun run start config`, especially `configFile.path`, `configFile.exists`, and `environmentOverrides`. Use JSON numbers and booleans rather than quoted strings. Literal `~` is not expanded in configured paths.

Environment values override saved settings. A running worker keeps the configuration it loaded at startup. For an installed macOS worker:

```fish
bun run start worker stop
bun run start worker start
```

For a foreground worker, use Ctrl-C in its terminal and run it again. Existing sessions and tasks keep their saved provider and model. Start a new session to try a changed selection.

## Sign-in works but chat fails

Replace the provider below if you use OpenRouter or OpenCode Go:

```fish
bun run start auth status openai-chatgpt
bun run start auth models openai-chatgpt
```

Check that the saved model exists in that provider's catalog. ChatGPT also needs plan-usage consent. OpenCode Go requires `--coding` for new chats. Follow the matching [provider guide](/docs/providers/) for credential and quota errors.

To test the selected provider and model:

```fish
bun run start provider verify
```

This sends two model requests and tests a local tool call. It uses your provider account's quota.

## A task has not run

Keep a [worker](worker.md) running and check task status in a second terminal:

```fish
bun run start tasks status
bun run start tasks list
```

Use `bun run start tasks show` with the task ID to inspect its next time, occurrences, pauses, failures, and results. Check the schedule's timezone and the saved provider selection. Installed workers read saved credentials and `config.json`, not your current shell overrides.

On macOS, inspect login startup and logs:

```fish
bun run start worker status
bun run start worker logs
```

Do not start a second worker for the same data directory. A sleeping or stopped computer cannot execute work on time. See [missed work and retries](tasks.md#missed-work-pauses-and-retries) before retrying.

## Messaging does not reply

```fish
bun run start gateway status
```

Check the connection state, configured owner ID, and allowed chat or channel. Restart the worker after changing messaging settings. For Telegram, another polling client or an existing webhook can prevent reception. For Discord, check bot permissions and the Message Content intent.

Follow the [service guide](/docs/gateways/) for setup and supported message types. If delivery is uncertain, inspect the saved answer before reposting it; the service may already have received it.

## Search, browser, or MCP tools are missing

If an optional tool is missing, check its setup:

- [Search](/docs/web/): run `bun run start web status`. It needs both an API key and `webSearch` enabled.
- [Browser](browser.md): check the pinned executables, `browser.enabled`, and allowed domains. Browser tools are unavailable to scheduled work.
- [MCP](mcp.md): run `bun run start mcp status`. A server must be enabled and its tools allowed. Run `mcp tools` with the server ID to start discovery; status alone never starts it.

Restart the worker after changing configuration or to reconnect a failed MCP server. Do not broaden access just to suppress an error. Check the specific diagnostic first.

## A run failed after using a tool

Use `bun run start chat show` with the session ID to inspect the saved error and tool calls. An uncertain call may have changed a file or external service before Poppet saved the result. Check the file or service before requesting another attempt. Poppet does not automatically replay uncertain actions.

See [storage](storage.md) for database access and recovery details. Keep your data directory while investigating. Deleting it removes saved data.
