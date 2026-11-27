+++
title = "Providers"
description = "Choose the model provider Poppet uses, and connect your account."
+++

# Providers

Poppet does not include an AI model. It sends your messages to a model provider that you choose, using your own account. You pay the provider directly, through your plan or credits.

| Provider | How you connect | Good for |
| -------- | --------------- | -------- |
| [ChatGPT](openai-chatgpt.md) | Sign in with your ChatGPT account | Using a ChatGPT plan you already pay for |
| [Gemini](gemini.md) | Google AI Studio API key | Using Google's Gemini chat models |
| [OpenRouter](openrouter.md) | API key | Choosing from many models with prepaid credits |
| [OpenCode](opencode.md) | API key | Paid chat models with workspace credits |
| [OpenCode Go](opencode-go.md) | API key | Chat models included in your Go subscription |

After you connect, list the models you can use and save one in [`config.json`](../configuration.md):

```sh
poppet provider models <provider>
```

Each conversation and task keeps the provider and model it started with.
