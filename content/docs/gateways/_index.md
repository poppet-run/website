+++
title = "Messaging"
description = "Chat with Poppet from a messaging app, and post scheduled results to a channel."
+++

# Messaging

You can chat with Poppet from a messaging app through a bot that you create. Poppet calls each connection to a messaging app a gateway. The bot only answers you. In Discord and Slack it replies in threads. In Telegram it uses a private chat, a group, or forum topics. It can also post the results of [scheduled tasks](../tasks.md) to a channel you choose.

Each gateway has its own setup guide:

- [Discord](discord.md): create a bot, connect it, and chat in threads.
- [Slack](slack.md): create a Slack app, connect it, and chat in threads.
- [Telegram](telegram.md): create a bot, connect it, and chat privately, in a group, or in forum topics.

Use `poppet setup gateways` to connect Discord, Slack, or Telegram. It checks tokens, offers IDs it can find, and lets you review changes before saving. To disconnect a configured gateway, leave it unselected and confirm removal of its settings and tokens.

Gateways need the [worker](../worker.md) running. Terminal chat works without it.

Gateway conversations can [wait for your approval](../commands.md#approve-a-command) before running commands. Answer in the conversation or [from the terminal](../commands.md#answer-approvals-from-the-terminal). You can also save and revoke [approval rules](../commands.md#save-an-approval-rule).
