'use client'

import { useState } from 'react'

export function NotifyButton() {
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle')

  const handleClick = async () => {
    setState('loading')
    await new Promise(r => setTimeout(r, 800))
    setState('done')
  }

  if (state === 'done') {
    return (
      <div
        className="inline-flex items-center gap-2.5 px-6 py-3 text-[11px] font-black uppercase tracking-[0.18em]"
        style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e' }}
      >
        <span className="w-2 h-2 rounded-full bg-[#22c55e]" style={{ boxShadow: '0 0 6px rgba(34,197,94,0.8)' }} />
        Notificação ativada
      </div>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={state === 'loading'}
      className="inline-flex items-center gap-2.5 px-6 py-3 text-[11px] font-black uppercase tracking-[0.18em] transition-all duration-200 hover:bg-[#22c55e] hover:text-black disabled:opacity-60"
      style={{ border: '1px solid rgba(34,197,94,0.4)', color: '#22c55e' }}
    >
      {state === 'loading' ? (
        <>
          <span className="w-3.5 h-3.5 border border-[#22c55e] border-t-transparent rounded-full animate-spin" />
          Ativando...
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          Me avise assim que estiver no ar
        </>
      )}
    </button>
  )
}
