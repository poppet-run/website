+++
title = "Run commands"
description = "Let Poppet run shell commands on your computer, with a review before each one and your approval in Discord when it is needed."
+++

# Run commands

Poppet can run shell commands on your computer for chats, Discord threads, and scheduled tasks. Commands run as your user account, with its files, environment, and permissions. Poppet does not sandbox them, and it does not have root access or a sudo password.

Because of that, every command is reviewed before it runs.

## How review works

Before each command, a separate request to your current model reviews it against your message or the task's saved prompt. The reviewer sees only the command and that context. It has no tools and no chat history.

The reviewer returns one of three decisions:

- **Allow**: the command runs once, exactly as reviewed.
- **Needs approval**: a person must approve it first. In Discord, Poppet asks you there. A CLI command stops with instructions, and a scheduled task fails.
- **Deny**: the command does not run, and the run ends.

If the reviewer fails, times out, or returns an unreadable answer, nothing runs. A denied command cannot be retried within the same run.

Review is a model decision, so it can be wrong. It cannot predict what a script or file will do after it has been reviewed. Keep that in mind when you ask Poppet to run scripts.

## Approve commands in Discord

When a command needs approval, Poppet posts its exact command, working directory, timeout, and reason in the thread. Reply with the ID from that message:

```text
/approve <id>
/deny <id>
```

Only the owner can answer, in the same conversation. An approval covers that one command, with the same directory and timeout, and nothing else. Requests expire after two minutes, or when the run is cancelled or the worker restarts. Ask again to get a new review.

## Scheduled tasks

A scheduled task never waits for approval. If a command needs it, that run fails right away, and the worker logs a reason code. The details are kept in `poppet tasks show <task-id>`, and nothing is posted to the task's destination. The recurring schedule keeps running. Commands that finished before the failure are not undone, so check the machine before you retry.

Successful results still go to the task's destination.

## What a command gets

- A timeout from 1 to 300 seconds, set by the model for each command.
- A standard input that is closed, so a command cannot wait for typed input.
- The output from stdout and stderr, the exit code, and whether the output was cut short.
- Bash started without your shell profile.

A timeout or cancellation stops the command and its child processes. Poppet does not replay a command that was interrupted. To keep a service running, use your system's service manager, not `command &`.

## Limits

Poppet passes its own environment to commands, so they can read the same files and credentials you can. Only allow commands you would run yourself, and avoid storing secrets where a command could read them.
