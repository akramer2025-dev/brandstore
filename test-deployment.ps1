# 🔍 Testing Script - اختبار شامل قبل النشر
# Run this before deployment to catch any issues

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "🔍 Starting Pre-Deployment Tests" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

$ErrorCount = 0

# Test 1: Check for TypeScript errors
Write-Host "📝 Test 1: Checking TypeScript errors..." -ForegroundColor Yellow
try {
    $tscOutput = npx tsc --noEmit 2>&1 | Out-String
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ No TypeScript errors" -ForegroundColor Green
    } else {
        Write-Host "❌ TypeScript errors found:" -ForegroundColor Red
        Write-Host $tscOutput -ForegroundColor Red
        $ErrorCount++
    }
} catch {
    Write-Host "⚠️  Could not run TypeScript check" -ForegroundColor Yellow
}
Write-Host ""

# Test 2: Check for ESLint issues
Write-Host "🔍 Test 2: Running ESLint..." -ForegroundColor Yellow
try {
    npm run lint --silent 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ No linting errors" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Some linting warnings (non-blocking)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Could not run ESLint" -ForegroundColor Yellow
}
Write-Host ""

# Test 3: Build test
Write-Host "🏗️  Test 3: Building application..." -ForegroundColor Yellow
try {
    $buildOutput = npm run build 2>&1 | Out-String
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Build successful" -ForegroundColor Green
    } else {
        Write-Host "❌ Build failed:" -ForegroundColor Red
        Write-Host $buildOutput.Substring([Math]::Max(0, $buildOutput.Length - 2000)) -ForegroundColor Red
        $ErrorCount++
    }
} catch {
    Write-Host "❌ Build error" -ForegroundColor Red
    $ErrorCount++
}
Write-Host ""

# Test 4: Check for bundle size
Write-Host "📦 Test 4: Checking bundle size..." -ForegroundColor Yellow
if (Test-Path ".next") {
    $size = (Get-ChildItem .next -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "Bundle size: $([math]::Round($size, 2)) MB" -ForegroundColor Cyan
    Write-Host "✅ Bundle size checked" -ForegroundColor Green
} else {
    Write-Host "⚠️  .next folder not found (build first)" -ForegroundColor Yellow
}
Write-Host ""

# Test 5: Check environment variables
Write-Host "🔐 Test 5: Checking environment variables..." -ForegroundColor Yellow
$envFiles = @(".env.local", ".env")
$envFound = $false

foreach ($envFile in $envFiles) {
    if (Test-Path $envFile) {
        $envFound = $true
        Write-Host "✅ Environment file found: $envFile" -ForegroundColor Green
        
        $content = Get-Content $envFile -Raw
        
        # Check critical variables
        if ($content -match "DATABASE_URL") {
            Write-Host "  ✓ DATABASE_URL found" -ForegroundColor Green
        } else {
            Write-Host "  ✗ DATABASE_URL missing" -ForegroundColor Red
            $ErrorCount++
        }
        
        if ($content -match "NEXTAUTH_SECRET") {
            Write-Host "  ✓ NEXTAUTH_SECRET found" -ForegroundColor Green
        } else {
            Write-Host "  ⚠ NEXTAUTH_SECRET missing" -ForegroundColor Yellow
        }
        
        break
    }
}

if (-not $envFound) {
    Write-Host "⚠️  No .env file found" -ForegroundColor Yellow
}
Write-Host ""

# Test 6: Check database connection
Write-Host "🗄️  Test 6: Testing database connection..." -ForegroundColor Yellow
try {
    npx prisma db pull --force 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database connection successful" -ForegroundColor Green
    } else {
        Write-Host "❌ Database connection failed" -ForegroundColor Red
        $ErrorCount++
    }
} catch {
    Write-Host "❌ Database connection failed" -ForegroundColor Red
    $ErrorCount++
}
Write-Host ""

# Test 7: Check for console.logs
Write-Host "🧹 Test 7: Checking for console statements..." -ForegroundColor Yellow
try {
    $consoleCount = (Select-String -Path "src\**\*.tsx", "src\**\*.ts" -Pattern "console\." -ErrorAction SilentlyContinue | Measure-Object).Count
    if ($consoleCount -gt 50) {
        Write-Host "⚠️  Found $consoleCount console statements (consider removing in production)" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Console statements: $consoleCount (acceptable)" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Could not check console statements" -ForegroundColor Yellow
}
Write-Host ""

# Summary
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "📊 Test Summary" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

if ($ErrorCount -eq 0) {
    Write-Host "✅ All critical tests passed!" -ForegroundColor Green
    Write-Host "🎉 Ready for deployment! 🚀" -ForegroundColor Green
} else {
    Write-Host "❌ Found $ErrorCount critical error(s)" -ForegroundColor Red
    Write-Host "⚠️  Please fix errors before deployment" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Run: npm run dev (test locally)" -ForegroundColor White
Write-Host "2. Review: PRE_DEPLOYMENT_CHECKLIST.md" -ForegroundColor White
Write-Host "3. Create backup: npm run backup-database" -ForegroundColor White
Write-Host "4. Deploy: vercel --prod" -ForegroundColor White
Write-Host ""

exit $ErrorCount
