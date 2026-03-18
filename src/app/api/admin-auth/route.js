import { NextResponse } from 'next/server'

const ADMIN_USER = process.env.ADMIN_USER
const ADMIN_PASS = process.env.ADMIN_PASS

export async function POST(request) {
  const { usuario, contrasena } = await request.json()

  if (usuario === ADMIN_USER && contrasena === ADMIN_PASS) {
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 })
}