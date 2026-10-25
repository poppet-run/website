+++
title = "Worker"
description = "Run scheduling and messaging in the foreground or at macOS login, and inspect status and logs."
+++

# Worker

The worker runs scheduled tasks and handles messaging. Start it in a terminal and leave that terminal open. Use a second terminal to check task results or the connection. Terminal chat also works without a worker.

## Foreground modes

Choose one mode for each data directory:

```sh
poppet worker run                 # Scheduling and messaging
poppet worker run --tasks-only    # Scheduling only
poppet gateway work               # Messaging only
```

The worker starts your enabled [MCP tool servers](mcp.md) when they are needed, and stops them when it shuts down. Restart it after changing their configuration.

Commands such as `chat`, `memory`, `tasks`, and `store status` go through a running worker. When no worker is running, they run locally. Reading saved data needs no model or provider credentials.

Only one worker can run for a data directory at a time. Stopping the worker cancels active requests. After a crash, the next worker takes over and marks unfinished work as interrupted. Queued work survives a restart, but Poppet does not repeat an interrupted request on its own. Run it again yourself if you still need it.

## Browser resources

[Browser automation](browser.md) runs inside the process that owns the chat. Each worker-backed chat gets its own browser. Restart the worker after changing browser settings. Scheduled tasks get no browser.

## macOS login startup

On macOS, stop any foreground worker, then install a user LaunchAgent. It starts `worker run` at login and keeps it running while you are logged in:

```sh
poppet worker install
poppet worker status
poppet worker logs
```

Save your provider, model, and other settings in `config.json` before you install. The worker reads that file when it starts. After you change settings, run `poppet worker stop` and then `poppet worker start`.

Keep the checkout and the Bun executable where they are. If you move either, run `poppet worker uninstall` and then `poppet worker install` again. Each data directory has its own LaunchAgent, so use the same `POPPET_DATA_DIR` for every command.

The LaunchAgent does not hold API keys. Save them first with `poppet provider login openrouter` or `poppet provider login opencode-go`. ChatGPT uses its own protected sign-in. Installing does not check live inference.

Older installations may have settings saved in the LaunchAgent. Move the ones you want to keep into `config.json`, then run `poppet worker uninstall` and `poppet worker install` once. Older installations that run `tasks work` need the same reinstall to run `worker run`. Saved data and credentials are kept.

`worker stop`, `worker uninstall`, and `worker logs` still work if `config.json` is invalid, so you can stop the worker and read its logs.

## Status and logs

```sh
poppet worker status
poppet worker logs
```

`worker status` shows whether the LaunchAgent is installed and loaded, whether the worker responds, its process ID, the active run, task counts, the next scheduled time, provider pauses, and recent outcomes. It works for a foreground worker too. On other systems, it shows `launchAgent` as `null`.

Connection details shown by `worker status` are not a live check of your provider.

The worker writes lifecycle logs to `<data directory>/logs/worker.log`. The directory is `0700` and the file is `0600`. Logs leave out prompts, model output, and tokens. Each log file is limited to 5 MiB, and three archives are kept. `worker logs` prints the last 64 KiB across them.

## Stop, start, and uninstall

```sh
poppet worker stop
poppet worker start
poppet worker uninstall
```

`stop` stops the worker until you start it again or log in, and keeps login startup. `uninstall` removes login startup. Neither command deletes tasks, results, facts, credentials, or logs. Starting a worker that is already running does not interrupt its active request.

## Chat while the worker runs

Chat, memory, saved sessions, and `store status` all work while the worker is running:

```sh
poppet memory remember project.name Acorn
poppet chat new "What is the project called?"
poppet chat interactive
poppet chat search "project"
poppet store status
```

Chats started from your terminal use your current `config.json` settings. Ctrl-C cancels the request you are waiting on, and the worker keeps running. Memory changes apply from the next run. Chat output stays in your terminal and is not written to the worker log.

After you update Poppet, run `poppet worker stop` and then `poppet worker start`, so the worker runs the new code.

## Sleep and missed runs

The worker does not keep your Mac awake. After sleep, an overdue one-off task runs once. A recurring task runs its most recent missed time once, if that time is within `tasks.catchUpMinutes`, which defaults to 60 minutes. Earlier missed times are skipped. Poppet never replays failed or interrupted requests on its own.

## Other systems

Background installation is macOS only. On other systems, run `poppet worker run` in a terminal.
