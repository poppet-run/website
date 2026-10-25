+++
title = "ChatGPT"
description = "Connect Poppet to ChatGPT through browser sign-in, select a model, and manage consent and credentials."
weight = 10
+++

# ChatGPT

ChatGPT connects through browser sign-in, so you do not need an API key. Requests use your ChatGPT account and its plan limits.

## Sign in

```sh
poppet provider login openai-chatgpt
poppet provider models openai-chatgpt
poppet provider status openai-chatgpt
```

`login` opens your system browser. Choose the account and workspace, and approve plan-usage access if asked. The browser then shows a confirmation page. Return to the terminal, where Poppet runs its final checks.

If sign-in works but plan-usage access was not granted, `status` shows `planUsage: false`. Run `poppet provider login openai-chatgpt` again to approve it. Poppet asks for it again only when the saved sign-in lacks that access.

Poppet stores one ChatGPT account. If you sign in with a different account, log out first.

`provider models` always fetches the current list. If your account is not eligible, or you have reached a usage limit, Poppet shows that error. It does not retry the request for you.

## Credentials

Sign-in details are saved in `<data directory>/auth/connection.json`, readable only by your user. Poppet refreshes access tokens before they expire. Tokens never appear in command output.

## Log out

```sh
poppet provider logout openai-chatgpt
```

This deletes the saved sign-in and tries to revoke it with OpenAI. If revocation cannot be confirmed, Poppet says so. To finish, disconnect Poppet in ChatGPT's settings. Logout does not touch your other providers.

See [configuration](../configuration.md) for your default provider and model, and [chat](../chat.md) for saved sessions.
