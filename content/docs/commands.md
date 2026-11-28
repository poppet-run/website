+++
title = "Run commands"
description = "How Poppet runs shell commands on your computer, and how you approve pending requests."
+++

# Run commands

Poppet can run shell commands on your computer in chats, gateway conversations, and scheduled tasks. Every model that can use tools has this ability, and there is no setting to turn it off.

Commands run as your user account. They can read, change, and delete anything your account can. Poppet has no sandbox, and it cannot use `sudo`. Because of this, Poppet reviews every command before it runs.

## How review works

Before each command, Poppet sends a separate request to your current model, asking whether the command matches what you asked for. The review sees only the command and your message, or the task's prompt for a scheduled task. Each review uses a little of your provider quota.

The review gives one of three answers:

- **Allow.** The command runs once, exactly as reviewed.
- **Needs approval.** You must approve the command first. In a [messaging gateway](gateways/_index.md), Poppet asks you in the thread. In [web chat](web-chat.md#approve-an-action), Poppet shows an approval request in the conversation. In the terminal, the command does not run unless a [saved approval rule](#save-an-approval-rule) applies. A scheduled task fails unless you enable [waiting for approval](tasks.md#wait-for-approval).
- **Deny.** The command does not run, and Poppet stops answering.

If the review fails or times out, the command does not run.

Poppet saves the review decision and reason before running the command. To see them, run `poppet chat show <session-id>` or `poppet tasks show <task-id>` and look under **Reviewed calls**. If the review failed, its decision is `unavailable`. Any saved approval or denial appears there too, with the command's outcome.

The review is a second opinion from a model, and it can be wrong. It reads the command, but not the contents of any script the command runs. Only use Poppet on an account where you would be comfortable running these commands yourself.

## Approve a command

To approve commands in your browser, see [web chat approvals](web-chat.md#approve-an-action). In a [messaging gateway](gateways/_index.md), follow the steps below. When a command needs approval, Poppet shows the command, the folder it runs in, its time limit, and the reason for asking. In Discord, Slack, and Telegram, choose **Approve once** or **Deny**. If **Show details** appears, use it to read the full command and its settings before deciding. Long commands and fields are shortened in the prompt.

Poppet removes the buttons and shows the outcome when the request ends. If you have the approval ID, every gateway also accepts these replies:

```text
/approve <id>
/deny <id>
```

Only you can answer through the gateway, in the same conversation. You can also [answer from the terminal](#answer-approvals-from-the-terminal). **Approve once** covers that one command and nothing else. Poppet saves your answer before running the command. If it cannot save your approval, the command does not run. A request expires after one hour by default, set with [`timeouts.approvalSeconds`](configuration.md#timeouts-and-limits). You can set the wait to between 10 seconds and 24 hours. An explicit setting keeps its value after an update.

While Poppet waits, it saves the unfinished answer and frees its place so other conversations can run. Waiting does not use up the answer's time limit. After you approve, Poppet continues when a place is available.

Pending requests survive a worker restart until they expire. When the gateway reconnects, Poppet sends any approval prompt it had not sent. If it saved your approval but had not continued yet, it continues after reconnecting.

Reply with `/cancel` to cancel the waiting answer. Sending a new message in the same session replaces the waiting answer and ends its approval request. Poppet tries to update the old prompt to show the outcome and remove its buttons. An ended approval cannot run the command, even if its button is still visible. A late reply tells you how the request ended. Ask for the operation again if you still need it.

In Slack, the buttons need **Interactivity & Shortcuts** turned on in your [Slack app settings](gateways/slack.md#create-the-app). A reply with `/approve <id>` works without it if you have the approval ID.

In terminal chat, a command that needs approval does not run unless a saved approval rule applies. Ask for the same thing in web chat or a gateway to approve it there.

[Reviewed MCP actions](mcp.md#review-an-action) use the same buttons and replies.

You can also answer pending requests from any conversation in the web chat [Needs you inbox](web-chat.md#approvals-across-conversations).

## Answer approvals from the terminal

You can list and answer pending requests from web chat, gateway conversations, and scheduled tasks on your computer:

```sh
poppet approvals list
poppet approvals approve <id>
poppet approvals deny <id>
```

Copy the approval ID from the list. `poppet approvals` also lists pending requests. The list shows the action summary, conversation, and expiry time. Use `--json` for the full result, including the run ID and creation time.

Approval without `--always` allows that one action. Denial stops it. An expired, cancelled, or already answered request cannot be approved again. These commands answer saved requests; they do not let terminal chat pause for approval.

## Save an approval rule

Choose **Always allow** in Discord, Slack, or Telegram to approve the pending action and save a rule for later calls. The button appears only when Poppet can save a rule for the action. Read the prompt's rule summary before choosing it. You can also reply with `/approve-always <id>` or use the terminal:

```sh
poppet approvals approve <id> --always
```

If Poppet cannot create a rule, it leaves the request pending. Approve it once without `--always`, or deny it.

A shell rule matches the exact command text and working folder. Changing either needs a new decision. Poppet does not save rules for commands with pipes, redirects, shell expansions, or certain programs such as `sudo`, `rm`, and shell interpreters. A saved command can still run a script whose contents change, so only save rules for commands you trust.

A [reviewed MCP rule](mcp.md#review-an-action) matches the server name, tool name, and remote origin when present. It does not match the arguments. Later calls to that tool can use different arguments.

Rules apply across conversations in the same data directory, including terminal and web chats. Poppet still reviews every call. A rule supplies your approval only when the review asks for it; it never overrides a denial or failed review. Rules do not apply to scheduled runs or after the current answer has read untrusted content, such as a web page, command output, MCP result, or attachment.

Saved rules survive restarts and have no automatic expiry when created through these controls. The one-hour request timeout does not expire a saved rule. Poppet records the rule ID with each approval it supplies.

### List and revoke rules

```sh
poppet approvals rules list
poppet approvals rules revoke <rule-id>
poppet approvals rules revoke --all
```

`poppet approvals rules` also lists rules. The list shows each rule's ID, kind, use count, last use, and summary. These commands accept `--json`.

In a gateway conversation, only the configured owner can manage rules:

```text
/approvals list
/approvals revoke <rule-id>
/approvals revoke all
```

`/approvals` also lists saved rules. Use the rule ID from that list, not the pending approval ID. Revoking a rule stops future calls from using it. It does not undo actions or approvals already granted.

## Scheduled tasks

By default, a scheduled run fails as soon as a command needs approval. Set `--approvals wait` on the task, or `tasks.approvals` to `wait` in your configuration, to let it [wait for approval through a gateway](tasks.md#wait-for-approval). Without a task destination or gateway home conversation, the run still fails. The task's schedule continues. If the task posts to a gateway, Poppet posts a short [failure notice](tasks.md#failure-notices) there. Run `poppet tasks show <task-id>` for details.

Commands that finished before the failure are not undone, so check your computer before you run the task again.

## What a command can do

- Each command has a time limit of up to 300 seconds. When the limit passes, Poppet stops the command and anything it started.
- A command cannot ask you for input.
- Poppet sees the command's output and exit code. Long output is cut short.
- Commands run in Bash, without your shell profile.

Commands receive only a few basic environment variables, such as `HOME`, `PATH`, and `LANG`. Your API keys and other variables are not passed on. Commands can still read any file your account can, including saved credentials, so avoid keeping secrets where a command could find them.

If a command is interrupted, Poppet does not run it again. To keep a program running in the background, use your system's service manager rather than asking Poppet to start it.
