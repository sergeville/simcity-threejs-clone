# Contributing to SimCity Clone

Thank you for your interest in contributing to the SimCity Three.js clone! This guide will help you get started.

## Table of Contents

- [Development Setup](#development-setup)
- [Code Style](#code-style)
- [Making Changes](#making-changes)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Testing](#testing)
- [Documentation](#documentation)
- [Feature Requests](#feature-requests)
- [Bug Reports](#bug-reports)

## Development Setup

### Prerequisites

- **Node.js** 16+ (18 recommended)
- **npm** or **yarn**
- **Git**
- Modern browser (Chrome, Firefox, Edge)

### Setup Steps

1. **Fork the repository** on GitHub

2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/simcity-threejs-clone.git
   cd simcity-threejs-clone
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Open in browser**:
   Navigate to http://127.0.0.1:3000/simcity-threejs-clone/

6. **Verify setup**:
   - City grid should render
   - No console errors
   - UI buttons work
   - You can place buildings

## Code Style

### JavaScript

- **ES6+** features preferred
- **Const over let**: Use `const` for variables that don't change
- **Arrow functions**: Prefer arrow functions for callbacks
- **Template literals**: Use backticks for string interpolation
- **Destructuring**: Use where it improves readability

**Example**:
```javascript
// Good
const getTile = (x, y) => {
  const { size } = this;
  return (x >= 0 && x < size) ? this.tiles[x][y] : null;
};

// Avoid
var getTile = function(x, y) {
  var size = this.size;
  if (x >= 0 && x < size) {
    return this.tiles[x][y];
  } else {
    return null;
  }
}
```

### JSDoc Comments

All classes and public methods should have JSDoc comments:

```javascript
/**
 * Manages disasters (fires, floods, power outages)
 */
export class DisasterService extends SimService {
  /**
   * Spawn a random disaster
   * @param {City} city - The city to affect
   */
  #spawnRandomDisaster(city) {
    // Implementation
  }
}
```

### Architecture

Follow these patterns (see [CLAUDE.md](../../CLAUDE.md) for details):

1. **Services** for city-wide systems (disasters, economy, power)
2. **Modules** for building components (power, residents, jobs)
3. **Two-phase updates**: `simulate()` for data, `refreshView()` for visuals
4. **Factory pattern** for building creation

## Making Changes

### 1. Create a Branch

Create a descriptive branch name:

```bash
git checkout -b feature/add-earthquake-disaster
git checkout -b fix/fire-spread-bug
git checkout -b docs/update-architecture-guide
```

**Naming convention**:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation only
- `refactor/` - Code refactoring
- `test/` - Adding tests

### 2. Make Your Changes

**Before coding**:
- Read [CLAUDE.md](../../CLAUDE.md) to understand project structure
- Check existing implementations for patterns
- Review related code in the same area

**While coding**:
- Follow existing code patterns
- Add JSDoc comments for new classes/methods
- Keep functions small and focused
- Use meaningful variable names
- Avoid magic numbers - use constants

**Example of a good change**:
```javascript
// src/scripts/sim/services/earthquakeService.js
import { SimService } from './simService.js';

/**
 * Manages earthquake disasters
 */
export class EarthquakeService extends SimService {
  /**
   * Shake intensity (0-10)
   * @type {number}
   */
  magnitude = 5;

  simulate(city) {
    // Clear implementation following existing patterns
  }
}
```

### 3. Test Your Changes

**Manual testing checklist**:
- [ ] Start dev server (`npm run dev`)
- [ ] Build a test city
- [ ] Trigger your new feature/fix
- [ ] Check browser console for errors
- [ ] Test edge cases
- [ ] Verify existing features still work
- [ ] Test on different browsers if possible

**Visual testing**:
- [ ] UI elements render correctly
- [ ] No visual glitches
- [ ] Performance is acceptable
- [ ] Responsive to user actions

### 4. Update Documentation

**Required updates**:
- **CLAUDE.md**: If you added new architectural patterns or services
- **Feature docs** (`docs/features/`): If you added game mechanics
- **This file**: If you changed contribution process
- **Code comments**: JSDoc for new public APIs

**Optional but appreciated**:
- Architecture docs if you changed core systems
- README.md if you changed setup process
- Screenshots for visual changes

### 5. Commit Your Changes

**Commit message format**:
```
Add earthquake disaster system

- Implement EarthquakeService following SimService pattern
- Add building damage based on magnitude
- Create visual shake effects
- Update disaster difficulty settings
- Add documentation to disasters.md

Co-Authored-By: Your Name <your.email@example.com>
```

**Good commit messages**:
- Use present tense: "Add feature" not "Added feature"
- First line: Brief summary (50 chars or less)
- Blank line, then detailed explanation if needed
- List what changed and why
- Mention breaking changes if any

**Commit**:
```bash
git add .
git commit -m "Your message here"
```

### 6. Push and Create Pull Request

```bash
git push origin feature/your-branch-name
```

Then create a pull request on GitHub.

## Pull Request Guidelines

### Title Format

Use clear, descriptive titles:
- ✅ "Add earthquake disaster with configurable magnitude"
- ✅ "Fix fire spread bug affecting diagonal buildings"
- ❌ "Update game"
- ❌ "Bug fix"

### Description Template

```markdown
## Summary
Brief description of what this PR does.

## Changes
- Bullet point list of changes
- Be specific about what was modified
- Mention any new files created

## Testing
How to test this PR:
1. Build a city
2. [Specific steps to trigger the change]
3. [Expected result]

## Screenshots
[If visual changes, include before/after screenshots]

## Related Issues
Fixes #123
Related to #456

## Checklist
- [ ] Code follows project style
- [ ] Documentation updated
- [ ] Manually tested
- [ ] No console errors
- [ ] CLAUDE.md updated (if architectural changes)
```

### Before Submitting

**Review checklist**:
- [ ] Code follows existing patterns
- [ ] JSDoc comments added
- [ ] No console errors or warnings
- [ ] Tested in browser
- [ ] Documentation updated
- [ ] Commit messages are clear
- [ ] Branch is up to date with main

## Testing

### Manual Testing Process

1. **Start fresh**:
   ```bash
   npm run dev
   ```

2. **Create test city**:
   - Place residential zones
   - Place roads
   - Add power plant and lines
   - Add service buildings

3. **Test your feature**:
   - Trigger the specific functionality
   - Test normal cases
   - Test edge cases (no power, no roads, etc.)
   - Test error conditions

4. **Verify no regressions**:
   - Existing features still work
   - No new console errors
   - Performance is acceptable

### What to Test

**For new features**:
- Feature works as intended
- UI updates correctly
- Activity feed notifications appear
- Integrates with existing systems
- Configurable parameters work
- Edge cases handled

**For bug fixes**:
- Bug no longer occurs
- Fix doesn't break other features
- Root cause addressed (not just symptom)

## Documentation

### When to Update Documentation

**Always update**:
- CLAUDE.md for new services, modules, or patterns
- Feature docs for new game mechanics
- This CONTRIBUTING.md for process changes

**When applicable**:
- Architecture docs for core system changes
- README.md for setup changes
- AI_ASSISTED_DEV.md for new AI patterns

### Documentation Standards

- Use **markdown** format
- Include **code examples** where helpful
- Add **links** to related docs
- Keep **table of contents** updated
- Use **clear headings** for navigation
- Add **diagrams** for complex systems (optional)

## Feature Requests

Have an idea for a new feature?

1. **Check existing issues** to avoid duplicates
2. **Open a new issue** with:
   - Clear, descriptive title
   - Detailed description of the feature
   - Use case / why it's valuable
   - Possible implementation approach (optional)
   - Mockups or examples (if visual)

**Good feature request template**:
```markdown
## Feature: [Name]

### Description
What the feature does and why it's useful.

### Use Case
How users would benefit from this feature.

### Implementation Ideas
- Possible approach 1
- Possible approach 2

### Examples
[Screenshots, links to similar features, etc.]
```

## Bug Reports

Found a bug? Help us fix it!

1. **Check existing issues** to avoid duplicates
2. **Open a new issue** with:
   - Clear, descriptive title
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Screenshots (for visual bugs)
   - Browser and OS info
   - Console errors (if any)

**Bug report template**:
```markdown
## Bug: [Title]

### Steps to Reproduce
1. Build a city
2. Place fire station at (5, 5)
3. Start a fire nearby
4. [Bug occurs]

### Expected Behavior
Fire station should reduce fire duration.

### Actual Behavior
Fire station has no effect on fire.

### Screenshots
[Attach screenshots if visual bug]

### Environment
- Browser: Chrome 120
- OS: macOS 14.1
- Version: main branch (commit abc1234)

### Console Errors
```
Error: Fire station not found
  at fire.js:234
```
```

## Code of Conduct

### Be Respectful
- Treat all contributors with respect
- Welcome newcomers
- Accept constructive criticism gracefully
- Give constructive feedback politely

### Be Constructive
- Focus on the code, not the person
- Explain your reasoning
- Suggest improvements, don't just criticize
- Help others learn

### Be Collaborative
- Ask questions before making assumptions
- Share knowledge and resources
- Give credit where due
- Help review other PRs

## Getting Help

**Questions about**:
- **Architecture**: Read [CLAUDE.md](../../CLAUDE.md)
- **Contributing**: This file
- **AI workflows**: [AI-Assisted Development](AI_ASSISTED_DEV.md)
- **Features**: [Features docs](../features/)

**Still need help?**:
- Search existing GitHub issues
- Open a new discussion
- Ask in pull request comments
- Open an issue for specific problems

## Recognition

Contributors are recognized in:
- Git commit history
- Pull request co-authors
- GitHub contributors page

All contributions are appreciated, whether code, documentation, bug reports, or feature ideas!

## Quick Start Checklist

**First time contributing?** Follow these steps:

- [ ] Fork repository
- [ ] Clone locally
- [ ] Run `npm install`
- [ ] Run `npm run dev`
- [ ] Read CLAUDE.md
- [ ] Find an issue to work on (look for "good first issue" label)
- [ ] Create a branch
- [ ] Make your changes
- [ ] Test thoroughly
- [ ] Update documentation
- [ ] Commit with clear message
- [ ] Push to your fork
- [ ] Create pull request
- [ ] Respond to review feedback

---

Thank you for contributing! 🎉

**Questions?** Open an issue or discussion on GitHub.

**Last Updated**: 2026-01-13
