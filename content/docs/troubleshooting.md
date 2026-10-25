+++
title = "Troubleshooting"
description = "Check setup, provider access, background workers, Discord, and optional tools."
+++

# Troubleshooting

Run these commands from any directory. Keep the full error message when you report a problem.

## Poppet will not start

```sh
bun --version
poppet --help
poppet config
```

Use Bun 1.4.3 and install dependencies with `bun install --frozen-lockfile`. A configuration error usually means malformed JSON, an unknown key, a wrong type, or an empty value. Fix the field named in the error, then try again. See [configuration](configuration.md).

## Settings are not what you expect

Check `poppet config`. It shows the config file location and whether it exists.

A running worker keeps the settings it read when it started. After you change `config.json`, restart it. For a worker that runs at login:

```sh
poppet worker stop
poppet worker start
```

For a foreground worker, press Ctrl-C in its terminal and start it again.

Existing sessions and tasks keep the provider and model they were saved with. Start a new chat to use a different one.

## Chat fails

Check the connection and model for your provider. Replace the provider name if you use OpenRouter or OpenCode Go:

```sh
poppet provider status openai-chatgpt
poppet provider models openai-chatgpt
```

Check that the model in `config.json` appears in the list. ChatGPT also needs plan-usage consent. OpenCode Go accepts only coding chats, so start one with `--coding`. For credential and quota errors, see the [provider guides](/docs/providers/).

## A task did not run

Keep a [worker](worker.md) running, then check the task in a second terminal:

```sh
poppet tasks list
poppet tasks show <task-id>
```

`tasks show` lists the next time, past runs, pauses, failures, and results. Check the timezone you saved, and check whether the provider is paused:

```sh
poppet worker providers
```

On macOS, check the login worker and its log:

```sh
poppet worker status
poppet worker logs
```

Only one worker can run for a data directory. A computer that is asleep or shut down cannot run tasks. Read [missed runs and retries](tasks.md#missed-runs-pauses-and-retries) before you retry a task.

## Discord does not reply

```sh
poppet gateway status
```

Check the connection state, your owner ID, and the server ID in `config.json`. Poppet replies only to the owner, and only in the configured server. Make sure the bot has the permissions and the Message Content intent listed in the [Discord guide](gateways/discord.md). Restart the worker after changing Discord settings.

If a reply's delivery is uncertain, check the saved answer with `poppet chat show <session-id>` before you post it again. Discord may already have received it.

## Search, browser, or MCP tools are missing

- [Web search](web.md): run `poppet web status`. Search needs both `webSearch` set to `true` and a saved key.
- [Browser](browser.md): check `browser.enabled`, the allowed domains, and the pinned executables. Scheduled tasks never get browser tools.
- [MCP tools](mcp.md): run `poppet mcp status`. A server must be enabled, and each tool must be listed. `poppet mcp tools <server-id>` starts a server to discover its tools. `status` does not.

Restart the worker after changing configuration, or to reconnect a failed MCP server.

## A run failed after a tool ran

Inspect the session with `poppet chat show <session-id>`. It shows the error and each tool call. A tool call that may have changed something is marked uncertain. Check the file or service it affected before asking Poppet to try again. Poppet never replays an uncertain action on its own.

## Where your data is

Keep your data directory while you investigate. Deleting it removes your saved conversations, facts, tasks, and credentials. See [storage](storage.md).
