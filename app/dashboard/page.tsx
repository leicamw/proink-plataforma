import { auth, currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getOrCreateProfile, getCreditsAvailable, getRecentDecals } from "@/lib/db/profiles";
import { Logo } from "@/app/_components/logo";
import { createCheckoutSession, createPortalSession } from "@/app/actions/mercadopago";
import { MP_PLANS } from "@/lib/mercadopago/plans";
import { NotifyButton } from "./_components/notify-button";

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

function DownloadIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3L13.5 8.5L19 10L13.5 11.5L12 17L10.5 11.5L5 10L10.5 8.5L12 3Z" />
      <path d="M19 3L19.8 5.2L22 6L19.8 6.8L19 9L18.2 6.8L16 6L18.2 5.2L19 3Z" />
    </svg>
  );
}

/* ── Dados ─────────────────────────────────────────────────── */

const PLAN_LABEL: Record<string, string> = {
  free: "Sem plano",
  starter: "Starter",
  pro: "Pro",
  creator: "Creator",
};

const PLAN_FEATURES: Record<string, string[]> = {
  starter: ["50 créditos/mês", "4 estilos de decalque IA", "Download em alta resolução"],
  pro: ["130 créditos/mês", "4 estilos de decalque IA", "Download em alta resolução", "Acesso antecipado a cursos"],
  creator: ["210 créditos/mês", "4 estilos de decalque IA", "Download em alta resolução", "Acesso antecipado a cursos", "Comunidade Pro exclusiva"],
};

const DECAL_STYLES = [
  { id: "espectro", name: "Espectro", desc: "Linhas puras de contorno" },
  { id: "sombras",  name: "Sombras",  desc: "Profundidade com hachura" },
  { id: "cinzel",   name: "Cinzel",   desc: "Entalhado em chapa de cobre" },
  { id: "fantasma", name: "Fantasma", desc: "Ultra-minimalista e etéreo" },
];

const COURSES_COMING = [
  "Tonalizado",
  "Full Color",
  "Lettering",
  "Freehand",
  "Realismo com Textura",
  "Retrato",
  "Animal",
  "Anime — Colorido / Rastelado",
  "Criação de Imagem IA",
  "Criação de Projeto Procreate",
];

/* ── Page ───────────────────────────────────────────────────── */

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? null;
  const profile = await getOrCreateProfile(userId, email);
  const creditsAvailable = await getCreditsAvailable(profile);
  const recentDecals = await getRecentDecals(userId, 10);

  const creditsPercent = profile.credits_total > 0
    ? Math.round((profile.credits_used / profile.credits_total) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">

      {/* ── Navbar ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: "rgba(8,8,8,0.95)",
          backdropFilter: "blur(20px) saturate(180%)",
          borderBottom: "1px solid rgba(34,197,94,0.08)",
        }}
      >
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
          <Logo size={36} />

          <nav className="hidden md:flex items-center gap-7">
            <a href="#decalque" className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#22c55e] hover:text-[#22c55e] transition-colors duration-200">Decalque IA</a>
            <a href="#cursos" className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40 hover:text-[#22c55e] transition-colors duration-200">Cursos</a>
            <a href="#planos" className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40 hover:text-[#22c55e] transition-colors duration-200">Planos</a>
          </nav>

          <div className="flex items-center gap-4">
            {profile.plan !== "free" && creditsAvailable > 0 && (
              <div
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#22c55e]"
                style={{ border: "1px solid rgba(34,197,94,0.25)", background: "rgba(34,197,94,0.06)" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" style={{ boxShadow: "0 0 4px rgba(34,197,94,0.8)" }} />
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

      <main className="max-w-[1600px] mx-auto px-6 md:px-10 pt-24 pb-24">

        {/* ══════════════════════════════════════════
            DECALQUE IA — HERO DESTAQUE
        ══════════════════════════════════════════ */}
        <section id="decalque" className="mb-10">

          {/* Hero card principal */}
          <div
            className="relative overflow-hidden rounded"
            style={{
              background: "linear-gradient(135deg, #061209 0%, #080d0a 50%, #0a0a0a 100%)",
              border: "1px solid rgba(34,197,94,0.2)",
              boxShadow: "0 0 80px rgba(34,197,94,0.07), inset 0 0 80px rgba(34,197,94,0.03)",
            }}
          >
            {/* Grid bg */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: "linear-gradient(rgba(34,197,94,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(34,197,94,0.05) 1px,transparent 1px)",
                backgroundSize: "60px 60px",
                maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 80%)",
              }}
            />
            {/* Glow */}
            <div
              className="absolute top-0 right-0 w-[50%] h-full pointer-events-none glow-pulse"
              style={{ background: "radial-gradient(ellipse at 80% 30%, rgba(34,197,94,0.18) 0%, transparent 60%)" }}
            />
            <div
              className="absolute bottom-0 left-0 w-[40%] h-[60%] pointer-events-none"
              style={{ background: "radial-gradient(ellipse at 20% 80%, rgba(34,197,94,0.07) 0%, transparent 60%)" }}
            />

            <div className="relative px-8 md:px-12 py-12 md:py-16">
              <div className="flex flex-col lg:flex-row gap-12 items-start lg:items-center">

                {/* Texto */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-[#22c55e]"><CrosshairIcon size={18} /></span>
                    <span
                      className="text-[9px] font-black uppercase tracking-[0.28em] px-3 py-1.5 neon-text-sm"
                      style={{ color: "#22c55e", border: "1px solid rgba(34,197,94,0.3)", background: "rgba(34,197,94,0.08)" }}
                    >
                      Disponível agora
                    </span>
                  </div>

                  <h1
                    className="font-bebas uppercase leading-[0.88] mb-4"
                    style={{ fontSize: "clamp(3rem,6vw,6.5rem)" }}
                  >
                    GERADOR DE{" "}
                    <span className="text-[#22c55e] neon-text">DECALQUE</span>
                    <br />COM INTELIGÊNCIA ARTIFICIAL
                  </h1>

                  <p className="text-white/45 text-[15px] leading-relaxed max-w-xl mb-8">
                    Envie qualquer foto ou referência e transforme em stencil profissional pronto para tatuar. Traço exato, proporções preservadas, alta resolução. Escolha entre 4 estilos exclusivos.
                  </p>

                  {/* Estilos */}
                  <div className="flex flex-wrap gap-2 mb-8">
                    {DECAL_STYLES.map(s => (
                      <span
                        key={s.id}
                        className="flex flex-col px-4 py-2.5"
                        style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)" }}
                      >
                        <span className="font-bebas text-[16px] text-[#22c55e] tracking-[0.06em] leading-none">{s.name}</span>
                        <span className="text-[9px] text-white/25 mt-0.5">{s.desc}</span>
                      </span>
                    ))}
                  </div>

                  {/* CTAs */}
                  <div className="flex items-center gap-4 flex-wrap">
                    {creditsAvailable > 0 ? (
                      <Link
                        href="/dashboard/decal"
                        className="flex items-center gap-2.5 px-8 py-4 text-[13px] font-black uppercase tracking-[0.18em] bg-[#22c55e] text-black hover:bg-[#16a34a] transition-all duration-200 neon-border"
                      >
                        <SparkleIcon />
                        Gerar decalque agora
                      </Link>
                    ) : (
                      <a
                        href="#planos"
                        className="flex items-center gap-2.5 px-8 py-4 text-[13px] font-black uppercase tracking-[0.18em] bg-[#22c55e] text-black hover:bg-[#16a34a] transition-all duration-200 neon-border"
                      >
                        Assine para usar <ArrowIcon />
                      </a>
                    )}
                    {creditsAvailable > 0 && (
                      <div className="text-[11px] text-white/30">
                        <span className="text-[#22c55e] font-semibold">{creditsAvailable} créditos</span> disponíveis · 1 por geração
                      </div>
                    )}
                  </div>
                </div>

                {/* Lado direito — indicador de uso */}
                {profile.credits_total > 0 && (
                  <div
                    className="flex-none w-full lg:w-72 p-6 rounded"
                    style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(34,197,94,0.1)" }}
                  >
                    <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/25 mb-5">Uso de créditos</p>

                    <div className="space-y-4 mb-6">
                      {[
                        { label: "Total do plano", value: profile.credits_total, color: "text-white/50" },
                        { label: "Utilizados",     value: profile.credits_used,  color: "text-white/40" },
                        { label: "Disponíveis",    value: creditsAvailable,      color: creditsAvailable === 0 ? "text-red-400" : "text-[#22c55e]" },
                      ].map(item => (
                        <div key={item.label} className="flex items-center justify-between">
                          <span className="text-[11px] text-white/25">{item.label}</span>
                          <span className={`font-bebas text-2xl leading-none ${item.color}`}>{item.value}</span>
                        </div>
                      ))}
                    </div>

                    <div className="w-full h-1.5 rounded-full mb-2" style={{ background: "rgba(255,255,255,0.05)" }}>
                      <div
                        className="h-1.5 rounded-full transition-all duration-700"
                        style={{
                          width: `${creditsPercent}%`,
                          background: creditsPercent > 80
                            ? "linear-gradient(90deg,#dc2626,#ef4444)"
                            : "linear-gradient(90deg,#15803d,#22c55e)",
                          boxShadow: creditsPercent > 0 ? "0 0 8px rgba(34,197,94,0.5)" : "none",
                        }}
                      />
                    </div>
                    <p className="text-[9px] text-white/20 text-right uppercase tracking-[0.14em]">{creditsPercent}% utilizado</p>

                    {profile.plan_expires_at && (
                      <p className="text-[9px] text-white/18 mt-3 uppercase tracking-[0.14em]">
                        Renova em {new Date(profile.plan_expires_at).toLocaleDateString("pt-BR")}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Histórico de decalques */}
          {recentDecals.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/25">Últimos decalques gerados</p>
                <Link href="/dashboard/decal"
                  className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#22c55e]/50 hover:text-[#22c55e] transition-colors"
                >
                  Gerar novo →
                </Link>
              </div>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                {recentDecals.map(job => (
                  <div
                    key={job.id}
                    className="flex-none group relative overflow-hidden"
                    style={{
                      width: "80px",
                      height: "80px",
                      border: "1px solid rgba(255,255,255,0.06)",
                      background: "rgba(255,255,255,0.02)",
                    }}
                  >
                    {job.status === "done" && job.output_url ? (
                      <>
                        <img src={job.output_url} alt="Decalque" className="w-full h-full object-contain p-1.5" />
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
                          style={{ background: "rgba(0,0,0,0.75)" }}
                        >
                          <a href={job.output_url} download={`decalque-${job.id}.png`}
                            className="p-1.5 border border-[#22c55e]/60 text-[#22c55e] hover:bg-[#22c55e] hover:text-black transition-all"
                          >
                            <DownloadIcon />
                          </a>
                        </div>
                        <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#22c55e]"
                          style={{ boxShadow: "0 0 4px rgba(34,197,94,0.8)" }}
                        />
                      </>
                    ) : job.status === "processing" ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-4 h-4 border border-[#22c55e]/40 border-t-[#22c55e] rounded-full animate-spin" />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-[8px] text-red-400/40 uppercase">Erro</span>
                      </div>
                    )}
                  </div>
                ))}

                {/* Botão gerar novo */}
                <Link
                  href="/dashboard/decal"
                  className="flex-none flex flex-col items-center justify-center gap-1 transition-all duration-200 hover:border-[#22c55e]/40 group"
                  style={{
                    width: "80px",
                    height: "80px",
                    border: "1px dashed rgba(34,197,94,0.2)",
                    background: "rgba(34,197,94,0.02)",
                  }}
                >
                  <SparkleIcon />
                  <span className="text-[7px] text-white/20 group-hover:text-[#22c55e] uppercase tracking-wider transition-colors">Novo</span>
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* ══════════════════════════════════════════
            PLANOS
        ══════════════════════════════════════════ */}
        <section id="planos" className="mb-10">
          {profile.plan === "free" ? (
            <>
              <div className="flex items-center gap-3 mb-5">
                <h2 className="font-bebas text-2xl tracking-[0.06em] text-white uppercase">Escolha seu plano</h2>
                <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, rgba(34,197,94,0.15), transparent)" }} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(["starter", "pro", "creator"] as const).map((plan) => {
                  const config = MP_PLANS[plan];
                  const isPro = plan === "pro";
                  return (
                    <form key={plan} action={createCheckoutSession.bind(null, plan)}>
                      <button
                        type="submit"
                        className="w-full text-left p-6 rounded transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] relative"
                        style={{
                          background: isPro ? "rgba(34,197,94,0.07)" : "rgba(255,255,255,0.02)",
                          border: isPro ? "1px solid rgba(34,197,94,0.35)" : "1px solid rgba(255,255,255,0.07)",
                          boxShadow: isPro ? "0 0 24px rgba(34,197,94,0.08)" : "none",
                        }}
                      >
                        {isPro && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-[8px] font-black uppercase tracking-[0.2em] bg-[#22c55e] text-black">
                            Mais popular
                          </div>
                        )}
                        <div className="mb-4">
                          <span className="font-bebas text-2xl tracking-[0.06em] text-white">{config.name}</span>
                          <div className="text-3xl font-black text-white mt-1">{config.price}</div>
                          <p className="text-[11px] text-[#22c55e] mt-1 font-semibold">{config.credits} créditos/mês</p>
                        </div>
                        <ul className="space-y-2 mb-5">
                          {PLAN_FEATURES[plan].map(f => (
                            <li key={f} className="flex items-center gap-2 text-[11px] text-white/40">
                              <span className="text-[#22c55e] text-[10px]">✓</span> {f}
                            </li>
                          ))}
                        </ul>
                        <div
                          className="w-full py-2.5 text-center text-[11px] font-black uppercase tracking-[0.16em]"
                          style={{
                            background: isPro ? "#22c55e" : "rgba(34,197,94,0.1)",
                            color: isPro ? "#000" : "#22c55e",
                            border: isPro ? "none" : "1px solid rgba(34,197,94,0.25)",
                          }}
                        >
                          Assinar {config.name}
                        </div>
                      </button>
                    </form>
                  );
                })}
              </div>
            </>
          ) : (
            <div
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded"
              style={{ background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.12)" }}
            >
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/30 mb-1">Assinatura ativa</p>
                <p className="font-bebas text-xl tracking-[0.06em] text-white">
                  Plano {MP_PLANS[profile.plan as Exclude<typeof profile.plan, "free">]?.name}
                  <span className="ml-3 text-[#22c55e] neon-text-sm text-base">· {creditsAvailable} créditos restantes</span>
                </p>
                {profile.plan_expires_at && (
                  <p className="text-[11px] text-white/30 mt-1">
                    Renova em {new Date(profile.plan_expires_at).toLocaleDateString("pt-BR")}
                  </p>
                )}
              </div>
              <form action={createPortalSession}>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.16em] border border-[#22c55e]/40 text-[#22c55e] hover:bg-[#22c55e]/10 transition-colors"
                >
                  Gerenciar assinatura →
                </button>
              </form>
            </div>
          )}
        </section>

        {/* ══════════════════════════════════════════
            CURSOS EM BREVE
        ══════════════════════════════════════════ */}
        <section id="cursos">
          <div
            className="relative overflow-hidden rounded"
            style={{
              background: "rgba(255,255,255,0.015)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {/* Subtle grid bg */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: "linear-gradient(rgba(34,197,94,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(34,197,94,0.03) 1px,transparent 1px)",
                backgroundSize: "50px 50px",
                maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 90%)",
              }}
            />

            <div className="relative px-8 md:px-12 py-12">
              <div className="flex flex-col lg:flex-row gap-12">

                {/* Esquerda — texto e botão */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-white/20">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-[0.28em] text-white/25">Em breve</span>
                  </div>

                  <h2
                    className="font-bebas uppercase leading-[0.88] mb-4"
                    style={{ fontSize: "clamp(2.5rem,5vw,5rem)", color: "rgba(255,255,255,0.6)" }}
                  >
                    BIBLIOTECA DE
                    <br />
                    <span style={{ color: "rgba(255,255,255,0.25)" }}>CURSOS PRO INK</span>
                  </h2>

                  <p className="text-white/35 text-[14px] leading-relaxed mb-8 max-w-md">
                    Estamos preparando uma biblioteca completa com os melhores tatuadores do Brasil. Seja o primeiro a saber quando estiver disponível.
                  </p>

                  <NotifyButton />
                </div>

                {/* Direita — lista de cursos */}
                <div className="flex-none w-full lg:w-80">
                  <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/20 mb-4">Cursos confirmados</p>
                  <div className="space-y-0">
                    {COURSES_COMING.map((course, i) => (
                      <div
                        key={course}
                        className="flex items-center gap-3 py-2.5"
                        style={{ borderBottom: i < COURSES_COMING.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
                      >
                        <div
                          className="w-4 h-4 flex-none rounded-sm"
                          style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.02)" }}
                        />
                        <span className="text-[12px] text-white/35 font-medium">{course}</span>
                        <span
                          className="ml-auto text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5"
                          style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.06)" }}
                        >
                          Em breve
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      <footer className="py-6 px-6 md:px-10" style={{ borderTop: "1px solid rgba(34,197,94,0.06)" }}>
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
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
