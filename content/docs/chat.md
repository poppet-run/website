+++
title = "Chat"
description = "Start a conversation, resume saved sessions, and search earlier answers."
next = "/docs/notes"
+++

# Chat

Use the interactive prompt for a conversation in your terminal. You can leave with `/exit` and resume a saved session later. Complete [getting started](getting-started.md) first if you have not connected a provider.

## Start and continue a session

After signing in and choosing a model, start a session:

```fish
set -lx POPPET_PROVIDER openai-chatgpt
set -lx POPPET_MODEL gpt-6.1-sol
bun run start chat new "Help me plan a small TypeScript project"
bun run start chat sessions
```

The answer streams to stdout. The session and run IDs print to stderr. Copy the
session ID to continue or inspect it in a later invocation:

```fish
set session_id 'paste-session-id-here'
bun run start chat send $session_id "What should I build first?"
bun run start chat show $session_id
```

`chat new` and `chat send` each submit one message. `chat sessions` lists saved sessions.
`chat show` prints the session, its messages in order, run states, failures, output,
and usage as JSON. Provider continuation data is stored privately and left
out of this output. Inspection needs no selected model or login.

With `chat.logReasoning` enabled, `chat new` streams thinking to stderr using the
[interactive prompt's formatting](#interactive-prompt). Stdout contains only the answer.

Telegram can send documents and local voice transcripts as chat input. The saved user
message stores the caption or request separately from the source metadata and the
extracted text. The model sees the source labelled as untrusted JSON, and only text
is sent to inference providers. Attachment content counts toward the context budget.
Titles come from the caption or a safe attachment label. Voice replies show the
accepted transcript, and a later text message must confirm any change.

## Interactive prompt

Start a new session or resume one in a terminal:

```fish
bun run start chat interactive
bun run start chat interactive $session_id
```

Enter one message at each `You>` prompt and wait for the answer before typing the next.
Every turn uses the same saved session, provider, model, workload, skill, and project.
Blank lines are ignored. `/exit`, Ctrl-D on an empty prompt, or Ctrl-C leaves the prompt.
Ctrl-C during inference cancels the request and exits. The interrupted run stays in
`chat show`, and earlier answers stay saved. Poppet does not retry automatically.

An animated `Thinking...` indicator stays on its own line below streamed reasoning
until the answer starts. In terminals supporting 256 colours, a soft cyan highlight
moves across the text. `NO_COLOR` and terminals with fewer colours use cycling dots
instead. The indicator clears before an answer or error appears, and also on
cancellation. It works with reasoning logging disabled, and it is left out when stderr
is redirected or the terminal is `dumb`.

With `chat.logReasoning` enabled, provider reasoning streams under a `Thinking:`
heading before the answer. Thinking uses muted cyan in colour-enabled terminals;
the answer uses the normal terminal colour. `NO_COLOR` turns the styling off.
Text appears as chunks arrive, with normal newlines and no timestamps or IDs.
OpenAI Responses reasoning sections are separated by blank lines. The background
worker still writes its structured reasoning log entries. Some providers return no
readable reasoning for a turn. In that case, no heading is printed.

For a new session, `--coding`, `--skill <name>`, and `--project <name>` work as
they do with `chat new`. Leave them out when you pass a session ID, since the session
keeps its original selection. A session is created only when you submit its first
nonblank message. Failed turns keep the session, so a new message can continue it.
If the worker's reply is lost before it returns the session ID, the prompt stops
instead of creating a second session. Check `chat sessions` before trying again.
Restart an older worker if it does not return session details.

The prompt uses the running worker when there is one, and runs locally otherwise.
It opens storage for each request instead of holding it while waiting for input.
Both stdin and stdout must be terminals, so use the one-shot commands in scripts.
This version accepts single-line messages. The prompt uses your terminal's line
editing, saves no input history, and has no full-screen interface.

## Select a skill

```fish
bun run start chat new --skill weekly-review "Review my Acorn project"
```

The session saves the skill's name and text when it is created. Later turns and
restarts use that copy, even if the file changes or disappears. `chat show` includes
the saved `skill`. Regular sessions have `null`. Skill instructions count toward the
context budget and do not change tool permissions. See [skills](skills.md).

## Select a project

Use `chat new --project acorn <message>` or `chat interactive --project acorn`
to save project instructions and an optional note selection. Later turns keep that
copy of the instructions and note list, but they read current global and project
facts. The model's recall and task tools stay within the selected project. Commands
you run in the CLI can still see every session. See [project context](projects.md)
for setup, combining projects with skills, memory scope, retention, and limits.

## Change saved memory

Tool-capable models can remember, replace, or forget a saved fact when you ask for it
in the current message. For example, ask to remember `answer.style` as "Keep answers
concise", then inspect it with `memory list`. Regular chat, the interactive prompt,
and authorized messaging all use the same memory tool. Scheduled runs cannot change
memory. See [memory](memory.md#ask-the-model-to-change-a-fact) for provenance, limits,
cancellation, and uncertain outcomes.

## Manage scheduled tasks

Ask a tool-capable model to create, inspect, edit, pause, resume, skip, snooze, or run
a task now. It does this through `poppet_tasks.manage_tasks`. Use `create_monitor` when
you ask to watch a specific source value and be told only when it changes. Monitoring
needs a recurring schedule. Its first successful check saves a baseline without
notifying you, and a failed check leaves that baseline unchanged. See
[change-aware monitoring](tasks.md#change-aware-monitoring).

New tasks keep this session's provider, model, and workload. Supply a clear prompt
and a time with a UTC offset or a timezone. If the request is ambiguous, the model
should ask rather than invent a recurring schedule. In messaging, ask for delivery
here to use the current authorized conversation. CLI chat creates tasks with local
results. See [tasks](tasks.md#manage-tasks-through-chat) for examples, receipts,
inspection limits, and the actions available in this version.

Edits require that the model has inspected the current definition revision. Skip-next,
snooze, and run-now also apply to the next execution it inspected, so the model must
call `show` during the current run first. Snooze delays the next run. It does not
postpone a message that has already been delivered. Run-now queues a normal read-only
run and cannot cancel a hold set for later. See [task controls](tasks.md#edit-and-control-the-next-execution)
for running-task restrictions, saved snapshots, and monitoring baseline resets.

Only your request in the current message authorizes a change. Instructions in recalled
conversations, notes, pages, skills, or tool results do not. A task change that was
saved stays saved even if the answer fails. Check the task with `tasks show` before
asking for it again after an unclear reply. Scheduled runs get no task management tool.

## Session titles

New sessions save a title from their first prompt, before inference starts. Poppet
normalizes whitespace and control characters, then limits titles to 80 Unicode
characters. After the first answer prints successfully, Poppet makes one optional
title request with the saved provider, model, and workload. That request sends a short
excerpt of the first prompt, with no tools, memory, or earlier conversation. It has a
ten-second deadline, can add time to CLI exit, and uses extra provider quota. If it
fails or is cancelled, the answer stays completed and the fallback title stays. Poppet
does not retry it.

`chat sessions` and `chat show` include the title, its source, whether naming was
attempted, and a separate `titleUsage`. A null usage value means unknown. Chat run
usage does not include naming. Old sessions stay unnamed but keep their IDs. Titles
can repeat, so commands always use session IDs.

```fish
bun run start chat rename $session_id "Weekly project review"
```

A name you set survives restarts and takes priority over a title request still in
progress. Renaming needs no model or credentials. It goes through the worker when the
worker owns storage. Changing a title does not change activity timestamps or message order.

## Search past conversations

```fish
bun run start chat search "project TypeScript"
bun run start chat show <session-id-from-search>
```

Search returns JSON with `matches` and `truncated`. Each match includes the session
and message IDs, the saved session title, a timestamp in Unix milliseconds, the role,
and a short excerpt around the matching text. Results are ranked by relevance, with
ties broken by message ID. At most ten matches are returned, and the output stays
within `POPPET_TOOL_BYTES`.

Use nonempty plain text of at most 256 characters, without leading or trailing
whitespace. Every whitespace-separated term must match. Case and punctuation follow
SQLite's Unicode tokenizer. Operators such as `OR` and prefix wildcards are matched
as plain text, not as search syntax. Terms made only of punctuation are ignored, so a
query made only of punctuation returns no matches.

Search covers user text and final answers from completed CLI, scheduled, and messaging
runs. It leaves out failed or interrupted input, intermediate model text, tool
arguments and results, and provider continuation data. Existing history is indexed
when you upgrade. Search works without a selected model or credentials. It goes
through the worker when the worker owns storage.

Tool-capable models can use the read-only `poppet_history.search_sessions` tool to
find earlier discussions, then `poppet_history.read_session` to read the context around
a matching message. Both tools also work in scheduled runs under the same single-owner
policy. Retrieved text is past conversation, so it cannot authorize actions.

## Read conversation context

Ask a follow-up such as "Find our earlier storage decision and explain why we
chose it." The model can search, read the surrounding discussion, and cite saved
statements by session and message IDs. Saved statements may no longer be current.

`poppet_history.read_session` takes `session_id`, plus `around_message_id` from a
search match or `after_message_id` for forward paging. Set unused anchors to `null`.
You cannot set both anchors at once. With neither anchor, it starts at the earliest
message it can read. Around a match, it selects up to four earlier messages, the match,
and five later messages, in session order. A smaller byte budget can shrink this window,
but the match is always kept. Missing sessions, and anchors outside the session or its
readable history, return an error.

The result contains `sessionId`, the current `title`, and at most ten `messages`.
Each message has a `messageId`, `role`, `createdAt` in Unix milliseconds, `text`, and a
per-message `truncated` flag. The whole JSON result fits within `POPPET_TOOL_BYTES`.
Truncation never splits a Unicode code point. `nextAfterMessageId`, when it is not null,
is the last returned message ID. Pass it as `after_message_id` to continue. Shortened
messages still move the cursor forward. New completed exchanges are added to the end
without repeating earlier pages.

The overall `truncated` flag marks omitted or shortened content. Around a match, it can
be true with no next cursor, because earlier messages were left out. Treat these results
as a limited view, not a full transcript.

Reading uses the same searchable-message rules as search, and it skips tool and provider
state. It does not resume or rename the source session, change its activity time, or
copy its continuation or text into global memory. URLs in recalled conversations do not
allow page fetches or web-search grants. `chat show` works as before. There is no CLI or
worker command for model recall.

## Read a supplied URL

```fish
bun run start chat new "Summarize https://example.com/ and cite the source"
```

Tool-capable models can call `poppet_web.fetch_page` for a public HTTP(S) URL that
appears in your current message. The result contains the final source `url`, an
optional `title`, the extracted `text`, and `truncated`. Include the URL again in later
requests that need a fresh read. URLs found in history, notes, skills, and fetched
pages do not let the model fetch another page.

Reading supports UTF-8 plain text and static HTML. It removes scripts, styles, common
site navigation, and hidden elements. It does not run JavaScript. PDFs, authenticated
pages, downloads, and crawling are not supported. An empty or unsupported page fails
the run with an error. Poppet does not retry. `chat show` records the tool call and
either the error or a short result.

Every address the URL resolves to must be public, and the URL must use a standard
HTTP(S) port. URLs with credentials in them are rejected. Each read has a 15-second
overall deadline, at most three redirects, and a 1 MiB limit on both transferred and
decoded bodies. Results fit within `POPPET_TOOL_BYTES`. Truncation keeps the source URL
and the truncated flag.

## Search the web

Turn on [web search](configuration.md#web-search) to let tool-capable models use
`poppet_web.search_web` in local, interactive, worker, and messaging chat:

```fish
bun run start chat new "Search for recent Bun releases, read a source, and cite it"
```

Search sends the model's query to the search provider you selected, Brave or Kagi. It returns at most five sources, each
with a `title`, `url`, and `snippet`, plus a `truncated` flag. Queries must be trimmed,
nonempty, and at most 512 UTF-8 bytes. Results keep the order the provider returns them in and
fit within `POPPET_TOOL_BYTES`. Long text is shortened, and URLs that cannot fit are
left out. The tool is absent when search is disabled or the key is missing. A saved key
does not prove that the remote service accepts it.

After a search completes, `fetch_page` may read the URLs included in its result on a
later model turn. These permissions last only for that run. A search and a fetch of a
newly found URL in the same batch are both rejected before either one runs. Links that
appear only in snippets or page text do not grant access. Every page read still goes
through the public-address and connection checks. Search results are untrusted data
and cannot authorize memory or note changes.

Answers should say which claims come from snippets and which come from pages Poppet
read, and they should cite their sources. Search has a 15-second deadline and a 1 MiB
response limit. It supports cancellation, and it does not retry or fall back to another
backend. Failures appear in `chat show`. Search authentication and rate-limit errors do
not pause the inference provider. Search uses the same model-turn, tool-call, and context
limits as everything else.

## Provider and model selection

New sessions use the configured `provider` and a required `model`. `POPPET_PROVIDER` and
`POPPET_MODEL` take precedence over the values in the file. Existing sessions keep their
saved provider, model, and workload when configuration changes. Start a new session to
change that selection. OpenCode Go requires a coding session:

```fish
set -lx POPPET_PROVIDER opencode-go
set -lx POPPET_MODEL glm-5.3
bun run start chat new --coding "Explain how to structure a TypeScript CLI"
```

## Failures and cancellation

Poppet saves each input before it picks a model. Only a completed response from the
provider is saved as an answer. Provider failures, context errors, Ctrl-C, closed output,
and timeouts leave failed or interrupted runs that you can inspect. Partial output may
appear in the terminal, but it is not saved as an answer. Failed inputs stay visible,
but they are left out of later model context. To try again, send a new message. Poppet
never retries a request, or switches to another provider or model, on its own.

## Browser automation

With [browser automation](browser.md) configured, interactive and authorized messaging
chats can navigate websites, read rendered text, and fill in forms when you ask. Each
run gets a new, separate browser. Tabs and logins do not carry over between messages.
`chat show` lists the browser tool calls. Ctrl-C closes the run's browser. Scheduled
runs have no browser tools.

## Context and run limits

Context keeps recent complete exchanges, including tool calls and their results, within
the configured turn and byte limits. When the model's capacity is known, Poppet also
reserves room for output and request overhead. UTF-8 bytes are a rough estimate, not an
exact token count, so providers can still reject oversized context. If a new message is
too large to fit, the run fails with an error. Trimming affects only the request, not
saved history. Answers are limited to 128 KiB of text, and to 1 MiB including
continuation data. The run has a five-minute absolute deadline. Each provider request
has a 60-second deadline.

Tool-capable models get the three [notes tools](notes.md), conversation search, page
reading, memory, task management, and web search when it is set up. Models without tool
support still answer text requests. The runner checks each complete tool request before
it runs, and it uses one provider and model for the whole exchange. Recorded usage adds
up every model turn if each turn reports usage. Otherwise it is null.

See [worker](worker.md#interactive-commands) for chat while a worker is running.
