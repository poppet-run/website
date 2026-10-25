+++
title = "Scheduled tasks"
description = "Schedule prompts, inspect results, and edit, pause, snooze, or run saved tasks."
+++

# Scheduled tasks

Run a prompt once at a future time, or repeat it on a schedule. Tasks run while a [worker](worker.md) is running, and you read their results with `tasks show`. Connect a provider through [getting started](getting-started.md) first.

## Create and inspect a task

Each task saves the provider and model you select when you add it. The worker uses those saved choices even if you change `config.json` later.

For a quick test, schedule a task one minute from now and run the worker for scheduled work only:

{{< shell >}}
```bash
when=$(bun -e 'console.log(new Date(Date.now() + 60_000).toISOString())')
poppet tasks add summary --at "$when" "Summarize my recent conversations"
poppet worker run --tasks-only
```

```fish
set when (bun -e 'console.log(new Date(Date.now() + 60_000).toISOString())')
poppet tasks add summary --at $when "Summarize my recent conversations"
poppet worker run --tasks-only
```
{{< /shell >}}

The worker prints a line when a task starts, finishes, fails, is cancelled, or is skipped. Failures show a reason code. Prompts and answers are kept in the saved results, not the console.

Leave the worker running, then use a second terminal with the same `POPPET_DATA_DIR`:

```sh
poppet tasks list
poppet tasks show <task-id>
poppet tasks pause <task-id>
poppet tasks resume <task-id>
```

## Recurring schedules

Use a five-field cron expression and a timezone:

```sh
poppet tasks add daily-summary --cron "0 9 * * *" --tz Europe/London "Summarize my recent conversations"
```

One-off times need `Z` or a UTC offset, such as `2099-10-22T09:00:00+01:00`. Recurring schedules keep the same local time across daylight saving changes. A time that is skipped by a change moves forward, and a repeated time runs once.

Each run starts a fresh session. It has the current profile, saved facts, conversation search, page reading, and web search if it is set up. Scheduled runs cannot change memory, and they cannot manage tasks.

Pass `--coding` before the prompt only for coding work that your provider accepts.

## Edit and control the next run

Edit a task without changing its ID or losing its history:

```sh
poppet tasks edit <task-id> --name "Morning review"
poppet tasks edit <task-id> --prompt "Summarize open decisions from recent conversations."
poppet tasks edit <task-id> --cron "30 8 * * 1-5" --tz Europe/London
poppet tasks edit <task-id> --at 2099-10-22T09:00:00+01:00
poppet tasks skip-next <task-id>
poppet tasks snooze <task-id> --until 2099-10-22T10:00:00+01:00
poppet tasks run <task-id>
```

An edit changes only the fields you give. A new schedule needs both a cron expression and a timezone, and a new one-off time must be in the future with a UTC offset. Provider, model, skill, and destination stay the same. You can edit a paused task without resuming it.

| Command     | What it does                                                                                                                               |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `skip-next` | Skips the next run only. A recurring task keeps its schedule. A one-off task has no later run.                                            |
| `snooze`    | Delays the next run until a later time. Missed cron times during the snooze are not run later.                                             |
| `run`       | Queues a normal run now, without changing the schedule. It confirms that the run is queued, not that it finished.                          |

A name or prompt change replaces a run that has not started yet, and the original run stays in `tasks show` as cancelled. A schedule change cancels pending work and works out the next future time. Editing a finished one-off's name or prompt does not run it again. Give it a new future time to run it again.

## Manage tasks from chat

Ask Poppet in chat or in a Discord thread to create, list, inspect, edit, pause, resume, skip, snooze, or run a task:

```text
Every Friday at 09:00 Europe/London, summarize my recent conversations and deliver the result here.
List my scheduled tasks.
Pause task <task-id>.
```

Poppet asks when a time, timezone, or task is unclear. Pausing and resuming use task IDs, so Poppet asks you to choose when names match. Deleting tasks, retrying runs, cancelling active runs, and clearing provider pauses stay in the CLI.

A task change is saved even if the chat reply fails afterwards. Check `tasks list` or `tasks show` before asking again.

## Deliver results to Discord

Set up [Discord](gateways/discord.md), start the combined worker with `poppet worker run`, and send results to your home channel:

```sh
poppet tasks add daily-summary --cron "0 9 * * *" --tz Europe/London --channel discord "Summarize my recent conversations"
```

Add `--conversation <channel-or-thread-id>` to send results to another channel or thread in your server. The worker checks access before saving the task, and it checks again before each send. A result never goes to a different conversation from the one you chose.

Only completed results are sent. `tasks show` lists each message's delivery state. Temporary failures are retried with a limit. Failed or uncertain sends stay visible, and Poppet does not resend an uncertain one. Check the saved output before posting it again by hand.

Results are standalone posts. They do not change the conversation they were posted to.

Tasks without a destination keep their results local.

## Select a skill

Add `--skill <name>` before the prompt to save a [skill](skills.md) with a new task. Each run uses the copy saved with the task. To use an edited skill, create a new task.

## Read a web page

A task prompt can include a public URL, and the run can read it:

```sh
poppet tasks add page-summary --cron "0 9 * * *" --tz Europe/London "Summarize https://example.com/ and cite the source"
```

A URL mentioned only in a skill, an earlier conversation, or a fetched page does not give the task permission to read it.

## Research with web search

With [web search](web.md) set up, a prompt can ask for research without a URL:

```sh
poppet tasks add weekly-research --cron "0 9 * * 5" --tz Europe/London "Search for recent Bun releases, read relevant sources, and cite them"
```

Search errors fail that run. The task does not retry, and it does not pause the provider. Browser automation is not available to scheduled runs.

## Missed runs, pauses, and retries

The worker runs one task at a time. A recurring time that passes while the worker is stopped is skipped. If the worker was only briefly unavailable, it runs the most recent missed time once, within `tasks.catchUpMinutes` (60 minutes by default). An overdue one-off runs once. A recurring task has at most one pending or running run. Other due times are recorded as skipped.

Pending recurring runs expire after 24 hours. One-off runs do not expire.

To cancel a run that is pending or running, or to retry a failed one:

```sh
poppet tasks cancel <occurrence-id>
poppet tasks retry <occurrence-id>
poppet worker providers
poppet worker resume-provider openai-chatgpt
```

A quota failure pauses scheduled runs for that provider until you run `worker resume-provider`. Temporary and rate-limit failures delay later runs by 30 seconds, doubling after each failure up to five minutes. A failed run is never retried automatically. `retry` starts a fresh session for it. Resume a paused task before retrying it.

## Clear tasks

To remove every task and its run history:

```sh
poppet tasks clear
```

This works whether the worker is running or stopped. An active run is stopped first. Chat sessions, facts, credentials, and provider pauses are kept.

See [worker modes](worker.md#foreground-modes) to run scheduling with messaging.
