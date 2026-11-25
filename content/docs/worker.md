+++
title = "Worker"
description = "Keep Poppet running in the background for scheduled tasks, messaging, and web chat."
+++

# Worker

The worker is the part of Poppet that keeps running in the background. It runs [scheduled tasks](tasks.md), answers [Discord and Slack](gateways/_index.md) messages, and serves [web chat](web-chat.md). Terminal chat works without it.

You can run the worker in a terminal window, or have it start each time you log in.

## Run the worker in a terminal

```sh
poppet worker run
```

Leave this terminal open. The worker stops when you close it or press Ctrl-C. Use a second terminal for other commands.

Only one worker can run at a time for each data directory. Stopping the worker cancels any answers it is working on. Poppet does not repeat them when it starts again, so send them again if you still need them.

## Start the worker at login

On macOS, and on Linux with systemd, the worker can start each time you log in and keep running in the background. Stop any worker running in a terminal, then install it:

```sh
poppet worker install
poppet worker status
```

`poppet setup` offers to do this for you.

The worker reads `config.json` when it starts, so save your provider and model first. After you change settings, restart it:

```sh
poppet worker restart
```

The worker runs from the folder you installed Poppet in, using your current Bun. If you move either, run `poppet worker uninstall` and then `poppet worker install` again.

The background worker cannot see API keys set in your shell. Save your key with `poppet provider login` before you install. ChatGPT sign-in is saved automatically.

If you installed the worker with an older version of Poppet, uninstall and install it again once. If you saved settings during the old install, move them into `config.json` first.

## Stop, start, and remove

```sh
poppet worker stop
poppet worker start
poppet worker restart
poppet worker uninstall
```

| Command | What it does |
| ------- | ------------ |
| `worker stop` | Stops the worker until you start it again or next log in |
| `worker start` | Starts the installed worker, if it is not already running |
| `worker restart` | Restarts the worker with your current settings, cancelling any answers in progress |
| `worker uninstall` | Stops the worker and stops it starting at login |

None of these delete your tasks, results, facts, credentials, or logs.

## Check status and logs

```sh
poppet worker status
poppet worker logs
```

`worker status` shows whether the worker is installed and running, what it is working on, how many tasks are waiting, when the next one is due, and any paused providers. It also shows whether Discord and Slack are connected. It works for a worker in a terminal too.

`worker logs` shows the end of the worker's log, `logs/worker.log` in your data directory. The log records when tasks start and finish, connection problems, and errors. It does not include your messages or Poppet's answers, unless you turn on [reasoning logs](configuration.md#reasoning-and-timing-logs).

To find problems, search the log for errors, or for a task or session ID:

```sh
poppet worker logs | grep 'level=error'
poppet worker logs | grep '<task-id>'
```

`worker stop`, `worker logs`, and `worker uninstall` still work when `config.json` has a mistake in it.

## Use Poppet while the worker runs

Chat, memory, and task commands keep working while the worker runs. They go through the worker and count toward its limit of [simultaneous answers](#simultaneous-answers). Terminal chats still use your current `config.json` settings.

```sh
poppet memory set project.name Acorn
poppet chat new "What is the project called?"
poppet chat interactive
```

Ctrl-C cancels your own answer and leaves the worker running.

After you update Poppet, run `poppet worker restart` so the worker uses the new version.

## Simultaneous answers

Poppet answers up to 3 conversations at once, across the terminal, web chat, Discord, Slack, and scheduled tasks. Messages in the same conversation are answered in order. Cancelling one conversation does not affect the others.

To change the limit, set [`chat.maxConcurrentRequests`](configuration.md#settings) from 1 to 8 and restart the worker. An answer waiting up to two minutes for your approval keeps its place while it waits.

## Sleep and missed tasks

The worker does not keep your computer awake. When your computer wakes, the worker runs a missed one-off task once. A repeating task runs its most recent missed time once, if it was missed by 60 minutes or less. See [missed runs](tasks.md#missed-runs).

## Linux with systemd

The worker installs as a systemd user service in `~/.config/systemd/user`, and starts straight away. `worker stop` stops it until your next login. `worker uninstall` removes it.

systemd normally stops your services when you log out. To keep the worker running after you log out, run this once:

```sh
loginctl enable-linger
```

Run worker commands from a normal login session, so they can reach systemd. If the worker fails to start, check systemd's log:

```sh
journalctl --user -u 'run.poppet.worker.*'
```

On other systems without login startup, run `poppet worker run` in a terminal.
