+++
title = "Scheduled tasks"
description = "Schedule prompts, inspect results, and edit, pause, snooze, or run saved tasks."
+++

# Scheduled tasks

Run a prompt once at a future time, or repeat it on a schedule. Tasks run while a [worker](worker.md) is running, and you read their results with `tasks show`. Connect a provider through [getting started](getting-started.md) first.

## Create and inspect a task

Each task saves the provider and model from `config.json` when you add it. The worker uses those saved choices even if you change `config.json` later.

For a quick test, schedule a task one minute from now and start the worker:

```fish
poppet tasks add summary --in 1m "Summarize my recent conversations"
poppet worker run
```

`--in` accepts a positive whole number followed by `s`, `m`, `h`, or `d`. A day means 24 elapsed hours. Use exactly one schedule form: `--in`, `--at`, or `--cron` with `--tz`.

The worker prints a line when a task starts, finishes, fails, is cancelled, or is skipped. Failures show a reason code. Prompts and answers go to the saved results, not the console.

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

One-off times need `Z` or a UTC offset, such as `2099-10-22T09:00:00+01:00`. Recurring schedules keep the same local time across daylight saving changes. A time that a change skips moves forward, and a time that happens twice runs once.

Each run starts a fresh session. It has the current profile, saved facts, conversation search, page reading, and web search if it is set up. Scheduled runs cannot change memory, and they cannot manage tasks.

## Edit and control the next run

Edit a task without changing its ID or losing its history:

```sh
poppet tasks edit <task-id> --name "Morning review"
poppet tasks edit <task-id> --prompt "Summarize open decisions from recent conversations."
poppet tasks edit <task-id> --cron "30 8 * * 1-5" --tz Europe/London
poppet tasks edit <task-id> --at 2099-10-22T09:00:00+01:00
poppet tasks run <task-id>
```

Ask in chat to skip or snooze the next run. These actions have no CLI command. A snooze must end later than the next run's current ready time.

An edit changes only the fields you give. A new schedule needs both a cron expression and a timezone, and a new one-off time must be in the future with a UTC offset. Provider, model, skill, and destination stay the same. You can edit a paused task without resuming it.

| Control     | What it does                                                                                                                               |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Skip via chat | Skips the next run only. A recurring task keeps its schedule. A one-off task has no later run.                                            |
| Snooze via chat | Delays the next run until a later time. Cron times missed during the snooze do not run later.                                             |
| `tasks run` | Queues a normal run now, without changing the schedule. It confirms that the run is queued, not that it finished.                          |

A name or prompt change replaces a run that has not started yet, and the original run stays in `tasks show` as cancelled. A schedule change cancels pending work and works out the next future time. Editing a finished one-off's name or prompt does not run it again. Give it a new future time to run it again.

## Manage tasks from chat

Ask Poppet in chat or in a Discord or Slack thread to create, list, inspect, edit, delete, pause, resume, skip, snooze, or run a task:

```text
Every Friday at 09:00 Europe/London, summarize my recent conversations and deliver the result here.
List my scheduled tasks.
Pause task <task-id>.
```

Poppet asks when a time, timezone, or task is unclear. Pausing and resuming use task IDs, so Poppet asks you to choose when names match. Deletion removes the task and its history, and fails while a run is active. Retrying runs and cancelling active runs stay in the CLI.

A task change is saved even if the chat reply fails afterwards. Check `tasks list` or `tasks show` before asking again.

## Deliver results to Discord

Set up [Discord](gateways/discord.md), start the combined worker with `poppet worker run`, and send results to your home channel:

```sh
poppet tasks add daily-summary --cron "0 9 * * *" --tz Europe/London --to discord "Summarize my recent conversations"
```

Use `--to discord:<channel-or-thread-id>` instead to send results to another channel or thread in your server. The worker checks access before saving the task, and it checks again before each send. A result never goes to a different conversation from the one you chose.

Completed results and failure notices are sent to the saved destination. `tasks show` lists each message's delivery state. Poppet retries temporary failures a limited number of times. Failed or uncertain sends stay visible, and Poppet does not resend an uncertain one. Check the saved output before posting it again by hand.

Results and failure notices are standalone posts. They do not change the conversation they were posted to.

Tasks without a destination keep their results local.

### Stay quiet when there is nothing to report

Make the prompt conditional, for example "Tell me only if the page changed." Scheduled runs are instructed to answer with exactly `NO_REPLY` when the condition is not met. When the whole answer is `NO_REPLY`, ignoring surrounding whitespace, Poppet posts nothing. An answer that mentions `NO_REPLY` alongside other text is delivered as usual.

The occurrence still completes. The worker logs `completed no-action`, and `poppet tasks show <task-id>` shows `no action` in the delivery column. JSON output includes `noAction: true`, and the saved output remains available. This also applies to tasks without a messaging destination.

### Failure notices

When a task with a destination fails, Poppet queues a short notice there:

```text
Scheduled task "<name>" failed (<reason code>). Inspect it with: poppet tasks show <task-id>
```

The notice includes the task name and reason code, never model output or error text. The reason is `before-start` if the task failed before a run existed, or `unknown` if the run has no saved reason. Read the details with `poppet tasks show <task-id>` before retrying.

If the task's previous finished occurrence also failed, the new failure posts nothing. A failure after a success posts again. Failures that finished more than 24 hours ago are not queued. Interrupted, cancelled, and expired occurrences post nothing.

Notices use the same destination checks and delivery retries as results. In the `delivery` array from `tasks show`, a notice has a run ID of `notice:<occurrence-id>:<finished-at>`. A failure notice does not change the recurring schedule.

## Deliver results to Slack

Set up [Slack](gateways/slack.md) and run the combined worker. Use `--to slack` for its home channel, `--to slack:C123` for another channel, or `--to slack:C123:1730000000.000001` for a thread. Replace the IDs and timestamp with your destination. The same access checks, quiet completion, failure notices, and delivery retries described above apply to Slack.

## Choose a skill

Add `--skill <name>` before the prompt to save a [skill](skills.md) with a new task. Each run uses the copy saved with the task. To use an edited skill, create a new task. Scheduled prompts do not expand `$name` mentions. You can select a manual-only skill with `tasks add --skill`; the model cannot select one when creating a task in chat.

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

Search errors return a failed tool result for the model to explain or handle within the run limits. They do not automatically retry or pause the provider.

## Missed runs, pauses, and retries

The worker runs one task at a time. The worker skips a recurring time that passes while it is stopped. If it was only briefly unavailable, it runs the most recent missed time once, as long as that time is within `tasks.catchUpMinutes`. The default is 60 minutes. An overdue one-off runs once. A recurring task has at most one pending or running run. Other due times are recorded as skipped.

Pending recurring runs expire after 24 hours. One-off runs do not expire.

To cancel a run that is pending or running, or to retry a failed one:

```sh
poppet tasks cancel <task-id>
poppet tasks retry <task-id>
```

Cancel selects the task's pending or active run. If neither exists, it fails without changing the schedule. Retry selects its latest occurrence and fails if that occurrence succeeded or is active. Add `--occurrence <occurrence-id>` to either command to select a specific occurrence belonging to the task. Restart an older worker after upgrading to these task-based commands.

A quota failure pauses scheduled runs for that provider indefinitely. The CLI has no command to clear a quota pause. Inspect provider pauses with `poppet worker status`. Temporary and rate-limit failures delay later runs by 30 seconds, doubling after each failure up to five minutes. Poppet never retries a failed run on its own. `retry` starts a fresh session for it. Resume a paused task before retrying it.

## Remove a task

```fish
poppet tasks remove <task-id>
```

This permanently removes one task and its history, including pending work. Conversations and runs remain saved. Cancel an active run first.

## Clear tasks

To remove every task and its run history:

```sh
poppet tasks clear
```

This works whether the worker is running or stopped. An active run is stopped first. Chat sessions, facts, credentials, and provider pauses are kept.

