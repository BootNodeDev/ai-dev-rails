# Migrate ai-dev-rails to Claude Code Marketplace Plugin

## Summary

Migrate ai-dev-rails from a CLI tool (`npx ai-dev-rails`) that copies templates into projects, to a Claude Code marketplace plugin that users install via `/plugin marketplace add` and `/plugin install`.

## Version

`0.1.0-beta.1` (semver, pre-release)

## Structure

### New directory layout

```
ai-dev-rails/
├── .claude-plugin/
│   ├── plugin.json
│   └── marketplace.json
├── agents/
│   ├── codebase-locator.md
│   ├── codebase-analyzer.md
│   ├── codebase-pattern-finder.md
│   ├── thoughts-locator.md
│   ├── thoughts-analyzer.md
│   └── web-search-researcher.md
├── commands/
│   ├── research_codebase.md
│   ├── create_plan.md
│   ├── implement_plan.md
│   └── ... (all 17 commands)
├── hooks/
│   ├── hooks.json
│   └── compress-bash-output.sh
├── README.md
├── LICENSE
└── NOTICE
```

### Manifests

**`.claude-plugin/plugin.json`:**
```json
{
  "name": "ai-dev-rails",
  "description": "Structured AI development methodology for Claude Code — research, plan, implement, validate",
  "version": "0.1.0-beta.1",
  "author": {
    "name": "HumanLayer"
  },
  "homepage": "https://github.com/humanlayer/ai-dev-rails",
  "repository": "https://github.com/humanlayer/ai-dev-rails",
  "license": "MIT",
  "keywords": ["workflow", "methodology", "research", "planning", "implementation"]
}
```

**`.claude-plugin/marketplace.json`:**
```json
{
  "name": "ai-dev-rails",
  "owner": {
    "name": "HumanLayer"
  },
  "metadata": {
    "description": "Structured AI development methodology for Claude Code",
    "version": "0.1.0-beta.1"
  },
  "plugins": [
    {
      "name": "ai-dev-rails",
      "source": ".",
      "description": "Structured AI development methodology — research, plan, implement, validate",
      "version": "0.1.0-beta.1"
    }
  ]
}
```

### Hook migration

Update `hooks/hooks.json` to use `${CLAUDE_PLUGIN_ROOT}` for script paths:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/hooks/compress-bash-output.sh"
          }
        ]
      }
    ]
  }
}
```

## Changes Required

- [ ] **1. Create `.claude-plugin/plugin.json`**
- [ ] **2. Create `.claude-plugin/marketplace.json`**
- [ ] **3. Move `template/.claude/agents/*.md` to `agents/`**
- [ ] **4. Move `template/.claude/commands/*.md` to `commands/`**
- [ ] **5. Move `template/.claude/hooks/hooks.json` to `hooks/hooks.json`** (update paths with `${CLAUDE_PLUGIN_ROOT}`)
- [ ] **6. Move `template/.claude/hooks/compress-bash-output.sh` to `hooks/compress-bash-output.sh`**
- [ ] **7. Delete `bin/cli.mjs`**
- [ ] **8. Delete `template/` directory**
- [ ] **9. Delete `package.json`**
- [ ] **10. Update `README.md`** with marketplace installation instructions

## What does NOT change

- Content of agent files
- Content of command files
- Content of compress-bash-output.sh
- LICENSE and NOTICE files
