+++
title = "Storage"
description = "Inspect local data, understand saved records, and recover from interrupted work."
next = "/docs/troubleshooting"
+++

# Storage

Conversations, task results, and facts you save live in your local data directory. Use the status command below to inspect the database without contacting a model provider.

Open or inspect the local database:

```fish
bun run start store status
```

This opens `<POPPET_DATA_DIR>/store/poppet.sqlite`, applies any pending upgrades, and prints
its path, schema version, and session, message, and run counts. It needs no login or selected
model. Help, configuration, and auth commands do not open the database. To try things in a
separate directory:

```fish
set -lx POPPET_DATA_DIR /tmp/poppet-storage-test
bun run start store status
```

## What is saved

- **Conversations:** sessions, messages in order, and each run's state, output, usage, and failure.
- **Tool records:** every tool call and its result, so `chat show` can explain what happened.
- **Facts:** the facts you saved with `memory`, in global and project scopes.
- **Learned skills:** procedures Poppet saved itself, with their revision history, when learned skills are on.
- **Tasks:** definitions, occurrences, results, skipped intervals, and monitoring decisions.
- **Snapshots:** the skill and project instructions a session or task was created with. Later
  edits to those files do not change them.
- **Messaging:** inbox entries, the delivery queue, and polling progress for each service.

Saved data stays on your computer. Credentials are kept in the separate `auth` directory, and
channel settings in `channels`.

## Permissions

The store directory is `0700`. The database and its temporary write-ahead files are `0600`.

## Upgrades

Poppet applies database upgrades automatically when it opens the store. Each upgrade runs in one
transaction, so a failed upgrade is rolled back. Upgrades never reset your data. A database created
by an older build that Poppet no longer recognizes needs a new data directory.

## Ownership and recovery

Only one process can own the store at a time. Commands go through a running worker, so they share
its connection. A process that crashed releases its ownership, and the next Poppet process takes
over automatically. Do not delete the `store/owner.lock.sqlite` file while Poppet is running.

When the store reopens after a crash or a forced stop, any run that was still in progress is marked
as interrupted, with the reason `process-exit`. Poppet does not replay interrupted runs, tool calls,
or writes. Check the file, note, or external service first, then ask again if you still need the result.

## Temporary files

Raw PDF and audio files from messaging attachments are written to `<data directory>/attachment-tmp`
in private folders, and they are removed when processing finishes, fails, or is cancelled. Startup
removes any folders left behind by an interrupted run. The extracted text and transcripts are kept
with the conversation, even after the raw files are gone.
