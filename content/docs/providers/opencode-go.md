+++
title = "OpenCode Go"
description = "Connect Poppet to OpenCode Go with an API key, and choose a supported model."
weight = 30
+++

# OpenCode Go

OpenCode Go uses your Go subscription. For workspace credit billing, use [OpenCode](opencode.md). Check [OpenCode Go's usage terms](https://opencode.ai/docs/console/go/) for your account before you connect Poppet.

## Connect

```sh
poppet provider login opencode-go
poppet provider status opencode-go
```

`login` asks for your API key and shows `*` for each character you type or paste. It needs an interactive terminal.

## Models

Poppet lists paid chat models from the Go catalog. With a saved key or environment key, it requests the catalog for that key. Without a key, it lists the public catalog. You still need a key to chat.

The list includes each model's tool and image support and token limits, as reported by the catalog. Poppet leaves out free-tier models and models that do not accept text and return text only. Image attachments work only when the selected model reports image support.

```sh
poppet provider models opencode-go
```

Choose an ID from the list and save it in `config.json`. For example, if `glm-5.3` is listed:

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
