+++
title = "Read web pages"
description = "Let Poppet read public web pages you link in a message or task."
+++

# Read web pages

Poppet can read a web page when you include its address in a message or task.

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

By default, each page can be up to 1 MiB, and Poppet gives up after 15 seconds. Change these with [`limits.pageBytes` and `timeouts.pageFetchSeconds`](configuration.md#timeouts-and-limits).

Poppet only reads addresses that are in your current message or saved task prompt. It does not follow addresses it finds in earlier conversations, skills, MCP results, or other pages. This stops a web page from sending Poppet somewhere you did not ask it to go.

## If you used built-in web search

Built-in Brave and Kagi search has been removed. The `poppet web login`, `poppet web status`, and `poppet web logout` commands are no longer available.

Remove `webSearchProvider` and any older `webSearch` field from `config.json`. Poppet rejects these fields as unknown settings. Restart the worker after editing the file.

For search, connect an [MCP server](mcp.md) that offers a search tool and allow the tools you want to use. Existing search keys do not configure an MCP server for you. Follow the server's authentication instructions.

The built-in page reader cannot open an address just because an MCP result contains it. Include the address in a new message or in the task prompt if you want Poppet to read it.
