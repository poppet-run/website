+++
title = "Chat"
description = "Start a conversation, resume saved sessions, and search earlier answers."
+++

# Chat

Chat with Poppet from your terminal or a Discord thread. Poppet saves sessions locally, so you can resume them or search earlier answers later. If you have not connected a provider yet, start with [getting started](getting-started.md).

## Start and continue a session

```sh
poppet chat new "Help me plan a small TypeScript project"
poppet chat sessions
```

The answer streams to stdout. The session and run IDs print to stderr. To continue or inspect a session later, copy its ID:

{{< shell >}}
```bash
session_id='paste-session-id-here'
poppet chat send $session_id "What should I build first?"
poppet chat show $session_id
```

```fish
set session_id 'paste-session-id-here'
poppet chat send $session_id "What should I build first?"
poppet chat show $session_id
```
{{< /shell >}}

`chat new` and `chat send` each submit one message. `chat show` prints the conversation and a table of runs with their states, token usage, tool calls, and failures. Add `--json` for every saved message, tool call, run output, and usage record. Poppet stores provider continuation data separately and leaves it out of both forms. Listing and inspecting sessions need no model or login.

Different sessions can run at the same time, up to `chat.maxConcurrentRequests`, which defaults to 3. Requests in the same session run in order. If a worker is running, these commands go through it. See [chat while the worker runs](worker.md#chat-while-the-worker-runs).

## Interactive prompt

```sh
poppet chat interactive
poppet chat interactive $session_id
```

The terminal shows your conversation above an input box. Answers render Markdown and code highlighting. Resuming a session loads saved messages and attachment names without calling the model or replaying tools. Use Page Up/Page Down to scroll; resizing preserves your draft. `NO_COLOR` disables colour.

Press Enter to send, or Shift+Enter for a newline in terminals that support modified keys. Bracketed multiline paste stays in the composer until you send it. Up/Down recall messages from this invocation; input history is not saved to disk.

You can draft and submit messages while an answer streams. They queue in order and run after the current turn. `/queue remove N` removes a numbered pending message. If a turn fails, the queue pauses: `/queue retry` retries that message first, while `/queue resume` skips it and continues. Pending messages are discarded when you exit.

Use `/attach <path>` to attach a file to the next submitted message, including a queued message. Files are read when that turn starts.

Each turn uses the session's saved provider, model, and skill. For a new session, use `--skill <name>` before the first message. Omit it when resuming a saved session. A session is created when you first send a nonblank message.

`/exit`, Ctrl-D at an empty idle composer, or Ctrl-C leaves the chat. Ctrl-C during an answer cancels that request and exits. Earlier completed answers stay saved. On exit, Poppet prints a command to resume the session. Queued requests are never retried automatically.

With `chat.logReasoning` enabled, readable provider reasoning appears under a Thinking heading. `TERM=dumb` uses a single-line prompt without queuing. Both stdin and stdout must be terminals; use `chat new` and `chat send` in scripts.

## Session titles

A new session takes a title from its first message. After the first answer, Poppet makes one optional request to improve the title. That request uses a short excerpt of your message, has a ten-second limit, and uses a little extra provider quota. If it fails, the fallback title stays. Titles are at most 80 characters.

Rename a session at any time:

```sh
poppet chat rename $session_id "Weekly project review"
```

Names you set win over automatic titles. Renaming needs no model or login.

## Search past conversations

```sh
poppet chat search "project TypeScript"
poppet chat show <session-id-from-search>
```

Search prints a table of up to ten matches, ranked by relevance. Use `poppet chat search --json "project TypeScript"` for the full result, including `matches` and `truncated`. Each match includes its session and message IDs, the session title, and a short excerpt. Search queries are plain text, at most 256 characters. Every word must match. Search treats operators such as `OR` as ordinary words.

Search covers your messages and Poppet's final answers from completed runs. It leaves out failed input, tool results, and intermediate text. It needs no model or login.

Models with tool access can also search earlier conversations and read the context around a match, so you can ask "Find our earlier storage decision and explain why we chose it." Saved statements may be out of date, so Poppet cites them by session and message ID.

## Provider and model

New sessions use the `provider` and `model` in `config.json`. Existing sessions keep their saved provider and model, even if you change the file later. Start a new session to use a different one.

OpenCode Go uses the selected model without a separate coding flag:

```sh
poppet chat new "Explain how to structure a TypeScript CLI"
```

## Save memory

Ask Poppet to remember, change, or forget a fact in the current message. For example, ask it to remember `answer.style` as "Keep answers concise", then check it with `poppet memory list`. Scheduled runs cannot change memory. See [memory](memory.md#ask-poppet-to-change-a-fact).

## Choose a skill

```sh
poppet chat new --skill weekly-review "Review my Acorn project"
```

The session saves a copy of the skill when it starts. Later turns use that copy, even if the file changes or is deleted. See [skills](skills.md).

## Run commands

With the [command tool](commands.md) available, the model can run shell commands on your computer. A separate review checks each command before it runs. Commands that need your approval wait for it in Discord, and CLI commands that need approval stop with instructions.

## Schedule tasks from chat

Ask Poppet to create, list, inspect, edit, delete, pause, resume, skip, snooze, or run a task. For example:

```text
Every Friday at 09:00 Europe/London, summarize my recent conversations.
List my scheduled tasks.
Pause task <task-id>.
```

Poppet asks when a time or timezone is unclear. A task change is saved even if the reply fails afterwards, so check `poppet tasks list` before asking again. Scheduled runs cannot manage tasks. See [scheduled tasks](tasks.md#manage-tasks-from-chat).

## Attach files

```sh
poppet chat new --attach ./screenshot.png "What does this error mean?"
poppet chat send <session> --attach ./build.log --attach ./config.json "Why did this fail?"
```

`--attach <path>` goes before the message and can repeat. In the interactive
prompt, `/attach <path>` adds a file to the next message. In Discord, attach files
to the message itself; a message with files needs no text. See
[Discord](gateways/discord.md#attachments).

Images are PNG, JPEG, WebP, or GIF, identified by their bytes rather than their
name, and need a model that accepts images. Text files are UTF-8 without NUL
bytes and need an allowed extension such as `.txt`, `.md`, `.log`, `.csv`,
`.json`, `.yaml`, or a common source-code extension. PDFs and other files are
refused. One message holds at most 4 files, each image at most 5 MiB and each
text file at most 64 KiB. These limits are fixed.

A rejected file stops the whole message, with a reply naming the file and why;
the model never answers without a file you sent. Sending an image to a session
whose model does not accept images fails before inference. Start a new session
with a model that does.

Files are saved in the database with the message, and later turns in the session
resend them while their exchange stays in the retained history. Each image counts
as 6 KiB of the context budget, and each text file at its size. Only the 8 newest
images are resent; older ones are replaced by a note naming the attachment ID, so
the model knows an image was there. `chat show` lists each message's attachments
by ID, name, type, and size, not their contents. Conversation search does not
index attachment contents.

The model receives text files labelled as untrusted file content, and is told
never to follow instructions found in attachments. A message with attachments
withdraws task, memory, and MCP mutations for its run, as a fetched page does; ask
for those changes in a follow-up message.


## Read a web page

```sh
poppet chat new "Summarize https://example.com/ and cite the source"
```

When a message includes a public `http` or `https` URL, the model can read that page. It works with plain text and static HTML. It does not run JavaScript, and it does not read PDFs, login-protected pages, or downloads. Each read has a 15-second limit and a 1 MiB size limit. URLs found in history, skills, or other pages do not allow new reads.

## Search the web

With [web search](web.md) set up, the model can search and then read the sources it finds:

```sh
poppet chat new "Search for recent Bun releases, read a source, and cite it"
```

Answers should say which claims come from search snippets and which come from pages Poppet read.

## Failures and cancellation

Poppet saves each message before it asks the model for an answer. Only a completed answer is saved as the answer. Provider errors, Ctrl-C, closed output, and time limits leave a failed or interrupted run that you can inspect with `chat show`. A failed message stays in the history, but Poppet leaves it out of later context. To try again, send a new message. Poppet never retries a request or switches to another provider or model by itself.

## Context and limits

Each run includes recent complete exchanges, up to 20, within a 256 KiB context budget. Poppet keeps room for the answer, and it refuses a message that cannot fit. Trimming affects only what is sent to the model, not the saved history.

Each run has a time limit set by `chat.runDeadlineSeconds`, which defaults to 300 seconds. Each model request also has its own 60-second limit. A run allows sixteen model turns and sixteen tool calls. Each tool result is capped at 16 KiB. Answers are capped at 128 KiB of text.

Recorded usage is the sum of every model turn. If any turn does not report usage, Poppet shows the total as unknown.
