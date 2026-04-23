import Link from "next/link";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ScrollReveal } from "./_components/scroll-reveal";

/* ── Inline SVG icons ───────────────────────────────────────── */

function CrosshairIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="20" cy="20" r="8" />
      <line x1="20" y1="0"  x2="20" y2="10" />
      <line x1="20" y1="30" x2="20" y2="40" />
      <line x1="0"  y1="20" x2="10" y2="20" />
      <line x1="30" y1="20" x2="40" y2="20" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="1.5" y1="11.5" x2="11.5" y2="1.5" />
      <polyline points="4.5,1.5 11.5,1.5 11.5,8.5" />
    </svg>
  );
}

function LockIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

/* ── Course thumbnail data ──────────────────────────────────── */

const COURSES = [
  {
    id: 1,
    style: "BLACKWORK",
    title: "Avançado",
    instructor: "André Lima",
    duration: "12h",
    topN: 1,
    bg: "#060606",
    accentColor: "#22c55e",
    pattern: "repeating-linear-gradient(45deg,rgba(255,255,255,0.018) 0,rgba(255,255,255,0.018) 1px,transparent 0,transparent 50%)",
    patternSize: "14px 14px",
  },
  {
    id: 2,
    style: "FINELINE",
    title: "Floral",
    instructor: "Camila Torres",
    duration: "8h",
    topN: 2,
    bg: "#04080a",
    accentColor: "#34d399",
    pattern: "radial-gradient(circle,rgba(34,197,94,0.07) 1px,transparent 1px)",
    patternSize: "18px 18px",
  },
  {
    id: 3,
    style: "REALISMO",
    title: "P&B",
    instructor: "Rafael Souza",
    duration: "20h",
    topN: 3,
    bg: "#080606",
    accentColor: "#86efac",
    pattern: "repeating-linear-gradient(90deg,rgba(255,255,255,0.012) 0,rgba(255,255,255,0.012) 1px,transparent 0,transparent 60px)",
    patternSize: "60px 60px",
  },
  {
    id: 4,
    style: "AQUARELA",
    title: "Moderna",
    instructor: "Juliana Pires",
    duration: "10h",
    bg: "#050a08",
    accentColor: "#4ade80",
    pattern: "radial-gradient(ellipse 80% 60% at 70% 40%,rgba(34,197,94,0.1) 0%,transparent 60%),radial-gradient(ellipse 50% 40% at 20% 70%,rgba(16,185,129,0.08) 0%,transparent 50%)",
    patternSize: undefined,
  },
  {
    id: 5,
    style: "PONTILHISMO",
    title: "Técnico",
    instructor: "Marcos Alves",
    duration: "6h",
    bg: "#060608",
    accentColor: "#22c55e",
    pattern: "radial-gradient(circle,rgba(34,197,94,0.09) 1.5px,transparent 1.5px)",
    patternSize: "24px 24px",
  },
  {
    id: 6,
    style: "OLD SCHOOL",
    title: "Clássico",
    instructor: "Bruno Neves",
    duration: "15h",
    bg: "#09070a",
    accentColor: "#a3e635",
    pattern: "repeating-linear-gradient(0deg,rgba(255,255,255,0.014) 0,rgba(255,255,255,0.014) 1px,transparent 0,transparent 24px)",
    patternSize: "100% 24px",
  },
];

const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
      </svg>
    ),
    title: "Cursos Exclusivos",
    desc: "Biblioteca completa com os melhores tatuadores do Brasil",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: "IA para Decalques",
    desc: "Transforme qualquer foto em decalque pronto para tatuar",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M12 14l9-5-9-5-9 5 9 5z" />
        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      </svg>
    ),
    title: "Instrutores Certificados",
    desc: "Profissionais renomados com anos de experiência",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Comunidade Pro",
    desc: "Conecte-se com tatuadores profissionais do Brasil",
  },
];

/* ── Page ───────────────────────────────────────────────────── */

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="bg-[#0a0a0a] text-white overflow-x-hidden">

      {/* ══════════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════════ */}
      <header
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: "rgba(8,8,8,0.92)",
          backdropFilter: "blur(16px) saturate(180%)",
          borderBottom: "1px solid rgba(34,197,94,0.08)",
        }}
      >
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 h-16 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <span className="text-[#22c55e] neon-text-sm float"><CrosshairIcon size={26} /></span>
            <div className="leading-none">
              <div className="font-bebas text-[22px] tracking-[0.05em]">
                Pro <span className="text-[#22c55e] neon-text-sm">Ink</span>
              </div>
              <div className="text-[8px] text-white/25 uppercase tracking-[0.22em]">Tattoo Platform</div>
            </div>
          </div>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {["Plataforma", "Cursos", "Planos"].map((label, i) => (
              <a
                key={label}
                href={`#${label.toLowerCase()}`}
                className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40 hover:text-[#22c55e] transition-colors duration-200"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <Link
            href="/sign-up"
            className="flex items-center gap-2 px-5 py-2 text-[11px] font-black uppercase tracking-[0.18em] border border-[#22c55e] text-[#22c55e] hover:bg-[#22c55e] hover:text-black transition-all duration-200 neon-border"
          >
            Começar agora <ArrowIcon />
          </Link>
        </div>
      </header>

      {/* ══════════════════════════════════════════
          HERO — full viewport
      ══════════════════════════════════════════ */}
      <section id="inicio" className="relative min-h-screen flex flex-col overflow-hidden pt-16">

        {/* Layered background glows */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Main green orb — right side */}
          <div
            className="absolute right-[-5%] top-[-10%] w-[65vw] h-[100vh] glow-pulse"
            style={{ background: "radial-gradient(ellipse at 60% 35%, rgba(34,197,94,0.18) 0%, rgba(34,197,94,0.05) 40%, transparent 70%)" }}
          />
          {/* Secondary orb — bottom left */}
          <div
            className="absolute left-[-10%] bottom-[-5%] w-[50vw] h-[50vh]"
            style={{ background: "radial-gradient(ellipse at 30% 80%, rgba(34,197,94,0.06) 0%, transparent 65%)" }}
          />
          {/* Vignette */}
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.7) 100%)" }} />
        </div>

        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(34,197,94,0.055) 1px,transparent 1px), linear-gradient(90deg,rgba(34,197,94,0.055) 1px,transparent 1px)",
            backgroundSize: "80px 80px",
            maskImage: "radial-gradient(ellipse 80% 90% at 50% 50%, black 10%, transparent 80%)",
          }}
        />

        {/* Main two-column layout */}
        <div className="flex-1 max-w-[1400px] mx-auto px-6 md:px-10 w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center py-12">

          {/* ── Left: text ── */}
          <div className="relative z-10">

            {/* Tag */}
            <div className="hero-in flex items-center gap-3 mb-7">
              <span className="text-[#22c55e]/50 neon-text-sm"><CrosshairIcon size={14} /></span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/30">
                Arte Permanente. Ensino Atemporal.
              </span>
              <div className="h-px flex-1 max-w-[56px]" style={{ background: "linear-gradient(90deg,rgba(34,197,94,0.5),transparent)" }} />
            </div>

            {/* Main heading — Bebas Neue + glitch */}
            <div className="hero-in-1 overflow-hidden mb-2">
              <h1
                className="font-bebas glitch leading-[0.88] uppercase"
                style={{ fontSize: "clamp(4rem,9vw,9.5rem)" }}
              >
                DOMINE A
              </h1>
            </div>
            <div className="hero-in-2 overflow-hidden mb-2">
              <h1
                className="font-bebas leading-[0.88] uppercase neon-text"
                style={{ fontSize: "clamp(4rem,9vw,9.5rem)", color: "#22c55e" }}
              >
                TATUAGEM
              </h1>
            </div>
            <div className="hero-in-3 overflow-hidden mb-8">
              <h1
                className="font-bebas leading-[0.88] uppercase"
                style={{ fontSize: "clamp(4rem,9vw,9.5rem)" }}
              >
                PROFISSIONAL.
              </h1>
            </div>

            {/* Sub */}
            <p className="hero-in-4 text-white/45 text-[15px] leading-relaxed max-w-[400px] mb-10">
              Cursos exclusivos, IA para decalques e uma comunidade de tatuadores profissionais — tudo na Pro Ink.
            </p>

            {/* CTAs */}
            <div className="hero-in-5 flex items-center gap-4 flex-wrap mb-12">
              <Link
                href="/sign-up"
                className="flex items-center gap-2 px-7 py-3.5 text-[12px] font-black uppercase tracking-[0.18em] bg-[#22c55e] text-black hover:bg-[#16a34a] transition-all duration-200 neon-border"
              >
                Criar conta grátis <ArrowIcon />
              </Link>
              <Link
                href="/sign-in"
                className="flex items-center gap-2 px-7 py-3.5 text-[12px] font-semibold uppercase tracking-[0.15em] text-white/40 hover:text-white transition-colors duration-200"
                style={{ border: "1px solid rgba(255,255,255,0.1)" }}
              >
                Já tenho conta
              </Link>
            </div>

            {/* Stats */}
            <div className="hero-in-5 flex items-center gap-10">
              {[
                { n: "50+",  label: "Instrutores" },
                { n: "200+", label: "Aulas" },
                { n: "1k+",  label: "Tatuadores" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="font-bebas text-3xl text-[#22c55e] neon-text-sm leading-none">{s.n}</div>
                  <div className="text-[9px] text-white/25 uppercase tracking-[0.22em] mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: visual frame ── */}
          <div className="hero-in-3 relative hidden lg:flex items-center justify-center">
            <div className="relative" style={{ width: "460px", height: "580px", flexShrink: 0 }}>

              {/* Hero image frame */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ border: "1px solid rgba(34,197,94,0.15)" }}
              >
                <Image
                  src="/hero.jpg"
                  alt="Tatuagem realismo - Pro Ink"
                  fill
                  sizes="460px"
                  className="object-cover object-center"
                  priority
                />
                {/* Dark overlay at bottom to blend into page */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(to top, rgba(10,10,10,0.6) 0%, rgba(10,10,10,0.1) 40%, transparent 70%)",
                  }}
                />
                {/* Subtle green tint overlay */}
                <div
                  className="absolute inset-0"
                  style={{ background: "rgba(34,197,94,0.04)" }}
                />
              </div>

              {/* Scan line animation */}
              <div className="scan-line" />

              {/* Green ambient glow behind the frame */}
              <div
                className="absolute -inset-8 -z-10 glow-pulse"
                style={{ background: "radial-gradient(circle, rgba(34,197,94,0.16) 0%, transparent 65%)" }}
              />

              {/* Animated corner brackets */}
              <div className="absolute top-0 left-0 w-9 h-9 border-t-[2px] border-l-[2px] bracket-glow" style={{ borderColor: "rgba(34,197,94,0.7)" }} />
              <div className="absolute top-0 right-0 w-9 h-9 border-t-[2px] border-r-[2px] bracket-glow" style={{ borderColor: "rgba(34,197,94,0.7)" }} />
              <div className="absolute bottom-0 left-0 w-9 h-9 border-b-[2px] border-l-[2px] bracket-glow" style={{ borderColor: "rgba(34,197,94,0.7)" }} />
              <div className="absolute bottom-0 right-0 w-9 h-9 border-b-[2px] border-r-[2px] bracket-glow" style={{ borderColor: "rgba(34,197,94,0.7)" }} />

              {/* Vertical label */}
              <div className="absolute -right-[52px] top-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
                <div className="w-px h-16" style={{ background: "linear-gradient(to bottom,transparent,rgba(34,197,94,0.3),transparent)" }} />
                <span
                  className="text-[8px] font-semibold uppercase tracking-[0.3em] text-white/18"
                  style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                >
                  Pro Ink Studio
                </span>
                <div className="w-px h-16" style={{ background: "linear-gradient(to bottom,transparent,rgba(34,197,94,0.3),transparent)" }} />
              </div>

              {/* Side caption */}
              <div className="absolute -right-2 top-6 text-right pr-2">
                <p className="text-[8px] font-medium uppercase tracking-[0.2em] text-white/15 leading-loose">
                  Cada traço<br />conta uma<br />
                  <span style={{ color: "rgba(34,197,94,0.4)" }}>história.</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Features strip ── */}
        <div style={{ borderTop: "1px solid rgba(34,197,94,0.06)", background: "rgba(0,0,0,0.3)" }}>
          <div className="max-w-[1400px] mx-auto px-6 md:px-10">
            <div className="hero-in-5 flex flex-col sm:flex-row">
              {FEATURES.map((f, i) => (
                <div
                  key={f.title}
                  className="flex-1 flex items-start gap-3.5 px-5 py-5 group"
                  style={{ borderLeft: i > 0 ? "1px solid rgba(34,197,94,0.06)" : "none" }}
                >
                  <span className="text-[#22c55e] mt-0.5 flex-none opacity-70 group-hover:opacity-100 transition-opacity">{f.icon}</span>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white mb-1">{f.title}</p>
                    <p className="text-[11px] text-white/28 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 2 — PLATAFORMA
      ══════════════════════════════════════════ */}
      <section id="plataforma" className="py-32 px-6 md:px-10 relative overflow-hidden">

        {/* Section BG glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 50% at 20% 50%, rgba(34,197,94,0.04) 0%, transparent 70%)" }}
        />

        <div className="max-w-[1400px] mx-auto">
          <ScrollReveal>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[#22c55e]/40"><CrosshairIcon size={14} /></span>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#22c55e] neon-text-sm">Por que a Pro Ink?</p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={80}>
            <h2
              className="font-bebas leading-[0.88] uppercase mb-16 max-w-[700px]"
              style={{ fontSize: "clamp(2.8rem,5.5vw,6rem)" }}
            >
              A PLATAFORMA QUE O{" "}
              <span className="text-[#22c55e] neon-text">TATUADOR PRO</span>{" "}
              PRECISAVA.
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: "1px", background: "rgba(34,197,94,0.06)" }}>
            {[
              { n: "01", title: "Cursos e Aulas", desc: "Aprenda técnicas avançadas de blackwork, fineline, realismo, aquarela e muito mais com os melhores tatuadores do Brasil." },
              { n: "02", title: "IA para Decalques", desc: "Nossa ferramenta transforma qualquer foto em decalque vetorizado pronto para a pele em segundos, com apenas 1 crédito." },
              { n: "03", title: "Comunidade Pro", desc: "Troque experiências, encontre referências e cresça junto com uma rede de tatuadores profissionais do Brasil inteiro." },
            ].map((card, i) => (
              <ScrollReveal key={card.n} delay={i * 120} className="bg-[#0a0a0a] p-8 md:p-10 group hover:bg-[#0d140d] transition-colors duration-300">
                <span
                  className="font-bebas block mb-3 leading-none transition-colors duration-300"
                  style={{ fontSize: "clamp(3.5rem,6vw,6rem)", color: "rgba(34,197,94,0.1)" }}
                >
                  {card.n}
                </span>
                <h3 className="font-bebas text-2xl tracking-wide mb-3" style={{ color: "#fff" }}>{card.title}</h3>
                <p className="text-[13px] text-white/35 leading-relaxed">{card.desc}</p>
                <div className="mt-6 h-px w-0 group-hover:w-full transition-all duration-500" style={{ background: "linear-gradient(90deg,rgba(34,197,94,0.5),transparent)" }} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 3 — CURSOS (thumbnails)
      ══════════════════════════════════════════ */}
      <section id="cursos" className="py-32 relative overflow-hidden" style={{ background: "#060808" }}>

        {/* BG grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(34,197,94,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(34,197,94,0.04) 1px,transparent 1px)",
            backgroundSize: "60px 60px",
            maskImage: "radial-gradient(ellipse 90% 70% at 50% 50%, black 20%, transparent 90%)",
          }}
        />
        {/* Right glow */}
        <div
          className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 90% 50%, rgba(34,197,94,0.06) 0%, transparent 65%)" }}
        />

        <div className="max-w-[1400px] mx-auto px-6 md:px-10 relative">

          <ScrollReveal>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[#22c55e]/40"><CrosshairIcon size={14} /></span>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#22c55e] neon-text-sm">Em breve</p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={80}>
            <h2
              className="font-bebas leading-[0.88] uppercase mb-4 max-w-[700px]"
              style={{ fontSize: "clamp(2.8rem,5.5vw,6rem)" }}
            >
              CURSOS QUE VÃO{" "}
              <span className="text-[#22c55e] neon-text">ELEVAR SEU NÍVEL.</span>
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={140}>
            <p className="text-white/35 text-[14px] mb-14 max-w-lg leading-relaxed">
              Estamos preparando uma biblioteca completa com os melhores tatuadores do Brasil. Cadastre-se para ser o primeiro a saber.
            </p>
          </ScrollReveal>

          {/* Course thumbnail grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-14">
            {COURSES.map((c, i) => (
              <ScrollReveal key={c.id} delay={i * 65}>
                {/* Card */}
                <div
                  className="relative rounded overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                  style={{
                    aspectRatio: "2/3",
                    background: c.bg,
                  }}
                >
                  {/* CSS pattern */}
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: c.pattern,
                      backgroundSize: c.patternSize,
                    }}
                  />

                  {/* Ambient color wash */}
                  <div
                    className="absolute inset-0"
                    style={{ background: `radial-gradient(ellipse at 50% 30%, ${c.accentColor}12 0%, transparent 65%)` }}
                  />

                  {/* Large ghost style name */}
                  <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                    <span
                      className="font-bebas select-none text-center leading-none px-2"
                      style={{
                        fontSize: "clamp(28px,3.5vw,40px)",
                        color: `${c.accentColor}08`,
                        transform: "rotate(-8deg) scale(1.4)",
                      }}
                    >
                      {c.style}
                    </span>
                  </div>

                  {/* Course info */}
                  <div
                    className="absolute inset-0 flex flex-col justify-between p-3"
                    style={{ background: "linear-gradient(to top,rgba(0,0,0,0.85) 0%,transparent 50%)" }}
                  >
                    {/* Top: badge */}
                    <div className="flex justify-between items-start">
                      {c.topN && (
                        <span
                          className="font-bebas text-[13px] w-6 h-6 flex items-center justify-center rounded-sm leading-none"
                          style={{ background: c.accentColor, color: "#000" }}
                        >
                          {c.topN}
                        </span>
                      )}
                    </div>

                    {/* Bottom: names */}
                    <div>
                      <div
                        className="font-bebas text-[18px] leading-none mb-0.5 neon-text-sm"
                        style={{ color: c.accentColor }}
                      >
                        {c.style}
                      </div>
                      <div className="text-white font-semibold text-[11px] leading-tight mb-1">{c.title}</div>
                      <div className="flex justify-between">
                        <span className="text-[9px] text-white/35">{c.instructor}</span>
                        <span className="text-[9px] text-white/35">{c.duration}</span>
                      </div>
                    </div>
                  </div>

                  {/* Lock overlay */}
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center gap-2"
                    style={{ background: "rgba(0,0,0,0.52)" }}
                  >
                    <span style={{ color: "rgba(34,197,94,0.5)" }}><LockIcon size={22} /></span>
                    <span
                      className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                      style={{
                        background: "rgba(0,0,0,0.6)",
                        color: "rgba(34,197,94,0.55)",
                        border: "1px solid rgba(34,197,94,0.2)",
                      }}
                    >
                      Em breve
                    </span>
                  </div>

                  {/* Hover green ring */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded pointer-events-none"
                    style={{ boxShadow: `0 0 0 1.5px ${c.accentColor}55, 0 0 20px ${c.accentColor}20, inset 0 0 20px ${c.accentColor}08` }}
                  />
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={200} className="flex justify-center">
            <Link
              href="/sign-up"
              className="flex items-center gap-2.5 px-8 py-4 text-[12px] font-black uppercase tracking-[0.2em] text-[#22c55e] hover:bg-[#22c55e] hover:text-black transition-all duration-200 neon-border"
              style={{ border: "1px solid rgba(34,197,94,0.5)" }}
            >
              Criar conta e ser notificado <ArrowIcon />
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 4 — CTA FINAL
      ══════════════════════════════════════════ */}
      <section id="planos" className="py-36 px-6 md:px-10 relative overflow-hidden">

        {/* Big center glow */}
        <div
          className="absolute inset-0 pointer-events-none glow-pulse"
          style={{ background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(34,197,94,0.09) 0%, transparent 70%)" }}
        />
        {/* Decorative crosshairs */}
        <div className="absolute top-16 left-14 text-[#22c55e]/[0.06] hidden lg:block float"><CrosshairIcon size={90} /></div>
        <div className="absolute bottom-16 right-14 text-[#22c55e]/[0.06] hidden lg:block float" style={{ animationDelay: "2s" }}><CrosshairIcon size={65} /></div>

        {/* Horizontal accent lines */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 pointer-events-none hidden lg:block">
          <div className="h-px w-full" style={{ background: "linear-gradient(90deg,transparent 0%,rgba(34,197,94,0.07) 20%,rgba(34,197,94,0.07) 80%,transparent 100%)" }} />
        </div>

        <div className="max-w-[1400px] mx-auto relative text-center">
          <ScrollReveal>
            <div className="flex items-center justify-center gap-4 mb-7">
              <div className="h-px w-14" style={{ background: "linear-gradient(to right,transparent,rgba(34,197,94,0.4))" }} />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#22c55e] neon-text-sm">Comece hoje</span>
              <div className="h-px w-14" style={{ background: "linear-gradient(to left,transparent,rgba(34,197,94,0.4))" }} />
            </div>
          </ScrollReveal>

          <ScrollReveal delay={80}>
            <h2
              className="font-bebas leading-[0.84] uppercase mx-auto mb-6"
              style={{ fontSize: "clamp(3.5rem,9vw,10rem)", maxWidth: "920px" }}
            >
              PRONTO PARA<br />
              ELEVAR SEU{" "}
              <span className="text-[#22c55e] neon-text">NÍVEL?</span>
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={160}>
            <p className="text-white/35 text-[15px] max-w-[420px] mx-auto mb-12 leading-relaxed">
              Crie sua conta grátis e seja um dos primeiros a acessar quando a plataforma entrar ao ar.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={240} className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/sign-up"
              className="flex items-center gap-2 px-8 py-4 text-[12px] font-black uppercase tracking-[0.18em] bg-[#22c55e] text-black hover:bg-[#16a34a] transition-all duration-200 neon-border"
            >
              Criar Conta Grátis <ArrowIcon />
            </Link>
            <Link
              href="/sign-in"
              className="flex items-center gap-2 px-8 py-4 text-[12px] font-semibold uppercase tracking-[0.15em] text-white/35 hover:text-white transition-colors duration-200"
              style={{ border: "1px solid rgba(255,255,255,0.1)" }}
            >
              Já tenho conta
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer className="py-8 px-6 md:px-10" style={{ borderTop: "1px solid rgba(34,197,94,0.06)" }}>
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[#22c55e]/60"><CrosshairIcon size={18} /></span>
            <span className="font-bebas text-[18px] tracking-[0.05em]">
              Pro <span className="text-[#22c55e]">Ink</span>
            </span>
          </div>
          <p className="text-[10px] text-white/18 uppercase tracking-[0.15em]">© 2026 Pro Ink. Todos os direitos reservados.</p>
        </div>
      </footer>

    </div>
  );
}
