+++
title = "Command line"
description = "Look up commands for chat, providers, memory, skills, tasks, messaging, web search, MCP, and the worker."
+++

# Command line

After [installing the command](getting-started.md#1-install-poppet), run `poppet` from any directory. Run `poppet --help` for the top-level list, or add `--help` to any command, for example `poppet tasks add --help`. Help needs no model or login.

Angle-bracket values are placeholders. Replace them before you run a command, and quote prompts and values that contain spaces. The remaining words of a message, memory value, or task prompt are joined with spaces. Use `--` before text that begins with `--help` or `-h`.

## Configuration and storage

| Command        | Action                                                                              |
| -------------- | ----------------------------------------------------------------------------------- |
| `setup`        | Choose a provider and model, configure Discord, and offer to install the worker. Needs an interactive terminal. |
| `config`       | Print validated settings, without opening the database or contacting a provider.    |
| `store status` | Open or upgrade the database and print its path, version, and counts.               |

See [configuration](configuration.md) and [storage](storage.md).

## Providers and models

Provider commands take a provider ID, or `--provider <id>`. Without one, they use the `provider` from `config.json`.

| Command                                   | Action                                  |
| ----------------------------------------- | --------------------------------------- |
| `provider login [provider] [--key-stdin]` | Sign in, or save an API key.            |
| `provider status [provider]`              | Show connection status without secrets. |
| `provider models [provider]`              | List available models.                  |
| `provider logout [provider]`              | Remove that provider's saved connection. |

`--key-stdin` reads an API key from standard input. See [ChatGPT](providers/openai-chatgpt.md), [OpenRouter](providers/openrouter.md), and [OpenCode Go](providers/opencode-go.md).

## Chat

| Command                                                  | Action                                                       |
| -------------------------------------------------------- | ------------------------------------------------------------ |
| `chat new [--coding] [--skill <name>] <message>`         | Start a session with the configured provider and model.      |
| `chat send <session> <message>`                          | Send a message in a saved session.                           |
| `chat interactive [session] [--coding] [--skill <name>]` | Open a terminal prompt for a new or saved session.           |
| `chat sessions`                                          | List saved sessions.                                         |
| `chat show <session>`                                    | Print messages, tool calls, and run outcomes as JSON.        |
| `chat rename <session> <title>`                          | Rename a session. Needs no model or login.                   |
| `chat search <query>`                                    | Search completed conversations. Needs no model or login.     |

See [chat](chat.md).

## Memory

| Command                          | Action                                              |
| -------------------------------- | --------------------------------------------------- |
| `memory list`                    | List saved facts.                                   |
| `memory remember <key> <value>`  | Save a new fact.                                    |
| `memory replace <key> <value>`   | Change an existing fact.                            |
| `memory forget <key>`            | Delete a fact.                                      |
| `memory history <key>`           | Show a fact's revisions, their origin, and source run. |
| `memory revert <key> <revision>` | Restore an earlier revision as a new revision.      |

See [memory](memory.md).

## Skills

| Command              | Action                                        |
| -------------------- | --------------------------------------------- |
| `skills list`        | List skill directories in your data directory. |
| `skills show <name>` | Check and print a skill's `SKILL.md`.          |

Use `--skill <name>` before a new chat message or task prompt. See [skills](skills.md).

## Scheduled tasks

| Command                                                                                                        | Action                                                  |
| -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `tasks add <name> --at <timestamp> [options] <prompt>`                                                         | Schedule a one-off run.                                 |
| `tasks add <name> --cron <expression> --tz <timezone> [options] <prompt>`                                      | Schedule a recurring run.                               |
| `tasks edit <task> [--name <name>] [--prompt <prompt>] [--at <timestamp> \| --cron <expression> --tz <timezone>]` | Change a task's name, prompt, or schedule.              |
| `tasks skip-next <task>`                                                                                       | Skip the next run only.                                 |
| `tasks snooze <task> --until <timestamp>`                                                                      | Delay the next run to a later time.                     |
| `tasks run <task>`                                                                                             | Queue a run now, without changing the schedule.         |
| `tasks list`                                                                                                   | List saved tasks.                                       |
| `tasks show <task>`                                                                                            | Show runs, results, delivery states, and skipped times. |
| `tasks pause <task>`                                                                                           | Pause the task and cancel its pending run.              |
| `tasks resume <task>`                                                                                          | Resume future runs.                                     |
| `tasks cancel <occurrence>`                                                                                    | Cancel a pending or running occurrence.                 |
| `tasks retry <occurrence>`                                                                                     | Retry an unsuccessful occurrence.                       |
| `tasks clear`                                                                                                  | Stop active runs and remove all tasks and their history. |

Options for `tasks add`: `--coding`, `--skill <name>`, and `--channel <id>`, which can be followed by `--conversation <id>` to choose a channel or thread. See [scheduled tasks](tasks.md). Tasks run while a worker with scheduling is running.

## Worker

| Command                             | Action                                                |
| ----------------------------------- | ----------------------------------------------------- |
| `worker run [--tasks-only]`         | Run scheduling and messaging, or scheduling only, in the foreground. |
| `worker install`                    | Install and start the macOS login worker.             |
| `worker start`                      | Start an installed worker.                            |
| `worker stop`                       | Stop it until you start it again or log in.           |
| `worker status`                     | Show the login agent, scheduling, and connection status. |
| `worker logs`                       | Print the last 64 KiB of worker logs.                 |
| `worker providers`                  | Show provider pauses and temporary backoff.           |
| `worker resume-provider <provider>` | Allow scheduled runs for a paused provider again.     |
| `worker uninstall`                  | Stop and remove login startup. Keeps saved data.      |

See [worker](worker.md).

## Messaging

| Command                                                                     | Action                                                   |
| --------------------------------------------------------------------------- | -------------------------------------------------------- |
| `gateway discord setup <owner-id> <guild-id> <home-channel-id> --key-stdin` | Save Discord settings, and read the bot token from stdin. |
| `gateway work`                                                              | Run messaging only, in the foreground.                   |
| `gateway status`                                                            | Show connection, queue, and delivery status.             |

The bot token is never accepted as a command-line argument. See [Discord](gateways/discord.md).

## Web search

| Command                   | Action                                                                   |
| ------------------------- | ------------------------------------------------------------------------ |
| `web login [--key-stdin]` | Save the selected search provider's key.                                 |
| `web status`              | Show whether search is enabled and has a key. Makes no remote request.   |
| `web logout`              | Remove the saved key for the selected search provider.                   |

See [web search](web.md).

## MCP tools

| Command              | Action                                                                              |
| -------------------- | ----------------------------------------------------------------------------------- |
| `mcp servers`        | Show configured servers, permissions, and connection state, without starting them. |
| `mcp status`         | Show diagnostics and available tools, without starting servers.                     |
| `mcp tools <server>` | Start a server to discover its allowed tools.                                       |

See [MCP tools](mcp.md).
