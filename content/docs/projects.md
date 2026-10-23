+++
title = "Projects"
description = "Give related chats and tasks their own instructions, facts, and selected notes."
next = "/docs/skills"
+++

# Projects

A project saves instructions, facts, and a selection of notes for related chats and tasks. Select it with `--project`. Poppet does not pick a project based on your working directory.

Select a project yourself to give a chat or task its own instructions, facts, and note
selection. Poppet never infers a project from your working directory or your message. A
project does not grant extra tools, credentials, or filesystem access.

## Create and select a project

Create `<POPPET_DATA_DIR>/projects/acorn/PROJECT.md`. With the default data directory:

```fish
mkdir -p ~/.config/poppet/projects/acorn
printf '%s\n' '# Acorn' 'Use concise milestone reviews. Flag unresolved decisions.' > ~/.config/poppet/projects/acorn/PROJECT.md
bun run start projects list
bun run start projects show acorn
bun run start chat new --project acorn "Review the next milestone"
bun run start chat interactive --project acorn
bun run start tasks add acorn-review --project acorn --cron "0 9 * * 1" --tz Europe/London "Review progress"
```

If your data directory is somewhere else, use that path instead. Names use 1 to 128 letters, digits,
underscores, or hyphens, and they cannot be paths. `PROJECT.md` must be a regular UTF-8 file of at most
8192 bytes. Symlinks, hard links, invalid UTF-8, and NUL bytes are rejected. `projects list` lists the
named directories. `projects show` checks the current files and displays them. It needs no model or
database.

Put the options before the prompt. You can add one `--skill weekly-review` alongside `--project acorn`.
In an authorized messaging conversation, send:

```text
/new --project acorn --skill weekly-review Review progress
```

In a Discord parent channel, mention the bot before the command. `/status` shows the saved project name.
`/new <message>` starts an unscoped session. Follow-ups keep their current selection. An invalid selection
leaves the active binding unchanged. Restart an older worker before you use project commands. Requests
that need a project are rejected, rather than running quietly without their selection.

## Saved instructions and current facts

The store's owner reads the project files when a session or task is created. It saves
`project: { name, content, notes }`. Unscoped and older records have `project: null`. `chat show` and
`tasks show` display that saved copy. Continuing a chat, restarting the worker, editing a task, or
retrying an occurrence keeps the copy, even if the files change or are deleted. To pick up changes,
create a new session or task. Tasks created in a project chat inherit that chat's copy.

Manage facts separately:

```fish
bun run start memory remember --project acorn review.format "List decisions first"
bun run start memory list --project acorn
bun run start memory replace --project acorn review.format "List blockers first"
bun run start memory forget --project acorn review.format
```

Memory commands default to the global scope. The same key can exist globally and in several projects.
Each run reads the current global facts and its project's facts once, and it keeps them fixed across
tool turns. A project can hold up to 128 keys and an 8192-byte serialized snapshot of facts. Each value
is still limited to 4096 bytes. Instructions, facts, tools, and history share the overall context budget.
Context that is too large fails with an error. Poppet does not quietly drop project details.

Your current requests and the base tool rules come first, ahead of saved preferences. Project
preferences that fit with global preferences refine them, including when a fact has the same key. Skills
provide procedures, subject to those rules. Global and project context are labelled separately.

The memory tool in a project chat can change only that project's facts, and only when you ask in the current
message. To change global facts, use an unscoped chat or the global CLI commands. Scheduled work gets current
facts, but it cannot write memory or notes. Project files and retrieved content never authorize changes.

## Select notes

You can optionally create `projects/acorn/notes.json` as a UTF-8 JSON array:

```json
["acorn/milestones.md", "acorn/decisions.md"]
```

It follows the same checks as `PROJECT.md` for regular files, links, and the 8192-byte limit. The list can
hold up to eight distinct relative paths ending in `.md`, `.markdown`, or `.txt`, inside `POPPET_NOTES_DIR`.
Absolute paths, backslashes, empty path parts, `.`, and `..` are rejected. The notes root, parent, and file
checks still apply, and selected paths cannot get around them.

The path list is saved with the instructions. The note tools read the current contents only when they are
asked to. Notes are untrusted source material. Searches, reads, and permitted writes are limited to the saved
list, and the normal write rules still apply. A missing or deleted note returns an error, with no fallback.
Without `notes.json`, `notes: null` keeps the configured notes-root policy. An empty array allows no notes.
Poppet does not preload or index the notes.

## Recall and retention

Conversation search and reads for the agent only cover sessions in the same project. Unscoped chats only
recall unscoped sessions. Guessing another session ID does not get around this limit. Task inspection and
controls in chat use the same project boundary. CLI commands you run can still inspect and search every
project. This separates context within your own data.

Deleting a project directory keeps its saved sessions, task copies, and facts. `memory list --project acorn`
reports `orphaned: true` when the directory is gone. To delete the leftover facts, run
`memory forget --project acorn <key>`. Forgetting does not redact earlier prompts, answers, or tool records.
Reusing a project name also reuses its fact scope. Deleting a project does not move its facts into global
memory.