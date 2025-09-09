# KYNEX Logo Setup Script
# This script helps you copy your KYNEX logo to the correct locations

Write-Host "KYNEX Logo Setup" -ForegroundColor Magenta
Write-Host "=================" -ForegroundColor Magenta
Write-Host ""

$logoPath = Read-Host "Enter the full path to your KYNEX logo PNG file (e.g., C:\Downloads\kynex-logo.png)"

if (Test-Path $logoPath) {
    Write-Host "Found logo file!" -ForegroundColor Green
    
    # Copy to main logo location
    $mainLogoPath = "public\images\kynex-logo.png"
    Copy-Item $logoPath $mainLogoPath -Force
    Write-Host "✓ Copied to $mainLogoPath" -ForegroundColor Green
    
    # Copy to favicon location
    $faviconPath = "public\favicon.ico"
    Copy-Item $logoPath $faviconPath -Force
    Write-Host "✓ Copied to $faviconPath" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "Logo setup complete! Your KYNEX logo is now ready." -ForegroundColor Green
    Write-Host "You can now run 'npm run dev' to see your logo in the application." -ForegroundColor Cyan
} else {
    Write-Host "Error: Could not find the logo file at: $logoPath" -ForegroundColor Red
    Write-Host "Please make sure the file path is correct and try again." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
