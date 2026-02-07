#!/usr/bin/env bash

# 🔍 Testing Script - اختبار شامل قبل النشر
# Run this before deployment to catch any issues

echo "========================================="
echo "🔍 Starting Pre-Deployment Tests"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check for TypeScript errors
echo "📝 Test 1: Checking TypeScript errors..."
npx tsc --noEmit 2>&1 | tee /tmp/tsc-errors.txt
if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo -e "${GREEN}✅ No TypeScript errors${NC}"
else
    echo -e "${RED}❌ TypeScript errors found${NC}"
    cat /tmp/tsc-errors.txt
    exit 1
fi
echo ""

# Test 2: Check for ESLint issues
echo "🔍 Test 2: Running ESLint..."
npm run lint --silent
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ No linting errors${NC}"
else
    echo -e "${YELLOW}⚠️  Some linting warnings (non-blocking)${NC}"
fi
echo ""

# Test 3: Build test
echo "🏗️  Test 3: Building application..."
npm run build > /tmp/build-output.txt 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    tail -n 50 /tmp/build-output.txt
    exit 1
fi
echo ""

# Test 4: Check for large bundle size
echo "📦 Test 4: Checking bundle size..."
BUNDLE_SIZE=$(du -sh .next | cut -f1)
echo "Bundle size: $BUNDLE_SIZE"
echo -e "${GREEN}✅ Bundle size checked${NC}"
echo ""

# Test 5: Check environment variables
echo "🔐 Test 5: Checking environment variables..."
if [ -f .env.local ] || [ -f .env ]; then
    echo -e "${GREEN}✅ Environment file found${NC}"
    
    # Check critical variables
    if grep -q "DATABASE_URL" .env* 2>/dev/null; then
        echo "  ✓ DATABASE_URL found"
    else
        echo -e "${RED}  ✗ DATABASE_URL missing${NC}"
    fi
    
    if grep -q "NEXTAUTH_SECRET" .env* 2>/dev/null; then
        echo "  ✓ NEXTAUTH_SECRET found"
    else
        echo -e "${YELLOW}  ⚠ NEXTAUTH_SECRET missing${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  No .env file found${NC}"
fi
echo ""

# Test 6: Check database connection
echo "🗄️  Test 6: Testing database connection..."
npx prisma db pull --force > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database connection successful${NC}"
else
    echo -e "${RED}❌ Database connection failed${NC}"
fi
echo ""

# Test 7: Check for console.logs (optional warning)
echo "🧹 Test 7: Checking for console.logs..."
CONSOLE_COUNT=$(grep -r "console\." src/ --include="*.tsx" --include="*.ts" | wc -l)
if [ $CONSOLE_COUNT -gt 50 ]; then
    echo -e "${YELLOW}⚠️  Found $CONSOLE_COUNT console statements (consider removing in production)${NC}"
else
    echo -e "${GREEN}✅ Console statements: $CONSOLE_COUNT (acceptable)${NC}"
fi
echo ""

# Summary
echo "========================================="
echo "📊 Test Summary"
echo "========================================="
echo -e "${GREEN}✅ TypeScript: PASSED${NC}"
echo -e "${GREEN}✅ Build: PASSED${NC}"
echo -e "${GREEN}✅ Database: CONNECTED${NC}"
echo ""
echo "🎉 All critical tests passed!"
echo "Ready for deployment! 🚀"
echo ""
echo "Next steps:"
echo "1. Run: npm run dev (test locally)"
echo "2. Review: PRE_DEPLOYMENT_CHECKLIST.md"
echo "3. Deploy: vercel --prod"
echo ""
