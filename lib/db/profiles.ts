import { supabaseAdmin } from '@/lib/supabase'
import type { Plan, Profile, CreditTransaction, DecalJob } from '@/lib/supabase/types'

export const PLAN_CREDITS: Record<Plan, number> = {
  free: 0,
  starter: 50,
  pro: 130,
  creator: 210,
}

export async function getOrCreateProfile(
  clerkUserId: string,
  email?: string | null
): Promise<Profile> {
  const { data: existing } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .single()

  if (existing) return existing as Profile

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .insert({
      clerk_user_id: clerkUserId,
      email: email ?? null,
      plan: 'free',
      credits_total: 0,
      credits_used: 0,
      plan_expires_at: null,
    })
    .select('*')
    .single()

  if (error) throw new Error(`Erro ao criar perfil: ${error.message}`)
  return data as Profile
}

export async function getProfile(clerkUserId: string): Promise<Profile | null> {
  const { data } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .single()

  return (data as Profile) ?? null
}

export function getCreditsAvailable(profile: Profile): number {
  return Math.max(0, profile.credits_total - profile.credits_used)
}

export async function debitCredit(
  clerkUserId: string,
  description: string
): Promise<{ ok: boolean; remaining: number }> {
  const profile = await getProfile(clerkUserId)
  if (!profile) return { ok: false, remaining: 0 }

  const remaining = profile.credits_total - profile.credits_used
  if (remaining <= 0) return { ok: false, remaining: 0 }

  await supabaseAdmin
    .from('profiles')
    .update({ credits_used: profile.credits_used + 1 })
    .eq('clerk_user_id', clerkUserId)

  await supabaseAdmin.from('credit_transactions').insert({
    clerk_user_id: clerkUserId,
    type: 'debit',
    amount: 1,
    description,
  } satisfies Omit<CreditTransaction, 'id' | 'created_at'>)

  return { ok: true, remaining: remaining - 1 }
}

export async function getRecentDecals(
  clerkUserId: string,
  limit = 10
): Promise<DecalJob[]> {
  const { data } = await supabaseAdmin
    .from('decal_jobs')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .order('created_at', { ascending: false })
    .limit(limit)

  return (data as DecalJob[]) ?? []
}
