+++
title = "Storage"
description = "Find your data, see what Poppet keeps, and back it up."
+++

# Storage

Poppet keeps everything on your computer, in one folder called the data directory. It is `~/.config/poppet` unless you [choose another](configuration.md#data-directory).

```text
config.json       your settings
web.json          web chat settings, if you use web chat
profile.md        your profile, which you write
soul.md           Poppet's personality, which you write
skills/           your skills
auth/             provider and MCP sign-ins and keys
channels/         messaging gateway tokens, and Telegram's settings
store/            conversations, facts, and tasks
logs/             the worker's log
```

To see where your data is and how much it holds:

```sh
poppet store status
```

## What Poppet keeps

- **Conversations.** Every message, attachment, and answer, with the tools Poppet used and the provider and model it used. Failed and interrupted answers are kept too, so you can see what happened.
- **Reasoning.** When a model shares its reasoning, Poppet saves it with the answer, even if you do not [log it](configuration.md#reasoning-and-timing-logs).
- **Facts.** Every version of every fact, with who changed it.
- **Tasks.** Every run and its result, and the task's note and its history.
- **Skills.** A copy of each skill used in a conversation or task, so later messages use the same version.
- **Tool reviews.** Review decisions and reasons for shell commands and reviewed MCP calls, with any owner approval or denial. Inspect them with `poppet chat show <session-id>` or `poppet tasks show <task-id>`.
- **Gateway approvals.** Approval requests and their outcomes, so Poppet can expire requests left by a stopped worker and explain late replies.
- **Search index.** Your messages and Poppet's answers, for `chat search`.

Sign-ins, API keys, and tokens are kept in the `auth` and `channels` folders, separate from your conversations. Only your user account can read them.

## Delete data

- Delete conversations with [`chat delete` or `chat prune`](chat.md#delete-old-sessions).
- Forget facts with [`memory forget`](memory.md#saved-facts). Earlier versions stay in the fact's history.
- Delete tasks with [`tasks remove` or `tasks clear`](tasks.md#remove-tasks).
- Sign out with `poppet provider logout` or `poppet mcp logout`.

To remove everything, stop the worker, run `poppet worker uninstall`, and delete the data directory. This cannot be undone.

## Back up

1. Stop the worker. Press Ctrl-C in its terminal, or run `poppet worker stop` if it starts at login.
2. Wait for any chats to finish.
3. Copy the whole data directory:

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

4. Start the worker again.

If you use a different data directory, copy that folder instead. Keep the backup private, because it contains your conversations and sign-ins.

To restore a backup, stop the worker, then copy the backup back to the data directory's location.

## After an update

Poppet updates its database the first time it runs after you update Poppet. Updating never deletes your data.

Poppet refuses to open a database made by a newer version of Poppet. If you go back to an older version, restore a backup from that version, or set `POPPET_DATA_DIR` to a new folder.

## Interrupted answers

If Poppet stops in the middle of an answer, because it crashed or you restarted the worker, it marks the answer as interrupted. Poppet does not repeat it, so send the message again if you still need the answer.

If Poppet was using a tool when it stopped, `chat show` marks that tool call as uncertain, because it may have finished. Check what the tool changed before you ask again.

## Permissions

Poppet keeps your data readable only by you. It refuses to use sign-in files, `profile.md`, or `soul.md` if other users can change them. If Poppet reports a permission problem, fix it with:

```sh
chmod 700 ~/.config/poppet ~/.config/poppet/auth ~/.config/poppet/channels
chmod 600 ~/.config/poppet/auth/* ~/.config/poppet/channels/*
```

Only one copy of Poppet can use a data directory at a time. Leave the `.lock.sqlite` files in place while Poppet is running.
