+++
title = "Web chat"
description = "Chat from a browser, reopen saved conversations, and recover replies after a disconnect."
+++

# Web chat

Use a desktop or mobile browser to send messages and reopen saved conversations. The [worker](worker.md) runs replies and saves history, so closing the page or signing out does not cancel a reply.

## Build and enable

[Set up Poppet](getting-started.md) and connect a provider first. Save `provider` and `model` in `config.json`. New web conversations use the worker's configured defaults; existing conversations keep their saved provider and model. Provider credentials stay on the host.

From your Poppet checkout, install dependencies and build the web app:

```sh
bun install
bun run build:web
```

Create `<data directory>/web.json`. The default directory is `~/.config/poppet`; use your `POPPET_DATA_DIR` if you set one. Web chat stays disabled when this file is absent.

```json
{
  "origin": "https://chat.example.com",
  "hostname": "127.0.0.1",
  "port": 8080,
  "accessKeyHash": "replace-with-the-64-character-lowercase-sha256-hash"
}
```

`origin` is the public address, without a trailing slash or path. `hostname` and `port` select the listener. `hostname` must be `127.0.0.1`, `::1`, or `localhost`; other bind addresses are rejected. All four fields are required. Keep the file owned by your user and prevent other users from writing to it.

Generate a random access key and save it in your password manager:

```sh
openssl rand -hex 32
```

Hash the key without putting it in shell history. Paste the digest, without its label, into `accessKeyHash`:

{{< shell >}}
```bash
read -r -s -p 'Access key: ' poppet_web_key
printf '%s' "$poppet_web_key" | openssl dgst -sha256
unset poppet_web_key
chmod 600 ~/.config/poppet/web.json
```

```fish
read --silent --prompt-str 'Access key: ' poppet_web_key
printf '%s' $poppet_web_key | openssl dgst -sha256
set --erase poppet_web_key
chmod 600 ~/.config/poppet/web.json
```
{{< /shell >}}

Keep `web.json` owned by your user with mode `0600`. Adjust the file path if you use a different data directory. Replace the example hash before starting the worker. The original key must be 32 to 256 characters long and separate from provider credentials.

Start the worker from this checkout:

```sh
bun apps/cli/src/main.ts worker run
```

Stop any worker that already owns this data directory first. For an installed service, make sure it launches this checkout, then use `poppet worker restart`. The worker prints the web address when the listener starts. Rebuild the web app and restart the worker after frontend changes because it loads assets at startup.

The build writes Brotli and gzip copies of HTML, scripts, and styles when compression makes them smaller. The worker serves a compressed copy when the browser accepts it, so the reverse proxy does not need to compress responses. Browsers cache content-hashed scripts and styles for a year; HTML pages and API responses use `Cache-Control: no-store`.

## Connect from another device

Put an HTTPS reverse proxy in front of `127.0.0.1:8080`. Set up DNS and certificates for your hostname, and make the public address match `origin` exactly. The proxy must preserve the public `Host` header and avoid buffering server-sent events so replies stream as they arrive. Keep the HTTP backend on loopback. Set `"trustProxy": true` in `web.json` only when this loopback proxy manages `X-Forwarded-For`. Poppet then uses the last address in that header if it is a valid IP address. Without this setting, login limits use the connection’s peer address.

For same-machine development, use `http://127.0.0.1:8080` as the origin. HTTP origins for LAN addresses and public hostnames are rejected. Remote access requires HTTPS.

Enter the original access key in the browser. Anyone with that key can read and use all conversations. Sessions expire after 12 hours and end on sign-out or worker restart. Cookies are HttpOnly and SameSite=Strict, with Secure enabled for HTTPS. Changing the hash and restarting the worker revokes all logins.

## Filter conversations

The sidebar opens on **Chats**, which includes web and CLI conversations. Use **Show** to switch to **Scheduled tasks**, a gateway such as **Slack** or **Discord**, or **All sessions**. Gateway options appear when saved sessions exist for that gateway. Each view lists the most recently active sessions first. A task that sends its result to a gateway stays under **Scheduled tasks**.

Changing the filter keeps your open conversation and draft in place. A direct conversation link works regardless of the selected filter. **+ New conversation** returns the sidebar to **Chats**.

## Send and recover messages

Press Enter to send or Shift+Enter for a newline. You can draft the next message while a reply runs, but must wait for it to finish before sending. Web chat has no message queue.

Reopen a conversation URL to see saved history and its active reply. Two devices can follow the same reply. Reconnecting does not resubmit a message. Use Stop to cancel a web-started reply; partial text is not saved as a completed answer. Worker shutdown interrupts unfinished replies, and restarting does not retry them.

If a submission's response is lost, use Recover submission. The browser retains the message and its ID in this tab's session storage until receipt is confirmed. Recovery uses that same ID, so an accepted message is not started again. Signing out retains an unconfirmed submission for recovery after signing back in.

Forget recovery checks for a saved receipt first. If it finds one, it opens that conversation. Otherwise, it clears this tab's pending submission. That does not cancel a running reply or prove delivery failed. Check history before sending again. If the receipt check fails, the browser keeps the recovery ID.

Unsent drafts survive navigation within the page, but refreshing or signing out discards them. Completed answers remain saved. Submission receipts are stored in SQLite alongside conversation data.

You can [name a skill](skills.md#name-a-skill-in-a-message) in a message, such as `Run $weekly-review for Acorn`, to use it for that turn.

## Delete a conversation

Choose Delete in the conversation header and confirm to remove the open conversation. Deletion cannot be undone. The button is unavailable while a reply runs or the page is reconnecting. Stop the reply before deleting it.

After deletion, the conversation leaves the sidebar and the browser returns to a new chat. Its unsent draft and submission receipts are removed too. See [delete old sessions](chat.md#delete-old-sessions) for the saved records removed and what happens to linked tasks, memory, and messaging threads.

## Current limits

Login allows ten attempts per minute per client address and 60 per minute across the listener. Ordinary connections have a 10-second idle timeout, and JSON bodies must arrive within 10 seconds. At most 32 authenticated event streams can stay open at once. Poppet keeps at most 32 logins; a new login then replaces the oldest one.

Web chat has no attachments, conversation search, renaming, model selection, session-wide skill selection, reasoning display, or run details. New conversations use the first message as their title. Use `poppet chat show <session-id>` to inspect saved runs.

Tool permissions still apply. A Bash command or reviewed MCP action that needs human approval stops the run. The browser cannot approve it. Request the operation in Discord or Slack to approve it there. See [reviewed MCP actions](mcp.md#review-an-action) and [command approval](commands.md).

Replies appear as plain text until the Markdown renderer loads. If it cannot load, replies stay readable as plain text.

Web chat displays raw HTML in replies as text. A few inline formatting tags, such as `<br>` and `<kbd>`, still render when written without attributes. Images appear as their alt text, and task lists appear without checkboxes. Relative links and links using `http`, `https`, or `mailto` open in a new tab. Other link destinations are dropped, leaving the link text.

Use your browser's usual modified clicks to open a sidebar conversation in another tab or window.

## Troubleshooting

If the listener cannot start, the worker logs the reason and continues scheduling and messaging. Check the worker output or `poppet worker logs` for an invalid `web.json`, missing web build, or listener error. Verify the origin, proxy headers, file permissions, and access-key hash, then restart the worker.

`poppet web login` manages [web search](web.md) credentials. Browser chat uses the access key in this guide.
