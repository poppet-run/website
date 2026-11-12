+++
title = "Slack"
description = "Connect a Slack app and chat in owner-authorized threads."
+++

# Slack

Slack lets you chat with Poppet in workspace threads. Only the owner you configure can invoke it. Everyone with channel access can read its replies, including saved facts and conversation content.

## Create the app

Create a Slack app for your workspace and enable Socket Mode. Generate an app-level token with `connections:write`. Install the app with these bot scopes:

- `chat:write`
- `channels:read` and `channels:history`
- `groups:read` and `groups:history`
- `reactions:write`
- `files:read`

Subscribe to the `message.channels` and `message.groups` bot events. Invite the bot to an unshared channel. Shared channels and direct messages are not supported.

## Connect Poppet

Run setup and choose Slack when prompted:

```sh
poppet setup
```

Enter your user ID, workspace ID, home channel ID, bot token, and app token. Token input is masked. Or pass all five flags to separate gateway setup, replacing the example values:

```sh
poppet gateway slack setup --owner-id U123 --team-id T123 --home-channel-id C123 --bot-token 'your-bot-token' --app-token 'your-app-token'
```

Direct flags put tokens in shell history. Interactive setup avoids that. The IDs go into the `slack` section of `config.json`; both tokens go into `channels/slack.json` in your data directory with private file permissions. Removing the `slack` section disables Slack and keeps the saved tokens.

Start the combined worker, or restart it after changing settings:

```sh
poppet worker run
```

See [the worker guide](../worker.md) if you installed it as a background service.

## Start a conversation

Mention the bot in a channel to start a session in a thread. Follow-ups in an attached thread need no mention. Only messages from the configured owner in the configured workspace are accepted.

Send `/new` to start a new session, `/status` to inspect it, or `/cancel` to stop the current request. Use `/new --skill <name>` to start with a [skill](../skills.md). These are ordinary messages, not Slack slash commands. Prefix controls with the bot mention where needed.

When a command needs approval, reply with `/approve <id>` or `/deny <id>` using the ID from Poppet's message. Slack uses text replies, without Discord's approval buttons. See [command approval](../commands.md#approve-commands-in-slack).

Images and text files use the [normal attachment limits](../chat.md#attach-files). Downloads require authentication and stay on Slack's file host. Poppet uses eyes and check-mark reactions for progress. It does not show typing indicators or rename Slack threads; session titles remain local.

Poppet saves each answer before sending it. An uncertain send is not automatically repeated. Check the saved answer with `poppet chat show <session-id>` before posting it yourself.

## Deliver scheduled results

With the combined worker running, send results to the home channel:

```sh
poppet tasks add daily-summary --cron "0 9 * * *" --tz Europe/London --to slack "Summarize my recent conversations"
```

Use `--to slack:C123` for another channel, or `--to slack:C123:1730000000.000001` for a thread, replacing the channel ID and thread timestamp. Poppet checks access before saving the destination and again before sending. Posts do not change the thread's session.

An answer of exactly `NO_REPLY`, ignoring surrounding whitespace, completes without posting. Failed tasks can post a short notice with the task name and reason code, without model output or error text. Consecutive failed occurrences post only once; failures older than 24 hours are not queued. Cancelled, interrupted, and expired occurrences post nothing. See [scheduled tasks](../tasks.md#failure-notices) for delivery states and retries.
