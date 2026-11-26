+++
title = "Skills"
description = "Write a procedure once and choose it for a chat or task."
+++

# Skills

A skill is a set of instructions you write in a Markdown file, such as how to run your weekly review. Choose a skill for a chat or a scheduled task, or name it in a message, and Poppet follows it. A skill cannot give Poppet any permission it does not already have.

## Write a skill

Each skill is a file named `SKILL.md` in its own folder, inside `skills` in your data directory. The folder name is the skill's name. For example, create `~/.config/poppet/skills/weekly-review/SKILL.md`:

```markdown
# Weekly review

Search past conversations. Read relevant exchanges,
then summarize progress, unresolved questions, and next actions. Cite session IDs.
```

Poppet shows the model the first heading and the start of the first paragraph, so it can tell when the skill applies. Write them to say what the skill is for.

Skill names can use letters, digits, underscores, and hyphens, up to 128 characters. A skill file can be up to 8 KiB.

## Use a skill

```sh
poppet skills list
poppet skills show weekly-review
poppet chat new --skill weekly-review "Review my Acorn project"
poppet tasks add weekly-review --cron "0 9 * * 1" --tz Europe/London --skill weekly-review "Review my Acorn project"
```

Run `poppet skills show <name>` after you write a skill. It prints the skill, or tells you what is wrong with the file. Put `--skill` before the message or prompt. You can choose one skill per chat or task.

Poppet saves a copy of the skill with the chat or task. Later messages use that copy, even if you edit or delete the file. To use an edited skill, start a new chat or create a new task.

Poppet only reads skill files. It does not run scripts, download skills, or follow links in them.

## Name a skill in a message

Write `$` and a skill's name to use it for one message:

```text
Run $weekly-review for the Acorn project
```

This works in the terminal, web chat, and gateways. In a shell command, use single quotes so the shell leaves `$` alone:

```sh
poppet chat new 'Run $weekly-review for the Acorn project'
```

The name must match the skill's folder name exactly, including capital letters. Punctuation straight after the name is fine. Poppet ignores names inside code and names that do not match a skill, so `$HOME` in a message stays as it is. A message can name up to four skills by default. Change this with [`limits.skillMentions`](configuration.md#timeouts-and-limits).

Poppet saves the skill's text with your message. Naming the skill again in a later message reads the current file. Naming a skill does not change the skill chosen for the session.

If a named skill's file has a problem, Poppet refuses the message. Check the file with `poppet skills show <name>`, or remove the `$` from your message.

Poppet does not look for skill names inside attachments or scheduled task prompts. For a task, use `tasks add --skill` instead.

## Manual-only skills

Poppet can choose a skill by itself when it looks useful. To stop it choosing a skill, make this exact comment the first line of the file:

```markdown
<!-- manual-only -->

# Release review

Review the release checklist and report anything still unfinished.
```

You can still choose a manual-only skill with `--skill`, `/new --skill`, or `$name`. `poppet skills list` marks these skills as `manual-only`. If the marker is not exactly on the first line, the skill is not manual-only.

## Choose a skill in a gateway

In a [messaging gateway](gateways/_index.md), such as Discord, Slack, or Telegram, start a new session with a skill:

```text
/new --skill weekly-review Review my Acorn project
```

`/new` followed by a message starts a new session with no skill. Earlier sessions stay saved. If the skill is missing or has a problem, Poppet replies with the error and keeps the current session. In a channel rather than a thread, mention the bot first. See [Discord](gateways/discord.md#start-a-conversation), [Slack](gateways/slack.md#start-a-conversation), or [Telegram](gateways/telegram.md#start-a-conversation).

## Skills Poppet chooses itself

Poppet sees a list of your skills, except manual-only ones, with the description from each. Before a task with several steps, it can read a skill that matches. By default, Poppet considers up to 64 skill files for the list, within an 8 KiB budget, with up to 240 bytes per description. Change these with [`limits.skillIndexEntries`, `limits.skillIndexBytes`, and `limits.skillDescriptionBytes`](configuration.md#timeouts-and-limits). Set `skillIndexBytes` to `0` to turn off the list and skill tools. Individual skill files still have an 8 KiB limit.

## Draft a skill from a conversation

Poppet can help write a skill, but it does not save skill files. After a procedure works well in a chat, ask in the same chat:

```text
Turn the weekly review we just completed into a skill named weekly-review.
Return only a draft in your reply; do not save anything. Include required inputs,
steps using existing Poppet tools, pitfalls, and how to verify the result.
Generalize private project details and omit credentials and unrelated facts.
```

Check the draft against what actually happened, and remove account names, paths, and private details. Save it yourself as `skills/<name>/SKILL.md` in your data directory, check it with `poppet skills show <name>`, then try it in a new chat on something harmless.
