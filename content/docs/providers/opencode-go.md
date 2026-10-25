+++
title = "OpenCode Go"
description = "Connect Poppet to OpenCode Go with an API key for coding workloads."
weight = 30
+++

# OpenCode Go

OpenCode Go is meant for coding agents. Poppet supports it for coding chats only. For general chat and scheduled summaries, use ChatGPT or OpenRouter.

## Connect

```sh
poppet provider login opencode-go
poppet provider models opencode-go
```

`login` asks for your key without showing it. In a script, pipe the key with `--key-stdin`. The model list is public, so you can check it before you log in.

Save a supported model in `config.json`:

```json
{
  "provider": "opencode-go",
  "model": "glm-5.3"
}
```

Poppet currently supports `glm-5.3` and `gpt-6-luna`. Other OpenCode Go models are not supported yet.

## Start a coding chat

Every chat with OpenCode Go must be a coding chat:

```sh
poppet chat new --coding "Explain how to structure a TypeScript CLI"
```

Use `--coding` with `chat interactive` for a new session, and with `tasks add` for a scheduled task. Poppet refuses a general chat with this provider before it reads your key or sends a request.

## Credentials

Your key is saved in `<data directory>/auth/opencode-go.json`, readable only by your user. The `POPPET_OPENCODE_GO_API_KEY` environment variable overrides it. See [API keys](../configuration.md#api-keys).

```sh
poppet provider status opencode-go
poppet provider logout opencode-go
```

`logout` removes the saved key. It does not revoke the key on OpenCode's side.

See [configuration](../configuration.md) for your default provider and model.
