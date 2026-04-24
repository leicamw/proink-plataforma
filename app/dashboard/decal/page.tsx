'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import Link from 'next/link'

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

/* ── Estilos de decalque ─────────────────────────────────────── */

type DecalStyleId = 'espectro' | 'sombras' | 'cinzel' | 'fantasma'

interface DecalStyle {
  id: DecalStyleId
  name: string
  tagline: string
  description: string
  preview: React.ReactNode
}

const DECAL_STYLES: DecalStyle[] = [
  {
    id: 'espectro',
    name: 'Espectro',
    tagline: 'Linhas puras de contorno',
    description: 'Stencil clássico com linhas de contorno limpas e precisas. Ideal para qualquer estilo.',
    preview: (
      <svg viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-10 h-10">
        <circle cx="30" cy="22" r="10" />
        <path d="M20 40 Q30 32 40 40" />
        <ellipse cx="30" cy="44" rx="12" ry="4" />
        <circle cx="26" cy="20" r="1.5" />
        <circle cx="34" cy="20" r="1.5" />
        <path d="M26 27 Q30 30 34 27" />
      </svg>
    ),
  },
  {
    id: 'sombras',
    name: 'Sombras',
    tagline: 'Profundidade com hachura fina',
    description: 'Linhas de contorno combinadas com hachura direcional nas áreas de sombra. Dá volume ao design.',
    preview: (
      <svg viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-10 h-10">
        <circle cx="30" cy="22" r="10" />
        <path d="M20 40 Q30 32 40 40" />
        <ellipse cx="30" cy="44" rx="12" ry="4" />
        {/* hachura lateral direita */}
        <line x1="36" y1="15" x2="38" y2="19" strokeWidth="0.7" />
        <line x1="37" y1="18" x2="39" y2="22" strokeWidth="0.7" />
        <line x1="38" y1="21" x2="40" y2="25" strokeWidth="0.7" />
        <line x1="37" y1="24" x2="39" y2="28" strokeWidth="0.7" />
        <line x1="35" y1="27" x2="37" y2="31" strokeWidth="0.7" />
        {/* hachura base */}
        <line x1="20" y1="41" x2="22" y2="44" strokeWidth="0.7" />
        <line x1="23" y1="42" x2="25" y2="45" strokeWidth="0.7" />
        <line x1="26" y1="42.5" x2="28" y2="45.5" strokeWidth="0.7" />
      </svg>
    ),
  },
  {
    id: 'cinzel',
    name: 'Cinzel',
    tagline: 'Entalhado em chapa de cobre',
    description: 'Reticulado cruzado estilo gravura em metal. Cada tom é construído com linhas direcionais precisas.',
    preview: (
      <svg viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-10 h-10">
        <circle cx="30" cy="22" r="10" />
        <path d="M20 40 Q30 32 40 40" />
        {/* crosshatch no interior */}
        <line x1="23" y1="16" x2="28" y2="28" strokeWidth="0.6" />
        <line x1="26" y1="14" x2="31" y2="26" strokeWidth="0.6" />
        <line x1="29" y1="13" x2="34" y2="25" strokeWidth="0.6" />
        <line x1="32" y1="14" x2="37" y2="26" strokeWidth="0.6" />
        {/* cruzamento */}
        <line x1="23" y1="28" x2="35" y2="14" strokeWidth="0.6" />
        <line x1="25" y1="30" x2="37" y2="18" strokeWidth="0.6" />
      </svg>
    ),
  },
  {
    id: 'fantasma',
    name: 'Fantasma',
    tagline: 'Ultra-minimalista e etéreo',
    description: 'Apenas as linhas mais essenciais, na espessura mínima possível. Perfeito para tatuagens delicadas.',
    preview: (
      <svg viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="0.7" className="w-10 h-10" strokeOpacity="0.7">
        <circle cx="30" cy="22" r="10" />
        <path d="M23 30 Q30 38 37 30" />
        <ellipse cx="30" cy="44" rx="10" ry="3" />
      </svg>
    ),
  },
]

/* ── Types ───────────────────────────────────────────────────── */

interface DecalJob {
  id: string
  output_url: string | null
  status: string
  created_at: string
}

/* ── Style card ──────────────────────────────────────────────── */

function StyleCard({
  style,
  selected,
  onSelect,
}: {
  style: DecalStyle
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="relative text-left transition-all duration-200 p-4 flex flex-col gap-2 group"
      style={{
        background: selected ? 'rgba(34,197,94,0.07)' : 'rgba(255,255,255,0.02)',
        border: selected
          ? '1px solid rgba(34,197,94,0.55)'
          : '1px solid rgba(255,255,255,0.07)',
        boxShadow: selected ? '0 0 16px rgba(34,197,94,0.12)' : 'none',
      }}
    >
      {/* icon */}
      <div
        className="mb-1 transition-colors duration-200"
        style={{ color: selected ? '#22c55e' : 'rgba(255,255,255,0.3)' }}
      >
        {style.preview}
      </div>

      <div>
        <div className="flex items-center gap-2 mb-0.5">
          <span
            className="font-bebas text-[18px] tracking-[0.05em] leading-none transition-colors duration-200"
            style={{ color: selected ? '#22c55e' : 'rgba(255,255,255,0.8)' }}
          >
            {style.name}
          </span>
          {selected && (
            <span
              className="text-[8px] font-black uppercase tracking-[0.2em] px-1.5 py-0.5"
              style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}
            >
              Selecionado
            </span>
          )}
        </div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] mb-1.5" style={{ color: selected ? 'rgba(34,197,94,0.7)' : 'rgba(255,255,255,0.2)' }}>
          {style.tagline}
        </p>
        <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {style.description}
        </p>
      </div>

      {/* active dot */}
      {selected && (
        <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#22c55e]" style={{ boxShadow: '0 0 6px rgba(34,197,94,0.8)' }} />
      )}
    </button>
  )
}

/* ── Main component ──────────────────────────────────────────── */

export default function DecalPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [imgDims, setImgDims] = useState<{ w: number; h: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedStyle, setSelectedStyle] = useState<DecalStyleId>('espectro')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [outputUrl, setOutputUrl] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [credits, setCredits] = useState<number | null>(null)
  const [history, setHistory] = useState<DecalJob[]>([])

  const loadHistory = useCallback(async () => {
    const res = await fetch('/api/decal/history').catch(() => null)
    if (!res?.ok) return
    const data = await res.json()
    setHistory(data.decals ?? [])
  }, [])

  useEffect(() => {
    fetch('/api/credits').then(r => r.json()).then(d => setCredits(d.available ?? null)).catch(() => null)
    loadHistory()
  }, [loadHistory])

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith('image/')) return
    setFile(f)
    const url = URL.createObjectURL(f)
    setPreview(url)
    const img = new window.Image()
    img.onload = () => {
      setImgDims({ w: img.naturalWidth, h: img.naturalHeight })
      URL.revokeObjectURL(url)
    }
    img.src = url
    setStatus('idle')
    setOutputUrl(null)
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [handleFile])

  const generate = async () => {
    if (!file) return
    setStatus('loading')
    setErrorMsg('')
    setOutputUrl(null)

    const form = new FormData()
    form.append('image', file)
    form.append('style', selectedStyle)
    if (imgDims) {
      form.append('imgW', String(imgDims.w))
      form.append('imgH', String(imgDims.h))
    }

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
      loadHistory()
    } catch {
      setErrorMsg('Falha de rede. Tente novamente.')
      setStatus('error')
    }
  }

  const generateAnother = () => {
    setStatus('idle')
    setOutputUrl(null)
  }

  const reset = () => {
    setStatus('idle')
    setOutputUrl(null)
    setPreview(null)
    setFile(null)
    setImgDims(null)
  }

  const downloadResult = async (url: string, name?: string) => {
    const res = await fetch(url)
    const blob = await res.blob()
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = name ?? `decalque-proink.png`
    a.click()
  }

  const resultAspect = imgDims ? `${imgDims.w} / ${imgDims.h}` : '1 / 1'
  const activeStyle = DECAL_STYLES.find(s => s.id === selectedStyle)!

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
                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] inline-block" />
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

      {/* ── Conteúdo ───────────────────────────────────────── */}
      <main className="max-w-[1200px] mx-auto px-6 md:px-10 pt-28 pb-20">

        {/* Cabeçalho */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[#22c55e]/40"><CrosshairIcon size={14} /></span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/25">Ferramenta IA</span>
          </div>
          <h1 className="font-bebas text-5xl md:text-6xl tracking-wide mb-3">
            Gerador de <span className="text-[#22c55e] neon-text">Decalques</span>
          </h1>
          <p className="text-white/40 text-sm max-w-lg leading-relaxed">
            Envie qualquer foto ou referência e escolha o estilo de decalque. A IA converte para stencil profissional pronto para impressão e transferência. Cada geração consome 1 crédito.
          </p>
        </div>

        {/* ── SELETOR DE ESTILO ──────────────────────────────── */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/30">
              Estilo do decalque
            </p>
            <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.06), transparent)' }} />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {DECAL_STYLES.map(style => (
              <StyleCard
                key={style.id}
                style={style}
                selected={selectedStyle === style.id}
                onSelect={() => {
                  setSelectedStyle(style.id)
                  if (status === 'done') {
                    setStatus('idle')
                    setOutputUrl(null)
                  }
                }}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* ── ESQUERDA: upload ────────────────────────────── */}
          <div className="space-y-5">

            {/* Drop zone */}
            <div
              className={`relative cursor-pointer transition-all duration-300 ${isDragging ? 'scale-[1.01]' : ''}`}
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
                <div className="relative" style={{ aspectRatio: resultAspect, maxHeight: '420px' }}>
                  <img
                    src={preview}
                    alt="Referência"
                    className="w-full h-full object-contain p-2"
                  />
                  <div className="absolute top-2 left-2 w-5 h-5 border-t border-l border-[#22c55e]/40 bracket-glow" />
                  <div className="absolute top-2 right-2 w-5 h-5 border-t border-r border-[#22c55e]/40 bracket-glow" />
                  <div className="absolute bottom-2 left-2 w-5 h-5 border-b border-l border-[#22c55e]/40 bracket-glow" />
                  <div className="absolute bottom-2 right-2 w-5 h-5 border-b border-r border-[#22c55e]/40 bracket-glow" />
                  <div className="absolute bottom-3 right-3">
                    <span className="px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.15em] bg-black/70 border border-[#22c55e]/30 text-[#22c55e]">
                      {imgDims ? `${imgDims.w}×${imgDims.h}` : file?.name}
                    </span>
                  </div>
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
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
            />

            {/* Estilo selecionado + botão gerar */}
            {file && (
              <div
                className="flex items-center gap-3 px-4 py-2.5 text-[11px]"
                style={{ background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.12)' }}
              >
                <span className="text-[#22c55e]"><SparkleIcon /></span>
                <span className="text-white/40">Estilo:</span>
                <span className="font-bebas text-[15px] text-[#22c55e] tracking-[0.05em]">{activeStyle.name}</span>
                <span className="text-white/20">—</span>
                <span className="text-white/30">{activeStyle.tagline}</span>
              </div>
            )}

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
                  Gerando decalque {activeStyle.name}...
                </>
              ) : (
                <>
                  <SparkleIcon />
                  {status === 'done' ? 'Gerar outro · 1 crédito' : 'Gerar Decalque · 1 crédito'}
                </>
              )}
            </button>

            {status === 'error' && (
              <div className="p-3 border border-red-500/30 bg-red-500/5 text-red-400 text-sm">
                {errorMsg}
              </div>
            )}
          </div>

          {/* ── DIREITA: resultado ──────────────────────────── */}
          <div className="space-y-4">

            {status === 'loading' && (
              <div
                className="flex flex-col items-center justify-center"
                style={{
                  aspectRatio: resultAspect,
                  maxHeight: '500px',
                  border: '1px solid rgba(34,197,94,0.12)',
                  background: 'rgba(255,255,255,0.01)',
                }}
              >
                <div className="relative mb-6">
                  <span className="text-[#22c55e]/30 animate-pulse"><CrosshairIcon size={48} /></span>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border border-[#22c55e]/40 border-t-[#22c55e] rounded-full animate-spin" />
                  </div>
                </div>
                <p className="text-white/40 text-sm mb-1">Gerando estilo <span className="text-[#22c55e]">{activeStyle.name}</span>...</p>
                <p className="text-white/20 text-[11px] uppercase tracking-[0.15em]">{activeStyle.tagline}</p>
              </div>
            )}

            {status === 'idle' && !outputUrl && (
              <div
                className="flex flex-col items-center justify-center text-center"
                style={{
                  aspectRatio: resultAspect,
                  maxHeight: '500px',
                  border: '1px dashed rgba(255,255,255,0.06)',
                  background: 'rgba(255,255,255,0.01)',
                }}
              >
                <span className="text-white/10 mb-4"><CrosshairIcon size={40} /></span>
                <p className="text-white/20 text-sm">O decalque gerado aparecerá aqui</p>
                <p className="text-white/10 text-[11px] mt-2 uppercase tracking-[0.15em]">Escolha um estilo e clique em gerar</p>
              </div>
            )}

            {status === 'done' && outputUrl && (
              <div className="space-y-4">
                <div
                  className="relative overflow-hidden"
                  style={{
                    aspectRatio: resultAspect,
                    maxHeight: '500px',
                    border: '1px solid rgba(34,197,94,0.3)',
                    boxShadow: '0 0 30px rgba(34,197,94,0.08)',
                  }}
                >
                  <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-[#22c55e] z-10 bracket-glow" />
                  <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-[#22c55e] z-10 bracket-glow" />
                  <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-[#22c55e] z-10 bracket-glow" />
                  <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-[#22c55e] z-10 bracket-glow" />

                  <img
                    src={outputUrl}
                    alt="Decalque gerado"
                    className="w-full h-full object-contain p-3"
                  />

                  <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 bg-black/80 border border-[#22c55e]/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                    <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#22c55e]">{activeStyle.name} — Gerado</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => downloadResult(outputUrl, `decalque-${activeStyle.id}-proink-${Date.now()}.png`)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 border border-[#22c55e] text-[#22c55e] text-[11px] font-semibold uppercase tracking-[0.15em] hover:bg-[#22c55e] hover:text-black transition-all duration-200 neon-border"
                  >
                    <DownloadIcon />
                    Baixar
                  </button>
                  <button
                    onClick={generateAnother}
                    className="flex-1 flex items-center justify-center gap-2 py-3 border border-white/15 text-white/50 text-[11px] font-semibold uppercase tracking-[0.15em] hover:border-[#22c55e]/40 hover:text-[#22c55e] transition-all duration-200"
                  >
                    <SparkleIcon />
                    Gerar outro
                  </button>
                  <button
                    onClick={reset}
                    className="px-5 py-3 border border-white/10 text-white/30 text-[11px] font-semibold uppercase tracking-[0.15em] hover:border-white/20 hover:text-white/50 transition-all duration-200"
                  >
                    Nova imagem
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── HISTÓRICO ──────────────────────────────────────── */}
        {history.length > 0 && (
          <div className="mt-16 pt-8 border-t border-white/5">
            <div className="flex items-center justify-between mb-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/25">Seus decalques gerados</p>
              <span className="text-[10px] text-white/20">{history.filter(d => d.status === 'done').length} gerado{history.filter(d => d.status === 'done').length !== 1 ? 's' : ''}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {history.map(decal => (
                <div
                  key={decal.id}
                  className="group relative overflow-hidden"
                  style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', aspectRatio: '1/1' }}
                >
                  {decal.status === 'done' && decal.output_url ? (
                    <>
                      <img
                        src={decal.output_url}
                        alt="Decalque"
                        className="w-full h-full object-contain p-2"
                      />
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2"
                        style={{ background: 'rgba(0,0,0,0.7)' }}
                      >
                        <button
                          onClick={() => downloadResult(decal.output_url!, `decalque-${decal.id}.png`)}
                          className="p-2 border border-[#22c55e]/60 text-[#22c55e] hover:bg-[#22c55e] hover:text-black transition-all"
                          title="Baixar"
                        >
                          <DownloadIcon />
                        </button>
                      </div>
                      <div className="absolute bottom-1.5 left-0 right-0 text-center">
                        <span className="text-[8px] text-white/25">
                          {new Date(decal.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </>
                  ) : decal.status === 'processing' ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-5 h-5 border border-[#22c55e]/40 border-t-[#22c55e] rounded-full animate-spin" />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-[9px] text-red-400/50 uppercase tracking-wider">Falhou</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
