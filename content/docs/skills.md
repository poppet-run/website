+++
title = "Skills"
description = "Save a reusable Markdown procedure and choose it for a chat or task."
+++

# Skills

A skill is a Markdown procedure you write and keep locally. Choose one for a chat or a scheduled task, or name one in a message, and Poppet follows it using its existing tools and permissions. A skill cannot grant new permissions.

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

```sh
poppet skills list
poppet skills show weekly-review
poppet chat new --skill weekly-review "Review my Acorn project"
poppet tasks add weekly-review --cron "0 9 * * 1" --tz Europe/London --skill weekly-review "Review my Acorn project"
```

Put `--skill` before the message or prompt, and choose at most one skill. `skills show` checks the file and prints it, so use it to confirm a new skill is valid. Poppet rejects symlinks, hard links, non-regular files, invalid UTF-8, and oversized files. Listing and showing skills need no model or login.

When Poppet starts a chat or task with a skill, it saves the skill's name and text with that session or task. Later messages and retries use that saved copy, even if you edit or delete the file. To use an updated skill, start a new chat or create a new task.

Skills are plain files. Poppet does not run scripts, download skills, or follow references.

## Name a skill in a message

Write `$` followed by a skill's name to use it for one message:

```text
Run $weekly-review for the Acorn project
```

This works in terminal chat, web chat, Discord, and Slack, including with models that cannot use tools. In a shell, use single quotes so the shell does not expand the name:

```sh
poppet chat new 'Run $weekly-review for the Acorn project'
```

Poppet saves the skill's name and full text with that message. Later turns replay the saved text even if you edit or delete the file. Naming it again in a later message reads the current file. It does not change the session's selected skill.

The name must stand alone outside inline code and triple-backtick code blocks, and match a skill directory exactly, including case. Sentence punctuation after it is fine. `${name}`, `\$name`, `$name/path`, and `$name=1` stay ordinary text. Unknown names stay ordinary text too. Put shell variables in code when you do not want them treated as skill names.

A message can load up to four distinct skills. Repeated names load once. The session's selected skill is not loaded again and does not count toward that limit. A named skill with an invalid file rejects the message before a run is saved. Check it with `poppet skills show <name>`, or write the name without `$`.

Manual-only skills can be named. Text inside attachments is not scanned. Scheduled task prompts do not expand `$name`; use `tasks add --skill` instead. Named skills count toward the context budget and grant no permissions, including permission to read URLs found only in their text.

## Manual-only skills

To keep the model from choosing a skill itself, put this exact comment on the first line, without indentation:

```markdown
<!-- manual-only -->

# Release review

Review the release checklist and report anything still unfinished.
```

Poppet leaves the skill out of the model's index, refuses model requests to view it, and prevents the model from selecting it when creating a task. You can still choose it with `--skill`, `/new --skill`, or a `$name` mention. Existing permissions still apply.

A misplaced or misspelled marker does not hide the skill. Check with `poppet skills list`, which marks these skills as `manual-only`. `skills list --json` still returns names only; `skills show <name> --json` includes the `manualOnly` boolean.

## Choose a skill in messaging

In Discord or Slack, start a thread with a skill using the `/new` command:

```text
/new --skill weekly-review Review my Acorn project
```

Use `/new` without `--skill` to start a session with no skill. Either command starts a new session in the thread. Earlier sessions stay saved. A skill that is missing or invalid gets an error reply, and the thread keeps its current session. See [Discord](gateways/discord.md#start-a-conversation) or [Slack](gateways/slack.md#start-a-conversation).

## Skills the model can choose

Chats that can use tools also see a list of your valid skills without the manual-only marker, with the description from each one. Before a multi-step task, the model can read a matching skill. The list is read once per run. It covers up to 64 skills, within an 8 KiB limit. If the list is too long, Poppet shortens it and says so.

A skill you choose with `--skill` is always included. A skill the model reads grants no permissions, and it cannot change memory or tasks.

## Draft a skill from a conversation

Poppet can help you write a skill, but it does not save one. After a procedure works, ask in the same chat:

```text
Turn the weekly review we just completed into a skill named weekly-review.
Return only a draft in your reply; do not save anything. Include required inputs,
steps using existing Poppet tools, pitfalls, and how to verify the result.
Generalize private project details and omit credentials and unrelated facts.
```

Review the draft against what actually happened. Remove account names, paths, and private details, then save it yourself at `<data directory>/skills/<name>/SKILL.md`. Test it in a fresh chat on a harmless input before you rely on it, and check the saved file with `poppet skills show <name>`.
