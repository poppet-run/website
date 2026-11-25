+++
title = "Storage"
description = "Find local data, check the database, and understand what is saved and how interrupted work is handled."
+++

# Storage

Poppet keeps everything in your data directory, which defaults to `~/.config/poppet`. Set `POPPET_DATA_DIR` to use another one. Each data directory has its own configuration, credentials, database, and logs.

```text
config.json       settings
web.json          optional web chat listener and access-key hash
profile.md        your profile (you write it)
soul.md           Poppet's personality (you write it)
skills/           your skill files
auth/             provider, search, and MCP credentials
channels/         Discord and Slack tokens; Telegram settings and token
store/            conversations, facts, tasks, and search index
logs/             worker log
```

Check the database at any time:

```sh
poppet store status
```

This opens the database, applies any pending upgrades, and prints its path, schema version, and counts of sessions, messages, and runs. It needs no model or login. To try Poppet in a separate directory, set `POPPET_DATA_DIR` to a temporary path first.

## What is saved

- **Conversations.** Each session keeps its provider and model. Messages are kept in order, with their attachments, tool calls, and results. Poppet saves each run as it starts, then marks it completed, failed, or interrupted.
- **Facts.** Every change is kept as a revision with where it came from. `poppet memory history` shows them.
- **Tasks.** Each run keeps the task settings it used. Changing a task later does not change earlier runs. A recurring task can also save an end time; existing tasks have none. Ending a task keeps its history. Each task can keep a [note between runs](tasks.md#keep-a-note-between-runs), with a history of changes and the occurrence or CLI clear that made each change. Existing tasks start without a note. Clearing tasks removes their run and note history, but keeps chats and queued replies.
- **Skills.** A session or task keeps a copy of the skill it was given. A skill named with `$name` is saved with that user message, including its name and full text. Later turns replay that saved copy.
- **Search index.** Your messages and Poppet's final answers are indexed for `chat search`. Failed input and tool results stay out of the index.

Assistant messages also keep provider continuation data, including any readable or encrypted reasoning the provider returned. Readable reasoning is saved even when [`chat.logReasoning`](configuration.md#reasoning-and-timing-logs) is off; that setting controls diagnostic logging.

Provider, search, and MCP credentials are kept in `auth/`. Discord and Slack tokens and all Telegram settings are kept in `channels/`. These credentials are not stored in the database.

Reviewed MCP calls save their review decision before dispatch, including any owner approval. Calls interrupted during review remain interrupted. Calls interrupted after dispatch may have had effects and are recorded as uncertain. Existing calls have no review metadata. Inspect them with `poppet chat show <session>` or `poppet tasks show <task-id>` before requesting a retry.

## Session deletion

[Delete or prune sessions](chat.md#delete-old-sessions) to remove their messages, attachments, tool calls, runs, and search entries. Poppet removes these records together in one database transaction.

Task occurrences and notes stay saved, but lose links to the removed sessions and runs. Saved facts and their revisions keep their values and origins without a source run ID. Discord and Slack thread bindings and web chat submission receipts for the deleted sessions are removed. The next message in an affected thread starts a new session.

Deletion applies pending task, gateway, memory, and web chat database upgrades before removing records, even if those parts of Poppet have not started since an upgrade.

## Upgrades

Each part of the database upgrades itself when Poppet starts. Poppet refuses a database made by a newer version, or by a different application, and it never resets anything on its own. If that happens, point `POPPET_DATA_DIR` at a fresh directory or restore a backup.

Sessions also record where they started for the [web sidebar](web-chat.md#filter-conversations): a chat, scheduled task, or gateway. New sessions keep that origin through renames, task deletion, and gateway thread resets. Existing sessions are classified from saved task and gateway history during upgrades. If no evidence of a task or gateway origin remains, an older session appears under **Chats**.

## Permissions

The store directory is `0700`, and the database files are `0600`. The `auth/` and `channels/` directories use `0700`, and their credential files use `0600`. Credential reads reject files or directories accessible to other users instead of silently tightening their permissions. Credentials must be regular files owned by your user, without symbolic or hard links. Saved API-key files are limited to 64 KiB.

Configuration writes reject a data directory that is a symbolic link, belongs to another user, or allows group or world writes. See [memory](memory.md#limits) for profile and personality file requirements.

## Interrupted work

If Poppet stops in the middle of a run, it marks the run as interrupted, with a reason. Poppet does not replay it. Send the message again yourself if you still need the answer.

Only one Poppet process can use a data directory at a time. If a process crashes, the next one takes over, even if the old process ID has been reused. Do not delete the `.lock.sqlite` files while Poppet is running. They contain no credentials, and they can stay in place after you log out.

## Back up

Stop any running worker first. Press Ctrl-C in its terminal, or run `poppet worker stop` if it runs at login. Wait for any foreground chats or other commands to finish, then copy the whole data directory. These commands use the default location; replace it with your `POPPET_DATA_DIR` if set:

{{< shell >}}
```bash
mkdir -p ~/Backups
cp -R ~/.config/poppet ~/Backups/poppet-$(date +%F)
```

```fish
mkdir -p ~/Backups
cp -R ~/.config/poppet ~/Backups/poppet-(date +%F)
```
{{< /shell >}}

Start the worker again when the copy finishes.

Keep the copy private. It contains your conversations and credentials.
