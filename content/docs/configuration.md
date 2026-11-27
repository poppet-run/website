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
| `provider` | `openai-chatgpt` | Provider for new chats and tasks: `openai-chatgpt`, `gemini`, `openrouter`, `opencode`, or `opencode-go` |
| `timeZone` | None | Your time zone for scheduled tasks and quiet hours. See [time zone](#time-zone). |
| `model` | None | Model ID for new chats and tasks, from `poppet provider models` |
| `chat.outputTokens` | `2048` | Longest answer to ask the model for, in tokens, from 1 to 32768 |
| `chat.runDeadlineSeconds` | `300` | Time limit for one answer, from 30 to 3600 seconds |
| `chat.maxConcurrentRequests` | `3` | How many answers Poppet works on at once, from 1 to 8 |
| `chat.logReasoning` | `false` | Show the model's reasoning, and write it to the worker log. See [reasoning and timing logs](#reasoning-and-timing-logs). |
| `chat.logTimings` | `false` | Write how long each step of an answer took to the worker log |
| `tasks.catchUpMinutes` | `60` | How late a missed repeating task can still run, from 0 to 1440 minutes |
| `tasks.approvals` | `fail` | `fail` or `wait`. Default for tasks without an override. See [wait for approval](tasks.md#wait-for-approval). |
| `tasks.quietHours` | None | Hours when scheduled posts wait. See [quiet hours](#quiet-hours). |
| `mcpServers` | `[]` | MCP servers and their tools. See [MCP tools](mcp.md). |
| `discord` | None | Your Discord IDs. See [Discord](gateways/discord.md). |
| `slack` | None | Your Slack IDs. See [Slack](gateways/slack.md). |
| `applicationName` | `Poppet` | The name ChatGPT shows for Poppet when you first sign in |
| `homeGateway` | None | Preferred gateway for approval prompts from tasks without a destination. See [home gateway](#home-gateway). |
| `gatewayPackages` | `[]` | Extra messaging integrations to load |

Telegram has no setting in `config.json`. Setup saves its IDs with its token. See [Telegram](gateways/telegram.md).

Install packages listed in `gatewayPackages` into `gateways/node_modules` in your data directory. A package made for an older version of Poppet may need an update before it loads.

You can change timeouts, conversation history, and size limits. See [timeouts and limits](#timeouts-and-limits).

Web chat has its own settings file. See [web chat](web-chat.md).

## Home gateway

When a task has no messaging destination and [waits for approval](tasks.md#wait-for-approval), Poppet needs a home conversation for its approval prompt. Set `homeGateway` to prefer one of your configured gateways:

```json
{
  "homeGateway": "telegram"
}
```

The worker tries that gateway's home conversation first. If it is unset, unknown, disabled, or cannot provide a destination, Poppet tries the other enabled gateways in order: Discord, Slack, Telegram, then external integrations. Without a usable home conversation or task destination, a call that needs approval fails the run.

This setting only chooses where approval prompts go for tasks without a destination. Results still go to the task's saved destination. Tasks without `--to` keep results on your computer. Run `poppet config` to inspect the setting, and restart the worker after changing it.

## Timeouts and limits

Set `timeouts` and `limits` in `config.json` when a request needs more time or space. Omit a setting to keep its default. Each value must be a whole number within the listed range. Timeouts are in seconds. Enter byte sizes as numbers, such as `32768` for 32 KiB. One KiB is 1024 bytes, and one MiB is 1048576 bytes.

Run `poppet config` to check the file and see every resolved value. Restart the worker after changing settings. Larger limits can send more data to your model provider and use more memory.

```json
{
  "timeouts": { "inferenceSeconds": 180, "pageFetchSeconds": 30 },
  "limits": { "toolBytes": 32768, "historyTurns": 40 }
}
```

| Field | Default | Range | Purpose |
| ------------------------------------ | ------- | ------- | -------------------------------------------------------------------------------------- |
| `timeouts.inferenceSeconds` | 60 | 5 to 3600 | Time allowed for one model request |
| `timeouts.providerRequestSeconds` | 45 | 5 to 3600 | HTTP timeout for provider requests |
| `timeouts.modelCatalogSeconds` | 30 | 1 to 300 | Gemini, OpenCode, and OpenRouter model-list request |
| `timeouts.modelCatalogCacheSeconds` | 60 | 0 to 86400 | How long a fetched model list is reused; 0 refetches every time |
| `timeouts.actionReviewSeconds` | 30 | 1 to 600 | Automatic review of a Bash command or MCP action |
| `timeouts.sessionTitleSeconds` | 10 | 1 to 300 | Generating a chat session title |
| `timeouts.conversationNamingSeconds` | 10 | 1 to 300 | Renaming a Discord or Slack conversation |
| `timeouts.pageFetchSeconds` | 15 | 1 to 300 | Reading a public page, including redirects |
| `timeouts.mcpConnectSeconds` | 5 | 1 to 300 | Connecting to an MCP server and each tool-list request |
| `timeouts.mcpStartupSeconds` | 8 | 1 to 600 | Starting an MCP server, including discovery |
| `timeouts.mcpToolCallSeconds` | 10 | 1 to 3600 | One MCP tool call |
| `timeouts.taskOperationSeconds` | 8 | 1 to 300 | Creating or changing a task through the worker, and checking its messaging destination |
| `timeouts.approvalSeconds` | 3600 | 10 to 86400 | How long an approval request stays open |
| `timeouts.attachmentDownloadSeconds` | 30 | 1 to 600 | Downloading one messaging attachment |
| `timeouts.gatewayRequestSeconds` | 10 | 1 to 300 | Discord, Slack, and Telegram API requests |
| `timeouts.gatewayRetrySeconds` | 30 | 1 to 3600 | Wait before a messaging adapter reconnects after a failure |
| `timeouts.gatewayRestartMaxSeconds` | 300 | 1 to 3600 | Longest wait between messaging adapter restarts |
| `timeouts.telegramPollSeconds` | 30 | 1 to 50 | Telegram long-poll duration |

| Field | Default | Range | Purpose |
| -------------------------------- | ------- | -------------- | ---------------------------------------------------------------- |
| `limits.contextBytes` | 256 KiB | 16 KiB to 16 MiB | Context budget per model request |
| `limits.historyTurns` | 20 | 1 to 200 | Recent exchanges kept in context |
| `limits.modelTurns` | 16 | 1 to 128 | Model turns per run |
| `limits.toolCalls` | 16 | 1 to 256 | Tool calls per run |
| `limits.toolBytes` | 16 KiB | 1 KiB to 64 KiB | Size of one tool result |
| `limits.soulBytes` | 8 KiB | 1 byte to 64 KiB | `soul.md` size |
| `limits.profileBytes` | 8 KiB | 1 byte to 64 KiB | `profile.md` size |
| `limits.skillIndexBytes` | 8 KiB | 0 bytes to 64 KiB | Skill index size; 0 turns the index and skill tools off |
| `limits.skillIndexEntries` | 64 | 1 to 512 | Skills considered for the index |
| `limits.skillDescriptionBytes` | 240 | 16 bytes to 4 KiB | Size of one skill description in the index |
| `limits.skillMentions` | 4 | 0 to 32 | `$skill` mentions in one message |
| `limits.attachmentsPerMessage` | 4 | 0 to 10 | Files attached to one message |
| `limits.imageBytes` | 5 MiB | 1 KiB to 20 MiB | Size of one image attachment |
| `limits.textFileBytes` | 64 KiB | 1 KiB to 1 MiB | Size of one text attachment |
| `limits.imagesPerRequest` | 8 | 0 to 64 | Images sent in one model request |
| `limits.imageContextBytes` | 6 KiB | 1 KiB to 64 KiB | Context budget counted for each image |
| `limits.replyTextBytes` | 128 KiB | 4 KiB to 4 MiB | Answer text, and logged reasoning, per run |
| `limits.completionBytes` | 1 MiB | 16 KiB to 16 MiB | Size of the saved provider response, including data needed to continue the chat |
| `limits.pageBytes` | 1 MiB | 64 KiB to 16 MiB | Transferred and decoded page body |
| `limits.mcpTools` | 128 | 1 to 1024 | Tools discovered from one MCP server |
| `limits.mcpDiscoveryBytes` | 256 KiB | 16 KiB to 4 MiB | Tool-list JSON from one MCP server |
| `limits.tasks` | 64 | 1 to 1024 | Saved tasks |
| `limits.chatTaskCreatesPerRun` | 5 | 0 to 64 | Tasks one chat run can create |
| `limits.chatTaskIntervalMinutes` | 5 | 1 to 1440 | Shortest interval for a recurring task created or edited in chat |
| `limits.workerLogBytes` | 5 MiB | 64 KiB to 256 MiB | Size of each background worker log file before rotation |
| `limits.webChatBodyBytes` | 256 KiB | 64 KiB to 16 MiB | Web chat request body |
| `limits.webChatStreams` | 32 | 1 to 256 | Open web chat event streams |

Increasing a timeout does not extend `chat.runDeadlineSeconds`, the deadline for the whole answer. Provider requests also have their own timeout, so a longer model request can need both `inferenceSeconds` and `providerRequestSeconds` increased.

Saved facts, individual skill files, task notes and prompts, the Bash tool's 300-second maximum, and messaging platform message lengths still have fixed limits. Increasing a setting here does not change those limits.

## Time zone

Set `timeZone` to a time zone name such as `Europe/London` or `America/New_York`:

```json
{
  "timeZone": "Europe/London"
}
```

With `timeZone` set, Poppet uses your local time when you schedule a task from chat without naming a time zone. Repeating tasks created or edited with `--cron` also use it when you leave out `--tz`. Pass `--tz` when a task needs a different time zone. One-off tasks with `--at` still need a time zone offset.

Quiet hours use this time zone too, unless you set one inside `quietHours`. Use a time zone name, not an offset such as `+01:00`. Restart the worker after you change it.

## Quiet hours

Quiet hours hold scheduled posts to [messaging gateways](gateways/_index.md), so they do not arrive overnight:

```json
{
  "tasks": {
    "quietHours": { "start": "22:00", "end": "07:30", "timeZone": "Europe/London" }
  }
}
```

Use 24-hour times. Quiet hours need a time zone name such as `Europe/London`. If you already set [`timeZone`](#time-zone), you can leave `timeZone` out of `quietHours`. If you set both, Poppet uses the one in `quietHours`. The hours can run past midnight.

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

`poppet provider login` saves your Gemini, OpenRouter, OpenCode, or OpenCode Go key in a protected file. It needs an interactive terminal, and shows `*` in place of each character you type or paste.

To use a key without saving it, set one of these environment variables. It takes the place of the saved key.

| Variable | Provider |
| -------- | -------- |
| `POPPET_GEMINI_API_KEY` | Gemini |
| `POPPET_OPENROUTER_API_KEY` | OpenRouter |
| `POPPET_OPENCODE_API_KEY` | OpenCode |
| `POPPET_OPENCODE_GO_API_KEY` | OpenCode Go |

If the variable is set but empty or wrong, Poppet reports an error rather than using the saved key. The background worker cannot see variables from your shell, so save the key with `provider login` for scheduled tasks and messaging.

`poppet provider logout` deletes the saved key. It does not cancel the key with the provider. Do that on the provider's website.

Built-in web search has been removed. Remove `webSearchProvider` and any older `webSearch` field from `config.json`, or Poppet will reject the file. See [migrate from built-in search](web.md#if-you-used-built-in-web-search).

## Reasoning and timing logs

Some models think through a problem before they answer. Poppet saves this reasoning with each answer when the provider shares it.

With `chat.logReasoning` set to `true`, terminal chats show the reasoning as Poppet works. `chat new` and the interactive prompt show it under a Thinking heading. When `chat send` goes through the worker, Poppet also writes the reasoning to the worker log. For scheduled tasks and messaging, Poppet writes the reasoning to the worker log.

With `chat.logTimings` set to `true`, Poppet writes how long each step took to the worker log.

Poppet logs up to 128 KiB of reasoning per answer by default. Change this with [`limits.replyTextBytes`](#timeouts-and-limits). While `chat.logReasoning` is on, an answer with more reasoning than that fails.

Both are off by default. Reasoning can include private details from your messages and tools, so keep the log private. Neither setting changes how hard the model thinks. Restart the worker after you change them.
