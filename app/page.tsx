import Link from "next/link";
import Image from "next/image";
import blackworkImg from "@/public/course-blackwork.jpg";
import realismoImg from "@/public/course-realismo.jpg";
import finelineImg from "@/public/course-fineline.jpg";
import aquarelaImg from "@/public/course-aquarela.jpg";
import pontilhismoImg from "@/public/course-pontilhismo.jpg";
import oldschoolImg from "@/public/course-oldschool.jpg";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ScrollReveal } from "./_components/scroll-reveal";
import { Logo } from "./_components/logo";

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

type Course = {
  id: number
  style: string
  title: string
  duration: string
  topN?: number
  bg: string
  accentColor: string
  image?: string
  pattern: string
  patternSize?: string
}

const COURSES: Course[] = [
  {
    id: 1,
    style: "BLACKWORK",
    title: "Avançado",
    duration: "12h",
    topN: 1,
    bg: "#060606",
    accentColor: "#22c55e",
    image: blackworkImg.src,
    pattern: "repeating-linear-gradient(45deg,rgba(255,255,255,0.018) 0,rgba(255,255,255,0.018) 1px,transparent 0,transparent 50%)",
    patternSize: "14px 14px",
  },
  {
    id: 2,
    style: "FINELINE",
    title: "Floral",
    duration: "8h",
    topN: 2,
    bg: "#04080a",
    accentColor: "#34d399",
    image: finelineImg.src,
    pattern: "radial-gradient(circle,rgba(34,197,94,0.07) 1px,transparent 1px)",
    patternSize: "18px 18px",
  },
  {
    id: 3,
    style: "REALISMO",
    title: "P&B",
    duration: "20h",
    topN: 3,
    bg: "#080606",
    accentColor: "#86efac",
    image: realismoImg.src,
    pattern: "repeating-linear-gradient(90deg,rgba(255,255,255,0.012) 0,rgba(255,255,255,0.012) 1px,transparent 0,transparent 60px)",
    patternSize: "60px 60px",
  },
  {
    id: 4,
    style: "AQUARELA",
    title: "Moderna",
    duration: "10h",
    bg: "#050a08",
    accentColor: "#4ade80",
    image: aquarelaImg.src,
    pattern: "radial-gradient(ellipse 80% 60% at 70% 40%,rgba(34,197,94,0.1) 0%,transparent 60%),radial-gradient(ellipse 50% 40% at 20% 70%,rgba(16,185,129,0.08) 0%,transparent 50%)",
  },
  {
    id: 5,
    style: "PONTILHISMO",
    title: "Técnico",
    duration: "6h",
    bg: "#060608",
    accentColor: "#22c55e",
    image: pontilhismoImg.src,
    pattern: "radial-gradient(circle,rgba(34,197,94,0.09) 1.5px,transparent 1.5px)",
    patternSize: "24px 24px",
  },
  {
    id: 6,
    style: "OLD SCHOOL",
    title: "Clássico",
    duration: "15h",
    bg: "#09070a",
    accentColor: "#a3e635",
    image: oldschoolImg.src,
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
          <Logo size={38} />

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {[
              { label: "Plataforma", href: "#plataforma" },
              { label: "Cursos", href: "#cursos" },
              { label: "Decalque IA", href: "#planos" },
              { label: "Planos", href: "#planos" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40 hover:text-[#22c55e] transition-colors duration-200"
              >
                {item.label}
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

        {/* AI-generated background image */}
        <div className="absolute inset-0">
          <Image
            src="/bg-hero.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center"
            priority
          />
          {/* Directional overlay — dark left for text, transparent right to reveal the face */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.90) 0%, rgba(0,0,0,0.78) 28%, rgba(0,0,0,0.45) 52%, rgba(0,0,0,0.18) 75%, rgba(0,0,0,0.10) 100%)" }} />
          {/* Green tint layer on the photo side */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, transparent 35%, rgba(34,197,94,0.10) 60%, rgba(34,197,94,0.18) 100%)" }} />
        </div>

        {/* Layered background glows */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Main green orb — right side, vivid */}
          <div
            className="absolute right-[-5%] top-[-10%] w-[65vw] h-[100vh] glow-pulse"
            style={{ background: "radial-gradient(ellipse at 60% 35%, rgba(34,197,94,0.38) 0%, rgba(34,197,94,0.14) 40%, transparent 70%)" }}
          />
          {/* Secondary orb — bottom left */}
          <div
            className="absolute left-[-10%] bottom-[-5%] w-[50vw] h-[50vh]"
            style={{ background: "radial-gradient(ellipse at 30% 80%, rgba(34,197,94,0.10) 0%, transparent 65%)" }}
          />
          {/* Vignette — only edges, not centre */}
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(0,0,0,0.55) 100%)" }} />
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

        {/* Hero layout — text left, photo bleeds through naturally on right */}
        <div className="flex-1 max-w-[1400px] mx-auto px-6 md:px-10 w-full flex items-center py-12">

          {/* Text block — max half-width so the face shows on the right */}
          <div className="relative z-10 max-w-[600px] w-full">

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
                PROFISSIONAL
              </h1>
            </div>

            {/* Sub */}
            <p className="hero-in-4 text-white/45 text-[15px] leading-relaxed max-w-[400px] mb-10">
              Cursos exclusivos, IA para decalques e uma comunidade de tatuadores profissionais tudo na Pro Ink Academy.
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
                  {/* Imagem de capa (se disponível) ou padrão CSS */}
                  {c.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.image}
                      alt={c.style}
                      className="absolute inset-0 w-full h-full object-cover object-center"
                    />
                  ) : (
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage: c.pattern,
                        backgroundSize: c.patternSize,
                      }}
                    />
                  )}

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
                      <div className="flex justify-end">
                        <span className="text-[9px] text-white/35">{c.duration}</span>
                      </div>
                    </div>
                  </div>

                  {/* Lock overlay */}
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center gap-2"
                    style={{ background: "rgba(0,0,0,0.45)" }}
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
          SECTION 4 — DECALQUE IA (destaque)
      ══════════════════════════════════════════ */}
      <section className="py-28 px-6 md:px-10 relative overflow-hidden" style={{ background: "#070a08" }}>

        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 70% at 50% 50%, rgba(34,197,94,0.06) 0%, transparent 70%)" }}
        />
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(34,197,94,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(34,197,94,0.04) 1px,transparent 1px)",
            backgroundSize: "60px 60px",
            maskImage: "radial-gradient(ellipse 80% 70% at 50% 50%, black 20%, transparent 90%)",
          }}
        />

        <div className="max-w-[1400px] mx-auto relative">
          <ScrollReveal>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[#22c55e]/40"><CrosshairIcon size={14} /></span>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#22c55e] neon-text-sm">Disponível agora</p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <ScrollReveal delay={60}>
                <h2 className="font-bebas leading-[0.88] uppercase mb-5"
                  style={{ fontSize: "clamp(2.8rem,5.5vw,6rem)" }}
                >
                  IA QUE GERA{" "}
                  <span className="text-[#22c55e] neon-text">DECALQUES</span>{" "}
                  EM SEGUNDOS.
                </h2>
              </ScrollReveal>
              <ScrollReveal delay={120}>
                <p className="text-white/40 text-[14px] leading-relaxed mb-8 max-w-md">
                  Envie qualquer foto ou referência e escolha entre 4 estilos exclusivos. A IA converte em stencil profissional pronto para impressão e transferência.
                </p>
              </ScrollReveal>

              <ScrollReveal delay={160}>
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {[
                    { name: "Simples", desc: "Linhas limpas, alto contraste" },
                    { name: "Médio", desc: "Hachura moderada, leve sombreado" },
                    { name: "Avançado", desc: "Crosshatch, sombreado detalhado" },
                    { name: "Fine Line", desc: "Traço ultra-fino, leveza máxima" },
                  ].map((s) => (
                    <div key={s.name}
                      className="px-4 py-3"
                      style={{
                        background: "rgba(34,197,94,0.04)",
                        border: "1px solid rgba(34,197,94,0.12)",
                      }}
                    >
                      <p className="font-bebas text-[17px] text-[#22c55e] tracking-[0.05em] leading-none mb-0.5">{s.name}</p>
                      <p className="text-[10px] text-white/30">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </ScrollReveal>

              <ScrollReveal delay={200}>
                <Link
                  href="/sign-up"
                  className="inline-flex items-center gap-2 px-7 py-3.5 text-[12px] font-black uppercase tracking-[0.18em] bg-[#22c55e] text-black hover:bg-[#16a34a] transition-all duration-200 neon-border"
                >
                  Criar conta e usar a ferramenta <ArrowIcon />
                </Link>
              </ScrollReveal>
            </div>

            {/* Visual mockup */}
            <ScrollReveal delay={80} className="relative">
              <div className="relative mx-auto"
                style={{
                  maxWidth: "400px",
                  border: "1px solid rgba(34,197,94,0.2)",
                  background: "rgba(0,0,0,0.5)",
                  boxShadow: "0 0 60px rgba(34,197,94,0.08)",
                }}
              >
                {/* Top bar */}
                <div className="flex items-center justify-between px-5 py-3"
                  style={{ borderBottom: "1px solid rgba(34,197,94,0.1)", background: "rgba(34,197,94,0.03)" }}
                >
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#22c55e]">Gerador de Decalque IA</span>
                  <span className="text-[9px] text-white/25 uppercase tracking-[0.15em]">1 crédito</span>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                  {/* Style selector mockup */}
                  <div>
                    <p className="text-[9px] text-white/25 uppercase tracking-[0.2em] mb-2">Estilo do decalque</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { name: "Simples", active: true },
                        { name: "Médio", active: false },
                        { name: "Avançado", active: false },
                        { name: "Fine Line", active: false },
                      ].map(s => (
                        <div key={s.name}
                          className="px-3 py-2 text-[10px] font-semibold"
                          style={{
                            background: s.active ? "rgba(34,197,94,0.08)" : "rgba(255,255,255,0.02)",
                            border: s.active ? "1px solid rgba(34,197,94,0.5)" : "1px solid rgba(255,255,255,0.06)",
                            color: s.active ? "#22c55e" : "rgba(255,255,255,0.3)",
                          }}
                        >
                          {s.name}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Upload zone mockup */}
                  <div className="flex items-center justify-center py-8"
                    style={{ border: "1px dashed rgba(34,197,94,0.25)", background: "rgba(255,255,255,0.01)" }}
                  >
                    <div className="text-center">
                      <div className="text-[#22c55e]/30 mb-2 flex justify-center">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                      </div>
                      <p className="text-[10px] text-white/30">Arraste ou clique para enviar</p>
                    </div>
                  </div>

                  {/* Button mockup */}
                  <div className="w-full py-3 text-center text-[11px] font-black uppercase tracking-[0.15em] text-[#22c55e]"
                    style={{ border: "1px solid rgba(34,197,94,0.4)" }}
                  >
                    Gerar Decalque · 1 crédito
                  </div>
                </div>

                {/* Corner brackets */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#22c55e]" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#22c55e]" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#22c55e]" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#22c55e]" />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 5 — PLANOS E PREÇOS
      ══════════════════════════════════════════ */}
      <section id="planos" className="py-32 px-6 md:px-10 relative overflow-hidden">

        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(34,197,94,0.05) 0%, transparent 70%)" }}
        />
        <div className="absolute top-16 left-14 text-[#22c55e]/[0.04] hidden lg:block float"><CrosshairIcon size={90} /></div>
        <div className="absolute bottom-16 right-14 text-[#22c55e]/[0.04] hidden lg:block float" style={{ animationDelay: "2s" }}><CrosshairIcon size={65} /></div>

        <div className="max-w-[1400px] mx-auto relative">

          <ScrollReveal>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[#22c55e]/40"><CrosshairIcon size={14} /></span>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#22c55e] neon-text-sm">Planos e preços</p>
            </div>
          </ScrollReveal>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-14">
            <ScrollReveal delay={60}>
              <h2 className="font-bebas leading-[0.88] uppercase"
                style={{ fontSize: "clamp(2.8rem,5.5vw,6rem)" }}
              >
                INVISTA NA SUA{" "}
                <span className="text-[#22c55e] neon-text">EVOLUÇÃO.</span>
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={120}>
              <p className="text-white/35 text-[14px] max-w-sm leading-relaxed">
                Escolha o plano ideal para seu estúdio. Cancele a qualquer momento — sem fidelidade.
              </p>
            </ScrollReveal>
          </div>

          {/* Pricing grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {[
              {
                name: "Starter",
                price: "R$ 49",
                period: "/mês",
                credits: "50 créditos/mês",
                highlight: false,
                badge: null,
                features: [
                  { text: "50 gerações de decalque/mês", ok: true },
                  { text: "4 estilos de decalque IA", ok: true },
                  { text: "Download em alta resolução", ok: true },
                  { text: "Acesso à comunidade", ok: true },
                  { text: "Acesso antecipado a cursos", ok: false },
                  { text: "Comunidade Pro exclusiva", ok: false },
                ],
              },
              {
                name: "Pro",
                price: "R$ 97",
                period: "/mês",
                credits: "130 créditos/mês",
                highlight: true,
                badge: "Mais popular",
                features: [
                  { text: "130 gerações de decalque/mês", ok: true },
                  { text: "4 estilos de decalque IA", ok: true },
                  { text: "Download em alta resolução", ok: true },
                  { text: "Acesso à comunidade", ok: true },
                  { text: "Acesso antecipado a cursos", ok: true },
                  { text: "Comunidade Pro exclusiva", ok: false },
                ],
              },
              {
                name: "Creator",
                price: "R$ 147",
                period: "/mês",
                credits: "210 créditos/mês",
                highlight: false,
                badge: "Para estúdios",
                features: [
                  { text: "210 gerações de decalque/mês", ok: true },
                  { text: "4 estilos de decalque IA", ok: true },
                  { text: "Download em alta resolução", ok: true },
                  { text: "Acesso à comunidade", ok: true },
                  { text: "Acesso antecipado a cursos", ok: true },
                  { text: "Comunidade Pro exclusiva", ok: true },
                ],
              },
            ].map((plan, i) => (
              <ScrollReveal key={plan.name} delay={i * 100}>
                <div
                  className="relative flex flex-col h-full p-7 rounded transition-all duration-300 hover:scale-[1.01]"
                  style={{
                    background: plan.highlight ? "rgba(34,197,94,0.07)" : "rgba(255,255,255,0.02)",
                    border: plan.highlight ? "1px solid rgba(34,197,94,0.4)" : "1px solid rgba(255,255,255,0.07)",
                    boxShadow: plan.highlight ? "0 0 40px rgba(34,197,94,0.1)" : "none",
                  }}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em]"
                      style={{
                        background: plan.highlight ? "#22c55e" : "rgba(34,197,94,0.12)",
                        color: plan.highlight ? "#000" : "#22c55e",
                        border: plan.highlight ? "none" : "1px solid rgba(34,197,94,0.3)",
                      }}
                    >
                      {plan.badge}
                    </div>
                  )}

                  <div className="mb-6">
                    <p className="font-bebas text-2xl tracking-[0.06em] text-white mb-1">{plan.name}</p>
                    <div className="flex items-baseline gap-0.5">
                      <span className="font-black text-4xl text-white">{plan.price}</span>
                      <span className="text-white/30 text-sm">{plan.period}</span>
                    </div>
                    <p className="text-[11px] text-[#22c55e] mt-1 font-semibold">{plan.credits}</p>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f.text} className="flex items-start gap-2.5 text-[12px]"
                        style={{ color: f.ok ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.18)" }}
                      >
                        <span className="mt-0.5 flex-none text-[11px]" style={{ color: f.ok ? "#22c55e" : "rgba(255,255,255,0.15)" }}>
                          {f.ok ? "✓" : "×"}
                        </span>
                        {f.text}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/sign-up"
                    className="block w-full py-3 text-center text-[11px] font-black uppercase tracking-[0.18em] transition-all duration-200"
                    style={{
                      background: plan.highlight ? "#22c55e" : "rgba(34,197,94,0.08)",
                      color: plan.highlight ? "#000" : "#22c55e",
                      border: plan.highlight ? "none" : "1px solid rgba(34,197,94,0.25)",
                    }}
                  >
                    Começar com {plan.name}
                  </Link>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* FAQ / Garantia */}
          <ScrollReveal delay={160}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px"
              style={{ background: "rgba(34,197,94,0.06)" }}
            >
              {[
                { title: "Cancele quando quiser", desc: "Sem fidelidade. Cancele pela sua conta a qualquer momento, sem burocracia." },
                { title: "Créditos mensais", desc: "Os créditos renovam todo mês. Créditos não utilizados não acumulam para o mês seguinte." },
                { title: "Pagamento seguro", desc: "Pagamentos processados pela Stripe com criptografia de ponta a ponta." },
              ].map((item) => (
                <div key={item.title} className="bg-[#0a0a0a] px-7 py-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#22c55e] mb-2">{item.title}</p>
                  <p className="text-[12px] text-white/30 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 6 — CTA FINAL
      ══════════════════════════════════════════ */}
      <section className="py-32 px-6 md:px-10 relative overflow-hidden" style={{ background: "#060808" }}>

        <div className="absolute inset-0 pointer-events-none glow-pulse"
          style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(34,197,94,0.08) 0%, transparent 70%)" }}
        />

        <div className="max-w-[1400px] mx-auto relative text-center">
          <ScrollReveal>
            <div className="flex items-center justify-center gap-4 mb-7">
              <div className="h-px w-14" style={{ background: "linear-gradient(to right,transparent,rgba(34,197,94,0.4))" }} />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#22c55e] neon-text-sm">Comece hoje</span>
              <div className="h-px w-14" style={{ background: "linear-gradient(to left,transparent,rgba(34,197,94,0.4))" }} />
            </div>
          </ScrollReveal>

          <ScrollReveal delay={80}>
            <h2 className="font-bebas leading-[0.84] uppercase mx-auto mb-6"
              style={{ fontSize: "clamp(3.5rem,9vw,10rem)", maxWidth: "920px" }}
            >
              PRONTO PARA<br />
              ELEVAR SEU{" "}
              <span className="text-[#22c55e] neon-text">NÍVEL?</span>
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={160}>
            <p className="text-white/35 text-[15px] max-w-[420px] mx-auto mb-12 leading-relaxed">
              Crie sua conta grátis e comece a usar o gerador de decalques IA agora mesmo.
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
      <footer className="py-10 px-6 md:px-10" style={{ borderTop: "1px solid rgba(34,197,94,0.06)" }}>
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
            <Logo size={32} />
            <nav className="flex flex-wrap gap-6">
              {[
                { label: "Plataforma", href: "#plataforma" },
                { label: "Cursos", href: "#cursos" },
                { label: "Planos", href: "#planos" },
                { label: "Criar conta", href: "/sign-up" },
              ].map(l => (
                <a key={l.label} href={l.href}
                  className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/25 hover:text-[#22c55e] transition-colors"
                >
                  {l.label}
                </a>
              ))}
            </nav>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-6"
            style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
          >
            <p className="text-[10px] text-white/18 uppercase tracking-[0.15em]">© 2026 Pro Ink. Todos os direitos reservados.</p>
            <div className="flex gap-4">
              <a href="#" className="text-[10px] text-white/18 hover:text-white/40 transition-colors uppercase tracking-[0.15em]">Termos</a>
              <a href="#" className="text-[10px] text-white/18 hover:text-white/40 transition-colors uppercase tracking-[0.15em]">Privacidade</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
