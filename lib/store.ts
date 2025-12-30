import { createServerSupabaseClient } from './supabase-server'

export type VoteChoice = 'jjajang' | 'jjamppong'

export interface VoteData {
  choice: VoteChoice
  count: number
  updated_at: string
}

export interface VoteResult {
  jjajang: number
  jjamppong: number
  total: number
  updatedAt: string
}

/**
 * 현재 투표 결과를 조회
 */
export async function read(): Promise<VoteResult> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('votes')
    .select('choice, count, updated_at')
    .order('choice')

  if (error) {
    console.error('Error reading votes:', error)
    throw new Error('Failed to read votes')
  }

  const votes = data as VoteData[]
  const jjajang = votes.find(v => v.choice === 'jjajang')?.count || 0
  const jjamppong = votes.find(v => v.choice === 'jjamppong')?.count || 0
  const total = jjajang + jjamppong

  // 가장 최근 업데이트 시간 찾기
  const updatedAt = votes.reduce((latest, current) => {
    return new Date(current.updated_at) > new Date(latest)
      ? current.updated_at
      : latest
  }, votes[0]?.updated_at || new Date().toISOString())

  return {
    jjajang,
    jjamppong,
    total,
    updatedAt,
  }
}

/**
 * 투표 수를 증가시킴 (원자적 업데이트)
 */
export async function increment(choice: VoteChoice): Promise<void> {
  const supabase = await createServerSupabaseClient()

  // Supabase RPC를 사용하여 원자적 업데이트 수행
  const { error } = await supabase.rpc('increment_vote', {
    vote_choice: choice,
  })

  if (error) {
    console.error('Error incrementing vote:', error)
    throw new Error('Failed to increment vote')
  }
}

/**
 * 투표 선택지 검증
 */
export function isValidChoice(choice: string): choice is VoteChoice {
  return choice === 'jjajang' || choice === 'jjamppong'
}
