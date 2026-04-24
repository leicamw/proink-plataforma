import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getRecentDecals } from '@/lib/db/profiles'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ decals: [] })

  const decals = await getRecentDecals(userId, 20)
  return NextResponse.json({ decals })
}
