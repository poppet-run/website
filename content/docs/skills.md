+++
title = "Skills"
description = "Save a reusable Markdown procedure and select it for a chat or task."
next = "/docs/commands"
+++

# Skills

A skill is a Markdown procedure you write and keep locally. Select one for a chat or a scheduled task, and Poppet follows it using its existing tools and permissions. A skill cannot grant new permissions.

## Write a skill

Create one file at `<data directory>/skills/<name>/SKILL.md`. It must be UTF-8 Markdown of at most 8192 bytes. Names use 1 to 128 letters, digits, underscores, or hyphens.

For example, save this as `skills/weekly-review/SKILL.md`:

```markdown
# Weekly review

Search past conversations. Read relevant exchanges,
then summarize progress, unresolved questions, and next actions. Cite session IDs.
```

The first heading and the start of the first paragraph describe the skill to the model, so write them to say when it applies.

## Use a skill

```fish
poppet skills list
poppet skills show weekly-review
poppet chat new --skill weekly-review "Review my Acorn project"
poppet tasks add weekly-review --cron "0 9 * * 1" --tz Europe/London --skill weekly-review "Review my Acorn project"
```

Put `--skill` before the message or prompt, and select at most one skill. `skills show` checks the file and prints it, so use it to confirm a new skill is valid. Symlinks, hard links, non-regular files, invalid UTF-8, and oversized files are rejected. Listing and showing skills need no model or login.

When Poppet starts a chat or task with a skill, it saves the skill's name and text with that session or task. Later messages and retries use that saved copy, even if you edit or delete the file. To use an updated skill, start a new chat or create a new task.

Skills are plain files. Poppet does not run scripts, download skills, or follow references.

## Skills the model can choose

Chats that can use tools also see a list of your valid skills, with the description from each one. Before a multi-step task, the model can read a matching skill. The list is read once per run. It covers up to 64 skills, within an 8 KiB limit. If the list is too long, Poppet shortens it and says so.

A skill you select with `--skill` is always included. A skill the model reads grants no permissions, and it cannot change memory or tasks.

## Draft a skill from a conversation

Poppet can help you write a skill, but it does not save one. After a procedure works, ask in the same chat:

```text
Turn the weekly review we just completed into a skill named weekly-review.
Return only a draft in your reply; do not save anything. Include required inputs,
steps using existing Poppet tools, pitfalls, and how to verify the result.
Generalize private project details and omit credentials and unrelated facts.
```

Review the draft against what actually happened. Remove account names, paths, and private details, then save it yourself at `<data directory>/skills/<name>/SKILL.md`. Test it in a fresh chat on a harmless input before you rely on it, and check the saved file with `poppet skills show <name>`.

## Messaging

In Discord, start a thread with a skill using the `/new` command:

```text
/new --skill weekly-review Review my Acorn project
```

Use `/new` without `--skill` to start a session with no skill. Either command starts a new session in the thread. Earlier sessions stay saved. A skill that is missing or invalid gets an error reply, and the thread keeps its current session. See [Discord](gateways/discord.md#start-a-conversation).
