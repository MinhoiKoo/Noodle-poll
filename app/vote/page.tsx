'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface VoteErrorResponse {
  ok: false
  message: string
  remainingSeconds?: number
  cooldownMs?: number
}

export default function VotePage() {
  const router = useRouter()
  const [selectedChoice, setSelectedChoice] = useState<'jjajang' | 'jjamppong' | ''>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [cooldownSeconds, setCooldownSeconds] = useState<number | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setCooldownSeconds(null)

    // 선택 검증
    if (!selectedChoice) {
      setError('짜장면 또는 짬뽕을 선택해주세요.')
      return
    }

    setIsSubmitting(true)

    try {
      // POST /api/vote 호출
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ choice: selectedChoice }),
      })

      const data = await response.json()

      // 쿨다운 에러 처리 (429 Too Many Requests)
      if (response.status === 429) {
        const errorData = data as VoteErrorResponse
        setError(errorData.message || '너무 자주 투표할 수 없습니다.')
        if (errorData.remainingSeconds) {
          setCooldownSeconds(errorData.remainingSeconds)

          // 카운트다운 타이머
          const countdown = setInterval(() => {
            setCooldownSeconds((prev) => {
              if (prev === null || prev <= 1) {
                clearInterval(countdown)
                return null
              }
              return prev - 1
            })
          }, 1000)
        }
        setIsSubmitting(false)
        return
      }

      if (!response.ok || !data.ok) {
        throw new Error(data.message || '투표 처리 중 오류가 발생했습니다.')
      }

      // 성공 시 결과 페이지로 이동
      router.push('/result')
    } catch (err) {
      setError(err instanceof Error ? err.message : '투표 처리 중 오류가 발생했습니다.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              🍜 vs 🍲
            </h1>
            <h2 className="text-2xl font-semibold text-gray-700 mb-1">
              짜장면 vs 짬뽕
            </h2>
            <p className="text-gray-500 text-sm">
              당신의 선택은?
            </p>
          </div>

          {/* 투표 폼 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 선택지 */}
            <div className="space-y-3">
              {/* 짜장면 */}
              <label
                className={`
                  flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all
                  ${selectedChoice === 'jjajang'
                    ? 'border-orange-500 bg-orange-50 shadow-md'
                    : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/50'
                  }
                `}
              >
                <input
                  type="radio"
                  name="choice"
                  value="jjajang"
                  checked={selectedChoice === 'jjajang'}
                  onChange={(e) => setSelectedChoice(e.target.value as 'jjajang')}
                  className="w-5 h-5 text-orange-500 focus:ring-orange-500"
                  disabled={isSubmitting}
                />
                <span className="ml-3 flex items-center text-lg font-medium text-gray-800">
                  <span className="text-2xl mr-2">🍜</span>
                  짜장면
                </span>
              </label>

              {/* 짬뽕 */}
              <label
                className={`
                  flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all
                  ${selectedChoice === 'jjamppong'
                    ? 'border-red-500 bg-red-50 shadow-md'
                    : 'border-gray-200 hover:border-red-300 hover:bg-red-50/50'
                  }
                `}
              >
                <input
                  type="radio"
                  name="choice"
                  value="jjamppong"
                  checked={selectedChoice === 'jjamppong'}
                  onChange={(e) => setSelectedChoice(e.target.value as 'jjamppong')}
                  className="w-5 h-5 text-red-500 focus:ring-red-500"
                  disabled={isSubmitting}
                />
                <span className="ml-3 flex items-center text-lg font-medium text-gray-800">
                  <span className="text-2xl mr-2">🍲</span>
                  짬뽕
                </span>
              </label>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className={`
                p-4 border rounded-lg
                ${cooldownSeconds !== null
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-red-50 border-red-200'
                }
              `}>
                <p className={`
                  text-sm text-center font-medium
                  ${cooldownSeconds !== null ? 'text-yellow-700' : 'text-red-600'}
                `}>
                  {cooldownSeconds !== null ? '⏰' : '⚠️'} {error}
                </p>
                {cooldownSeconds !== null && (
                  <div className="mt-3 flex items-center justify-center">
                    <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 rounded-full">
                      <div className="relative">
                        <svg className="w-6 h-6 transform -rotate-90">
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="none"
                            className="text-yellow-200"
                          />
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 10}`}
                            strokeDashoffset={`${2 * Math.PI * 10 * (1 - cooldownSeconds / 60)}`}
                            className="text-yellow-600 transition-all duration-1000"
                          />
                        </svg>
                      </div>
                      <span className="text-lg font-bold text-yellow-700">
                        {cooldownSeconds}초
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 투표 버튼 */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`
                w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all
                ${isSubmitting
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl'
                }
              `}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  투표 중...
                </span>
              ) : (
                '투표하기 🗳️'
              )}
            </button>
          </form>

          {/* 푸터 */}
          <div className="mt-6 text-center">
            <a
              href="/result"
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              투표하지 않고 결과만 보기
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
