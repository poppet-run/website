+++
title = "Telegram"
description = "Connect a Telegram bot, and chat with Poppet privately, in a group, or in forum topics."
+++

# Telegram

You can chat with Poppet through a Telegram bot that you create. It works in one chat that you choose, and only answers you. Everyone else in that chat can read its replies, including your saved facts and anything from your conversations, so a private chat is safest.

## Create the bot

1. In Telegram, message [@BotFather](https://t.me/BotFather) and create a bot. Copy the token it gives you, and keep it private.
2. Send your new bot a message.
3. For manual ID lookup, open `https://api.telegram.org/bot<token>/getUpdates` in a browser, with your token in place of `<token>`. Your user ID is the number after `"from":{"id":`.
4. Choose the chat Poppet will use:
   - For a private chat with the bot, the chat ID is your user ID.
   - For a group, add the bot to the group, send a message there, and open the same address again. The chat ID is the number after `"chat":{"id":`. Group IDs start with `-`.

In a group with forum topics, make the bot an administrator with **Manage Topics**. In other groups, make it an administrator, or turn off privacy mode in BotFather, so it can see your follow-up messages.

Do not set a webhook for the bot, and do not use its token in any other program. Poppet checks for new messages itself, and only one program can do that per bot.

## Connect Poppet

Run setup and choose Telegram:

```sh
poppet setup gateways
```

Setup checks the token and offers accounts and chats from recent messages to the bot. Send the bot a private message so your account appears. For a group, add the bot and mention it there too. You can type IDs instead if the lists are empty or a running worker prevents setup from reading recent messages. Setup leaves those messages queued, so the worker still answers them later.

For a group, setup asks for a home conversation for scheduled results. Keep the chat ID for the whole group, or enter `<chat-id>:<topic-id>` for a forum topic. Review your choices before saving.

To connect without interactive setup, use this command. It reads the token without saving it in your shell history:

{{< shell >}}
```bash {label="bash"}
IFS= read -r -s -p 'Telegram bot token: ' telegram_token; echo
poppet gateway telegram setup --owner-id <user-id> --chat-id <chat-id> --bot-token "$telegram_token"
unset telegram_token
```

```zsh
read -r -s 'telegram_token?Telegram bot token: '; echo
poppet gateway telegram setup --owner-id <user-id> --chat-id <chat-id> --bot-token "$telegram_token"
unset telegram_token
```

```fish
read --silent --prompt-str 'Telegram bot token: ' telegram_token
poppet gateway telegram setup --owner-id <user-id> --chat-id <chat-id> --bot-token "$telegram_token"
set --erase telegram_token
```
{{< /shell >}}

Scheduled results go to the chat itself. To send them to a forum topic instead, add `--home-conversation-id <chat-id>:<topic-id>`.

Poppet saves your Telegram settings and token in `channels/telegram.json` in your [data directory](../configuration.md#data-directory), where only your user account can read them. Telegram has no settings in `config.json`.

Start the worker, or restart it if it is already running:

```sh
poppet worker restart
```

To turn Telegram off, delete `channels/telegram.json` and restart the worker.

## Start a conversation

- **Private chat.** Send a message. The whole chat is one conversation.
- **Group.** Mention the bot or reply to it. The whole group is one conversation.
- **Group with forum topics.** Mention the bot in General, and Poppet opens a new topic for your request. Each topic is its own conversation. To start in an existing topic, mention the bot there.

Once a conversation has started, you can carry on without mentioning the bot, as long as the bot can see your messages. Poppet reacts with 👀 while it works and 👍 when it finishes.

Poppet only reads text. It does not accept photos or files. Replies are plain text, so any Markdown formatting shows as typed.

Poppet names each topic it opens after the conversation's title. If you rename a topic yourself, Poppet stops renaming it. After the worker restarts, Poppet can rename a topic again only once Telegram tells it the topic's current name.

## Commands in a conversation

Send these as ordinary messages:

| Message | What it does |
| ------- | ------------ |
| `/new <message>` | Starts a new conversation |
| `/new --skill <name> <message>` | Starts a new conversation using a [skill](../skills.md) |
| `/status` | Shows the conversation and its latest answer |
| `/cancel` | Stops the current answer and any waiting messages |

Telegram's own style also works, such as `/status@YourBot`.

## Approve an action

When a [command](../commands.md) or [MCP action](../mcp.md#review-an-action) needs your approval, Poppet shows what it wants to do with **Approve once** and **Deny** buttons. If **Show details** appears, tap it to read the full command or call details. Poppet posts those details in the same chat or forum topic.

You can also reply in the same conversation if you have the approval ID:

```text
/approve <id>
/deny <id>
```

Poppet removes the buttons and shows the outcome when the request ends. Only you can answer. **Approve once** covers that one action. A request expires after one hour by default, set with [`timeouts.approvalSeconds`](../configuration.md#timeouts-and-limits). Pending approvals survive worker restarts until they expire. Reply with `/cancel` to cancel one, or send a new message in the same session to replace the waiting answer. See [approval requests](../commands.md#approve-a-command).

When **Always allow** appears, it approves the action and saves a rule for later calls. You can also reply with `/approve-always <id>`. Use `/approvals list` to see saved rules, `/approvals revoke <rule-id>` to revoke one, or `/approvals revoke all` to revoke them all. Read [saved approval rules](../commands.md#save-an-approval-rule) for what each rule permits and when it applies.

## Send scheduled results

Add `--to telegram` when you create a [scheduled task](../tasks.md), to post its results to the chat or home topic:

```sh
poppet tasks add daily-summary --cron "0 9 * * *" --tz Europe/London --to telegram "Summarize my recent conversations"
```

| Option | Posts to |
| ------ | -------- |
| `--to telegram` | The chat, or the home topic if you set one |
| `--to telegram:<chat-id>` | The chat |
| `--to telegram:<chat-id>:<topic-id>` | A forum topic in the chat |

Poppet only posts to the chat you connected. Results need the [worker](../worker.md) running.

## If something goes wrong

Run `poppet worker status`, and check:

- your user ID and chat ID
- that the bot is still in the group, with the permissions above
- that no webhook is set, and no other program uses the token

If Telegram rejects the token, run the setup command again with a new one.

Sometimes Poppet cannot tell whether a post reached Telegram. Posting it again could show it twice, so check the chat first. To read the saved answer, run `poppet chat show <session-id>`.

When the worker starts, Poppet answers messages that arrived while it was stopped. It never answers the same message twice.
