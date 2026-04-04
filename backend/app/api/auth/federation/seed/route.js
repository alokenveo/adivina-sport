import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'

// GET /api/auth/federation/seed?key=SEED_SECRET
// Crea el usuario federación por defecto. Ejecutar una sola vez.
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')

  if (key !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const hash = await bcrypt.hash('federacion2026', 12)
    await supabaseAdmin
      .from('federation_users')
      .upsert([{
        username: 'federacion',
        password_hash: hash,
        full_name: 'Federación Ecuatoguineana de Fútbol',
      }], { onConflict: 'username' })

    return NextResponse.json({ ok: true, message: 'Usuario federación creado. Password: federacion2026' })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}