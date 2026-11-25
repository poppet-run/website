+++
title = "Worker"
description = "Run scheduling and messaging in the foreground or at login on macOS or Linux with systemd, and inspect status and logs."
+++

# Worker

The worker runs scheduled tasks, handles messaging, and serves [web chat](web-chat.md) when `web.json` is configured. Start it in a terminal and leave that terminal open. Use a second terminal to check task results or the connection. Terminal chat also works without a worker.

## Foreground modes

Start scheduling and configured messaging adapters:

```sh
poppet worker run
```

Web replies continue when you close the browser. Use Stop in web chat to cancel a reply. Stopping the worker interrupts unfinished replies.

The worker starts your enabled [MCP tool servers](mcp.md) when they are needed, and stops them when it shuts down. Restart the worker after you change their configuration.

Commands such as `chat`, `memory`, `tasks`, and `store status` go through a running worker. When no worker is running, they run locally. Reading saved data needs no model or login.

Only one worker can run for a data directory at a time. Stopping the worker cancels active requests. After a crash, the next worker takes over and marks unfinished work as interrupted. Queued work survives a restart, but Poppet does not repeat an interrupted request on its own. Run it again yourself if you still need it.

## Login startup

On macOS or Linux with systemd, stop any foreground worker, then install a user service. It starts `worker run` at login and keeps it running while you are logged in. macOS uses a LaunchAgent; Linux uses a systemd user unit:

```sh
poppet worker install
poppet worker status
poppet worker logs
```

Save your provider, model, and other settings in `config.json` before you install. The worker reads that file when it starts. After you change settings, run `poppet worker restart`.

Keep the checkout and the Bun executable where they are. If you move either, run `poppet worker uninstall` and then `poppet worker install` again. Each data directory has its own service, so use the same `POPPET_DATA_DIR` for every command.

The service does not hold API keys. Save them first with `poppet provider login openrouter` or `poppet provider login opencode-go`. ChatGPT uses its own protected sign-in. Installing does not check live inference.

Older installations may have settings saved in the LaunchAgent. Move the ones you want to keep into `config.json`, then run `poppet worker uninstall` and `poppet worker install` once. Older installations that run `tasks work` need the same reinstall to run `worker run`. Saved data and credentials are kept.

`worker stop`, `worker uninstall`, and `worker logs` still work if `config.json` is invalid, so you can stop the worker and read its logs.

## Status and logs

```sh
poppet worker status
poppet worker logs
```

`worker status` shows whether the login service is installed and active, whether the worker responds, its process ID, the active run, task counts, the next scheduled time, provider pauses, and recent outcomes. Messaging connection and queue details are under `worker.messaging`. It works for a foreground worker too. The `service` field is `null` on platforms without login startup.

Connection details shown by `worker status` are not a live check of your provider.

The worker writes lifecycle logs to `<data directory>/logs/worker.log`. The directory is `0700` and the file is `0600`. Default lifecycle logs leave out prompts, model output, and tokens. Enabling [`chat.logReasoning`](configuration.md#reasoning-and-timing-logs) also records readable model reasoning for runs other than streaming terminal chat, which can contain private prompt or tool content. Each log file is limited to 5 MiB, and three archives are kept. `worker logs` prints the last 64 KiB across them.

Worker lifecycle diagnostics use one plain logfmt line per entry on standard error, including when `worker run` runs in a terminal. Each line starts with `time`, `level`, and `msg`, followed by fields for that event. Values containing spaces, quotes, backslashes, or `=` are JSON-quoted; newlines are escaped.

```text
time=2099-10-29T09:00:00.000Z level=info msg="task occurrence finished" task=<task-id> name=Summary occurrence=<occurrence-id> status=completed
```

Filter saved logs by level, message, or identifier:

```sh
poppet worker logs | grep 'level=error'
poppet worker logs | grep 'msg="task occurrence'
poppet worker logs | grep 'session=<session-id>'
```

Common fields include `task`, `occurrence`, `session`, `run`, `provider`, `adapter`, `server`, `reason`, and `error`. Reasoning entries use `msg=thinking` and put the chunk in `text`. Timing entries use `msg=timing` with `stage` and `duration_ms`.

Scripts that read worker output should use these fields. Startup now reports `msg="worker started"` on stderr instead of the previous `Worker running.` message on stdout.

## Stop, start, and uninstall

```sh
poppet worker stop
poppet worker start
poppet worker restart
poppet worker uninstall
```

`stop` stops the worker until you start it again or log in, and keeps login startup. `uninstall` removes login startup. Neither command deletes tasks, results, facts, credentials, or logs. Starting a worker that is already running does not interrupt its active request. `restart` interrupts active work and reloads the installed worker with current code and settings. Accepting the restart prompt in `poppet setup` restarts the active installed worker in one service-manager operation.

## Concurrent requests

CLI and web chats, Discord, Slack, and Telegram conversations, and scheduled runs share `chat.maxConcurrentRequests` slots, with a default of 3. Different sessions can run at the same time, while requests in one session stay in order. A CLI request to a session already in use waits for its turn. Cancelling one conversation does not cancel another.

A run waiting for command approval keeps its slot for up to two minutes. Set the limit to 1 to process one request at a time. See [configuration](configuration.md#settings).

## Chat while the worker runs

Chat, memory, saved sessions, and `store status` all work while the worker is running:

```sh
poppet memory set project.name Acorn
poppet chat new "What is the project called?"
poppet chat interactive
poppet chat search "project"
poppet store status
```

Chats started from your terminal use your current `config.json` settings. Ctrl-C cancels the request you are waiting on, and the worker keeps running. Memory changes apply from the next run. Chat output stays in your terminal and is not written to the worker log.

After you update Poppet, run `poppet worker restart`, so the worker runs the new code.

## Sleep and missed runs

The worker does not keep your computer awake. After sleep, an overdue one-off task runs once. A recurring task runs its most recent missed time once, if that time is within `tasks.catchUpMinutes`, which defaults to 60 minutes. Earlier missed times are skipped. Poppet never replays failed or interrupted requests on its own.

## Linux and systemd

The user unit lives in `$XDG_CONFIG_HOME/systemd/user`, or `~/.config/systemd/user` when that variable is unset or relative. Installation enables and starts it immediately. `worker stop` stops the unit but leaves it enabled for the next login. `worker uninstall` disables it and removes its file.

The systemd user manager normally stops after your last login session ends. To keep the worker running after logout, enable lingering once:

```sh
loginctl enable-linger
```

Worker commands need access to your systemd user manager. Run them from a login session. If `systemctl --user` cannot connect, `worker status` reports it. Launcher startup errors are in the journal; worker output stays in `worker.log`:

```sh
journalctl --user -u 'run.poppet.worker.*'
```

On platforms without login startup, run `poppet worker run` in a terminal.
