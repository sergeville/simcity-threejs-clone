# GitHub Issues Automation Guide

## 🎯 What We Learned

From our first feature request (#1 - TV Newscast), we learned:

1. **One-time setup needed:**
   - GitHub CLI authentication (done once ✅)
   - Labels must be created in repo (automated now ✅)

2. **The problem with manual process:**
   - Too many prompts and steps
   - Easy to forget required information
   - Slow for quick ideas

3. **The solution: Automation!**
   - One-command issue creation
   - Auto-detection of labels
   - Skip all the prompts

---

## ⚡ Super Fast Commands (After Setup)

### Create a Feature Request (1 command)
```bash
./scripts/quick-feature.sh "Add subway transit system"
```

### Create a Bug Report (1 command)
```bash
./scripts/quick-bug.sh "Buildings disappear after loading" high
```

### With Shell Aliases (even faster)
```bash
simFeature "Add weather effects"
simBug "Save crashes" critical
```

---

## 🛠️ One-Time Setup (5 Minutes)

### Step 1: Install GitHub CLI (if not done)
```bash
# macOS
brew install gh

# Or download: https://cli.github.com/
```

### Step 2: Authenticate (one-time)
```bash
gh auth login
# You already did this! ✅
```

### Step 3: Create Labels (one-time)
```bash
./scripts/setup-labels.sh
# This creates all 20+ labels in your repository
# You already did this! ✅
```

### Step 4: Set Up Aliases (optional but recommended)
Add to `~/.bashrc` or `~/.zshrc`:

```bash
# GitHub Issues - Quick Commands
alias simFeature='~/Documents/MyExperiments/simcity-threejs-clone/scripts/quick-feature.sh'
alias simBug='~/Documents/MyExperiments/simcity-threejs-clone/scripts/quick-bug.sh'
alias simIssue='(cd ~/Documents/MyExperiments/simcity-threejs-clone && ./scripts/issue.sh)'
```

Then reload:
```bash
source ~/.bashrc  # or ~/.zshrc
```

---

## 🚀 Usage Examples

### Quick Feature Creation

**Simple (just title):**
```bash
./scripts/quick-feature.sh "Add subway system"
# ✓ Creates issue with title
# ✓ Auto-detects labels (enhancement, buildings, simulation)
# ✓ Can edit later for details
```

**With description:**
```bash
./scripts/quick-feature.sh "Add weather effects" "Rain, snow, fog for immersion"
# ✓ Creates issue with description
# ✓ Auto-detects labels (enhancement, graphics)
```

**Output:**
```
Creating feature request...
✓ Feature request created!
URL: https://github.com/sergeville/simcity-threejs-clone/issues/2
Labels: enhancement,graphics
Duplicate detection bot will check in ~30 seconds
```

### Quick Bug Reporting

**Medium priority (default):**
```bash
./scripts/quick-bug.sh "UI overlaps at low resolution"
# ✓ Creates bug with medium priority
# ✓ Auto-detects labels (bug, medium, ui)
```

**Critical bug:**
```bash
./scripts/quick-bug.sh "Game crashes when saving" critical
# ✓ Creates bug with critical priority
# ✓ Auto-detects labels (bug, critical, save-load)
```

**Output:**
```
Creating bug report...
✓ Bug report created!
URL: https://github.com/sergeville/simcity-threejs-clone/issues/3
Priority: critical
Labels: bug,critical,save-load
Duplicate detection bot will check in ~30 seconds
```

---

## 🤖 How Auto-Label Detection Works

The scripts automatically detect component labels based on keywords:

**Keywords → Labels:**
- `ui, interface, panel, button` → `ui`
- `3d, render, visual, animation` → `graphics`
- `simulate, logic, game` → `simulation`
- `economy, budget, tax` → `economy`
- `citizen, population` → `citizens`
- `building, construct, zone` → `buildings`
- `hospital, police, fire, school` → `services`
- `disaster, fire, flood` → `disasters`
- `save, load, persist` → `save-load`

**Examples:**
```bash
# "subway" + "building" → enhancement, buildings
simFeature "Add subway system"

# "render" + "3d" → enhancement, graphics
simFeature "Improve 3D rendering"

# "save" → bug, save-load
simBug "Save file corrupted"

# "ui" + "button" → bug, ui
simBug "Button doesn't work"
```

---

## 📊 Comparison: Before vs After

### Before Automation (10 steps, 5 minutes)

1. Run `./scripts/issue-feature.sh`
2. Enter title
3. Wait for duplicate search
4. Answer if duplicate
5. Enter description (type entire thing)
6. Enter proposed solution
7. Select components (type numbers)
8. Review preview
9. Confirm creation
10. Wait for bot

### After Automation (1 command, 10 seconds)

```bash
simFeature "Add subway system"
```

**Time saved: 4+ minutes per issue!**

---

## 🎨 With Shell Aliases (Recommended)

Once you set up aliases, you can use them from anywhere:

```bash
# You're editing code
~/simcity-threejs-clone/src $

# Think of an idea
~/simcity-threejs-clone/src $ simFeature "Add weather system"
✓ Feature request created! #2

# Find a bug
~/simcity-threejs-clone/src $ simBug "Citizens stuck in buildings" high
✓ Bug report created! #3

# Go to a different project
~ $ cd ~/other-project

# Still works!
~/other-project $ simFeature "Add notifications"
✓ Feature request created! #4
```

---

## 🔍 Advanced: Adding Details Later

**Create quick placeholder:**
```bash
simFeature "Add multiplayer mode"
# Issue #5 created
```

**Add details later:**
```bash
# Option 1: Web browser
gh issue edit 5 --web

# Option 2: CLI
gh issue edit 5 --body "Detailed multiplayer design:
- Real-time synchronization
- Up to 4 players
- Shared city building
"

# Option 3: From file
gh issue edit 5 --body-file design.md
```

---

## 📋 Full Workflow Examples

### Example 1: Playing the Game, Found a Bug

```bash
# Playing game, building disappear after loading

# Terminal (takes 5 seconds):
simBug "Buildings disappear after loading save file" critical

# Output:
✓ Bug report created! #6
URL: https://github.com/sergeville/simcity-threejs-clone/issues/6
Labels: bug,critical,save-load

# Continue playing, issue tracked!
```

### Example 2: Brainstorming Features

```bash
# Got several ideas, capture them all quickly:

simFeature "Add subway transit"
# ✓ Issue #7

simFeature "Add weather effects"
# ✓ Issue #8

simFeature "Add day/night cycle"
# ✓ Issue #9

simFeature "Add citizen names and stories"
# ✓ Issue #10

# All ideas saved in 20 seconds!
# Add details to them later
```

### Example 3: Testing Session

```bash
# Found multiple bugs during testing:

simBug "UI overlaps at 1024x768" low
simBug "Budget calculation off by 10%" high
simBug "Fire station doesn't put out fires" critical
simBug "Citizens pathfinding through buildings" medium

# All bugs tracked in < 1 minute
```

---

## 🎯 Best Practices

### DO:
✅ Create issues quickly with one-liners
✅ Add details later if needed
✅ Use descriptive titles
✅ Let auto-detection handle labels
✅ Use priority levels for bugs

### DON'T:
❌ Overthink it - just create the issue
❌ Worry about perfect descriptions upfront
❌ Skip creating issues because "it's too much work"

**Philosophy:**
- **Capture ideas fast** (1 command)
- **Refine details later** (when implementing)

---

## 🆚 When to Use Which Method

### Use Quick Commands (`quick-feature.sh`, `quick-bug.sh`)
- ✅ Fast idea capture
- ✅ You know exactly what you want in 1 sentence
- ✅ During gameplay/testing
- ✅ Don't need detailed description yet

### Use Interactive Scripts (`issue-feature.sh`, `issue-bug.sh`)
- ✅ Need to provide full details upfront
- ✅ Want guided prompts
- ✅ Prefer step-by-step process
- ✅ Writing comprehensive bug report with console errors

### Use Main Menu (`issue.sh`)
- ✅ Want to search first
- ✅ Need to view/manage existing issues
- ✅ Prefer visual menu interface
- ✅ Learning the system

---

## 📝 Summary: What Changed

**Before:**
- Manual authentication every time
- No labels existed
- 10-step interactive process
- 5+ minutes per issue
- Had to remember all details upfront

**After:**
- One-time authentication ✅
- All labels created ✅
- 1-command issue creation ✅
- 10 seconds per issue ✅
- Can add details later ✅

**Result: 30x faster! 🚀**

---

## 🔗 Reference

**Quick Scripts:**
- `scripts/quick-feature.sh` - Fast feature creation
- `scripts/quick-bug.sh` - Fast bug reporting

**Interactive Scripts:**
- `scripts/issue-feature.sh` - Guided feature request
- `scripts/issue-bug.sh` - Guided bug report
- `scripts/issue-search.sh` - Search issues
- `scripts/issue-view.sh` - View/manage issues
- `scripts/issue.sh` - Main menu hub

**Setup:**
- `scripts/setup-labels.sh` - Create all labels (one-time)

**Documentation:**
- `scripts/ISSUE_CLI_QUICKSTART.md` - Quick start guide
- `scripts/README.md` - Complete documentation
- `docs/development/USING_GITHUB_ISSUES.md` - Full reference

---

**Last Updated**: 2026-01-13
**Lessons From**: Issue #1 (TV Newscast Feature)
