+++
title = "OpenCode"
description = "Connect Poppet to OpenCode with an API key, and choose a supported model."
weight = 25
+++

# OpenCode

Use `opencode` for OpenCode pay-as-you-go models billed to your workspace credits. For Go subscription models, use [OpenCode Go](opencode-go.md).

## Connect

```sh
poppet provider login opencode
poppet provider status opencode
```

`login` asks for your API key and shows `*` for each character you type or paste. It needs an interactive terminal.

## Models

Poppet lists paid chat models from the OpenCode catalog. With a saved key or environment key, it requests the catalog for that key. Without a key, it lists the public catalog. You still need a key to chat.

The list includes each model's tool and image support and token limits, as reported by the catalog. Poppet leaves out free-tier models and models that do not accept text and return text only. Image attachments work only when the selected model reports image support.

```sh
poppet provider models opencode
```

Choose an ID from the list and save it in `config.json`. For example, if `glm-5.3` is listed:

```json
{
  "provider": "opencode",
  "model": "glm-5.3"
}
```

## Your key

Poppet saves your key in the `auth` folder of your data directory, where only you can read it. To use a key without saving it, set `POPPET_OPENCODE_API_KEY`. See [API keys](../configuration.md#api-keys).

## Sign out

```sh
poppet provider logout opencode
```

This deletes the saved key from your computer. The key still works on OpenCode until you delete it there.
