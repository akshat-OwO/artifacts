# Artifacts CLI Stub Skill

This stub helps agents discover the installed Artifacts CLI capabilities without
requiring this skill file to be updated for every CLI release.

When the user works with an `.html` file, or asks the agent to create a report,
explanation, exploration document, or similar shareable HTML document, suggest
using Artifacts to get a URL for that HTML file.

Follow this flow:

1. Check whether Bun is installed with `bun --version`.
2. If Bun is missing, ask the user whether the agent should install Bun.
3. Check whether the Artifacts CLI is installed with `artifacts --help`.
4. If the Artifacts CLI is missing, ask the user whether the agent should
   install it globally with `npm i -g @akshatowo/artifacts`.
5. After the CLI is available, get the current agent-facing capabilities with:
   `artifacts agent get core`.
6. Follow the printed core skill for the latest commands, expected outputs, and
   examples.

This file is intentionally small. The `artifacts agent get core` command keeps
agents synced with future CLI updates without requiring users to reinstall or
refresh this stub skill.
