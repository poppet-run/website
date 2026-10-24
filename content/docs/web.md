+++
title = "Read and search the web"
description = "Read public pages without a browser, or turn on web search with Brave or Kagi."
next = "/docs/browser"
+++

# Read and search the web

Poppet can read public web pages in any chat that uses tools, including scheduled tasks. Web search is optional. When it is on, the model can search with Brave or Kagi, then read the pages it finds.

## Read a page

Include a public `http` or `https` address in your message:

```fish
poppet chat new "Summarize https://example.com/ and cite the source"
```

Poppet reads plain text and static HTML. It removes scripts, styles, and hidden content, and it does not run JavaScript. It cannot read PDFs, pages behind a login, or downloads. Use [browser automation](browser.md) for pages that need JavaScript.

Each read has a 15-second limit, follows at most three redirects, and is capped at 1 MiB. The address must resolve only to public IP addresses, and it must use a standard port. Addresses with a username or password in them are rejected. The result includes the final address, the page title, the text, and whether it was shortened.

A page is read only when the address appears in your current message. Addresses found in earlier conversations, skills, or other pages do not count.

## Turn on web search

Choose a search provider, turn search on, then save that provider's key:

```json
{
  "webSearch": true,
  "webSearchProvider": "brave"
}
```

Use `"kagi"` for Kagi. Brave is the default.

```fish
poppet web login
poppet web status
```

`web login` prompts for the key without showing it. Pipe a key with `--key-stdin` in a script. Get a key from [Brave's Web Search API](https://api-dashboard.search.brave.com/app/documentation/web-search) or from [Kagi's API keys page](https://kagi.com/api/keys). `web status` reports whether search is enabled and has a key, and it does not contact the provider.

Each provider's key is saved separately, so you can switch between Brave and Kagi without losing either key. `web logout` removes the saved key for the selected provider. Restart a running worker after changing search settings or keys.

If search is off or has no key, the search tool is not offered to the model. Reading pages still works.

## How search works

The model sends its query to the selected provider. Poppet sends only the query and fixed search options. It does not send your conversation, profile, or any inference keys. The model writes the query, so it may include details from your request. Do not ask for searches that would reveal information you want to keep private.

Each search returns up to five results, with a title, URL, and snippet. Each search has a 15-second limit and a 1 MiB response limit. Poppet does not retry or fall back to the other provider.

Pages that appear in search results can be read in the same run. That permission lasts only for that run. Links that appear only in snippets or page text do not get this permission. Search results are treated as data, so they cannot change memory or tasks.

See [chat](chat.md#search-the-web) for how answers cite sources.
