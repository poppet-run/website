+++
title = "Scheduled tasks"
description = "Run a prompt later or on a schedule, read the results, and edit, pause, or skip tasks."
+++

# Scheduled tasks

A scheduled task runs a prompt for you once at a later time, or repeatedly on a schedule. Tasks only run while the [worker](worker.md) is running. You can read the results in your terminal, or have them posted through a [messaging gateway](gateways/_index.md), such as Discord or Slack. Connect a provider through [getting started](getting-started.md) first.

## Create your first task

To try it out, schedule a task one minute from now and start the worker:

```sh
poppet tasks add summary --in 1m "Summarize my recent conversations"
poppet worker run
```

The worker prints a line each time a task starts and finishes. Leave it running, and in a second terminal, check the result:

```sh
poppet tasks list
poppet tasks show <task-id>
```

`tasks show` lists each time the task was due, what happened, and the answer. Poppet calls each scheduled time an occurrence, and the commands below use that word.

## Choose when a task runs

Every task needs one of these:

| Option | Runs | Example |
| ------ | ---- | ------- |
| `--in` | Once, after a delay in seconds, minutes, hours, or days | `--in 30m`, `--in 2d` |
| `--at` | Once, at a date and time | `--at 2099-10-22T09:00:00+01:00` |
| `--cron` | Repeatedly, on a cron schedule in a time zone | `--cron "0 9 * * *" --tz Europe/London` |

For `--at`, include a time zone offset such as `+01:00`, or `Z` for UTC. For `--tz`, use a time zone name such as `Europe/London` or `America/New_York`.

For repeating tasks, `--tz` defaults to [`timeZone`](configuration.md#time-zone) in `config.json`. If that setting is absent, supply `--tz`. An explicit `--tz` overrides the setting.

A cron schedule has five parts: minute, hour, day of the month, month, and day of the week. For example, `0 9 * * *` means 09:00 every day, and `30 8 * * 1-5` means 08:30 on weekdays.

```sh
poppet tasks add daily-summary --cron "0 9 * * *" --tz Europe/London "Summarize my recent conversations"
```

A repeating task keeps the same local time when the clocks change for daylight saving. If the clocks skip its time, it runs at the next valid time. If a time happens twice, it runs once.

Each task remembers the provider and model from `config.json` when you create it, and keeps using them even if you change `config.json` later.

Each run starts a new conversation. It can read your profile and saved facts, search past conversations, read web pages, and search the web if you set that up. A scheduled task cannot change memory or other tasks.

## End a repeating task

Add `--until` to stop a repeating task after a date and time:

```sh
poppet tasks add release-watch --cron "0 9 * * *" --tz Europe/London --until 2099-10-29T09:00:00+00:00 "Tell me only if the release page changed"
```

In this example, the 09:00 run on 29 October is the last one. `--until` takes a future date with a time zone offset, and only works with `--cron`.

Once there are no runs left, `tasks list` shows the task as `ended`. It keeps its history. To start it again, set a later end time or remove it:

```sh
poppet tasks edit <task-id> --until 2099-11-30T18:00:00+00:00
poppet tasks edit <task-id> --until none
```

The task picks up from now, without making up the runs it skipped.

## Edit a task

Change a task without losing its ID or history:

```sh
poppet tasks edit <task-id> --name "Morning review"
poppet tasks edit <task-id> --prompt "Summarize open decisions from recent conversations."
poppet tasks edit <task-id> --cron "30 8 * * 1-5" --tz Europe/London
poppet tasks edit <task-id> --at 2099-10-22T09:00:00+01:00
```

An edit changes only what you give it. A new cron schedule needs `--cron` and either `--tz` or the configured `timeZone`. Changing `timeZone` does not change schedules already saved. The provider, model, skill, and destination cannot be changed. To change those, create a new task. Editing a paused task keeps it paused.

If you change the prompt or schedule before the next run starts, Poppet cancels that run and plans the next one with your changes. You cannot edit a task while it is running. To run a finished one-off task again, give it a new time with `--at`.

## Pause, skip, or run a task now

```sh
poppet tasks pause <task-id>
poppet tasks resume <task-id>
poppet tasks run <task-id>
```

| Action | What it does |
| ------ | ------------ |
| `tasks pause` | Stops the task until you resume it, and cancels its next run |
| `tasks resume` | Starts scheduling the task again |
| `tasks run` | Runs the task now, without changing its schedule |
| Skip, from chat | Skips only the next run |
| Snooze, from chat | Moves the next run to a later time |

Skipping and snoozing have no commands. Ask Poppet in a chat instead, such as "Skip the next run of my daily summary."

You can keep up to 64 tasks, including paused and ended ones.

## Manage tasks from chat

Ask Poppet in any chat, including a gateway conversation, to create, list, change, pause, resume, skip, snooze, run, or delete a task:

```text
Every Friday at 09:00 Europe/London, summarize my recent conversations and deliver the result here.
End task <task-id> at 2099-10-29T09:00:00+00:00.
List my scheduled tasks.
Pause task <task-id>.
```

With [`timeZone`](configuration.md#time-zone) set, Poppet uses your local time when you give no offset or zone. It asks when the intended time or task is unclear. A change is saved even if the rest of the reply fails, so check `poppet tasks list` before you ask again.

Some limits apply to tasks created or changed from chat:

- Poppet can create up to five tasks per message.
- A repeating task must have at least five minutes between runs. Poppet checks every listed minute, including the gap from the last minute of an hour to the first minute of the next. For example, `0,30 * * * *` is accepted, but `0,58 9 * * *` is rejected even though it only runs during one hour.
- To change a task that posts to a gateway, ask from a place where Poppet can post to that destination.
- Tasks that use a [manual-only skill](skills.md#manual-only-skills) can only be changed with the `poppet tasks` commands.
- Retrying and cancelling runs need the `poppet tasks` commands.

## Send results to a gateway

After you set up a [messaging gateway](gateways/_index.md), add `--to` with the gateway's name when you create a task:

```sh
poppet tasks add daily-summary --cron "0 9 * * *" --tz Europe/London --to discord "Summarize my recent conversations"
```

| Option | Posts to |
| ------ | -------- |
| `--to <gateway>` | The gateway's home channel, such as `--to discord` |
| `--to <gateway>:<destination>` | Another channel or thread, such as `--to slack:C123` |

Each gateway's guide lists the destinations it supports.

Poppet checks that it can post there when you create the task, and again before each post. It never posts results anywhere else. A task without `--to` keeps its results on your computer.

Results appear as new messages. They do not start or continue a conversation in that channel.

`tasks show` shows whether each result was posted. If Poppet cannot tell whether a post went through, it does not try again, to avoid posting twice. Check the channel, and post the saved answer yourself if needed.

To hold posts overnight, set [quiet hours](configuration.md#quiet-hours). Results ready during quiet hours wait until they end, and `tasks show` shows when they will be posted.

### Stay quiet when there is nothing to report

Write the prompt so it only reports when something happens, such as "Tell me only if the page changed." When there is nothing to report, Poppet answers with exactly `NO_REPLY` and posts nothing. The run still counts as complete, and `tasks show` shows `no action`.

An answer that mentions `NO_REPLY` alongside other text is posted as usual. To compare with the previous run, [keep a note](#keep-a-note-between-runs).

### Failure notices

When a task that posts to a gateway fails, Poppet posts a short notice in the same place:

```text
Scheduled task "<name>" failed (<reason code>). Inspect it with: poppet tasks show <task-id>
```

The notice never includes the answer or error details. Run the command it shows to see what went wrong.

If a task keeps failing, Poppet posts only the first notice. It posts again after the task next succeeds and then fails. Poppet does not post notices for runs you cancelled, runs that were interrupted, or failures more than 24 hours old. Notices follow quiet hours like any other post.

## Keep a note between runs

A task can keep one note between runs, up to 4 KiB. This lets a repeating task remember what it saw last time:

```sh
poppet tasks add release-watch --cron "0 9 * * *" --tz Europe/London "Read https://example.com/releases and find the newest release version. Compare it with the task note. If there is no note or the version differs, save the new version as the note and report it. Otherwise reply NO_REPLY."
```

Replace the example address with the page you want to watch. Add `--to <gateway>` before the prompt to post the results.

Each run sees the current note and can replace or clear it. The new note is saved only if the run completes. A failed or cancelled run leaves the note as it was. Editing the task keeps its note. Notes are separate from your [saved facts](memory.md).

To see or clear a note:

```sh
poppet tasks show <task-id>
poppet tasks clear-note <task-id>
```

`tasks show` displays the note and when it last changed. You cannot clear a note while the task is running.

## Choose a skill

Add `--skill <name>` before the prompt to have the task follow a [skill](skills.md). The task keeps a copy of the skill from when you created it. To use an edited skill, create a new task. Writing `$name` in a task prompt does not load a skill.

## Read and search the web

A task prompt can include a web address for Poppet to read:

```sh
poppet tasks add page-summary --cron "0 9 * * *" --tz Europe/London "Summarize https://example.com/ and cite the source"
```

Poppet only reads addresses that are in the prompt, or that it finds with [web search](web.md). With web search set up, a prompt can ask for research without an address:

```sh
poppet tasks add weekly-research --cron "0 9 * * 5" --tz Europe/London "Search for recent Bun releases, read relevant sources, and cite them"
```

## Use MCP tools

Scheduled tasks cannot use [MCP tools](mcp.md) unless you allow it for each tool. Allow read-only tools with `scheduledTools`, or tools that change things with `scheduledReviewedTools`. See [MCP permissions](mcp.md#permissions) and [schedule a reviewed action](mcp.md#schedule-a-reviewed-action).

A tool that needs your approval fails the run, because nobody is there to approve it. The task's schedule continues, and actions that already finished are not undone.

## Missed runs

The worker runs one task at a time, and only while your computer is awake.

- A one-off task that was due while the worker was stopped runs once when it starts again.
- A repeating task runs its most recent missed time once, if it was missed by 60 minutes or less. Poppet skips older missed times. Change this window with [`tasks.catchUpMinutes`](configuration.md#settings).
- A repeating run that has waited 24 hours without starting is dropped. One-off runs do not expire.

Set `tasks.catchUpMinutes` to `0` to skip missed repeating runs when the worker starts. While the worker is running, a delayed timer still runs the most recent due time if it is less than a minute late, and skips earlier times.

You cannot snooze or run an expired pending repeating run. Ask Poppet to skip it, or wait for the worker to drop it.

`tasks show` lists the times Poppet skipped.

## Cancel or retry a run

```sh
poppet tasks cancel <task-id>
poppet tasks retry <task-id>
```

`tasks cancel` stops the task's current or next run without changing the schedule. `tasks retry` runs the task's latest failed, cancelled, or interrupted run again, in a new conversation. Add `--occurrence <occurrence-id>` to choose an earlier run from `tasks show`. Resume a paused task before you retry it.

Poppet never retries a failed run by itself.

## When your provider has problems

If your provider says you are out of quota, Poppet pauses every scheduled task that uses that provider. `poppet worker status` shows the pause. There is no command to lift it yet.

For other temporary provider errors, Poppet waits 30 seconds before the next scheduled run, and doubles the wait after each further error, up to five minutes.

## Remove tasks

Remove one task and its history:

```sh
poppet tasks remove <task-id>
```

Remove every task and all task history:

```sh
poppet tasks clear
```

`tasks remove` refuses a running task, so cancel it first. `tasks clear` stops any running task first. Neither command deletes your conversations or saved facts. Removing a task cannot be undone.
