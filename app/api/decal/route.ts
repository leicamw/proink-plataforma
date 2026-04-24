import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import OpenAI from 'openai'
import { supabaseAdmin } from '@/lib/supabase'
import { getProfile, getCreditsAvailable, debitCredit } from '@/lib/db/profiles'

export const maxDuration = 120

const piapi = new OpenAI({
  apiKey: process.env.PIAPI_API_KEY!,
  baseURL: 'https://api.piapi.ai/v1',
})

const OUTPUT_BUCKET = 'decal-outputs'

const STENCIL_PROMPT = `Convert the provided image into a PROFESSIONAL TATTOO STENCIL made of CONTOUR LINES ONLY.

Generate the image in ULTRA HIGH RESOLUTION, prioritizing maximum sharpness and line fidelity.
Output must be suitable for professional print and stencil transfer, with VERY HIGH DPI (print-quality resolution) and high megapixel density, allowing deep zoom without loss of detail.

Use ONLY clean, continuous black contour lines with HARD, CRISP edges.
Lines must be smooth, stable, and well-defined — NOT sketchy, NOT pixelated, and NOT anti-aliased.

DO NOT use any solid black areas, fills, shading, gray tones, gradients, hatching, dots, textures, or tonal interpretation.
Absolutely NO FILL anywhere in the image.

All shapes, symbols, numbers, suits, dice dots, and graphic elements must be represented ONLY by precise outlines.

Preserve exact proportions, perspective, and structure of all elements.
Hiper details ONLY when necessary to maintain stencil clarity and print precision.

All negative space must remain completely clean and empty.

Simplify the background aggressively, outlining only essential interacting elements.
Exclude all decorative or unnecessary details.

The final result must be a CLEAN, PURE LINE, HIGH-CONTRAST tattoo stencil,
optimized for high-resolution printing, stencil machines, and large-scale tattoo application.

Prioritize vector-like line quality and maximum resolution over artistic style.`

function pickSize(w: number, h: number): '1024x1024' | '1024x1536' | '1536x1024' {
  const ratio = w / h
  if (ratio > 1.2) return '1536x1024'
  if (ratio < 0.8) return '1024x1536'
  return '1024x1024'
}

async function storeOutput(buffer: Buffer, jobId: string, userId: string): Promise<string> {
  await supabaseAdmin.storage.createBucket(OUTPUT_BUCKET, { public: true }).catch(() => null)

  const path = `${userId}/${jobId}.png`
  await supabaseAdmin.storage
    .from(OUTPUT_BUCKET)
    .upload(path, buffer, { contentType: 'image/png', upsert: true })

  const { data } = supabaseAdmin.storage.from(OUTPUT_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const profile = await getProfile(userId)
  if (!profile) return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })

  if (getCreditsAvailable(profile) <= 0) {
    return NextResponse.json(
      { error: 'Sem créditos disponíveis. Faça upgrade do seu plano.' },
      { status: 402 }
    )
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Falha ao processar formulário' }, { status: 400 })
  }

  const imageFile = formData.get('image') as File | null
  if (!imageFile) return NextResponse.json({ error: 'Imagem obrigatória' }, { status: 400 })

  // Proporção enviada pelo cliente
  const imgW = parseInt(formData.get('imgW') as string || '0', 10)
  const imgH = parseInt(formData.get('imgH') as string || '0', 10)
  const size = imgW > 0 && imgH > 0 ? pickSize(imgW, imgH) : '1024x1024'

  const { data: job, error: jobError } = await supabaseAdmin
    .from('decal_jobs')
    .insert({ clerk_user_id: userId, status: 'processing' })
    .select()
    .single()

  if (jobError || !job) {
    return NextResponse.json({ error: 'Erro ao iniciar job' }, { status: 500 })
  }

  try {
    const response = await piapi.images.edit({
      model: 'gpt-image-2-preview',
      image: imageFile,
      prompt: STENCIL_PROMPT,
      n: 1,
      size,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      response_format: 'url' as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    const tempUrl = response.data?.[0]?.url
    if (!tempUrl) throw new Error('PiAPI não retornou URL da imagem')

    // Baixa e armazena permanentemente no Supabase Storage
    const imgRes = await fetch(tempUrl)
    const imgBuffer = Buffer.from(await imgRes.arrayBuffer())
    const outputUrl = await storeOutput(imgBuffer, job.id, userId)

    await supabaseAdmin
      .from('decal_jobs')
      .update({ output_url: outputUrl, status: 'done' })
      .eq('id', job.id)

    await debitCredit(userId, 'Decalque IA — GPT Image 2')

    return NextResponse.json({ jobId: job.id, outputUrl })
  } catch (err) {
    console.error('Decal error:', err)
    await supabaseAdmin
      .from('decal_jobs')
      .update({ status: 'failed' })
      .eq('id', job.id)

    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Falha ao gerar decalque.' },
      { status: 500 }
    )
  }
}
