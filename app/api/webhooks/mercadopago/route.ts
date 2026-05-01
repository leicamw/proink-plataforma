import { NextRequest, NextResponse } from 'next/server'
import { Payment } from 'mercadopago'
import { mpClient } from '@/lib/mercadopago'
import { MP_PLANS } from '@/lib/mercadopago/plans'
import { supabaseAdmin } from '@/lib/supabase'
import type { Plan } from '@/lib/supabase/types'
import crypto from 'crypto'

const WEBHOOK_SECRET = process.env.MP_WEBHOOK_SECRET ?? ''

function validateSignature(req: NextRequest, body: string): boolean {
  if (!WEBHOOK_SECRET) return true // skip in dev if not set
  const signature = req.headers.get('x-signature') ?? ''
  const requestId = req.headers.get('x-request-id') ?? ''
  const parts = Object.fromEntries(signature.split(',').map(p => p.split('=') as [string, string]))
  const { ts, v1 } = parts
  if (!ts || !v1) return false
  let dataId = ''
  try { dataId = JSON.parse(body)?.data?.id ?? '' } catch { return false }
  const message = `id:${dataId};request-id:${requestId};ts:${ts};`
  const expected = crypto.createHmac('sha256', WEBHOOK_SECRET).update(message).digest('hex')
  return expected === v1
}

async function assignPlan(clerkUserId: string, plan: Exclude<Plan, 'free'>, subscriptionId: string) {
  const credits = MP_PLANS[plan].credits
  const periodEnd = new Date()
  periodEnd.setMonth(periodEnd.getMonth() + 1)

  await supabaseAdmin
    .from('profiles')
    .update({
      plan,
      credits_total: credits,
      credits_used: 0,
      stripe_subscription_id: subscriptionId,
      plan_expires_at: periodEnd.toISOString(),
    } as any)
    .eq('clerk_user_id', clerkUserId)

  await supabaseAdmin.from('credit_transactions').insert({
    clerk_user_id: clerkUserId,
    type: 'credit',
    amount: credits,
    description: `Plano ${plan} — créditos do mês`,
  })
}

async function resetToFree(clerkUserId: string) {
  await supabaseAdmin
    .from('profiles')
    .update({
      plan: 'free',
      credits_total: 0,
      credits_used: 0,
      stripe_subscription_id: null,
      plan_expires_at: null,
    } as any)
    .eq('clerk_user_id', clerkUserId)
}

export async function POST(req: NextRequest) {
  const body = await req.text()

  if (!validateSignature(req, body)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  let event: { type: string; action?: string; data: { id: string } }
  try { event = JSON.parse(body) } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  try {
    if (event.type === 'payment') {
      const paymentClient = new Payment(mpClient)
      const payment = await paymentClient.get({ id: Number(event.data.id) })

      const externalRef = payment.external_reference ?? ''
      const [clerkUserId, plan] = externalRef.split('|') as [string, Plan]
      if (!clerkUserId || !plan || plan === 'free') return NextResponse.json({ received: true })
      const paidPlan = plan as Exclude<Plan, 'free'>

      if (payment.status === 'approved') {
        await assignPlan(clerkUserId, paidPlan, String(payment.id))
      } else if (payment.status === 'refunded' || payment.status === 'cancelled') {
        await resetToFree(clerkUserId)
      }
    }
  } catch (err) {
    console.error('MP Webhook error:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
