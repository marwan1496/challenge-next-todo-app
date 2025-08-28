import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

function withCors(body: any, init?: ResponseInit) {
  const headers = new Headers(init?.headers)
  headers.set('Access-Control-Allow-Origin', '*')
  headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  headers.set('Access-Control-Allow-Headers', 'Content-Type, X-Agent-Token')
  return new NextResponse(JSON.stringify(body), {
    ...init,
    headers,
  })
}

export async function OPTIONS() {
  return withCors({ ok: true })
}

export async function POST(request: NextRequest) {
  try {
    // Optional shared-secret check
    const configuredToken = process.env.AGENT_TOKEN
    if (configuredToken) {
      const provided = request.headers.get('x-agent-token') || ''
      if (provided !== configuredToken) {
        return withCors({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const {
      title,
      description = '',
      userEmail,
      userName,
      estimatedPomodoros = 1,
    } = await request.json()

    const normalizedEmail = (userEmail || '').toString().trim().toLowerCase()
    const normalizedName = (userName || '').toString().trim()

    if (!title || !normalizedEmail || !normalizedName) {
      return withCors(
        { error: 'Missing required fields: title, userEmail, userName' },
        { status: 400 }
      )
    }

    // Upsert user by email (create if not exists, update name if changed)
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', normalizedEmail)
      .single()

    if (existingUser) {
      if (existingUser.name !== normalizedName) {
        await supabase.from('users').update({ name: normalizedName }).eq('email', normalizedEmail)
      }
    } else {
      await supabase.from('users').insert([{ email: normalizedEmail, name: normalizedName }])
    }

    const now = new Date().toISOString()
    const newTask = {
      title,
      description,
      estimated_pomodoros: Math.max(1, parseInt(estimatedPomodoros, 10) || 1),
      completed_pomodoros: 0,
      completed: false,
      user_email: normalizedEmail,
      created_at: now,
      updated_at: now,
    }

    const { data: created, error } = await supabase
      .from('tasks')
      .insert([newTask])
      .select()
      .single()

    if (error) {
      return withCors({ error: error.message }, { status: 500 })
    }

    return withCors({ success: true, task: created }, { status: 201 })
  } catch (err: any) {
    return withCors({ error: 'Invalid request' }, { status: 400 })
  }
}


