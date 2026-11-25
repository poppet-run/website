+++
title = "Getting started"
description = "Install Poppet, connect a model provider, and send your first message."
next = "/docs/chat"
+++

# Getting started

You install Poppet from its source code. You need Git, Bun 1.4.4, and an account with one of the supported providers.

Every message you send uses your provider account's quota. If you already pay for ChatGPT, start with ChatGPT. It needs no API key. OpenRouter and OpenCode Go use an API key instead. See [providers](providers/_index.md) to compare them.

## 1. Install Poppet

Install Git and Bun 1.4.4, then download Poppet:

```sh
git clone https://github.com/poppet-run/poppet.git
cd poppet
```

If you use [mise](https://mise.jdx.dev/), run `mise install` in this folder to get the right Bun version. Otherwise, follow [Bun's installation guide](https://bun.sh/docs/installation).

Install Poppet's dependencies and add the `poppet` command:

```sh
bun install --frozen-lockfile
bun link
```

If your terminal then says it cannot find `poppet`, add Bun's command folder to your `PATH`:

{{< shell >}}
```bash
# Add this line to ~/.zshrc or ~/.bashrc, then open a new terminal
export PATH="$(bun pm bin -g):$PATH"
```

```fish
fish_add_path (bun pm bin -g)
```
{{< /shell >}}

The `poppet` command runs from the folder you downloaded, so leave that folder where it is. Check that the command works:

```sh
poppet --help
```

## 2. Run setup

```sh
poppet setup
```

Setup asks you to choose a provider, sign in, and pick a model. It can also connect a [messaging gateway](gateways/_index.md), such as Discord or Slack. On macOS, and on Linux with systemd, it offers to start the [worker](worker.md) each time you log in. On other systems it shows the command to run the worker yourself.

Setup saves your choices in `config.json` and keeps your sign-in details in separate protected files. If you run it again, it starts from your current settings.

Setup needs an interactive terminal. If you would rather edit the settings yourself, follow step 3 instead.

## 3. Connect a provider without setup

For ChatGPT, sign in through your browser, then list the models your account can use:

```sh
poppet provider login openai-chatgpt
poppet provider models openai-chatgpt
poppet provider status openai-chatgpt
```

In the browser, pick your account and approve access to your plan, then return to the terminal. The [ChatGPT guide](providers/openai-chatgpt.md) covers what you approve and how to sign out.

For OpenRouter or OpenCode Go, follow the [OpenRouter guide](providers/openrouter.md) or the [OpenCode Go guide](providers/opencode-go.md).

Then save the provider and a model ID from the list in `~/.config/poppet/config.json`:

```json
{
  "provider": "openai-chatgpt",
  "model": "replace-with-model-id"
}
```

Never put passwords or API keys in this file. Check that Poppet reads it correctly:

```sh
poppet config
```

## 4. Send a message

```sh
poppet chat new "Help me plan a small TypeScript project"
```

Poppet prints a `Session:` line with the conversation's ID, then writes the answer as it arrives. Poppet saves the conversation under that ID. To continue it, copy the ID:

{{< shell >}}
```bash
session_id='paste-session-id-here'
poppet chat send $session_id "What should I build first?"
```

```fish
set session_id 'paste-session-id-here'
poppet chat send $session_id "What should I build first?"
```
{{< /shell >}}

For a back-and-forth conversation, run `poppet chat`. Press Enter to send and type `/exit` to leave. See [chat](chat.md#interactive-prompt) for more.

If a message fails, see [troubleshooting](troubleshooting.md).

## Add what you need

You can keep chatting without setting up anything else. When you want more:

- [Memory](memory.md) keeps facts about you between conversations.
- [Skills](skills.md) let you reuse a procedure in a chat or task.
- [Scheduled tasks](tasks.md) run a prompt later. They need the [worker](worker.md) running.
- [Messaging](gateways/_index.md) lets you chat through a gateway, such as Discord, Slack, or Telegram.
- [Web search](web.md) and [MCP tools](mcp.md) give Poppet more tools.
