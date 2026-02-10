# ai-dev-rails

Claude Code is powerful, but without structure it tends to lose context between sessions, skip research, produce plans with unresolved questions, and make changes without verification.

`ai-dev-rails` breaks complex tasks into focused stages — research, planning, implementation, validation — where each stage produces an artifact that feeds the next one. Instead of cramming everything into a single context window, each step starts with exactly the right context already written down. The result is better code, fewer hallucinations, and a knowledge base that compounds across sessions and team members.

```
/research_codebase  →  Research document
         ↓
/create_plan        →  Implementation plan with phases and success criteria
         ↓
/implement_plan     →  Code changes + checkboxes marked in plan
         ↓
/validate_plan      →  Validation report (pass/fail per phase)
         ↓
/commit             →  Atomic commits with user approval
         ↓
/describe_pr        →  PR description from plan + changes

(optional, at any point)

/create_handoff     →  Saves context, learnings, and next steps
         ↓
/resume_handoff     →  Reads handoff, validates current state, creates task list
```

## Setup

```bash
npx ai-dev-rails my-project
```

To overwrite existing files (e.g. after updating the package):

```bash
npx ai-dev-rails my-project --force
```

The CLI:

1. Copies all agent and command files to `.claude/` (skips existing files unless `--force` is used)
2. Creates the `thoughts/` directory structure

After running, you should:

1. Add the `thoughts/` gitignore rules shown above to your `.gitignore`
2. Allow Claude Code to read and write in `thoughts/` without prompting — add to your `.claude/settings.json`:

```json
{
  "permissions": {
    "allow": [
      "Read(thoughts/**)",
      "Edit(thoughts/**)",
      "Write(thoughts/**)"
    ]
  }
}
```

3. Optionally, add a reference to the methodology in your `CLAUDE.md` so Claude Code is aware of the available commands

## What You Get

The CLI copies agents and commands into your `.claude/` directory and creates the `thoughts/` directory structure:

```
.claude/
  agents/       6 specialized sub-agents
  commands/     17 workflow commands (slash commands)
  hooks/        context-saving hooks
thoughts/
  shared/       Team artifacts (research, plans, tickets, prs, handoffs)
  global/       Cross-repo thoughts
```

## Commands Reference

### Research

Each research command produces a document describing the codebase as-is (facts, not opinions). The variants differ in where the output goes:

| Command                      | When to use                                                                                                                                                                                     |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/research_codebase`         | You need a persistent research document that the team can reference later. Output is saved to `thoughts/shared/research/`. Use this when starting work on a ticket that others might pick up.   |
| `/research_codebase_nt`      | You need quick research for yourself in the current session. Output stays in the conversation only, nothing is written to disk. Use this for small tasks or when `thoughts/` is not set up yet. |
| `/research_codebase_generic` | Same as `/research_codebase` but with a less opinionated document structure. Use this when the standard template doesn't fit your research needs.                                               |

### Planning

| Command                | When to use                                                                                                                                                                                                      |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/create_plan`         | You need an implementation plan with phases, success criteria, and code references. Saved to `thoughts/shared/plans/` so the team can review it. Use this for any task that touches more than a couple of files. |
| `/create_plan_nt`      | Same structured plan, but output stays in the conversation. Use this for quick tasks where you don't need to save the plan for others.                                                                           |
| `/create_plan_generic` | Same as `/create_plan` but with a less rigid plan structure. Use this when the standard phase/criteria template feels too heavy for your task.                                                                   |
| `/iterate_plan`        | You have an existing plan in `thoughts/shared/plans/` and need to update it after new information, feedback, or scope changes.                                                                                   |
| `/iterate_plan_nt`     | Same, but the plan lives in the conversation instead of `thoughts/`.                                                                                                                                             |

### Implementation

| Command           | When to use                                                                                                             |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `/implement_plan` | Execute a plan phase-by-phase. Pauses after each phase for automated verification and manual testing before continuing. |
| `/validate_plan`  | After implementation, verify every success criterion in the plan. Produces a pass/fail report.                          |

### Git & PR

| Command           | When to use                                                                                                           |
| ----------------- | --------------------------------------------------------------------------------------------------------------------- |
| `/commit`         | Interactive commit — shows diff, drafts message, asks for approval before committing.                                 |
| `/ci_commit`      | Same but without asking for approval. For CI/automation contexts.                                                     |
| `/describe_pr`    | Generate a PR description from the plan and changes. Requires a team template at `thoughts/shared/pr_description.md`. |
| `/describe_pr_nt` | Same, with a built-in template. No setup required.                                                                    |
| `/ci_describe_pr` | CI variant of `/describe_pr`. Requires the team template.                                                             |

### Session Management

| Command           | When to use                                                                                                |
| ----------------- | ---------------------------------------------------------------------------------------------------------- |
| `/create_handoff` | Before ending a session, capture context, learnings, recent changes, and next steps in a handoff document. |
| `/resume_handoff` | Start a new session by reading a handoff document. Validates current state and creates a task list.        |

## Agents

Agents are specialized sub-processes that the commands spawn internally via the `Task` tool. They follow a **locator/analyzer pair** pattern: locator first (cheap, fast scan), analyzer second (expensive, deep read). You don't invoke them directly — the commands orchestrate them as needed.

| Agent                       | What it does                                                                                      |
| --------------------------- | ------------------------------------------------------------------------------------------------- |
| **codebase-locator**        | Finds WHERE code lives. A "super grep" that locates files by feature or topic.                    |
| **codebase-analyzer**       | Understands HOW code works. Traces data flow, documents implementation with file:line references. |
| **codebase-pattern-finder** | Finds existing patterns and concrete code examples to model new work after.                       |
| **thoughts-locator**        | Discovers relevant documents in `thoughts/`.                                                      |
| **thoughts-analyzer**       | Deep-dives into `thoughts/` documents to extract decisions, constraints, and actionable insights. |
| **web-search-researcher**   | Searches the web for documentation, best practices, and technical solutions.                      |

## Hooks

Hooks run automatically during Claude Code events to save context tokens and improve agent performance. They are installed to `.claude/hooks/`.

| Hook | Event | What it does |
| --- | --- | --- |
| **compress-bash-output** | `PostToolUse` (Bash) | Compresses successful command output longer than 30 lines to first 5 + last 10 lines. Failed commands pass through unmodified so the agent can debug. |

Hooks are configured in `.claude/hooks/hooks.json` and run automatically — no manual setup required.

## The `thoughts/` Directory

A shared knowledge base that persists across sessions. This is what makes the methodology work across a team — research, plans, and decisions are artifacts, not ephemeral conversation.

```
thoughts/
├── shared/          # Team-shared (committed to git)
│   ├── research/    # Research documents
│   ├── plans/       # Implementation plans
│   ├── tickets/     # Ticket context and requirements
│   ├── prs/         # PR descriptions
│   └── handoffs/    # Session handoff documents
├── [username]/      # Personal notes (git-ignored, local only)
└── global/          # Cross-repository thoughts (committed to git)
```

To commit `shared/` and `global/` while keeping personal directories local, you should add the following to your `.gitignore`:

```gitignore
thoughts/*
!thoughts/shared/
!thoughts/global/
```

### Naming Conventions

| Type     | Pattern                                        | Example                                        |
| -------- | ---------------------------------------------- | ---------------------------------------------- |
| Research | `YYYY-MM-DD-TICKET-ID-description.md`          | `2025-03-15-GH-42-auth-flow.md`               |
| Plans    | `YYYY-MM-DD-TICKET-ID-description.md`          | `2025-03-15-GH-42-add-oauth.md`               |
| Handoffs | `YYYY-MM-DD_HH-MM-SS_TICKET-ID_description.md` | `2025-03-15_14-30-00_GH-42_oauth-progress.md` |

`TICKET-ID` is the identifier from your project tracker (e.g. `GH-42`, `JIRA-1234`). Omit it if there's no ticket.

## Credits

This methodology was developed by the [HumanLayer](https://github.com/humanlayer/humanlayer) team as part of building their human-in-the-loop platform for AI agents. `ai-dev-rails` extracts and packages their internal workflow so any team can adopt it.

## License

MIT
