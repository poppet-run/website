+++
title = "Gemini"
description = "Connect Poppet to Gemini with a Google AI Studio API key, and choose a model."
weight = 15
+++

# Gemini

Use Google's Gemini chat models with a Google AI Studio API key. Poppet sends requests to the Gemini Developer API.

## Connect

Create an API key in Google AI Studio, then save it:

```sh
poppet provider login gemini
poppet provider status gemini
```

`login` asks for your key and shows `*` for each character you type or paste. It needs an interactive terminal.

## Models

```sh
poppet provider models gemini
```

Choose an ID from this list. Poppet lists Gemini chat models that support tools and image input. It leaves out Gemma and models for image generation, speech, live audio, embeddings, or computer use.

Save your choice in `config.json`:

```json
{
  "provider": "gemini",
  "model": "replace-with-model-id"
}
```

Copy the ID as listed, without a `models/` prefix. Poppet rejects unavailable model IDs instead of choosing another model.

## Images and errors

Gemini accepts PNG, JPEG, and WebP attachments. Convert GIF images to a supported format before attaching them.

Poppet reports an error if Gemini stops because of a safety restriction or the output token limit. An incomplete response does not count as a completed answer. Check your key and account quota if you see an authentication or quota error.

## Your key

Poppet saves your key in `auth/gemini.json` in your data directory. To use a key without saving it, set `POPPET_GEMINI_API_KEY`. The environment variable takes precedence over the saved key. See [API keys](../configuration.md#api-keys).

## Sign out

```sh
poppet provider logout gemini
```

This deletes the saved key from your computer. It does not revoke the key at Google or remove an environment variable you set.
