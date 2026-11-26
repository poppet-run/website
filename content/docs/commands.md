+++
title = "Run commands"
description = "How Poppet runs shell commands on your computer, and how you approve them in a messaging gateway."
+++

# Run commands

Poppet can run shell commands on your computer in chats, gateway conversations, and scheduled tasks. Every model that can use tools has this ability, and there is no setting to turn it off.

Commands run as your user account. They can read, change, and delete anything your account can. Poppet has no sandbox, and it cannot use `sudo`. Because of this, Poppet reviews every command before it runs.

## How review works

Before each command, Poppet sends a separate request to your current model, asking whether the command matches what you asked for. The review sees only the command and your message, or the task's prompt for a scheduled task. Each review uses a little of your provider quota.

The review gives one of three answers:

- **Allow.** The command runs once, exactly as reviewed.
- **Needs approval.** You must approve the command first. In a [messaging gateway](gateways/_index.md), Poppet asks you in the thread. In the terminal and web chat, the command does not run. A scheduled task fails.
- **Deny.** The command does not run, and Poppet stops answering.

If the review fails or times out, the command does not run.

Poppet saves the review decision and reason before running the command. To see them, run `poppet chat show <session-id>` or `poppet tasks show <task-id>` and look under **Reviewed calls**. If the review failed, its decision is `unavailable`. Any saved approval or denial appears there too, with the command's outcome.

The review is a second opinion from a model, and it can be wrong. It reads the command, but not the contents of any script the command runs. Only use Poppet on an account where you would be comfortable running these commands yourself.

## Approve a command

To approve commands, chat through a [messaging gateway](gateways/_index.md). When a command needs approval, Poppet shows the command, the folder it runs in, its time limit, and the reason for asking. In Discord, Slack, and Telegram, choose **Approve once** or **Deny**. If **Show details** appears, use it to read the full command and its settings before deciding. Long commands and fields are shortened in the prompt.

Poppet removes the buttons and shows the outcome when the request ends. If you have the approval ID, every gateway also accepts these replies:

```text
/approve <id>
/deny <id>
```

Only you can answer, and only in the same conversation. An approval covers that one command and nothing else. Poppet saves your answer before running the command. If it cannot save your approval, the command does not run. A request expires after two minutes by default, set with [`timeouts.approvalSeconds`](configuration.md#timeouts-and-limits). It also expires when you cancel the reply or restart the worker. To try again after that, ask Poppet again.

When a gateway starts, Poppet expires any requests left pending by the previous worker. It tries to update their prompts to show **Expired** and remove the buttons. If an old button is still visible, it cannot approve the command. A late reply to a saved request in the same conversation tells you how it ended. Ask Poppet for the operation again if the request expired.

In Slack, the buttons need **Interactivity & Shortcuts** turned on in your [Slack app settings](gateways/slack.md#create-the-app). A reply with `/approve <id>` works without it if you have the approval ID.

In the terminal or web chat, a command that needs approval does not run. Ask for the same thing in a gateway to approve it there.

[Reviewed MCP actions](mcp.md#review-an-action) use the same buttons and replies.

## Scheduled tasks

Nobody is around to approve a command during a scheduled task. If a command needs approval, that run fails straight away. The task's schedule continues. If the task posts to a gateway, Poppet posts a short [failure notice](tasks.md#failure-notices) there. Run `poppet tasks show <task-id>` for details.

Commands that finished before the failure are not undone, so check your computer before you run the task again.

## What a command can do

- Each command has a time limit of up to 300 seconds. When the limit passes, Poppet stops the command and anything it started.
- A command cannot ask you for input.
- Poppet sees the command's output and exit code. Long output is cut short.
- Commands run in Bash, without your shell profile.

Commands receive only a few basic environment variables, such as `HOME`, `PATH`, and `LANG`. Your API keys and other variables are not passed on. Commands can still read any file your account can, including saved credentials, so avoid keeping secrets where a command could find them.

If a command is interrupted, Poppet does not run it again. To keep a program running in the background, use your system's service manager rather than asking Poppet to start it.
