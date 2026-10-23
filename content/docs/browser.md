+++
title = "Browser automation"
description = "Enable optional browsing for rendered pages and the form actions you request."
next = "/docs/mcp"
+++

# Browser automation

Use the browser for sites that need JavaScript, or for actions such as filling in a form. For static public pages, [web reading](/docs/web/) needs no browser installation. Scheduled tasks cannot use browser tools.

Poppet uses agent-browser to navigate websites, read rendered text and accessibility
snapshots, and fill in forms when you ask. Browser tools are optional in CLI, worker-backed,
and authorized messaging chats. Scheduled runs get no browser tools.

## Install and configure

The integration pins agent-browser **0.39.1** and Chrome for Testing **155.0.8059.84**,
on macOS and Linux. For example, install the CLI with Node 24 or later and npm:

```fish
npm install -g agent-browser@0.39.1
agent-browser --version
command -s agent-browser
```

Use the native binary, not the JavaScript launcher. A global npm install normally links
to it. The binary also sits in the package's `bin` directory, under a name such as
`agent-browser-darwin-arm64`, `agent-browser-darwin-x64`, or the matching Linux binary.
Poppet must own that exact daemon process.

Download and extract the pinned browser to a stable location:

| Platform            | Download                                                                                                           |
| ------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Apple silicon macOS | [mac-arm64](https://storage.googleapis.com/chrome-for-testing-public/155.0.8059.84/mac-arm64/chrome-mac-arm64.zip) |
| Intel macOS         | [mac-x64](https://storage.googleapis.com/chrome-for-testing-public/155.0.8059.84/mac-x64/chrome-mac-x64.zip)       |
| Linux x64           | [linux64](https://storage.googleapis.com/chrome-for-testing-public/155.0.8059.84/linux64/chrome-linux64.zip)       |

`agent-browser install` installs current stable Chrome, which may not match this pin. Use the
testing browser, not your everyday Chrome profile. Add this section to your existing
`<data directory>/config.json`:

```json
{
  "browser": {
    "enabled": true,
    "command": "/absolute/path/to/agent-browser-darwin-arm64",
    "chromiumExecutable": "/absolute/path/to/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing",
    "allowedDomains": ["example.com", "www.example.com"]
  }
}
```

`command` defaults to `agent-browser` on your `PATH`. For the worker, use an absolute path. A
command path that contains `/` resolves beside `config.json`. `chromiumExecutable` must be
absolute. To restrict browsing, allow 1 to 32 exact lowercase hostnames, with no schemes, ports,
paths, or wildcards. List any CDN hosts the site needs. An allowed hostname covers all of its ports.

Set `"allowedDomains": ["*"]` to allow every HTTP(S) hostname, including localhost and private
networks. This also turns off hostname filtering for redirects, new tabs, and subresources. Other
wildcard patterns, such as `*.example.com`, are not supported. A missing or empty list never turns on
unrestricted browsing. HTTP(S)-only navigation, rejection of URLs with embedded credentials, isolated
browser state, fixed actions, WebRTC blocking, and output limits still apply. Wildcard mode keeps
WebRTC blocking through a fixed startup script that the host owns, and through Chrome's restriction on
non-proxied UDP. It gives the model no script or launch options.

`POPPET_BROWSER` replaces the whole file section. `{"enabled":false}` turns browser access off.
`bun run start config` shows the settings for the process that runs it, without launching a browser.
Restart the worker after you edit the settings. If an executable is missing or the wrong version, you
get a sanitized diagnostic, and browser tools are left out. Regular chat and MCP tools keep working.
Poppet never installs or upgrades software.

## Use and cleanup

```fish
bun run start chat new "Use the browser to open https://example.com and summarize its rendered page"
```

The tools are `poppet_browser.open`, `snapshot`, `click`, `fill`, `press`, `scroll`, and `close`.
Take a snapshot before you click or fill an element. Use its current element references. Both `e1`
and `@e1` are accepted, and they are checked against that snapshot. Take a fresh snapshot after every
interaction. Common navigation and editing keys are supported, but arbitrary shortcuts are not.
Form values are sent as structured data, so they cannot become command flags. `close` ends browser
use for the run.

Every run gets its own private home directory, namespace, daemon, and browser. Cookies, tabs, login
state, and element references do not carry over between messages. Existing MCP tools keep working.

Results contain the current URL, the text, and a `truncated` flag, within `POPPET_TOOL_BYTES`. Raw
responses and each process pipe are capped at 256 KiB. Arguments are capped at 64 KiB, form text at
8192 characters, and snapshot depth at 12. An oversized raw response fails. Version checks and readiness
checks each have a five-second deadline. Native requests have 35 seconds, and element waits default to
ten seconds. The existing run and call budgets still apply.

Completion, failure, Ctrl-C, timeout, and worker shutdown all release the run's resources. A graceful
daemon shutdown can take up to 40 seconds while the runtime closes the browser's process tree. Cleanup
failures are reported. Saved calls use `serverId: "browser"` and the operation name in `chat show`. A
lost response, or a cancellation after dispatch, leaves the call in an unknown state. Check the external
state before you ask for another attempt. Actions are never replayed automatically.

## Permissions and limits

Clicks, filling, and Enter can submit forms or change external state, so ask for those actions
explicitly. Page text is untrusted. It cannot authorize actions, widen domain access, change notes,
memory, or tasks, or grant `fetch_page` access. Model instructions respect these boundaries, but they do
not prove that a click is safe.

The daemon gets a deny-by-default action policy before it navigates. When `allowedDomains` has no `"*"`
entry, the daemon also gets hostname restrictions that apply to redirects, new tabs, and subresources.
Poppet passes private settings and a minimal environment. It leaves out provider keys, channel tokens,
ambient plugins, saved profiles, and inherited launch flags. Arguments from the model cannot change the
session, the executable, the domains, or the policy.

Browser traffic does not go through the page reader's public-IP and DNS checks. Allowed hosts can resolve
to private addresses. This is not an operating-system network sandbox, so only allow hosts you trust. See
the upstream [security limitations](https://agent-browser.dev/security). Persistent login state, access to
the auth vault, browser attachments, arbitrary JavaScript, uploads and downloads, clipboard access,
screenshots, PDFs, cloud browsers, and a general approval workflow are not included.
