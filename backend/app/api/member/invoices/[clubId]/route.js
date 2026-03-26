import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

function calcInterest(invoice) {
  const today = new Date()
  const dueDate = new Date(invoice.due_date)
  const graceEnd = new Date(dueDate)
  graceEnd.setDate(graceEnd.getDate() + (invoice.grace_period_days || 15))

  if (invoice.paid) {
    return { status: 'paid', total_due: invoice.amount, interest_amount: 0 }
  }

  if (today > graceEnd) {
    const daysOverdue = Math.ceil((today - graceEnd) / (1000 * 60 * 60 * 24))
    const monthsOverdue = daysOverdue / 30
    const interestAmount = invoice.amount * ((invoice.interest_rate || 5) / 100) * monthsOverdue
    return {
      status: 'overdue',
      total_due: Math.round((invoice.amount + interestAmount) * 100) / 100,
      interest_amount: Math.round(interestAmount * 100) / 100,
      days_overdue: daysOverdue,
    }
  }

  if (today > dueDate) {
    return { status: 'grace_period', total_due: invoice.amount, interest_amount: 0 }
  }

  return { status: 'pending', total_due: invoice.amount, interest_amount: 0 }
}

// GET /api/member/invoices/[clubId]
export async function GET(request, { params }) {
  const { clubId } = params

  const { data, error } = await supabaseAdmin
    .from('invoices')
    .select('*')
    .eq('club_id', clubId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json([], { status: 500 })

  const enriched = data.map(inv => ({
    ...inv,
    ...calcInterest(inv),
  }))

  return NextResponse.json(enriched)
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}
