# GitHub Issues Guide

This guide explains how to use GitHub Issues to track features, bugs, and improvements for the SimCity Three.js Clone project.

## Table of Contents
- [Why Use GitHub Issues](#why-use-github-issues)
- [Before Creating an Issue](#before-creating-an-issue)
- [Creating a Feature Request](#creating-a-feature-request)
- [Reporting a Bug](#reporting-a-bug)
- [Issue Labels](#issue-labels)
- [Issue Lifecycle](#issue-lifecycle)
- [Best Practices](#best-practices)

---

## Why Use GitHub Issues

GitHub Issues provides a centralized, searchable system for:

✅ **Feature Requests** - Propose new gameplay features or improvements
✅ **Bug Reports** - Report problems or unexpected behavior
✅ **Task Tracking** - Organize development work
✅ **Discussion** - Collaborate on solutions and designs
✅ **History** - Maintain searchable project history
✅ **Duplicate Detection** - Prevent reporting the same issue multiple times

**Advantages over other methods:**
- Searchable and organized
- Automatic duplicate detection suggestions
- Link commits to issues
- Track progress with labels and milestones
- Notify interested parties automatically

---

## Before Creating an Issue

**Always check these resources first:**

### 1. Search Existing Issues

Visit: https://github.com/sergeville/simcity-threejs-clone/issues

**Search tips:**
- Use keywords from your issue (e.g., "budget", "save", "crash")
- Check both open AND closed issues
- Use labels to filter (e.g., `label:bug`, `label:enhancement`)
- Try multiple search terms
- **Search by context, not just exact words** - Issues may use different wording

**Example searches:**
```
"save file" label:bug
budget deficit
building placement
```

### Advanced: Context-Based Duplicate Detection

GitHub's basic search looks for exact word matches, but duplicates often use different wording:

**Same Issue, Different Words:**
- "Game crashes when saving" vs "Browser freezes on save button"
- "Can't load city" vs "Saved game won't open"
- "Budget goes negative" vs "Running out of money"

**How to search by context:**

1. **Search for the EFFECT, not the symptom:**
   ```
   Good: "population not growing"
   Instead of: "no new residents moving in"
   ```

2. **Search for the FEATURE, then browse:**
   ```
   label:save-load is:issue
   label:economy is:issue
   label:citizens is:issue
   ```

3. **Use related terms:**
   ```
   If searching: "save crash"
   Also try: "save freeze", "save error", "loading issue"
   ```

4. **Check RESOLVED_ISSUES.md first:**
   - Common issues are documented with multiple symptom variations
   - Example: "Save/Load System Crash" includes variations like:
     - "Can't load saved game"
     - "TypeError when loading"
     - "City won't restore"

**Pro Tip:** Read issue descriptions, not just titles. The context in the description often reveals duplicates that titles don't match.

**If you're unsure:**
Create the issue anyway! Maintainers will link it to duplicates if found. It's better to report than to stay silent.

### Automated Duplicate Detection 🤖

This repository has **automatic duplicate detection** enabled. When you create a new issue:

1. **GitHub Actions analyzes the content** (title + description)
2. **Extracts keywords** and compares with existing issues
3. **Calculates similarity scores** based on context (not just exact matches)
4. **Posts a comment** if potential duplicates are found (>30% similarity)

**Example automated comment:**
```
🔍 Potential Duplicate Issues Detected

Based on keyword analysis, this issue may be related to:

- ✅ #42: Game crashes when saving large cities (75% match)
- 🔴 #78: Browser freeze on save button click (62% match)
- ✅ #12: Save file corruption with 1000+ citizens (45% match)

Please check these issues before proceeding.
```

**What to do if you get this comment:**
1. Check the linked issues
2. If it's the same problem:
   - Close your issue as duplicate
   - Comment on the original issue instead
3. If it's different:
   - Reply explaining the difference
   - Remove the `potential-duplicate` label

**Benefits:**
- Catches duplicates even with different wording
- Works on context, not just exact phrases
- Links to both open AND closed issues
- Helps you find existing solutions faster

### 2. Check Resolved Issues Document

Visit: [RESOLVED_ISSUES.md](RESOLVED_ISSUES.md)

This document contains **6 common issues** with detailed solutions:
- GitHub Pages deployment failures
- Save/load system crashes
- Budget deficit problems
- UI overlapping issues
- Dev server crashes
- Missing git files

**If your issue is listed here:**
1. Try the documented solution
2. If it doesn't work, create a new issue referencing the resolved issue number

### 3. Check Documentation

- [Documentation Index](../README.md)
- [Testing Checklist](TESTING_CHECKLIST.md)
- [Contributing Guide](CONTRIBUTING.md)

---

## Creating a Feature Request

### Step 1: Navigate to Issues

Go to: https://github.com/sergeville/simcity-threejs-clone/issues/new/choose

### Step 2: Select "Feature Request"

Click the green **"Get started"** button next to "Feature Request"

### Step 3: Fill Out the Template

The template includes:

**Feature Description**
```markdown
What feature would you like to see added?
Example: "Add a recycling center building that reduces pollution"

Why is this feature needed?
Example: "Currently there's no way to reduce environmental pollution,
which makes industrial cities difficult to manage"
```

**Proposed Solution**
```markdown
How should this feature work?
Example: "Recycling center would be a new service building that:
- Costs $10,000 to build
- Has 8-tile service radius
- Reduces pollution by 30% for buildings in range
- Requires 5 workers to operate"
```

**Technical Considerations**
- Check boxes for affected systems
- Estimate complexity
- Note dependencies on other features

**Before Submitting Checklist**
- [ ] Searched for duplicates
- [ ] Provided clear description
- [ ] Considered gameplay impact

### Step 4: Add Labels (Optional)

Common labels for features:
- `enhancement` - New feature or improvement
- `ui` - User interface changes
- `simulation` - Simulation logic changes
- `graphics` - Visual/rendering changes
- `good first issue` - Beginner-friendly

### Real-World Example

**Title:** `[FEATURE] Add subway/metro transit system`

**Description:**
> **What:** Underground rail system for citizen transportation
>
> **Why:** Large cities need mass transit to reduce traffic
>
> **How:**
> - New building type: Subway Station ($50k)
> - Underground tunnel visualization
> - Citizens choose subway over roads when available
> - Reduces vehicle congestion by 40%
>
> **Complexity:** Major Feature (week+)
>
> **Similar:** SimCity 4 subway system

---

## Reporting a Bug

### Step 1: Navigate to Issues

Go to: https://github.com/sergeville/simcity-threejs-clone/issues/new/choose

### Step 2: Select "Bug Report"

Click the green **"Get started"** button next to "Bug Report"

### Step 3: Fill Out the Template

**Bug Description**
```markdown
Describe the bug:
Example: "Game crashes when trying to save city with more than 1000 citizens"

Expected behavior:
Example: "Save file should be created without errors"

Actual behavior:
Example: "Browser tab freezes and shows 'Out of memory' error"
```

**Steps to Reproduce**
```markdown
1. Start new city
2. Build residential zones until population > 1000
3. Click Save button (💾)
4. Tab freezes
```

**Environment**
- Platform: macOS
- Browser: Chrome 120
- Screen Resolution: 1920x1080
- Game Version: v0.3.0

**Console Errors**
```javascript
Uncaught RangeError: Maximum call stack size exceeded
    at City.serialize (city.js:245)
```

**Screenshots**
<!-- Attach screenshot showing the error -->

**Severity**
- [x] Critical - Game crashes

### Step 4: Check "Before Submitting"

**Critical steps:**
- [ ] ✅ Searched existing issues
- [ ] ✅ Checked RESOLVED_ISSUES.md
- [ ] ✅ Included console errors
- [ ] ✅ Provided reproduction steps

### Real-World Example

**Title:** `[BUG] Buildings disappear after loading save file`

**Description:**
> **Bug:** All buildings disappear when loading a saved city, but population/budget numbers remain
>
> **Expected:** Buildings should appear at their saved positions
>
> **Steps:**
> 1. Build several residential/commercial buildings
> 2. Save game (💾 button)
> 3. Refresh page
> 4. Click Load
> 5. City loads with numbers but no buildings visible
>
> **Environment:** Firefox 121, Windows 11
>
> **Console Error:**
> ```
> TypeError: building.setMesh is not a function
> ```
>
> **Severity:** High - Major feature broken
>
> **Checked RESOLVED_ISSUES.md:** Issue #3 seems related but solution didn't fix it

---

## Issue Labels

GitHub automatically suggests labels, but here are common ones:

### Type Labels
- `bug` - Something isn't working correctly
- `enhancement` - New feature or improvement
- `documentation` - Documentation improvements
- `question` - Questions about functionality

### Priority Labels
- `critical` - Crashes, data loss, game unplayable
- `high` - Major features broken
- `medium` - Feature partially broken
- `low` - Minor issues, polish

### Component Labels
- `ui` - User interface
- `simulation` - Simulation logic
- `economy` - Budget/taxes/economy
- `graphics` - Rendering/visual
- `citizens` - Citizen AI/behavior
- `buildings` - Building system
- `services` - Hospital/police/fire/school
- `disasters` - Fire/flood/outage system
- `save-load` - Save/load system

### Status Labels
- `duplicate` - Already reported
- `wontfix` - Won't be fixed
- `help wanted` - Community help needed
- `good first issue` - Beginner-friendly
- `in progress` - Being worked on

### Example Label Combinations

**Critical save bug:**
`bug`, `critical`, `save-load`

**UI improvement:**
`enhancement`, `medium`, `ui`

**Citizen AI question:**
`question`, `citizens`, `simulation`

---

## Issue Lifecycle

### 1. Created
- Issue opened with template
- Auto-labeled based on template chosen
- GitHub suggests similar issues

### 2. Triaged
- Maintainers review
- Add labels for priority/component
- Link to related issues
- Ask for clarification if needed

### 3. Accepted
- Confirmed as valid
- Added to milestone (if planned)
- May be assigned to contributor

### 4. In Progress
- Labeled `in progress`
- Development branch created
- Linked to pull request

### 5. Fixed/Implemented
- Pull request merged
- Issue automatically closed
- Added to RESOLVED_ISSUES.md (if bug)
- Mentioned in changelog

### 6. Verified
- Tested in production
- Confirmed working
- Issue remains closed

### Typical Timeline

**Bugs:**
- Critical: 1-3 days
- High: 1 week
- Medium: 2-4 weeks
- Low: When time permits

**Features:**
- Simple: 1-2 weeks
- Moderate: 2-4 weeks
- Complex: 1-2 months
- Major: 2+ months

---

## Best Practices

### For Issue Reporters

**DO:**
- ✅ Search before creating
- ✅ Use templates
- ✅ Provide reproduction steps
- ✅ Include console errors
- ✅ Add screenshots
- ✅ Be specific and detailed
- ✅ Follow up with additional info
- ✅ Test suggested fixes

**DON'T:**
- ❌ Create duplicates
- ❌ Report multiple issues in one
- ❌ Use vague titles like "Bug" or "Fix this"
- ❌ Skip the template
- ❌ Demand immediate fixes
- ❌ Post "+1" comments (use 👍 reaction instead)

### Writing Good Titles

**Bad Titles:**
- "Bug"
- "Game doesn't work"
- "Need feature"
- "Help!"

**Good Titles:**
- "[BUG] Save button causes browser freeze with 1000+ citizens"
- "[FEATURE] Add subway transit system for large cities"
- "[BUG] Buildings disappear after loading save file"
- "[ENHANCEMENT] Improve hospital service radius visualization"

### Providing Reproduction Steps

**Bad:**
```
The game crashes sometimes when I save
```

**Good:**
```
1. Start new city
2. Build until population reaches 1000
3. Place a hospital
4. Click Save button (💾)
5. Browser tab freezes
6. Console shows "Out of memory" error
```

### Including Error Information

**Bad:**
```
There's an error in the console
```

**Good:**
```
Console shows:
Uncaught TypeError: Cannot read property 'position' of undefined
    at CitizenManager.update (citizenManager.js:156)
    at City.simulate (city.js:89)
```

---

## Quick Reference

### Creating an Issue

1. **Check first:**
   - [ ] Search existing issues
   - [ ] Check RESOLVED_ISSUES.md
   - [ ] Review documentation

2. **Create issue:**
   - Visit: https://github.com/sergeville/simcity-threejs-clone/issues/new/choose
   - Choose template
   - Fill completely
   - Add labels

3. **Follow up:**
   - Watch for responses
   - Test suggested fixes
   - Provide additional info if requested

### URLs

- **Create issue:** https://github.com/sergeville/simcity-threejs-clone/issues/new/choose
- **View all issues:** https://github.com/sergeville/simcity-threejs-clone/issues
- **Resolved issues:** [RESOLVED_ISSUES.md](RESOLVED_ISSUES.md)
- **Documentation:** [docs/README.md](../README.md)

---

## Examples from Other Projects

### Good Feature Request
[Example from Cities: Skylines mod](https://github.com/example/example/issues/123)
- Clear description
- Use case explained
- Technical details included
- Screenshots/mockups attached

### Good Bug Report
[Example from SimCity 4 mod](https://github.com/example/example/issues/456)
- Exact reproduction steps
- Console errors included
- Environment specified
- Screenshots showing issue

---

**Last Updated:** 2026-01-13
**Maintainer:** Project contributors
**Questions?** Open an issue with the `question` label!
