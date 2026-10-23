+++
title = "Notes"
description = "Read, search, and save files in a notes directory you choose."
next = "/docs/memory"
+++

# Notes

Give Poppet a directory of plain-text notes, then ask it to find or summarize them. Saving a note can replace an existing file, so name the destination you want in your request.

`read_note`, `search_notes`, and `save_note` work only inside `POPPET_NOTES_DIR`. Use UTF-8
`.md`, `.markdown`, or `.txt` files. Relative paths are preferred. Absolute paths must stay
inside the canonical notes directory. Root, parent, and file symlinks are rejected, and so are
hard-linked files. Searches skip symlinks.

To try the full flow with an existing notes directory and a tool-capable model:

```fish
set -lx POPPET_NOTES_DIR "$HOME/Documents/Notes"
bun run start chat new "Find notes about Acorn, read them, and save a summary as acorn-summary.md."
```

## File operations and limits

Saving creates a note, or atomically replaces an existing one. Existing content is overwritten, so put
the intended path in your request. New files get owner-only permissions. Parent directories that pass
the checks are created as needed. Each write is limited to 64 KiB of UTF-8 text. A read scans at most
64 KiB of a note, and it reports when the text was cut short. Search matches literal text, ignoring case.
It returns relative paths, line numbers, and snippets. It scans at most 128 files and 128 directories,
returns at most 100 matches, and rejects any directory with more than 1000 entries. The per-tool result
limit can shorten read and search results further.

## Project note selections

A [project](projects.md#select-notes) can save up to eight relative paths in `notes.json`. Its runs
search, read, and write only those paths, subject to the usual checks and permissions. The path list is
fixed with the session or task. The contents stay current, and they are read only when needed. A missing
note is an error, with no fallback. With no selection, the configured root policy applies. An empty `[]`
allows no notes.

## Tool execution

A run allows eight model turns and sixteen tool calls by default. Each batch of requested tools is checked
against the run's allowed tools and argument schemas before any call in it runs. A batch does not run unless
another model turn is left to use its results. Tool results and definitions count toward the context size.
The current exchange is always kept whole, and it fails if it cannot fit. The five-minute run deadline covers
all model turns and tools. The 128 KiB text limit applies across all turns, and each serialized completion
is limited to 1 MiB.

## Saved outcomes and recovery

Inputs, complete tool requests, execution states, and results are saved locally. `chat show` includes a
`toolCalls` list. Results are recorded in the same transaction as their transcript messages. A graceful
cancellation waits for any save in progress and for its result to be recorded, then stops. When the store
reopens, queued calls become interrupted, and started calls with no recorded result become unknown. A write
can succeed before its result is saved. Check the file before you retry an unknown write by hand. Failed and
interrupted exchanges stay visible, but they are left out of later model context. Calls and writes are never
replayed automatically.