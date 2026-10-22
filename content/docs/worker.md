+++
title = "Worker"
description = "Run scheduling and messaging in the foreground or at macOS login, and inspect status and logs."
weight = 30
source = "worker.md"
next = "/docs/troubleshooting"
+++

# Worker

The worker runs scheduled tasks and handles messaging. Start it with `bun run start worker run` and leave the terminal open. Use a second terminal to inspect task results or connection status. Terminal chat also works without a worker.

Choose a [foreground mode](#foreground-modes) below or set up [macOS login startup](#macos-login-startup). Run only one worker per data directory. Check [status and logs](#status-and-logs) after setup.

{{% app-guide %}}
