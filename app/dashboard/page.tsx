import { auth, currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getOrCreateProfile, getCreditsAvailable, getRecentDecals } from "@/lib/db/profiles";

/* ── Icons ─────────────────────────────────────────────────── */

function CrosshairIcon({ size = 26 }: { size?: number }) {
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

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

/* ── Course data ────────────────────────────────────────────── */

const COURSE_ROWS = [
  {
    title: "Em Alta na Pro Ink",
    courses: [
      { id: 1,  style: "BLACKWORK", title: "Avançado",    instructor: "André Lima",      duration: "12h", topN: 1, bg: "#060606", accent: "#22c55e", pattern: "repeating-linear-gradient(45deg,rgba(255,255,255,0.018) 0,rgba(255,255,255,0.018) 1px,transparent 0,transparent 50%)", patternSize: "14px 14px" },
      { id: 2,  style: "FINELINE",  title: "Floral",      instructor: "Camila Torres",   duration: "8h",  topN: 2, bg: "#04080a", accent: "#34d399", pattern: "radial-gradient(circle,rgba(34,197,94,0.07) 1px,transparent 1px)", patternSize: "18px 18px" },
      { id: 3,  style: "REALISMO",  title: "P&B",         instructor: "Rafael Souza",    duration: "20h", topN: 3, bg: "#080606", accent: "#86efac", pattern: "repeating-linear-gradient(90deg,rgba(255,255,255,0.012) 0,rgba(255,255,255,0.012) 1px,transparent 0,transparent 60px)", patternSize: "60px 60px" },
      { id: 4,  style: "AQUARELA",  title: "Moderna",     instructor: "Juliana Pires",   duration: "10h", bg: "#050a08", accent: "#4ade80", pattern: "radial-gradient(ellipse 80% 60% at 70% 40%,rgba(34,197,94,0.1) 0%,transparent 60%)", patternSize: undefined },
      { id: 5,  style: "PONTIL.",   title: "Técnico",     instructor: "Marcos Alves",    duration: "6h",  bg: "#060608", accent: "#22c55e", pattern: "radial-gradient(circle,rgba(34,197,94,0.09) 1.5px,transparent 1.5px)", patternSize: "24px 24px" },
      { id: 6,  style: "OLD SCH.", title: "Clássico",    instructor: "Bruno Neves",     duration: "15h", bg: "#09070a", accent: "#a3e635", pattern: "repeating-linear-gradient(0deg,rgba(255,255,255,0.014) 0,rgba(255,255,255,0.014) 1px,transparent 0,transparent 24px)", patternSize: "100% 24px" },
    ],
  },
  {
    title: "Sombreamento e Realismo",
    courses: [
      { id: 7,  style: "SOMBRA",    title: "Suave",       instructor: "Pedro Costa",     duration: "9h",  bg: "#070707", accent: "#22c55e", pattern: "repeating-linear-gradient(-45deg,rgba(255,255,255,0.015) 0,rgba(255,255,255,0.015) 1px,transparent 0,transparent 40px)", patternSize: "40px 40px" },
      { id: 8,  style: "RETRATO",   title: "Hiper-real",  instructor: "Ana Silva",       duration: "25h", bg: "#060808", accent: "#34d399", pattern: "radial-gradient(circle,rgba(34,197,94,0.05) 1px,transparent 1px)", patternSize: "12px 12px" },
      { id: 9,  style: "GRADIENTE", title: "Perfeito",    instructor: "Lucas Freitas",   duration: "7h",  bg: "#080608", accent: "#4ade80", pattern: "repeating-linear-gradient(135deg,rgba(255,255,255,0.012) 0,rgba(255,255,255,0.012) 1px,transparent 0,transparent 30px)", patternSize: "30px 30px" },
      { id: 10, style: "BARBEARIA", title: "Técnica",     instructor: "Thiago Santos",   duration: "11h", bg: "#080707", accent: "#86efac", pattern: "repeating-linear-gradient(90deg,rgba(255,255,255,0.01) 0,rgba(255,255,255,0.01) 1px,transparent 0,transparent 20px)", patternSize: "20px 20px" },
      { id: 11, style: "SOMBRA",    title: "A Seco",      instructor: "Fernanda Lima",   duration: "8h",  bg: "#060607", accent: "#22c55e", pattern: "radial-gradient(ellipse 100% 50% at 50% 50%,rgba(34,197,94,0.07) 0%,transparent 70%)", patternSize: undefined },
      { id: 12, style: "CHIARO.",   title: "Claro-Escuro",instructor: "Roberto Alves",   duration: "14h", bg: "#070606", accent: "#a3e635", pattern: "repeating-linear-gradient(45deg,rgba(255,255,255,0.01) 0,rgba(255,255,255,0.01) 1px,transparent 0,transparent 20px)", patternSize: "20px 20px" },
    ],
  },
  {
    title: "Para Iniciantes",
    courses: [
      { id: 13, style: "TRAÇOS",    title: "Primeiros",   instructor: "Bianca Rocha",    duration: "5h",  bg: "#060808", accent: "#22c55e", pattern: "radial-gradient(circle,rgba(34,197,94,0.06) 1px,transparent 1px)", patternSize: "20px 20px" },
      { id: 14, style: "SETUP",     title: "Máquina",     instructor: "Diego Mendes",    duration: "4h",  bg: "#070706", accent: "#4ade80", pattern: "repeating-linear-gradient(0deg,rgba(255,255,255,0.012) 0,rgba(255,255,255,0.012) 1px,transparent 0,transparent 18px)", patternSize: "100% 18px" },
      { id: 15, style: "HIGIENE",   title: "Segurança",   instructor: "Carla Nunes",     duration: "3h",  bg: "#060707", accent: "#34d399", pattern: "repeating-linear-gradient(45deg,rgba(255,255,255,0.015) 0,rgba(255,255,255,0.015) 1px,transparent 0,transparent 22px)", patternSize: "22px 22px" },
      { id: 16, style: "TRAÇO",     title: "Limpo",       instructor: "Vinícius Prado",  duration: "6h",  bg: "#060606", accent: "#86efac", pattern: "radial-gradient(circle,rgba(134,239,172,0.06) 1px,transparent 1px)", patternSize: "16px 16px" },
      { id: 17, style: "CORES",     title: "Teoria",      instructor: "Isabela Cruz",    duration: "4h",  bg: "#080608", accent: "#22c55e", pattern: "repeating-linear-gradient(-45deg,rgba(255,255,255,0.012) 0,rgba(255,255,255,0.012) 1px,transparent 0,transparent 26px)", patternSize: "26px 26px" },
      { id: 18, style: "ANATOMIA",  title: "Tatuadores",  instructor: "Eduardo Moura",   duration: "7h",  bg: "#060706", accent: "#4ade80", pattern: "radial-gradient(ellipse 60% 80% at 40% 60%,rgba(74,222,128,0.08) 0%,transparent 60%)", patternSize: undefined },
    ],
  },
  {
    title: "Estilos Avançados",
    courses: [
      { id: 19, style: "NEO TRAD.", title: "Traditional", instructor: "Marina Castro",   duration: "16h", bg: "#070607", accent: "#22c55e", pattern: "repeating-linear-gradient(45deg,rgba(255,255,255,0.018) 0,rgba(255,255,255,0.018) 1px,transparent 0,transparent 14px)", patternSize: "14px 14px" },
      { id: 20, style: "MANDALA",   title: "Geometric",   instructor: "Paulo Ferreira",  duration: "13h", bg: "#060708", accent: "#34d399", pattern: "radial-gradient(circle,rgba(34,197,94,0.08) 1.5px,transparent 1.5px)", patternSize: "22px 22px" },
      { id: 21, style: "TRASH",     title: "Polka",       instructor: "Renata Oliveira", duration: "11h", bg: "#080606", accent: "#86efac", pattern: "repeating-linear-gradient(90deg,rgba(255,255,255,0.01) 0,rgba(255,255,255,0.01) 1px,transparent 0,transparent 30px)", patternSize: "30px 30px" },
      { id: 22, style: "JAPANESE",  title: "Full Body",   instructor: "Tatsuya Kimura",  duration: "30h", bg: "#060808", accent: "#4ade80", pattern: "repeating-linear-gradient(-45deg,rgba(255,255,255,0.012) 0,rgba(255,255,255,0.012) 1px,transparent 0,transparent 18px)", patternSize: "18px 18px" },
      { id: 23, style: "COVER UP",  title: "Profissional",instructor: "Gustavo Lima",    duration: "9h",  bg: "#070708", accent: "#a3e635", pattern: "radial-gradient(circle,rgba(163,230,53,0.07) 1px,transparent 1px)", patternSize: "20px 20px" },
      { id: 24, style: "LETTERING", title: "Script",      instructor: "Natalia Borges",  duration: "8h",  bg: "#060607", accent: "#22c55e", pattern: "repeating-linear-gradient(0deg,rgba(255,255,255,0.014) 0,rgba(255,255,255,0.014) 1px,transparent 0,transparent 22px)", patternSize: "100% 22px" },
    ],
  },
];

const PLAN_LABEL: Record<string, string> = {
  free: "Sem plano",
  starter: "Starter",
  pro: "Pro",
  creator: "Creator",
};

/* ── Page ───────────────────────────────────────────────────── */

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? null;
  const profile = await getOrCreateProfile(userId, email);
  const creditsAvailable = await getCreditsAvailable(profile);
  const recentDecals = await getRecentDecals(userId, 5);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">

      {/* ── Navbar ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: "rgba(8,8,8,0.92)",
          backdropFilter: "blur(16px) saturate(180%)",
          borderBottom: "1px solid rgba(34,197,94,0.08)",
        }}
      >
        <div className="max-w-[1800px] mx-auto px-6 md:px-10 h-16 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <span className="text-[#22c55e] neon-text-sm float"><CrosshairIcon size={24} /></span>
            <div className="leading-none">
              <div className="font-bebas text-[20px] tracking-[0.05em]">
                Pro <span className="text-[#22c55e] neon-text-sm">Ink</span>
              </div>
              <div className="text-[8px] text-white/25 uppercase tracking-[0.22em]">Tattoo Platform</div>
            </div>
          </div>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-7">
            {["Início", "Cursos", "Em Alta", "Minha Lista"].map((label) => (
              <a
                key={label}
                href="#"
                className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40 hover:text-[#22c55e] transition-colors duration-200"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Right: credits + user */}
          <div className="flex items-center gap-4">
            {profile.plan !== "free" && (
              <div
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#22c55e] neon-text-sm"
                style={{ border: "1px solid rgba(34,197,94,0.25)", background: "rgba(34,197,94,0.06)" }}
              >
                {creditsAvailable} créditos
              </div>
            )}
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] text-white/35 hidden sm:block">{user?.firstName}</span>
              <UserButton />
            </div>
          </div>
        </div>
      </header>

      {/* ── Hero banner ── */}
      <section
        className="relative flex items-end overflow-hidden pt-16"
        style={{ minHeight: "78vh" }}
      >
        {/* BG layers */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute right-0 top-0 w-[60vw] h-full glow-pulse"
            style={{ background: "radial-gradient(ellipse at 70% 35%, rgba(34,197,94,0.14) 0%, transparent 65%)" }}
          />
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.75) 100%)" }}
          />
        </div>

        {/* Grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(34,197,94,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(34,197,94,0.05) 1px,transparent 1px)",
            backgroundSize: "80px 80px",
            maskImage: "radial-gradient(ellipse 70% 80% at 50% 50%, black 10%, transparent 80%)",
          }}
        />

        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
          style={{ background: "linear-gradient(to top, #0a0a0a 0%, transparent 100%)" }}
        />

        <div className="relative max-w-[1800px] mx-auto px-6 md:px-10 w-full pb-20">
          <div className="max-w-2xl">

            {/* Tag */}
            <div className="flex items-center gap-3 mb-5">
              <span className="text-[#22c55e]/50"><CrosshairIcon size={14} /></span>
              <span
                className="text-[10px] font-bold uppercase tracking-[0.28em] px-3 py-1 neon-text-sm"
                style={{ color: "#22c55e", border: "1px solid rgba(34,197,94,0.25)", background: "rgba(34,197,94,0.08)" }}
              >
                Em breve
              </span>
            </div>

            {/* Heading */}
            <h1
              className="font-bebas glitch leading-[0.88] uppercase mb-4"
              style={{ fontSize: "clamp(3.5rem,7vw,7.5rem)" }}
            >
              DOMINE A{" "}
              <span className="text-[#22c55e] neon-text">TATUAGEM</span>
              <br />PROFISSIONAL.
            </h1>

            <p className="text-white/45 text-[15px] leading-relaxed max-w-lg mb-8">
              Cursos completos com os melhores tatuadores do Brasil. Blackwork, fineline, realismo e muito mais — em um só lugar.
            </p>

            {/* Buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                disabled
                className="flex items-center gap-2 px-6 py-3 text-[11px] font-black uppercase tracking-[0.18em] cursor-not-allowed"
                style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <LockIcon /> Em breve
              </button>
              <button
                disabled
                className="flex items-center gap-2 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] cursor-not-allowed"
                style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                Mais informações
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Content rows ── */}
      <main className="relative pb-24 max-w-[1800px] mx-auto" style={{ marginTop: "-40px" }}>

        {COURSE_ROWS.map((row) => (
          <section key={row.title} className="mb-10 px-6 md:px-10">
            <h2 className="font-bebas text-xl tracking-[0.06em] text-white mb-3 uppercase">{row.title}</h2>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              {row.courses.map((c, i) => (
                <div
                  key={c.id}
                  className="flex-none relative rounded overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                  style={{
                    width: "clamp(140px,12vw,190px)",
                    aspectRatio: "2/3",
                    background: c.bg,
                    flexShrink: 0,
                  }}
                >
                  {/* Pattern */}
                  <div className="absolute inset-0" style={{ backgroundImage: c.pattern, backgroundSize: c.patternSize }} />
                  {/* Ambient wash */}
                  <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 50% 30%,${c.accent}12 0%,transparent 65%)` }} />
                  {/* Ghost text */}
                  <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                    <span className="font-bebas select-none text-center leading-none px-1" style={{ fontSize: "28px", color: `${c.accent}09`, transform: "rotate(-8deg) scale(1.5)" }}>{c.style}</span>
                  </div>
                  {/* Info */}
                  <div className="absolute inset-0 flex flex-col justify-between p-2.5" style={{ background: "linear-gradient(to top,rgba(0,0,0,0.88) 0%,transparent 55%)" }}>
                    <div>{c.topN && (<span className="font-bebas text-[12px] w-5 h-5 flex items-center justify-center rounded-sm leading-none" style={{ background: c.accent, color: "#000" }}>{c.topN}</span>)}</div>
                    <div>
                      <div className="font-bebas text-[16px] leading-none neon-text-sm mb-0.5" style={{ color: c.accent }}>{c.style}</div>
                      <div className="text-white font-semibold text-[10px] leading-tight mb-1">{c.title}</div>
                      <div className="flex justify-between">
                        <span className="text-[8px] text-white/30">{c.instructor}</span>
                        <span className="text-[8px] text-white/30">{c.duration}</span>
                      </div>
                    </div>
                  </div>
                  {/* Lock overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5" style={{ background: "rgba(0,0,0,0.5)" }}>
                    <span style={{ color: "rgba(34,197,94,0.45)" }}><LockIcon /></span>
                    <span className="text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full" style={{ background: "rgba(0,0,0,0.6)", color: "rgba(34,197,94,0.5)", border: "1px solid rgba(34,197,94,0.18)" }}>Em breve</span>
                  </div>
                  {/* Hover ring */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded pointer-events-none" style={{ boxShadow: `0 0 0 1.5px ${c.accent}55, 0 0 18px ${c.accent}18` }} />
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* ── Ferramenta IA ── */}
        <section className="mx-6 md:mx-10 mt-6 mb-8 rounded overflow-hidden" style={{ background: "linear-gradient(135deg, #071209 0%, #0d0d0d 100%)", border: "1px solid rgba(34,197,94,0.15)" }}>
          <div className="px-8 py-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[#22c55e]"><CrosshairIcon size={16} /></span>
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#22c55e] neon-text-sm">Disponível agora</p>
              </div>
              <h3 className="font-bebas text-3xl tracking-[0.04em] uppercase mb-1">Ferramenta de Decalque IA</h3>
              <p className="text-[13px] text-white/40">Transforme qualquer foto em decalque pronto para tatuar. 1 crédito por uso.</p>
            </div>

            <div className="flex flex-col items-start md:items-end gap-3 flex-none">
              {/* Plan badge */}
              <div className="text-[10px] text-white/30 uppercase tracking-[0.18em]">
                Plano: <span className="text-white/60 font-semibold">{PLAN_LABEL[profile.plan]}</span>
                {profile.plan !== "free" && (
                  <span className="ml-2 text-[#22c55e] neon-text-sm">· {creditsAvailable} créditos</span>
                )}
              </div>
              <button
                disabled={profile.plan === "free" || creditsAvailable === 0}
                className="flex items-center gap-2 px-6 py-3 text-[11px] font-black uppercase tracking-[0.18em] transition-all duration-200"
                style={
                  profile.plan !== "free" && creditsAvailable > 0
                    ? { background: "#22c55e", color: "#000" }
                    : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.08)", cursor: "not-allowed" }
                }
              >
                {profile.plan === "free" ? "Assine um plano" : creditsAvailable === 0 ? "Sem créditos" : (<>Gerar decalque <ArrowIcon /></>)}
              </button>
            </div>
          </div>

          {/* Credits bar */}
          {profile.plan !== "free" && profile.credits_total > 0 && (
            <div className="px-8 pb-6">
              <div className="flex justify-between text-[9px] text-white/25 uppercase tracking-[0.18em] mb-1.5">
                <span>{profile.credits_used} usados</span>
                <span>{profile.credits_total} total</span>
              </div>
              <div className="w-full h-1 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div
                  className="h-1 rounded-full neon-border"
                  style={{
                    width: `${Math.round((profile.credits_used / profile.credits_total) * 100)}%`,
                    background: "linear-gradient(90deg,#16a34a,#22c55e)",
                  }}
                />
              </div>
            </div>
          )}
        </section>

        {/* ── Histórico ── */}
        {recentDecals.length > 0 && (
          <section className="mx-6 md:mx-10 mb-8">
            <h2 className="font-bebas text-xl tracking-[0.06em] text-white mb-3 uppercase">Histórico de Decalques</h2>
            <div className="rounded overflow-hidden" style={{ border: "1px solid rgba(34,197,94,0.08)", background: "rgba(0,0,0,0.3)" }}>
              {recentDecals.map((job, i) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between px-6 py-3"
                  style={{ borderTop: i > 0 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
                >
                  <span className="text-[12px] text-white/40">{new Date(job.created_at).toLocaleDateString("pt-BR")}</span>
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                    style={
                      job.status === "done"
                        ? { background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }
                        : job.status === "failed"
                        ? { background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }
                        : { background: "rgba(234,179,8,0.1)", color: "#facc15", border: "1px solid rgba(234,179,8,0.2)" }
                    }
                  >
                    {job.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="py-6 px-6 md:px-10" style={{ borderTop: "1px solid rgba(34,197,94,0.06)" }}>
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-[#22c55e]/50"><CrosshairIcon size={16} /></span>
            <span className="font-bebas text-[16px] tracking-[0.05em]">Pro <span className="text-[#22c55e]">Ink</span></span>
          </div>
          <p className="text-[10px] text-white/18 uppercase tracking-[0.15em]">© 2026 Pro Ink.</p>
        </div>
      </footer>
    </div>
  );
}
