#!/bin/bash

# Feature Request Agent
# Interactive script to create a feature request issue on GitHub

set -e

REPO="sergeville/simcity-threejs-clone"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║    💡 Feature Request Agent            ║${NC}"
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

echo -e "${YELLOW}This agent will help you create a feature request.${NC}"
echo -e "${YELLOW}I'll search for duplicates before submitting.${NC}"
echo ""

# Step 1: Get feature title
echo -e "${GREEN}Step 1/5: What feature do you want?${NC}"
echo "Example: Add subway transit system"
read -p "Feature title: " FEATURE_TITLE

if [ -z "$FEATURE_TITLE" ]; then
    echo -e "${RED}Error: Feature title cannot be empty${NC}"
    exit 1
fi

# Step 2: Search for duplicates
echo -e "\n${GREEN}Step 2/5: Checking for duplicates...${NC}"
echo "Searching existing issues for: $FEATURE_TITLE"

SEARCH_RESULTS=$(gh issue list --repo "$REPO" --search "$FEATURE_TITLE" --state all --limit 5 2>/dev/null || echo "")

if [ -n "$SEARCH_RESULTS" ]; then
    echo -e "${YELLOW}⚠️  Found potentially related issues:${NC}"
    echo "$SEARCH_RESULTS"
    echo ""
    read -p "Do any of these match your idea? (y/n): " IS_DUPLICATE

    if [[ "$IS_DUPLICATE" =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}Great! Please add a comment to one of the existing issues instead.${NC}"
        echo "You can view issues at: https://github.com/$REPO/issues"
        exit 0
    fi
else
    echo -e "${GREEN}✓ No obvious duplicates found${NC}"
fi

# Step 3: Get feature description
echo -e "\n${GREEN}Step 3/5: Describe your feature${NC}"
echo "What do you want to add and why?"
echo "(Press Ctrl+D when done, or Enter twice for empty)"
echo "---"

FEATURE_DESCRIPTION=""
while IFS= read -r line; do
    FEATURE_DESCRIPTION="${FEATURE_DESCRIPTION}${line}\n"
done

# Step 4: Get proposed solution
echo -e "\n${GREEN}Step 4/5: How should it work?${NC}"
echo "Describe how you imagine this feature working"
echo "(Press Ctrl+D when done, or Enter twice for empty)"
echo "---"

PROPOSED_SOLUTION=""
while IFS= read -r line; do
    PROPOSED_SOLUTION="${PROPOSED_SOLUTION}${line}\n"
done

# Step 5: Select components
echo -e "\n${GREEN}Step 5/5: Which parts of the game does this affect?${NC}"
echo "Select all that apply (space-separated numbers):"
echo "1) UI/Interface"
echo "2) Simulation Logic"
echo "3) Economy System"
echo "4) Graphics/Rendering"
echo "5) Citizens/Population"
echo "6) Buildings"
echo "7) Services (hospital/police/fire/school)"
echo "8) Disasters"
echo "9) Save/Load"
echo "0) Other/Unsure"
read -p "Select components (e.g., 1 2 6): " COMPONENT_CHOICES

COMPONENT_LABELS="enhancement"
for choice in $COMPONENT_CHOICES; do
    case $choice in
        1) COMPONENT_LABELS="$COMPONENT_LABELS,ui" ;;
        2) COMPONENT_LABELS="$COMPONENT_LABELS,simulation" ;;
        3) COMPONENT_LABELS="$COMPONENT_LABELS,economy" ;;
        4) COMPONENT_LABELS="$COMPONENT_LABELS,graphics" ;;
        5) COMPONENT_LABELS="$COMPONENT_LABELS,citizens" ;;
        6) COMPONENT_LABELS="$COMPONENT_LABELS,buildings" ;;
        7) COMPONENT_LABELS="$COMPONENT_LABELS,services" ;;
        8) COMPONENT_LABELS="$COMPONENT_LABELS,disasters" ;;
        9) COMPONENT_LABELS="$COMPONENT_LABELS,save-load" ;;
    esac
done

# Build issue body
ISSUE_BODY="## Feature Description

${FEATURE_DESCRIPTION}

## Proposed Solution

${PROPOSED_SOLUTION}

## Use Case

This feature would improve the game by adding functionality that currently doesn't exist or is limited.

---

**Requested via Feature Request Agent**
"

# Show preview
echo -e "\n${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}Preview of your feature request:${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${YELLOW}Title:${NC} [FEATURE] $FEATURE_TITLE"
echo -e "${YELLOW}Labels:${NC} $COMPONENT_LABELS"
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
    --title "[FEATURE] $FEATURE_TITLE" \
    --body "$ISSUE_BODY" \
    --label "$COMPONENT_LABELS")

echo -e "${GREEN}✓ Feature request created successfully!${NC}"
echo -e "${BLUE}Issue URL:${NC} $ISSUE_URL"
echo ""
echo -e "${YELLOW}The duplicate detection bot will check for similar issues in ~30 seconds.${NC}"
echo -e "${YELLOW}Check your issue for any bot comments.${NC}"
