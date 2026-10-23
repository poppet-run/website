+++
title = "Memory"
description = "Save preferences and facts across conversations, and manage your profile."
next = "/docs/projects"
+++

# Memory

Ask Poppet to remember a fact or preference when you want it in later chats. Save longer documents as [notes](notes.md). Use [projects](projects.md) for facts that belong to one project.

## Saved facts

Save preferences and facts under stable keys:

```fish
bun run start memory remember answer.style "Keep answers concise"
bun run start memory list
bun run start chat new "How should you answer my questions?"
bun run start memory replace answer.style "Explain the reasoning"
bun run start chat new "How should you answer my questions?"
bun run start memory forget answer.style
bun run start memory list
```

Memory commands need no login or model. Chat still needs a configured provider and model,
and a working connection. `remember` creates a new key. It refuses an existing key, so a fact
cannot be overwritten by accident. `replace` and `forget` require an existing key. Keys start
with a letter or digit, and they contain only letters, digits, dots, underscores, and hyphens,
up to 128 characters. Values must be nonempty, must have no surrounding whitespace, and must fit
in 4096 UTF-8 bytes. The store holds up to 128 facts per scope. Listing shows each key, its value,
the last update time, and the source run ID when there is one. Facts created from the CLI have no
source run.

## Ask the model to change a fact

Tool-capable models can call `poppet_memory.memory` in regular chat, including the interactive
prompt and authorized messaging conversations. After you update Poppet, restart any running worker
so that its agent advertises the new tool:

```fish
bun run start chat new "Remember that I prefer concise answers, under answer.style"
bun run start chat send $session_id "Replace answer.style with Explain the reasoning"
bun run start chat send $session_id "Forget the saved fact answer.style"
bun run start memory list
```

Use the session ID printed by the first command. The model is told to change memory only when
you ask in the current message. It must not infer facts to save, and it must not treat the profile,
personality, skills, retrieved content, history, or tool results as permission. Poppet checks the
arguments and the allowed tools at runtime. The model still decides what your request means, as it
does for note writes you ask for.

The tool has three actions: `remember`, `replace`, and `forget`. It takes `action`, `key`, and
`value`. Forgetting requires a JSON `null` value. Existing keys are never overwritten implicitly.
Facts are already in the context, so the tool has no list action. Models without tool support can
still use the facts they were given. You can manage them with the CLI commands above.

The tool uses the same `Memory` service and local database as the CLI. Remembering and replacing set
`sourceRunId` to the active run. The model cannot supply or fake that value. Before it writes, the
agent checks the next fact snapshot against `POPPET_FACTS_BYTES`. It then returns a short confirmation
rather than repeating the value. The current run's prompt does not change. The tool result confirms
the change, and the next run loads it into its snapshot. CLI changes made separately follow their own
budget and snapshot rules.

Every request and outcome is recorded in the tool log, which `chat show` displays. If you cancel
gracefully, a mutation that has already started is allowed to finish and record its result. A storage
error, or a committed change whose result could not be saved, leaves the outcome unknown. Poppet never
replays such a change automatically. Completed memory changes stay saved even if a later tool or model
turn fails. Check `memory list` and `chat show` before you retry. Forgetting removes the fact, but it
does not redact earlier messages or tool records. The tool does not edit `profile.md`, `soul.md`, notes,
or credential files.

Scheduled runs keep their starting fact snapshot, but they have no memory-writing tool, even when a task
or selected skill asks for changes. The shared `readOnlyTools` policy also excludes note writes.

## Project facts

Memory commands default to global facts. Pass `--project <name>` to list, remember, replace, or forget
only that project's facts. Keys are unique within each scope, so the same key can exist globally and in
several projects. Each project run reads the global context and its project's facts once. Project facts
have a fixed 8 KiB snapshot budget, within the overall context budget.

A project chat's memory tool writes only that project's facts, and it records the run that made each
change. To change global facts, use an unscoped chat or the default CLI commands. Scheduled runs cannot
write to either scope. Deleting a project's files keeps its facts. `memory list --project <name>` shows
an orphaned directory, and `memory forget --project <name> <key>` removes one fact. See
[project context](projects.md) for selection, which preferences take priority, and instruction snapshots.

## Profile

Edit `<POPPET_DATA_DIR>/profile.md` to add your name, background, and preferences. With the default data
directory, that is `~/.config/poppet/profile.md`. A missing profile counts as empty, and Poppet never
creates it for you. An existing profile must be a regular UTF-8 file. Symlinks are rejected.

## Personality and tone

Edit `<POPPET_DATA_DIR>/soul.md` to set Poppet's personality, tone, and style of communication. With the
default data directory, that is `~/.config/poppet/soul.md`. For example:

```markdown
Be warm, direct, and concise. Use dry humor sparingly.
Disagree when there is a good reason, and say so when you are not sure.
```

`soul.md` describes how Poppet talks. `profile.md` describes you. Personality preferences do not allow tool
use, and they do not override Poppet's rules for tools and file access. A missing, empty, or
whitespace-only `soul.md` keeps the default personality. Poppet never creates the file for you. It follows
the same UTF-8 and regular-file rules as `profile.md`.

## Context across sessions

Each run reads the current personality, profile, and saved facts once, then uses that copy for all of its
model and tool turns. New and resumed sessions pick up changes on their next run, including scheduled tasks
and messaging. Memory is shared across sessions and providers, within its global or project scope in the
same data directory. Facts are included in key order as personal context, and no source information is sent
to the model. The memory tool is only for changes you ask for in the current message. Poppet does
not pull facts out of conversations automatically.

## Limits and deletion

The personality, profile, and fact budgets each default to 8 KiB. They are set by `POPPET_SOUL_BYTES`,
`POPPET_PROFILE_BYTES`, and `POPPET_FACTS_BYTES`. Content that is too large is an error, rather than being
silently left out. All three count toward `POPPET_CONTEXT_BYTES`, alongside instructions, tool definitions,
and history. A malformed or oversized personality file, profile, or facts block fails before a provider is
selected. A context overflow fails before inference starts. Forgetting removes the fact from future
snapshots. Existing conversation messages and note files are not changed.