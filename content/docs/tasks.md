+++
title = "Scheduled tasks"
description = "Schedule prompts, inspect results, and edit, pause, snooze, or run saved tasks."
next = "/docs/monitoring"
+++

# Scheduled tasks

Run a prompt once at a future time or repeat it on a schedule. Connect a provider through [getting started](getting-started.md) and keep a [worker](worker.md) running. Use `tasks show` to read the results. For alerts when a value changes, use [monitoring](/docs/monitoring/).

Scheduled [MCP tools](mcp.md) are off by default. A server's `scheduledTools` must be
a subset of its `tools` that you have reviewed and confirmed is read-only. Annotations
do not grant permission. Restart the worker after changing these lists. MCP results
cannot authorize built-in changes or page fetches.

## Create and inspect tasks

Select a provider and model as for chat, and sign in before running a task.
Tasks save that selection when they are added. The worker keeps using it, even if
the environment selects a different model later.

For a quick test, create a note in `POPPET_NOTES_DIR`, then schedule its summary
one minute from now:

```fish
set when (bun -e 'console.log(new Date(Date.now() + 60_000).toISOString())')
bun run start tasks add summary --at $when "Read project.md and summarize it"
bun run start tasks work
```

The worker prints timestamped lifecycle messages for starts, completed or failed
runs, interruptions, cancellations, skipped intervals, and task or provider pauses
and resumes. Occurrence messages include the task name and occurrence ID. Failures
use reason codes. Prompts, note contents, and model answers stay in the saved results.
An idle worker does not print polling messages.

Leave the worker running. In another terminal, using the same `POPPET_DATA_DIR`:

```fish
bun run start tasks list
bun run start tasks show <task-id>
bun run start tasks pause <task-id>
bun run start tasks resume <task-id>
```

## Edit and control the next execution

Edit a task without changing its ID or losing its history:

```fish
bun run start tasks edit <task-id> --name "Morning review"
bun run start tasks edit <task-id> --prompt "Read project.md and summarize its open decisions."
bun run start tasks edit <task-id> --cron "30 8 * * 1-5" --tz Europe/London
bun run start tasks edit <task-id> --at 2099-10-22T09:00:00+01:00
bun run start tasks skip-next <task-id>
bun run start tasks snooze <task-id> --until 2099-10-22T10:00:00+01:00
bun run start tasks run-now <task-id>
```

An edit changes only the name, prompt, or schedule you supply. A cron replacement needs
both an expression and a timezone. A one-off replacement needs a future timestamp with
a UTC offset. Empty patches, unknown fields, conflicting schedules, and timezone-only
changes are rejected. Identical values do nothing. Provider, model, workload, skill,
project snapshot, destination, and monitor or report mode stay the same.
Paused tasks can be edited without resuming them. Cancel a running occurrence before
using any of these controls on that task.

Every occurrence saves the definition and revision it runs. Changing the name or prompt
replaces an unstarted occurrence with a new copy, and keeps its slot, ready time, and
destination. The original stays in history as cancelled. Changing the schedule cancels
pending work, clears its snooze, and calculates the next future slot. Editing the name or
prompt of a completed one-off does not run it again. To rearm it, give it a new future
schedule. Monitors stay recurring. Changing a monitor's prompt starts a new quiet baseline.
Changing its name or schedule keeps the baseline.

| Control     | Behavior                                                                                                                                                                                                                                                 |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `skip-next` | Consumes exactly the selected pending occurrence or next slot. A recurring task keeps its cadence. A one-off has no next run.                                                                                                                            |
| `snooze`    | Delays that run until a later future time. `scheduledAt` keeps its original slot, and `availableAt` is the effective ready time. The hold survives a restart. Cron slots that pass during the snooze do not pile up into a backlog.                    |
| `run-now`   | Queues the run through the normal read-only runner and provider holds. Reuses pending work that qualifies, rejects a future hold, keeps the recurring cadence, and runs an unstarted one-off early. The receipt confirms that the run is queued, not that it finished. |

The CLI checks the revision and exact target before it sends a change. The worker
checks both again when it commits, and rejects stale requests rather than picking a
different slot. Receipts include the operation ID, revisions, changed fields, affected
occurrence IDs, the next time, and any baseline or snooze changes. Repeating an
operation ID returns its original receipt. A lost response never triggers a local
fallback or a replay. If a result is unclear, check `tasks show` and its latest 20
`changes` before you run another command.

Pausing cancels a snoozed occurrence. Resuming follows the normal future cron cadence and
does not restore the snooze. Recurring expiry and retry freshness use `availableAt`, with
the existing 24-hour window after that time. One-offs never expire. Retries use the
occurrence's original definition. A monitor occurrence older than its latest prompt change
cannot be retried against the new baseline. Restart an older worker before using these
commands. Unsupported actions fail with a clear error. Managing saved tasks needs no
extra login or model.

## Change-aware monitoring

Use `--monitor` with a recurring cron schedule and a timezone. In the prompt,
name the source, the value to watch, and a stable format for it:

```fish
bun run start tasks add release-watch --monitor --cron "0 9 * * *" --tz Europe/London "Read https://example.com/releases.txt and report the latest stable release tag exactly as published. Ignore prereleases and publication timestamps."
```

The first successful check saves a quiet baseline. Later checks compare the observed
value with the previous successful value, using an exact, case-sensitive match. An
unchanged value stays quiet, even if the model writes a different summary. A changed
value saves one notification with the old and new values, the observation time, a
summary, and source references. If the value goes `A → B → A`, that creates two
notifications. One-off monitoring is rejected. Each check uses normal provider quota.

Add a Discord, Telegram, or WhatsApp destination flag to send changes there. Without a
destination, decisions stay local. A combined worker runs checks and delivery. Restart
an older worker before using monitoring. An unsupported worker rejects the request
instead of creating a regular report.

Tool-capable models get `poppet_monitor.report_observation`, but only inside the active
monitor run it belongs to. Each check must read fresh evidence, submit exactly one value,
and finish successfully. Evidence can be a note read, a protected page read, or an allowed
scheduled MCP read. Recalled conversations and search snippets alone are not enough.
Evidence that failed, came back empty, was truncated, omitted, or redacted cannot establish
the watched value. Use small source files or focused endpoints. A missing field is a failed
check, not an empty value. Values fit in 1024 UTF-8 bytes, summaries in 2048 bytes, and the
whole submission in `POPPET_TOOL_BYTES`.

Inspect `tasks show <task-id>` for `lastObservation`, each occurrence's `monitoring`
decision and evidence, the failure reason, and the delivery state. Failures keep the
baseline and show up in status and logs. A completed model answer can still leave a failed
monitoring occurrence if it gave no valid observation. Poppet sends no automatic failure or
recovery messages, so silence does not prove the monitor is working. The next successful
check compares against the last successful value, including after a pause or restart.

The existing pause, resume, cancel, and retry behavior applies. Pausing keeps the baseline
and leaves active work and queued alerts alone. Manual retries use fresh runs and fresh
evidence. A failed or unconfirmed send does not roll back the baseline, and it does not
produce a replacement alert on the next unchanged check. Queued delivery retries are
separate from checking. Poppet never reposts a send whose outcome is unknown. Clearing
tasks removes observation history but keeps saved sessions and queued replies.

Poppet compares validated values and records each decision in a transaction. The model
still does the extraction, so mistakes or unstable formatting can cause false alerts or
missed changes. Polling cannot catch every change between checks. Monitoring adds no
browser or computer access, no background changes, no judgments about importance, and no
thresholds or cooldowns.

## Manage tasks through chat

Tool-capable models can create, list, inspect, pause, and resume tasks when you ask for
it in CLI chat or an authorized messaging conversation. For example:

```text
Every Friday at 09:00 Europe/London, summarize my project notes and deliver the result here.
List my scheduled tasks.
Show task <task-id>.
Pause task <task-id>.
Resume task <task-id>.
```

To monitor a specific value, ask for it directly and the model uses `create_monitor`. For
example: "Every day at 09:00 Europe/London, read https://example.com/releases.txt and
notify me here only when its latest stable release tag changes." Monitors are created on
a recurring schedule, and they save a quiet first baseline. All task controls work on both
reporting tasks and monitors.

The `poppet_tasks.manage_tasks` tool uses the existing scheduler. New tasks keep the current
session's provider, model, and workload. Each one gets a self-contained prompt and an
optional skill snapshot that you selected. Each occurrence starts a fresh session. The
agent receives the current UTC time for relative dates. It should ask when the time,
timezone, prompt, or task is unclear. One-off times must be in the future and include a
UTC offset. Recurring schedules need a timezone. A receipt reports the saved ID,
schedule, state, next time, and destination.

"Here" means the current authorized messaging conversation. The gateway checks access again
before it saves the normal destination, and later deliveries keep the same authorization
checks. CLI chat supports local results only. To send results to another authorized
conversation, use the CLI destination flags. The model cannot choose an arbitrary
destination, account, owner, or provider.

Inspection uses pages of results, and it marks shortened prompts or left-out occurrence
status. Use task IDs to pause or resume, since duplicate names need clarifying first. Pausing
cancels pending work and leaves active work running. Resuming does not replay missed recurring
runs. For the other controls, the model uses `edit`, `skip_next`, `snooze`, and `run_now`.
The host requires a completed `show` earlier in the same run, and it checks the revision and
exact target again at commit. A snooze takes an absolute `until` timestamp with an offset. If
the timezone is unclear, the model should ask. Deleting tasks, retrying occurrences, cancelling
active runs, and changing provider pauses stay CLI operations.

Task changes and their tool receipts are saved together. A saved change survives a later
model failure or an interrupted answer. If a result is unclear, check `tasks list`, `tasks show`,
or the run's tool records in `chat show` before asking for a new task. Completed calls are not
replayed. Scheduled runs cannot use this tool, including its read actions. Past conversations,
skills, notes, pages, and tool results cannot authorize task changes.

## Deliver results to Discord

Set up [Discord](gateways/discord.md), start `bun run start worker run`, and copy the ID of a
thread you are authorized to use. Pass it before the task prompt:

```fish
bun run start tasks add daily-summary --cron "0 9 * * *" --tz Europe/London --discord-thread <thread-id> "Summarize my notes"
```

A running messaging worker checks the thread before it saves the task. Creating a task
through the worker must finish within eight seconds, including queue waiting and destination
checks. A lookup that runs out of time cannot save the task afterward.

`gateway work` can check new destinations, but it does not run scheduled work. `tasks work`
runs tasks, but it does not deliver their results. The combined worker does both. Tasks
without a messaging destination keep their results local.

Each occurrence saves its destination separately from later task or channel changes. Before
sending, the worker checks the saved bot account, owner, server, allowed parent channel, and
current thread permissions. It never picks the last active conversation or sends a result to
a different thread.

Only completed results enter the existing gateway delivery queue. `tasks show` includes the
destination and a `delivery` array with the state, message IDs, and attempt count of each
chunk. An empty array means no reply has been queued. Temporary failures retry with a limited
back-off. Failed and unconfirmed sends stay visible, but Poppet does not resend unconfirmed
ones automatically. Check the saved output before you repost it by hand. A delivery failure
never changes a completed occurrence or runs inference again. `tasks retry` rejects completed
occurrences.

Results are standalone posts. They do not change the destination's conversation history,
the session binding, or the thread name. A stopped gateway resumes queued delivery when it
starts again. Replies already queued stay queued if you clear the task history.

## Deliver results to Telegram

Set up [Telegram](gateways/telegram.md), run the combined worker, and pass
`--telegram-chat <owner-id>` before the prompt. Only the configured owner's private chat is
supported. Telegram uses the same destination snapshots, access checks, and delivery
inspection as Discord. Choose one destination per task. `--telegram-chat`, `--whatsapp-chat`,
and `--discord-thread` cannot be combined.

## Deliver results to WhatsApp

Set up and pair [WhatsApp](gateways/whatsapp.md), run the combined worker, and pass
`--whatsapp-chat <owner-phone>` before the prompt. Use the owner's international phone digits,
without a `+`. The adapter checks the connected account and the private chat, then uses the
same saved destination and delivery queue. Sends with an unknown outcome stay unconfirmed, and
Poppet does not replay them.

## Select a skill

Pass `--skill <name>` before the prompt to save a [local Markdown procedure](skills.md) with
a new task. Each occurrence copies the task's saved name and text into its fresh session. Editing
or deleting the file does not change existing tasks, including manual retries. To use updated
instructions, create a new task. `tasks show` includes the snapshot. Scheduled tools stay
read-only. Note writes and the memory tool are not available, even if a selected skill asks for
changes.

## Select a project

Pass `--project <name>` before the prompt to save [project context](projects.md), optionally
with a skill. Edits, restarts, and manual retries keep the project instructions and selected
note paths. Each occurrence reads the current global and project facts, and it reads note
contents when it needs them. Scheduled tools stay read-only. Tasks created in a project chat
get that session's project copy. The model can inspect and control tasks only inside that
project, including unscoped tasks from unscoped chats. CLI commands you run still reach all tasks.

## Recurring schedules

Use a five-field cron expression and a timezone for a recurring task:

```fish
bun run start tasks add daily-summary --cron "0 9 * * *" --tz Europe/London "Summarize my notes"
```

One-off times need a `Z` or a UTC offset. Cron schedules keep their local wall-clock
time across timezone changes. A time that is missing during the spring DST change moves forward. A repeated time during the autumn DST change runs once. The database stores times as
UTC milliseconds. `show` includes final answers, run and session IDs, failures, and skipped
intervals. Each occurrence starts a fresh session with the current profile and facts, read-only
notes and conversation search and recall, page reading, and web search when it is set up. Calls
to `save_note` and the memory tool are rejected. Use `--coding` before the prompt only for coding
work that the chosen provider accepts.

Scheduled runs can use `poppet_history.read_session` after a conversation search to read the
saved context around a match, or to page forward using stable message IDs. Results fit within
`POPPET_TOOL_BYTES` and mark shortened or omitted content. Recalled statements are past data and
should be cited by session and message ID. They cannot authorize note, memory, or task changes,
or page fetches. URLs in recalled conversations never become web-search grants. Reading does not
resume the saved session or copy its provider continuation. See
[conversation context](chat.md#read-conversation-context).

## Read a supplied URL

A saved task prompt can include a public URL for `poppet_web.fetch_page`:

```fish
bun run start tasks add page-summary --cron "0 9 * * *" --tz Europe/London "Summarize https://example.com/ and cite the source"
```

Each occurrence can read that URL with the same page reader as chat, within its limits. URLs
mentioned only in a skill, a note, a past conversation, or a fetched page do not authorize a
read. Tasks have read-only note permissions. No page cache, search account, or extra credentials
are needed.

## Research with web search

[Browser automation](browser.md) works only in interactive chats. Scheduled runs get no browser
tools, even when browsing is enabled for chat. For scheduled research, use web search and the
page reader.

With [web search set up](configuration.md#web-search), a saved prompt can ask for current
research without giving a source URL:

```fish
bun run start tasks add weekly-research --cron "0 9 * * 5" --tz Europe/London "Search for recent Bun releases, read relevant sources, and cite them"
```

Each occurrence can search, and it can read the returned sources on a later model turn. Search
grants never carry over from older occurrences or saved history. Notes and memory stay read-only.
Search authentication, service, and rate-limit errors fail that occurrence. The task does not
retry, and it does not pause its inference provider. To deliver finished research to a messaging
service, use the destination flags.

## Missed work, pauses, and retries

The worker runs one occurrence at a time. Recurring times that pass while it is stopped are
skipped. An overdue one-off runs once. A recurring task has at most one pending or running
occurrence. Any extra due times are recorded as skipped intervals. Pending recurring summaries
expire after 24 hours. One-off work does not expire. Pausing cancels pending work and keeps
earlier results. To stop an active run, cancel it:

```fish
bun run start tasks cancel <occurrence-id>
bun run start tasks retry <occurrence-id>
bun run start tasks providers
bun run start tasks resume-provider openai-chatgpt
```

Quota failures pause scheduled requests for that provider until you run `resume-provider`.
Temporary and rate-limit failures delay the next work by 30 seconds. Each further failure doubles
the delay, up to five minutes. A failed occurrence is never retried automatically. `retry` starts
a fresh session for an unsuccessful occurrence, and earlier runs stay available in chat inspection.
Resume a paused task before retrying it. A cancelled one-off needs `retry`, since it has no future
occurrences.

## Clear tasks

To remove every task and its occurrence and skip history:

```fish
bun run start tasks clear
```

This works whether the worker is running or stopped. A running worker interrupts active work
before it clears, and it keeps serving commands. Saved chat sessions and runs, notes, facts,
credentials, and provider quota pauses are kept. The command prints the number of tasks removed.
Running it on an empty list is safe.

See [worker modes](worker.md#foreground-modes) to run scheduling with messaging.

## Occurrence session titles

Each occurrence uses the task name as its session title, shortened to the same 80-character
limit as chat titles. Scheduled runs skip title generation and use no extra naming quota. The
task prompt and the read-only notes policy stay the same.
