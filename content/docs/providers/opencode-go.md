+++
title = "OpenCode Go"
description = "Connect Poppet to OpenCode Go with an API key, and choose a supported model."
weight = 30
+++

# OpenCode Go

OpenCode Go gives you a set of models through an OpenCode account. Check [OpenCode Go's usage terms](https://opencode.ai/v2/docs/console/go/) for your account before you connect Poppet.

## Connect

```sh
poppet provider login opencode-go
poppet provider status opencode-go
```

`login` asks for your API key and shows `*` for each character you type or paste. It needs an interactive terminal.

## Models

Poppet supports two OpenCode Go models: `glm-5.3` and `gpt-6-luna`. Neither accepts images, but text file attachments work.

```sh
poppet provider models opencode-go
```

Save a model in `config.json`:

```json
{
  "provider": "opencode-go",
  "model": "glm-5.3"
}
```

## Your key

Poppet saves your key in the `auth` folder of your data directory, where only you can read it. To use a key without saving it, set `POPPET_OPENCODE_GO_API_KEY`. See [API keys](../configuration.md#api-keys).

## Sign out

```sh
poppet provider logout opencode-go
```

This deletes the saved key from your computer. The key still works on OpenCode until you delete it there.
