'use server'

import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Preference } from 'mercadopago'
import { mpClient } from '@/lib/mercadopago'
import { MP_PLANS } from '@/lib/mercadopago/plans'
import { getOrCreateProfile } from '@/lib/db/profiles'
import type { Plan } from '@/lib/supabase/types'

type CheckoutPlan = Exclude<Plan, 'free'>

export async function createCheckoutSession(plan: CheckoutPlan) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await currentUser()
  const email = user?.emailAddresses?.[0]?.emailAddress ?? null

  await getOrCreateProfile(userId, email)

  const planConfig = MP_PLANS[plan]
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  const preference = new Preference(mpClient)
  const response = await preference.create({
    body: {
      items: [{
        id: plan,
        title: `Pro Ink Academy — Plano ${planConfig.name}`,
        description: `${planConfig.credits} créditos para geração de decalques IA`,
        quantity: 1,
        unit_price: planConfig.amount,
        currency_id: 'BRL',
      }],
      payer: { email: email ?? undefined },
      external_reference: `${userId}|${plan}`,
      back_urls: {
        success: `${appUrl}/dashboard?success=true`,
        failure: `${appUrl}/dashboard?canceled=true`,
        pending: `${appUrl}/dashboard?pending=true`,
      },
      auto_return: 'approved',
      payment_methods: {
        installments: 1,
      },
      statement_descriptor: 'PRO INK ACADEMY',
    },
  })

  redirect(response.init_point!)
}

export async function createPortalSession() {
  redirect('https://www.mercadopago.com.br/activities')
}
