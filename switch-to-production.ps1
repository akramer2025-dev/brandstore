# Switch to Production Mode
Write-Host "🚀 Switching to PRODUCTION mode..." -ForegroundColor Green

# Backup current .env
Copy-Item .env .env.development.backup -Force
Write-Host "✅ Backed up current .env to .env.development.backup" -ForegroundColor Yellow

# Read .env
$envContent = Get-Content .env -Raw

# Replace URLs
$envContent = $envContent -replace 'NEXTAUTH_URL="http://localhost:3000"', 'NEXTAUTH_URL="https://www.remostore.net"'
$envContent = $envContent -replace 'NEXT_PUBLIC_APP_URL="http://localhost:3000"', 'NEXT_PUBLIC_APP_URL="https://www.remostore.net"'
$envContent = $envContent -replace 'NEXT_PUBLIC_SITE_URL="http://localhost:3000"', 'NEXT_PUBLIC_SITE_URL="https://www.remostore.net"'

# Comment out development URLs
$envContent = $envContent -replace '^NEXTAUTH_URL="http://localhost:3000"', '# NEXTAUTH_URL="http://localhost:3000"'
$envContent = $envContent -replace '^# NEXTAUTH_URL="https://www.remostore.net"', 'NEXTAUTH_URL="https://www.remostore.net"'

# Write updated .env
Set-Content .env $envContent

Write-Host "✅ Environment switched to PRODUCTION" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. Review .env file" -ForegroundColor White
Write-Host "2. Run: npm run build" -ForegroundColor White
Write-Host "3. Run: npm run start" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  To switch back to development, run: .\switch-to-dev.ps1" -ForegroundColor Yellow
