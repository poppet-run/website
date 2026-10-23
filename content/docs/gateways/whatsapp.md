+++
title = "WhatsApp"
description = "Pair a personal WhatsApp account for owner-only private text conversations."
next = "/docs/worker"
+++

# WhatsApp

Connect a model provider, then follow the account setup and pairing steps below. After pairing, send a short text message from the authorized account to check that Poppet replies.

## Account setup and pairing

This adapter links a personal WhatsApp account by QR code, using
[Baileys](https://github.com/WhiskeySockets/Baileys), an unofficial WhatsApp Web client.
Protocol changes can break it, and using an unofficial client can get an account restricted.
The Business Cloud API is not implemented.

Choose the account that Poppet will link, and the owner whose private chat is allowed to run it.
Enter international phone digits, without `+`, spaces, or punctuation. A dedicated account can
reply to the owner's account. To use your own account, set both phone numbers to your number, and
use WhatsApp's chat with yourself.

Select an assistant-capable provider and model. Stop any running Poppet worker. Then run these
commands in an interactive terminal:

```fish
bun run start gateway whatsapp setup <account-phone> <owner-phone>
bun run start gateway whatsapp pair
bun run start worker run
```

On the phone for the configured account, open WhatsApp's Linked devices screen and scan the QR code.
Pairing has a two-minute deadline. Before it enables chat, Poppet checks the phone number of the linked
account. If the number does not match, the pairing is discarded, and you need to run `pair` again with
the correct account. QR codes are printed only by the foreground pairing command, which refuses redirected
output. They never appear in worker logs or status output. Do not share the QR code or the saved
authentication database.

Settings are saved in `<POPPET_DATA_DIR>/channels/whatsapp.json`. Signal keys and session credentials are
saved in `channels/whatsapp-auth.sqlite`, separate from conversation history. The files are `0600`, and the
directory is `0700`. The database is protected by file permissions only, and it is not encrypted at rest.
Pairing and the worker share an ownership lock, so stop the worker before you pair. The library commits each batch
of keys atomically. If the credentials cannot be read or written, the adapter stops rather than replacing
keys without telling you.

Restart the worker after you change the setup. `gateway status` reads the configuration while the worker is
stopped, without connecting. While running, status reports `connected`, `needsPairing`, `error`, `dropped`,
and `ignored`. Brief disconnects reconnect with a limited back-off. Unlinking this device on the phone clears
the saved session keys, and you have to pair again. A replaced or invalid session stops and waits for you.
Pairing can reset an invalid session once, and then it asks for a new QR code.

## Owner-only text chat

The owner has one active saved session for each linked account and private chat. It resumes after a worker
restart. Shared conversation bindings, inbox identities, cancellation, and reply delivery work the same way they
do for the other adapters. `/status` reports the session and the latest run, including the selected skill and
project. `/cancel` interrupts current work and cancels queued input.

Send `/new --skill weekly-review Review Acorn` to start a fresh session with a saved
[local skill](../skills.md#messaging-sessions). Add `--project acorn` to select
[project context](../projects.md), with or without a skill. Options come before the prompt. `/new <message>`
starts without either selection. Earlier sessions and their history are kept. Follow-ups keep both snapshots
across restarts and across edits or deletions of the local files. A selection error leaves the active session
unchanged.

Only plain private text from the configured owner is accepted. WhatsApp's LID addresses have to resolve through
the library's saved phone mapping. Identities that do not resolve are ignored. Groups, broadcasts, edits, attachments,
voice, and reactions do not start any model work. Full history sync is turned off. Incoming text is limited to 8192
UTF-16 units. Replies are split at 4096 units, without breaking a Unicode character. Replies are plain text, and
link previews are off.

Self-chat accepts messages that you send from your own devices. Poppet records each outgoing identity before it
sends, so its own echoed replies cannot start another run. That holds even after a lost acknowledgement or a
restart. Those identities stay saved when session keys are reset.

## Acceptance and delivery limits

Baileys acknowledges incoming events before they reach the adapter. Unlike the Telegram polling adapter, Poppet
cannot hold that acknowledgement until its inbox commit. Receive buffering has a limit. A crash, or an overload
before the gateway accepts an event, can lose an input. `dropped` counts buffer overflows during the current
worker run. If a message never appears in the saved session, send it again by hand. Once the gateway has accepted
an input, the saved inbox IDs stop it from running the model or tools twice.

Completed answers are saved before they are sent. The library's automatic message retries are turned off. Send
failures and timeouts are treated as unknown, because WhatsApp may already have accepted the reply. Poppet does not
resend them or run inference again. A successful send from the library only means the message was submitted. It does
not prove the phone received or read it. Check `gateway status` and `chat show <session>` before you repost an
answer by hand.

## Scheduled results

With `worker run` active and WhatsApp connected, pick the owner's phone number before the task prompt:

```fish
bun run start tasks add daily-summary --cron "0 9 * * *" --tz Europe/London --whatsapp-chat <owner-phone> "Summarize my notes"
```

The messaging worker checks the destination before it saves the task. Each occurrence keeps a copy of the linked
account and owner. Results go through the shared delivery queue, without being added to the private chat's history.
`tasks show` shows the delivery state. Choose one destination per task. WhatsApp, Telegram, and Discord destination
flags cannot be combined.

## Schedule through chat

With a tool-capable model, you can ask in this authorized conversation to create, inspect, pause, or resume a task.
Ask for delivery here to save this conversation as the result destination, after an access check. The model cannot
pick another chat or identity. See [task management](../tasks.md#manage-tasks-through-chat) for timing, receipts, and
recovery. Scheduled runs cannot manage other tasks.