#!/bin/bash

# GitHub Issues Manager - Main Menu
# Central hub for all issue management operations

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="sergeville/simcity-threejs-clone"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

clear

echo -e "${CYAN}"
cat << "EOF"
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║     ██████  ██ ████████ ██    ██ ███████ ██ ███    ███║
║    ██      ██    ██     ██  ██  ██      ██ ████  ████║
║    ██      ██    ██      ████   ███████ ██ ██ ████ ██║
║    ██      ██    ██       ██         ██ ██ ██  ██  ██║
║     ██████ ██    ██       ██    ███████ ██ ██      ██║
║                                                       ║
║           GitHub Issues Manager v1.0                  ║
║           SimCity Three.js Clone                      ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}╔════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ERROR: GitHub CLI (gh) is not installed      ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Please install GitHub CLI to use this tool:"
    echo -e "${BLUE}https://cli.github.com/${NC}"
    echo ""
    echo "Installation:"
    echo "  macOS:   brew install gh"
    echo "  Linux:   See https://github.com/cli/cli/blob/trunk/docs/install_linux.md"
    echo "  Windows: See https://github.com/cli/cli#windows"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}╔════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║  You need to authenticate with GitHub CLI     ║${NC}"
    echo -e "${YELLOW}╚════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Run this command to authenticate:"
    echo -e "${GREEN}gh auth login${NC}"
    echo ""
    read -p "Press Enter to run authentication now (or Ctrl+C to cancel)..."
    gh auth login
fi

# Get issue counts
OPEN_COUNT=$(gh issue list --repo "$REPO" --state open --limit 1000 --json number | jq '. | length' 2>/dev/null || echo "?")
IN_PROGRESS=$(gh issue list --repo "$REPO" --label "in progress" --state open --limit 100 --json number | jq '. | length' 2>/dev/null || echo "?")

echo ""
echo -e "${BLUE}Repository Status:${NC}"
echo -e "  📂 Open Issues: ${GREEN}$OPEN_COUNT${NC}"
echo -e "  🔨 In Progress: ${YELLOW}$IN_PROGRESS${NC}"
echo ""

while true; do
    echo -e "${CYAN}╔════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                 MAIN MENU                      ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}Create:${NC}"
    echo "  1) 🐛 Report a Bug"
    echo "  2) 💡 Request a Feature"
    echo ""
    echo -e "${GREEN}Browse:${NC}"
    echo "  3) 🔍 Search Issues"
    echo "  4) 📋 View Specific Issue"
    echo "  5) 📊 Show My Open Issues"
    echo "  6) 🔨 Show In Progress Issues"
    echo ""
    echo -e "${GREEN}Quick Access:${NC}"
    echo "  7) 🌐 Open Issues in Browser"
    echo "  8) 📚 View Documentation"
    echo "  9) 🔧 View Resolved Issues"
    echo ""
    echo "  0) Exit"
    echo ""
    read -p "Select option: " OPTION

    case $OPTION in
        1)
            # Report bug
            clear
            bash "$SCRIPT_DIR/issue-bug.sh"
            echo ""
            read -p "Press Enter to continue..."
            clear
            ;;

        2)
            # Request feature
            clear
            bash "$SCRIPT_DIR/issue-feature.sh"
            echo ""
            read -p "Press Enter to continue..."
            clear
            ;;

        3)
            # Search issues
            clear
            bash "$SCRIPT_DIR/issue-search.sh"
            clear
            ;;

        4)
            # View specific issue
            clear
            echo -e "${BLUE}View Specific Issue${NC}"
            echo ""
            bash "$SCRIPT_DIR/issue-view.sh"
            echo ""
            read -p "Press Enter to continue..."
            clear
            ;;

        5)
            # Show my open issues
            clear
            echo -e "${BLUE}Your Open Issues:${NC}"
            echo ""
            gh issue list --repo "$REPO" --author "@me" --state open
            echo ""
            read -p "Press Enter to continue..."
            clear
            ;;

        6)
            # Show in progress
            clear
            echo -e "${BLUE}Issues Currently In Progress:${NC}"
            echo ""
            gh issue list --repo "$REPO" --label "in progress" --state open
            echo ""
            read -p "Press Enter to continue..."
            clear
            ;;

        7)
            # Open in browser
            gh issue list --repo "$REPO" --web
            ;;

        8)
            # View documentation
            clear
            echo -e "${BLUE}Documentation Links:${NC}"
            echo ""
            echo "📚 Main Documentation:"
            echo "   https://github.com/$REPO/blob/main/docs/README.md"
            echo ""
            echo "📖 Using GitHub Issues Guide:"
            echo "   https://github.com/$REPO/blob/main/docs/development/USING_GITHUB_ISSUES.md"
            echo ""
            echo "🔍 GitHub Issues Guide (Complete):"
            echo "   https://github.com/$REPO/blob/main/docs/development/GITHUB_ISSUES_GUIDE.md"
            echo ""
            echo "🔧 Resolved Issues:"
            echo "   https://github.com/$REPO/blob/main/docs/development/RESOLVED_ISSUES.md"
            echo ""
            read -p "Press Enter to continue..."
            clear
            ;;

        9)
            # View resolved issues
            if command -v bat &> /dev/null; then
                bat docs/development/RESOLVED_ISSUES.md
            elif command -v less &> /dev/null; then
                less docs/development/RESOLVED_ISSUES.md
            else
                cat docs/development/RESOLVED_ISSUES.md
            fi
            echo ""
            read -p "Press Enter to continue..."
            clear
            ;;

        0)
            clear
            echo -e "${GREEN}Thank you for using the GitHub Issues Manager!${NC}"
            echo -e "${BLUE}Happy coding! 🚀${NC}"
            echo ""
            exit 0
            ;;

        *)
            echo -e "${RED}Invalid option. Please try again.${NC}"
            sleep 1
            clear
            ;;
    esac
done
