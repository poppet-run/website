+++
title = "Configuration"
description = "Save settings in config.json, set the data directory, and manage API keys and optional tools."
+++

# Configuration

Poppet reads ordinary settings from `config.json`. [Getting started](getting-started.md) shows the provider and model fields you need for your first chat. This page covers the remaining settings.

## Configuration file

Save settings in `<data directory>/config.json`, which defaults to `~/.config/poppet/config.json`. The file and every field in it are optional:

```json
{
  "provider": "openrouter",
  "model": "replace-with-model-id",
  "tasks": { "catchUpMinutes": 60 },
  "chat": { "outputTokens": 2048, "runDeadlineSeconds": 300 }
}
```

`POPPET_DATA_DIR` is the only environment variable that changes where Poppet looks for its files. Set it before running any command to use another data directory. Credentials and channel tokens stay in protected files beside the data, not in `config.json`.

A missing file means Poppet uses its defaults, and it creates nothing. The file must be valid JSON, at most 64 KiB, owned by your user, and not writable by other users. Poppet rejects symlinks and hard links. Unknown keys, wrong types, and empty text values are errors. Poppet does not expand `~` in paths, so write paths in full.

Restart a running worker after you edit the file. New chats and tasks use the new defaults. Existing sessions and tasks keep the provider and model they were saved with.

Check the result with:

```sh
poppet config
```

It prints the validated settings and the config file's location. It does not open storage or contact a provider.

## Settings

| Field                     | Default                | Purpose                                                                           |
| ------------------------- | ---------------------- | --------------------------------------------------------------------------------- |
| `provider`                | `openai-chatgpt`       | Provider for new chats and tasks: `openai-chatgpt`, `openrouter`, or `opencode-go` |
| `model`                   | Unset                  | Model ID for new chats and tasks                                                  |
| `applicationName`         | `Poppet`               | Name used during ChatGPT's initial registration                                   |
| `discord`                 | Unset                  | Owner ID, server ID, and home channel ID; see [Discord](gateways/discord.md)      |
| `webSearch`               | `false`                | Enable web search when the selected search provider has a key                     |
| `webSearchProvider`       | `brave`                | `brave` or `kagi`                                                                 |
| `browser`                 | `{ "enabled": false }` | [Browser access and allowed hosts](browser.md)                                    |
| `mcpServers`              | `[]`                   | [Local tool servers and their permissions](mcp.md)                                |
| `gatewayPackages`         | `[]`                   | External messaging adapters to load                                               |
| `tasks.catchUpMinutes`    | `60`                   | How late a recurring task can start after a missed time, from 0 to 1440          |
| `chat.outputTokens`       | `2048`                 | Requested output limit, from 1 to 32768, capped by the model's own limit          |
| `chat.runDeadlineSeconds` | `300`                  | Overall time limit for one run, from 30 to 3600 seconds                           |
| `chat.logReasoning`       | `false`                | Log readable model reasoning to CLI stderr and the worker log                     |
| `chat.logTimings`         | `false`                | Log the duration of each request stage                                            |

Context size, conversation history, model turns, tool calls, and tool output use fixed limits. They are not settings. See [chat limits](chat.md#context-and-limits).

## Discord

`poppet gateway discord setup` saves the ordinary Discord settings in `config.json` and the bot token in a protected file:

```json
{
  "discord": {
    "ownerId": "200",
    "guildId": "300",
    "homeChannelId": "400"
  }
}
```

Use your own IDs. Removing the `discord` section turns Discord off and keeps the saved token. See [Discord](gateways/discord.md) for setup and permissions.

## API keys

Login saves each API key in `<data directory>/auth/<provider>.json`. The file is `0600`, inside a `0700` directory. Login uses the key from the environment if one is set. Otherwise it prompts without echoing. Scripts can pipe a key with `--key-stdin`. Keys are never accepted as command-line arguments.

These variables override the saved key for the matching service. An empty or invalid value is an error, and Poppet does not fall back to the saved key:

| Variable                        | Used for           |
| ------------------------------- | ------------------ |
| `POPPET_OPENROUTER_API_KEY`     | OpenRouter         |
| `POPPET_OPENCODE_GO_API_KEY`    | OpenCode Go        |
| `POPPET_BRAVE_SEARCH_API_KEY`   | Brave web search   |
| `POPPET_KAGI_SEARCH_API_KEY`    | Kagi web search    |

`provider logout` removes the saved key. It does not revoke the key with the provider, and it does not unset an environment variable. See [OpenRouter](providers/openrouter.md) and [OpenCode Go](providers/opencode-go.md) for login examples.

## Web search

Choose a search provider, turn search on, then save that provider's key:

```json
{
  "webSearch": true,
  "webSearchProvider": "kagi"
}
```

```sh
poppet web login
poppet web status
```

Brave is the default. Kagi uses its v1 API with a bearer key. Each provider's key is stored separately, so switching providers keeps both keys. `web status` shows whether search is enabled and configured, without making a remote request. Restart a running worker after changing search settings or keys. See [web search](web.md).

## Reasoning and timing logs

`chat.logReasoning` writes readable model reasoning to `<data directory>/logs/worker.log` and to CLI stderr. `chat.logTimings` writes the duration of each stage in milliseconds. Both are off by default and apply to chat, scheduled, and messaging runs. Logs can contain private prompt or tool content, so keep them local. These settings never change answers.

Set either one in `config.json` and restart the worker so it reads the change.

## Skill files

Skills live in `<data directory>/skills/<name>/SKILL.md`. There is no path setting. See [skills](skills.md).

## Data directory

To keep data somewhere other than `~/.config/poppet`, set `POPPET_DATA_DIR`:

{{< shell >}}
```bash
export POPPET_DATA_DIR="$HOME/.local/share/poppet"
poppet config
```

```fish
set -lx POPPET_DATA_DIR "$HOME/.local/share/poppet"
poppet config
```
{{< /shell >}}

Use the same value for every command, including the worker's LaunchAgent. Each data directory has its own configuration, credentials, and database.
