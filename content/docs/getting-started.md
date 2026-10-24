+++
title = "Getting started"
description = "Install Poppet from source, connect a model provider, save your settings, and send your first message."
weight = 10
next = "/docs/chat"
+++

# Getting started

Poppet runs from source. You need Git, Bun 1.4.3, and an account with one of the providers below.

Each model request uses your provider account's quota. Choose ChatGPT or OpenRouter for general chat. OpenCode Go supports coding requests only.

## 1. Install Poppet

Install Git and Bun 1.4.3, then clone the app:

```fish
git clone https://github.com/poppet-run/poppet.git
cd poppet
```

If you use [mise](https://mise.jdx.dev/), run `mise install` here to install the pinned Bun version. Otherwise, install that version through [Bun's installation guide](https://bun.sh/docs/installation).

Install the dependencies and link the `poppet` command from this checkout:

```fish
bun install --frozen-lockfile
bun link
```

`bun link` puts `poppet` in Bun's global bin directory. If `poppet` is not found, add that directory to your `PATH`:

```fish
fish_add_path (bun pm bin -g)
```

The command runs from this checkout, so keep the checkout in place. Source changes take effect without linking again. Check the install from any directory:

```fish
poppet --help
```

## 2. Run setup

```fish
poppet setup
```

Setup asks you to choose a provider, sign in if needed, and pick a model from its list. You can also configure Discord and, on macOS, install the background worker. It saves your choices in `config.json` and your credentials in protected files. Rerunning it keeps your existing settings as defaults.

Setup needs an interactive terminal. If you prefer to configure things yourself, continue with step 3.

## 3. Connect a provider and save a model

For ChatGPT, sign in through your browser, then list the models available to your account:

```fish
poppet provider login openai-chatgpt
poppet provider models openai-chatgpt
poppet provider status openai-chatgpt
```

Complete account selection and plan-usage consent in the browser, then return to the terminal. The [ChatGPT guide](providers/openai-chatgpt.md) explains consent, credentials, and logout.

For OpenRouter or OpenCode Go, follow their guides: [OpenRouter](providers/openrouter.md) or [OpenCode Go](providers/opencode-go.md).

Save the provider and a model ID from the list in `~/.config/poppet/config.json`:

```json
{
  "provider": "openai-chatgpt",
  "model": "replace-with-model-id"
}
```

Keep credentials out of this file. Check the result:

```fish
poppet config
```

## 4. Send a message

```fish
poppet chat new "Help me plan a small TypeScript project"
poppet chat sessions
```

Poppet streams the answer to your terminal and saves the conversation. Session and run IDs print to stderr. For OpenCode Go, add `--coding` to `chat new`.

To continue a conversation, copy its session ID:

```fish
set session_id 'paste-session-id-here'
poppet chat send $session_id "What should I build first?"
```

To chat interactively in a terminal, run `poppet chat interactive`, or add a session ID to resume one. Enter one message per line and use `/exit` to leave.

If a request fails, see [troubleshooting](/docs/troubleshooting/).

## Add what you need

You can keep chatting without setting up anything else.

- [Memory](/docs/memory/) keeps your profile and facts you ask Poppet to save.
- [Skills](/docs/skills/) select a reusable procedure for a chat or task.
- [Scheduled tasks](/docs/tasks/) run prompts later. They need the [worker](/docs/worker/) running.
- [Discord](/docs/gateways/) lets you chat from a Discord thread.
- [Web search](/docs/web/), [browser automation](/docs/browser/), and [MCP tools](/docs/mcp/) add optional tools.
