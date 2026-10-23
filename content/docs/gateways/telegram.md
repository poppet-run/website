+++
title = "Telegram"
description = "Chat privately with your bot, send documents, and enable optional local voice transcription."
next = "/docs/worker"
+++

# Telegram

Connect a model provider first, then create a bot and authorize your own Telegram account. Get a text reply working before you try [documents and voice](#documents-and-voice). Voice needs extra software on your computer, and it is off by default.

## Bot setup

Create a bot through [BotFather](https://core.telegram.org/bots/features#creating-a-new-bot).
Keep its token private. The bot ID is the number before the colon in the token. Use your
numeric Telegram user ID as the owner ID. The adapter accepts plain text and single supported
attachments only in the private chat between that owner and the bot.

Select an assistant-capable provider and model, then save the token through stdin:

```fish
read --silent --prompt-str 'Telegram bot token: ' telegram_token
printf '%s\n' $telegram_token | bun run start gateway telegram setup <bot-id> <owner-id> --key-stdin
set -e telegram_token
bun run start gateway work
```

Replace the placeholders with numeric IDs. Open the bot's private chat in Telegram, press Start if
you need to, and send a text message. Settings and the redacted token are saved in
`<POPPET_DATA_DIR>/channels/telegram.json`. The file is `0600`, and its directory is `0700`. Restart
an existing worker after you change settings. `gateway status` can read the saved configuration while
the worker is stopped, without connecting.

Use this bot with one polling client only. An existing webhook, or another client polling the same
token, can stop messages from arriving. Poppet reports the conflict in the channel status. It does not
delete webhooks or throw away pending updates.

## Conversations and controls

The owner has one active saved session per bot and private chat. It resumes after a worker restart and
keeps its selected provider and model. Telegram and Discord keep separate sessions, even if their
external IDs happen to match.

Send `/new --skill weekly-review Review Acorn` to start a fresh session with a saved
[local skill](../skills.md#messaging-sessions). Add `--project acorn` to select
[project context](../projects.md), with or without a skill. Options come before the prompt. `/new <message>`
starts without either selection. Earlier sessions and their history stay available. Follow-ups keep both
snapshots across restarts and local file edits. A selection error leaves the active session unchanged.

After the first exchange, `/status` reports the session, the skill, the project, and the latest run. `/cancel`
interrupts active work and cancels queued input in this chat, without waiting for inference. While Poppet
works, the adapter sends typing actions. Replies are plain text, split at 4096 UTF-16 units without breaking
a Unicode character. Formatting syntax is sent as written, and link previews are off.

Messages from other users, groups, channels, topic messages, and edited messages are ignored on purpose.
If the owner sends an unsupported attachment, they get a reply saying so. Reactions and renaming the chat in
Telegram are outside this adapter's scope.

## Documents and voice

Send one UTF-8 `.txt`, `.md`, `.markdown`, or text-based `.pdf` file. Its caption is your request. Without a
caption, Poppet gives a short summary. PDF replies say how complete the extracted text is, and they keep page
labels for citations. Scans, encrypted or malformed PDFs, images, archives, albums, forwarded attachments, and
remote file links are not supported. Send files directly, so that a caption added by someone else cannot act
as your instruction.

Text downloads are limited to 64 KiB, and at most 32 KiB of text is accepted. PDFs are limited to 8 MiB, 64
pages, and 30 seconds of extraction. PDF text can be cut to 32 KiB. The reply and the model input both say
which text and pages were left out. Oversized text files are rejected, not shortened. The caption, source,
instructions, and tools together still have to fit the chat budget you set.

Attachment contents and links are untrusted source material. They cannot grant URL access, or authorize note,
memory, or task changes. A separate caption can ask for an action, under the usual chat rules. `/new`,
`/status`, and `/cancel` are read only from your text or caption. File contents cannot trigger them.

Voice is optional and off by default. To turn it on, set up [local transcription](../configuration.md#local-voice-transcription),
then restart the worker. Telegram Ogg/Opus voice messages must be at most 8 MiB and 2 minutes long. Accepted
transcripts are at most 16 KiB. Audio is decoded and transcribed on your machine. The transcript is sent to
the selected text model.

Every voice reply shows the exact transcript that was accepted. Voice runs have no tools for writing notes,
memory, or tasks, and no external MCP or browser tools. If you dictate a reminder, Poppet proposes the task
along with the resolved time and timezone. It then asks you to confirm in a text message. Correct unclear words
or times before you confirm. Speech recognition does not verify who is speaking.

Downloads and extraction happen before inference, and they do not hold the model permit. Accepted text is saved
before the run starts, so a restart or a repeated update reuses it. Raw files are deleted after processing. On
startup, only this feature's abandoned temporary directories are removed. Saved text, transcripts, source metadata,
and answers stay in conversation storage, and they may be sent to the provider as history. Deleting the temporary
files does not erase those records, or undo any earlier tool effects. Reasoning diagnostics are hidden for
attachment runs and for later turns in a session that has attachment records.

## Polling and delivery

The adapter uses the [Telegram Bot API](https://core.telegram.org/bots/api#getupdates) with long polling. Each
accepted input is saved to the gateway inbox before its polling offset is saved. Updates that are ignored on
purpose still move the offset forward. Each poll requests up to ten updates, which keeps batches within the
2 MiB response limit. When the 64-request inbox is full, extra requests are saved as rejected, with a queue-full
reply, before the offset moves. Retry those requests later. `/status` and `/cancel` still work while the inbox
is full.

Offsets are stored separately for each adapter and bot account. If a crash happens between accepting an update
and saving the offset, the update can arrive again. Inbox IDs stop it from running the model or tools twice.

Completed answers are saved before they are sent. When Telegram rate-limits a send, Poppet waits for the retry
delay the server gives, then follows the gateway's retry limits. Network failures, server errors, malformed send
responses, and lost acknowledgements can leave a send with an unknown outcome. Poppet keeps that state and does
not resend the message on its own. Check `gateway status` and the saved session with `chat show <session>`
before you repost an answer by hand. A failed delivery never runs inference again.

## Scheduled results

Run `bun run start worker run` to enable scheduling and messaging together. Then pick the owner's private chat
before the prompt:

```fish
bun run start tasks add daily-summary --cron "0 9 * * *" --tz Europe/London --telegram-chat <owner-id> "Summarize my notes"
```

The messaging worker checks the destination before it saves the task. Each occurrence keeps a copy of its bot,
owner, and chat. Results go through the shared delivery queue, and they stay separate from the private chat's
conversation history. `tasks show` includes that copy and the delivery states. Choose one destination per task.
`--telegram-chat`, `--whatsapp-chat`, and `--discord-thread` cannot be combined.

## Schedule through chat

With a tool-capable model, you can ask in this authorized conversation to create, inspect, pause, or resume a
task. Ask for delivery here to save this conversation as the destination, after an access check. The model cannot
choose another chat or identity. See [task management](../tasks.md#manage-tasks-through-chat) for timing, receipts,
and recovery. Scheduled runs cannot manage other tasks.