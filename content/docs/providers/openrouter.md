+++
title = "OpenRouter"
description = "Connect Poppet to OpenRouter with an API key, and choose a model."
weight = 20
+++

# OpenRouter

OpenRouter gives you many models through one account. You pay with OpenRouter credits.

## Connect

Create an API key on [OpenRouter](https://openrouter.ai/settings/keys), then save it:

```sh
poppet provider login openrouter
poppet provider status openrouter
```

`login` asks for your key and shows `*` for each character you type or paste. It needs an interactive terminal.

## Models

```sh
poppet provider models openrouter
```

This lists the models Poppet can use. It leaves out models that only make images or audio, and OpenRouter's automatic model pickers such as `openrouter/auto`.

Save a model from the list in `config.json`:

```json
{
  "provider": "openrouter",
  "model": "replace-with-model-id"
}
```

## Errors

If you run out of credits, hit a rate limit, or OpenRouter has an outage, Poppet shows the error. It does not retry or switch to another model. Send your message again when you are ready.

## Your key

Poppet saves your key in the `auth` folder of your data directory, where only you can read it. To use a key without saving it, set `POPPET_OPENROUTER_API_KEY`. See [API keys](../configuration.md#api-keys).

## Sign out

```sh
poppet provider logout openrouter
```

This deletes the saved key from your computer. The key still works on OpenRouter until you delete it there.
