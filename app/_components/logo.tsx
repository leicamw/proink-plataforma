import Image from 'next/image'

interface LogoProps {
  size?: number
  showText?: boolean
  subtitle?: string
}

export function Logo({ size = 36, showText = true, subtitle = 'Tattoo Platform' }: LogoProps) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="relative flex-shrink-0 glow-pulse"
        style={{ width: size, height: size }}
      >
        <Image
          src="/logo.png"
          alt="Pro Ink Logo"
          fill
          className="object-contain"
          sizes={`${size}px`}
          priority
        />
      </div>
      {showText && (
        <div className="leading-none">
          <div className="font-bebas text-[20px] tracking-[0.05em]">
            Pro <span className="text-[#22c55e] neon-text-sm">Ink</span>
          </div>
          {subtitle && (
            <div className="text-[8px] text-white/25 uppercase tracking-[0.22em]">{subtitle}</div>
          )}
        </div>
      )}
    </div>
  )
}
