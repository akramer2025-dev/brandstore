# Facebook Token Refresh Helper
# هيساعدك تحول Short-lived Token لـ Long-lived Token

param(
    [Parameter(Mandatory=$true)]
    [string]$ShortToken
)

$AppId = "2579002475732579"
$AppSecret = "e1212bdd6c9208e178c2835906897a64"

Write-Host "🔄 Converting Short-lived Token to Long-lived Token..." -ForegroundColor Cyan

$url = "https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=$AppId&client_secret=$AppSecret&fb_exchange_token=$ShortToken"

try {
    $response = Invoke-RestMethod -Uri $url -Method Get
    
    if ($response.access_token) {
        $longToken = $response.access_token
        $expiresIn = $response.expires_in
        $days = [math]::Round($expiresIn / 86400)
        
        Write-Host ""
        Write-Host "✅ Success! Long-lived Token generated:" -ForegroundColor Green
        Write-Host ""
        Write-Host "Token: $longToken" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Expires in: $days days" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "📝 Copy this token and update .env file:" -ForegroundColor White
        Write-Host "FACEBOOK_ACCESS_TOKEN=`"$longToken`"" -ForegroundColor Yellow
        Write-Host ""
        
        # Ask if user wants to auto-update .env
        $update = Read-Host "Do you want to update .env file automatically? (Y/N)"
        
        if ($update -eq "Y" -or $update -eq "y") {
            $envPath = "d:\markting\.env"
            
            if (Test-Path $envPath) {
                # Backup current .env
                Copy-Item $envPath "$envPath.backup" -Force
                Write-Host "✅ Backed up current .env to .env.backup" -ForegroundColor Green
                
                # Read and update .env
                $envContent = Get-Content $envPath -Raw
                $envContent = $envContent -replace 'FACEBOOK_ACCESS_TOKEN="[^"]*"', "FACEBOOK_ACCESS_TOKEN=`"$longToken`""
                Set-Content $envPath $envContent
                
                Write-Host "✅ Updated .env file with new token" -ForegroundColor Green
                Write-Host ""
                Write-Host "🔄 Please restart the dev server: npm run dev" -ForegroundColor Yellow
            } else {
                Write-Host "❌ .env file not found at: $envPath" -ForegroundColor Red
            }
        }
        
    } else {
        Write-Host "❌ Error: $($response.error.message)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Error connecting to Facebook API: $_" -ForegroundColor Red
}
