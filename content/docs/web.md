+++
title = "Read and search the web"
description = "Read public pages without a browser, or enable web search with Brave or Kagi."
next = "/docs/browser"
+++

# Read and search the web

Ask Poppet to read a public page by including its URL in your message. To find pages through search, turn on web search with Brave or Kagi below.

## Read a page

With a connected model that supports tools:

```fish
bun run start chat new "Summarize https://example.com/ and cite the source"
```

Include the URL in your current message each time you want a fresh read. Poppet reads static HTML or UTF-8 text and records the source and tool result in the session. It does not execute JavaScript, log in, read PDFs, or crawl links.

If you need a rendered site or an interaction, use [browser automation](browser.md). See [page-reading limits](chat.md#read-a-supplied-url) for supported URLs and network checks.

## Enable search

Get an API key from [Brave Search](https://api-dashboard.search.brave.com/app/documentation/web-search) or [Kagi](https://kagi.com/api/keys). Brave is the default provider. To use Kagi, set `webSearchProvider` as well as `webSearch`.

Add `"webSearch": true` to your existing `config.json`, keeping your provider and model fields. For Kagi, add `"webSearchProvider": "kagi"` too:

```json
{
  "provider": "openai-chatgpt",
  "model": "replace-with-model-id",
  "webSearch": true,
  "webSearchProvider": "kagi"
}
```

Enter the key for the provider you selected when `web login` prompts:

```fish
bun run start web login
bun run start web status
```

Keep the provider and model you selected during setup. Save the API key through `web login`, separate from this file. Restart a running worker after changing settings or credentials.

Run `web status` again. It shows the provider, and whether search is enabled and configured. This checks local settings without contacting the search provider. Try a search to check that the key works:

```fish
bun run start chat new "Search for recent Bun releases, read a source, and cite it"
```

Search queries go to the provider you selected and may use its API quota. The model writes the query, and it can include private details from your request. Search results and page content cannot authorize changes to your notes or memory.

See [search configuration](configuration.md#web-search) for credentials and overrides, and [search behavior](chat.md#search-the-web) for source access, limits, and citations.

## Inspect a result

Copy the session ID printed by the chat command:

```fish
set session_id 'paste-session-id-here'
bun run start chat show $session_id
```

The saved tool calls show whether Poppet read a page or used a search snippet. They also record search and page-reading errors.
