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

const STYLE_PROMPTS: Record<DecalStyleId, string> = {
  espectro: `Convert the provided image into a PROFESSIONAL TATTOO STENCIL made of CONTOUR LINES ONLY.

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

Prioritize vector-like line quality and maximum resolution over artistic style.`,

  sombras: `Convert the provided image into an ADVANCED SHADOW TATTOO STENCIL with directional depth indicators.

Generate the image in ULTRA HIGH RESOLUTION with maximum sharpness and line fidelity.
Output must be suitable for professional print and stencil transfer at VERY HIGH DPI.

Use clean black contour lines for ALL primary forms, combined with FINE PARALLEL HATCHING in shadow and depth areas only.
Hatching lines must be evenly spaced, directional, and methodical — like a traditional engraved stencil.
Light areas remain completely clean (white). Shadow areas use fine parallel lines. Mid-tones use sparse hatching.

DO NOT use solid fills, solid black areas, gray tones, or gradients.
ALL shadow and depth information must be expressed ONLY through evenly-spaced fine line hatching.

Preserve exact proportions, perspective, and all structural details.
The hatching direction must follow the form's curvature — cross-contour hatching only.

Negative space in highlight areas must remain completely empty and clean.

The result must be a PROFESSIONAL SHADOW STENCIL suitable for tattoo artists who work with depth and volume,
optimized for high-resolution printing and precise stencil transfer.`,

  cinzel: `Convert the provided image into a WOODCUT ENGRAVING TATTOO STENCIL in classic copper plate style.

Generate in ULTRA HIGH RESOLUTION for professional print quality.
Output must be suitable for stencil transfer with maximum sharpness.

Use CROSSHATCH and directional line patterns to express ALL tones and textures.
Apply these rules strictly:
- Bright/highlight areas: very sparse single lines or empty white space
- Mid-tones: fine parallel lines, moderately spaced
- Three-quarter tones: two sets of crossing hatching (crosshatch)
- Dark/shadow areas: dense multi-directional crosshatch (3 or more directions)

All lines must be CRISP, UNIFORM in thickness, and precisely spaced like a copper plate or wood engraving.
NO solid fills. ALL shading must be expressed purely through organized LINE WORK.

Lines should follow the contour of forms (cross-contour hatching) to enhance volume.

The style must evoke the graphic energy of classic woodblock prints and traditional tattoo flash sheets.
Bold, energetic, full of directional line tension.

The result must be clean, highly printable, and visually striking — optimized for large-scale tattoo stencil application.`,

  fantasma: `Convert the provided image into an ULTRA-MINIMAL GHOST TATTOO STENCIL.

Generate in ULTRA HIGH RESOLUTION with razor-sharp precision and extreme line delicacy.
Output must be suitable for professional print and stencil transfer.

Use ONLY the absolute essential primary contour lines — the thinnest, most precise outlines possible.
Hair-thin, single-pixel-width strokes only.

ELIMINATE all secondary detail lines, texture, interior marks, decorative elements, and background details.

Capture ONLY:
- The defining outer silhouette of the main subject
- The single most critical interior line that defines the core structure
- Essential facial features reduced to their simplest geometric form

Everything else must be completely clean, empty white space.

NO fills, NO shading, NO hatching, NO crosshatch, NO texture, NO dot work, NO pattern.
Absolutely zero interior detail lines unless critical to identify the subject.

The final result should feel ghostly, minimal, and ethereal — as if the tattoo barely exists on the skin.
A whisper of an image, not a shout.

Perfect for ultra-delicate, minimalist, micro-tattoo applications requiring surgical line precision.`,
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

    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Falha ao gerar decalque.' },
      { status: 500 }
    )
  }
}
