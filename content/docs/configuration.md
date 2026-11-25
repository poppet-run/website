+++
title = "Configuration"
description = "Change Poppet's settings in config.json, choose where it keeps data, and manage API keys."
+++

# Configuration

Poppet reads its settings from `config.json` in your data directory. [Getting started](getting-started.md) covers the provider and model settings you need first. This page covers the rest.

## Edit config.json

The file is `~/.config/poppet/config.json` unless you [use a different data directory](#data-directory). Every setting is optional, and without the file Poppet uses its defaults. For example:

```json
{
  "provider": "openrouter",
  "model": "replace-with-model-id",
  "tasks": { "catchUpMinutes": 60 },
  "chat": { "outputTokens": 2048, "runDeadlineSeconds": 300 }
}
```

After you edit the file, check it and restart the worker:

```sh
poppet config
poppet worker restart
```

`poppet config` shows the settings Poppet will use, and where it found the file. If something is wrong, it names the setting. Common mistakes are a missing comma or quote, a misspelled setting name, a number in quotes, or an empty value. Write paths in full, because Poppet does not expand `~`.

New chats and tasks use the new settings. Existing chats and tasks keep the provider and model they started with.

Keep passwords, API keys, and tokens out of `config.json`. Poppet saves those in separate protected files.

## Settings

| Setting | Default | What it does |
| ------- | ------- | ------------ |
| `provider` | `openai-chatgpt` | Provider for new chats and tasks: `openai-chatgpt`, `openrouter`, or `opencode-go` |
| `model` | None | Model ID for new chats and tasks, from `poppet provider models` |
| `chat.outputTokens` | `2048` | Longest answer to ask the model for, in tokens, from 1 to 32768 |
| `chat.runDeadlineSeconds` | `300` | Time limit for one answer, from 30 to 3600 seconds |
| `chat.maxConcurrentRequests` | `3` | How many answers Poppet works on at once, from 1 to 8 |
| `chat.logReasoning` | `false` | Show the model's reasoning, and write it to the worker log. See [reasoning and timing logs](#reasoning-and-timing-logs). |
| `chat.logTimings` | `false` | Write how long each step of an answer took to the worker log |
| `tasks.catchUpMinutes` | `60` | How late a missed repeating task can still run, from 0 to 1440 minutes |
| `tasks.quietHours` | None | Hours when scheduled posts wait. See [quiet hours](#quiet-hours). |
| `webSearchProvider` | None | `brave` or `kagi`. See [web search](web.md#turn-on-web-search). |
| `mcpServers` | `[]` | MCP servers and their tools. See [MCP tools](mcp.md). |
| `discord` | None | Your Discord IDs. See [Discord](gateways/discord.md). |
| `slack` | None | Your Slack IDs. See [Slack](gateways/slack.md). |
| `applicationName` | `Poppet` | The name ChatGPT shows for Poppet when you first sign in |
| `gatewayPackages` | `[]` | Extra messaging integrations to load |

Install packages listed in `gatewayPackages` into `gateways/node_modules` in your data directory.

Some limits are fixed and cannot be changed, such as how much conversation history Poppet sends. See [chat limits](chat.md#limits).

Web chat has its own settings file. See [web chat](web-chat.md).

## Quiet hours

Quiet hours hold scheduled posts to [messaging gateways](gateways/_index.md), so they do not arrive overnight:

```json
{
  "tasks": {
    "quietHours": { "start": "22:00", "end": "07:30", "timeZone": "Europe/London" }
  }
}
```

Use 24-hour times and a time zone name such as `Europe/London`. The hours can run past midnight.

Tasks still run on time. Results and [failure notices](tasks.md#failure-notices) that are ready during quiet hours wait until they end. Replies to your own messages and approval requests are never held.

Restart the worker after you change quiet hours. The new hours also apply to posts that are already waiting. `poppet tasks show <task-id>` shows when a waiting result will be posted.

## Data directory

Poppet keeps everything in `~/.config/poppet` by default. To use another folder, set `POPPET_DATA_DIR`:

{{< shell >}}
```bash
export POPPET_DATA_DIR="$HOME/.local/share/poppet"
poppet config
```

```fish
set -gx POPPET_DATA_DIR "$HOME/.local/share/poppet"
poppet config
```
{{< /shell >}}

Each data directory has its own settings, sign-ins, and conversations. Set the same value for every command, including when you install the worker. See [storage](storage.md) for what the folder contains.

## API keys

`poppet provider login` saves your OpenRouter or OpenCode Go key in a protected file. It needs an interactive terminal, and shows `*` in place of each character you type or paste.

To use a key without saving it, set one of these environment variables. It takes the place of the saved key.

| Variable | Provider |
| -------- | -------- |
| `POPPET_OPENROUTER_API_KEY` | OpenRouter |
| `POPPET_OPENCODE_GO_API_KEY` | OpenCode Go |

If the variable is set but empty or wrong, Poppet reports an error rather than using the saved key. The background worker cannot see variables from your shell, so save the key with `provider login` for scheduled tasks and messaging.

`poppet provider logout` deletes the saved key. It does not cancel the key with the provider. Do that on the provider's website.

Web search keys are separate. They come only from `poppet web login`, never from environment variables. See [web search](web.md#turn-on-web-search).

## Reasoning and timing logs

Some models think through a problem before they answer. Poppet saves this reasoning with each answer when the provider shares it.

With `chat.logReasoning` set to `true`, terminal chats show the reasoning as Poppet works. `chat new` and the interactive prompt show it under a Thinking heading. When `chat send` goes through the worker, Poppet also writes the reasoning to the worker log. For scheduled tasks and messaging, Poppet writes the reasoning to the worker log.

With `chat.logTimings` set to `true`, Poppet writes how long each step took to the worker log.

Poppet logs up to 128 KiB of reasoning per answer. While `chat.logReasoning` is on, an answer with more reasoning than that fails.

Both are off by default. Reasoning can include private details from your messages and tools, so keep the log private. Neither setting changes how hard the model thinks. Restart the worker after you change them.
