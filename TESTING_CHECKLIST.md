# Comprehensive Testing Checklist

**Server**: http://127.0.0.1:3000/simcity-threejs-clone/
**Date**: 2026-01-13
**Testing Focus**: Disaster system, visual effects, documentation restructure

---

## Pre-Testing Setup

- [ ] Dev server running (http://127.0.0.1:3000/simcity-threejs-clone/)
- [ ] Browser console open (F12)
- [ ] No console errors on page load
- [ ] Game renders correctly (16x16 grid visible)

---

## 1. Basic Functionality Tests

### Game Startup
- [ ] Loading screen appears briefly
- [ ] City grid renders (16x16 tiles)
- [ ] Toolbar buttons visible on left
- [ ] Title bar shows budget, city name, population
- [ ] Instructions visible in bottom-left
- [ ] No console errors

### Building Placement
- [ ] **Residential zone**: Click button, click tile, building appears
- [ ] **Commercial zone**: Click button, click tile, building appears
- [ ] **Industrial zone**: Click button, click tile, building appears
- [ ] **Road**: Click button, click multiple tiles, roads connect
- [ ] **Power plant**: Click button, click tile, building appears
- [ ] **Power line**: Click button, click multiple tiles, lines connect
- [ ] **Hospital** (🏥): Click button, click tile, building appears
- [ ] **Police station** (👮): Click button, click tile, building appears
- [ ] **Fire station** (🚒): Click button, click tile, building appears
- [ ] **School** (🏫): Click button, click tile, building appears

### Building Demolition
- [ ] Select bulldoze tool
- [ ] Click on building
- [ ] Building disappears
- [ ] Activity feed shows demolition message
- [ ] No console errors

### Selection Tool
- [ ] Click select tool
- [ ] Click on building
- [ ] Info panel appears on right
- [ ] Shows building details
- [ ] Status icons appear (if applicable)

---

## 2. Disaster System Tests

### Disaster Difficulty Button
- [ ] **Difficulty button visible** (🔥 icon, orange border)
- [ ] **Click once**: Changes to 💀 (Hard, red)
- [ ] **Click again**: Changes to 🛡️ (None, green)
- [ ] **Click again**: Changes to ⚠️ (Easy, yellow)
- [ ] **Click again**: Returns to 🔥 (Normal, orange)
- [ ] **Activity feed** shows difficulty change messages
- [ ] **Tooltip** updates with difficulty name

### Setting Up Test City
Build a test city:
- [ ] Place 4-5 residential zones in a cluster
- [ ] Place 2-3 commercial zones nearby
- [ ] Place roads connecting them
- [ ] Place power plant
- [ ] Place power lines to zones
- [ ] Place fire station within 12 tiles of residential
- [ ] Place hospital within 8 tiles of residential
- [ ] Let simulation run until zones develop
- [ ] Population appears in title bar

### Fire Disaster Tests

**Set difficulty to HARD for faster testing**

- [ ] **Wait for fire spawn** (should happen within 1-2 minutes on Hard)
- [ ] **Activity feed notification**: "🔥 FIRE at (x, y)! Fire department responding..."
- [ ] **Visual effects appear**:
  - [ ] Orange fire particles rising from building
  - [ ] Gray smoke particles above fire
  - [ ] Pulsing orange glow on ground
  - [ ] Particles animate smoothly
- [ ] **Fire spreads** (may take multiple fires):
  - [ ] Activity feed: "🔥 Fire spreading to (x, y)!"
  - [ ] Adjacent building catches fire
  - [ ] New fire effects appear
- [ ] **Fire station response** (if within 12 tiles):
  - [ ] Fire duration reduces faster
  - [ ] Fire extinguishes more quickly
- [ ] **Fire cleanup**:
  - [ ] Fire particles disappear
  - [ ] Building may be destroyed (15% chance)
  - [ ] OR building shows damage overlay (gray transparency)
  - [ ] Activity feed shows damage/destruction message
- [ ] **Damage overlay visible**:
  - [ ] Light damage: Slight gray overlay
  - [ ] Moderate damage: Darker gray overlay
  - [ ] Heavy damage: Very dark gray overlay
- [ ] **No console errors during fire**

### Flood Disaster Tests

- [ ] **Wait for flood spawn** (may take 2-3 minutes even on Hard)
- [ ] **Activity feed**: "💧 FLOOD near (x, y)! Area affected."
- [ ] **Multiple buildings affected** (5-tile radius)
- [ ] **Flood duration**: Lasts ~20 seconds (20 steps)
- [ ] **Flood cleanup**:
  - [ ] Some buildings show damage overlays
  - [ ] Some buildings destroyed (rare, 5% chance)
  - [ ] Activity feed may show damage messages
- [ ] **No console errors during flood**

### Power Outage Tests

- [ ] **Need power plant in city** for this test
- [ ] **Wait for power outage spawn**
- [ ] **Activity feed**: "⚡ POWER OUTAGE at power plant (x, y)!"
- [ ] **Buildings lose power**:
  - [ ] Buildings show "no power" status icon
  - [ ] Connected buildings affected
- [ ] **Power restoration** (after 50 steps, ~50 seconds):
  - [ ] Activity feed: "⚡ Power restored at (x, y)"
  - [ ] Buildings regain power
  - [ ] Status icons disappear
- [ ] **No console errors during outage**

---

## 3. Hospital Repair Mechanic Tests

### Setup
- [ ] Have hospital built and staffed (needs employed citizens)
- [ ] Have damaged buildings within 8 tiles of hospital
- [ ] Hospital shows effectiveness > 50%

### Repair Process
- [ ] **Wait 1-2 minutes** (repair is gradual)
- [ ] **Damage overlay fades** (state reduces: 3 → 2 → 1 → 0)
- [ ] **Activity feed notification** when fully repaired:
  - "🏥 Building at (x, y) fully repaired"
- [ ] **Damage overlay disappears** when state = 0
- [ ] **Process works for multiple damaged buildings**
- [ ] **No console errors during repair**

---

## 4. Visual Effects Cleanup Tests

### Bulldoze Burning Building
- [ ] **Wait for fire to start**
- [ ] **Fire effects visible** (particles, glow)
- [ ] **Select bulldoze tool**
- [ ] **Demolish burning building**
- [ ] **Fire effects disappear immediately**
- [ ] **No lingering particles**
- [ ] **Activity feed shows demolition**
- [ ] **No console errors**

### Bulldoze Damaged Building
- [ ] **Building has damage overlay** (gray transparency)
- [ ] **Select bulldoze tool**
- [ ] **Demolish damaged building**
- [ ] **Damage overlay disappears immediately**
- [ ] **No visual artifacts remain**
- [ ] **No console errors**

---

## 5. Integration Tests

### Multiple Simultaneous Disasters
- [ ] **Set difficulty to HARD**
- [ ] **Wait for multiple disasters** (fire + flood + power outage)
- [ ] **All disasters function correctly**
- [ ] **Visual effects don't conflict**
- [ ] **Activity feed shows all events**
- [ ] **Game remains playable**
- [ ] **No performance issues**
- [ ] **No console errors**

### Fire Station Response
- [ ] **Place fire station**
- [ ] **Wait for fire within 12 tiles**
- [ ] **Fire duration reduces** (extinguishes faster)
- [ ] **Multiple fires**: Station helps all nearby fires
- [ ] **No console errors**

### Difficulty Level Impact
- [ ] **Set to NONE**: No disasters spawn for 2+ minutes
- [ ] **Set to EASY**: Disasters rare (2% chance / 150 steps)
- [ ] **Set to NORMAL**: Moderate frequency (5% / 100 steps)
- [ ] **Set to HARD**: Frequent disasters (10% / 75 steps)

### Economy Integration
- [ ] **Hospital costs money** to build
- [ ] **Fire station costs money** to build
- [ ] **Budget decreases** when building services
- [ ] **Budget shown** in title bar
- [ ] **Can't build** if insufficient funds

---

## 6. UI/UX Tests

### Activity Feed
- [ ] **Feed visible** in bottom-right
- [ ] **Disaster notifications** appear with icons
- [ ] **Repair notifications** appear
- [ ] **Demolition notifications** appear
- [ ] **Messages scroll** as new ones appear
- [ ] **Feed readable** and doesn't overlap other UI

### Info Panel
- [ ] **Select building**
- [ ] **Info panel shows** on right
- [ ] **Shows building type**
- [ ] **Shows status** (power, road access)
- [ ] **For hospitals**: Shows effectiveness, capacity
- [ ] **For fire stations**: Shows coverage info
- [ ] **Panel updates** when simulation changes

### Citizen Stats Panel
- [ ] **Panel visible** below info panel
- [ ] **Shows total citizens**
- [ ] **Shows employment stats**
- [ ] **Shows avg happiness**
- [ ] **Shows avg health**
- [ ] **Updates in real-time**

### Camera Controls
- [ ] **Pan**: Ctrl + Right mouse drag works
- [ ] **Rotate**: Right mouse drag works
- [ ] **Zoom**: Mouse wheel works
- [ ] **Camera smooth** and responsive

---

## 7. Performance Tests

### Frame Rate
- [ ] **Game runs smoothly** (no stuttering)
- [ ] **Multiple fires**: Still smooth
- [ ] **50+ buildings**: No lag
- [ ] **Check browser console**: Look for slow simulation warnings

### Memory
- [ ] **Play for 5 minutes**
- [ ] **Check browser task manager** (Shift+Esc in Chrome)
- [ ] **Memory usage stable** (not growing continuously)
- [ ] **No memory leaks** from visual effects

### Long Session
- [ ] **Play for 10+ minutes**
- [ ] **Build large city** (80+ buildings)
- [ ] **Multiple disasters**
- [ ] **Game remains stable**
- [ ] **No crashes**
- [ ] **No console error flood**

---

## 8. Edge Cases & Error Handling

### Disaster Edge Cases
- [ ] **Fire on isolated building**: Works normally
- [ ] **Flood with no buildings nearby**: No errors
- [ ] **Power outage with no power plant**: Doesn't spawn
- [ ] **Multiple fires on same building**: Handled correctly

### Building Edge Cases
- [ ] **Bulldoze while disaster active**: Works correctly
- [ ] **Place building on burning tile**: Not allowed
- [ ] **Hospital with no damaged buildings**: No errors
- [ ] **Fire station with no fires**: No errors

### UI Edge Cases
- [ ] **Rapid difficulty changes**: No errors
- [ ] **Pause/unpause during disaster**: Works correctly
- [ ] **Select tool during fire**: Works correctly
- [ ] **Multiple quick bulldozes**: No errors

---

## 9. Console Error Check

**Critical**: Check browser console (F12) throughout testing

### Expected: No Errors
Look for:
- ❌ Red error messages
- ⚠️ Yellow warnings (some warnings okay)
- 🔴 Failed resource loads
- 🔴 JavaScript exceptions

### Acceptable Warnings
- THREE.js deprecation warnings (common)
- Asset loading warnings (if assets missing)

### Unacceptable Errors
- Uncaught TypeError
- Uncaught ReferenceError
- Failed to fetch
- Cannot read property of undefined

**Document any errors found below:**

---

## 10. Documentation Verification

### README.md
- [ ] Open on GitHub: Check links to `/docs/` work
- [ ] Links to features/disasters.md work
- [ ] Links to contributing guide work

### CLAUDE.md
- [ ] References to `/docs/` correct
- [ ] Links to architecture docs work
- [ ] Structure section accurate

### /docs/ Folder
- [ ] Navigate to /docs/ on GitHub
- [ ] README.md renders correctly
- [ ] All subfolder links work
- [ ] Cross-references between docs work

---

## Testing Results

### Issues Found

**Critical (Blocks functionality):**
- [ ] None found
- [ ] Issue: ___________________________________

**Major (Impacts user experience):**
- [ ] None found
- [ ] Issue: ___________________________________

**Minor (Small bugs or polish issues):**
- [ ] None found
- [ ] Issue: ___________________________________

### Performance Metrics

- **Frame rate**: _____ FPS (target: 60)
- **Simulation speed**: _____ ms/tick (target: <16ms)
- **Memory usage**: _____ MB (after 10 min)
- **Disaster spawn frequency on HARD**: _____ per minute

### Overall Assessment

**Game Stability**: ⭐⭐⭐⭐⭐ (1-5 stars)
**Disaster System**: ⭐⭐⭐⭐⭐ (1-5 stars)
**Visual Effects**: ⭐⭐⭐⭐⭐ (1-5 stars)
**User Experience**: ⭐⭐⭐⭐⭐ (1-5 stars)

**Ready for Release?**: YES / NO / NEEDS WORK

---

## Test Completion

- [ ] All tests completed
- [ ] All issues documented
- [ ] Screenshots taken (if needed)
- [ ] Console log saved (if errors found)
- [ ] Ready to report results

**Tester**: ___________________
**Date**: 2026-01-13
**Duration**: _____ minutes

---

**Notes:**
