+++
title = "ChatGPT"
description = "Connect Poppet to your ChatGPT account, choose a model, and sign out."
weight = 10
+++

# ChatGPT

Poppet can use your ChatGPT account, so you do not need an API key. Your messages count toward your ChatGPT plan's limits.

## Connect

```sh
poppet provider login openai-chatgpt
poppet provider status openai-chatgpt
```

`login` opens your browser. Choose your account and workspace, and allow Poppet to use your plan if ChatGPT asks. When the browser shows a confirmation page, return to the terminal.

If `status` shows `planUsage: false`, you signed in without allowing plan usage. Run `login` again to allow it.

Poppet can be signed in to one ChatGPT account at a time. To switch accounts, run `poppet provider logout openai-chatgpt --forget`, then sign in again.

## Headless and remote machines

On a computer without a browser, or over SSH, add `--no-browser`. Poppet prints a sign-in link instead of opening a browser:

```sh
poppet provider login openai-chatgpt --no-browser
```

1. Open the link in a browser on any device and sign in.
2. The browser then tries to open an address starting with `http://127.0.0.1`, and may show a connection error. This is expected.
3. Copy the full address from the browser's address bar.
4. Paste it at the `Callback URL:` prompt in your terminal.

If you paste the wrong address, Poppet ignores it and waits for another. Sign-in times out after five minutes. Press Esc or Ctrl-C to cancel.

If you connect over SSH, you can skip the copy and paste by forwarding a port. On the computer with the browser, connect like this, then sign in on the remote computer:

```sh
ssh -L 1455:127.0.0.1:1455 <host>
poppet provider login openai-chatgpt --no-browser --callback-port 1455
```

The browser then reaches Poppet through the SSH connection. If port 1455 is already in use, choose another port and use it in both commands.

## Models

```sh
poppet provider models openai-chatgpt
```

This lists the models your account can use right now. If your account is not eligible, or you have reached a usage limit, Poppet shows ChatGPT's error.

Save a model from the list in `config.json`:

```json
{
  "provider": "openai-chatgpt",
  "model": "replace-with-model-id"
}
```

## Your sign-in

Poppet saves your sign-in in the `auth` folder of your data directory, where only you can read it. It renews your sign-in automatically.

## Sign out

```sh
poppet provider logout openai-chatgpt
```

Signing out asks ChatGPT to end Poppet's access, and deletes the sign-in from your computer. If Poppet cannot confirm that ChatGPT ended its access, it tells you. Poppet still remembers which account you used, and signing in again reconnects it.

To also forget the account, for example to switch to another one, add `--forget`:

```sh
poppet provider logout openai-chatgpt --forget
```

To remove Poppet from your ChatGPT account entirely, disconnect it in ChatGPT's settings.
