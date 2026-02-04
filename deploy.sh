#!/bin/bash
# Quick Deploy Script for BrandStore

echo "========================================="
echo "  🚀 BrandStore Deployment Script"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Git
echo -e "${BLUE}[1/6] Checking Git...${NC}"
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git is not installed!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Git is ready${NC}"
echo ""

# Check if .git exists
echo -e "${BLUE}[2/6] Initializing Git repository...${NC}"
if [ ! -d ".git" ]; then
    git init
    echo -e "${GREEN}✅ Git initialized${NC}"
else
    echo -e "${GREEN}✅ Git already initialized${NC}"
fi
echo ""

# Add files
echo -e "${BLUE}[3/6] Adding files...${NC}"
git add .
echo -e "${GREEN}✅ Files added${NC}"
echo ""

# Commit
echo -e "${BLUE}[4/6] Committing changes...${NC}"
read -p "Enter commit message (or press Enter for default): " COMMIT_MSG
COMMIT_MSG=${COMMIT_MSG:-"🚀 Deploy: BrandStore E-commerce Platform"}
git commit -m "$COMMIT_MSG"
echo -e "${GREEN}✅ Committed${NC}"
echo ""

# Check remote
echo -e "${BLUE}[5/6] Checking remote repository...${NC}"
if git remote | grep -q "origin"; then
    echo -e "${GREEN}✅ Remote 'origin' exists${NC}"
    git remote -v
else
    echo -e "${RED}⚠️  No remote found${NC}"
    echo ""
    echo "Please add your GitHub repository:"
    echo "git remote add origin https://github.com/YOUR_USERNAME/brandstore.git"
fi
echo ""

# Instructions
echo -e "${BLUE}[6/6] Next Steps:${NC}"
echo ""
echo "1️⃣  Create GitHub Repository:"
echo "   https://github.com/new"
echo "   Name: brandstore"
echo ""
echo "2️⃣  Add Remote (if not done):"
echo "   git remote add origin https://github.com/YOUR_USERNAME/brandstore.git"
echo ""
echo "3️⃣  Push to GitHub:"
echo "   git push -u origin main"
echo ""
echo "4️⃣  Deploy on Vercel:"
echo "   https://vercel.com/new"
echo "   - Import repository: brandstore"
echo "   - Add environment variables (see ENV_VARIABLES_PRODUCTION.md)"
echo ""
echo "5️⃣  Configure Domain:"
echo "   - Vercel: Settings → Domains"
echo "   - Add: brandstore.com"
echo "   - Update DNS in domain provider"
echo ""
echo "========================================="
echo -e "${GREEN}✅ Ready to deploy!${NC}"
echo "========================================="
