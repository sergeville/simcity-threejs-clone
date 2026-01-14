#!/bin/bash

# Quick Bug Reporter
# One-line command to report a bug

set -e

REPO="sergeville/simcity-threejs-clone"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Usage
if [ "$#" -lt 1 ]; then
    echo "Usage: $0 \"Bug Description\" [priority]"
    echo ""
    echo "Priority: critical, high, medium, low (default: medium)"
    echo ""
    echo "Examples:"
    echo "  $0 \"Buildings disappear after loading\""
    echo "  $0 \"Game crashes when saving\" critical"
    echo "  $0 \"UI overlaps at low resolution\" low"
    exit 1
fi

TITLE="$1"
PRIORITY="${2:-medium}"

# Validate priority
case "$PRIORITY" in
    critical|high|medium|low) ;;
    *)
        echo -e "${RED}Invalid priority: $PRIORITY${NC}"
        echo "Use: critical, high, medium, or low"
        exit 1
        ;;
esac

# Auto-detect component labels from keywords
LABELS="bug,$PRIORITY"

# Check for keywords in title
TEXT=$(echo "$TITLE" | tr '[:upper:]' '[:lower:]')

[[ "$TEXT" =~ (ui|interface|panel|button|menu|display) ]] && LABELS="$LABELS,ui"
[[ "$TEXT" =~ (render|visual|graphic|animation|3d) ]] && LABELS="$LABELS,graphics"
[[ "$TEXT" =~ (simulat|logic|game) ]] && LABELS="$LABELS,simulation"
[[ "$TEXT" =~ (economy|budget|tax|money) ]] && LABELS="$LABELS,economy"
[[ "$TEXT" =~ (citizen|population|people) ]] && LABELS="$LABELS,citizens"
[[ "$TEXT" =~ (building|construct|zone) ]] && LABELS="$LABELS,buildings"
[[ "$TEXT" =~ (hospital|police|fire|school|service) ]] && LABELS="$LABELS,services"
[[ "$TEXT" =~ (disaster|fire|flood|outage) ]] && LABELS="$LABELS,disasters"
[[ "$TEXT" =~ (save|load|persist|corrupt) ]] && LABELS="$LABELS,save-load"

# Create issue
echo -e "${BLUE}Creating bug report...${NC}"

ISSUE_URL=$(gh issue create \
    --repo "$REPO" \
    --title "[BUG] $TITLE" \
    --body "## Bug Description

$TITLE

## Environment
- Browser: Not specified
- OS: $(uname -s)

## Steps to Reproduce
_Please edit this issue to add reproduction steps_

## Console Errors
_Please edit this issue to add console errors if any_

---

**Reported via Quick Bug Reporter**
Use \`gh issue edit ${ISSUE_URL##*/}\` to add more details
" \
    --label "$LABELS")

echo -e "${GREEN}✓ Bug report created!${NC}"
echo -e "${BLUE}URL:${NC} $ISSUE_URL"
echo -e "${YELLOW}Priority:${NC} $PRIORITY"
echo -e "${YELLOW}Labels:${NC} $LABELS"
echo ""
echo -e "${YELLOW}Duplicate detection bot will check in ~30 seconds${NC}"
echo ""
echo "Add more details with:"
echo "  gh issue edit ${ISSUE_URL##*/} --body-file -"
