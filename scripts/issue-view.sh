#!/bin/bash

# Issue View Agent
# Interactive script to view and manage specific issues

set -e

REPO="sergeville/simcity-threejs-clone"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║    📋 Issue View Agent                 ║${NC}"
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

# Get issue number
if [ -z "$1" ]; then
    read -p "Enter issue number: " ISSUE_NUMBER
else
    ISSUE_NUMBER=$1
fi

if [ -z "$ISSUE_NUMBER" ]; then
    echo -e "${RED}Error: Issue number required${NC}"
    exit 1
fi

# View issue
echo -e "${BLUE}Loading issue #$ISSUE_NUMBER...${NC}\n"
gh issue view "$ISSUE_NUMBER" --repo "$REPO"

echo ""
echo -e "${GREEN}What would you like to do?${NC}"
echo "1) Add a comment"
echo "2) Close this issue"
echo "3) Reopen this issue"
echo "4) Add label"
echo "5) Mark as 'in progress'"
echo "6) View in browser"
echo "0) Back to menu"
read -p "Select option: " ACTION

case $ACTION in
    1)
        # Add comment
        echo "Enter your comment (Ctrl+D when done):"
        COMMENT=""
        while IFS= read -r line; do
            COMMENT="${COMMENT}${line}\n"
        done

        gh issue comment "$ISSUE_NUMBER" --repo "$REPO" --body "$COMMENT"
        echo -e "${GREEN}✓ Comment added${NC}"
        ;;

    2)
        # Close issue
        read -p "Reason for closing (optional): " CLOSE_REASON
        if [ -n "$CLOSE_REASON" ]; then
            gh issue close "$ISSUE_NUMBER" --repo "$REPO" --comment "$CLOSE_REASON"
        else
            gh issue close "$ISSUE_NUMBER" --repo "$REPO"
        fi
        echo -e "${GREEN}✓ Issue closed${NC}"
        ;;

    3)
        # Reopen issue
        gh issue reopen "$ISSUE_NUMBER" --repo "$REPO"
        echo -e "${GREEN}✓ Issue reopened${NC}"
        ;;

    4)
        # Add label
        echo "Select label to add:"
        echo "1) bug           2) enhancement    3) documentation"
        echo "4) critical      5) high           6) medium         7) low"
        echo "8) ui            9) simulation     10) economy"
        echo "11) in progress  12) help wanted   13) good first issue"
        read -p "Label: " LABEL_CHOICE

        case $LABEL_CHOICE in
            1) LABEL="bug" ;;
            2) LABEL="enhancement" ;;
            3) LABEL="documentation" ;;
            4) LABEL="critical" ;;
            5) LABEL="high" ;;
            6) LABEL="medium" ;;
            7) LABEL="low" ;;
            8) LABEL="ui" ;;
            9) LABEL="simulation" ;;
            10) LABEL="economy" ;;
            11) LABEL="in progress" ;;
            12) LABEL="help wanted" ;;
            13) LABEL="good first issue" ;;
            *) echo -e "${RED}Invalid selection${NC}"; exit 0 ;;
        esac

        gh issue edit "$ISSUE_NUMBER" --repo "$REPO" --add-label "$LABEL"
        echo -e "${GREEN}✓ Label '$LABEL' added${NC}"
        ;;

    5)
        # Mark as in progress
        gh issue edit "$ISSUE_NUMBER" --repo "$REPO" --add-label "in progress"
        echo -e "${GREEN}✓ Marked as 'in progress'${NC}"
        echo -e "${YELLOW}Don't forget to create a branch and start working!${NC}"
        echo -e "${BLUE}Suggested command:${NC}"
        echo "  git checkout -b fix/issue-$ISSUE_NUMBER"
        ;;

    6)
        # View in browser
        gh issue view "$ISSUE_NUMBER" --repo "$REPO" --web
        ;;

    0)
        exit 0
        ;;

    *)
        echo -e "${RED}Invalid option${NC}"
        ;;
esac
