# Issue Implementation Guide

## Convert GitHub Issues → Agent Tasks

This tool converts GitHub issues into detailed prompts that AI agents (like Claude Code) can use to implement features or fix bugs.

---

## Quick Start

### Step 1: Create an Issue
```bash
# Create a feature request
./scripts/quick-feature.sh "Add weather system"
# Creates issue #4

# Or create a bug report
./scripts/quick-bug.sh "Buildings disappear on load" high
# Creates issue #5
```

### Step 2: Generate Implementation Prompt
```bash
./scripts/implement-issue.sh 4
```

### Step 3: Use the Prompt
The tool will:
1. Fetch issue details from GitHub
2. Generate a comprehensive implementation prompt
3. Give you options to view, copy, or use it

---

## How It Works

### What the Tool Does

**Input:** GitHub issue number (e.g., `#4`)

**Process:**
1. Fetches issue from GitHub (title, description, labels)
2. Analyzes issue type (feature vs bug)
3. Generates context-specific prompt with:
   - Issue summary
   - Implementation steps
   - Code guidelines
   - Testing checklist
   - Commit message templates

**Output:** Markdown prompt file optimized for AI agents

---

## Usage Examples

### Example 1: Implement a Feature

```bash
# You have issue #1 - TV Newscast feature
./scripts/implement-issue.sh 1

# Output:
╔════════════════════════════════════════════════╗
║    🤖 Issue Implementation Agent               ║
╚════════════════════════════════════════════════╝

Fetching issue #1...

Issue Details:
Title: [FEATURE] Add TV Newscast Visual Interface with Animated Presenter
Type: Feature
Labels: enhancement,ui,graphics
State: OPEN

✓ Prompt generated!

What would you like to do?
1) View the prompt
2) Copy prompt to clipboard
3) Save prompt to file
4) Open prompt in editor
5) Send to Claude Code agent
```

**Select option 2** to copy the prompt, then paste into Claude Code.

### Example 2: Fix a Bug

```bash
# You have issue #3 - Markdown linting
./scripts/implement-issue.sh 3

# Generates bug-fix specific prompt with:
# - Debugging steps
# - Root cause analysis approach
# - Testing guidelines
# - Fix verification checklist
```

### Example 3: Interactive Mode

```bash
# Run without issue number for interactive selection
./scripts/implement-issue.sh

# Shows list of available issues:
Available issues:
#3  [BUG] Fix 134 markdown linting warnings
#2  [FEATURE] Add transportation infrastructure
#1  [FEATURE] Add TV Newscast

Enter issue number to implement: 2
```

---

## Generated Prompt Structure

### For Features

```markdown
# Implementation Request: Issue #X

## Issue Summary
[Title, type, labels]

## Issue Description
[Full issue body from GitHub]

## Implementation Instructions

### Your Task: Implement This Feature

1. Plan the Implementation
2. Search Existing Code
3. Implement the Feature
4. Test the Implementation
5. Update Documentation
6. Mark Issue as In Progress
7. Commit and Reference Issue

### Important Notes
- Project architecture guidelines
- Code patterns to follow
- Integration points

### Before You Start
- Files to read for context
- Similar features to reference

### Questions to Consider
- Integration points
- Edge cases
- Save/load compatibility

## Project Context
[Technology stack, key files, commands]

## Success Criteria
[Checklist for completion]
```

### For Bugs

```markdown
# Implementation Request: Issue #X

## Issue Summary
[Title, type, labels]

## Issue Description
[Bug description, reproduction steps, errors]

## Implementation Instructions

### Your Task: Fix This Bug

1. Understand the Bug
2. Locate the Problem
3. Implement the Fix
4. Test the Fix
5. Update Documentation
6. Mark Issue as In Progress
7. Commit and Reference Issue

### Important Notes
- Fix root cause, not symptoms
- Consider regression testing
- Defensive coding practices

## Success Criteria
[Fix verification checklist]
```

---

## Workflow Integration

### Complete Development Flow

**1. Create Issue**
```bash
./scripts/quick-feature.sh "Add day/night cycle"
# Issue #6 created
```

**2. Generate Implementation Prompt**
```bash
./scripts/implement-issue.sh 6
# Select option 2 (copy to clipboard)
```

**3. Mark as In Progress**
```bash
gh issue edit 6 --add-label "in progress"
```

**4. Create Branch**
```bash
git checkout -b implement/issue-6
```

**5. Paste Prompt into Claude Code**
```
# In Claude Code terminal or chat
[Paste the generated prompt]
```

**6. Claude Code Implements**
- Agent reads the prompt
- Plans the implementation
- Writes code following guidelines
- Tests the feature
- Commits with proper message

**7. Verify and Push**
```bash
git push origin implement/issue-6
gh pr create --title "Implement day/night cycle - Fixes #6"
```

**8. Issue Auto-Closes** when PR merges (because commit says "Fixes #6")

---

## Options Explained

### 1. View the Prompt
```bash
Select option: 1
```
Shows the full prompt in your terminal (uses `bat` if available, otherwise `cat`)

### 2. Copy to Clipboard
```bash
Select option: 2
```
Copies prompt to clipboard (macOS: `pbcopy`, Linux: `xclip`)

**Then:**
- Open Claude Code
- Paste the prompt
- Agent starts implementing

### 3. Save to File
```bash
Select option: 3
Enter filename: my-implementation.md
```
Saves prompt to a custom file for later use

### 4. Open in Editor
```bash
Select option: 4
```
Opens prompt in your default editor (`$EDITOR`, VS Code, or vim)

### 5. Send to Agent
```bash
Select option: 5
```
Shows instructions for using with Claude Code

---

## Agent Instructions Included

The generated prompt includes detailed instructions for the AI agent:

### For Features:
✅ Use EnterPlanMode for complex features
✅ Search existing code with Grep/Glob
✅ Follow project architecture (CLAUDE.md)
✅ Use SimService pattern for city features
✅ Use Building pattern for placeable objects
✅ Test with dev server
✅ Update documentation
✅ Commit with "Fixes #N" to auto-close issue

### For Bugs:
✅ Understand root cause first
✅ Trace execution path
✅ Fix cause, not symptoms
✅ Test reproduction steps
✅ Check for regressions
✅ Update RESOLVED_ISSUES.md
✅ Clear commit message explaining fix

---

## Real-World Example

### Scenario: Implement Issue #1 (TV Newscast)

**1. Generate prompt:**
```bash
./scripts/implement-issue.sh 1
Select option: 2  # Copy to clipboard
```

**2. Open Claude Code and paste:**

The agent receives:
```markdown
# Implementation Request: Issue #1

**GitHub Issue:** https://github.com/sergeville/simcity-threejs-clone/issues/1

## Issue Summary
**Title:** [FEATURE] Add TV Newscast Visual Interface with Animated Presenter
**Type:** Feature Implementation
**Labels:** enhancement,ui,graphics

## Issue Description
Add a visual TV newscast interface where an animated news presenter
delivers city news with:
- Animated presenter (human character)
- Lip sync to spoken words
- Voice narration (text-to-speech)
- Synchronized subtitles
- TV card/frame interface

[... full issue description ...]

## Implementation Instructions

### Your Task: Implement This Feature

1. **Plan the Implementation**
   - Read the feature description carefully
   - Identify affected files: NewsService, UI, graphics
   - Consider technical approach: 2D sprites vs 3D models
   - Use EnterPlanMode for this complex feature

2. **Search Existing Code**
   - Find NewsService: `src/scripts/sim/services/newsService.js`
   - Check UI patterns in `src/scripts/newsPanel.js`
   - Review Three.js usage in `src/scripts/game.js`

[... detailed step-by-step instructions ...]

## Success Criteria
✅ TV newscast UI component created
✅ Integration with existing NewsService
✅ Animation system working
✅ Testing completed
✅ Documentation updated
✅ Commits reference issue #1
```

**3. Agent implements:**
- Reads existing NewsService code
- Plans TV component architecture
- Creates 3D/2D presenter model
- Implements lip sync system
- Integrates with news panel
- Tests the feature
- Commits: `git commit -m "Add TV newscast presenter - Fixes #1"`

**4. You verify and merge:**
```bash
git push origin implement/issue-1
gh pr create
# PR merges → Issue #1 auto-closes
```

---

## Customization

### Modify Prompt Templates

Edit `scripts/implement-issue.sh` to customize prompts:

```bash
# Line ~150: Feature implementation instructions
# Line ~200: Bug fix instructions
# Line ~250: Project context section
```

### Add Project-Specific Guidelines

Add your own sections to the generated prompt:

```bash
cat >> "$PROMPT_FILE" << EOF

## Custom Guidelines

- Always use TypeScript (when migrated)
- Write unit tests for new features
- Update changelog
EOF
```

---

## Tips & Best Practices

### For Features

**DO:**
✅ Generate prompt before starting work
✅ Copy prompt for agent reference
✅ Mark issue as "in progress" first
✅ Create feature branch
✅ Test thoroughly
✅ Reference issue in commits

**DON'T:**
❌ Start implementing without reading issue
❌ Forget to mark as in progress
❌ Skip testing
❌ Commit without issue reference

### For Bugs

**DO:**
✅ Include reproduction steps in issue
✅ Add console errors to issue
✅ Generate detailed fix prompt
✅ Test the reproduction steps after fix
✅ Document the fix in RESOLVED_ISSUES.md

**DON'T:**
❌ Rush to fix without understanding cause
❌ Only fix symptoms
❌ Skip regression testing

---

## Troubleshooting

### "Could not fetch issue"
**Cause:** Invalid issue number or not authenticated
**Fix:**
```bash
gh auth login
gh issue view N --repo sergeville/simcity-threejs-clone
```

### "No editor found"
**Cause:** No default editor set
**Fix:**
```bash
export EDITOR=code  # VS Code
# or
export EDITOR=vim   # Vim
```

### Prompt too long for agent
**Cause:** Very detailed issue description
**Fix:** Edit the prompt file to summarize, or use option 3 to save and edit manually

---

## Integration with Other Tools

### With Issue Search
```bash
# Search for feature to implement
./scripts/issue-search.sh
# Find issue #7

# Generate prompt
./scripts/implement-issue.sh 7
```

### With Quick Create
```bash
# Create issue
./scripts/quick-feature.sh "Add multiplayer mode"
# Creates #8

# Immediately generate implementation prompt
./scripts/implement-issue.sh 8
```

### With GitHub CLI
```bash
# View issue details
gh issue view 5

# Generate prompt
./scripts/implement-issue.sh 5

# Mark in progress
gh issue edit 5 --add-label "in progress"
```

---

## Shell Alias (Optional)

Add to `~/.bashrc` or `~/.zshrc`:

```bash
alias simImplement='~/Documents/MyExperiments/simcity-threejs-clone/scripts/implement-issue.sh'
```

**Usage:**
```bash
simImplement 4    # Generate prompt for issue #4
```

---

## Advanced: Auto-Launch Agent

Create wrapper script `auto-implement.sh`:

```bash
#!/bin/bash
ISSUE=$1
./scripts/implement-issue.sh "$ISSUE" <<< "2"  # Auto-select option 2
# Now prompt is in clipboard
echo "Prompt copied! Paste into Claude Code."
```

---

## FAQ

**Q: Can I use this with other AI tools?**
A: Yes! The prompt is markdown and works with any AI assistant.

**Q: Does this actually run the agent?**
A: No, it generates the prompt. You paste it into Claude Code or another AI tool.

**Q: Can I modify the generated prompt?**
A: Yes! Use option 3 to save to a file, then edit before using.

**Q: What if my issue is very complex?**
A: The prompt instructs the agent to use EnterPlanMode for complex features.

**Q: Does this work with closed issues?**
A: Yes, but it warns you. Useful for re-implementing or referencing old work.

---

## Success Metrics

Using this tool should result in:

✅ **Faster implementation** - Agent has complete context
✅ **Better code quality** - Follows project guidelines
✅ **Proper commits** - References issues correctly
✅ **Complete features** - All requirements addressed
✅ **Good documentation** - Updates included

---

**Last Updated:** 2026-01-13
**Part of:** GitHub Issues automation system
