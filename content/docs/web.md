+++
title = "Read and search the web"
description = "Read public pages without a browser, or turn on web search with Brave or Kagi."
+++

# Read and search the web

Poppet can read public web pages in any chat that uses tools, including scheduled tasks. Web search is optional. When it is on, the model can search with Brave or Kagi, then read the pages it finds.

## Read a page

Include a public `http` or `https` address in your message:

```sh
poppet chat new "Summarize https://example.com/ and cite the source"
```

Poppet reads plain text and static HTML. It removes scripts, styles, and hidden content, and it does not run JavaScript. It cannot read PDFs, pages behind a login, or downloads.

Each read has a 15-second limit, follows at most three redirects, and is capped at 1 MiB. The address must resolve only to public IP addresses, and it must use a standard port. Poppet rejects addresses that contain a username or password. The result includes the final address, the page title, the text, and whether it was shortened.

Poppet reads a page only when its address is in your current message. Addresses found in earlier conversations, skills, or other pages do not count.

## Turn on web search

Choose a search provider, turn search on, then save that provider's key:

```json
{
  "webSearch": true,
  "webSearchProvider": "brave"
}
```

Use `"kagi"` for Kagi. Brave is the default.

```sh
poppet web login
poppet web status
```

`web login` prompts for the key without showing it. Use `--api-key <key>` in a script. Get a key from [Brave's LLM Context API](https://api-dashboard.search.brave.com/documentation/services/llm-context) or from [Kagi's API keys page](https://kagi.com/api/keys). `web status` reports whether search is enabled and has a key, and it does not contact the provider.

Search uses saved credentials only; environment variables cannot supply or override its keys. Each provider's key is saved separately, so you can switch between Brave and Kagi without losing either key. `web logout` removes the saved key for the selected provider. Restart the worker after you change search settings or keys.

If search is off or has no key, the search tool is not offered to the model. Reading pages still works.

## How search works

The model sends its query to the selected provider. Poppet sends only the query and fixed search options. It does not send your conversation, profile, or any inference keys. The model writes the query, so it may include details from your request. Do not ask for searches that would reveal information you want to keep private.

Each search returns up to five results, with a title, URL, and snippet. Brave uses its LLM Context API with a 2,048-token context budget. Its snippets contain extracted page passages joined with blank lines. Kagi returns search snippets.

Results stay in provider order and fit the 16 KiB tool-output limit. Poppet reserves space for URLs first, then shares the remaining space across titles and finally snippets. Text may be shortened, and URLs that cannot fit are omitted. The result reports whether it was truncated.

Each search has a 15-second limit and a 1 MiB response limit. Poppet does not retry or fall back to the other provider.

Pages that appear in search results can be read in the same run. That permission lasts only for that run. Links that appear only in snippets or page text do not get this permission. Poppet treats search results as data, so they cannot change memory or tasks.

See [chat](chat.md#search-the-web) for how answers cite sources.
