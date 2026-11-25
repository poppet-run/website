+++
title = "Troubleshooting"
description = "Fix common problems with setup, providers, scheduled tasks, messaging gateways, and tools."
+++

# Troubleshooting

Start with doctor. It checks your setup without changing anything, and suggests what to fix:

```sh
poppet doctor
```

If you report a problem, include the full error message. See [doctor](doctor.md) for what it checks.

## Poppet will not start

```sh
bun --version
poppet --help
poppet config
```

Make sure you have Bun 1.4.4. In the folder where you installed Poppet, run `bun install --frozen-lockfile` again.

If `poppet config` shows an error, it names the setting at fault. Common causes are a missing comma or quote in `config.json`, a misspelled setting, or a value of the wrong kind. See [configuration](configuration.md).

## Poppet ignores a setting

Run `poppet config` to see the settings Poppet reads, and which file it reads them from.

The worker reads settings only when it starts, so restart it after every change:

```sh
poppet worker restart
```

If the worker runs in a terminal, press Ctrl-C and start it again.

A conversation or task keeps the provider and model it started with. Start a new chat to use a different model.

## Chat fails

Check that you are signed in and that your model is available. Use `openrouter` or `opencode-go` in place of `openai-chatgpt` if you use those:

```sh
poppet provider status openai-chatgpt
poppet provider models openai-chatgpt
```

Check that the `model` in `config.json` appears in the list. For ChatGPT, `provider status` must show that you approved plan usage. For sign-in and quota errors, see your [provider's guide](providers/_index.md).

## A task did not run

Tasks only run while the [worker](worker.md) is running and your computer is awake. Check that it is running, then look at the task:

```sh
poppet worker status
poppet tasks list
poppet tasks show <task-id>
```

`tasks show` lists when the task is next due, its past runs, and any failures. Check the time zone. `worker status` shows whether Poppet paused your provider, for example because you ran out of quota. `poppet worker logs` shows errors.

If your computer was asleep or the worker was stopped, see [missed runs](tasks.md#missed-runs) before you retry.

## A gateway does not reply

```sh
poppet worker status
poppet worker logs
```

Check that:

- the worker is running and shows the gateway as connected
- the IDs you gave during setup are right
- you are writing as the owner, in a channel where the bot is present
- the bot has the permissions listed in its gateway guide, such as the [Discord guide](gateways/discord.md#create-the-bot), the [Slack guide](gateways/slack.md#create-the-app), or the [Telegram guide](gateways/telegram.md#create-the-bot)
- for Slack, you are not in a direct message or a shared channel
- for Telegram, the bot has no webhook set, and no other program uses its token

Restart the worker after you change any of these.

If Poppet saved an answer but could not confirm that it was posted, it does not post it again. Check the thread, then read the answer with `poppet chat show <session-id>`.

## Web search or MCP tools are missing

- For [web search](web.md), run `poppet web status`. Set `webSearchProvider` to `brave` or `kagi`, and save a key with `poppet web login`. Remove any old `webSearch` setting.
- For [MCP tools](mcp.md), run `poppet mcp servers`. The server must have `"enabled": true`, and each tool must be allowed. Run `poppet mcp tools <name>` to connect and see its tools.

Restart the worker after changing settings. Restarting also reconnects a failed MCP server.

## A tool may have done something before an error

Run `poppet chat show <session-id>` to see the error and each tool Poppet used. A tool call marked uncertain may have finished. Check the file or service it changed before you ask Poppet to try again. Poppet never repeats an uncertain action by itself.

## Keep your data while you investigate

Your data directory holds your conversations, facts, tasks, and sign-ins. Do not delete it to fix a problem. Make a [backup](storage.md#back-up) first if you want to experiment.
