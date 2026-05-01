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

/* ── Estilos de decalque ─────────────────────────────────────── */

export const DECAL_STYLE_IDS = ['espectro', 'sombras', 'cinzel', 'fantasma'] as const
export type DecalStyleId = typeof DECAL_STYLE_IDS[number]

const BASE_PROMPT = `Create a PROFESSIONAL TATTOO STENCIL directly from the input image.

IMPORTANT: This must be a TRACE-BASED STENCIL, not a new drawing.

Use the input image as an exact template underneath the linework, as if tracing over transparent paper.

The final stencil must preserve the EXACT original proportions, angles, positions, distances, perspective, scale, and alignment of the source image.

Every line must be placed exactly over the corresponding visual structure of the original image.

DO NOT redraw.
DO NOT reinterpret.
DO NOT stylize.
DO NOT correct anatomy.
DO NOT beautify.
DO NOT change facial features.
DO NOT change expression.
DO NOT change pose.
DO NOT change perspective.
DO NOT move any element.
DO NOT resize or reshape any part of the image.

The stencil must match the original image when overlaid on top of it.

Preserve the exact placement of:
— eyes
— eyebrows
— nose
— mouth
— lips
— ears
— jawline
— chin
— hairline
— beard
— fingers
— hands
— clothing folds
— accessories
— all important contours

Use ONLY clean black contour lines.

All lines must be solid black, sharp, continuous, and clearly visible.

Use stronger line weight for main outer contours and slightly lighter but still visible lines for internal details.

No gray tones.
No shading.
No gradients.
No filled black areas.
No sketchy lines.
No artistic reinterpretation.
No background changes unless the background is not needed.

Dark areas in the original image must NOT become black filled blocks. Represent them only with clean outline lines and simple internal contour markings.

Subtle shadows that define important structure must be converted into simple contour lines or clean dotted guide marks, but only when necessary.

Dotted marks must be clean, controlled, evenly spaced, and not excessive.

Keep the result clean, readable, and suitable for thermal tattoo stencil printing.

The final result must be a high-contrast, line-only stencil that works as an accurate tracing guide and aligns precisely with the original image.`

const STYLE_PROMPTS: Record<DecalStyleId, string> = {
  espectro: BASE_PROMPT,

  sombras: BASE_PROMPT + `

STYLE ADDITION — SOMBRAS:
In areas where the original image has clear shadow or depth, add fine evenly-spaced parallel hatching lines to indicate volume. Hatching must follow the surface curvature. Light areas remain completely white. All other rules above remain fully in effect.`,

  cinzel: BASE_PROMPT + `

STYLE ADDITION — CINZEL:
In shadow and mid-tone areas, add fine crosshatch lines in the style of a traditional copper plate engraving. Light areas remain white. Dark areas use denser crosshatch. All crosshatch lines must be crisp, uniform, and directional. All other rules above remain fully in effect.`,

  fantasma: BASE_PROMPT + `

STYLE ADDITION — FANTASMA:
Use only the absolute minimum essential lines. Remove all secondary detail lines and internal marks, keeping only the primary silhouette and the most critical structural contours. The result must be extremely minimal, delicate, and almost ethereal. All other rules above remain fully in effect.`,
}

/* ── Utilities ───────────────────────────────────────────────── */

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

/* ── Handler ─────────────────────────────────────────────────── */

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

  const rawStyle = formData.get('style') as string | null
  const style: DecalStyleId = DECAL_STYLE_IDS.includes(rawStyle as DecalStyleId)
    ? (rawStyle as DecalStyleId)
    : 'espectro'

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
      prompt: STYLE_PROMPTS[style],
      n: 1,
      size,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      response_format: 'url' as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    const tempUrl = response.data?.[0]?.url
    if (!tempUrl) throw new Error('PiAPI não retornou URL da imagem')

    const imgRes = await fetch(tempUrl)
    const imgBuffer = Buffer.from(await imgRes.arrayBuffer())
    const outputUrl = await storeOutput(imgBuffer, job.id, userId)

    await supabaseAdmin
      .from('decal_jobs')
      .update({ output_url: outputUrl, status: 'done' })
      .eq('id', job.id)

    await debitCredit(userId, `Decalque IA — ${style}`)

    return NextResponse.json({ jobId: job.id, outputUrl, style })
  } catch (err) {
    console.error('Decal error:', err)
    await supabaseAdmin
      .from('decal_jobs')
      .update({ status: 'failed' })
      .eq('id', job.id)

    const raw = err instanceof Error ? err.message : String(err)
    const userMessage = raw.includes('预扣费') || raw.includes('额度')
      ? 'Serviço temporariamente indisponível. Tente novamente em instantes.'
      : raw.includes('rate limit') || raw.includes('429')
      ? 'Muitas requisições simultâneas. Aguarde alguns segundos e tente novamente.'
      : 'Falha ao gerar decalque. Tente novamente.'

    return NextResponse.json({ error: userMessage }, { status: 500 })
  }
}
