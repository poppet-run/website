+++
title = "Chat"
description = "Start a conversation, return to saved sessions, and search earlier answers."
+++

# Chat

Chat with Poppet from your terminal, a [web browser](web-chat.md), or a [Discord or Slack thread](gateways/_index.md). Poppet saves every conversation as a session on your computer, so you can return to it or search it later. If you have not connected a provider yet, start with [getting started](getting-started.md).

## Start and continue a session

```sh
poppet chat new "Help me plan a small TypeScript project"
poppet chat sessions
```

`chat new` starts a session and prints its ID before the answer. `chat sessions` lists your saved sessions. To continue one, copy its ID:

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

`chat send` adds one message to a saved session. `chat show` prints the conversation, followed by a table of runs. A run is one answer from Poppet, with its status, token usage, tools used, and any error. Add `--json` to see every saved detail.

Listing, showing, and searching sessions work without a provider connection.

## Interactive prompt

```sh
poppet chat interactive
poppet chat interactive $session_id
```

The interactive prompt shows your conversation above a text box, with formatted answers and highlighted code. Give a session ID to continue a saved session. Poppet shows its earlier messages without asking the model again.

| Key or command | What it does |
| -------------- | ------------ |
| Enter | Send the message |
| Shift+Enter | Start a new line, in terminals that support it |
| Up and Down | Recall messages you sent since opening the prompt |
| Page Up and Page Down | Scroll the conversation |
| `/attach <path>` | Attach a file to your next message |
| `/queue remove <number>` | Remove a waiting message |
| `/queue retry` | After a failure, send the failed message again and continue |
| `/queue resume` | After a failure, skip the failed message and continue |
| `/exit`, Ctrl-C, or Ctrl-D in an empty text box | Leave the prompt |

You can keep typing and sending while an answer is still arriving. Poppet queues your messages and answers them in order. If one fails, the queue pauses until you choose `/queue retry` or `/queue resume`. Messages still waiting when you leave are discarded.

Pressing Ctrl-C during an answer cancels it and leaves the prompt. Answers that already finished stay saved. When you leave, Poppet prints the command to return to the session.

To use a [skill](skills.md) for the whole session, start with `poppet chat interactive --skill <name>`. Poppet creates the session when you send your first message.

The prompt needs a real terminal. In scripts, use `chat new` and `chat send`. Set `NO_COLOR=1` to turn off colour.

## Session titles

Poppet names a new session after your first message. In the terminal, Discord, and Slack, it then asks the model for a better title once, using a short part of your message. This uses a little of your provider quota. Titles are at most 80 characters.

Rename a session at any time:

```sh
poppet chat rename $session_id "Weekly project review"
```

A title you set replaces the automatic one.

## Delete old sessions

```sh
poppet chat delete $session_id
poppet chat prune --days 90 --dry-run
poppet chat prune --days 90
```

`chat delete` removes one or more sessions, with their messages, attachments, and search entries. `chat prune --days 90` removes every session with no activity in the last 90 days. Add `--dry-run` to see what it would remove first. Renaming a session does not count as activity.

You cannot delete a session while Poppet is answering in it. `chat delete` deletes nothing if any session you name is busy or does not exist. `chat prune` skips busy sessions. Deletion cannot be undone.

Deleting a session also affects other places that used it:

- A Discord or Slack thread linked to the session starts a new session with its next message.
- Scheduled tasks keep their results, but no longer link to the deleted session.
- Saved facts stay, with their history.

## Search past conversations

```sh
poppet chat search "project TypeScript"
poppet chat show <session-id-from-search>
```

Search shows up to ten matches, best first, with the session, the session title, and a short excerpt. Every word you search for must appear. Words such as `OR` count as ordinary words. A search can be up to 256 characters.

Search covers your messages and Poppet's finished answers. It skips failed messages, tool results, and attachments.

You can also ask Poppet to search for you, for example "Find our earlier storage decision and explain why we chose it." Poppet tells you which session and message it found, since an earlier answer may be out of date.

## Provider and model

New sessions use the `provider` and `model` in `config.json`. A session keeps the provider and model it started with, even if you change the file later. Start a new session to use a different model.

## Save memory

Ask Poppet in a message to remember, change, or forget a fact. For example, ask it to remember `answer.style` as "Keep answers concise", then check with `poppet memory list`. Scheduled tasks cannot change memory. See [memory](memory.md#ask-poppet-to-change-a-fact).

## Choose a skill

```sh
poppet chat new --skill weekly-review "Review my Acorn project"
```

The session keeps a copy of the skill from when it started, so editing or deleting the skill file later does not change it. To use a skill for one message, write its name after `$`, such as `Run $weekly-review for Acorn`. In a shell command, put the message in single quotes so the shell leaves `$` alone. See [skills](skills.md#name-a-skill-in-a-message).

## Run commands

Poppet can run shell commands on your computer when it needs to. A separate review checks each command first. Some commands need your approval, and you can only give it in Discord or Slack. In the terminal and web chat, a command that needs approval does not run. See [run commands](commands.md).

## Schedule tasks from chat

Ask Poppet to create, list, change, pause, resume, skip, snooze, run, or delete a task. For example:

```text
Every Friday at 09:00 Europe/London, summarize my recent conversations.
List my scheduled tasks.
Pause task <task-id>.
```

Poppet asks when a time or time zone is unclear. A task change is saved even if the rest of the reply fails, so check `poppet tasks list` before you ask again. See [scheduled tasks](tasks.md#manage-tasks-from-chat).

## Attach files

```sh
poppet chat new --attach ./screenshot.png "What does this error mean?"
poppet chat send <session-id> --attach ./build.log --attach ./config.json "Why did this fail?"
```

Put `--attach <path>` before the message. Repeat it for more files. In the interactive prompt, use `/attach <path>`. In Discord or Slack, attach files to your message as usual. A message with files does not need any text. See [Discord](gateways/discord.md#attachments) or [Slack](gateways/slack.md#start-a-conversation).

| Type | Accepted | Size limit |
| ---- | -------- | ---------- |
| Images | PNG, JPEG, WebP, or GIF | 5 MiB each |
| Text files | `.txt`, `.md`, `.log`, `.csv`, `.json`, `.yaml`, and common source code files | 64 KiB each |

Each message can have up to 4 files. Poppet refuses PDFs and other file types. Images need a model that accepts images. If your session's model does not, start a new session with one that does.

If Poppet refuses a file, it refuses the whole message and tells you which file and why.

Poppet keeps attachments with the conversation and sends them again with later messages, so the model can still refer to them. After 8 images, older images are left out.

Poppet tells the model never to follow instructions found inside a file. As a precaution, a message with attachments cannot change memory or tasks. It also cannot use MCP tools, unless you [trust the server](mcp.md#after-poppet-reads-untrusted-content). Ask for those in a separate message.

## Read a web page

```sh
poppet chat new "Summarize https://example.com/ and cite the source"
```

When your message includes a public web address, Poppet can read that page. It reads plain text and ordinary web pages, but not PDFs, downloads, pages behind a login, or pages that need JavaScript to show their content. See [read and search the web](web.md#read-a-page).

## Search the web

With [web search](web.md) turned on, Poppet can search the web and read the pages it finds:

```sh
poppet chat new "Search for recent Bun releases, read a source, and cite it"
```

Poppet asks the model to cite the pages it used, and to say whether a fact came from a search result or from a page it read in full.

## When a message fails

Poppet saves your message before it asks the model. If the answer does not finish, because of a provider error, Ctrl-C, or a time limit, `chat show` lists the run as failed or interrupted. The failed message stays in the conversation, but Poppet leaves it out of what it sends to the model next time.

Poppet never retries a message by itself, and it never switches to another provider or model. To try again, send the message again.

## Limits

Poppet sends the model up to the last 20 exchanges of a conversation, within a 256 KiB budget. Older messages stay saved, but the model no longer sees them. A single message too large to fit is refused.

| Limit | Value |
| ----- | ----- |
| Time for one answer | 300 seconds, set with [`chat.runDeadlineSeconds`](configuration.md#settings) |
| Time for each model request | 60 seconds |
| Model requests per answer | 16 |
| Tool uses per answer | 16 |
| Each tool result | 16 KiB |
| Answer length | 128 KiB of text |

Up to 3 conversations can get answers at the same time. Messages in one conversation are answered in order. To change the limit, set [`chat.maxConcurrentRequests`](configuration.md#settings).
