# Deploy Script
Set-Location "D:\markting"

Write-Host "📦 Adding files to git..." -ForegroundColor Cyan
git add .

Write-Host "✍️ Creating commit..." -ForegroundColor Cyan
git commit -m "🔧 Fix bundle products auto-select + delivery fee display + update Vercel config

- Remove auto-selection of bundle products  
- Users must manually click to select products
- Add clear UI instructions
- Change delivery fee from 'free' to 'calculated at checkout'
- Fix cart to show accurate delivery information
- Update Vercel project config to 'brandstore'"

Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Cyan
git push origin main

Write-Host ""
Write-Host "✅ Deploy complete! Vercel will auto-build." -ForegroundColor Green
Write-Host "🌐 Vercel: https://vercel.com/akramer2025-devs-projects/brandstore" -ForegroundColor Yellow
Write-Host "🌐 Website: https://www.remostore.net" -ForegroundColor Yellow
Write-Host ""
Write-Host "⏳ Wait 2-3 minutes for Vercel to build and deploy..." -ForegroundColor Cyan
