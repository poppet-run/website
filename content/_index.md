+++
title = "Your own little AI assistant."
heading = "Your own little"
headingAccent = "AI assistant."
status = "In early development"
note = "Run from source with Bun. Connect your own model provider. Poppet is still unstable, and features may change."

[[features]]
title = "Saved conversations."
description = "Chat in your terminal, come back to saved sessions, and search past conversations."
guide = "docs/chat/"
label = "Terminal"
code = """poppet chat sessions
poppet chat search "project TypeScript"
poppet chat interactive $session_id"""

[[features]]
title = "Memory and skills."
description = "Keep a profile and facts that Poppet uses across chats. Save reusable procedures and pick one for a chat or task."
guide = "docs/memory/"
label = "Terminal"
code = """poppet memory set answer.style "Keep answers concise"
poppet memory list
poppet chat new --skill weekly-review "Review my Acorn project\""""

[[features]]
title = "Scheduled tasks."
description = "Run a prompt later or on a schedule. Edit, pause, skip, or snooze tasks, and read the results whenever you like."
guide = "docs/tasks/"
label = "Terminal"
code = """poppet tasks add daily-summary --cron "0 9 * * *" --tz Europe/London "Summarize my recent conversations"
poppet tasks list
poppet tasks skip $task_id"""

[[features]]
title = "Chat from Discord."
description = "Talk to Poppet in Discord threads that only its owner can use. Send scheduled results to a channel you choose."
guide = "docs/gateways/"
label = "Discord thread"
thread = [
  { who = "You", text = "@Poppet Every Friday at 09:00 Europe/London, summarize my recent conversations and deliver the result here." },
  { who = "Poppet", text = "Done. The first summary will arrive here on Friday at 09:00." },
]

[[tools]]
title = "Read web pages"
guide = "docs/chat/#read-a-web-page"

[[tools]]
title = "Web search"
guide = "docs/web/"

[[tools]]
title = "Browser automation"
guide = "docs/browser/"

[[tools]]
title = "Shell commands, reviewed first"
guide = "docs/commands/"

[[tools]]
title = "MCP servers"
guide = "docs/mcp/"

[[providers]]
title = "ChatGPT"
description = "Use the ChatGPT plan you already have."
guide = "docs/providers/openai-chatgpt/"

[[providers]]
title = "OpenRouter"
description = "Many models, one account."
guide = "docs/providers/openrouter/"

[[providers]]
title = "OpenCode Go"
description = "For building and debugging."
guide = "docs/providers/opencode-go/"
+++

Chat in your terminal or Discord, keep useful facts and procedures, and schedule tasks. Poppet runs on your computer, saves your sessions locally, and connects to a model provider you choose.
