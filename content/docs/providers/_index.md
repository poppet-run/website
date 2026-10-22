+++
title = "Providers"
description = "Choose a model provider for Poppet and connect your account."
+++

# Connect a provider

Choose the provider that will answer your requests. Poppet stores conversations and notes on your computer, but sends the context and tool results needed for each request to that provider. Requests use your provider account's quota.

| Provider | Connection | Workloads |
| --- | --- | --- |
| [ChatGPT](/docs/providers/openai-chatgpt/) | Browser sign-in and plan-usage consent | Assistant and coding |
| [OpenRouter](/docs/providers/openrouter/) | API key | Assistant and coding |
| [OpenCode Go](/docs/providers/opencode-go/) | API key | Coding only |

Choose a model from the provider's model list and save its ID in [configuration](/docs/configuration/). Existing sessions keep their original provider and model.

For your first installation, connect one provider and return to [step 3 of getting started](/docs/getting-started/#3-save-your-settings) to save your selection and send a message. OpenCode Go requires `--coding` for new chat sessions.
