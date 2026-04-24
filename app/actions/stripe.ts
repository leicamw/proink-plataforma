'use server'

import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { stripe } from '@/lib/stripe'
import { STRIPE_PLANS } from '@/lib/stripe/plans'
import { getOrCreateProfile } from '@/lib/db/profiles'
import { supabaseAdmin } from '@/lib/supabase'
import type { Plan } from '@/lib/supabase/types'

type CheckoutPlan = Exclude<Plan, 'free'>

async function getOrCreateStripeCustomer(
  clerkUserId: string,
  email: string | null
): Promise<string> {
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('stripe_customer_id')
    .eq('clerk_user_id', clerkUserId)
    .single()

  if (profile?.stripe_customer_id) return profile.stripe_customer_id

  const customer = await stripe.customers.create({
    email: email ?? undefined,
    metadata: { clerk_user_id: clerkUserId },
  })

  await supabaseAdmin
    .from('profiles')
    .update({ stripe_customer_id: customer.id })
    .eq('clerk_user_id', clerkUserId)

  return customer.id
}

export async function createCheckoutSession(plan: CheckoutPlan) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await currentUser()
  const email = user?.emailAddresses?.[0]?.emailAddress ?? null

  await getOrCreateProfile(userId, email)
  const customerId = await getOrCreateStripeCustomer(userId, email)

  const planConfig = STRIPE_PLANS[plan]

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: planConfig.priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?canceled=true`,
    metadata: { clerk_user_id: userId, plan },
    subscription_data: { metadata: { clerk_user_id: userId, plan } },
  })

  redirect(session.url!)
}

export async function createPortalSession() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('stripe_customer_id')
    .eq('clerk_user_id', userId)
    .single()

  if (!profile?.stripe_customer_id) redirect('/dashboard')

  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  })

  redirect(session.url)
}
