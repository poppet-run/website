+++
title = "Configuration"
description = "Save settings in config.json, use environment overrides, and set chat limits."
weight = 20
+++

# Configuration

Save settings in `config.json` so that new terminals and restarted workers use them. [Getting started](getting-started.md) shows the provider and model fields you need for your first chat. This page covers the remaining settings.

## Configuration file

Save persistent settings in `<data directory>/config.json`, which defaults to
`~/.config/poppet/config.json`. The file is optional, and every field in it is optional:

```json
{
  "provider": "openrouter",
  "model": "replace-with-model-id",
  "notesDirectory": "notes",
  "chat": {
    "contextBytes": 65536,
    "outputTokens": 2048,
    "modelTurns": 8
  }
}
```

When a setting is defined in more than one place, the order is: explicit command arguments
(where supported), then environment variables, then file values, then built-in defaults.
Environment overrides apply to one field at a time. Overriding output tokens leaves the
file's other chat limits alone.

`POPPET_DATA_DIR` selects the data directory and its config file. It can only be set from the
environment, and `dataDirectory` is not accepted in the file. A missing file means Poppet uses
environment variables and defaults, and it creates nothing. Unreadable files, files larger than
64 KiB, malformed JSON, unknown keys, and wrong value types all fail with a configuration error.

Use JSON numbers for chat limits. Text values must be nonempty, with no leading or trailing
whitespace. A relative `notesDirectory` in the file resolves beside `config.json`. Environment
paths resolve against the current working directory. A literal `~` is not expanded in either
place.

Processes read the configuration when they start, so restart a running worker after you edit the
file. Defaults apply to new chats, messaging sessions, and tasks. Existing sessions and tasks keep
their saved provider and model. Credentials and channel settings stay in their own protected stores.

## Settings and environment overrides

| Environment variable   | File field          | Default                  | Purpose                                                                                            |
| ---------------------- | ------------------- | ------------------------ | -------------------------------------------------------------------------------------------------- |
| `POPPET_APP_NAME`      | `applicationName`   | `Poppet`                 | Application name used for initial ChatGPT registration                                             |
| `POPPET_DATA_DIR`      | Environment only    | `~/.config/poppet`       | Configuration, credentials, and conversation storage                                               |
| `POPPET_NOTES_DIR`     | `notesDirectory`    | `<data directory>/notes` | Notes tools' permitted directory                                                                   |
| `POPPET_PROVIDER`      | `provider`          | `openai-chatgpt`         | `openai-chatgpt`, `opencode-go`, or `openrouter`                                                   |
| `POPPET_MODEL`         | `model`             | Unset                    | Model ID for verification and new sessions and tasks                                               |
| `POPPET_MCP_SERVERS`   | `mcpServers`        | `[]`                     | JSON server list replacing file values; local MCP tools and scheduled permissions                  |
| `POPPET_BROWSER`       | `browser`           | `{"enabled":false}`      | JSON object replacing browser settings, with native CLI, pinned Chromium, and allowed domains      |
| `POPPET_VOICE`         | `voice`             | `{"enabled":false}`      | JSON object replacing local voice settings; explicit absolute decoder, transcriber and model paths |
| `POPPET_WEB_SEARCH`    | `webSearch`         | `false`                  | Enable web search when the selected provider has a key                                                 |
| `POPPET_WEB_SEARCH_PROVIDER` | `webSearchProvider` | `"brave"` | Search provider, `brave` or `kagi` |
| `POPPET_LOG_REASONING` | `chat.logReasoning` | `false`                  | Log readable provider reasoning to CLI stderr and worker logs                                      |
| `POPPET_LOG_TIMINGS`   | `chat.logTimings`   | `false`                  | Log request-stage durations to CLI stderr and worker logs                                          |
| `POPPET_CONTEXT_BYTES` | `chat.contextBytes` | `65536`                  | Context estimate in UTF-8 bytes, including instructions and continuation; maximum `1048576`        |
| `POPPET_HISTORY_TURNS` | `chat.historyTurns` | `20`                     | Previous complete exchanges sent to the model; maximum `100`                                       |
| `POPPET_OUTPUT_TOKENS` | `chat.outputTokens` | `2048`                   | Requested output limit when supported, capped by model metadata; maximum `32768`                   |
| `POPPET_MODEL_TURNS`   | `chat.modelTurns`   | `8`                      | Model requests per run; range `1–32`                                                               |
| `POPPET_TOOL_CALLS`    | `chat.toolCalls`    | `16`                     | Tool calls per run; range `1–64`                                                                   |
| `POPPET_TOOL_BYTES`    | `chat.toolBytes`    | `16384`                  | UTF-8 bytes per serialized tool result; range `1024–65536`                                         |
| `POPPET_SOUL_BYTES`    | `chat.soulBytes`    | `8192`                   | UTF-8 bytes in `soul.md`; range `1–65536`                                                          |
| `POPPET_PROFILE_BYTES` | `chat.profileBytes` | `8192`                   | UTF-8 bytes in `profile.md`; range `1–65536`                                                       |
| `POPPET_FACTS_BYTES`   | `chat.factsBytes`   | `8192`                   | UTF-8 bytes of serialized saved facts sent to the model; range `1–65536`                           |
| `POPPET_SKILL_INDEX_BYTES` | `chat.skillIndexBytes` | `8192` | UTF-8 bytes of the skill index sent to the model; `0` disables model-selected skills; range `0–65536` |
| `POPPET_LEARN_SKILLS` | `chat.learnSkills` | `false` | Let interactive runs create and change learned skills |

To override a setting for one terminal session in fish:

```fish
set -lx POPPET_DATA_DIR "$HOME/.local/share/poppet"
set -lx POPPET_NOTES_DIR "$HOME/Documents/Notes"
bun run start config
```

An empty or invalid environment value is an error. Poppet does not fall back to the file.

The `config` command prints the effective application settings of the process that runs it,
all chat settings under `chat`, and the config file's `path` and `exists` status under
`configFile`. It also lists the settings supplied through the environment, under
`environmentOverrides`. It does not inspect a running worker's settings, create directories,
open a database, or contact a provider. Credentials and secret environment variables never
appear in this output.

Chat budgets must be positive integers within the ranges above. Chat execution, worker
startup, and conversation search all check them. Listing and inspecting sessions work even
when a budget is out of range.

## MCP servers

See [MCP tools](mcp.md) for server entries, selected environment values and protected
credential references, separate scheduled allowlists, limits, and inspection. The
configuration holds only names and references, never secret values. Restart the worker
after you edit them.

## Browser automation

Browser automation uses an optional `browser` section of the file, which `POPPET_BROWSER`
replaces. It is off by default. See [browser setup](browser.md) for the pinned executables,
allowed hostnames, settings, and limitations. Restart the worker after you edit it. Scheduled
runs get no browser tools.

## Reasoning logs

Set `chat.logReasoning` to `true` in `config.json` to show provider reasoning in the CLI and
write it to the background worker's `<data directory>/logs/worker.log`. The setting is `false`
by default. It applies to chat requests, scheduled tasks, and messaging runs alike. Restart the
worker after you change the file. A CLI environment override does not change a running worker's
configuration.

```json
{
  "chat": {
    "logReasoning": true
  }
}
```

For a temporary local override in fish:

```fish
set -lx POPPET_LOG_REASONING true
bun run start chat new "Review my notes"
```

`chat new` and interactive chat stream readable reasoning to stderr under a `Thinking:` heading
as chunks arrive. The heading uses muted cyan when colour is enabled. Local and worker-backed
requests use the same formatting. Redirected stderr stays readable, with no terminal animation.
Worker logs and `chat send` diagnostics use `Thinking` entries that include the session and run
IDs. These entries are held until a newline, a 2048-character chunk, or the next answer or
completion event. Any pending text is flushed if the run fails or is interrupted. Reasoning has
its own 128 KiB limit per run. Answer stdout and messaging replies contain only the answer text.
Logs may repeat private prompt or tool content. They use the worker's existing protected files
and rotation.

Only readable text that the provider returns is logged. OpenAI Responses models are asked for
reasoning summaries. OpenRouter and OpenCode return the reasoning text or summaries they receive.
Whether any is available depends on the model and provider. Encrypted reasoning and continuation
metadata are left out. This setting does not choose a reasoning effort or a token budget.

## Timing logs

Set `chat.logTimings` to `true` in `config.json` to log request durations in milliseconds. It is
`false` by default. It covers CLI, scheduled, and messaging runs. Worker-backed CLI requests also
receive the diagnostics on stderr. Restart a running worker after you change its configuration.

For a temporary local override in fish:

```fish
set -lx POPPET_LOG_TIMINGS true
bun run start chat interactive
```

Each `Timing` entry has a session ID, a run ID when one is available, and JSON with `stage` and
`durationMs`. The measured stages are memory loading, model resolution, ChatGPT catalog lookup,
MCP startup and discovery, each model turn, tool execution, the full run, and optional session
naming. Catalog entries include `cached`. Timed operations include an `outcome` of `completed`,
`failed`, or `interrupted`. Model resolution includes authentication and catalog access. The
`first-text` duration starts when the agent begins a run and ends at its first nonempty answer
chunk. It includes any tool turns that come before that chunk. It excludes CLI startup and the
wait for another run's permit. Naming happens after the answer and has its own duration. Nested
stage durations must not be added together.

Logs contain fixed stage labels, identifiers, durations, and outcomes. They leave out prompts,
answers, tool arguments, credentials, and continuation state. Answer stdout and messaging replies
still contain only the answer text.

## API keys

API-key login saves credentials to `<POPPET_DATA_DIR>/auth/openrouter.json` or
`opencode-go.json`. The files are `0600`, inside a `0700` directory. Writes replace the file
atomically, and each provider has its own lock. Login uses an existing environment key if one is
set. Otherwise it prompts without echoing. Scripts can run `auth login openrouter --key-stdin` to
read a key from standard input. Keys are never accepted as command-line arguments.

`POPPET_OPENROUTER_API_KEY` and `POPPET_OPENCODE_GO_API_KEY` override the stored keys for inference
and status. An empty or invalid override is an error, and Poppet does not fall back to the stored key.
Status reports where the credential came from, without showing the secret. Remote access is checked
separately, during verification. `auth logout openrouter` removes that provider's saved key. It
leaves other providers connected. It does not revoke the key on the provider's side, and it does not
unset an environment override.

See [OpenCode Go](providers/opencode-go.md) and [OpenRouter](providers/openrouter.md) for login and
model selection examples.

## Skill files

Skills live in `<POPPET_DATA_DIR>/skills/<name>/SKILL.md`. There is no separate path setting. Each file
is limited to 8192 UTF-8 bytes, and its saved text counts against `POPPET_CONTEXT_BYTES`. Checking a
skill needs only the configuration. New chats and tasks load skills in the process that owns the store.
See [skills](skills.md) for naming, selection, and snapshot behavior.

## Page reading

`poppet_web.fetch_page` runs within the existing model-turn, tool-call, context, and `POPPET_TOOL_BYTES`
limits. Its 15-second overall deadline, three-redirect limit, and 1 MiB limits on transferred and decoded
bodies are fixed. HTTP(S) uses standard ports and direct connections. Ambient proxy settings and provider
credentials are not forwarded. TLS certificate and source-hostname checks stay on.

## Web search

Web search works with [Brave's Web Search API](https://api-dashboard.search.brave.com/app/documentation/web-search)
or [Kagi's v1 Search API](https://kagi.com/api/docs). Brave is the default. To use Kagi, select it in
`<data directory>/config.json`:

```json
{
  "webSearch": true,
  "webSearchProvider": "kagi"
}
```

Save the key for the provider you selected, with an interactive prompt or by piping it to
`bun run start web login --key-stdin`:

```fish
bun run start web login
bun run start web status
```

For Brave, turn on `webSearch` and leave `webSearchProvider` out, or set it to `"brave"`. Create a Kagi key in the
[API dashboard](https://kagi.com/api/keys). Poppet uses Kagi's v1 API with Bearer authentication, not a legacy v0
token or a session link.

`POPPET_WEB_SEARCH` overrides the enable flag, and search is off by default. `POPPET_WEB_SEARCH_PROVIDER` overrides
the provider and accepts only `brave` or `kagi`. `web login`, `web status`, and `web logout` act on the selected
provider. `POPPET_BRAVE_SEARCH_API_KEY` or `POPPET_KAGI_SEARCH_API_KEY` overrides that provider's saved key. An empty
or invalid override is an error, and Poppet does not fall back to the saved key. Login saves the environment key when
one is set. Otherwise it prompts without echoing. `--key-stdin` reads from stdin explicitly. Keys are never accepted
as command-line arguments or general configuration fields.

Each provider's key is stored in its own file, `auth/brave-search.json` or `auth/kagi-search.json`, with owner-only
permissions, apart from inference credentials. Switching providers keeps both saved keys. `web status` reports
`provider`, `enabled`, `configured`, and the credential `source`, without showing secrets or making remote requests.
If no key is set, the search tool is left out, but regular chat and page reading still work. `web logout` removes only
the saved key for the selected provider. It does not revoke the key on the provider's side, and it does not unset an
environment override. Restart a running worker after you change search settings or credentials. Keys are not copied
into LaunchAgents.

Queries go to the selected provider's fixed endpoint, `https://api.search.brave.com/res/v1/web/search` for Brave or
`https://kagi.com/api/v1/search` for Kagi, with the search key in the authentication header. Redirects are rejected.
Poppet sends the query and fixed search options. It adds no conversation, notes, profile, skills, or inference
credentials. The model writes the query, so it can include details from your request. Think before you ask about
private information. Queries and the source results, which are size-limited, are kept in the local tool record.
Provider reasoning logs may also contain query or result text when logging is turned on.

Each search has a 15-second deadline and a 1 MiB limit on the response body. It returns at most five sources, within
`POPPET_TOOL_BYTES`. Search uses the existing run budgets. It adds no browser, crawling, cache, or fallback between
providers. See [chat](chat.md#search-the-web) for result permissions and citations.

## Local voice transcription

Telegram voice processing stays off until you set it up. Install FFmpeg and whisper.cpp's `whisper-cli`.
Download a compatible speech model to a permanent local path. Then add this object to `config.json`,
alongside your other settings:

```json
{
  "voice": {
    "enabled": true,
    "ffmpeg": "/absolute/path/to/ffmpeg",
    "whisper": "/absolute/path/to/whisper-cli",
    "model": "/absolute/path/to/ggml-tiny.bin"
  }
}
```

All three paths must be absolute. `~` is not expanded. You can also supply the complete JSON object
through `POPPET_VOICE`. Set `voice` to `{"enabled":false}` to turn voice off. `bun run start config`
shows the effective voice settings for the process that runs it. Restart the worker after changes.

Audio is downloaded from Telegram, then decoded and transcribed on your machine. No speech service
and no existing provider subscription credentials are used. Only the accepted text transcript goes
into normal model inference. Transcripts and answers stay in conversation storage after the temporary
audio is deleted. Voice runs need a later text confirmation before any change is made. See
[Telegram](gateways/telegram.md#documents-and-voice) for limits.
