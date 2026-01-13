#!/bin/bash

# Issue Search Agent
# Interactive script to search for issues on GitHub

set -e

REPO="sergeville/simcity-threejs-clone"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║    🔍 Issue Search Agent               ║${NC}"
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

echo -e "${YELLOW}This agent will help you search for existing issues.${NC}"
echo ""

# Main menu
while true; do
    echo -e "${GREEN}How do you want to search?${NC}"
    echo "1) Search by keywords"
    echo "2) Browse by component"
    echo "3) Browse by priority"
    echo "4) Show recent issues"
    echo "5) Show issues in progress"
    echo "0) Exit"
    read -p "Select option: " SEARCH_TYPE

    case $SEARCH_TYPE in
        1)
            # Keyword search
            echo ""
            read -p "Enter search keywords: " KEYWORDS
            if [ -z "$KEYWORDS" ]; then
                echo -e "${RED}Please enter at least one keyword${NC}"
                continue
            fi

            echo -e "\n${BLUE}Searching for: $KEYWORDS${NC}"
            echo -e "${YELLOW}Showing both open AND closed issues...${NC}\n"

            gh issue list --repo "$REPO" --search "$KEYWORDS" --state all --limit 20
            ;;

        2)
            # Browse by component
            echo ""
            echo "Select component:"
            echo "1) UI/Interface"
            echo "2) Simulation"
            echo "3) Economy"
            echo "4) Graphics"
            echo "5) Citizens"
            echo "6) Buildings"
            echo "7) Services"
            echo "8) Disasters"
            echo "9) Save/Load"
            read -p "Component: " COMPONENT

            case $COMPONENT in
                1) LABEL="ui" ;;
                2) LABEL="simulation" ;;
                3) LABEL="economy" ;;
                4) LABEL="graphics" ;;
                5) LABEL="citizens" ;;
                6) LABEL="buildings" ;;
                7) LABEL="services" ;;
                8) LABEL="disasters" ;;
                9) LABEL="save-load" ;;
                *) echo -e "${RED}Invalid selection${NC}"; continue ;;
            esac

            echo -e "\n${BLUE}Issues with label: $LABEL${NC}\n"
            gh issue list --repo "$REPO" --label "$LABEL" --state all --limit 20
            ;;

        3)
            # Browse by priority
            echo ""
            echo "Select priority:"
            echo "1) Critical"
            echo "2) High"
            echo "3) Medium"
            echo "4) Low"
            read -p "Priority: " PRIORITY

            case $PRIORITY in
                1) LABEL="critical" ;;
                2) LABEL="high" ;;
                3) LABEL="medium" ;;
                4) LABEL="low" ;;
                *) echo -e "${RED}Invalid selection${NC}"; continue ;;
            esac

            echo -e "\n${BLUE}Issues with priority: $LABEL${NC}\n"
            gh issue list --repo "$REPO" --label "$LABEL" --state open --limit 20
            ;;

        4)
            # Recent issues
            echo -e "\n${BLUE}Most recent issues:${NC}\n"
            gh issue list --repo "$REPO" --state all --limit 10
            ;;

        5)
            # In progress
            echo -e "\n${BLUE}Issues currently being worked on:${NC}\n"
            gh issue list --repo "$REPO" --label "in progress" --state open --limit 20
            ;;

        0)
            echo -e "${GREEN}Goodbye!${NC}"
            exit 0
            ;;

        *)
            echo -e "${RED}Invalid option${NC}"
            ;;
    esac

    echo ""
    echo -e "${YELLOW}Press Enter to continue...${NC}"
    read
    echo ""
done
