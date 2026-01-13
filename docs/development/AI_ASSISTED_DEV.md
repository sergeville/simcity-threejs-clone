# AI-Assisted Development in SimCity Clone

## Overview

This project was developed with significant AI assistance, primarily using **Claude Code** (claude.ai/code). This document explains how AI is used in this project and how you can contribute using AI tools effectively.

**Key Fact**: Most of the codebase, including the disaster system, citizen simulation, and economic systems, was built with AI assistance.

## AI Tools Used

### Primary: Claude Code
- **Purpose**: Code generation, refactoring, debugging, architecture design
- **Configuration**: Uses project-specific instructions in [CLAUDE.md](../../CLAUDE.md)
- **Context**: Automatically reads CLAUDE.md to understand project structure
- **Strengths**: Excellent for complex logic, architectural decisions, documentation

### Secondary: GitHub Copilot (Optional)
- **Purpose**: Inline code completion
- **Usage**: Supplement to primary development
- **Strengths**: Quick boilerplate, common patterns

## CLAUDE.md Guide

The `CLAUDE.md` file in the root directory is the **primary AI assistant guide**:

**What it contains**:
- Complete project architecture overview
- Service-based simulation pattern
- Module composition system
- Building hierarchy and factory pattern
- Coding conventions and patterns
- Important implementation notes

**How it works**:
When you use Claude Code in this repository, it automatically reads CLAUDE.md and uses it as context for understanding the project structure and conventions.

**When to update it**:
- Adding new architectural patterns
- Creating new service types
- Changing core conventions
- Adding important gotchas

## Recommended AI Workflow

### 1. Starting a New Session

```bash
# If using Claude Code CLI
cd simcity-threejs-clone
claude

# Claude automatically reads CLAUDE.md
# You're ready to work with full project context
```

**First prompt example**:
```
I want to add a new disaster type (earthquake). Following the existing disaster
system pattern in disasterService.js, create an Earthquake class that:
- Affects buildings in a radius
- Has configurable magnitude
- Integrates with the difficulty system
```

### 2. Making Changes

**Best practices**:
- Reference CLAUDE.md explicitly when needed
- Follow the service-based architecture
- Use the module pattern for building components
- Check config.js for simulation parameters
- Update CLAUDE.md if you add new patterns

**Example prompts**:
```
"Create a new service following the SimService pattern..."
"Add a new building type following the Building hierarchy..."
"Refactor this to follow the two-phase update pattern (simulate/refreshView)..."
```

### 3. Documentation

- Update feature docs in `/docs/features/` for new game mechanics
- Update CLAUDE.md for architectural changes
- Add JSDoc comments for complex logic
- Create comprehensive guides for major features (like DISASTER_SYSTEM.md)

## Common AI Prompts for This Project

### Adding a New Service

```
Create a new service following the SimService pattern:
- Extends SimService base class (src/scripts/sim/services/simService.js)
- Located in src/scripts/sim/services/[name].js
- Implements simulate(city) method
- Properly integrated in City constructor (src/scripts/sim/city.js)
- Added to services array

Example: See DisasterService or PowerService
```

### Adding a New Building Type

```
Create a new building type following the Building pattern:
- Extends Building or Zone base class
- Uses modules for functionality (PowerModule, RoadAccessModule, etc.)
- Located in src/scripts/sim/buildings/[category]/[name].js
- Added to BuildingFactory (src/scripts/sim/buildings/buildingFactory.js)
- Added to BuildingType enum (src/scripts/sim/buildings/buildingType.js)
- Model exists in src/public/models/

Follow the pattern in: Hospital, FireStation, or residential/commercial zones
```

### Debugging Visual Issues

```
The building mesh isn't rendering correctly. Check:
1. AssetManager loading the model (src/scripts/assets/assetManager.js)
2. setMesh() being called in the building class
3. Material assignments (shared texture atlas: base.png + specular.png)
4. Render layers (layer 0 for buildings, layer 1 for status icons)
5. Position/rotation/scale applied correctly

Reference: Building.js and AssetManager pattern
```

### Adding UI Features

```
Add a new UI button following the existing pattern:
1. Add button to src/index.html in #ui-toolbar
2. Create handler method in src/scripts/ui.js
3. Use onclick="ui.methodName()" for binding
4. Update button state/appearance in the method
5. Post to activity feed if user-facing action

Example: See toggleDisasterDifficulty() in ui.js
```

## Project-Specific Context

### Architecture Patterns

#### Service Pattern
City-wide systems that affect multiple tiles/buildings:

```javascript
// Example: DisasterService, PowerService, EconomyService
class MyService extends SimService {
  simulate(city) {
    // Update service state each simulation tick
    // Access city.getTile(x, y) to interact with tiles
    // Use city.services to access other services
  }
}
```

#### Module Pattern
Building-specific components using composition:

```javascript
// Example: PowerModule, RoadAccessModule, ResidentsModule
class MyModule extends SimModule {
  constructor(building) {
    super(building);
    this.someProperty = initialValue;
  }

  simulate(city) {
    // Update module state
    // Access this.building to get parent building
  }
}
```

### Code Conventions

1. **Global Singletons**: `window.game`, `window.ui`, `window.assetManager`
   - Accessible from anywhere
   - Created on page load

2. **Two-Phase Updates**:
   - `simulate()` - Updates data model
   - `refreshView()` - Updates visual representation
   - Called separately to avoid thrashing

3. **Coordinate System**:
   - 2D grid (x, y) mapped to 3D space
   - Buildings positioned at integer coordinates
   - Tile at (x, y) has 3D position (x, 0, y)

4. **Raycasting for Selection**:
   - Objects store reference in `mesh.userData`
   - Game.js handles raycasting on mouse events

5. **Activity Feed Integration**:
   - Use `window.activityFeed.event()` for notifications
   - Categories: 'event', 'construction', 'economy', 'citizen', 'ai'

## Context Management for Long Sessions

For transferring context between AI sessions or models, see:
- [Context Management Guide](../ai-workflows/CONTEXT_MANAGEMENT.md) - Comprehensive guide

### Quick Context Summary Template

When starting a new AI session on this project:

```json
{
  "project": "SimCity Three.js Clone",
  "repository": "https://github.com/sergeville/simcity-threejs-clone",
  "tech_stack": ["Three.js", "Vite", "JavaScript (ES6+)"],
  "architecture": "Service-based with module composition",
  "key_files": [
    "src/scripts/game.js - Main game loop and rendering",
    "src/scripts/sim/city.js - City data model",
    "src/scripts/sim/services/ - City-wide systems",
    "CLAUDE.md - Project architecture guide"
  ],
  "current_task": "[Describe what you're working on]",
  "recent_changes": "[What was just modified]",
  "next_steps": "[What needs to be done next]"
}
```

Paste this JSON at the start of a new session with updated values.

## Contributing with AI

### Do's ✅
- Read CLAUDE.md before generating code
- Follow existing architectural patterns
- Update documentation when adding features
- Test AI-generated code thoroughly
- Review AI suggestions critically - AI makes mistakes
- Ask AI to explain its reasoning
- Iterate on AI suggestions rather than accepting first draft
- Use AI for boilerplate but verify logic
- Update CLAUDE.md when patterns change

### Don'ts ❌
- Blindly accept all AI suggestions without review
- Skip testing AI-generated code
- Ignore existing code style and conventions
- Forget to update documentation (especially CLAUDE.md)
- Over-complicate simple tasks with AI
- Let AI add unnecessary abstractions
- Use AI to fix issues without understanding them
- Generate code without reading existing implementations first

## Troubleshooting AI Issues

### Problem: AI generates code that doesn't follow project patterns

**Solution**:
1. Reference CLAUDE.md explicitly: "Following the pattern in CLAUDE.md..."
2. Show example code: "Like this example from hospital.js..."
3. Specify which service/module to follow: "Using the same pattern as DisasterService..."

### Problem: AI forgets project context mid-session

**Solution**:
1. Remind it: "Remember: this project uses a service-based architecture..."
2. Reference key files: "Check the pattern in src/scripts/sim/city.js..."
3. Use context compression from the [Context Management guide](../ai-workflows/CONTEXT_MANAGEMENT.md)
4. Start a new session with a summary if context is truly lost

### Problem: AI suggests outdated or conflicting patterns

**Solution**:
1. Check if CLAUDE.md is current
2. Update CLAUDE.md with correct pattern
3. Explicitly state which pattern to use: "Use the NEW pattern from..."
4. Provide git commit hash for recent changes: "After commit abc1234..."

### Problem: AI-generated code has bugs

**Solution**:
1. This is normal - AI makes mistakes
2. Test thoroughly before committing
3. Use browser console for debugging
4. Ask AI to explain its logic
5. Provide error messages back to AI for fixes
6. Sometimes manually fixing is faster than asking AI

## Real Examples from This Project

### Example 1: Disaster System

**Original request**:
```
Add a disaster system with fires, floods, and power outages.
Fires should spread, have visual effects, and damage buildings.
```

**AI approach**:
1. Read CLAUDE.md to understand service architecture
2. Created DisasterService extending SimService
3. Implemented disaster classes (Fire, Flood, PowerOutage)
4. Created VisualEffectsService for particle effects
5. Integrated with existing systems (hospitals, fire stations)
6. Added UI controls for difficulty
7. Created comprehensive documentation

**Files created**:
- `src/scripts/sim/services/disasterService.js` - Main disaster logic
- `src/scripts/sim/services/visualEffectsService.js` - Visual effects
- `docs/features/disasters.md` - Feature documentation

### Example 2: Hospital Repair Mechanic

**Original request**:
```
Hospitals should repair damaged buildings within their service radius
```

**AI approach**:
1. Examined existing Hospital class
2. Added `repairBuildings()` method
3. Used existing service radius system
4. Integrated with damage state from disaster system
5. Added activity feed notifications
6. Updated hospital simulation loop

**Result**: 15 lines of code following existing patterns perfectly

## Learning Resources

- [Context Management](../ai-workflows/CONTEXT_MANAGEMENT.md) - Comprehensive AI context optimization guide
- [CLAUDE.md](../../CLAUDE.md) - Project architecture and patterns
- [Architecture Docs](../architecture/) - Technical implementation details
- [Disaster System](../features/disasters.md) - Example of well-documented feature

## Questions?

If you have questions about AI-assisted development on this project:

1. **Check CLAUDE.md first** - Most architecture questions answered there
2. **Review this guide** - Common patterns and workflows documented here
3. **Look at recent commits** - See examples of AI-generated code
4. **Check existing implementations** - Best pattern reference
5. **Ask in GitHub Discussions** - Community can help
6. **Open an issue** - For specific problems

## Philosophy

This project embraces AI as a **co-pilot, not an autopilot**:

- AI excels at: Boilerplate, patterns, refactoring, documentation
- Humans excel at: Design decisions, testing, debugging, creativity
- Together: Faster development, better documentation, cleaner code

The key is **critical review** - always understand what AI generates and why.

---

**Last Updated**: 2026-01-13
**Maintained By**: Project contributors
**AI Tools Used**: Claude Code (primary), GitHub Copilot (supplementary)
