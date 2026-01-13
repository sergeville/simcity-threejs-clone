#!/bin/bash

# Bug Report Agent
# Interactive script to create a bug report issue on GitHub

set -e

REPO="sergeville/simcity-threejs-clone"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║    🐛 Bug Report Agent                 ║${NC}"
echo -e "${BLUE}║    SimCity Three.js Clone             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}Error: GitHub CLI (gh) is not installed.${NC}"
    echo "Install it from: https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}You need to authenticate with GitHub CLI first.${NC}"
    echo "Run: gh auth login"
    exit 1
fi

echo -e "${YELLOW}This agent will help you create a bug report.${NC}"
echo -e "${YELLOW}I'll search for duplicates before submitting.${NC}"
echo ""

# Step 1: Get bug title
echo -e "${GREEN}Step 1/6: What's the bug?${NC}"
echo "Example: Buildings disappear after loading save file"
read -p "Bug title: " BUG_TITLE

if [ -z "$BUG_TITLE" ]; then
    echo -e "${RED}Error: Bug title cannot be empty${NC}"
    exit 1
fi

# Step 2: Search for duplicates
echo -e "\n${GREEN}Step 2/6: Checking for duplicates...${NC}"
echo "Searching existing issues for: $BUG_TITLE"

SEARCH_RESULTS=$(gh issue list --repo "$REPO" --search "$BUG_TITLE" --state all --limit 5 2>/dev/null || echo "")

if [ -n "$SEARCH_RESULTS" ]; then
    echo -e "${YELLOW}⚠️  Found potentially related issues:${NC}"
    echo "$SEARCH_RESULTS"
    echo ""
    read -p "Do any of these match your bug? (y/n): " IS_DUPLICATE

    if [[ "$IS_DUPLICATE" =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}Great! Please add a comment to one of the existing issues instead.${NC}"
        echo "You can view issues at: https://github.com/$REPO/issues"
        exit 0
    fi
else
    echo -e "${GREEN}✓ No obvious duplicates found${NC}"
fi

# Step 3: Get bug description
echo -e "\n${GREEN}Step 3/6: Describe the bug${NC}"
echo "What's happening vs what should happen?"
echo "(Press Ctrl+D when done, or Enter twice for empty)"
echo "---"

BUG_DESCRIPTION=""
while IFS= read -r line; do
    BUG_DESCRIPTION="${BUG_DESCRIPTION}${line}\n"
done

# Step 4: Get steps to reproduce
echo -e "\n${GREEN}Step 4/6: Steps to reproduce${NC}"
echo "How can we trigger this bug? (one step per line)"
echo "Example:"
echo "  1. Build several residential buildings"
echo "  2. Click Save button"
echo "  3. Refresh page"
echo "---"

STEPS=""
step_num=1
echo "Enter step $step_num (or press Enter to finish):"
while true; do
    read -p "$step_num. " step_line
    if [ -z "$step_line" ]; then
        break
    fi
    STEPS="${STEPS}${step_num}. ${step_line}\n"
    step_num=$((step_num + 1))
    echo "Enter step $step_num (or press Enter to finish):"
done

# Step 5: Get console errors
echo -e "\n${GREEN}Step 5/6: Console errors (optional)${NC}"
echo "Open browser console (F12) and paste any errors here"
echo "(Press Ctrl+D when done, or Enter for none)"
echo "---"

CONSOLE_ERRORS=""
while IFS= read -r line; do
    CONSOLE_ERRORS="${CONSOLE_ERRORS}${line}\n"
done

# Step 6: Select priority
echo -e "\n${GREEN}Step 6/6: How severe is this bug?${NC}"
echo "1) Critical - Game crashes, data loss, unplayable"
echo "2) High - Major feature broken"
echo "3) Medium - Feature partially broken"
echo "4) Low - Minor issue, polish"
read -p "Select priority (1-4): " PRIORITY

case $PRIORITY in
    1) PRIORITY_LABEL="critical" ;;
    2) PRIORITY_LABEL="high" ;;
    3) PRIORITY_LABEL="medium" ;;
    4) PRIORITY_LABEL="low" ;;
    *) PRIORITY_LABEL="medium" ;;
esac

# Build issue body
ISSUE_BODY="## Bug Description

${BUG_DESCRIPTION}

## Steps to Reproduce

${STEPS}

## Console Errors

\`\`\`
${CONSOLE_ERRORS}
\`\`\`

## Environment

- **Browser:** $(echo $BROWSER_VERSION 2>/dev/null || echo "Not specified")
- **OS:** $(uname -s)
- **Platform:** $(uname -m)

---

**Reported via Bug Report Agent**
"

# Show preview
echo -e "\n${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}Preview of your bug report:${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${YELLOW}Title:${NC} [BUG] $BUG_TITLE"
echo -e "${YELLOW}Labels:${NC} bug, $PRIORITY_LABEL"
echo ""
echo -e "$ISSUE_BODY"
echo -e "${BLUE}═══════════════════════════════════════${NC}"

read -p "Create this issue? (y/n): " CONFIRM

if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Issue creation cancelled.${NC}"
    exit 0
fi

# Create the issue
echo -e "\n${GREEN}Creating issue...${NC}"

ISSUE_URL=$(gh issue create \
    --repo "$REPO" \
    --title "[BUG] $BUG_TITLE" \
    --body "$ISSUE_BODY" \
    --label "bug,$PRIORITY_LABEL")

echo -e "${GREEN}✓ Bug report created successfully!${NC}"
echo -e "${BLUE}Issue URL:${NC} $ISSUE_URL"
echo ""
echo -e "${YELLOW}The duplicate detection bot will check for similar issues in ~30 seconds.${NC}"
echo -e "${YELLOW}Check your issue for any bot comments.${NC}"
