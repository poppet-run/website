+++
title = "Your own little AI assistant."
heading = "Your own little"
headingAccent = "AI assistant."
status = "In early development"
note = "Run from source with Bun. Connect your own model provider. Poppet is still unstable, and features may change."

[[features]]
title = "Saved conversations."
description = "Chat in your terminal, return to a saved conversation, and search what Poppet told you before."
guide = "docs/chat/"
label = "Terminal"
code = """poppet chat sessions
poppet chat search "project TypeScript"
poppet chat $session_id"""

[[features]]
title = "Memory and skills."
description = "Tell Poppet about yourself and ask it to remember facts. Write procedures you use often and pick one for a chat or task."
guide = "docs/memory/"
label = "Terminal"
code = """poppet memory set answer.style "Keep answers concise"
poppet memory list
poppet chat new --skill weekly-review "Review my Acorn project\""""

[[features]]
title = "Scheduled tasks."
description = "Run a prompt once later, or on a repeating schedule. Read the results in your terminal or have them posted to Discord, Slack, or Telegram."
guide = "docs/tasks/"
label = "Terminal"
code = """poppet tasks add daily-summary --cron "0 9 * * *" --tz Europe/London "Summarize my recent conversations"
poppet tasks list
poppet tasks pause $task_id"""

[[features]]
title = "Chat from your messaging apps."
description = "Talk to Poppet in Discord, Slack, or Telegram. Only you can use the bot. Scheduled results can go to a channel you choose."
guide = "docs/gateways/"
label = "Discord thread"
thread = [
  { who = "You", text = "@Poppet Every Friday at 09:00 Europe/London, summarize my recent conversations and deliver the result here." },
  { who = "Poppet", text = "Done. The first summary will arrive here on Friday at 09:00." },
]

[[tools]]
title = "Read web pages"
guide = "docs/web/"

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
description = "Text chat with GLM-5.3 or GPT 6 Luna."
guide = "docs/providers/opencode-go/"
+++

Chat with Poppet in your terminal, a web browser, Discord, Slack, or Telegram. It runs on your computer, keeps your conversations there, and sends each request to the model provider you choose.
