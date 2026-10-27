+++
title = "Getting started"
description = "Install Poppet from source, connect a model provider, save your settings, and send your first message."
next = "/docs/chat"
+++

# Getting started

Poppet runs from source. You need Git, Bun 1.4.4, and an account with one of the providers below.

Each model request comes out of your provider account's quota. If you already pay for ChatGPT, start there. It needs no API key. OpenRouter works for general chat too. OpenCode Go only handles coding chats.

## 1. Install Poppet

Install Git and Bun 1.4.4, then clone the app:

```sh
git clone https://github.com/poppet-run/poppet.git
cd poppet
```

If you use [mise](https://mise.jdx.dev/), run `mise install` here to install the pinned Bun version. Otherwise, install that version through [Bun's installation guide](https://bun.sh/docs/installation).

Install the dependencies and link the `poppet` command from this checkout:

```sh
bun install --frozen-lockfile
bun link
```

`bun link` puts `poppet` in Bun's global bin directory. If your shell cannot find `poppet`, add that directory to your `PATH`:

{{< shell >}}
```bash
# Add this line to ~/.zshrc or ~/.bashrc, then open a new terminal
export PATH="$(bun pm bin -g):$PATH"
```

```fish
fish_add_path (bun pm bin -g)
```
{{< /shell >}}

The command runs from this checkout, so keep the checkout in place. Source changes take effect without linking again. Check the install from any directory:

```sh
poppet --help
```

## 2. Run setup

```sh
poppet setup
```

Setup asks you to choose a provider, sign in if needed, and pick a model from its list. You can also configure Discord and install the background worker on macOS or Linux with systemd. It saves your choices in `config.json` and your credentials in protected files. Run it again later and it offers your current settings as the defaults.

Setup needs an interactive terminal. If you prefer to configure things yourself, continue with step 3.

## 3. Connect a provider and save a model

For ChatGPT, sign in through your browser, then list the models available to your account:

```sh
poppet provider login openai-chatgpt
poppet provider models openai-chatgpt
poppet provider status openai-chatgpt
```

Pick your account and approve plan usage in the browser, then come back to the terminal. The [ChatGPT guide](providers/openai-chatgpt.md) explains consent, credentials, and logout.

For OpenRouter or OpenCode Go, follow the [OpenRouter guide](providers/openrouter.md) or the [OpenCode Go guide](providers/opencode-go.md) instead.

Save the provider and a model ID from the list in `~/.config/poppet/config.json`:

```json
{
  "provider": "openai-chatgpt",
  "model": "replace-with-model-id"
}
```

Keep credentials out of this file. Check the result:

```sh
poppet config
```

## 4. Send a message

```sh
poppet chat new "Help me plan a small TypeScript project"
poppet chat sessions
```

Poppet streams the answer to your terminal and saves the conversation. Session and run IDs print to stderr. For OpenCode Go, add `--coding` to `chat new`.

To continue a conversation, copy its session ID:

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

To chat interactively in a terminal, run `poppet chat interactive`, or add a session ID to resume one. Enter one message per line and use `/exit` to leave.

If a request fails, see [troubleshooting](troubleshooting.md).

## Add what you need

You can keep chatting without setting up anything else.

- [Memory](memory.md) keeps your profile and facts you ask Poppet to save.
- [Skills](skills.md) let you choose a reusable procedure for a chat or task.
- [Scheduled tasks](tasks.md) run prompts later. They need the [worker](worker.md) running.
- [Discord](gateways/_index.md) lets you chat from a Discord thread.
- [Web search](web.md), [browser automation](browser.md), and [MCP tools](mcp.md) add optional tools.
