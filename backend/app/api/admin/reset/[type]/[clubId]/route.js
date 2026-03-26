import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

const TABLE_MAP = {
  contracts: 'contracts',
  invoices:  'invoices',
  designs:   'equipment_designs',
  requests:  'requests',
}

// DELETE /api/admin/reset/[type]/[clubId]
export async function DELETE(request, { params }) {
  try {
    const { type, clubId } = params

    if (type === 'points') {
      const { error } = await supabaseAdmin
        .from('points')
        .update({ balance: 0, history: [] })
        .eq('club_id', clubId)
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json({ message: 'Points reset to zero' })
    }

    const table = TABLE_MAP[type]
    if (!table) {
      return NextResponse.json({ error: `Tipo '${type}' no válido` }, { status: 400 })
    }

    const { error } = await supabaseAdmin.from(table).delete().eq('club_id', clubId)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ message: `All ${type} reset` })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}
