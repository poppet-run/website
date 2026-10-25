+++
title = "Providers"
description = "Choose a model provider for Poppet and connect your account."
+++

# Providers

Poppet sends your requests to a model provider you choose. Each provider uses your own account, so you pay the provider directly.

| Provider                              | How you connect       | Use for                       |
| ------------------------------------- | --------------------- | ----------------------------- |
| [ChatGPT](openai-chatgpt.md)            | Browser sign-in       | General chat and tasks        |
| [OpenRouter](openrouter.md)             | API key               | General chat and tasks        |
| [OpenCode Go](opencode-go.md)           | API key               | Coding chats only             |

Set the provider and a model ID in [`config.json`](../configuration.md). Use `poppet provider models <provider>` to see the model IDs available to you. Each saved chat and task keeps the provider and model it started with.
