# Using GitHub Issues - Quick Start Guide

This guide shows you how to use the GitHub Issues system for tracking features and bugs in your SimCity clone project.

## Quick Access URLs

**Main Issues Page:**
https://github.com/sergeville/simcity-threejs-clone/issues

**Create New Issue:**
https://github.com/sergeville/simcity-threejs-clone/issues/new/choose

---

## Daily Workflow

### When You Think of a New Feature

1. **Go to:** https://github.com/sergeville/simcity-threejs-clone/issues/new/choose
2. **Click:** "Get started" next to **Feature Request**
3. **Fill in:**
   - **Title:** `[FEATURE] Add subway transit system`
   - **Description:** What you want and why
   - **Technical Considerations:** Check relevant boxes
4. **Click:** "Submit new issue"
5. **Wait 30 seconds** - The bot will automatically check for duplicates
6. **If bot finds matches:**
   - Check the linked issues
   - If it's the same idea, close yours and comment on the existing one
   - If it's different, just leave your issue open

### When You Find a Bug

1. **Go to:** https://github.com/sergeville/simcity-threejs-clone/issues/new/choose
2. **Click:** "Get started" next to **Bug Report**
3. **Fill in:**
   - **Title:** `[BUG] Buildings disappear after loading`
   - **Description:** What happened vs what should happen
   - **Steps to Reproduce:** Numbered steps
   - **Console Errors:** Copy from browser console (F12)
4. **Click:** "Submit new issue"
5. **Wait for duplicate detection** - Bot checks automatically

### When Working on Something

1. **Find the issue** you're working on
2. **Add label:** `in progress`
3. **Optional:** Assign it to yourself
4. **When done:** Close the issue and reference it in your commit:
   ```bash
   git commit -m "Add subway system - Fixes #42"
   ```

---

## Searching for Existing Issues

### Basic Search

Visit: https://github.com/sergeville/simcity-threejs-clone/issues

**Search examples:**
```
save crash
subway system
budget deficit
building placement
```

### Advanced Search

**Search by label:**
```
label:bug
label:enhancement
label:economy
label:save-load
```

**Search open AND closed issues:**
```
save crash is:issue
```

**Combine searches:**
```
label:bug label:critical save
label:enhancement ui
```

### Finding Related Issues (Context-Based)

The bot checks context automatically, but you can manually search too:

**Instead of searching exact words, search by EFFECT:**
- ❌ "browser freezes on save button"
- ✅ "save crash" or "save freeze" or "save error"

**Browse by component:**
- All economy issues: `label:economy`
- All save/load issues: `label:save-load`
- All citizen issues: `label:citizens`

---

## Understanding the Duplicate Detection Bot

### How It Works

When you create an issue, the bot:
1. Extracts keywords from your title and description
2. Compares with ALL existing issues (open and closed)
3. Calculates similarity scores
4. Posts a comment if it finds matches >30% similar

### Example Bot Comment

```
🔍 Potential Duplicate Issues Detected

Based on keyword analysis, this issue may be related to:

- ✅ #42: Game crashes when saving large cities (75% match)
- 🔴 #78: Browser freeze on save button click (62% match)
- ✅ #12: Save file corruption with 1000+ citizens (45% match)

Please check these issues before proceeding.
```

**What the symbols mean:**
- ✅ = Closed issue (solution may exist)
- 🔴 = Open issue (still being worked on)

### What to Do When Bot Finds Duplicates

**If it's the SAME issue:**
1. Read the linked issue
2. If it's closed with a solution, try that solution
3. If it's open, add a comment to that issue instead
4. Close your new issue as duplicate

**If it's DIFFERENT:**
1. Reply to the bot comment explaining the difference
2. Remove the `potential-duplicate` label
3. Keep your issue open

---

## Labels Reference

### Type Labels (What Kind of Issue)
- `bug` - Something broken
- `enhancement` - New feature or improvement
- `documentation` - Docs need updating
- `question` - Need clarification

### Priority Labels (How Urgent)
- `critical` - Game crashes, data loss, unplayable
- `high` - Major feature broken
- `medium` - Partial functionality broken
- `low` - Minor issues, polish

### Component Labels (What Part of Game)
- `ui` - User interface
- `simulation` - Simulation logic
- `economy` - Budget/taxes
- `graphics` - Rendering/visual
- `citizens` - Citizen AI
- `buildings` - Building system
- `services` - Hospital/police/fire/school
- `disasters` - Fire/flood/outage
- `save-load` - Save/load system

### Status Labels
- `duplicate` - Already reported
- `potential-duplicate` - Bot detected similarity (might be false positive)
- `wontfix` - Not going to fix
- `help wanted` - Community help needed
- `good first issue` - Easy for beginners
- `in progress` - Being worked on

---

## Common Workflows

### Workflow 1: Plan a New Feature

1. Create feature request issue
2. Add relevant labels (`enhancement`, `ui`, `simulation`, etc.)
3. Add to GitHub project board (optional)
4. When ready to implement:
   - Add `in progress` label
   - Create a branch: `git checkout -b feature/subway-system`
   - Implement the feature
   - Commit with reference: `git commit -m "Add subway stations - Part of #42"`
   - Push and create PR
   - Merge PR (automatically closes issue if you wrote "Fixes #42" in PR)

### Workflow 2: Fix a Bug

1. Create bug report issue
2. Add priority label (`critical`, `high`, `medium`, `low`)
3. Add component label (`save-load`, `economy`, etc.)
4. Investigate the bug
5. When you have a fix:
   - Commit: `git commit -m "Fix save corruption bug - Fixes #78"`
   - Push the fix
   - Issue closes automatically
6. Update RESOLVED_ISSUES.md with the solution

### Workflow 3: Track Ideas

1. Create feature request with `enhancement` label
2. Don't add `in progress` yet
3. Let it sit in the backlog
4. Add comments as you think of details
5. When ready to implement, add `in progress`

---

## Tips and Best Practices

### Writing Good Issue Titles

**Bad:**
- "Bug"
- "Feature idea"
- "This doesn't work"

**Good:**
- "[BUG] Save button freezes browser with 1000+ citizens"
- "[FEATURE] Add subway transit system for large cities"
- "[BUG] Buildings disappear after loading save file"

### Providing Useful Information

**For bugs, ALWAYS include:**
1. Steps to reproduce (numbered list)
2. Expected behavior
3. Actual behavior
4. Console errors (open browser console with F12)
5. Browser and OS

**For features, ALWAYS include:**
1. What you want to add
2. Why it's needed
3. How you imagine it working

### Using Labels Effectively

**Combine labels for clarity:**
- Bug in economy: `bug` + `economy` + `high`
- UI improvement: `enhancement` + `ui` + `medium`
- Save system question: `question` + `save-load`

### Referencing Issues in Commits

**Auto-close issues:**
```bash
git commit -m "Fix budget calculation - Fixes #42"
git commit -m "Add hospital service - Closes #78"
```

**Reference without closing:**
```bash
git commit -m "Improve hospital UI - Related to #78"
git commit -m "Add tests for economy - See #42"
```

---

## Example Session

Here's a complete example of using the system:

### Monday Morning - Find a Bug

1. Playing the game, notice buildings disappear after loading
2. Open browser console (F12), see error: `TypeError: building.setMesh is not a function`
3. Go to: https://github.com/sergeville/simcity-threejs-clone/issues/new/choose
4. Click "Bug Report"
5. Fill in:
   ```
   Title: [BUG] Buildings disappear after loading save file

   Description:
   All buildings disappear when loading a saved city, but population/budget remain.

   Steps to Reproduce:
   1. Build several residential/commercial buildings
   2. Save game (💾 button)
   3. Refresh page
   4. Click Load
   5. Buildings gone, numbers intact

   Console Error:
   TypeError: building.setMesh is not a function
       at City.deserialize (city.js:234)

   Browser: Firefox 121, Windows 11
   ```
6. Submit issue → It becomes issue #85
7. Bot responds: "Found similar: #12 (closed) - Save/load crash"
8. Read #12, but it's different (different error)
9. Comment: "This is different - #12 was about population, mine is about buildings"
10. Remove `potential-duplicate` label
11. Add labels: `bug`, `critical`, `save-load`

### Monday Afternoon - Fix the Bug

1. Investigate code, find the issue in `city.js`
2. Add `in progress` label to #85
3. Create branch: `git checkout -b fix/save-load-buildings`
4. Fix the bug
5. Test the fix
6. Commit: `git commit -m "Fix building mesh restoration on load - Fixes #85"`
7. Push: `git push origin fix/save-load-buildings`
8. Issue #85 automatically closes
9. Update `docs/development/RESOLVED_ISSUES.md` with solution

### Tuesday - Plan a Feature

1. Think: "Subway system would be cool"
2. Search first: `subway` - No results
3. Search: `label:enhancement transit` - No results
4. Create feature request:
   ```
   Title: [FEATURE] Add subway transit system

   Description:
   Large cities need underground rail transit to reduce traffic.

   How it should work:
   - New building: Subway Station ($50k)
   - Underground tunnel visualization
   - Citizens prefer subway over roads
   - Reduces traffic by 40%

   Similar to: SimCity 4 subway system
   ```
5. Submit → Becomes issue #86
6. Bot finds no duplicates
7. Add labels: `enhancement`, `simulation`, `buildings`
8. Leave it in backlog (no `in progress` yet)
9. Add comments as you think of details over the week

### Friday - Implement the Feature

1. Ready to implement #86
2. Add `in progress` label
3. Create branch: `git checkout -b feature/subway-system`
4. Work on it over several days with multiple commits:
   ```bash
   git commit -m "Add subway station building type - Part of #86"
   git commit -m "Implement underground tunnel rendering - Part of #86"
   git commit -m "Add citizen subway preference logic - Part of #86"
   ```
5. Final commit: `git commit -m "Complete subway system - Fixes #86"`
6. Push and create PR
7. Merge PR → #86 automatically closes

---

## Keyboard Shortcuts (on GitHub)

When viewing issues list:
- `C` - Create new issue
- `/` - Focus search bar
- `G` + `I` - Go to Issues page

When viewing an issue:
- `L` - Add/remove labels
- `A` - Assign to someone
- `M` - Add milestone

---

## Quick Reference Card

**Create Issue:** https://github.com/sergeville/simcity-threejs-clone/issues/new/choose

**Search Issues:** https://github.com/sergeville/simcity-threejs-clone/issues

**Common Searches:**
- `label:bug` - All bugs
- `label:enhancement` - All features
- `is:open` - Open issues only
- `is:closed` - Closed issues only
- `label:in progress` - What's being worked on

**Auto-Close in Commit:**
```bash
git commit -m "Your message - Fixes #123"
```

**Reference in Commit:**
```bash
git commit -m "Your message - Related to #123"
```

---

## Need Help?

- **Question about the system?** Create an issue with `question` label
- **Found a problem with the templates?** Report it as a bug
- **Want to improve this guide?** Edit this file and commit!

**Last Updated:** 2026-01-13
