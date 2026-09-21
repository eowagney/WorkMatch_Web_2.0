import React from "react";
import { useNavigate } from "react-router-dom";
import { Btn } from "../components/ui";


const IcoZap = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const IcoDroplets = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/>
    <path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/>
  </svg>
);
const IcoLeaf = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
  </svg>
);
const IcoBroom = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 22 14.5 11.5"/>
    <path d="m15 5-3 3"/>
    <path d="M5 8 2 5l3-3 15 5-9 9-5-3"/>
    <path d="m14.5 11.5 2 4.5-4-2"/>
  </svg>
);
const IcoPaintBucket = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m19 11-8-8-8.5 8.5a5.5 5.5 0 0 0 7.78 7.78L19 11Z"/>
    <path d="m3.5 3.5 19 19"/>
    <path d="M20.5 17c0 2-1.5 3.5-2.5 4 0-1.5.5-2 1-3.5-.5.5-1 1-2 1.5 1-1.5 1-2.5.5-3.5 1.5 1 2 .5 3-1.5z"/>
  </svg>
);
const IcoBrick = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect width="18" height="18" x="3" y="3" rx="2"/>
    <path d="M3 9h18M3 15h18M9 3v6M15 15v6"/>
  </svg>
);
const IcoHammer = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m15 12-8.373 8.373a1 1 0 1 1-3-3L12 9"/>
    <path d="m18 15 4-4"/>
    <path d="m21.5 11.5-1.914-1.914A2 2 0 0 1 19 8.172V7l-2.26-2.26a6 6 0 0 0-4.202-1.756L9 2.96l.92.82A6.18 6.18 0 0 1 12 8.4V10l2 2h1.172a2 2 0 0 1 1.414.586L18.5 14"/>
  </svg>
);
const IcoWrench = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>
);

/* ── Passos ── */
const IcoChatAI = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>
    <path d="M15 8.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/>
  </svg>
);
const IcoMessagesExchange = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z"/>
    <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/>
  </svg>
);
const IcoBadgeCheck = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/>
    <path d="m9 12 2 2 4-4"/>
  </svg>
);

/* ── Diferenciais ── */
const IcoShieldCheck = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="m9 12 2 2 4-4"/>
  </svg>
);
const IcoClock = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IcoSmartphone = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect width="14" height="20" x="5" y="2" rx="2" ry="2"/>
    <path d="M12 18h.01"/>
  </svg>
);
const IcoMessageSquare = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

/* ── Logo-mark SVG do header ── */
const LogoMarkHeader = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none"
    xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect width="32" height="32" rx="8" fill="#F2C94C" fillOpacity="0.18"/>
    <path
      d="M21 10a5 5 0 0 0-4.8 6.36L9.17 23.4a1.67 1.67 0 1 0 2.36 2.36l7.02-7.02A5 5 0 1 0 21 10z"
      fill="#F2C94C" fillOpacity="0.95"
    />
    <circle cx="21" cy="15" r="2.5" fill="#1E5FAF"/>
    <path d="M9.5 23.5a1.1 1.1 0 1 1-1.8-1.3" stroke="#1E5FAF" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

const SERVICOS = [
  { Icon: IcoZap,         label: "Eletricista"    },
  { Icon: IcoDroplets,    label: "Encanador"      },
  { Icon: IcoLeaf,        label: "Jardineiro"     },
  { Icon: IcoBroom,       label: "Faxineiro"      },
  { Icon: IcoPaintBucket, label: "Pintor"         },
  { Icon: IcoBrick,       label: "Pedreiro"       },
  { Icon: IcoHammer,      label: "Marceneiro"     },
  { Icon: IcoWrench,      label: "Reparos gerais" },
];

const PASSOS = [
  { n: "1", Icon: IcoChatAI,           title: "Encontre", desc: "Converse com nossa IA para publicar seu serviço."       },
  { n: "2", Icon: IcoMessagesExchange, title: "Escolha",  desc: "Negocie com os profissionais pelo chat."     },
  { n: "3", Icon: IcoBadgeCheck,       title: "Confirme", desc: "Escolha o profissional certo para seu serviço."     },
];

const DIFERENCIAIS = [
  { Icon: IcoShieldCheck,  title: "Profissionais verificados", desc: "CPF e dados validados antes do cadastro."  },
  { Icon: IcoClock,        title: "IA disponível 24 horas",      desc: "Para te ajudar a fazer uma publicação mais detalhada."             },
  { Icon: IcoSmartphone,   title: "Fácil de usar",             desc: "Pensado para ser simples para todos."      },
  { Icon: IcoMessageSquare,title: "Suporte dedicado",          desc: "Equipe pronta para ajudar."                },
];

export default function InicioPage() {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: "var(--font-body)", background: "var(--clr-bg)" }}>

      {/* ── Navbar — header CEL navy ── */}
      <nav className="wm-header">
        <div className="wm-header__inner">

          <div className="wm-header__brand">
            {/* Logo-mark SVG — sem emoji */}
            <div className="wm-header__logo-mark">
              <LogoMarkHeader />
            </div>

            {/* Grupo título + subtítulo — estrutura CEL */}
            <div className="wm-header__title-group">
              <div className="wm-header__title">WorkMatch</div>
              <div className="wm-header__subtitle">Serviços autônomos</div>
            </div>
          </div>

          <div className="wm-header__nav">
            <button className="wm-nav-link" onClick={() => navigate("/login")}>
              Entrar
            </button>
            <button
              className="wm-nav-link wm-nav-link--active"
              onClick={() => navigate("/cadastro")}
            >
              Criar conta
            </button>
          </div>

        </div>
      </nav>

      {/* ── Hero — fundo navy + gradientes radiais CEL ── */}
      <section className="wm-hero" style={{ paddingTop: 120 }}>
        <div
          className="wm-animate-fadeUp"
          style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 600 }}
        >
          {/* Eyebrow — sem emoji, apenas texto e badge pill */}
          <div className="wm-hero__eyebrow">
            Plataforma de serviços autônomos
          </div>

          <h1 className="wm-hero__title">
            O profissional certo,<br />
            <em>no momento certo.</em>
          </h1>

          <p className="wm-hero__desc">
            Encontre eletricistas, encanadores, jardineiros e muito mais —
            com facilidade e segurança.
          </p>

          <div className="wm-hero__actions">
            <Btn size="lg" onClick={() => navigate("/cadastro")}>
              Começar agora
            </Btn>
            <Btn size="lg" variant="secondary" onClick={() => navigate("/login")}>
              Já tenho conta
            </Btn>
          </div>
        </div>
      </section>

      {/* ── Especialidades ── */}
      <section style={{ padding: "80px var(--container-p)" }}>
        <div style={{ maxWidth: "var(--container)", margin: "0 auto" }}>

          <p style={{
            textAlign: "center", fontSize: "0.78rem", fontWeight: 600,
            letterSpacing: "0.07em", textTransform: "uppercase",
            color: "var(--clr-blue)", marginBottom: "var(--sp-3)",
          }}>
            Especialidades
          </p>

          <h2 style={{
            textAlign: "center", fontFamily: "var(--font-display)",
            fontSize: "clamp(1.6rem,4vw,2.2rem)", color: "var(--clr-navy)",
            marginBottom: "var(--sp-10)", letterSpacing: "-0.02em", fontWeight: 400,
          }}>
            O que você precisa hoje?
          </h2>

          {/* Grid de serviços — SVG icons, sem emojis */}
          <div className="wm-services-grid">
            {SERVICOS.map(({ Icon, label }) => (
              <button
                key={label}
                className="wm-service-chip"
                onClick={() => navigate("/cadastro")}
                aria-label={label}
              >
                <span className="wm-service-chip__icon">
                  <Icon />
                </span>
                {label}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* ── Como funciona — fundo blue-pale (via --clr-purple-pale remapeado) ── */}
      <section style={{ padding: "72px var(--container-p)", background: "var(--clr-purple-pale)" }}>
        <div style={{ maxWidth: "var(--container)", margin: "0 auto" }}>

          <p className="wm-page-hero__eyebrow" style={{ textAlign: "center", marginBottom: "var(--sp-2)" }}>
            Simples assim
          </p>

          <h2 style={{
            fontFamily: "var(--font-display)", fontSize: "clamp(24px,4vw,36px)",
            color: "var(--clr-navy)", textAlign: "center",
            marginBottom: "var(--sp-12)", fontWeight: 400,
          }}>
            Como funciona
          </h2>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "var(--sp-6)",
          }}>
            {PASSOS.map(({ n, Icon, title, desc }) => (
              <div
                key={n}
                style={{
                  background: "var(--clr-surface)", borderRadius: "var(--r-lg)",
                  padding: "var(--sp-8) var(--sp-6)", position: "relative",
                  border: "1px solid var(--clr-border)", boxShadow: "var(--shadow-sm)",
                }}
              >
                {/* Número do passo — badge CEL blue */}
                <div style={{
                  position: "absolute", top: -14, left: 24,
                  background: "var(--clr-blue)", color: "#fff",
                  width: 30, height: 30, borderRadius: "var(--r-full)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 900,
                }}>
                  {n}
                </div>

                {/* Ícone SVG — sem emoji */}
                <div style={{
                  marginBottom: "var(--sp-4)", marginTop: "var(--sp-2)",
                  color: "var(--clr-blue)",
                  display: "flex", alignItems: "center",
                }}>
                  <Icon />
                </div>

                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: "var(--sp-2)", color: "var(--clr-navy)" }}>
                  {title}
                </h3>
                <p style={{ fontSize: 14, color: "var(--clr-text-mid)", lineHeight: 1.6 }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Diferenciais ── */}
      <section style={{ padding: "72px var(--container-p)" }}>
        <div style={{ maxWidth: "var(--container)", margin: "0 auto" }}>

          <h2 style={{
            fontFamily: "var(--font-display)", fontSize: "clamp(24px,4vw,36px)",
            color: "var(--clr-navy)", textAlign: "center",
            marginBottom: "var(--sp-12)", fontWeight: 400,
          }}>
            Por que WorkMatch?
          </h2>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "var(--sp-5)",
          }}>
            {DIFERENCIAIS.map(({ Icon, title, desc }) => (
              <div
                key={title}
                style={{
                  background: "var(--clr-surface)", borderRadius: "var(--r-lg)",
                  padding: "var(--sp-6)", border: "1px solid var(--clr-border)",
                  borderTop: "3px solid var(--clr-blue)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                {/* Ícone SVG — sem emoji */}
                <div style={{
                  marginBottom: "var(--sp-4)", color: "var(--clr-blue)",
                  display: "flex", alignItems: "center",
                }}>
                  <Icon />
                </div>

                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: "var(--sp-2)", color: "var(--clr-navy)" }}>
                  {title}
                </h3>
                <p style={{ fontSize: 14, color: "var(--clr-text-mid)", lineHeight: 1.6 }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── CTA — gradiente navy CEL ── */}
      <section style={{
        background: "var(--clr-navy)",
        backgroundImage: "radial-gradient(circle at 20% 30%, rgba(30,95,175,0.4) 0%, transparent 55%), radial-gradient(circle at 80% 70%, rgba(242,201,76,0.1) 0%, transparent 50%)",
        padding: "80px var(--container-p)",
        textAlign: "center",
      }}>
        <h2 style={{
          fontFamily: "var(--font-display)", fontSize: "clamp(28px,5vw,48px)",
          color: "#ffffff", marginBottom: "var(--sp-4)", fontWeight: 400,
        }}>
          Pronto para começar?
        </h2>
        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 17, marginBottom: "var(--sp-10)" }}>
          Crie sua conta gratuitamente e publique seu serviço hoje mesmo.
        </p>
        <Btn variant="accent" size="lg" onClick={() => navigate("/cadastro")}>
          Criar conta grátis
        </Btn>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        background: "var(--clr-navy-deep)",
        color: "rgba(255,255,255,0.45)",
        textAlign: "center",
        padding: "var(--sp-6)",
        fontSize: 13,
        letterSpacing: "0.01em",
      }}>
        {new Date().getFullYear()} WorkMatch — Conectando você ao profissional certo.
      </footer>

    </div>
  );
}