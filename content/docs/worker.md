+++
title = "Worker"
description = "Run scheduling and messaging in the foreground or at macOS login, and inspect status and logs."
weight = 30
next = "/docs/troubleshooting"
+++

# Worker

The worker runs scheduled tasks and handles messaging. Start it with `bun run start worker run`, and leave the terminal open. Use a second terminal to check task results or connection status. Terminal chat also works without a worker.

Pick a [foreground mode](#foreground-modes) below, or set up [macOS login startup](#macos-login-startup). Run only one worker per data directory. Check [status and logs](#status-and-logs) after setup.

## Foreground modes

Choose one foreground mode for each data directory:

```fish
bun run start worker run    # Scheduling and messaging
bun run start tasks work    # Scheduling only
bun run start gateway work  # Messaging only
```

All three modes start the enabled [MCP servers](mcp.md) when a discovery or an agent run needs
them, and they stop them on shutdown. Restart the worker after you change a server's configuration,
or to reconnect a server that failed.

Commands such as `chat`, `memory`, `tasks`, and `store status` go through the worker while it is
running, and they run locally when it is stopped. Reading saved data needs no model or provider
credentials. Task commands still work in gateway-only mode, but no scheduled work runs. Task-only
mode does not start Discord or Telegram. `tasks status` shows which services the worker has
selected, and `gateway status` shows whether messaging is running.

Chat requests from the terminal share one runner with scheduled and messaging requests. Ctrl-C cancels
the request you are waiting on, and the worker keeps running. Stopping the worker interrupts active
requests. After a crash, the next worker takes over the data directory and marks unfinished work as
interrupted. Queued work survives a restart. Poppet does not repeat an interrupted request on its own,
so run it again yourself if you still need it.

## Browser resources

[Browser automation](browser.md) runs inside the process that owns the chat. Worker-backed CLI and
messaging chats each get their own browser. A configuration change needs a restart. Cancelling a chat
or stopping the worker closes its browser. Scheduled tasks get no browser tools.

## macOS login startup

On macOS, stop any foreground worker first. Then install a user LaunchAgent. It starts the combined
`worker run` host at login and keeps it running while you are logged in:

```fish
bun run start worker install
bun run start worker status
bun run start worker logs
```

Save your provider, model, notes directory, and chat-limit settings in `<data directory>/config.json`
before you install. See [configuration](configuration.md). Shell overrides apply to foreground commands
and workers. Installation does not save them for the background worker.

Installing starts the worker straight away. The LaunchAgent records the absolute Bun executable, the CLI
entry point, the current working directory, and `POPPET_DATA_DIR`. The worker reads `config.json` when
it starts. After you change settings, run `worker stop` and then `worker start`. Keep the checkout and
the Bun executable where they are. If you move either one, uninstall and install again. Each data
directory has its own LaunchAgent. Manage it with the same `POPPET_DATA_DIR`.

`worker stop`, `worker uninstall`, and `worker logs` use only the data directory. They keep working when
`config.json` is invalid, so you can still stop the worker and read its logs. `POPPET_DATA_DIR` must still
be valid.

Older installations saved regular settings and budget overrides in their LaunchAgent environment. Move
the settings you want to keep into `config.json`. Then run `worker uninstall` and `worker install` once to
remove the saved overrides. Until you do, those overrides still take precedence over the file. Saved data
and credentials are kept.

If an installation runs `tasks work`, run `worker uninstall` and then `worker install` once to update it
to `worker run`. Saved data and credentials are kept. Restarting the old installation on its own keeps
the saved command, which means it still runs scheduling only.

API keys are left out of the LaunchAgent's environment. Save them first with `auth login openrouter` or
`auth login opencode-go`. ChatGPT uses its own protected sign-in storage. The worker refreshes credentials
the same way chat does. Installing does not check live inference.

New installations use a background launcher to capture and rotate the worker's stdout and stderr.
Existing installations need `worker uninstall` and then `worker install` once to switch to this launcher.
Saved data, credentials, and logs are kept. Foreground commands still write to the terminal.

## Status and logs

`worker status` shows whether the LaunchAgent is installed and loaded, and whether the worker responds.
It also shows the PID, the active occurrence, the task and pending counts, the next scheduled time,
provider pauses, and the five most recent outcomes. It shows local connection details, along with the
account and plan-usage permission where they apply. It also offers actions for sign-in, consent, quota
resume, and failed work. Running and stopped status both include the providers assigned to saved tasks,
even when the CLI's default provider is different.

Connection details are not a live check of the provider. During a request that is using credentials, the
last observed details are labelled `cached` with the time they were observed. `tasks status` also works
with a foreground worker.

To read full task results, use the existing commands:

```fish
bun run start tasks list
bun run start tasks show <task-id>
```

Lifecycle logs go to `<data directory>/logs/worker.log`. The directory is `0700`, and the file is `0600`.
The logs leave out prompts, notes, model output, and tokens. The background launcher limits each new log
file to 5 MiB, and it keeps three archives: `worker.log.1` through `worker.log.3`, newest first. It appends
after a restart, and it rotates between writes. Symlinks, hard links, and files that are not regular files
are rejected.

`worker logs` prints at most the last 64 KiB across the current file and the archives. Reading the logs does
not rotate them. On shutdown, the launcher waits for the worker to exit, then closes the log. A worker that
has not exited after 25 seconds is killed, so it stays within launchd's exit limit. If logging fails, the
worker stops, rather than running without a record of what it did.

## Stop, start, and uninstall

```fish
bun run start worker stop
bun run start worker start
bun run start worker uninstall
```

Stopping removes the running launchd registration and sends SIGTERM. The worker interrupts active work,
records its outcome, and releases the data directory. `stop` keeps login startup configured. `uninstall`
turns it off, and it keeps tasks, results, notes, credentials, and logs. If inspecting the installation
fails, the command fails and the installed configuration stays as it is. Each launchctl call has a
35-second timeout. Starting a worker that is already loaded does not interrupt an active request.

## Interactive commands

Chat can [manage scheduled tasks](tasks.md#manage-tasks-through-chat) while the worker runs. A task change
is saved even if the final chat reply fails.

Chat, memory, session inspection, and `store status` all work while the worker runs:

```fish
bun run start memory remember project.name Acorn
bun run start chat new "What is the project called?"
bun run start chat interactive
bun run start chat sessions
bun run start chat search "project"
bun run start memory list
bun run start store status
```

New chats use the invoking terminal's provider, model, and workload. Continued chats use their saved
selection. The worker's notes directory and budgets apply to chats it handles, including the result limits
for conversation search. Search does not need a provider request. Memory changes load on the next run. Chat
output and session IDs go to the terminal you ran the command from. They are left out of worker logs.

After an update, run `worker stop` and then `worker start`, so the running worker uses the new code.

## Sleep and missed schedules

The worker does not keep the Mac awake. After sleep, an overdue one-off runs once. For a recurring task that
was delayed, the worker runs the earliest due occurrence once, and it records the later missed occurrences as
skipped. Summaries older than 24 hours expire. On restart, recurring work that was missed while the process
was stopped is skipped. Failed or interrupted requests are never replayed automatically.

## Running in the background on other systems

Background installation works on macOS only. On other systems, run `worker run` in the foreground.

## Titles and naming

Each new session gets a title after its first answer. The title request runs after the answer is printed, and it
shares the worker's model access with chat and scheduled runs. Stopping the worker can cancel that request, without
changing the completed answer or any provider pause.
