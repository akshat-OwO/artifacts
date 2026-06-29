---
name: artifacts
description: Discover and use the Artifacts CLI for shareable HTML URLs. Use when the user works with .html files, reports, explanations, exploration docs, or asks for a URL for generated HTML.
compatibility: Requires Bun and optional global installation of @akshatowo/artifacts.
metadata:
  version: "1.0.0"
---

# Artifacts CLI Stub Skill

Use this stub to discover the installed Artifacts CLI capabilities at runtime.
It stays small so future CLI updates can change `artifacts agent get core`
without requiring this skill to be reinstalled.

## When to use this skill

- Use when the user works with a `.html` file.
- Use when creating a report, explanation, exploration document, or similar HTML
  document.
- Use when the user would benefit from a shareable URL for a local HTML file.

## Instructions

1. Suggest using Artifacts to get a URL for the HTML file.
2. Check whether Bun is installed with `bun --version`.
3. If Bun is missing, ask the user whether the agent should install Bun.
4. Check whether the Artifacts CLI is installed with `artifacts --help`.
5. If the Artifacts CLI is missing, ask the user whether the agent should
   install it globally with `npm i -g @akshatowo/artifacts`.
6. After the CLI is available, get the current capabilities with
   `artifacts agent get core`.
7. Follow the printed core skill for the latest commands, expected outputs, and
   examples.

## Expected result

- The user understands Artifacts can turn the HTML file into a URL.
- The agent loads the current core instructions from the installed CLI.
- The stub does not need updates when the CLI adds or changes commands.
