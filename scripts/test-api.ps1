# API 엔드포인트 테스트 스크립트 (PowerShell)
$BaseUrl = "http://localhost:3000"

Write-Host "================================" -ForegroundColor Cyan
Write-Host "API 엔드포인트 테스트" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# 1. 결과 조회 (초기 상태)
Write-Host "1. GET /api/result (초기 상태)" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/result" -Method GET
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

# 2. 짜장면 투표
Write-Host "2. POST /api/vote (짜장면)" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow
try {
    $body = @{ choice = "jjajang" } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/vote" -Method POST -Body $body -ContentType "application/json"
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

# 3. 결과 조회 (짜장면 투표 후)
Write-Host "3. GET /api/result (짜장면 투표 후)" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/result" -Method GET
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

# 4. 짬뽕 투표
Write-Host "4. POST /api/vote (짬뽕)" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow
try {
    $body = @{ choice = "jjamppong" } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/vote" -Method POST -Body $body -ContentType "application/json"
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

# 5. 결과 조회 (짬뽕 투표 후)
Write-Host "5. GET /api/result (짬뽕 투표 후)" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/result" -Method GET
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

# 6. 유효하지 않은 선택 (에러 테스트)
Write-Host "6. POST /api/vote (유효하지 않은 선택)" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow
try {
    $body = @{ choice = "invalid" } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/vote" -Method POST -Body $body -ContentType "application/json"
    $response | ConvertTo-Json -Depth 10
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    $errorResponse | ConvertTo-Json -Depth 10
}
Write-Host ""

# 7. 선택값 누락 (에러 테스트)
Write-Host "7. POST /api/vote (선택값 누락)" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow
try {
    $body = @{} | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/vote" -Method POST -Body $body -ContentType "application/json"
    $response | ConvertTo-Json -Depth 10
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    $errorResponse | ConvertTo-Json -Depth 10
}
Write-Host ""

Write-Host "================================" -ForegroundColor Cyan
Write-Host "테스트 완료" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
