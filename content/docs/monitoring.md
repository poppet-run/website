+++
title = "Monitoring"
description = "Check a source on a recurring schedule and report changes to a specific value."
source = "tasks.md"
next = "/docs/worker"
+++

# Report changes in a source

A monitor checks a value on a recurring schedule and reports changes. The first successful check saves the value without sending an alert. Use a [scheduled task](tasks.md) if you want a report every time.

## Before you start

Connect a provider through [getting started](getting-started.md) and choose a model that supports tools. If you updated Poppet with a worker running, restart it. Each check uses your model provider's quota.

Choose a small source with a consistently formatted value, such as a release tag in a plain-text file. A monitor must read the source. Search snippets alone are not enough, and scheduled work has no browser tools.

## Create a monitor

Replace the example URL with the public source you want to watch:

```fish
bun run start tasks add release-watch --monitor --cron "0 9 * * *" --tz Europe/London "Read https://example.com/releases.txt and report the latest stable release tag exactly as published. Ignore prereleases and publication timestamps."
```

The example URL is a placeholder. Replace it before running the command. The schedule checks your source every day at 09:00 in Europe/London. Always specify a timezone and tell Poppet which value to read and how to format it.

Without a destination, results stay local. To receive changes in a messaging service, configure it first and add its [destination option](tasks.md#deliver-results-to-discord) when creating the task.

## Run and inspect checks

Keep the combined worker running:

```fish
bun run start worker run
```

In another terminal, inspect the task using the ID returned when you created it:

```fish
set task_id 'paste-task-id-here'
bun run start tasks show $task_id
```

After the scheduled time, check `lastObservation`, the occurrence's `monitoring` decision, and any failure or delivery state. The first successful check saves the baseline without a change alert.

Check status even when you receive no alerts. A failed check keeps the previous baseline and sends no failure notification. The model can misread the value, and formatting differences can trigger false alerts. Changes between checks can go unnoticed.

## Change or pause a monitor

```fish
bun run start tasks pause $task_id
bun run start tasks resume $task_id
```

Pausing preserves the baseline and does not cancel active work or queued alerts. Editing the prompt resets the baseline, so the next successful check sends no alert. Changing the name or schedule keeps the baseline.

See [task controls](tasks.md#edit-and-control-the-next-execution) for edits, snoozing, and running now, and the [monitoring reference](tasks.md#change-aware-monitoring) for evidence, retry, and delivery rules.
