+++
title = "Getting started"
description = "Install Poppet from source, connect a model provider, save your settings, and send your first message."
weight = 10
source = "getting-started.md"
next = "/docs/chat"
+++

# Getting started

Poppet is in early development and runs from source. You need Git, Bun 1.4.3, and an account with one of the providers below.

Each model request uses your provider account's quota. Choose ChatGPT or OpenRouter for general chat. OpenCode Go supports coding requests only.

## 1. Install Poppet

Install Git and Bun 1.4.3, then clone the app:

```fish
git clone https://github.com/poppet-run/poppet.git
cd poppet
```

If you use [mise](https://mise.jdx.dev/), run `mise install` here to install the pinned Bun version. Otherwise, install that version through [Bun's installation guide](https://bun.sh/docs/installation).

Run all remaining commands from this checkout:

```fish
bun --version
bun install --frozen-lockfile
bun run start --help
```

Check that Bun reports `1.4.3` and Poppet prints its command help before continuing.

## 2. Connect a provider

Choose a provider:

- ChatGPT uses browser sign-in and plan-usage consent. Follow the commands below.
- OpenRouter uses an API key. Follow the [OpenRouter guide](providers/openrouter.md), then return to step 3.
- OpenCode Go uses an API key and supports coding workloads only. Follow the [OpenCode Go guide](providers/opencode-go.md), then return to step 3.

For ChatGPT:

```fish
bun run start auth login openai-chatgpt
bun run start auth models openai-chatgpt
bun run start auth status openai-chatgpt
```

Complete account selection and plan-usage consent in the system browser, then return to the terminal. Copy a model ID from the model list for the next step. The [ChatGPT guide](providers/openai-chatgpt.md) explains credentials, consent, and logout.

## 3. Save your settings

Create `~/.config/poppet` if it does not exist:

```fish
mkdir -p ~/.config/poppet
```

Save the following as `~/.config/poppet/config.json`. If you already have that file, add or update these fields while keeping your other settings:

```json
{
  "provider": "openai-chatgpt",
  "model": "replace-with-model-id"
}
```

Replace `replace-with-model-id` with an ID from your provider's model list. For OpenRouter or OpenCode Go, change `provider` to `openrouter` or `opencode-go` as well.

Keep credentials out of this file. Login commands save them separately. If you set `POPPET_DATA_DIR`, use its directory instead of `~/.config/poppet`.

```fish
bun run start config
```

Check that `provider` and `model` show your choices and `configFile.exists` is `true`. Environment variables override the file. See [configuration](configuration.md) if the values differ from what you saved.

## 4. Send a message

For ChatGPT or OpenRouter:

```fish
bun run start chat new "Help me plan a small TypeScript project"
```

For OpenCode Go:

```fish
bun run start chat new --coding "Help me plan a small TypeScript project"
```

Poppet streams the answer in your terminal and saves the conversation. List your saved sessions:

```fish
bun run start chat sessions
```

Poppet prints session and run IDs to stderr and the answer to stdout. If the request fails, use [troubleshooting](/docs/troubleshooting/) before adding other services.

## Continue the conversation

To chat interactively:

```fish
bun run start chat interactive
```

OpenCode Go needs `chat interactive --coding` for a new session. Enter one message per line and use `/exit` to leave. To resume the session you just created:

```fish
set session_id 'paste-session-id-here'
bun run start chat interactive $session_id
```

Existing sessions retain their original provider and model. The [chat guide](chat.md) covers one-shot follow-ups, cancellation, and searching saved conversations.

## Add what you need

You can keep chatting without setting up anything else.

- [Notes](notes.md) let Poppet read, search, and save files you choose.
- [Projects](projects.md) keep related instructions, facts, and notes together.
- [Scheduled tasks](tasks.md) run prompts later. Follow the [worker guide](worker.md) to run them.
- [Messaging](/docs/gateways/) lets you chat through Discord, Telegram, or WhatsApp.
