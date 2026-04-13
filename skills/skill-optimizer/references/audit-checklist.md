# Skill Optimizer — Audit Checklist

> Quick-reference checklist for auditing SKILL.md files.

## Per-Skill Checklist

```
[ ] SKILL.md exists in skill folder root
[ ] Frontmatter `name` matches folder name (case-sensitive)
[ ] `description` is present (< 1024 chars)
[ ] Description starts with WHAT the skill does
[ ] Description includes "Use when..." trigger keywords
[ ] Description keywords match actual agent search terms
[ ] SKILL.md body < 500 lines
[ ] Procedures are step-by-step (not just descriptions)
[ ] Examples use real-world patterns (not toy examples)
```

## References Checklist

```
[ ] ## References section exists at bottom of SKILL.md
[ ] All references use ./references/ relative markdown links
[ ] No references use absolute workspace paths as links
[ ] Absolute paths (if present) are in a "Monorepo source" note
[ ] Every linked file exists in references/ folder
[ ] Reference files are self-contained (not just pointers)
[ ] Each reference file < 200 lines
[ ] Reference file headers say "bundled with the skill"
```

## Progressive Loading Budget

| Stage | Token Budget | Content |
|:------|:-------------|:--------|
| Discovery | ~100 tokens | `name` + `description` only |
| Instructions | < 5000 tokens | SKILL.md body |
| Resources | < 2000 tokens each | Individual `./references/` files |

## Distribution Checklist

```
[ ] Skill works after `npx skills add` in a fresh project
[ ] No references depend on monorepo-specific file paths
[ ] All bundled assets are inside the skill folder
[ ] No external dependencies required (npm packages, etc.)
```

## Common Fixes

| Symptom | Likely Cause | Fix |
|:--------|:-------------|:----|
| Agent never loads the skill | Description missing keywords | Add domain terms to `description` |
| Agent loads skill but misses references | Absolute paths, not relative links | Convert to `./references/` links |
| Skill works locally, breaks after install | References point outside skill folder | Bundle content in `./references/` |
| Reference file loads but unhelpful | File says "see source at X" | Replace with actual schema content |
| SKILL.md too long, agent truncates | Body > 500 lines | Move tables/enums to references |
