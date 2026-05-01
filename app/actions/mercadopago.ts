'use server'

import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { PreApproval } from 'mercadopago'
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

  const preApproval = new PreApproval(mpClient)
  const response = await preApproval.create({
    body: {
      reason: `Pro Ink Academy — Plano ${planConfig.name}`,
      external_reference: `${userId}|${plan}`,
      payer_email: email ?? undefined,
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: planConfig.amount,
        currency_id: 'BRL',
      },
      back_url: `${appUrl}/dashboard?success=true`,
      status: 'pending',
    },
  })

  redirect(response.init_point!)
}

export async function createPortalSession() {
  redirect('https://www.mercadopago.com.br/subscriptions')
}
