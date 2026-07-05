import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { clientIp, rateLimited } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) {
    // Fail loud: empty-string credentials produce baffling Supabase errors
    throw new Error('Supabase env vars missing (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)')
  }
  return createClient(url, key)
}

export async function GET(request: NextRequest) {
  // Auth-gated by middleware; this is defense in depth against a leaked cookie
  if (rateLimited(`analytics:${clientIp(request)}`, 60, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  try {
    const sessionId = request.nextUrl.searchParams.get('session_id')
    if (!sessionId) {
      return NextResponse.json({ error: 'session_id required' }, { status: 400 })
    }

    const supabase = getSupabase()

    const { data: messages, error } = await supabase
      .from('conversation_messages')
      .select('turn_number, role, content, message_intent, created_at')
      .eq('session_id', sessionId)
      .order('turn_number', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) throw error

    return NextResponse.json({ messages: messages || [] })
  } catch (error) {
    console.error('Transcript API error:', error)
    return NextResponse.json({ error: 'Failed to fetch transcript' }, { status: 500 })
  }
}
