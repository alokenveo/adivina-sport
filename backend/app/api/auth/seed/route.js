import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'

// GET /api/auth/seed  → inicializa admin y clubes de prueba
// Solo ejecutar una vez. Protegido con una clave de entorno.
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')

  if (key !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // 1. Crear admin
    const adminHash = await bcrypt.hash('adivina2026', 12)
    await supabaseAdmin
      .from('admins')
      .upsert([{ username: 'admin', password_hash: adminHash }], { onConflict: 'username' })

    // 2. Clubes de prueba
    const clubsData = [
      { id: 'nueva-era',    name: 'Nueva era',    password: 'nuevaera123' },
      { id: 'adamm',        name: 'A.D.A.M.M',    password: 'adamm123' },
      { id: 'feguibasket',  name: 'feguibasket',  password: 'feguibasket123' },
      { id: 'movistar',     name: 'Movistar',     password: 'movistar123' },
    ]

    for (const c of clubsData) {
      const hash = await bcrypt.hash(c.password, 12)
      await supabaseAdmin
        .from('clubs')
        .upsert([{
          id: c.id,
          name: c.name,
          password_hash: hash,
          status: 'active',
          crest_url: null,
        }], { onConflict: 'id' })

      // Perfil vacío
      await supabaseAdmin
        .from('club_profiles')
        .upsert([{ club_id: c.id }], { onConflict: 'club_id' })

      // Puntos iniciales
      await supabaseAdmin
        .from('points')
        .upsert([{ club_id: c.id, balance: 1250, history: [
          { date: '2025-01-15', action: 'Purchase', points: 450, description: 'Order completed' },
          { date: '2025-01-20', action: 'Bonus',    points: 200, description: 'Early payment bonus' },
          { date: '2025-02-01', action: 'Purchase', points: 250, description: 'Equipment order' },
        ]}], { onConflict: 'club_id' })

      // Contratos de prueba
      await supabaseAdmin.from('contracts').insert([
        {
          club_id: c.id,
          title: 'Contrato de Kit Temporada 2025-2026',
          description: 'Acuerdo de suministro de kit completo para temporada',
          start_date: '2025-06-01',
          end_date: '2026-05-31',
          value: 25000,
          status: 'active',
          date: '2025-06-01',
        },
      ])
    }

    return NextResponse.json({ ok: true, message: 'Seed completado correctamente' })
  } catch (err) {
    console.error('Seed error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
