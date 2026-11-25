+++
title = "Messaging"
description = "Chat with Poppet from a messaging app, and post scheduled results to a channel."
+++

# Messaging

You can chat with Poppet from a messaging app through a bot that you create. Poppet calls each connection to a messaging app a gateway. The bot only answers you, and it replies in threads. It can also post the results of [scheduled tasks](../tasks.md) to a channel you choose.

Each gateway has its own setup guide:

- [Discord](discord.md): create a bot, connect it, and chat in threads.
- [Slack](slack.md): create a Slack app, connect it, and chat in threads.

Gateways need the [worker](../worker.md) running. Terminal chat works without it.

A gateway thread is also the only place you can [approve commands](../commands.md#approve-a-command) that need your permission.
