#!/bin/bash

# API 엔드포인트 테스트 스크립트
BASE_URL="http://localhost:3000"

echo "================================"
echo "API 엔드포인트 테스트"
echo "================================"
echo ""

# 1. 결과 조회 (초기 상태)
echo "1. GET /api/result (초기 상태)"
echo "================================"
curl -X GET "${BASE_URL}/api/result" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'
echo ""

# 2. 짜장면 투표
echo "2. POST /api/vote (짜장면)"
echo "================================"
curl -X POST "${BASE_URL}/api/vote" \
  -H "Content-Type: application/json" \
  -d '{"choice":"jjajang"}' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'
echo ""

# 3. 결과 조회 (짜장면 투표 후)
echo "3. GET /api/result (짜장면 투표 후)"
echo "================================"
curl -X GET "${BASE_URL}/api/result" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'
echo ""

# 4. 짬뽕 투표
echo "4. POST /api/vote (짬뽕)"
echo "================================"
curl -X POST "${BASE_URL}/api/vote" \
  -H "Content-Type: application/json" \
  -d '{"choice":"jjamppong"}' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'
echo ""

# 5. 결과 조회 (짬뽕 투표 후)
echo "5. GET /api/result (짬뽕 투표 후)"
echo "================================"
curl -X GET "${BASE_URL}/api/result" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'
echo ""

# 6. 유효하지 않은 선택 (에러 테스트)
echo "6. POST /api/vote (유효하지 않은 선택)"
echo "================================"
curl -X POST "${BASE_URL}/api/vote" \
  -H "Content-Type: application/json" \
  -d '{"choice":"invalid"}' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'
echo ""

# 7. 선택값 누락 (에러 테스트)
echo "7. POST /api/vote (선택값 누락)"
echo "================================"
curl -X POST "${BASE_URL}/api/vote" \
  -H "Content-Type: application/json" \
  -d '{}' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'
echo ""

echo "================================"
echo "테스트 완료"
echo "================================"
