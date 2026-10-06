---
name: worktree
description: Create and setup a git worktree with all necessary files and dependencies. Use when starting work on a new feature branch.
user-invocable: true
argument-hint: <branch-name>
---

# Worktree Setup

Maakt een nieuwe git worktree aan met alle benodigde configuratie voor development.

## Gebruik

```
/worktree feat/my-feature
```

## Workflow

### Stap 1: Maak worktree aan

```bash
git worktree add .worktrees/<branch-name> -b <branch-name>
```

Of voor een bestaande branch:

```bash
git worktree add .worktrees/<branch-name> <branch-name>
```

### Stap 2: Kopieer configuratie bestanden

**Vereiste bestanden:**

| Bestand | Doel |
|---------|------|
| `.env` | Environment variables |
| `.claude/settings.local.json` | Claude Code lokale permissies |

```bash
# Kopieer .env
cp .env .worktrees/<branch-name>/

# Kopieer .claude folder (voor settings.local.json)
cp -r .claude .worktrees/<branch-name>/
```

### Stap 3: Installeer dependencies

```bash
cd .worktrees/<branch-name>
npm install
```

### Stap 4: Build styles en components

```bash
npm run build:styles
npm run build
```

### Stap 5: Verifieer setup

```bash
# Check dat alles werkt
npm run site
```

## Volledige one-liner

```bash
BRANCH="feat/my-feature" && \
git worktree add .worktrees/$BRANCH -b $BRANCH && \
cp .env .worktrees/$BRANCH/ && \
cp -r .claude .worktrees/$BRANCH/ && \
cd .worktrees/$BRANCH && \
npm install && \
npm run build
```

## Opruimen na merge

```bash
# Verwijder worktree
git worktree remove .worktrees/<branch-name>

# Of forceer verwijdering bij uncommitted changes
git worktree remove .worktrees/<branch-name> --force
```

## Permissies synchroniseren

Wanneer je in een worktree nieuwe permissies toekent, voeg deze ook toe aan de hoofdfolder (niet kopiëren - anders overschrijf je permissies van andere worktrees):

```bash
# Bekijk nieuwe permissies in worktree
cat .worktrees/<branch-name>/.claude/settings.local.json

# Voeg handmatig toe aan hoofdfolder .claude/settings.local.json
# OF merge met jq:
jq -s '.[0] * .[1]' .claude/settings.local.json .worktrees/<branch-name>/.claude/settings.local.json > .claude/settings.local.json.tmp && mv .claude/settings.local.json.tmp .claude/settings.local.json
```

## Checklist

- [ ] Worktree aangemaakt in `.worktrees/` folder
- [ ] `.env` gekopieerd
- [ ] `.claude/` folder gekopieerd (voor lokale permissies)
- [ ] `npm install` uitgevoerd
- [ ] `npm run build` geslaagd
- [ ] De documentatiesite start (`npm run site`)

## Troubleshooting

| Probleem | Oplossing |
|----------|-----------|
| Permission denied errors | Check of `.claude/settings.local.json` is gekopieerd |
| Build faalt | Run `npm install` eerst |
