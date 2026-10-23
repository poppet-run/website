+++
title = "Skills"
description = "Save a reusable Markdown procedure and select it for a chat or task."
next = "/docs/tasks"
+++

# Skills

A skill is a Markdown file with instructions for a task, such as a weekly review. Select it when you start a chat or create a scheduled task.

A skill is a procedure you write yourself. You select it when you create a chat or
scheduled task, and it uses the same tools and permissions as everything else. Create one
file at `<POPPET_DATA_DIR>/skills/<name>/SKILL.md`, using UTF-8 Markdown of at most 8192
bytes. Names use 1 to 128 letters, digits, underscores, or hyphens.

For example, save this as `skills/weekly-review/SKILL.md` under your data directory:

```markdown
# Weekly review

Search the notes for the project named in the user's prompt. Read relevant notes,
then summarize progress, unresolved questions, and next actions. Cite note paths.
Save the review only if the user explicitly asks and note writes are permitted.
```

Check it and select it:

```fish
bun run start skills list
bun run start skills show weekly-review
bun run start chat new --skill weekly-review "Review my Acorn project"
bun run start tasks add weekly-review --cron "0 9 * * 1" --tz Europe/London --skill weekly-review "Review my Acorn project"
```

Put `--skill` and any other options before the message or prompt. You can select at most one
skill. `skills list` lists the named directories, and learned skills. `skills show` reads the selected file and checks
it. A missing skills folder lists as empty. Checking a skill needs no model, credentials, or
database. Symlinks, hard links, files that are not regular, invalid UTF-8, and oversized content
are all rejected. Names cannot be paths.

Poppet reads the skill when it creates the session or task, and it saves the name and full text in
SQLite. Continuing a chat, restarting the worker, or running a task occurrence all use that saved
copy. Editing or deleting the original file affects only new sessions and tasks. To pick up changes,
create a new session or task. `chat show` and `tasks show` include the saved `skill` object, with
`name` and `content`. Older records and regular sessions have `skill: null`.

The process that owns the store loads the file. Commands sent through a running worker use its data
directory and the same checks as local commands. Skills add to the run's instructions, below the base
rules, and they count toward the context budget. They cannot override your requests or grant
tool permissions. Scheduled notes and memory stay read-only. A skill cannot authorize memory changes.
In regular chat, a change still needs your request in the current message. Automatic session naming does
not receive skills.

To add [project context](projects.md), combine a skill with `--project <name>`. The project supplies
instructions, facts, and optional note limits. The skill supplies a procedure, and it works within
those limits. Both snapshots are saved separately. In messaging, use
`/new --project acorn --skill weekly-review Review progress`.

Owner skills are single files. Poppet does not parse YAML metadata, follow references, run scripts, or download
skills, and the agent cannot write owner skills. Learned skills, described below, are the one exception, and they
are saved only when you turn saving on.

## Skills the model chooses

Tool-capable runs also get an index of your saved skills. Each entry has the skill's name, and a description taken
from its first heading and the start of its first paragraph. Write those two parts so they say when the skill applies.
Before multi-step work, the model checks the index and reads a matching skill with `poppet_skills.view_skill`. The
result is kept in the run's tool record, so a later turn sees the text the model read, even if the file changes.

The index is read once per run. It includes at most 64 skills, and it leaves out invalid files. It is limited by
`POPPET_SKILL_INDEX_BYTES`, which defaults to 8192. When the index is too large, it lists names only, then fewer names,
and it says that it was truncated. Set the limit to `0` to turn off the index and the tool. A skill you select with
`--skill` stays in the instructions as before, and the index marks it as already supplied.

Reading a skill is read-only. It works in scheduled runs too, and after untrusted content such as a web page enters
the run. A skill the model reads grants no permissions, and it cannot authorize memory, note, or task changes.

## Learned skills

Learned skills are procedures Poppet saves itself. They are kept in the conversation database with a revision history,
not in your `skills/` folder. Saving is off by default. To turn it on, set `POPPET_LEARN_SKILLS=true` or
`chat.learnSkills` to `true`, then restart a running worker.

With saving on, interactive chats can use the `poppet_skills.manage_skill` tool. Poppet is instructed to save a skill
after it completes a multi-step procedure, recovers from errors, or you correct its approach. It should update a
similar learned skill rather than create a second one. A learned skill records when it applies, its inputs, its steps,
its pitfalls, and how to verify the result. It is not a log of the conversation. Poppet mentions each change in its reply.

Poppet enforces these limits itself, rather than relying on the model:

- Changing a skill needs the revision that `view_skill` returned, or an earlier change from the same run. A skill it
  has not read, or that has changed since, cannot be overwritten.
- Owner-written skills cannot be created over, changed, or deleted.
- A run can make at most 3 skill changes. There can be at most 64 learned skills, each up to 8192 bytes. Content that
  looks like a credential is rejected.
- The tool is removed from a run once a fetched page, search result, MCP result, or attachment enters it. Scheduled
  runs never get it.
- Each change records its run and tool call. Inspect them with `skills history` and `chat show`, and undo a change
  with `skills revert`.

Learned skills appear in the skill index with `source: "learned"` and their revision, unless an owner folder with the
same name shadows them.

```fish
bun run start skills list
bun run start skills show triage
bun run start skills history triage
bun run start skills revert triage 2
bun run start skills delete triage
bun run start skills promote triage
```

`skills list` shows owner and learned skills, with their source and revision. `skills show` reads the owner file first,
and falls back to the learned skill. `skills history` lists every revision with its action, origin, and source run.
`skills revert` restores an earlier revision as a new one. Reverting to a deletion deletes the skill. `skills delete`
removes the skill and keeps its history. `skills promote` copies a learned skill to `skills/<name>/SKILL.md`, without
replacing anything that already exists. An owner folder always takes precedence over a learned skill with the same name.
The learned-skill commands go through a running worker when there is one, and otherwise open the database directly.

## Messaging sessions

In an authorized Discord thread, a Telegram private chat, or a WhatsApp private chat, send a text command
with a prompt:

```text
/new --skill weekly-review Review my Acorn project
```

In a Discord parent channel, mention the bot before the command. It creates a thread the usual way. The
worker loads the local file with the same checks the CLI uses, saves a copy, and starts a fresh session.
Regular follow-ups continue that session with its saved skill, even if the file changes or is deleted later.
`/status` includes the current skill name.

Use `/new <message>` to start a fresh session without a skill. Both commands change only which session the
conversation is bound to. Earlier sessions, their history, and their results remain available through
`chat sessions` and `chat show`. The new session uses the worker's configured provider and model. Commands
run in the order they arrive, and they do not cancel active work. If you need to, send `/cancel` first.
Sending the same command twice cannot create a second session or run.

A missing prompt, an invalid name, or a skill file that is unavailable or invalid returns an error reply.
It does not run inference or change the active session. To see which procedures are available, run
`skills list` and `skills show` locally. The command prefix is removed from the prompt sent to the model and
from generated titles. Skills follow the same prompt limits and tool permissions as everything else.
Scheduled results do not change the messaging session or its selected skill.

Restart an existing worker after you update Poppet. 
