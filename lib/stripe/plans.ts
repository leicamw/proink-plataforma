import type { Plan } from '@/lib/supabase/types'

export interface PlanConfig {
  name: string
  credits: number
  priceId: string
  price: string
}

export const STRIPE_PLANS: Record<Exclude<Plan, 'free'>, PlanConfig> = {
  starter: {
    name: 'Starter',
    credits: 50,
    priceId: process.env.STRIPE_PRICE_STARTER!,
    price: 'R$ 49/mês',
  },
  pro: {
    name: 'Pro',
    credits: 130,
    priceId: process.env.STRIPE_PRICE_PRO!,
    price: 'R$ 97/mês',
  },
  creator: {
    name: 'Creator',
    credits: 210,
    priceId: process.env.STRIPE_PRICE_CREATOR!,
    price: 'R$ 147/mês',
  },
}
