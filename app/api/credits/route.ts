import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getProfile, getCreditsAvailable } from '@/lib/db/profiles'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ available: 0 })

  const profile = await getProfile(userId)
  return NextResponse.json({ available: profile ? getCreditsAvailable(profile) : 0 })
}
