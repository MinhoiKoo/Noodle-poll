'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface VoteResult {
  jjajang: number
  jjamppong: number
  total: number
  updatedAt: string
}

export default function ResultPage() {
  const [result, setResult] = useState<VoteResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)

  // 결과 조회 함수
  const fetchResult = async (isBackgroundRefresh = false) => {
    try {
      if (!isBackgroundRefresh) {
        setIsRefreshing(true)
      }

      const response = await fetch('/api/result', {
        cache: 'no-store',
      })

      if (!response.ok) {
        throw new Error('결과 조회에 실패했습니다.')
      }

      const data = await response.json()
      setResult(data)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : '결과 조회 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // 페이지 로드 시 결과 조회
  useEffect(() => {
    fetchResult()
  }, [])

  // 실시간 자동 갱신 (3초마다 폴링)
  useEffect(() => {
    if (!autoRefresh) return

    const intervalId = setInterval(() => {
      fetchResult(true) // 백그라운드 갱신
    }, 3000) // 3초마다

    // 클린업
    return () => clearInterval(intervalId)
  }, [autoRefresh])

  // 승률 계산
  const getPercentage = (count: number, total: number) => {
    if (total === 0) return 0
    return Math.round((count / total) * 100)
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <p className="mt-4 text-gray-600">결과를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  // 에러 상태
  if (error || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              오류가 발생했습니다
            </h1>
            <p className="text-gray-600 mb-6">{error || '결과를 불러올 수 없습니다.'}</p>
            <button
              onClick={() => fetchResult()}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    )
  }

  const jjajangPercent = getPercentage(result.jjajang, result.total)
  const jjamppongPercent = getPercentage(result.jjamppong, result.total)
  const winner = result.jjajang > result.jjamppong ? 'jjajang' : result.jjamppong > result.jjajang ? 'jjamppong' : 'tie'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              📊 투표 결과
            </h1>
            <p className="text-gray-500 text-sm">
              총 {result.total}표 참여
            </p>
          </div>

          {/* 결과 카드 */}
          <div className="space-y-4 mb-6">
            {/* 짜장면 */}
            <div className={`
              relative p-6 rounded-xl border-2 transition-all
              ${winner === 'jjajang' ? 'border-orange-500 bg-orange-50 shadow-lg' : 'border-gray-200'}
            `}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <span className="text-3xl mr-3">🍜</span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">짜장면</h3>
                    {winner === 'jjajang' && (
                      <span className="text-xs font-semibold text-orange-600">👑 우승!</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-800">{result.jjajang}</div>
                  <div className="text-sm text-gray-500">표</div>
                </div>
              </div>
              {/* 진행률 바 */}
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-orange-400 to-orange-500 h-full transition-all duration-500"
                  style={{ width: `${jjajangPercent}%` }}
                ></div>
              </div>
              <div className="text-right mt-2">
                <span className="text-lg font-semibold text-orange-600">{jjajangPercent}%</span>
              </div>
            </div>

            {/* 짬뽕 */}
            <div className={`
              relative p-6 rounded-xl border-2 transition-all
              ${winner === 'jjamppong' ? 'border-red-500 bg-red-50 shadow-lg' : 'border-gray-200'}
            `}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <span className="text-3xl mr-3">🍲</span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">짬뽕</h3>
                    {winner === 'jjamppong' && (
                      <span className="text-xs font-semibold text-red-600">👑 우승!</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-800">{result.jjamppong}</div>
                  <div className="text-sm text-gray-500">표</div>
                </div>
              </div>
              {/* 진행률 바 */}
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-red-400 to-red-500 h-full transition-all duration-500"
                  style={{ width: `${jjamppongPercent}%` }}
                ></div>
              </div>
              <div className="text-right mt-2">
                <span className="text-lg font-semibold text-red-600">{jjamppongPercent}%</span>
              </div>
            </div>

            {/* 무승부 메시지 */}
            {winner === 'tie' && result.total > 0 && (
              <div className="text-center py-4">
                <p className="text-lg font-semibold text-gray-600">
                  🤝 무승부입니다!
                </p>
              </div>
            )}
          </div>

          {/* 자동 갱신 상태 및 업데이트 시간 */}
          <div className="mb-6">
            {/* 자동 갱신 토글 */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`
                  relative inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${autoRefresh
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                <div className={`
                  w-2 h-2 rounded-full
                  ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}
                `}></div>
                {autoRefresh ? '실시간 갱신 켜짐' : '실시간 갱신 꺼짐'}
              </button>
            </div>

            {/* 업데이트 시간 */}
            <div className="text-center text-xs text-gray-400">
              <span className="inline-flex items-center gap-1">
                {isRefreshing && (
                  <svg className="animate-spin h-3 w-3 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                마지막 업데이트: {new Date(result.updatedAt).toLocaleString('ko-KR')}
              </span>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="space-y-3">
            <Link
              href="/vote"
              className="block w-full py-3 px-6 bg-gradient-to-r from-orange-500 to-red-500 text-white text-center font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 transition-all shadow-lg hover:shadow-xl"
            >
              다시 투표하기 🗳️
            </Link>
            <button
              onClick={() => fetchResult()}
              disabled={isRefreshing}
              className={`
                w-full py-3 px-6 font-semibold rounded-xl transition-colors
                ${isRefreshing
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {isRefreshing ? '새로고침 중...' : '🔄 수동 새로고침'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
