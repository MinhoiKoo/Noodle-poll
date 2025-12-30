import { NextRequest, NextResponse } from 'next/server'
import { read } from '@/lib/store'

/**
 * GET /api/result
 * 투표 결과 조회 API
 *
 * Response:
 * {
 *   "jjajang": number,
 *   "jjamppong": number,
 *   "total": number,
 *   "updatedAt": string (ISO 8601)
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // 1. 현재 투표 결과 조회
    const result = await read()

    // 2. 성공 응답
    return NextResponse.json(result, {
      status: 200,
      headers: {
        // 캐시 비활성화 - 항상 최신 데이터 제공
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })

  } catch (error) {
    console.error('Result API error:', error)

    return NextResponse.json(
      {
        jjajang: 0,
        jjamppong: 0,
        total: 0,
        updatedAt: new Date().toISOString(),
        error: '결과 조회 중 오류가 발생했습니다.',
      },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS /api/result
 * CORS preflight 처리
 */
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Allow': 'GET, OPTIONS',
      },
    }
  )
}
