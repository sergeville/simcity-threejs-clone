#!/bin/bash

# Quick Feature Creator
# One-line command to create a feature request

set -e

REPO="sergeville/simcity-threejs-clone"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Usage
if [ "$#" -lt 1 ]; then
    echo "Usage: $0 \"Feature Title\" [description]"
    echo ""
    echo "Examples:"
    echo "  $0 \"Add subway system\""
    echo "  $0 \"Add weather effects\" \"Rain, snow, and fog in the city\""
    exit 1
fi

TITLE="$1"
DESCRIPTION="${2:-No description provided. Will need to be filled in later.}"

# Auto-detect component labels from keywords
LABELS="enhancement"

# Check for keywords in title and description
TEXT=$(echo "$TITLE $DESCRIPTION" | tr '[:upper:]' '[:lower:]')

[[ "$TEXT" =~ (ui|interface|panel|button|menu) ]] && LABELS="$LABELS,ui"
[[ "$TEXT" =~ (3d|render|visual|graphic|animation) ]] && LABELS="$LABELS,graphics"
[[ "$TEXT" =~ (simulat|logic|game) ]] && LABELS="$LABELS,simulation"
[[ "$TEXT" =~ (economy|budget|tax|money) ]] && LABELS="$LABELS,economy"
[[ "$TEXT" =~ (citizen|population|people) ]] && LABELS="$LABELS,citizens"
[[ "$TEXT" =~ (building|construct|zone) ]] && LABELS="$LABELS,buildings"
[[ "$TEXT" =~ (hospital|police|fire|school|service) ]] && LABELS="$LABELS,services"
[[ "$TEXT" =~ (disaster|fire|flood|outage) ]] && LABELS="$LABELS,disasters"
[[ "$TEXT" =~ (save|load|persist) ]] && LABELS="$LABELS,save-load"

# Create issue
echo -e "${BLUE}Creating feature request...${NC}"

ISSUE_URL=$(gh issue create \
    --repo "$REPO" \
    --title "[FEATURE] $TITLE" \
    --body "$DESCRIPTION" \
    --label "$LABELS")

echo -e "${GREEN}✓ Feature request created!${NC}"
echo -e "${BLUE}URL:${NC} $ISSUE_URL"
echo -e "${YELLOW}Labels:${NC} $LABELS"
echo ""
echo -e "${YELLOW}Duplicate detection bot will check in ~30 seconds${NC}"
echo ""
echo "Edit the issue if you want to add more details:"
echo "  gh issue view ${ISSUE_URL##*/} --web"
