+++
title = "Slack"
description = "Create a Slack app for Poppet and chat with it in threads."
+++

# Slack

Chat with Poppet through a Slack app in your workspace. Only you can use the app. You talk to it in threads, and it can post scheduled results to a home channel.

Anyone who can read a channel can read Poppet's replies there, including your saved facts and conversations. Use a private channel that only trusted people can see.

## Create the app

1. At [api.slack.com/apps](https://api.slack.com/apps), create an app for your workspace.
2. Turn on **Socket Mode**, and create an app-level token with the `connections:write` scope. Socket Mode means Slack does not need to reach your computer from the internet.
3. Under **OAuth & Permissions**, add these bot token scopes: `chat:write`, `channels:read`, `channels:history`, `groups:read`, `groups:history`, `reactions:write`, and `files:read`.
4. Under **Event Subscriptions**, subscribe to the `message.channels` and `message.groups` bot events.
5. Turn on **Interactivity & Shortcuts**, so you can approve commands with buttons.
6. Install the app to your workspace and copy its bot token.
7. Invite the app to the channels you want to use.

Poppet works in ordinary public and private channels. It does not answer direct messages, group messages, archived channels, or channels shared with another organization.

Setup asks for three IDs, so find them first:

- Your member ID, which starts with `U`. Open your Slack profile, choose the ⋮ menu, then **Copy member ID**.
- Your workspace ID, which starts with `T`. Open Slack in a browser. It is the part of the address after `/client/`.
- The home channel's ID, which starts with `C`. Open the channel's details. The ID is at the bottom.

## Connect

Run setup and choose Slack when it asks:

```sh
poppet setup
```

Setup asks for the three IDs, the bot token, and the app token. The tokens are hidden as you type them.

Then start the worker, or restart it if it is already running:

```sh
poppet worker run
```

If the worker starts at login, run `poppet worker restart` instead.

Poppet saves the IDs in the `slack` section of `config.json`, and the tokens in a protected file. To turn Slack off, remove the `slack` section and restart the worker. To change settings without `poppet setup`, see [the command line reference](../cli.md#messaging).

## Start a conversation

Mention the app with your message in a channel. It replies in a thread. After that, you do not need to mention it again in that thread.

While Poppet works, it adds 👀 to your message, and replaces it with ✅ when it finishes. Slack does not show Poppet typing, and Poppet does not rename threads.

Attach images or text files to your message. A message with files does not need any text. See [attach files](../chat.md#attach-files) for the types and sizes Poppet accepts.

## Thread commands

Type these as ordinary messages in a thread. They are not Slack slash commands.

| Message | What it does |
| ------- | ------------ |
| `/new <message>` | Starts a new conversation in this thread |
| `/new --skill <name> <message>` | Starts a new conversation using a [skill](../skills.md) |
| `/status` | Shows the conversation and its latest answer |
| `/cancel` | Stops the current answer and any waiting messages |

In a channel, mention the app first. To use a skill for one message without starting a new conversation, [name it](../skills.md#name-a-skill-in-a-message) with `$`, such as `Run $weekly-review for Acorn`.

## Approve commands

When a command needs your approval, Poppet posts it in the thread with **Approve once** and **Deny** buttons. You can also reply with `/approve <id>` or `/deny <id>`, using the ID it shows. Each approval covers one command, and a request expires after two minutes. See [run commands](../commands.md#approve-a-command). [Reviewed MCP actions](../mcp.md#review-an-action) work the same way.

## Scheduled results

Add `--to slack` to post a task's results in the home channel:

```sh
poppet tasks add daily-summary --cron "0 9 * * *" --tz Europe/London --to slack "Summarize my recent conversations"
```

Use `--to slack:<channel-id>` for another channel, or `--to slack:<channel-id>:<thread-timestamp>` for a thread. See [send results to a gateway](../tasks.md#send-results-to-a-gateway).

You can also ask Poppet in a thread to schedule a task. By default, its results go to the home channel. Ask for "this thread" or give another channel to post there instead.

## If a reply goes missing

Poppet saves each answer before it posts it. If Poppet cannot tell whether a post reached Slack, it does not post it again, to avoid a duplicate. Check the thread, then read the saved answer with `poppet chat show <session-id>` if you need it.

If the connection to Slack drops, Poppet tries again after 30 seconds. Run `poppet worker status` to check that Slack is connected. See [troubleshooting](../troubleshooting.md#a-gateway-does-not-reply).
