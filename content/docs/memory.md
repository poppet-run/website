+++
title = "Memory"
description = "Save preferences and facts across conversations, and edit your profile and Poppet's personality."
+++

# Memory

Memory has three parts: saved facts, your profile, and Poppet's personality. Facts are short values saved under a key, either by you or by Poppet when you ask in chat. Every new run reads them with your profile and personality.

## Saved facts

Save a fact with a key, then list and change it:

```sh
poppet memory remember answer.style "Keep answers concise"
poppet memory list
poppet memory replace answer.style "Explain the reasoning"
poppet memory forget answer.style
```

`remember` creates a new key and refuses one that already exists. `replace` and `forget` need an existing key. Keys start with a letter or digit and may contain letters, digits, dots, underscores, and hyphens, up to 128 characters. Values are nonempty text of up to 4096 bytes. You can store up to 128 facts.

Memory commands work without a model or login. Listing shows each key, its value, when it changed, and where it came from.

## Ask Poppet to change a fact

In chat, ask Poppet to remember, replace, or forget a fact:

```sh
poppet chat new "Remember that I prefer concise answers, under answer.style"
poppet chat send $session_id "Replace answer.style with Explain the reasoning"
poppet chat send $session_id "Forget the saved fact answer.style"
```

Poppet changes memory only when your current message asks for it. It does not infer facts from conversations, web pages, or skills. Poppet marks changes made in chat with that origin, and they stay saved even if the rest of the reply fails. Forgetting a fact does not remove it from earlier messages.

Chat changes apply from the next run onward. Scheduled runs can read facts but cannot change them.

## Fact history

Every change is kept, so you can see how a fact changed and restore an earlier value:

```sh
poppet memory history answer.style
poppet memory revert answer.style 1
```

`history` lists each revision with its origin and, for chat changes, the run that made it. `revert` does not erase history. It adds a new revision with the old value. Reverting to a forgotten revision forgets the fact again.

## Profile

Edit `profile.md` in your data directory for your name, background, and preferences. With the default data directory, that is `~/.config/poppet/profile.md`. Poppet does not create the file for you. It must be a plain UTF-8 file, and it is limited to 8 KiB.

## Personality

Edit `soul.md` in the same directory to change how Poppet writes:

```markdown
Be warm, direct, and concise. Use dry humor sparingly.
Disagree when there is a good reason, and admit uncertainty plainly.
```

`soul.md` describes how Poppet speaks, and `profile.md` describes you. Neither file gives Poppet permission to use tools or change its rules. A missing or blank `soul.md` keeps the default personality. Like the profile, it is limited to 8 KiB.

## Limits

Facts, profile, and personality are each limited to 8 KiB in each run. If one is too large, the run fails with an error. Poppet never trims them to fit. All three count toward the run's context budget.
