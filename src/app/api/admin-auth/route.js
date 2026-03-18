import { NextResponse } from 'next/server'

const ADMIN_USER = 'admin@adivinasports.com'
const ADMIN_PASS = 'admin123'

export async function POST(request) {
  const { usuario, contrasena } = await request.json()

  if (usuario === ADMIN_USER && contrasena === ADMIN_PASS) {
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 })
}