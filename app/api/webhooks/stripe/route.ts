import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { STRIPE_PLANS } from '@/lib/stripe/plans'
import { supabaseAdmin } from '@/lib/supabase'
import type { Plan } from '@/lib/supabase/types'
import type Stripe from 'stripe'

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!

async function assignPlan(
  clerkUserId: string,
  plan: Exclude<Plan, 'free'>,
  subscriptionId: string,
  periodEnd: number
) {
  const credits = STRIPE_PLANS[plan].credits

  await supabaseAdmin
    .from('profiles')
    .update({
      plan,
      credits_total: credits,
      credits_used: 0,
      stripe_subscription_id: subscriptionId,
      plan_expires_at: new Date(periodEnd * 1000).toISOString(),
    })
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
    })
    .eq('clerk_user_id', clerkUserId)
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode !== 'subscription') break

        const clerkUserId = session.metadata?.clerk_user_id
        const plan = session.metadata?.plan as Exclude<Plan, 'free'>
        const subId = typeof session.subscription === 'string'
          ? session.subscription
          : session.subscription?.id

        if (clerkUserId && plan && subId) {
          const sub = await stripe.subscriptions.retrieve(subId)
          const periodEnd = (sub as unknown as { current_period_end: number }).current_period_end
          await assignPlan(clerkUserId, plan, sub.id, periodEnd)
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string | Stripe.Subscription; billing_reason?: string }
        const subId = typeof invoice.subscription === 'string'
          ? invoice.subscription
          : invoice.subscription?.id

        if (!subId) break

        const sub = await stripe.subscriptions.retrieve(subId)
        const clerkUserId = sub.metadata?.clerk_user_id
        const plan = sub.metadata?.plan as Exclude<Plan, 'free'>
        const periodEnd = (sub as unknown as { current_period_end: number }).current_period_end

        if (clerkUserId && plan && invoice.billing_reason === 'subscription_cycle') {
          await assignPlan(clerkUserId, plan, sub.id, periodEnd)
        }
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const clerkUserId = sub.metadata?.clerk_user_id
        const plan = sub.metadata?.plan as Exclude<Plan, 'free'>
        const periodEnd = (sub as unknown as { current_period_end: number }).current_period_end

        if (clerkUserId && plan && sub.status === 'active') {
          await assignPlan(clerkUserId, plan, sub.id, periodEnd)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const clerkUserId = sub.metadata?.clerk_user_id
        if (clerkUserId) await resetToFree(clerkUserId)
        break
      }
    }
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
