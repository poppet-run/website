+++
title = "OpenCode Go"
description = "Connect Poppet to OpenCode Go with an API key, choose a supported model, and manage credentials."
weight = 30
+++

# OpenCode Go

Poppet uses your selected OpenCode Go model without a separate workload setting. Check the [provider usage requirements](https://opencode.ai/v2/docs/console/go/) for your account.

## Connect

```sh
poppet provider login opencode-go
poppet provider status opencode-go
```

`login` asks for your key without showing it. In a script, pipe the key with `--key-stdin`. Keys are never accepted as command-line arguments.

## Models

```sh
poppet provider models opencode-go
```

`models` lists the models that Poppet can use, without needing a key. Poppet currently supports `glm-5.3` and `gpt-6-luna`. Other OpenCode Go models are not supported yet.

Save a supported model in `config.json`:

```json
{
  "provider": "opencode-go",
  "model": "glm-5.3"
}
```

## Start a chat

Start a chat with the configured model:

```sh
poppet chat new "Explain how to structure a TypeScript CLI"
```

The same model selection works with `chat interactive` and `tasks add`. Image attachments are not supported by the Go adapter; text-file attachments work.

## Credentials

Your key is saved in `<data directory>/auth/opencode-go.json`, readable only by your user. The `POPPET_OPENCODE_GO_API_KEY` environment variable overrides the saved key. See [API keys](../configuration.md#api-keys).

## Log out

```sh
poppet provider logout opencode-go
```

`logout` removes the saved key. It does not revoke the key on OpenCode's side.

See [configuration](../configuration.md) for your default provider and model.
