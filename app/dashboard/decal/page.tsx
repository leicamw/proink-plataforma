'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

/* ── Icons ───────────────────────────────────────────────────── */

function CrosshairIcon({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="20" cy="20" r="8" />
      <line x1="20" y1="0"  x2="20" y2="10" />
      <line x1="20" y1="30" x2="20" y2="40" />
      <line x1="0"  y1="20" x2="10" y2="20" />
      <line x1="30" y1="20" x2="40" y2="20" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="1.5" y1="11.5" x2="11.5" y2="1.5" />
      <polyline points="4.5,1.5 11.5,1.5 11.5,8.5" />
    </svg>
  )
}

function UploadIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

function SparkleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3L13.5 8.5L19 10L13.5 11.5L12 17L10.5 11.5L5 10L10.5 8.5L12 3Z" />
      <path d="M19 3L19.8 5.2L22 6L19.8 6.8L19 9L18.2 6.8L16 6L18.2 5.2L19 3Z" />
      <path d="M5 17L5.5 18.5L7 19L5.5 19.5L5 21L4.5 19.5L3 19L4.5 18.5L5 17Z" />
    </svg>
  )
}

/* ── Main component ──────────────────────────────────────────── */

export default function DecalPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const style = 'stencil'
  const [outputUrl, setOutputUrl] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [credits, setCredits] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/credits')
      .then(r => r.json())
      .then(d => setCredits(d.available ?? null))
      .catch(() => null)
  }, [])

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith('image/')) return
    setFile(f)
    const reader = new FileReader()
    reader.onload = e => setPreview(e.target?.result as string)
    reader.readAsDataURL(f)
    setStatus('idle')
    setOutputUrl(null)
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [handleFile])

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
  }

  const generate = async () => {
    if (!file) return
    setStatus('loading')
    setErrorMsg('')

    const form = new FormData()
    form.append('image', file)
    form.append('style', style)

    try {
      const res = await fetch('/api/decal', { method: 'POST', body: form })
      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error ?? 'Erro desconhecido')
        setStatus('error')
        return
      }

      setOutputUrl(data.outputUrl)
      setStatus('done')
      if (credits !== null) setCredits(c => (c !== null ? c - 1 : c))
    } catch {
      setErrorMsg('Falha de rede. Tente novamente.')
      setStatus('error')
    }
  }

  const downloadResult = () => {
    if (!outputUrl) return
    const a = document.createElement('a')
    a.href = outputUrl
    a.download = `decalque-proink-${style}.png`
    a.target = '_blank'
    a.click()
  }

  return (
    <div className="bg-[#0a0a0a] text-white min-h-screen">

      {/* ── Navbar ─────────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: 'rgba(8,8,8,0.92)',
          backdropFilter: 'blur(16px) saturate(180%)',
          borderBottom: '1px solid rgba(34,197,94,0.08)',
        }}
      >
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="text-[#22c55e] neon-text-sm float"><CrosshairIcon size={22} /></span>
            <div className="leading-none">
              <div className="font-bebas text-[20px] tracking-[0.05em]">
                Pro <span className="text-[#22c55e] neon-text-sm">Ink</span>
              </div>
              <div className="text-[8px] text-white/25 uppercase tracking-[0.22em]">Tattoo Platform</div>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            {credits !== null && (
              <div className="flex items-center gap-2 px-3 py-1.5 border border-white/10 text-[10px] uppercase tracking-[0.15em] text-white/40">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] neon-text-sm inline-block" />
                {credits} créditos
              </div>
            )}
            <Link
              href="/dashboard"
              className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/40 hover:text-[#22c55e] transition-colors"
            >
              ← Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* ── Page content ───────────────────────────────────── */}
      <main className="max-w-[1200px] mx-auto px-6 md:px-10 pt-28 pb-20">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[#22c55e]/40"><CrosshairIcon size={14} /></span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/25">Ferramenta IA</span>
          </div>
          <h1 className="font-bebas text-5xl md:text-6xl tracking-wide mb-3">
            Gerador de <span className="text-[#22c55e] neon-text">Decalques</span>
          </h1>
          <p className="text-white/40 text-sm max-w-lg leading-relaxed">
            Envie qualquer foto de tatuagem ou referência. A IA analisa com GPT-4o e gera um stencil profissional com linhas de contorno puras, pronto para impressão e transferência. Cada geração consome 1 crédito.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* ── LEFT: upload + controls ─────────────────────── */}
          <div className="space-y-6">

            {/* Drop zone */}
            <div
              className={`relative cursor-pointer transition-all duration-300 ${
                isDragging ? 'scale-[1.01]' : ''
              }`}
              style={{
                border: `1px dashed ${isDragging ? 'rgba(34,197,94,0.8)' : 'rgba(34,197,94,0.25)'}`,
                background: isDragging ? 'rgba(34,197,94,0.04)' : 'rgba(255,255,255,0.015)',
                boxShadow: isDragging ? '0 0 20px rgba(34,197,94,0.15)' : 'none',
              }}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
            >
              {preview ? (
                <div className="relative" style={{ height: '340px' }}>
                  <Image
                    src={preview}
                    alt="Referência carregada"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-contain p-2"
                  />
                  <div className="absolute bottom-3 right-3">
                    <span className="px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.15em] bg-black/70 border border-[#22c55e]/30 text-[#22c55e]">
                      {file?.name}
                    </span>
                  </div>
                  {/* Corner brackets */}
                  <div className="absolute top-2 left-2 w-5 h-5 border-t border-l border-[#22c55e]/40 bracket-glow" />
                  <div className="absolute top-2 right-2 w-5 h-5 border-t border-r border-[#22c55e]/40 bracket-glow" />
                  <div className="absolute bottom-2 left-2 w-5 h-5 border-b border-l border-[#22c55e]/40 bracket-glow" />
                  <div className="absolute bottom-2 right-2 w-5 h-5 border-b border-r border-[#22c55e]/40 bracket-glow" />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
                  <span className="text-[#22c55e]/40 mb-4"><UploadIcon /></span>
                  <p className="text-white/60 text-sm font-medium mb-1">Arraste a imagem ou clique para selecionar</p>
                  <p className="text-white/25 text-[11px] uppercase tracking-[0.15em]">JPG, PNG, WEBP — Máx 10MB</p>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onInputChange}
            />

            {/* Spec badge */}
            <div
              className="flex flex-wrap gap-4 p-4"
              style={{ border: '1px solid rgba(34,197,94,0.1)', background: 'rgba(34,197,94,0.03)' }}
            >
              {[
                ['Resolução', '1024×1024'],
                ['Modelo', 'GPT Image 2'],
                ['Saída', 'Linhas puras'],
                ['Fundo', 'Branco limpo'],
              ].map(([label, value]) => (
                <div key={label} className="flex flex-col gap-0.5">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-white/25">{label}</span>
                  <span className="text-[11px] font-semibold text-[#22c55e]">{value}</span>
                </div>
              ))}
            </div>

            {/* Generate button */}
            <button
              onClick={generate}
              disabled={!file || status === 'loading'}
              className={`w-full flex items-center justify-center gap-3 py-4 font-bebas text-xl tracking-[0.1em] transition-all duration-200 ${
                !file || status === 'loading'
                  ? 'opacity-40 cursor-not-allowed border border-white/10 text-white/40'
                  : 'border border-[#22c55e] text-[#22c55e] hover:bg-[#22c55e] hover:text-black neon-border'
              }`}
            >
              {status === 'loading' ? (
                <>
                  <span className="w-4 h-4 border border-[#22c55e] border-t-transparent rounded-full animate-spin" />
                  Analisando e gerando...
                </>
              ) : (
                <>
                  <SparkleIcon />
                  Gerar Decalque · 1 crédito
                </>
              )}
            </button>

            {status === 'error' && (
              <div className="p-3 border border-red-500/30 bg-red-500/05 text-red-400 text-sm">
                {errorMsg}
              </div>
            )}
          </div>

          {/* ── RIGHT: result ───────────────────────────────── */}
          <div className="space-y-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">Resultado</p>

            {status === 'loading' && (
              <div
                className="flex flex-col items-center justify-center"
                style={{ height: '420px', border: '1px solid rgba(34,197,94,0.12)', background: 'rgba(255,255,255,0.01)' }}
              >
                {/* Animated crosshair */}
                <div className="relative mb-6">
                  <span className="text-[#22c55e]/30 animate-pulse"><CrosshairIcon size={48} /></span>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border border-[#22c55e]/40 border-t-[#22c55e] rounded-full animate-spin" />
                  </div>
                </div>
                <p className="text-white/40 text-sm mb-2">Gerando seu decalque...</p>
                <p className="text-white/20 text-[11px] uppercase tracking-[0.15em]">GPT Image 2 — processando...</p>
                <div className="mt-6 w-48 h-px bg-gradient-to-r from-transparent via-[#22c55e]/30 to-transparent scan-line" style={{ position: 'relative', animation: 'none' }}>
                  <div
                    className="absolute top-0 left-0 h-full w-full"
                    style={{
                      background: 'linear-gradient(90deg, transparent 0%, rgba(34,197,94,0.6) 50%, transparent 100%)',
                      animation: 'scan-line 1.5s ease-in-out infinite',
                      width: '30px',
                    }}
                  />
                </div>
              </div>
            )}

            {status === 'idle' && !outputUrl && (
              <div
                className="flex flex-col items-center justify-center text-center"
                style={{ height: '420px', border: '1px dashed rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.01)' }}
              >
                <span className="text-white/10 mb-4"><CrosshairIcon size={40} /></span>
                <p className="text-white/20 text-sm">O decalque gerado aparecerá aqui</p>
                <p className="text-white/10 text-[11px] mt-2 uppercase tracking-[0.15em]">Envie uma imagem e clique em gerar</p>
              </div>
            )}

            {status === 'done' && outputUrl && (
              <div className="space-y-4">
                <div
                  className="relative overflow-hidden"
                  style={{
                    height: '420px',
                    border: '1px solid rgba(34,197,94,0.3)',
                    boxShadow: '0 0 30px rgba(34,197,94,0.08)',
                  }}
                >
                  {/* Corner brackets */}
                  <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-[#22c55e] z-10 bracket-glow" />
                  <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-[#22c55e] z-10 bracket-glow" />
                  <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-[#22c55e] z-10 bracket-glow" />
                  <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-[#22c55e] z-10 bracket-glow" />

                  {/* plain img — works with base64 data URLs from gpt-image-1 */}
                  <img
                    src={outputUrl}
                    alt="Decalque gerado"
                    className="absolute inset-0 w-full h-full object-contain p-4"
                  />

                  {/* Success badge */}
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 bg-black/80 border border-[#22c55e]/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                    <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#22c55e]">Decalque Gerado</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={downloadResult}
                    className="flex-1 flex items-center justify-center gap-2 py-3 border border-[#22c55e] text-[#22c55e] text-[11px] font-semibold uppercase tracking-[0.15em] hover:bg-[#22c55e] hover:text-black transition-all duration-200 neon-border"
                  >
                    <DownloadIcon />
                    Baixar Decalque
                  </button>
                  <button
                    onClick={() => { setStatus('idle'); setOutputUrl(null); setPreview(null); setFile(null) }}
                    className="px-5 py-3 border border-white/10 text-white/40 text-[11px] font-semibold uppercase tracking-[0.15em] hover:border-white/20 hover:text-white/60 transition-all duration-200"
                  >
                    Novo
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* How it works */}
        <div className="mt-16 pt-8 border-t border-white/5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/20 mb-6">Como funciona</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { n: '01', title: 'Upload da Referência', desc: 'Envie qualquer foto de tatuagem, esboço ou referência visual.' },
              { n: '02', title: 'GPT Image 2',             desc: 'O modelo vê a imagem diretamente e converte para stencil com alta fidelidade de estrutura.' },
              { n: '03', title: 'Stencil Profissional',  desc: 'Saída com linhas de contorno puras, pronta para impressão e transferência em máquina de stencil.' },
            ].map(step => (
              <div key={step.n} className="flex gap-4">
                <div className="font-bebas text-3xl text-[#22c55e]/20 leading-none pt-0.5 w-10 shrink-0">{step.n}</div>
                <div>
                  <div className="text-sm font-semibold text-white/60 mb-1">{step.title}</div>
                  <div className="text-[12px] text-white/25 leading-relaxed">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
