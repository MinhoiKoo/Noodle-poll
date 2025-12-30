import { createBrowserClient } from '@supabase/ssr'

/**
 * 브라우저 환경에서 사용하는 Supabase 클라이언트
 * 자동으로 쿠키를 관리하며 싱글톤 패턴으로 동작
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
