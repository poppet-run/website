+++
title = "OpenRouter"
description = "Connect Poppet to OpenRouter with an API key and select a tool-capable model."
weight = 20
+++

# OpenRouter

OpenRouter gives you access to many models with one API key. Requests use your OpenRouter credits.

## Connect

```sh
poppet provider models openrouter
poppet provider login openrouter
```

`models` lists the models that Poppet can use, without needing a key. `login` asks for your key without showing it. In a script, pipe the key with `--key-stdin`. Keys are never accepted as command-line arguments.

Then save a model from the list in `config.json`:

```json
{
  "provider": "openrouter",
  "model": "replace-with-model-id"
}
```

## Models

Poppet only sends requests that the chosen model supports, and it does not route them to other providers. Models that generate images or audio are excluded. Dynamic routers such as `openrouter/auto` and `openrouter/free` are excluded too. Both coding and general chats work with OpenRouter.

## Credentials

Your key is saved in `<data directory>/auth/openrouter.json`, readable only by your user. The `POPPET_OPENROUTER_API_KEY` environment variable overrides the saved key. See [API keys](../configuration.md#api-keys).

```sh
poppet provider status openrouter
poppet provider logout openrouter
```

`logout` removes the saved key. It does not revoke the key on OpenRouter's side.

## Errors

Out-of-credit errors, rate limits, provider outages, and interrupted responses are shown as errors. Poppet does not retry them or switch to another model. Send the message again when you are ready.

See [configuration](../configuration.md) for your default provider and model.
