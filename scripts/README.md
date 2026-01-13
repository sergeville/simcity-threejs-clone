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
