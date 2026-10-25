+++
title = "Discord"
description = "Connect a bot and chat in owner-authorized Discord threads."
+++

# Discord

Discord lets you chat with Poppet from a server you control. Only the owner you configure can use the bot. You talk to it in threads, and scheduled results can be posted to a home channel.

## Create the bot

In the [Discord Developer Portal](https://discord.com/developers/applications), create an application and add a bot. Turn on the **Message Content** intent, and invite the bot to your server with the `bot` scope.

Give it these permissions in the channels you want to use: View Channel, Read Message History, Send Messages, Create Public Threads, Send Messages in Threads, and Add Reactions. It does not need Administrator.

With Discord's Developer Mode on, copy the IDs for your user, your server, and a home channel. Choose a home channel that only trusted people can read. Everyone with access to a channel can read Poppet's replies in it, including saved facts and conversation content.

## Connect

Run setup and choose Discord when prompted:

```sh
poppet setup
```

Or save the settings yourself. Poppet reads the token from standard input, so it never appears in your shell history:

{{< shell >}}
```bash
printf 'Discord bot token: '; read -rs discord_token; echo
printf '%s\n' "$discord_token" | poppet gateway discord setup <your-user-id> <server-id> <home-channel-id> --key-stdin
unset discord_token
```

```fish
read --silent --prompt-str 'Discord bot token: ' discord_token
printf '%s\n' $discord_token | poppet gateway discord setup <your-user-id> <server-id> <home-channel-id> --key-stdin
set -e discord_token
```
{{< /shell >}}

The settings go into the `discord` section of `config.json`. The token is saved in a protected file in your data directory. Restart the worker after you change Discord settings:

```sh
poppet worker run
```

On macOS, if the login worker is installed, run `poppet worker stop` and then `poppet worker start`.

## Start a conversation

Mention the bot in any text channel of your server, with your message. It opens a thread and replies there. You can also mention it inside an existing thread to attach a session. After that, follow-up messages in the thread do not need a mention.

Each thread keeps its own session, with its own history and model, even after a restart. Poppet does not import earlier messages from a thread.

To start a fresh session, use `/new`. Add `--skill <name>` to use a [skill](../skills.md):

```text
@Poppet /new --skill weekly-review Review my Acorn project
```

In a thread, `/status` shows the session, its skill, and its latest run. `/cancel` stops the active request and any that are queued.

These are plain messages, not Discord slash commands. The bot ignores other bots, webhooks, and anyone who is not the owner. Direct messages, forum channels, attachments, and voice are not supported.

While it works, the bot shows the typing indicator. It also adds 👀 to your message, then replaces it with ✅ when the run succeeds. If the bot lacks reaction permission, chat still works.

## Thread names

Poppet names the threads it creates, using a title from the conversation once the first answer is sent. Renaming a session with `poppet chat rename` also renames its thread, while the worker is running. Poppet only renames threads it created. If you rename a thread yourself, Poppet stops changing its name.

## Replies and failures

Poppet saves each answer before it sends it. Poppet retries temporary send failures without asking the model again. If a send's result is unclear, Poppet does not send it again, because Discord may have already posted it. Check the saved answer with `poppet chat show <session-id>` and post it yourself if needed.

Poppet never moves a reply to another channel. If it can no longer post in a thread, the reply stays unsent, and the saved answer is still in `chat show`.

Use `poppet gateway status` to check the connection and delivery queue.

## Approve commands

If a command needs your approval before Poppet runs it, the bot posts the command in the thread. Reply with the ID shown:

```text
/approve <id>
/deny <id>
```

Only the owner can answer, and each approval covers one command. Requests expire after two minutes. See [run commands](../commands.md).

## Scheduled results

To send a task's results to the home channel, add `--channel discord` when you create it:

```sh
poppet tasks add daily-summary --cron "0 9 * * *" --tz Europe/London --channel discord "Summarize my recent conversations"
```

Add `--conversation <channel-or-thread-id>` to send results somewhere else in the same server. Poppet posts results as standalone messages, so they do not change any conversation. Scheduled results need the combined worker, `poppet worker run`. See [scheduled tasks](../tasks.md#deliver-results-to-discord).

## Schedule through chat

Ask Poppet in the thread to create or manage a task. A task created this way posts to the home channel by default. Ask for the current thread, or for a specific channel by mention, to change where it posts. See [scheduled tasks](../tasks.md#manage-tasks-from-chat).
