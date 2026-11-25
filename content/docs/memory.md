+++
title = "Memory"
description = "Save facts across conversations, and tell Poppet about yourself and how to write."
+++

# Memory

Poppet reads three things at the start of every answer:

- **Saved facts.** Short notes, each saved under a name called a key. You or Poppet can save them.
- **Your profile.** A file where you describe yourself.
- **Poppet's personality.** A file that describes how Poppet writes.

## Saved facts

Save a fact under a key, then list, change, or forget it:

```sh
poppet memory set answer.style "Keep answers concise"
poppet memory list
poppet memory set answer.style "Explain the reasoning"
poppet memory forget answer.style
```

`memory set` creates a fact or replaces it. `memory list` shows each fact, when it last changed, and whether you or Poppet changed it. Memory commands work without a provider connection.

Keys start with a letter or digit and can contain letters, digits, dots, underscores, and hyphens, up to 128 characters. Each value can be up to 4 KiB of text. You can save up to 128 facts. Together they can take up 8 KiB. If you reach that limit, shorten or forget some facts before you add more.

## Ask Poppet to change a fact

In any chat, ask Poppet to remember, replace, or forget a fact:

```sh
poppet chat new "Remember that I prefer concise answers, under answer.style"
poppet chat send $session_id "Replace answer.style with Explain the reasoning"
poppet chat send $session_id "Forget the saved fact answer.style"
```

Poppet changes memory only when your message asks it to. It does not pick up facts on its own from conversations, web pages, or skills. The change is saved even if the rest of the reply fails, and Poppet uses it from your next message.

Forgetting a fact does not remove it from earlier conversations. Scheduled tasks can read facts but cannot change them.

## Fact history

Poppet keeps every version of a fact, so you can see how it changed and go back:

```sh
poppet memory history answer.style
poppet memory revert answer.style 1
```

`memory history` lists each version with a number, and shows whether you or Poppet made it. `memory revert` restores the version you choose by saving it as a new version, so nothing is lost. Reverting to a version where the fact was forgotten forgets it again.

## Profile

Create `profile.md` in your data directory to tell Poppet your name, background, and preferences. With the default data directory, that is `~/.config/poppet/profile.md`. Poppet does not create this file for you.

## Personality

Create `soul.md` in the same folder to change how Poppet writes:

```markdown
Be warm, direct, and concise. Use dry humor sparingly.
Disagree when there is a good reason, and admit uncertainty plainly.
```

`soul.md` describes how Poppet speaks, and `profile.md` describes you. Without `soul.md`, Poppet uses its default personality. Neither file lets Poppet do anything it could not do before.

## Limits

Your facts, `profile.md`, and `soul.md` can each be up to 8 KiB. If one is larger, Poppet stops with an error instead of cutting it short. All three count toward how much Poppet can send the model, so long files leave less room for the conversation.

`profile.md` and `soul.md` must be plain text files that only you can change. If Poppet refuses one, make sure it is a regular file, not a link, and set its permissions:

```sh
chmod 600 ~/.config/poppet/profile.md ~/.config/poppet/soul.md
```
