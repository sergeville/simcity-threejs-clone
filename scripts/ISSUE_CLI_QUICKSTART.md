# GitHub Issues CLI - Quick Start

## One-Time Setup (5 minutes)

### 1. Install GitHub CLI
```bash
# macOS
brew install gh

# Or download from: https://cli.github.com/
```

### 2. Authenticate
```bash
gh auth login
# Follow the prompts to authenticate with GitHub
```

### 3. Test It
```bash
cd /path/to/simcity-threejs-clone
./scripts/issue.sh
```

That's it! You're ready to use the CLI issue manager.

---

## Quick Commands

### Main Issues Manager (Recommended)
```bash
./scripts/issue.sh
```
Opens interactive menu with all options.

### Direct Commands

```bash
./scripts/issue-bug.sh       # Report a bug
./scripts/issue-feature.sh   # Request a feature
./scripts/issue-search.sh    # Search issues
./scripts/issue-view.sh 42   # View issue #42
```

---

## Typical Workflows

### Workflow 1: Report a Bug

```bash
# Start the bug reporter
./scripts/issue-bug.sh

# Follow the prompts:
# 1. Enter bug title
# 2. Check for duplicates (automatic)
# 3. Describe the bug
# 4. Steps to reproduce
# 5. Paste console errors
# 6. Select priority
# 7. Confirm and create
```

**Result:** Issue created with labels, duplicate detection runs automatically.

---

### Workflow 2: Request a Feature

```bash
# Start the feature requester
./scripts/issue-feature.sh

# Follow the prompts:
# 1. Enter feature title
# 2. Check for duplicates (automatic)
# 3. Describe what and why
# 4. Explain how it should work
# 5. Select affected components
# 6. Confirm and create
```

**Result:** Feature request created with appropriate labels.

---

### Workflow 3: Search Before Creating

```bash
# Search first to avoid duplicates
./scripts/issue-search.sh

# Select option 1 (Search by keywords)
# Enter: subway
# Review results
# If found, add comment to existing issue
# If not found, create new issue
```

---

### Workflow 4: Work on an Issue

```bash
# View the issue
./scripts/issue-view.sh 42

# Select option 5 (Mark as in progress)
# ✓ Marked as 'in progress'

# Create branch (suggested command shown)
git checkout -b fix/issue-42

# Make changes
# ...

# Commit with auto-close keyword
git commit -m "Fix building restoration - Fixes #42"

# Push and create PR
git push origin fix/issue-42
gh pr create

# When PR merges, issue auto-closes
```

---

## Shell Aliases (Optional but Recommended)

Add to `~/.bashrc` or `~/.zshrc`:

```bash
# Replace [project-path] with your actual path
alias simIssue='(cd [project-path]/simcity-threejs-clone && ./scripts/issue.sh)'
alias simBug='(cd [project-path]/simcity-threejs-clone && ./scripts/issue-bug.sh)'
alias simFeature='(cd [project-path]/simcity-threejs-clone && ./scripts/issue-feature.sh)'
alias simSearch='(cd [project-path]/simcity-threejs-clone && ./scripts/issue-search.sh)'
```

**After setup, use from anywhere:**
```bash
simIssue      # Open issues manager
simBug        # Report bug
simFeature    # Request feature
simSearch     # Search issues
```

---

## Common Tasks

### Create a Bug Report
```bash
./scripts/issue-bug.sh
# OR if you have aliases:
simBug
```

### Create a Feature Request
```bash
./scripts/issue-feature.sh
# OR:
simFeature
```

### Search for Existing Issues
```bash
./scripts/issue-search.sh
# OR:
simSearch
```

### Check What's In Progress
```bash
./scripts/issue.sh
# Select option 6
```

### View Specific Issue
```bash
./scripts/issue-view.sh 42
```

### Add Comment to Issue
```bash
./scripts/issue-view.sh 42
# Select option 1 (Add a comment)
```

### Close an Issue
```bash
./scripts/issue-view.sh 42
# Select option 2 (Close this issue)
```

---

## Tips & Tricks

### 1. Always Search First
The scripts have built-in duplicate detection, but manual searching helps you find related issues:
```bash
./scripts/issue-search.sh
```

### 2. Use Descriptive Titles
**Bad:** "Bug"
**Good:** "[BUG] Buildings disappear after loading save file"

### 3. Include Console Errors
Always open browser console (F12) and copy errors when reporting bugs.

### 4. Link Issues to Commits
Use these keywords in commit messages to auto-close issues:
- `Fixes #42`
- `Closes #42`
- `Resolves #42`

Example:
```bash
git commit -m "Fix save/load building restoration - Fixes #42"
```

### 5. Check Resolved Issues First
Before creating a bug report, check if it's already been solved:
```bash
./scripts/issue.sh
# Select option 9 (View Resolved Issues)
```

---

## Troubleshooting

### "gh: command not found"
**Solution:** Install GitHub CLI
```bash
# macOS
brew install gh

# Other platforms: https://cli.github.com/
```

### "authentication required"
**Solution:** Authenticate with GitHub
```bash
gh auth login
# Follow the prompts
```

### "permission denied"
**Solution:** Make scripts executable
```bash
chmod +x scripts/*.sh
```

### Scripts not working from other directories
**Solution:** Use full path or set up aliases
```bash
# Option 1: Use full path
cd /path/to/simcity-threejs-clone
./scripts/issue.sh

# Option 2: Set up aliases (recommended)
# Add to ~/.bashrc or ~/.zshrc
alias simIssue='(cd /full/path/to/simcity-threejs-clone && ./scripts/issue.sh)'
```

---

## Full Documentation

- **Complete Guide:** [docs/development/USING_GITHUB_ISSUES.md](../docs/development/USING_GITHUB_ISSUES.md)
- **Scripts README:** [scripts/README.md](README.md)
- **Quick Reference:** [docs/development/QUICK_REFERENCE.md](../docs/development/QUICK_REFERENCE.md)

---

## Example: Full Bug Report Session

```bash
$ ./scripts/issue-bug.sh

╔════════════════════════════════════════╗
║    🐛 Bug Report Agent                 ║
╚════════════════════════════════════════╝

Step 1/6: What's the bug?
Bug title: Buildings disappear after loading

Step 2/6: Checking for duplicates...
Searching existing issues for: Buildings disappear after loading
✓ No obvious duplicates found

Step 3/6: Describe the bug
What's happening vs what should happen?
---
All buildings disappear when I load a saved city.
The population and budget numbers remain, but the 3D buildings are gone.
^D

Step 4/6: Steps to reproduce
1. Build several residential and commercial buildings
2. Save the game using the 💾 button
3. Refresh the browser page
4. Click the Load button
5. Buildings are missing from the map
^Enter

Step 5/6: Console errors (optional)
TypeError: building.setMesh is not a function
    at City.deserialize (city.js:234)
^D

Step 6/6: How severe is this bug?
1) Critical - Game crashes, data loss, unplayable
2) High - Major feature broken
3) Medium - Feature partially broken
4) Low - Minor issue, polish
Select priority: 2

═══════════════════════════════════════
Preview of your bug report:
═══════════════════════════════════════
Title: [BUG] Buildings disappear after loading
Labels: bug, high

...full issue body shown...

Create this issue? (y/n): y

Creating issue...
✓ Bug report created successfully!
Issue URL: https://github.com/sergeville/simcity-threejs-clone/issues/42

The duplicate detection bot will check for similar issues in ~30 seconds.
Check your issue for any bot comments.
```

---

**Print this guide and keep it handy!**
