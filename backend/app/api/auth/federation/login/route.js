import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'

// POST /api/auth/federation/login
export async function POST(request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'username y password requeridos' }, { status: 400 })
    }

    const { data: fedUser, error } = await supabaseAdmin
      .from('federation_users')
      .select('*')
      .eq('username', username)
      .single()

    if (error || !fedUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, fedUser.password_hash)
    if (!valid) {
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 })
    }

    return NextResponse.json({
      token: `federation_${fedUser.id}`,
      username: fedUser.username,
      full_name: fedUser.full_name,
    })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}