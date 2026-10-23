+++
title = "Discord"
description = "Connect a bot and chat in owner-authorized Discord threads."
next = "/docs/worker"
+++

# Discord

Connect a model provider, then create a Discord bot and a private parent channel. After setup, mention the bot in that channel. It should create a thread and reply there.

## Bot setup

Create a bot in the [Discord Developer Portal](https://discord.com/developers/applications).
Turn on its Message Content intent, and install it in your server with the bot scope. In the
parent text channel you want, give it View Channel, Read Message History, Create Public Threads,
Send Messages in Threads, and Add Reactions. It does not need Administrator. Use Discord's
Developer Mode to copy the bot user's ID, your user ID, the server ID, and the parent channel ID.

Start with a private parent channel that only trusted people can read. Only the configured user
can invoke Poppet. Anyone with access to the channel can read the replies, and those can include
your saved memory and notes.

Select an assistant-capable provider and model, then save the bot token through stdin. The token
is never accepted as an argument. For fish:

```fish
read --silent --prompt-str 'Discord bot token: ' discord_token
printf '%s\n' $discord_token | bun run start gateway discord setup <bot-id> <your-user-id> <server-id> <parent-channel-id> --key-stdin
set -e discord_token
bun run start gateway work
```

Replace the angle-bracket placeholders with Discord IDs before you run the setup command. You can
add more parent channel IDs after the first one. Settings and the redacted token are saved in
`<POPPET_DATA_DIR>/channels/discord.json`. The file is `0600`, and its directory is `0700`. Model
provider credentials are kept separately. Restart an existing worker after you change channel settings.
On macOS, run `worker stop` and then `worker start`. The installed worker reads the saved settings, and
the bot token never goes into its LaunchAgent environment.

## Thread sessions

Mention `@Poppet` with a message in an allowed parent text channel. The bot starts a thread and replies
there. Inside any thread under an allowed parent channel, your text messages go to the bot without a
mention. The first message attaches a session, and later messages continue it. Each thread keeps its own
history and selected model, across worker restarts, renames, and archiving. For a new session, start a new
thread. Earlier messages in an existing thread are not imported.

Use `@Poppet /new --skill weekly-review Review Acorn` to start a fresh session with a saved
[local skill](../skills.md#messaging-sessions). This works in a new thread or an existing one. Add
`--project acorn` to select [project context](../projects.md), with or without a skill. `/new <message>`
starts without either selection. Earlier session history is kept, and regular follow-ups keep both
snapshots. Options come before the prompt. A selection error leaves the active session unchanged.

## Progress and controls

The bot shows Discord's typing indicator while it works, including during tool calls. It refreshes the
indicator every eight seconds, and it stops refreshing when the request finishes, fails, or is cancelled.
Discord clears the indicator after a reply, or within ten seconds of the last refresh. A failed indicator
does not interrupt the request.

Poppet also adds a 👀 reaction to the original message when processing starts. After a successful run, it
replaces that with ✅. A failed or cancelled request removes the bot's 👀 and does not add a ✅. These markers
are best effort. If the bot lacks reaction permissions, chat still works. A crash or network error can leave a
stale marker behind.

In a thread that is attached to a session, `@Poppet /status` shows its session, selected skill and project, and
latest run. `@Poppet /cancel` interrupts the active request and cancels its queued requests. These are text
messages, not registered Discord slash commands. The bot ignores other users, bots, and webhooks. DMs, forums,
attachments, voice, and streamed message edits are not supported.

## Status and delivery

Run `bun run start gateway status` to see the connection state, the counts of rejected and dropped events while
running, and the saved queue and delivery counts. Each registration has an entry in `channels`. The entry shows
its ID, display name, enabled state, connection details, or configuration error. The queue and delivery totals
appear at the top level, and each one is counted once across all channels. When the gateway is stopped, status
reads the settings without opening a messaging connection. Completed answers are saved before they are sent. A
delivery retry never runs the model or any tool again.

A send with an unknown outcome is recorded, and it is not sent again automatically, because Discord may already
have posted it. Use the session ID and `chat show <session>` to read the saved answer before you repost it by hand.
If a thread becomes inaccessible, no reply is redirected to another channel. [Scheduled tasks](../tasks.md#deliver-results-to-discord)
can target a specific thread with `--discord-thread`. Run the combined worker to execute and deliver them. Scheduled
results use the same queue, and they do not change thread sessions. [Telegram private chat](telegram.md) and
[WhatsApp private chat](whatsapp.md) are also supported.

## Thread names

New threads get a fallback name based on the message that started them. After the answer is delivered, Poppet may
generate a short session title and sync it to the managed thread. `chat rename` also updates a managed thread while
the gateway is running. `/status` shows the local session title.

Poppet changes thread names only when the source message and the bot's ownership show that it created the thread.
This also lets it recover after a lost creation acknowledgement. Existing threads that were attached keep their
names. Before each rename, the adapter checks the current access and compares the remote name with the last name
the bot confirmed. If it finds an edit made outside Poppet, it turns off sync, even if the user later restores the
old name. Discord names respect its 100 UTF-16-unit limit, and they do not split a Unicode character.

The saved answer is delivered before optional model naming starts. Naming and remote updates each have their own
time limits. Missing permissions, rate limits, disconnects, and deleted or locked threads leave chat results
intact. A lost rename acknowledgement is checked against the current name, and the rename is not sent again.
Failures can stop sync, while the local session title keeps working. Discord has no atomic compare-and-rename, so
a user edit made between the last fetch and the update can still collide with the bot. 

## Schedule through chat

With a tool-capable model, you can ask in this authorized conversation to create, inspect, pause, or resume a task.
Ask for delivery here to save this conversation as the result destination, after an access check. The model cannot
pick another chat or identity. See [task management](../tasks.md#manage-tasks-through-chat) for timing, receipts, and
recovery. Scheduled runs cannot manage other tasks.
