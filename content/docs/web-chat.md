+++
title = "Web chat"
description = "Chat with Poppet from a browser on your computer or phone, and return to saved conversations."
+++

# Web chat

Web chat lets you talk to Poppet from a browser on your computer or phone. The [worker](worker.md) runs it, so a reply keeps going if you close the page, and you can come back to it later.

## Set up web chat

[Set up Poppet](getting-started.md) and connect a provider first. New web conversations use the `provider` and `model` in `config.json`.

From the folder where you installed Poppet, build the web app:

```sh
bun install
bun run build:web
```

Create a file named `web.json` in your data directory, `~/.config/poppet` by default. Web chat stays off until this file exists.

```json
{
  "origin": "https://chat.example.com",
  "hostname": "127.0.0.1",
  "port": 8080,
  "accessKeyHash": "replace-with-your-access-key-hash"
}
```

All four fields are required.

- `origin` is the address you type in your browser, with no trailing slash. To use web chat only on this computer, set it to `http://127.0.0.1:8080`.
- `hostname` must be `127.0.0.1`, `::1`, or `localhost`, so that web chat only accepts connections from this computer.
- `port` is the port web chat listens on.
- `accessKeyHash` is a fingerprint of the access key you sign in with, as described below.

Web chat only starts if other users on your computer cannot read or change the file. Set its permissions:

```sh
chmod 600 ~/.config/poppet/web.json
```

## Create an access key

You sign in to web chat with an access key, which works like a password. Create a random key and save it in your password manager:

```sh
openssl rand -hex 32
```

Poppet stores only a fingerprint of the key, called a SHA-256 hash. Run these commands, paste the key when asked, and copy the 64-character hash it prints into `accessKeyHash`. Your key does not appear on screen or in your shell history.

{{< shell >}}
```bash {label="bash"}
read -r -s -p 'Access key: ' poppet_web_key
printf '%s' "$poppet_web_key" | openssl dgst -sha256
unset poppet_web_key
```

```zsh
read -r -s 'poppet_web_key?Access key: '
printf '%s' "$poppet_web_key" | openssl dgst -sha256
unset poppet_web_key
```

```fish
read --silent --prompt-str 'Access key: ' poppet_web_key
printf '%s' "$poppet_web_key" | openssl dgst -sha256
set --erase poppet_web_key
```
{{< /shell >}}

Copy only the hash, not the label before it, such as `(stdin)=`. The key itself must be 32 to 256 characters long. Do not reuse a provider API key.

## Start web chat

Restart the worker so it reads `web.json`. If the worker starts at login, run `poppet worker restart`. Otherwise, stop any running worker and start it from the Poppet folder:

```sh
poppet worker run
```

The worker prints the web chat address when it is ready. Open that address and enter your access key.

After you update Poppet, run `bun run build:web` again and restart the worker.

## Use web chat from another device

To reach web chat from your phone or another computer, you need an HTTPS address that points to this computer. Set up a reverse proxy, such as Caddy or nginx, with a domain name and certificate, and have it forward requests to `127.0.0.1:8080`. Set `origin` to the exact public address, such as `https://chat.example.com`.

Web chat refuses plain `http` addresses other than `127.0.0.1`, `[::1]`, or `localhost`, so remote access always uses HTTPS.

Your proxy must:

- pass the original `Host` header through unchanged
- turn off response buffering for web chat, so replies appear as Poppet writes them

The worker compresses web chat pages itself, so your proxy does not need to.

If your proxy sets the `X-Forwarded-For` header, add `"trustProxy": true` to `web.json`. Poppet then limits sign-in attempts by each visitor's real address instead of the proxy's address.

## Signing in

Anyone with your access key can read and use all of your conversations, so keep it private.

You stay signed in for 12 hours, until you sign out, or until the worker restarts. To sign out every browser at once, create a new access key, put its hash in `web.json`, and restart the worker.

## Find a conversation

The sidebar starts on **Chats**, which shows conversations from web chat and the terminal. Use **Show** to switch to **Scheduled tasks**, **All sessions**, or one gateway, such as **Telegram**. Each gateway's view appears once you have conversations there. The most recent conversations are at the top.

Changing the view keeps your open conversation and your draft. **+ New conversation** switches back to **Chats**. To open a conversation in another tab, use your browser's usual modified click.

## Send messages

Press Enter to send, or Shift+Enter for a new line. You can type your next message while Poppet is replying, but you must wait for the reply to finish before you send it.

You can close the page while Poppet replies. Open the conversation again to see the reply so far. Two devices can follow the same reply. Use **Stop reply** to cancel a reply. A stopped reply is not saved as an answer.

Your draft survives moving around the page, but not a refresh or signing out.

To use a skill for one message, [name it](skills.md#name-a-skill-in-a-message) with `$`, such as `Run $weekly-review for Acorn`.

## If a message might not have been sent

If your connection drops just as you send, web chat cannot tell whether Poppet received your message. It keeps the message and shows a notice with two buttons:

- **Recover submission** checks with Poppet. If Poppet received it, the conversation opens with the reply. If not, the message is sent now. Poppet never answers the same message twice.
- **Forget recovery** also checks with Poppet first, and opens the conversation if your message arrived. Otherwise it discards the message from this tab. Check the conversation before you send it again.

Signing out clears any message waiting for recovery from the browser tab. Check the conversation after signing back in before sending the message again.

## Delete a conversation

Choose **Delete** at the top of the conversation and confirm. Deletion cannot be undone. You cannot delete a conversation while Poppet is replying, so stop the reply first.

See [delete old sessions](chat.md#delete-old-sessions) for what else deletion affects.

## What web chat cannot do yet

Web chat does not support attachments, search, renaming, choosing a model, choosing a skill for the whole conversation, showing reasoning, or showing run details. Use the [terminal](chat.md) for these. For example, `poppet chat show <session-id>` shows run details for a web conversation.

You cannot approve commands or [reviewed MCP actions](mcp.md#review-an-action) in web chat. If Poppet needs your approval, the reply stops. Ask again in a [messaging gateway](gateways/_index.md) to approve it there. See [run commands](commands.md).

Replies show as plain text until the page has loaded its formatting, and stay readable as plain text if it fails to load. Web chat shows HTML in replies as text, apart from a few simple tags such as `<br>`. Images show as their description, and checklists lose their checkboxes. Links open in a new tab. Web chat shows other kinds of links, such as `file:` links, as plain text.

## Limits

- 10 sign-in attempts per minute from each address, and 60 per minute in total.
- Up to 32 open browser connections at once.
- Up to 32 signed-in browsers. A new sign-in then signs out the oldest one.

## Troubleshooting

If web chat does not start, the worker keeps running tasks and messaging and writes the reason to its log. Run `poppet worker logs` and look for a problem with `web.json`, a missing web build, or a port already in use. Check the origin, the proxy settings, the file permissions, and the access key hash, then restart the worker.

`poppet web login` is for [web search](web.md), not web chat. Web chat uses the access key from this guide.
