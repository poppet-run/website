+++
title = "Browser automation"
description = "Turn on optional browsing for rendered pages and the form actions you request."
+++

# Browser automation

Poppet can use a browser to open websites, read the rendered text, and fill in forms or click buttons when you ask. Browser tools are available in terminal chat and in messaging chats. Scheduled tasks never get browser tools.

Poppet uses [agent-browser](https://agent-browser.dev/) to control the browser. It is off until you set it up.

## Install the pinned versions

Poppet is tested with agent-browser **0.39.1** and Chrome for Testing **155.0.8059.84**, on macOS and Linux. Install agent-browser with Node 24 or later:

```sh
npm install -g agent-browser@0.39.1
agent-browser --version
```

Download the matching Chrome for Testing build and unzip it into `~/.agent-browser/browsers/chrome-155.0.8059.84/`:

| Platform            | Download                                                                                                           |
| ------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Apple silicon macOS | [mac-arm64](https://storage.googleapis.com/chrome-for-testing-public/155.0.8059.84/mac-arm64/chrome-mac-arm64.zip) |
| Intel macOS         | [mac-x64](https://storage.googleapis.com/chrome-for-testing-public/155.0.8059.84/mac-x64/chrome-mac-x64.zip)       |
| Linux x64           | [linux64](https://storage.googleapis.com/chrome-for-testing-public/155.0.8059.84/linux64/chrome-linux64.zip)       |

Do not use `agent-browser install`, because it installs a different Chrome version. Poppet never installs software or changes versions. It checks the versions the first time a browser action runs. If something is missing, that action fails with a message, and other tools keep working.

If `agent-browser` is not on the worker's `PATH`, set its full path in `config.json` with `command`. You can also set `chromiumExecutable` to an absolute path to the Chrome binary.

## Turn it on

Add a `browser` section to `config.json` and list the hostnames it may visit:

```json
{
  "browser": {
    "enabled": true,
    "allowedDomains": ["example.com", "www.example.com"]
  }
}
```

Hostnames are lowercase, without `https://`, ports, paths, or `*`. Include any CDN hosts a site needs. Each allowed hostname covers all its ports. An empty or missing list keeps browsing off.

`"allowedDomains": ["*"]` allows every HTTP or HTTPS site, including local and private network addresses. That includes your router's admin page and other services on your network, so avoid it unless you need it. Set `"enabled": false` to turn browsing off. Restart the worker after you change these settings.

## Use it

```sh
poppet chat new "Use the browser to open https://example.com and summarize its rendered page"
```

The model can open a page, take a snapshot of the page's elements, click, fill in fields, press keys, and scroll. Snapshots give elements short references such as `e1`. The model refreshes the snapshot after each action, so references stay current.

Each run gets a fresh, isolated browser. Cookies, tabs, and logins do not carry over between messages, and the browser closes when the run ends. Results include the current URL and page text, limited to 16 KiB.

## Permissions

Clicking, filling in forms, and pressing Enter can submit forms or change things on a site. Poppet only does these when you ask. Poppet treats text on a web page as data, so it cannot give the model new instructions or permissions.

The browser skips the public-address check that page reading uses. Allowed hosts can resolve to private addresses on your network. Only allow sites you trust.

Poppet does not support saved logins, file uploads or downloads, screenshots, PDFs, running arbitrary JavaScript, or clipboard access.

See the upstream [agent-browser security notes](https://agent-browser.dev/security) for more about its limits.
