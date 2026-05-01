import type { Plan } from '@/lib/supabase/types'

export interface PlanConfig {
  name: string
  credits: number
  amount: number
  price: string
}

export const MP_PLANS: Record<Exclude<Plan, 'free'>, PlanConfig> = {
  starter: { name: 'Starter', credits: 50,  amount: 49,  price: 'R$ 49/mês' },
  pro:     { name: 'Pro',     credits: 130, amount: 97,  price: 'R$ 97/mês' },
  creator: { name: 'Creator', credits: 210, amount: 147, price: 'R$ 147/mês' },
}
