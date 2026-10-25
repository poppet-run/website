+++
title = "Chat"
description = "Start a conversation, resume saved sessions, and search earlier answers."
+++

# Chat

Chat with Poppet from your terminal or a Discord thread. Sessions are saved locally, so you can resume them or search earlier answers later. Complete [getting started](getting-started.md) first if you have not connected a provider.

## Start and continue a session

```fish
poppet chat new "Help me plan a small TypeScript project"
poppet chat sessions
```

The answer streams to stdout. The session and run IDs print to stderr. To continue or inspect a session later, copy its ID:

```fish
set session_id 'paste-session-id-here'
poppet chat send $session_id "What should I build first?"
poppet chat show $session_id
```

`chat new` and `chat send` each submit one message. `chat show` prints the messages, tool calls, run outcomes, and usage as JSON. Provider continuation data is stored privately and left out of this output. Listing and inspecting sessions need no model selection or login.

## Interactive prompt

```fish
poppet chat interactive
poppet chat interactive $session_id
```

Enter one message at each `You>` prompt and wait for the answer before typing the next. Every turn uses the session's saved provider, model, and skill. Blank lines are ignored. `/exit`, Ctrl-D on an empty prompt, or Ctrl-C leaves the prompt.

Ctrl-C during an answer cancels that request and exits. The interrupted run stays in `chat show`, and earlier answers stay saved. Poppet never retries automatically.

For a new session, `--coding` and `--skill <name>` work as they do with `chat new`. A session is created only when you send its first message. If a failed first turn leaves a session behind, send another message to continue it.

The prompt accepts one line per message, with your terminal's line editing. It does not keep an input history. Both stdin and stdout must be terminals, so use the one-shot commands in scripts.

## Choose a skill

```fish
poppet chat new --skill weekly-review "Review my Acorn project"
```

The session saves a copy of the skill when it is created. Later turns use that copy, even if the file changes or is deleted. See [skills](skills.md).

## Save memory

Ask Poppet to remember, change, or forget a fact in the current message. For example, ask it to remember `answer.style` as "Keep answers concise", then check it with `poppet memory list`. Scheduled runs cannot change memory. See [memory](memory.md#ask-poppet-to-change-a-fact).

## Schedule tasks from chat

Ask Poppet to create, list, inspect, edit, pause, resume, skip, snooze, or run a task. For example:

```text
Every Friday at 09:00 Europe/London, summarize my recent conversations.
List my scheduled tasks.
Pause task <task-id>.
```

Poppet asks when a time or timezone is unclear. A task change is saved even if the reply fails afterwards, so check `poppet tasks list` before asking again. Scheduled runs cannot manage tasks. See [scheduled tasks](tasks.md#manage-tasks-from-chat).

## Session titles

A new session takes a title from its first message. After the first answer, Poppet makes one optional request to improve the title. That request uses a short excerpt of your message, has a ten-second limit, and uses a little extra provider quota. If it fails, the fallback title stays. Titles are at most 80 characters.

Rename a session at any time:

```fish
poppet chat rename $session_id "Weekly project review"
```

Names you set win over automatic titles. Renaming needs no model or credentials.

## Search past conversations

```fish
poppet chat search "project TypeScript"
poppet chat show <session-id-from-search>
```

Search returns up to ten matches, ranked by relevance. Each match includes its session and message IDs, the session title, and a short excerpt. Search queries are plain text, at most 256 characters. Every word must match. Operators such as `OR` are treated as ordinary text.

Search covers your messages and Poppet's final answers from completed runs. It leaves out failed input, tool results, and intermediate text. It needs no model or login.

Models with tool access can also search earlier conversations and read the context around a match, so you can ask "Find our earlier storage decision and explain why we chose it." Saved statements may be out of date, so Poppet cites them by session and message ID.

## Read a web page

```fish
poppet chat new "Summarize https://example.com/ and cite the source"
```

When a message includes a public `http` or `https` URL, the model can read that page. It works with plain text and static HTML. It does not run JavaScript, and it does not read PDFs, login-protected pages, or downloads. Each read has a 15-second limit and a 1 MiB size limit. URLs found in history, skills, or other pages do not allow new reads.

## Search the web

With [web search](web.md) set up, the model can search and then read the sources it finds:

```fish
poppet chat new "Search for recent Bun releases, read a source, and cite it"
```

Answers should say which claims come from search snippets and which come from pages Poppet read.

## Use the browser

With [browser automation](browser.md) turned on, interactive and messaging chats can open websites, read them, and fill in forms when you ask. Each run gets its own browser, and logins do not carry over between messages. Scheduled runs have no browser tools.

## Run commands

With the [command tool](commands.md) available, the model can run shell commands on your computer. Each command is reviewed first. Commands that need your approval wait for it in Discord, and CLI commands that need approval stop with instructions.

## Provider and model

New sessions use the `provider` and `model` in `config.json`. Existing sessions keep their saved provider, model, and workload, even if you change the file later. Start a new session to use a different one.

OpenCode Go only accepts coding requests, so start its sessions with `--coding`:

```fish
poppet chat new --coding "Explain how to structure a TypeScript CLI"
```

## Failures and cancellation

Poppet saves each message before it asks the model for an answer. Only a completed answer is saved as the answer. Provider errors, Ctrl-C, closed output, and time limits leave a failed or interrupted run that you can inspect with `chat show`. A failed message stays in the history but is left out of later context. To try again, send a new message. Poppet never retries a request or switches to another provider or model by itself.

## Context and limits

Each run includes recent complete exchanges, up to 20, within a 256 KiB context budget. Poppet keeps room for the answer, and it refuses a message that cannot fit. Trimming affects only what is sent to the model, not the saved history.

Each run has a time limit set by `chat.runDeadlineSeconds` (300 seconds by default), and each model request has a 60-second limit. A run allows eight model turns and sixteen tool calls. Each tool result is capped at 16 KiB. Answers are capped at 128 KiB of text.

Recorded usage adds up every model turn, if each turn reports usage. Otherwise it is shown as unknown.

See [worker](worker.md#chat-while-the-worker-runs) for chat while a worker is running.
