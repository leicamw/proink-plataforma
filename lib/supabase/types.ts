export type Plan = 'free' | 'starter' | 'pro' | 'creator'
export type TransactionType = 'credit' | 'debit'
export type DecalStatus = 'pending' | 'processing' | 'done' | 'failed'

export interface Profile {
  id: string
  clerk_user_id: string
  email: string | null
  plan: Plan
  credits_total: number
  credits_used: number
  plan_expires_at: string | null
  stripe_customer_id?: string | null
  stripe_subscription_id?: string | null
  created_at: string
  updated_at: string
}

export interface CreditTransaction {
  id: string
  clerk_user_id: string
  type: TransactionType
  amount: number
  description: string | null
  created_at: string
}

export interface DecalJob {
  id: string
  clerk_user_id: string
  input_url: string | null
  output_url: string | null
  status: DecalStatus
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: {
          id?: string
          clerk_user_id: string
          email?: string | null
          plan?: Plan
          credits_total?: number
          credits_used?: number
          plan_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          email?: string | null
          plan?: Plan
          credits_total?: number
          credits_used?: number
          plan_expires_at?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
      }
      credit_transactions: {
        Row: CreditTransaction
        Insert: {
          id?: string
          clerk_user_id: string
          type: TransactionType
          amount: number
          description?: string | null
          created_at?: string
        }
        Update: Record<string, never>
      }
      decal_jobs: {
        Row: DecalJob
        Insert: {
          id?: string
          clerk_user_id: string
          input_url?: string | null
          output_url?: string | null
          status?: DecalStatus
          created_at?: string
        }
        Update: {
          input_url?: string | null
          output_url?: string | null
          status?: DecalStatus
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
