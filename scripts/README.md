# Development Scripts

This folder contains development helper scripts for managing the SimCity Three.js Clone development environment.

## Prerequisites

- **Node.js**: v16 or higher
- **npm**: Installed with Node.js
- **lsof**: Usually pre-installed on macOS/Linux (used to check port availability)

## Contents

### sim.sh - Development Server Manager

A comprehensive bash script for managing the Vite development server with background process control and logging.

#### Commands

**Start the development server:**
```bash
./scripts/sim.sh start
```
**Expected output:**
```
Starting SimCity Clone on port 3000...
Server started in background. Visit http://127.0.0.1:3000/simcity-threejs-clone/
Use './sim.sh status' to check if it's running.
Use './sim.sh stop' to stop the server.
```

**Check server status:**
```bash
./scripts/sim.sh status
```
**Expected output (when running):**
```
COMMAND   PID        USER   FD   TYPE             DEVICE SIZE/OFF NODE NAME
node    12345 yourusername   21u  IPv4 0x1234567890abcdef      0t0  TCP *:3000 (LISTEN)
```
**Expected output (when stopped):**
```
Service is not running.
```

**Stop the server:**
```bash
./scripts/sim.sh stop
```
**Expected output:**
```
Searching for SimCity process on port 3000...
SimCity service (PID 12345) has been shut down.
```

**Restart the server:**
```bash
./scripts/sim.sh restart
```
**Expected output:**
```
Restarting SimCity Clone...
Searching for SimCity process on port 3000...
SimCity service (PID 12345) has been shut down.
Starting SimCity Clone on port 3000...
Server started in background. Visit http://127.0.0.1:3000/simcity-threejs-clone/
```

**Clean up (stop server and remove logs):**
```bash
./scripts/sim.sh clean
```
**Expected output:**
```
Cleaning up...
Searching for SimCity process on port 3000...
SimCity service (PID 12345) has been shut down.
Removed log file: sim.log
Cleanup complete.
```

#### Features

- **Duplicate Prevention**: Automatically detects if server is already running on port 3000
- **Background Execution**: Server runs in background, freeing up your terminal
- **Automatic Logging**: All server output saved to `logs/sim.log`
- **Graceful Shutdown**: Properly terminates server process
- **Port Management**: Uses `lsof` to track and manage port 3000

#### Log File

Server output is logged to:
```
logs/sim.log
```

**View live logs:**
```bash
tail -f logs/sim.log
```

**Search logs for errors:**
```bash
grep -i error logs/sim.log
```

**View last 50 lines:**
```bash
tail -50 logs/sim.log
```

#### Configuration

The script uses these configurable variables (edit `sim.sh` to change):

```bash
PORT=3000           # Port for development server
LOG_FILE="sim.log"  # Log file name (saved in logs/ directory)
```

## Common Workflows

### Daily Development

```bash
# Morning: Start the server
./scripts/sim.sh start

# Open http://127.0.0.1:3000/simcity-threejs-clone/ in browser
# Make code changes (server auto-reloads)

# Check if server is still running
./scripts/sim.sh status

# Evening: Stop the server
./scripts/sim.sh stop
```

### After Code Changes

If the server seems stuck or not updating:

```bash
# Quick restart
./scripts/sim.sh restart
```

### Clean Slate

If experiencing issues:

```bash
# Stop everything and clear logs
./scripts/sim.sh clean

# Start fresh
./scripts/sim.sh start
```

### Checking for Errors

```bash
# Start server
./scripts/sim.sh start

# In another terminal, watch logs
tail -f logs/sim.log

# Look for error messages or warnings
```

## Troubleshooting

### "ERROR: SimCity Clone is already running on port 3000!"

**Cause:** Server is already running.

**Solution:**
```bash
# Option 1: Stop first, then start
./scripts/sim.sh stop
./scripts/sim.sh start

# Option 2: Use restart
./scripts/sim.sh restart
```

### Port 3000 is in use by another application

**Cause:** Another app (not our server) is using port 3000.

**Solution:**
```bash
# Find what's using the port
lsof -i :3000

# Kill the process manually
kill -9 <PID>

# Or change the port in sim.sh
# Edit: PORT=3001
```

### Server won't start

**Cause:** Missing dependencies or npm errors.

**Solution:**
```bash
# Check logs for details
cat logs/sim.log

# Reinstall dependencies
npm install

# Try starting again
./scripts/sim.sh start
```

### Permission denied when running script

**Cause:** Script lacks execute permissions.

**Solution:**
```bash
chmod +x scripts/sim.sh
./scripts/sim.sh start
```

## Adding New Scripts

When creating new development scripts:

1. **Add to this folder:**
   ```bash
   touch scripts/your-script.sh
   ```

2. **Make executable:**
   ```bash
   chmod +x scripts/your-script.sh
   ```

3. **Add shebang and comments:**
   ```bash
   #!/bin/bash
   # Description: What this script does
   # Usage: ./scripts/your-script.sh [arguments]
   ```

4. **Document in this README:**
   - Add section describing the script
   - Include usage examples
   - Show expected output
   - Add to troubleshooting if needed

5. **Use consistent patterns:**
   - Naming: kebab-case.sh
   - Include help text for invalid arguments
   - Check prerequisites before running
   - Provide clear error messages
   - Exit with appropriate codes (0=success, 1=error)

## Shell Aliases for Quick Access

For even faster access, you can create shell aliases to run sim.sh commands from anywhere on your system.

### Setup Instructions

#### For Bash Users

1. **Open your bash configuration file:**
   ```bash
   nano ~/.bashrc
   # or on macOS:
   nano ~/.bash_profile
   ```

2. **Add the following aliases** (replace `[project-path]` with your actual project location):
   ```bash
   # SimCity Project Management Aliases
   alias simStart='(cd [project-path]/simcity-threejs-clone && ./scripts/sim.sh start)'
   alias simStop='(cd [project-path]/simcity-threejs-clone && ./scripts/sim.sh stop)'
   alias simRestart='(cd [project-path]/simcity-threejs-clone && ./scripts/sim.sh restart)'
   alias simStatus='(cd [project-path]/simcity-threejs-clone && ./scripts/sim.sh status)'
   alias simClean='(cd [project-path]/simcity-threejs-clone && ./scripts/sim.sh clean)'
   alias simLogs='tail -f [project-path]/simcity-threejs-clone/logs/sim.log'
   ```

   **Example:** If your project is at `/Users/john/Documents/simcity-threejs-clone`, use:
   ```bash
   alias simStart='(cd /Users/john/Documents/simcity-threejs-clone && ./scripts/sim.sh start)'
   ```

3. **Reload your shell configuration:**
   ```bash
   source ~/.bashrc
   # or on macOS:
   source ~/.bash_profile
   ```

#### For Zsh Users (macOS default)

1. **Open your zsh configuration file:**
   ```bash
   nano ~/.zshrc
   ```

2. **Add the same aliases** (replace `[project-path]` with your actual project location):
   ```bash
   # SimCity Project Management Aliases
   alias simStart='(cd [project-path]/simcity-threejs-clone && ./scripts/sim.sh start)'
   alias simStop='(cd [project-path]/simcity-threejs-clone && ./scripts/sim.sh stop)'
   alias simRestart='(cd [project-path]/simcity-threejs-clone && ./scripts/sim.sh restart)'
   alias simStatus='(cd [project-path]/simcity-threejs-clone && ./scripts/sim.sh status)'
   alias simClean='(cd [project-path]/simcity-threejs-clone && ./scripts/sim.sh clean)'
   alias simLogs='tail -f [project-path]/simcity-threejs-clone/logs/sim.log'
   ```

   **Example:** If your project is at `/Users/john/Documents/simcity-threejs-clone`, use:
   ```bash
   alias simStart='(cd /Users/john/Documents/simcity-threejs-clone && ./scripts/sim.sh start)'
   ```

3. **Reload your shell configuration:**
   ```bash
   source ~/.zshrc
   ```

### Finding Your Project Path

If you're not sure of the exact path, navigate to the project directory and run:

```bash
pwd
```

Copy the output and replace the path in the aliases above.

### Usage After Setup

Once aliases are configured, you can manage the server from anywhere:

```bash
# From any directory:
simStart       # Start the development server
simStatus      # Check server status
simLogs        # Watch logs in real-time (Ctrl+C to exit)
simRestart     # Restart the server
simStop        # Stop the server
simClean       # Stop and clean logs
```

**Example workflow:**
```bash
~ $ simStart
Starting SimCity Clone on port 3000...
Server started in background. Visit http://127.0.0.1:3000/simcity-threejs-clone/

~ $ simStatus
COMMAND   PID   USER   FD   TYPE   DEVICE   SIZE/OFF NODE NAME
node    12345  user   21u  IPv4  0x123...      0t0  TCP *:3000 (LISTEN)

~ $ cd ~/Desktop
~/Desktop $ simLogs
# Watching logs from anywhere...

~/Desktop $ simStop
Searching for SimCity process on port 3000...
SimCity service (PID 12345) has been shut down.
```

### Benefits of Using Aliases

- ✅ **Work from any directory** - No need to cd into project folder
- ✅ **Shorter commands** - Type `simStart` instead of `./scripts/sim.sh start`
- ✅ **Watch logs easily** - `simLogs` is much shorter than the full tail command
- ✅ **Consistent workflow** - Same commands work regardless of current directory

## GitHub Issues Management Scripts

A suite of interactive CLI agents for managing GitHub Issues directly from your terminal. These scripts provide a guided, user-friendly way to create, search, and manage issues without leaving the command line.

### Prerequisites

- **GitHub CLI (gh)**: Required for all issue management scripts
  - Installation: https://cli.github.com/
  - macOS: `brew install gh`
  - Linux: See https://github.com/cli/cli/blob/trunk/docs/install_linux.md
- **Authentication**: Run `gh auth login` before first use

### issue.sh - Main Issues Manager

The central hub for all GitHub Issues operations. Provides an interactive menu-driven interface.

**Start the issues manager:**
```bash
./scripts/issue.sh
```

**Features:**
- 🐛 Report bugs with guided prompts
- 💡 Request features with templates
- 🔍 Search existing issues
- 📋 View and manage specific issues
- 📊 Browse by component, priority, or status
- Automatic duplicate detection before submission

**Expected Interface:**
```
╔═══════════════════════════════════════════════════════╗
║           GitHub Issues Manager v1.0                  ║
║           SimCity Three.js Clone                      ║
╚═══════════════════════════════════════════════════════╝

Repository Status:
  📂 Open Issues: 15
  🔨 In Progress: 3

╔════════════════════════════════════════════════════╗
║                 MAIN MENU                          ║
╚════════════════════════════════════════════════════╝

Create:
  1) 🐛 Report a Bug
  2) 💡 Request a Feature

Browse:
  3) 🔍 Search Issues
  4) 📋 View Specific Issue
  ...
```

### issue-bug.sh - Bug Report Agent

Interactive bug reporting with automatic duplicate detection.

**Create a bug report:**
```bash
./scripts/issue-bug.sh
```

**Workflow:**
1. Enter bug title
2. Automatic search for duplicates
3. Describe the bug (what vs expected)
4. Provide reproduction steps
5. Paste console errors (optional)
6. Select priority (critical/high/medium/low)
7. Preview and confirm
8. Issue created with labels

**Example Session:**
```bash
$ ./scripts/issue-bug.sh

╔════════════════════════════════════════╗
║    🐛 Bug Report Agent                 ║
╚════════════════════════════════════════╝

Step 1/6: What's the bug?
Bug title: Buildings disappear after loading

Step 2/6: Checking for duplicates...
✓ No obvious duplicates found

Step 3/6: Describe the bug
What's happening vs what should happen?
---
All buildings disappear when I load a saved city
^D

Step 4/6: Steps to reproduce
1. Build several residential buildings
2. Save game
3. Refresh page
4. Load save
5. Buildings are gone
^Enter

Step 5/6: Console errors (optional)
TypeError: building.setMesh is not a function
^D

Step 6/6: How severe is this bug?
1) Critical - Game crashes
Select priority: 1

✓ Bug report created successfully!
Issue URL: https://github.com/sergeville/simcity-threejs-clone/issues/42
```

### issue-feature.sh - Feature Request Agent

Interactive feature request creation with duplicate checking.

**Request a feature:**
```bash
./scripts/issue-feature.sh
```

**Workflow:**
1. Enter feature title
2. Automatic duplicate search
3. Describe what and why
4. Explain how it should work
5. Select affected components
6. Preview and confirm
7. Issue created with labels

**Example Session:**
```bash
$ ./scripts/issue-feature.sh

╔════════════════════════════════════════╗
║    💡 Feature Request Agent            ║
╚════════════════════════════════════════╝

Step 1/5: What feature do you want?
Feature title: Add subway transit system

Step 2/5: Checking for duplicates...
✓ No obvious duplicates found

Step 3/5: Describe your feature
Large cities need underground rail transit
^D

Step 4/5: How should it work?
- New building: Subway Station ($50k)
- Underground tunnels
- Reduces traffic by 40%
^D

Step 5/5: Which parts of the game does this affect?
1) UI/Interface  2) Simulation  3) Economy  ...
Select components: 2 6

✓ Feature request created successfully!
```

### issue-search.sh - Issue Search Agent

Interactive search interface with multiple search modes.

**Search for issues:**
```bash
./scripts/issue-search.sh
```

**Search Options:**
1. **Search by keywords** - Find issues matching text
2. **Browse by component** - Filter by UI, simulation, economy, etc.
3. **Browse by priority** - Critical, high, medium, low
4. **Show recent issues** - Latest 10 issues
5. **Show in progress** - What's being worked on

**Example Session:**
```bash
$ ./scripts/issue-search.sh

╔════════════════════════════════════════╗
║    🔍 Issue Search Agent               ║
╚════════════════════════════════════════╝

How do you want to search?
1) Search by keywords
2) Browse by component
3) Browse by priority
Select option: 1

Enter search keywords: save crash

Showing both open AND closed issues...

#42  [BUG] Buildings disappear after loading    (Open)  bug,critical,save-load
#12  [BUG] Save file corruption with 1000+ cit  (Closed) bug,high,save-load
```

### issue-view.sh - Issue View & Management Agent

View details and perform actions on specific issues.

**View an issue:**
```bash
./scripts/issue-view.sh 42
# or run without number for interactive prompt
./scripts/issue-view.sh
```

**Available Actions:**
1. Add a comment
2. Close the issue
3. Reopen the issue
4. Add labels
5. Mark as "in progress"
6. View in browser

**Example Session:**
```bash
$ ./scripts/issue-view.sh 42

Loading issue #42...

[BUG] Buildings disappear after loading save file

  All buildings disappear when loading a saved city...

  Labels: bug, critical, save-load
  State: Open
  Created: 2 days ago

What would you like to do?
1) Add a comment
2) Close this issue
5) Mark as 'in progress'
Select option: 5

✓ Marked as 'in progress'
Suggested command:
  git checkout -b fix/issue-42
```

### Shell Aliases for Issue Management

Add these to your `~/.bashrc` or `~/.zshrc` for quick access:

```bash
# GitHub Issues Management Aliases
alias simIssue='(cd [project-path]/simcity-threejs-clone && ./scripts/issue.sh)'
alias simBug='(cd [project-path]/simcity-threejs-clone && ./scripts/issue-bug.sh)'
alias simFeature='(cd [project-path]/simcity-threejs-clone && ./scripts/issue-feature.sh)'
alias simSearch='(cd [project-path]/simcity-threejs-clone && ./scripts/issue-search.sh)'
```

**Example:** Replace `[project-path]` with your actual project path:
```bash
alias simIssue='(cd /Users/john/Documents/simcity-threejs-clone && ./scripts/issue.sh)'
```

**Usage after setup:**
```bash
simIssue      # Open main issues manager
simBug        # Quick bug report
simFeature    # Quick feature request
simSearch     # Search issues
```

### Workflow Integration

**Typical Development Workflow:**

1. **Find or report a bug:**
   ```bash
   simIssue     # Open issues manager
   # Select option 1 (Report a Bug)
   # Issue #42 created
   ```

2. **Start working on it:**
   ```bash
   simIssue     # Open issues manager
   # Select option 4 (View Specific Issue)
   # Enter issue number: 42
   # Select option 5 (Mark as in progress)

   # Create branch
   git checkout -b fix/issue-42
   ```

3. **Make changes and commit:**
   ```bash
   # Make your code changes
   git add .
   git commit -m "Fix building mesh restoration - Fixes #42"
   git push origin fix/issue-42
   ```

4. **Issue auto-closes when PR merges** (if you used "Fixes #42" in commit)

### implement-issue.sh - Issue to Agent Converter

**Convert GitHub issues into AI agent implementation prompts.**

This tool fetches a GitHub issue and generates a comprehensive prompt that AI agents (like Claude Code) can use to implement features or fix bugs.

**Generate implementation prompt:**
```bash
./scripts/implement-issue.sh 1
# Or interactive mode:
./scripts/implement-issue.sh
```

**What it does:**
1. Fetches issue from GitHub (#1, #2, etc.)
2. Analyzes issue type (feature vs bug)
3. Generates detailed implementation prompt with:
   - Complete issue description
   - Step-by-step implementation guide
   - Project architecture context
   - Code patterns to follow
   - Testing checklist
   - Commit message templates
   - Success criteria

**Interactive menu:**
```
What would you like to do?
1) View the prompt
2) Copy prompt to clipboard    ← Paste into Claude Code
3) Save prompt to file
4) Open prompt in editor
5) Send to Claude Code agent
```

**Example workflow:**
```bash
# Create a feature issue
./scripts/quick-feature.sh "Add weather system"
# Creates issue #4

# Generate implementation prompt
./scripts/implement-issue.sh 4
# Select option 2 (copy to clipboard)

# Paste into Claude Code
# Agent reads prompt and implements feature automatically
# Following all project guidelines and patterns

# Agent commits with: "Add weather system - Fixes #4"
# Issue auto-closes when pushed
```

**Generated prompt includes:**
- ✅ Issue summary and full description
- ✅ Type-specific instructions (feature vs bug)
- ✅ 7-step implementation workflow
- ✅ Project architecture context (CLAUDE.md reference)
- ✅ Code patterns (SimService, Building, etc.)
- ✅ Files to read for context
- ✅ Testing guidelines
- ✅ Commit message templates with issue reference
- ✅ Success criteria checklist

**For features:**
- Instructions to use EnterPlanMode for complex features
- Search existing code patterns
- Follow project architecture
- Integration guidelines
- Testing requirements

**For bugs:**
- Root cause analysis approach
- Debugging steps
- Fix verification checklist
- Regression testing guidelines
- RESOLVED_ISSUES.md update instructions

**Full documentation:**
See [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) for complete usage guide, examples, and workflow integration.

**Benefits:**
- ✅ AI agents get complete context
- ✅ Follow project patterns automatically
- ✅ Proper commit messages
- ✅ Comprehensive testing
- ✅ Documentation updates included
- ✅ Issues auto-close on completion

### Benefits of CLI Issue Management

- ✅ **Never leave terminal** - Full GitHub Issues workflow from CLI
- ✅ **Guided process** - Interactive prompts prevent missing info
- ✅ **Duplicate detection** - Automatic search before creating
- ✅ **Quick access** - Aliases work from any directory
- ✅ **Rich formatting** - Colorful, easy-to-read output
- ✅ **Faster workflow** - No browser tab switching needed

## Alternative: Direct npm Commands

You can also run the dev server directly without using the script:

```bash
# Standard development (foreground)
npm run dev

# Specify port
npm run dev -- --port 3000

# Production build
npm run build

# Preview production build
npm run preview
```

The `sim.sh` script is a convenience wrapper that adds background execution, logging, and process management.

---

**Last Updated**: 2026-01-13
**Maintainer**: Project contributors
**License**: MIT (same as main project)
