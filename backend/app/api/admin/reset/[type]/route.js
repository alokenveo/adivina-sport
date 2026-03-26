import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

const GLOBAL_TABLE_MAP = {
  news:              'news',
  'dashboard-content': 'dashboard_content',
}

// DELETE /api/admin/reset/[type]  (sin clubId — operación global)
export async function DELETE(request, { params }) {
  try {
    const { type } = params

    const table = GLOBAL_TABLE_MAP[type]
    if (!table) {
      return NextResponse.json({ error: `Tipo global '${type}' no válido` }, { status: 400 })
    }

    // Borrar todas las filas de la tabla
    const { error } = await supabaseAdmin.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000')
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ message: `All ${type} reset globally` })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}
