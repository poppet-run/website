+++
title = "ChatGPT"
description = "Connect Poppet to ChatGPT through browser sign-in, choose a model, and manage plan-usage consent and credentials."
weight = 10
+++

# ChatGPT

ChatGPT connects through browser sign-in, so you do not need an API key. Requests use your ChatGPT account and its plan limits.

## Connect

```sh
poppet provider login openai-chatgpt
poppet provider status openai-chatgpt
```

`login` opens your system browser. Choose the account and workspace, and approve plan-usage access if asked. The browser then shows a confirmation page. Return to the terminal, where Poppet runs its final checks.

If sign-in works but plan-usage access was not granted, `status` shows `planUsage: false`. Run `poppet provider login openai-chatgpt` again to approve it. Poppet asks for it again only when the saved sign-in lacks that access.

Poppet stores one ChatGPT account. If you sign in with a different account, log out first.

## Headless and remote machines

Over SSH, on Linux without a display, or with `--no-browser`, login prints a sign-in link instead of opening a browser:

```sh
poppet provider login openai-chatgpt --no-browser
```

Open the link in a browser on another device and sign in. The browser then tries to open `http://127.0.0.1:<port>/auth/callback?...` and may show a connection error. Copy the full address from its address bar and paste it at Poppet's `Callback URL:` prompt in the remote terminal.

Poppet checks the address against this sign-in attempt and its callback port. An address that does not match is ignored, so you can paste again. Sign-in times out after five minutes. Esc, Ctrl-C, or Ctrl-D cancels it.

Alternatively, forward a fixed callback port. Run this SSH command on the machine with the browser, then run login in that remote session:

```sh
ssh -L 1455:127.0.0.1:1455 <host>
poppet provider login openai-chatgpt --no-browser --callback-port 1455
```

The browser callback reaches Poppet through the tunnel, with no paste needed. If the port is in use, login fails before printing a link. Both methods save credentials and registration on the remote machine.

## Models

```sh
poppet provider models openai-chatgpt
```

`models` always fetches the current list for your account. If your account is not eligible, or you have reached a usage limit, Poppet shows that error. It does not retry the request for you.

Save a model from the list in `config.json`:

```json
{
  "provider": "openai-chatgpt",
  "model": "replace-with-model-id"
}
```

## Credentials

Sign-in details are saved in `<data directory>/auth/connection.json`, readable only by your user. Poppet refreshes access tokens before they expire. Tokens never appear in command output.

## Log out

```sh
poppet provider logout openai-chatgpt
```

`logout` deletes the saved sign-in and tries to revoke it with OpenAI. If revocation cannot be confirmed, Poppet says so. To finish, disconnect Poppet in ChatGPT's settings. Logout does not touch your other providers.

See [configuration](../configuration.md) for your default provider and model.
