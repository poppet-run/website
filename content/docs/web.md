+++
title = "Read and search the web"
description = "Let Poppet read web pages you link, or turn on web search with Brave or Kagi."
+++

# Read and search the web

Poppet can read a web page when you include its address in a message or task. It can also search the web, once you turn on search with a Brave or Kagi account.

## Read a page

Include a web address in your message:

```sh
poppet chat new "Summarize https://example.com/ and cite the source"
```

Poppet reads the text of the page. It cannot read:

- PDFs or other downloads
- pages behind a login
- pages that need JavaScript to show their content
- addresses on your own network, such as `localhost` or a router's address

Each page can be up to 1 MiB, and Poppet gives up after 15 seconds.

Poppet only reads addresses that are in your current message, or that it found with web search in the same answer. It does not follow addresses it finds in earlier conversations, skills, or other pages. This stops a web page from sending Poppet somewhere you did not ask it to go.

## Turn on web search

Web search needs an API key from [Brave](https://api-dashboard.search.brave.com/documentation/services/llm-context) or [Kagi](https://kagi.com/api/keys). Choose a provider in `config.json`:

```json
{
  "webSearchProvider": "brave"
}
```

Use `"kagi"` for Kagi. Then save your key, check it, and restart the worker:

```sh
poppet web login
poppet web status
poppet worker restart
```

`web login` asks for the key without showing it. `web status` tells you whether search is on and has a key. It does not contact Brave or Kagi.

Poppet keeps a separate key for each provider, so you can switch between them by changing `webSearchProvider`. To turn search off, remove `webSearchProvider`. Your keys stay saved. `poppet web logout` removes the key for the selected provider.

If your `config.json` has an old `webSearch` field, remove it. Poppet reports it as an error.

## What Poppet sends

Poppet sends only the search words to Brave or Kagi, not your conversation, profile, or other keys. The model chooses the search words, so they can include details from your message. Avoid asking for searches that would reveal something you want to keep private.

Each search returns up to five results. Poppet can answer from the search results, or read the pages they link to for more detail. See [search the web](chat.md#search-the-web) for how Poppet cites its sources.

Poppet treats search results and web pages as information, never as instructions. They cannot change your memory or tasks.
