#!/bin/bash

# Setup GitHub Labels from labels.yml
# One-time script to create all labels in the repository

set -e

REPO="sergeville/simcity-threejs-clone"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}Creating GitHub Labels for $REPO${NC}"
echo ""

# Check if gh CLI is authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}Please authenticate first: gh auth login${NC}"
    exit 1
fi

# Type Labels
echo -e "${GREEN}Creating Type Labels...${NC}"
gh label create "bug" --color "d73a4a" --description "Something isn't working correctly" --repo "$REPO" --force
gh label create "enhancement" --color "a2eeef" --description "New feature or improvement" --repo "$REPO" --force
gh label create "documentation" --color "0075ca" --description "Documentation improvements" --repo "$REPO" --force
gh label create "question" --color "d876e3" --description "Questions about functionality" --repo "$REPO" --force

# Priority Labels
echo -e "${GREEN}Creating Priority Labels...${NC}"
gh label create "critical" --color "ff0000" --description "Crashes, data loss, game unplayable" --repo "$REPO" --force
gh label create "high" --color "ff6600" --description "Major features broken" --repo "$REPO" --force
gh label create "medium" --color "ffaa00" --description "Feature partially broken" --repo "$REPO" --force
gh label create "low" --color "ffee00" --description "Minor issues, polish" --repo "$REPO" --force

# Component Labels
echo -e "${GREEN}Creating Component Labels...${NC}"
gh label create "ui" --color "5319e7" --description "User interface" --repo "$REPO" --force
gh label create "simulation" --color "1d76db" --description "Simulation logic" --repo "$REPO" --force
gh label create "economy" --color "0e8a16" --description "Budget/taxes/economy" --repo "$REPO" --force
gh label create "graphics" --color "fbca04" --description "Rendering/visual" --repo "$REPO" --force
gh label create "citizens" --color "c5def5" --description "Citizen AI/behavior" --repo "$REPO" --force
gh label create "buildings" --color "bfd4f2" --description "Building system" --repo "$REPO" --force
gh label create "services" --color "d4c5f9" --description "Hospital/police/fire/school" --repo "$REPO" --force
gh label create "disasters" --color "e99695" --description "Fire/flood/outage system" --repo "$REPO" --force
gh label create "save-load" --color "f9d0c4" --description "Save/load system" --repo "$REPO" --force

# Status Labels
echo -e "${GREEN}Creating Status Labels...${NC}"
gh label create "duplicate" --color "cfd3d7" --description "Already reported" --repo "$REPO" --force
gh label create "potential-duplicate" --color "e4e669" --description "May be duplicate (automated detection)" --repo "$REPO" --force
gh label create "wontfix" --color "ffffff" --description "Won't be fixed" --repo "$REPO" --force
gh label create "help wanted" --color "008672" --description "Community help needed" --repo "$REPO" --force
gh label create "good first issue" --color "7057ff" --description "Beginner-friendly" --repo "$REPO" --force
gh label create "in progress" --color "ffff00" --description "Being worked on" --repo "$REPO" --force

echo ""
echo -e "${GREEN}✓ All labels created successfully!${NC}"
echo ""
echo "View labels at: https://github.com/$REPO/labels"
