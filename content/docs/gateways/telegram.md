+++
title = "Telegram"
description = "Connect a bot and chat privately, in a group, or in forum topics."
+++

# Telegram

Chat with Poppet through a Telegram bot. Only the configured owner can invoke it, in one configured chat. Everyone who can read that chat can read its replies, including saved facts and conversation content.

## Create the bot

Create a bot with [@BotFather](https://t.me/BotFather) and copy its token. Message the bot, then read `from.id` in the Bot API's `getUpdates` response to find your numeric user ID. For a private chat, the chat ID is your user ID. For a group, add the bot and read `chat.id`; supergroup IDs start with `-100`.

For a forum, make the bot an administrator with **Manage Topics**. In other groups, make it an administrator or disable privacy mode in BotFather so it can receive follow-up messages without a mention.

Poppet uses long polling. Do not configure a webhook, and run only one worker per bot token.

## Connect Poppet

Telegram uses named setup flags; it is not part of the interactive `poppet setup` flow. Read the token without putting it in shell history:

```fish
read --silent --prompt-str 'Telegram bot token: ' telegram_token
poppet gateway telegram setup --owner-id <your-user-id> --chat-id <chat-id> --bot-token "$telegram_token"
set -e telegram_token
poppet worker run
```

The bot token is required. Add `--home-conversation-id <chat-id>:<topic-id>` to use a forum topic for scheduled results. Otherwise, home defaults to the configured chat. Negative group IDs work as values for both flags.

All Telegram settings, including the token, are saved in `<data directory>/channels/telegram.json` with `0600` permissions. There is no `telegram` section in `config.json`. Restart an existing worker after changing settings. Removing this file disables Telegram after a worker restart.

## Start a conversation

- In your private chat with the bot, every message is addressed to it. The whole chat is one conversation.
- In a group or non-forum supergroup, mention the bot or reply to it to start. The whole chat is one conversation.
- In a forum supergroup, mention the bot in General to open a topic for the request. Each topic is a conversation. Mention the bot to start in an existing topic.

After a conversation starts, the owner can continue without mentioning the bot, provided Telegram delivers those messages. Only text messages are read; attachments are not supported. Replies are plain text, so Markdown appears as written. Poppet reacts with eyes while working and a thumbs-up when finished.

Use `/status`, `/cancel`, and `/new` as ordinary messages. `/new --skill <name>` starts a fresh session with a [skill](../skills.md). Bot mentions and command suffixes such as `/status@YourBot` are stripped before Poppet handles the text.

Poppet names topics it creates after the session title. An external topic rename stops automatic renaming. After a worker restart, Poppet cannot rename a topic until it has learned the name again from a topic event.

## Approve an action

For [commands](../commands.md) and [MCP actions](../mcp.md#review-an-action) that need approval, Poppet posts the proposed action and an approval ID. Reply `/approve <id>` or `/deny <id>` in the same conversation. Only the owner can answer. Approval permits one execution and expires after two minutes, cancellation, or worker restart. Telegram has no approval buttons.

## Deliver scheduled results

Use `--to telegram` for the configured home conversation:

```fish
poppet tasks add daily-summary --cron "0 9 * * *" --tz Europe/London --to telegram "Summarize my recent conversations"
```

Use `--to telegram:<chat-id>` for the configured chat, or `--to telegram:<chat-id>:<topic-id>` for one of its forum topics. Destinations outside the configured chat are rejected. Scheduled delivery needs `poppet worker run`; see [scheduled tasks](../tasks.md).

## Connection and delivery problems

Check `poppet worker status --json`, the configured owner and chat IDs, and the bot's membership and topic permissions. A rejected token needs setup again. A conflicting polling client or webhook must be stopped or removed.

Telegram has no idempotency key. If a send or topic creation has an uncertain outcome, retrying it may duplicate it. Check the chat and the saved answer with `poppet chat show <session-id>` before posting again. Poppet processes queued Telegram updates when the worker starts and ignores messages the gateway has already accepted.
