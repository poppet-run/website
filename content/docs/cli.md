+++
title = "Command line"
description = "Every Poppet command, with links to the guide for each one."
+++

# Command line

This page lists every `poppet` command. Words in angle brackets, such as `<task-id>`, are placeholders for your own values. Put quotes around messages and values that contain spaces.

For help with any command, add `--help`:

```sh
poppet --help
poppet tasks add --help
```

Help works before you set anything up. If you type a command wrong, Poppet shows its help.

## Messages that look like options

Once a message, fact, or task prompt starts, Poppet treats the rest of the command as part of it, including words that look like options. If the text itself starts with `-`, put `--` before it:

```sh
poppet chat new -- "--help is a common flag. What does it do?"
```

## Output for scripts

Commands print tables and short confirmations, with times in your local time zone. Set `NO_COLOR=1` to turn off colour.

Most commands that show information accept `--json`, which prints every detail as JSON for scripts. Times in JSON are milliseconds since 1970. Put `--json` before any message text:

```sh
poppet tasks list --json
poppet memory set --json project "Poppet"
```

## Tab completion

Poppet can complete commands and options when you press Tab. It does not complete session IDs or skill names. Set it up once for your shell, and again after you update Poppet:

{{< shell >}}
```bash {label="bash"}
mkdir -p ~/.local/share/bash-completion/completions
poppet --completions bash > ~/.local/share/bash-completion/completions/poppet
```

```zsh
# Add ~/.zsh/completions to fpath in ~/.zshrc, before compinit runs:
# fpath=(~/.zsh/completions $fpath)
mkdir -p ~/.zsh/completions
poppet --completions zsh > ~/.zsh/completions/_poppet
```

```fish
mkdir -p ~/.config/fish/completions
poppet --completions fish > ~/.config/fish/completions/poppet.fish
```
{{< /shell >}}

## Setup and settings

| Command | What it does |
| ------- | ------------ |
| `setup` | Choose a provider and model, connect a gateway, and start the worker |
| `config` | Show your settings and where Poppet found them |
| `doctor` | Check your setup for problems |
| `store status` | Show where your data is, and how many conversations it holds |

`setup` needs an interactive terminal. It starts from your current settings, and leaves alone anything you skip. Sign-ins are saved as soon as you finish them. Everything else is saved at the end, so cancelling partway keeps only your sign-ins. See [getting started](getting-started.md#2-run-setup) and [doctor](doctor.md).

## Providers

| Command | What it does |
| ------- | ------------ |
| `provider login [provider]` | Sign in, or save an API key |
| `provider status [provider]` | Show whether you are signed in |
| `provider models [provider]` | List the models you can use |
| `provider logout [provider]` | Sign out, or delete the saved API key |

| Option | Used with | What it does |
| ------ | --------- | ------------ |
| `--no-browser` | `login` | Print a ChatGPT sign-in link instead of opening a browser |
| `--callback-port <port>` | `login` | Choose the port ChatGPT sign-in returns to |
| `--forget` | `logout` | Also forget your ChatGPT account, so you can switch accounts |

Without a provider name, these commands use the `provider` in `config.json`. See [ChatGPT](providers/openai-chatgpt.md), [OpenRouter](providers/openrouter.md), [OpenCode](providers/opencode.md), and [OpenCode Go](providers/opencode-go.md).

## Chat

| Command | What it does |
| ------- | ------------ |
| `chat new <message>` | Start a conversation |
| `chat send <session-id> <message>` | Continue a conversation |
| `chat [session-id]` | Open the interactive prompt |
| `chat sessions` | List your conversations |
| `chat show <session-id>` | Show a conversation and details of each answer |
| `chat search <words>` | Search your conversations |
| `chat rename <session-id> <title>` | Rename a conversation |
| `chat delete <session-id>...` | Delete conversations |
| `chat prune --days <n>` | Delete conversations with no activity for n days |

| Option | Used with | What it does |
| ------ | --------- | ------------ |
| `--skill <name>` | `chat`, `new` | Use a skill for the whole conversation |
| `--attach <path>` | `new`, `send` | Attach a file, and repeat for more files |
| `--dry-run` | `prune` | List what would be deleted, without deleting it |

Put options before the message. See [chat](chat.md).

## Memory

| Command | What it does |
| ------- | ------------ |
| `memory list` | List saved facts |
| `memory set <key> <value>` | Save a fact, or replace it |
| `memory forget <key>` | Forget a fact |
| `memory history <key>` | Show every version of a fact |
| `memory revert <key> <version>` | Go back to an earlier version |

See [memory](memory.md).

## Skills

| Command | What it does |
| ------- | ------------ |
| `skills list` | List your skills |
| `skills show <name>` | Show a skill, or what is wrong with its file |

See [skills](skills.md).

## Scheduled tasks

| Command | What it does |
| ------- | ------------ |
| `tasks add <name> <prompt>` | Create a task, with `--in`, `--at`, or `--cron` to set when it runs |
| `tasks list` | List your tasks |
| `tasks show <task-id>` | Show a task's runs, results, and note |
| `tasks edit <task-id>` | Change a task's name, prompt, schedule, or end time |
| `tasks run <task-id>` | Run a task now |
| `tasks pause <task-id>` | Pause a task |
| `tasks resume <task-id>` | Resume a paused task |
| `tasks cancel <task-id>` | Cancel a task's current or next run |
| `tasks retry <task-id>` | Run a failed run again |
| `tasks clear-note <task-id>` | Clear a task's note |
| `tasks remove <task-id>` | Delete a task and its history |
| `tasks clear` | Delete every task and all task history |

| Option | Used with | What it does |
| ------ | --------- | ------------ |
| `--in <delay>` | `add` | Run once, after a delay such as `30m` |
| `--at <time>` | `add`, `edit` | Run once, at a date and time |
| `--cron <schedule>` | `add`, `edit` | Run on a repeating schedule, with `--tz` or your [`timeZone`](configuration.md#time-zone) |
| `--tz <time-zone>` | `add`, `edit` | Set the time zone for `--cron`, instead of [`timeZone`](configuration.md#time-zone) |
| `--until <time>` | `add`, `edit` | End a repeating task, or remove the end with `none` |
| `--skill <name>` | `add` | Follow a [skill](skills.md) |
| `--to <gateway>` | `add` | Post results to a [messaging gateway](gateways/_index.md) |
| `--name <name>` | `edit` | Rename the task |
| `--prompt <prompt>` | `edit` | Change the prompt |
| `--occurrence <id>` | `cancel`, `retry` | Choose a run from `tasks show` |

Put options before the prompt. Each task's ID is in `tasks list`. See [scheduled tasks](tasks.md).

## Worker

| Command | What it does |
| ------- | ------------ |
| `worker run` | Run the worker in this terminal |
| `worker install` | Start the worker now and at every login |
| `worker start` | Start the installed worker |
| `worker stop` | Stop the worker until you start it or next log in |
| `worker restart` | Restart the worker, cancelling answers in progress |
| `worker status` | Show what the worker is doing |
| `worker logs` | Show the end of the worker's log |
| `worker uninstall` | Stop the worker starting at login |

While the worker runs, other commands go through it. See [worker](worker.md).

## Messaging

`poppet setup` can connect Discord and Slack for you. These commands connect a gateway without the interactive prompts, for example from a script. Telegram can only be connected this way.

| Command | What it does |
| ------- | ------------ |
| `gateway discord setup` | Connect Discord |
| `gateway slack setup` | Connect Slack |
| `gateway telegram setup` | Connect Telegram |

| Option | Used with | What it does |
| ------ | --------- | ------------ |
| `--owner-id <id>` | `discord`, `slack`, `telegram` | Set your user ID |
| `--guild-id <id>` | `discord` | Set your server ID |
| `--team-id <id>` | `slack` | Set your workspace ID |
| `--home-channel-id <id>` | `discord`, `slack` | Set the home channel's ID |
| `--chat-id <id>` | `telegram` | Set the chat's ID |
| `--home-conversation-id <id>` | `telegram` | Set the home conversation, if it is not the chat itself |
| `--bot-token <token>` | `telegram` | Set the bot token |

For Discord and Slack, pass the tokens through standard input, to keep them out of your shell history. For Slack, put the bot token on the first line and the app token on the second:

```sh
printf '%s\n' "$DISCORD_BOT_TOKEN" | poppet gateway discord setup --owner-id <user-id> --guild-id <server-id> --home-channel-id <channel-id>
printf '%s\n%s\n' "$SLACK_BOT_TOKEN" "$SLACK_APP_TOKEN" | poppet gateway slack setup --owner-id <user-id> --team-id <workspace-id> --home-channel-id <channel-id>
```

Telegram takes its bot token as an option. To keep it out of your shell history, read it into a variable first, as the [Telegram guide](gateways/telegram.md#connect-poppet) shows.

See [Discord](gateways/discord.md), [Slack](gateways/slack.md), and [Telegram](gateways/telegram.md).

## MCP

| Command | What it does |
| ------- | ------------ |
| `mcp add <name> <url>` | Add a remote server |
| `mcp login <name>` | Sign in to a server |
| `mcp logout <name>` | Delete a server's saved sign-in |
| `mcp servers` | List your servers and their status |
| `mcp tools <name>` | List a server's tools and which ones you allowed |
| `mcp allow <name> <tools...>` | Allow tools |
| `mcp deny <name> <tools...>` | Stop Poppet using tools |
| `mcp remove <name>` | Remove a server and its saved key or sign-in |

| Option | Used with | What it does |
| ------ | --------- | ------------ |
| `--auth <type>` | `add` | Choose how to sign in: `none`, `api-key`, or `oauth` |
| `--no-browser` | `login` | Print a sign-in link instead of opening a browser |
| `--callback-port <port>` | `login` | Choose the port sign-in returns to |
| `--all` | `allow` | Allow every tool the server has now, instead of naming them |
| `--scheduled` | `allow` | Also allow the tools in scheduled tasks |
| `--scheduled` | `deny` | Stop only scheduled tasks using the tools |

Restart the worker after you change servers or tools. See [MCP tools](mcp.md).
