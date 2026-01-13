# Resolved Issues

This document tracks technical issues encountered during development and their resolutions. Use this as a reference when troubleshooting similar problems.

## Table of Contents
- [GitHub Actions & Deployment](#github-actions--deployment)
- [Game Systems](#game-systems)
- [UI/UX Issues](#uiux-issues)
- [Performance & Stability](#performance--stability)

---

## GitHub Actions & Deployment

### Issue #1: GitHub Pages Deployment Failures (2026-01-13)

**Status:** ✅ RESOLVED

**Symptoms:**
- All workflow runs failing with red X marks
- Error: "This job has been automatically failed because it uses a deprecated version of `actions/upload-artifact: v1`"
- Site showing README instead of game
- 404 error at https://sergeville.github.io/simcity-threejs-clone/

**Timeline:**
- Initial detection: Multiple failed workflow runs
- Duration: ~30 minutes
- Fixed: Workflow #15 first successful deployment

**Root Cause:**
Multiple issues compounding:
1. GitHub Pages source was set to "Deploy from a branch" instead of "GitHub Actions"
2. Workflow using deprecated Actions versions (v1) that GitHub auto-failed
3. Jekyll processing enabled (showing README.md instead of built app)

**Solution:**

**Step 1: Update GitHub Pages Source**
- Navigate to: Repository → Settings → Pages
- Change Source: "Deploy from a branch" → "GitHub Actions"
- This allows the workflow to handle deployments

**Step 2: Update Workflow Actions Versions**

File: `.github/workflows/static.yml`

```yaml
# BEFORE (deprecated):
- name: Upload artifact
  uses: actions/upload-pages-artifact@v1
- name: Deploy to GitHub Pages
  uses: actions/deploy-pages@v1

# AFTER (current):
- name: Upload artifact
  uses: actions/upload-pages-artifact@v3
- name: Deploy to GitHub Pages
  uses: actions/deploy-pages@v4
```

**Step 3: Disable Jekyll Processing**

Added to workflow:
```yaml
- name: Add .nojekyll file
  run: touch ./src/dist/.nojekyll
```

**Verification:**
- Workflow run #15: ✅ Success (3m 24s)
- Subsequent runs: All successful (27-34s each)
- Site accessible at: https://sergeville.github.io/simcity-threejs-clone/
- Game loads correctly (not README)

**Lessons Learned:**
- Always use latest stable versions of GitHub Actions
- GitHub Pages has two deployment methods - ensure correct one is selected
- Jekyll processing can interfere with built applications
- Check GitHub Actions deprecation warnings promptly

**References:**
- [GitHub Actions changelog](https://github.blog/changelog/2024-04-16-deprecation-notice-v1-and-v2-of-the-artifact-actions/)
- Commits: `f87b10f`, `7d24fc1`

---

### Issue #2: Missing News Reporter Files in Git (2026-01-13)

**Status:** ✅ RESOLVED

**Symptoms:**
- Commit succeeded but 3 new files missing from repository
- Files existed locally but couldn't be added
- Error: "The following paths are ignored by one of your .gitignore files: src/scripts"

**Root Cause:**
`.gitignore` had overly broad pattern `scripts/` which matched both:
- `/scripts/` (intended: development helper scripts)
- `src/scripts/` (unintended: application source code)

**Solution:**

Updated `.gitignore`:
```diff
# BEFORE:
- scripts/
+ /scripts/

# AFTER: (only ignores root-level scripts folder)
```

Added files successfully:
- `src/scripts/newsPanel.js` (81 lines)
- `src/scripts/sim/services/newsService.js` (440 lines)
- `src/scripts/sim/services/newsStory.js` (42 lines)

**Lessons Learned:**
- Use `/` prefix in .gitignore to specify root-level only
- Test gitignore patterns before committing
- Verify all intended files are staged with `git status`

**References:**
- Commit: `18378f4`

---

## Game Systems

### Issue #3: Save/Load System Crash (2026-01-13)

**Status:** ✅ RESOLVED

**Symptoms:**
- Console error: `TypeError: Cannot set property building of #<Tile> which has only a getter`
- Message: "Could not load saved game. Starting new city..."
- Game would start fresh instead of loading saved state

**Root Cause:**
In `city.js` line 484, the deserialization code attempted direct property assignment:
```javascript
tile.building = building;  // ❌ WRONG: building is a getter-only property
```

The `Tile` class defines `building` as a getter without a setter, requiring the `setBuilding()` method instead.

**Solution:**

File: `src/scripts/sim/city.js` (line 484)

```javascript
// BEFORE:
tile.building = building;

// AFTER:
tile.setBuilding(building);
```

**Verification:**
- User confirmed: "Save file loaded successfully"
- Game state properly restored
- No console errors

**Lessons Learned:**
- Always check class implementation before property assignment
- Use class methods when available instead of direct property access
- Test save/load functionality thoroughly

**References:**
- Commit: `67323bd`
- File: `src/scripts/sim/city.js:484`

---

### Issue #4: Budget Deficit Crisis (2026-01-13)

**Status:** ✅ RESOLVED

**Symptoms:**
- City running -$107/month deficit
- Budget shrinking toward bankruptcy
- Service buildings too expensive to maintain

**Analysis:**
```
Revenue:  ~$700/month (taxes from residents/businesses)
Expenses: ~$807/month (service building maintenance)
Net:      -$107/month (unsustainable)
```

Service building costs were too high:
- Hospital: $200/month
- Police: $150/month
- Fire Station: $175/month
- School: $125/month
- Total: $650/month for full services

**Solution:**

File: `src/scripts/config.js`

**Reduced Maintenance Costs (50-65% reduction):**
```javascript
maintenanceCosts: {
  residential: 2,        // was 5 (-60%)
  commercial: 5,         // was 10 (-50%)
  industrial: 8,         // was 15 (-47%)
  hospital: 75,          // was 200 (-62.5%)
  'fire-station': 70,    // was 175 (-60%)
  'police-station': 60,  // was 150 (-60%)
  school: 50,            // was 125 (-60%)
  'power-plant': 50,     // was 100 (-50%)
}
```

**Increased Tax Rates (40-50% increase):**
```javascript
taxRates: {
  residential: 15,  // was 10 (+50%)
  commercial: 35,   // was 25 (+40%)
  industrial: 30    // was 20 (+50%)
}
```

**Result:**
- New monthly profit: +$577/month
- Sustainable city growth enabled
- Services affordable

**Lessons Learned:**
- Game balance requires careful tuning of economic parameters
- Test with actual city scenarios (full services + population)
- Monitor revenue vs expenses ratio

**References:**
- Commit: `a0c6a9e`

---

## UI/UX Issues

### Issue #5: Activity Feed Overlapping Info Panel (2026-01-13)

**Status:** ✅ RESOLVED

**Symptoms:**
- Activity feed (top-right) visually overlapped info panel (top-right)
- Both panels fighting for same screen space
- Poor user experience with cluttered UI

**Root Cause:**
Both panels positioned in top-right corner:
```css
#activity-feed {
  position: fixed;
  top: 80px;      /* Too close to info panel */
  right: 16px;
}
```

**Solution:**

File: `src/public/main.css`

```css
#activity-feed {
  position: fixed;
  bottom: 40px;   /* Changed from top: 80px */
  right: 16px;
  /* ... */
}
```

**Result:**
- Info panel: Top-right
- Activity feed: Bottom-right
- Clean separation with no overlap

**Lessons Learned:**
- Test UI layouts at different screen sizes
- Avoid positioning multiple panels in same corner
- Use screenshots to verify UI changes

**References:**
- Commit: `cf24afd`

---

## Performance & Stability

### Issue #6: Dev Server Crashes (Exit Code 137) (2026-01-13)

**Status:** ✅ RESOLVED

**Symptoms:**
- Background dev server repeatedly killed
- Exit code: 137 (SIGKILL - system termination)
- Multiple Vite instances running simultaneously

**Root Cause:**
Script didn't check if port 3000 was already in use before starting new instance.
Multiple instances caused memory pressure → system killed processes.

**Solution:**

File: `scripts/sim.sh`

```bash
start)
  # Check if server is already running
  if lsof -i :$PORT > /dev/null 2>&1; then
    echo "ERROR: SimCity Clone is already running on port $PORT!"
    echo "Use './sim.sh stop' to stop it first, or './sim.sh restart' to restart."
    exit 1
  fi
  # ... continue with start
```

**Result:**
- Prevents duplicate instances
- More stable server
- Clear error message when already running

**Lessons Learned:**
- Always check resource availability before allocation
- Exit code 137 = SIGKILL = system resource constraint
- Use `lsof` to check port availability

**References:**
- Script: `scripts/sim.sh`
- Note: File in .gitignore, changes local only (now exposed in repository)

---

## Template for New Issues

When adding new resolved issues, use this template:

```markdown
### Issue #N: Brief Description (YYYY-MM-DD)

**Status:** ✅ RESOLVED / ⚠️ WORKAROUND / 🔄 ONGOING

**Symptoms:**
- What the user/developer experienced
- Error messages if any
- Observable behavior

**Root Cause:**
Technical explanation of why the issue occurred

**Solution:**

File: `path/to/file`

```language
// Code changes or configuration updates
```

**Verification:**
How the fix was tested and confirmed

**Lessons Learned:**
- Key takeaways
- Best practices for future

**References:**
- Commit: `hash`
- Related docs: links
```

---

## Issue Statistics

**Total Resolved:** 6
**Categories:**
- Deployment: 2
- Game Systems: 2
- UI/UX: 1
- Performance: 1

**Average Resolution Time:** < 30 minutes
**Impact:** All critical blockers resolved

---

**Last Updated:** 2026-01-13
**Maintainers:** Project contributors
**Contributing:** Found and fixed an issue? Add it here following the template!
