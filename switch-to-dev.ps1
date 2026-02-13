# Switch to Development Mode
Write-Host "🔧 Switching to DEVELOPMENT mode..." -ForegroundColor Cyan

# Check if backup exists
if (Test-Path .env.development.backup) {
    # Restore from backup
    Copy-Item .env.development.backup .env -Force
    Write-Host "✅ Restored .env from backup" -ForegroundColor Green
} else {
    # Manual replacement
    $envContent = Get-Content .env -Raw
    
    # Replace URLs back to localhost
    $envContent = $envContent -replace 'NEXTAUTH_URL="https://www.remostore.net"', 'NEXTAUTH_URL="http://localhost:3000"'
    $envContent = $envContent -replace 'NEXT_PUBLIC_APP_URL="https://www.remostore.net"', 'NEXT_PUBLIC_APP_URL="http://localhost:3000"'
    $envContent = $envContent -replace 'NEXT_PUBLIC_SITE_URL="https://www.remostore.net"', 'NEXT_PUBLIC_SITE_URL="http://localhost:3000"'
    
    Set-Content .env $envContent
    Write-Host "✅ Switched back to localhost URLs" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ Environment switched to DEVELOPMENT" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next step:" -ForegroundColor Cyan
Write-Host "Run: npm run dev" -ForegroundColor White
