+++
title = "Messaging"
description = "Choose Discord, Telegram, or WhatsApp for conversations and scheduled results."
+++

# Chat through messaging

First send a message from the terminal using [getting started](/docs/getting-started/). Then choose a messaging service below. Use a provider that supports general assistant chat, save its settings, and keep a worker running.

| Service | Connection | Where to chat |
| --- | --- | --- |
| [Discord](discord.md) | Create a bot and authorize your user, server, and parent channels. | Threads under allowed channels. |
| [Telegram](telegram.md) | Create a bot and authorize your numeric user ID. | Your private chat with the bot. Also accepts supported documents and optional voice messages. |
| [WhatsApp](whatsapp.md) | Pair a personal account through a QR code. Uses an unofficial WhatsApp Web client. | Private text chat restricted to the configured owner. |

Follow the service guide to save its credentials. Keep tokens out of shell arguments and general configuration files. Anyone with channel access can read Discord replies. Use a private channel for personal information.

## Keep it running

After setup, run the worker for messaging and scheduled tasks:

```fish
bun run start worker run
```

Keep the terminal open. Do not start it alongside another worker using the same data directory. On macOS, the [worker guide](/docs/worker/#macos-login-startup) explains login startup instead.

## Check the connection

Send a short message as described in the service guide. Check the connection in another terminal:

```fish
bun run start gateway status
```

Check your bot or account's connection state. If a reply does not arrive, see [messaging troubleshooting](/docs/troubleshooting/#messaging-does-not-reply).

After chat works, you can [deliver scheduled results](/docs/tasks/#deliver-results-to-discord) to a configured destination. The service guides list the destination options and limits.
