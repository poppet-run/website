+++
title = "OpenRouter"
description = "Connect Poppet to OpenRouter with an API key, choose a model, and manage credentials."
weight = 20
+++

# OpenRouter

OpenRouter gives you access to many models with one API key. Requests use your OpenRouter credits.

## Connect

```sh
poppet provider login openrouter
poppet provider status openrouter
```

`login` requires an interactive terminal and masks typed or pasted characters with `*`, even when an environment key is set. Piped input and `--key-stdin` are not supported. Keys are never accepted as command-line arguments.

For unattended inference, set `POPPET_OPENROUTER_API_KEY` in the process environment or use a key saved by an earlier interactive login. Login does not save the environment value.

## Models

```sh
poppet provider models openrouter
```

`models` lists the models that Poppet can use, without needing a key. The list leaves out models that generate images or audio, and dynamic routers such as `openrouter/auto` and `openrouter/free`. Poppet only sends requests that the chosen model supports, and it does not route them to other providers. Both coding and general chats work with OpenRouter.

Save a model from the list in `config.json`:

```json
{
  "provider": "openrouter",
  "model": "replace-with-model-id"
}
```

## Errors

Poppet reports out-of-credit errors, rate limits, provider outages, and interrupted responses as errors. It does not retry them or switch to another model. Send the message again when you are ready.

## Credentials

Your key is saved in `<data directory>/auth/openrouter.json`, readable only by your user. The `POPPET_OPENROUTER_API_KEY` environment variable overrides the saved key. See [API keys](../configuration.md#api-keys).

## Log out

```sh
poppet provider logout openrouter
```

`logout` removes the saved key. It does not revoke the key on OpenRouter's side.

See [configuration](../configuration.md) for your default provider and model.
