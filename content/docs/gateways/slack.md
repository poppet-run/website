+++
title = "Slack"
description = "Connect a Socket Mode app and chat in owner-authorized Slack threads."
+++

# Slack

Chat with Poppet through a Slack app in your workspace. Only the configured owner can invoke it, but everyone with channel access can read its replies, including saved facts and conversation content. Choose a home channel that only trusted people can read.

## Create the app

Create a Slack app for your workspace and enable Socket Mode. Generate an app-level token with `connections:write`. Install the app with these bot scopes:

- `chat:write`
- `channels:read` and `channels:history`
- `groups:read` and `groups:history`
- `reactions:write`
- `files:read`

Subscribe to the `message.channels` and `message.groups` bot events. Invite the bot to an unshared channel. Shared channels and direct messages are unsupported.

## Connect

Run setup for masked entry of the bot and app tokens:

```fish
poppet setup
```

Or pass all five named flags for separate gateway setup:

```fish
poppet gateway slack setup --owner-id <your-user-id> --team-id <workspace-id> --home-channel-id <home-channel-id> --bot-token <bot-token> --app-token <app-token>
```

Direct flags put tokens in command arguments and shell history. Use `poppet setup` to avoid that.

Ordinary settings go under `slack` in `config.json`. Both tokens are saved in `<data directory>/channels/slack.json` with private file permissions. Removing the `slack` section disables the adapter and keeps the tokens.

Start the [worker](../worker.md):

```fish
poppet worker run
```

After changing settings, stop and restart a foreground worker. For an installed login service, run `poppet worker restart`.

## Start a conversation

Mention the bot with a message to start a session in a thread. Follow-up messages in an attached thread need no mention. `/new` starts a fresh session; add `--skill <name>` to select a [skill](../skills.md). `/status` shows the session and latest run, and `/cancel` stops active and queued requests.

These controls are ordinary messages, not Slack slash commands. Prefix them with the bot mention where needed. Only the configured owner can use them.

Attach images or text files using the [normal attachment types and limits](../chat.md#attach-files). Poppet downloads files through Slack's authenticated file host. Progress uses eyes and check-mark reactions. Typing indicators and remote thread naming are not implemented; session titles stay local.

You can also [name a skill](../skills.md#name-a-skill-in-a-message) with `$name` in a message to use it for that turn without starting a new session.

## Approve commands

When a command needs approval, reply with `/approve <id>` or `/deny <id>` using the ID shown in the thread. Only the owner can answer. Approval covers one command and expires after two minutes, cancellation, or worker restart. See [run commands](../commands.md).

## Scheduled results

Use `--to slack` to deliver to the home channel:

```fish
poppet tasks add daily-summary --cron "0 9 * * *" --tz Europe/London --to slack "Summarize my recent conversations"
```

Use `--to slack:<channel-id>` for another channel, or `--to slack:<channel-id>:<thread-timestamp>` for a thread. For example, `--to slack:C123:1730000000.000001` selects a thread in channel `C123`.

An answer of exactly `NO_REPLY`, ignoring surrounding whitespace, completes without posting. See [quiet completion](../tasks.md#stay-quiet-when-there-is-nothing-to-report).

Replies are saved before delivery. An uncertain send is not automatically repeated; inspect `poppet tasks show <task-id>` and the destination before posting again. Failed scheduled runs can post a short [failure notice](../tasks.md#failure-notices). Results and notices do not change the destination's conversation session.

Ask Poppet in chat to create or manage tasks. A task created in messaging posts to the home channel by default. Ask for the current thread or supply another destination ID to change where it posts. See [scheduled tasks](../tasks.md#manage-tasks-from-chat).

## Troubleshooting

Use `poppet worker status` to inspect the connection and delivery queue. Check the owner, workspace, and home-channel IDs, both tokens, Socket Mode, event subscriptions, scopes, and channel membership. Restart the worker after changing settings.

Live verification requires a real Slack app. Check mentions and thread replies, owner rejection, attachments, cancellation, command approval, scheduled results and failure notices, and worker reconnection after restart.
