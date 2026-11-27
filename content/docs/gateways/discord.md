+++
title = "Discord"
description = "Create a Discord bot for Poppet and chat with it in threads."
+++

# Discord

Chat with Poppet in a Discord server you control. Only you can use the bot. You talk to it in threads, and it can post scheduled results to a home channel.

Anyone who can read a channel can read Poppet's replies there, including your saved facts and conversations. Use a private server, or channels only trusted people can see.

## Create the bot

1. In the [Discord Developer Portal](https://discord.com/developers/applications), create an application, then add a bot to it.
2. On the bot's page, turn on **Message Content Intent**, and copy the bot's token.
3. Invite the bot to your server with the `bot` scope.
4. In the channels you want to use, give the bot these permissions: View Channel, Read Message History, Send Messages, Create Public Threads, Send Messages in Threads, and Add Reactions. It does not need Administrator.
5. In Discord, turn on Developer Mode under Settings, then Advanced. Right-click to copy the ID of your user, your server, and the channel you want as the home channel.

## Connect

Run setup and choose Discord when it asks:

```sh
poppet setup gateways
```

Setup checks the bot token, suggests the application owner as your user ID, and offers the bot's servers and text channels. For a team-owned application, it suggests the team owner. Check that the suggested user is you. You can type any ID instead. The token is hidden as you type it. Review your choices before saving.

Then start the worker, or restart it if it is already running:

```sh
poppet worker run
```

If the worker starts at login, run `poppet worker restart` instead.

Poppet saves the IDs in the `discord` section of `config.json`, and the token in a protected file. To turn Discord off, remove the `discord` section and restart the worker. To change settings without `poppet setup`, see [the command line reference](../cli.md#messaging).

## Start a conversation

Mention the bot with your message in any text channel. It opens a thread and replies there. You can also mention it in an existing thread. After that, you do not need to mention it again in that thread.

Each thread is its own conversation, and keeps its history after a restart. Poppet does not read messages from before you mentioned it.

While Poppet works, Discord shows it typing, and it adds 👀 to your message. When it finishes, it replaces 👀 with ✅.

Poppet does not answer direct messages, forum channels, voice channels, other bots, or anyone except you.

## Thread commands

Type these as ordinary messages in a thread. They are not Discord slash commands.

| Message | What it does |
| ------- | ------------ |
| `/new <message>` | Starts a new conversation in this thread |
| `/new --skill <name> <message>` | Starts a new conversation using a [skill](../skills.md) |
| `/status` | Shows the conversation, its skill, and its latest answer |
| `/cancel` | Stops the current answer and any waiting messages |

In a channel, mention the bot first:

```text
@Poppet /new --skill weekly-review Review my Acorn project
```

To use a skill for one message without starting a new conversation, [name it](../skills.md#name-a-skill-in-a-message) with `$`, such as `Run $weekly-review for Acorn`.

## Thread names

Poppet names each thread it creates after the conversation, once it sends its first answer. When you rename a conversation with `poppet chat rename`, Poppet renames the thread too. If you rename a thread yourself, Poppet leaves its name alone from then on.

## Attachments

Attach images or text files to your message. A message with files does not need any text. See [attach files](../chat.md#attach-files) for the types and sizes Poppet accepts. If Poppet refuses a file, it does not answer the message.

## Approve commands

When a command needs your approval, Poppet posts it in the thread with **Approve once** and **Deny** buttons. The prompt shows when the request expires. If **Show details** appears, click it to read the full command or call details in a reply only you can see. Longer details arrive as an `approval-details.json` attachment.

Poppet removes the buttons and shows the outcome when the request ends. You can also reply if you have the approval ID:

```text
/approve <id>
/deny <id>
```

**Approve once** covers one command. A request expires after one hour by default, set with [`timeouts.approvalSeconds`](../configuration.md#timeouts-and-limits). Pending approvals survive worker restarts until they expire. Reply with `/cancel` to cancel one, or send a new message in the same session to replace the waiting answer. See [run commands](../commands.md#approve-a-command). [Reviewed MCP actions](../mcp.md#review-an-action) work the same way.

When **Always allow** appears, it approves the action and saves a rule for later calls. You can also reply with `/approve-always <id>`. Use `/approvals list` to see saved rules, `/approvals revoke <rule-id>` to revoke one, or `/approvals revoke all` to revoke them all. Read [saved approval rules](../commands.md#save-an-approval-rule) for what each rule permits and when it applies.

## Scheduled results

Add `--to discord` to post a task's results in the home channel:

```sh
poppet tasks add daily-summary --cron "0 9 * * *" --tz Europe/London --to discord "Summarize my recent conversations"
```

Use `--to discord:<channel-or-thread-id>` to post somewhere else in the same server. See [send results to a gateway](../tasks.md#send-results-to-a-gateway).

You can also ask Poppet in a thread to schedule a task. By default, its results go to the home channel. Ask for "this thread" or mention another channel to post there instead.

## If a reply goes missing

Poppet saves each answer before it posts it, and retries if Discord is briefly unavailable. If Poppet cannot tell whether a post reached Discord, it does not post it again, to avoid a duplicate. Check the thread, then read the saved answer with `poppet chat show <session-id>` if you need it.

Run `poppet worker status` to check that Discord is connected. See [troubleshooting](../troubleshooting.md#a-gateway-does-not-reply).
