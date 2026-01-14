#!/bin/bash

# Issue Implementation Agent
# Converts GitHub issues into prompts for Claude Code agent

set -e

REPO="sergeville/simcity-threejs-clone"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║    🤖 Issue Implementation Agent               ║${NC}"
echo -e "${CYAN}║    Convert GitHub Issues → Agent Prompts       ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════╝${NC}"
echo ""

# Check if gh CLI is available
if ! command -v gh &> /dev/null; then
    echo -e "${RED}Error: GitHub CLI (gh) is not installed.${NC}"
    echo "Install it from: https://cli.github.com/"
    exit 1
fi

# Check authentication
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}Please authenticate first: gh auth login${NC}"
    exit 1
fi

# Get issue number
if [ -z "$1" ]; then
    echo -e "${YELLOW}Available issues:${NC}"
    gh issue list --repo "$REPO" --limit 10
    echo ""
    read -p "Enter issue number to implement: " ISSUE_NUMBER
else
    ISSUE_NUMBER=$1
fi

if [ -z "$ISSUE_NUMBER" ]; then
    echo -e "${RED}Error: Issue number required${NC}"
    exit 1
fi

# Fetch issue details
echo -e "${BLUE}Fetching issue #$ISSUE_NUMBER...${NC}"
ISSUE_JSON=$(gh issue view "$ISSUE_NUMBER" --repo "$REPO" --json title,body,labels,state)

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Could not fetch issue #$ISSUE_NUMBER${NC}"
    exit 1
fi

# Parse issue data
TITLE=$(echo "$ISSUE_JSON" | jq -r '.title')
BODY=$(echo "$ISSUE_JSON" | jq -r '.body')
STATE=$(echo "$ISSUE_JSON" | jq -r '.state')
LABELS=$(echo "$ISSUE_JSON" | jq -r '.labels[].name' | tr '\n' ',' | sed 's/,$//')

# Check if issue is open
if [ "$STATE" != "OPEN" ]; then
    echo -e "${YELLOW}Warning: Issue #$ISSUE_NUMBER is $STATE${NC}"
    read -p "Continue anyway? (y/n): " CONTINUE
    if [[ ! "$CONTINUE" =~ ^[Yy]$ ]]; then
        exit 0
    fi
fi

# Determine issue type
IS_FEATURE=false
IS_BUG=false

if [[ "$TITLE" =~ \[FEATURE\] ]] || [[ "$LABELS" =~ enhancement ]]; then
    IS_FEATURE=true
fi

if [[ "$TITLE" =~ \[BUG\] ]] || [[ "$LABELS" =~ bug ]]; then
    IS_BUG=true
fi

echo ""
echo -e "${GREEN}Issue Details:${NC}"
echo -e "${BLUE}Title:${NC} $TITLE"
echo -e "${BLUE}Type:${NC} $(if $IS_FEATURE; then echo 'Feature'; elif $IS_BUG; then echo 'Bug'; else echo 'Other'; fi)"
echo -e "${BLUE}Labels:${NC} $LABELS"
echo -e "${BLUE}State:${NC} $STATE"
echo ""

# Generate prompt file
PROMPT_FILE="/tmp/issue-${ISSUE_NUMBER}-prompt.md"

echo -e "${YELLOW}Generating agent prompt...${NC}"

cat > "$PROMPT_FILE" << EOF
# Implementation Request: Issue #${ISSUE_NUMBER}

**GitHub Issue:** https://github.com/${REPO}/issues/${ISSUE_NUMBER}

---

## Issue Summary

**Title:** ${TITLE}

**Type:** $(if $IS_FEATURE; then echo 'Feature Implementation'; elif $IS_BUG; then echo 'Bug Fix'; else echo 'Task'; fi)

**Labels:** ${LABELS}

---

## Issue Description

${BODY}

---

## Implementation Instructions

EOF

# Add type-specific instructions
if $IS_FEATURE; then
    cat >> "$PROMPT_FILE" << 'EOF'
### Your Task: Implement This Feature

Please implement the feature described above following these steps:

1. **Plan the Implementation**
   - Read the feature description carefully
   - Identify all affected files and systems
   - Consider technical approach and architecture
   - Use EnterPlanMode if this is a complex feature requiring design

2. **Search Existing Code**
   - Use Grep/Glob to find relevant files
   - Understand existing patterns and conventions
   - Check for similar implementations

3. **Implement the Feature**
   - Create new files or modify existing ones
   - Follow the project's code style (see CLAUDE.md)
   - Add comments where necessary
   - Ensure integration with existing systems

4. **Test the Implementation**
   - Verify the feature works as described
   - Test edge cases
   - Check for conflicts with existing features
   - Run the dev server and test manually

5. **Update Documentation**
   - Update CLAUDE.md if architecture changed
   - Add comments to complex code
   - Create/update feature documentation if needed

6. **Mark Issue as In Progress**
   - Add "in progress" label to the issue
   - Update issue with progress notes if needed

7. **Commit and Reference Issue**
   - Make clear, descriptive commits
   - Reference the issue in commit messages:
     ```
     git commit -m "Implement [feature name] - Part of #ISSUE_NUMBER"
     ```
   - When complete:
     ```
     git commit -m "Complete [feature name] - Fixes #ISSUE_NUMBER"
     ```

### Important Notes

- Follow existing code patterns in the repository
- The project uses Three.js for 3D rendering
- Simulation logic is in `src/scripts/sim/`
- UI components are in HTML/CSS with vanilla JS
- Check `src/scripts/config.js` for configuration options
- Use the SimService pattern for city-wide features
- Use the Building pattern for placeable objects

### Before You Start

Read these files for context:
- `CLAUDE.md` - Project architecture overview
- `src/scripts/sim/city.js` - City data model
- Related files mentioned in the issue

### Questions to Consider

- Does this feature integrate with existing systems?
- Are there similar features already implemented?
- What edge cases need handling?
- Does this affect the save/load system?
EOF

elif $IS_BUG; then
    cat >> "$PROMPT_FILE" << 'EOF'
### Your Task: Fix This Bug

Please fix the bug described above following these steps:

1. **Understand the Bug**
   - Read the bug description and reproduction steps
   - Identify the expected vs actual behavior
   - Review any console errors or stack traces

2. **Locate the Problem**
   - Use Grep to search for relevant code
   - Trace the execution path
   - Identify the root cause

3. **Implement the Fix**
   - Fix the underlying issue (not just symptoms)
   - Consider edge cases and side effects
   - Ensure the fix doesn't break other features

4. **Test the Fix**
   - Follow reproduction steps to verify fix
   - Test related functionality
   - Check for regressions

5. **Update Documentation**
   - Add code comments explaining the fix
   - Update RESOLVED_ISSUES.md with the solution

6. **Mark Issue as In Progress**
   - Add "in progress" label to the issue

7. **Commit and Reference Issue**
   - Clear commit message explaining the fix:
     ```
     git commit -m "Fix [bug description] - Fixes #ISSUE_NUMBER

     Root cause: [explanation]
     Solution: [what you changed]
     "
     ```

### Important Notes

- Fix the root cause, not just symptoms
- Consider why the bug wasn't caught earlier
- Add defensive code if appropriate
- Test thoroughly before committing

### Before You Start

- Check if this bug is mentioned in RESOLVED_ISSUES.md
- Look for similar bugs in closed issues
- Understand the affected system's architecture
EOF

else
    cat >> "$PROMPT_FILE" << 'EOF'
### Your Task: Complete This Task

Please complete the task described in the issue above.

Follow standard development workflow:
1. Understand the requirement
2. Plan the approach
3. Implement the solution
4. Test thoroughly
5. Document changes
6. Commit with issue reference

Reference the issue in commits:
```
git commit -m "Complete [task] - Fixes #ISSUE_NUMBER"
```
EOF
fi

# Add common footer
cat >> "$PROMPT_FILE" << EOF

---

## Project Context

**Repository:** simcity-threejs-clone
**Technology:** Three.js, Vite, Vanilla JavaScript
**Architecture:** See CLAUDE.md for complete architecture documentation

**Key Files:**
- \`src/scripts/game.js\` - Main game engine
- \`src/scripts/sim/city.js\` - City data model
- \`src/scripts/sim/buildings/\` - Building types
- \`src/scripts/sim/services/\` - City services
- \`src/scripts/config.js\` - Configuration

**Commands:**
- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production

---

## Success Criteria

✅ Feature/fix implemented as described
✅ Code follows project conventions
✅ No new bugs introduced
✅ Testing completed
✅ Documentation updated
✅ Commits reference issue #${ISSUE_NUMBER}
✅ Issue can be closed when complete

---

**Ready to implement!** Start by reading the issue description carefully and planning your approach.
EOF

echo -e "${GREEN}✓ Prompt generated!${NC}"
echo ""
echo -e "${BLUE}Prompt saved to:${NC} $PROMPT_FILE"
echo ""

# Show options
echo -e "${CYAN}What would you like to do?${NC}"
echo "1) View the prompt"
echo "2) Copy prompt to clipboard"
echo "3) Save prompt to file"
echo "4) Open prompt in editor"
echo "5) Send to Claude Code agent"
echo "0) Exit"
echo ""
read -p "Select option: " OPTION

case $OPTION in
    1)
        # View prompt
        if command -v bat &> /dev/null; then
            bat "$PROMPT_FILE"
        else
            cat "$PROMPT_FILE"
        fi
        ;;

    2)
        # Copy to clipboard
        if command -v pbcopy &> /dev/null; then
            cat "$PROMPT_FILE" | pbcopy
            echo -e "${GREEN}✓ Prompt copied to clipboard!${NC}"
        elif command -v xclip &> /dev/null; then
            cat "$PROMPT_FILE" | xclip -selection clipboard
            echo -e "${GREEN}✓ Prompt copied to clipboard!${NC}"
        else
            echo -e "${YELLOW}Clipboard tool not found. Install pbcopy (macOS) or xclip (Linux)${NC}"
        fi
        ;;

    3)
        # Save to custom file
        read -p "Enter filename (e.g., implement-issue-${ISSUE_NUMBER}.md): " CUSTOM_FILE
        if [ -z "$CUSTOM_FILE" ]; then
            CUSTOM_FILE="implement-issue-${ISSUE_NUMBER}.md"
        fi
        cp "$PROMPT_FILE" "$CUSTOM_FILE"
        echo -e "${GREEN}✓ Prompt saved to: $CUSTOM_FILE${NC}"
        ;;

    4)
        # Open in editor
        if [ -n "$EDITOR" ]; then
            $EDITOR "$PROMPT_FILE"
        elif command -v code &> /dev/null; then
            code "$PROMPT_FILE"
        elif command -v vim &> /dev/null; then
            vim "$PROMPT_FILE"
        else
            echo -e "${YELLOW}No editor found. Set \$EDITOR or install VS Code${NC}"
        fi
        ;;

    5)
        # Send to agent (this would be custom integration)
        echo -e "${BLUE}Agent Integration:${NC}"
        echo ""
        echo "To use with Claude Code:"
        echo "1. Copy the prompt:"
        echo "   cat $PROMPT_FILE | pbcopy"
        echo ""
        echo "2. In Claude Code, paste the prompt and run"
        echo ""
        echo "Alternatively, create a new conversation and paste:"
        cat "$PROMPT_FILE"
        ;;

    0)
        echo "Goodbye!"
        exit 0
        ;;

    *)
        echo -e "${RED}Invalid option${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${CYAN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}Next Steps:${NC}"
echo ""
echo "1. Mark issue as in progress:"
echo "   ${BLUE}gh issue edit ${ISSUE_NUMBER} --add-label \"in progress\"${NC}"
echo ""
echo "2. Create implementation branch:"
echo "   ${BLUE}git checkout -b implement/issue-${ISSUE_NUMBER}${NC}"
echo ""
echo "3. Start implementing!"
echo ""
echo "4. When done, commit with:"
echo "   ${BLUE}git commit -m \"Implement [feature] - Fixes #${ISSUE_NUMBER}\"${NC}"
echo ""
echo -e "${CYAN}═══════════════════════════════════════${NC}"
