+++
title = "Doctor"
description = "Check your Poppet setup for problems without changing anything."
+++

# Doctor

`poppet doctor` checks your setup and tells you what to fix. It only looks. It never changes files, contacts your provider, or sends messages.

```sh
poppet doctor
```

Doctor groups its results under Needs attention, Could not check, Passed, and Skipped. Each problem comes with a suggested next step. Read a suggested command before you run it, since it can change things that doctor itself does not.

## What doctor checks

| Check | What it looks at |
| ----- | ---------------- |
| Installation | Whether your data directory exists |
| Configuration | Whether `config.json` is valid |
| Provider sign-in | Whether you are signed in to your provider, or have an API key set |
| Background service | Whether the worker is installed to start at login |
| Worker connection | Whether the worker is running and responding |
| Worker configuration | Whether the worker is using different settings from `config.json`, so it needs a restart |
| Scheduled tasks | Tasks that failed or were interrupted in the last 24 hours, and when the next one is due |
| Paused provider work | Providers Poppet has paused for scheduled tasks, and when they resume |
| Message delivery | Gateway posts that are waiting, failed, or uncertain |
| Messaging connections | Whether a gateway reported a connection problem |
| MCP servers | Whether your MCP servers are set up correctly and their programs exist |
| Context files | Whether `profile.md` and `soul.md` are valid and under 8 KiB |

Doctor skips checks for features you have not set up. Running the worker in a terminal is fine, so doctor skips the login check if you have not installed it.

## Could not check

Some checks need the worker. If the worker is not running, doctor reports them under Could not check. This does not mean anything failed. Start the worker with `poppet worker run` or `poppet worker start`, then run doctor again.

## What doctor cannot tell you

Doctor does not send a request to your provider, start MCP servers, or post to gateways. A clean report means your settings look right, not that everything works. To confirm, send a message with `poppet chat new`.

For gateway problems, also check `poppet worker status` and `poppet worker logs`.

## Use doctor in a script

`poppet doctor --json` prints the same results as JSON. The exit code tells you the overall result:

| Exit code | Meaning |
| --------- | ------- |
| `0` | No problems found |
| `1` | At least one problem to fix |
| `2` | At least one check could not finish |

Each check in the JSON has an `id`, a `status` of `ok`, `warning`, `error`, or `skipped`, and `incomplete` when it could not finish. Use these fields in scripts. The `message` text is for people and may change.
