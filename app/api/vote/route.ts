import { NextRequest, NextResponse } from 'next/server'
import { increment, isValidChoice } from '@/lib/store'

// 투표 쿨다운 시간 (밀리초) - 60초
const VOTE_COOLDOWN_MS = 60 * 1000

/**
 * POST /api/vote
 * 투표 처리 API
 *
 * Request Body:
 * {
 *   "choice": "jjajang" | "jjamppong"
 * }
 *
 * Response:
 * Success: { ok: true }
 * Error: { ok: false, message: string }
 *
 * Abuse Prevention:
 * - Cookie-based cooldown (60 seconds between votes)
 * - Returns 429 status if voting too frequently
 */
export async function POST(request: NextRequest) {
  try {
    // 1. 쿨다운 검사 (어뷰징 방지)
    const lastVotedAt = request.cookies.get('lastVotedAt')?.value

    if (lastVotedAt) {
      const lastVoteTime = parseInt(lastVotedAt, 10)
      const currentTime = Date.now()
      const timeSinceLastVote = currentTime - lastVoteTime

      if (timeSinceLastVote < VOTE_COOLDOWN_MS) {
        const remainingSeconds = Math.ceil((VOTE_COOLDOWN_MS - timeSinceLastVote) / 1000)

        return NextResponse.json(
          {
            ok: false,
            message: `너무 자주 투표할 수 없습니다. ${remainingSeconds}초 후 다시 시도해주세요.`,
            remainingSeconds,
            cooldownMs: VOTE_COOLDOWN_MS
          },
          { status: 429 } // Too Many Requests
        )
      }
    }

    // 2. Request body 파싱
    const body = await request.json()
    const { choice } = body

    // 3. 선택값 검증
    if (!choice) {
      return NextResponse.json(
        { ok: false, message: '선택값이 필요합니다.' },
        { status: 400 }
      )
    }

    if (!isValidChoice(choice)) {
      return NextResponse.json(
        { ok: false, message: '유효하지 않은 선택입니다. (jjajang 또는 jjamppong만 가능)' },
        { status: 400 }
      )
    }

    // 4. 투표 수 증가
    await increment(choice)

    // 5. 성공 응답 + 쿨다운 쿠키 설정
    const response = NextResponse.json(
      { ok: true },
      { status: 200 }
    )

    // 쿠키 설정: 마지막 투표 시간 기록
    response.cookies.set('lastVotedAt', Date.now().toString(), {
      httpOnly: true, // 클라이언트 JavaScript에서 접근 불가 (보안)
      secure: process.env.NODE_ENV === 'production', // HTTPS에서만 전송 (프로덕션)
      sameSite: 'lax', // CSRF 방지
      maxAge: VOTE_COOLDOWN_MS / 1000, // 쿠키 유효 시간 (초)
      path: '/', // 모든 경로에서 접근 가능
    })

    return response

  } catch (error) {
    console.error('Vote API error:', error)

    return NextResponse.json(
      { ok: false, message: '투표 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS /api/vote
 * CORS preflight 처리
 */
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Allow': 'POST, OPTIONS',
      },
    }
  )
}
