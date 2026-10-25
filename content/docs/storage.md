+++
title = "Storage"
description = "Find local data, check the database, and understand what is saved and how interrupted work is handled."
+++

# Storage

Poppet keeps everything in your data directory, which defaults to `~/.config/poppet`. Set `POPPET_DATA_DIR` to use another one. Each data directory has its own configuration, credentials, database, and logs.

```text
config.json       settings
profile.md        your profile (you write it)
soul.md           Poppet's personality (you write it)
skills/           your skill files
auth/             provider and search credentials
channels/         Discord settings and bot token
store/            conversations, facts, tasks, and search index
logs/             worker log
```

Check the database at any time:

```sh
poppet store status
```

This opens the database, applies any pending upgrades, and prints its path, schema version, and counts of sessions, messages, and runs. It needs no model or login. To try Poppet in a separate directory, set `POPPET_DATA_DIR` to a temporary path first.

## What is saved

- **Conversations.** Each session keeps its provider, model, and workload. Messages are kept in order, with their tool calls and results. Each run is saved as it starts, then marked as completed, failed, or interrupted.
- **Facts.** Every change is kept as a revision with where it came from. `poppet memory history` shows them.
- **Tasks.** Each run keeps the task settings it used. Changing a task later does not change earlier runs. Clearing tasks removes their run history, but keeps chats and queued replies.
- **Skills.** A session or task keeps a copy of the skill it selected.
- **Search index.** Your messages and Poppet's final answers are indexed for `chat search`. Failed input and tool results are not indexed.

Credentials are kept in `auth/` and never in the database.

## Upgrades

Each part of the database upgrades itself when Poppet starts. Poppet refuses a database made by a newer version, or by a different application, and it does not reset anything automatically. If that happens, point `POPPET_DATA_DIR` at a fresh directory or restore a backup.

## Permissions

The store directory is `0700`, and the database files are `0600`. Credentials are kept in `auth/`, which has the same protection.

## Interrupted work

If Poppet stops in the middle of a run, the run is marked as interrupted with a reason. Poppet does not replay it. Send the message again yourself if you still need the answer.

Only one Poppet process can use a data directory at a time. If a process crashes, the next one takes over automatically, even if the old process ID has been reused. Do not delete the `.lock.sqlite` files while Poppet is running. They contain no credentials, and they can stay in place after you log out.

## Back up

Stop any running worker first: press Ctrl-C in its terminal, or run `poppet worker stop` if it runs at login. Then copy the whole data directory:

{{< shell >}}
```bash
cp -R ~/.config/poppet ~/Backups/poppet-$(date +%F)
```

```fish
cp -R ~/.config/poppet ~/Backups/poppet-(date +%F)
```
{{< /shell >}}

Start the worker again when the copy finishes.

Keep the copy private. It contains your conversations and credentials.
