# GitHub Issues Quick Reference Card

## Essential URLs (Bookmark These!)

| Action | URL |
|--------|-----|
| **View All Issues** | https://github.com/sergeville/simcity-threejs-clone/issues |
| **Create New Issue** | https://github.com/sergeville/simcity-threejs-clone/issues/new/choose |
| **Documentation** | https://github.com/sergeville/simcity-threejs-clone/blob/main/docs/README.md |
| **Resolved Issues** | https://github.com/sergeville/simcity-threejs-clone/blob/main/docs/development/RESOLVED_ISSUES.md |

---

## Quick Actions

### Report a Bug
1. Go to: https://github.com/sergeville/simcity-threejs-clone/issues/new/choose
2. Click **Bug Report** → Get started
3. Fill title: `[BUG] Short description`
4. Add steps to reproduce + console errors
5. Submit → Bot checks for duplicates automatically

### Request a Feature
1. Go to: https://github.com/sergeville/simcity-threejs-clone/issues/new/choose
2. Click **Feature Request** → Get started
3. Fill title: `[FEATURE] Short description`
4. Explain what and why
5. Submit → Bot checks for duplicates automatically

### Search for Existing Issues
```
label:bug                  # All bugs
label:enhancement          # All features
label:save-load           # Save/load issues
label:economy             # Economy issues
is:open                   # Open only
is:closed                 # Closed only
```

---

## Git Commit Keywords

### Auto-Close Issues
```bash
git commit -m "Fix save bug - Fixes #42"
git commit -m "Add subway - Closes #78"
```

### Reference Without Closing
```bash
git commit -m "Improve UI - Related to #42"
git commit -m "Add tests - See #78"
```

---

## Common Labels

**Priority:**
- `critical` - Crashes, data loss
- `high` - Major broken
- `medium` - Partial broken
- `low` - Minor polish

**Components:**
- `ui` `simulation` `economy` `graphics`
- `citizens` `buildings` `services` `disasters`
- `save-load`

**Status:**
- `in progress` - Being worked on
- `duplicate` - Already reported
- `potential-duplicate` - Bot detected (might be wrong)

---

## Duplicate Detection Bot

**When you create an issue:**
1. Bot analyzes your title + description (30 seconds)
2. Compares with ALL existing issues
3. Posts comment if >30% similarity found
4. Check the links → Close if duplicate, ignore if different

**Example bot comment:**
```
🔍 Potential Duplicate Issues Detected

- ✅ #42: Similar issue title (75% match)
- 🔴 #78: Related problem (62% match)
```

- ✅ = Closed (check solution)
- 🔴 = Open (add comment there instead)

---

## Typical Workflow

1. **Think of idea** → Search first
2. **Not found?** → Create issue
3. **Bot responds** → Check links
4. **Different?** → Keep issue open, add labels
5. **Ready to work?** → Add `in progress` label
6. **Done?** → Commit with "Fixes #XX"

---

## Help

**Full Guide:** [USING_GITHUB_ISSUES.md](USING_GITHUB_ISSUES.md)
**Complete Reference:** [GITHUB_ISSUES_GUIDE.md](GITHUB_ISSUES_GUIDE.md)
**Need Help?** Create issue with `question` label

---

**Print this page and keep it handy!**
