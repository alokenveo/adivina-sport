import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// PUT /api/admin/requests/[requestId]
export async function PUT(request, { params }) {
  try {
    const { requestId } = params
    const formData = await request.formData()
    const status = formData.get('status')
    const response = formData.get('response')

    const { error } = await supabaseAdmin
      .from('requests')
      .update({ status, admin_response: response })
      .eq('id', requestId)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ message: 'Request updated' })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}
