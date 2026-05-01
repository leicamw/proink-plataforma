'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: 'Olá! Sou o assistente da Pro Ink Academy. Como posso te ajudar hoje? 🎨',
      }])
    }
  }, [open, messages.length])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  const sendMessage = useCallback(async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMessage: Message = { role: 'user', content: text }
    const nextMessages = [...messages, userMessage]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)

    const assistantMessage: Message = { role: 'assistant', content: '' }
    setMessages([...nextMessages, assistantMessage])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
      })

      if (!res.ok || !res.body) throw new Error('Erro na resposta')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let full = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        full += decoder.decode(value, { stream: true })
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: full }
          return updated
        })
      }
    } catch {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          content: 'Desculpe, ocorreu um erro. Tente novamente.',
        }
        return updated
      })
    } finally {
      setLoading(false)
    }
  }, [input, loading, messages])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-4 z-50 w-[350px] max-w-[calc(100vw-2rem)] flex flex-col rounded-2xl border border-white/10 bg-[#111111] shadow-2xl"
          style={{ height: '480px' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] rounded-t-2xl bg-[#0d0d0d]">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-[#22c55e] shadow-[0_0_6px_#22c55e]" />
              <div>
                <div className="text-sm font-medium text-white leading-none">Pro Ink Assistant</div>
                <div className="text-[10px] text-white/40 mt-0.5">Online agora</div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/40 hover:text-white transition-colors p-1"
              aria-label="Fechar chat"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-[#22c55e] text-black font-medium rounded-br-sm'
                      : 'bg-[#1a1a1a] text-white/90 border border-white/[0.06] rounded-bl-sm'
                  }`}
                >
                  {msg.content || (
                    <span className="flex gap-1 items-center h-4">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-3 pb-3 pt-2 border-t border-white/[0.06]">
            <div className="flex items-end gap-2 bg-[#1a1a1a] rounded-xl border border-white/[0.08] px-3 py-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua dúvida..."
                rows={1}
                disabled={loading}
                className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 resize-none outline-none max-h-24 leading-relaxed"
                style={{ minHeight: '20px' }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="flex-shrink-0 w-7 h-7 rounded-lg bg-[#22c55e] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#16a34a] transition-colors flex items-center justify-center"
                aria-label="Enviar"
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M1 12L12 6.5L1 1v4.5l7 2-7 2V12z" fill="currentColor"/>
                </svg>
              </button>
            </div>
            <p className="text-[10px] text-white/20 text-center mt-1.5">Pro Ink Academy · IA Assistant</p>
          </div>
        </div>
      )}

      {/* FAB button */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="Abrir chat de suporte"
        className="fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full bg-[#22c55e] shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_28px_rgba(34,197,94,0.6)] hover:bg-[#16a34a] transition-all duration-200 flex items-center justify-center"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M15 5L5 15M5 5l10 10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M11 2C6.03 2 2 5.8 2 10.5c0 2.1.8 4 2.1 5.5L3 19l3.3-1.1C7.6 18.6 9.3 19 11 19c4.97 0 9-3.8 9-8.5S15.97 2 11 2z" fill="white"/>
            <path d="M7 10.5h8M7 7.5h5" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        )}
      </button>
    </>
  )
}
