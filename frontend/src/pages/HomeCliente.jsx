import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageLayout from "../components/PageLayout";
import { Btn, Card, CardBody } from "../components/ui";
import api from "../services/api";

/* =========================================================
   ÍCONES SVG — inline, Lucide-style
========================================================= */

const IcoBot = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <path d="M12 8V4H8"/>
    <rect width="16" height="12" x="4" y="8" rx="2"/>
    <path d="M2 14h2M20 14h2M9 17v1M15 17v1M9 13h.01M15 13h.01"/>
  </svg>
);

const IcoClipboard = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <path d="M12 11h4M12 16h4M8 11h.01M8 16h.01"/>
  </svg>
);

const IcoMessage = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const IcoSettings = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const IcoCheck = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const IcoHandshake = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/>
  </svg>
);

const IcoSparks = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3z"/>
    <path d="M5 3v4M19 17v4M3 5h4M17 19h4"/>
  </svg>
);

const IcoUsers = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

/* =========================================================
   DADOS ESTÁTICOS
========================================================= */

const COMO_FUNCIONA = [
  { n: "1", Icon: IcoBot,       title: "Converse com a IA",       desc: "Nossa inteligência artificial coleta os detalhes do seu serviço por meio de uma conversa simples e natural." },
  { n: "2", Icon: IcoSparks,    title: "Publicação automática",    desc: "A IA organiza as informações e publica o seu serviço para que profissionais qualificados possam se candidatar." },
  { n: "3", Icon: IcoHandshake, title: "Negocie e contrate",       desc: "Avalie os candidatos, negocie os detalhes e contrate o profissional ideal para o seu serviço." },
  { n: "4", Icon: IcoCheck,     title: "Serviço concluído",        desc: "Após a conclusão, avalie o profissional e ajude outros clientes a encontrar os melhores." },
];

const STATUS_CARDS = [
  { label: "Publicados",   Icon: IcoClipboard, color: "var(--clr-blue)",    statuses: ["PUBLICADO"],            path: "/meus-servicos" },
  { label: "Negociando",   Icon: IcoMessage,   color: "var(--clr-warning)", statuses: ["NEGOCIANDO"],           path: "/meus-servicos" },
  { label: "Em andamento", Icon: IcoSettings,  color: "var(--clr-teal)",    statuses: ["CONTRATADO","ANDAMENTO"],path: "/meus-servicos" },
  { label: "Concluídos",   Icon: IcoCheck,     color: "var(--clr-success)", statuses: ["FINALIZADO"],           path: "/meus-servicos" },
];

/* =========================================================
   SKELETON DO CONTADOR
========================================================= */

function CounterSkeleton() {
  return (
    <div style={{
      background:   "var(--clr-surface)",
      borderRadius: "var(--r-lg)",
      border:       "1px solid var(--clr-border)",
      borderTop:    "3px solid var(--clr-border)",
      padding:      "var(--sp-5)",
    }}>
      <div className="wm-skeleton" style={{ height: 28, width: 40, borderRadius: "var(--r-md)", marginBottom: "var(--sp-2)" }} />
      <div className="wm-skeleton" style={{ height: 12, width: 70, borderRadius: "var(--r-md)" }} />
    </div>
  );
}

/* =========================================================
   COMPONENTE
========================================================= */

export default function HomeCliente() {
  const navigate = useNavigate();
  const { user }  = useAuth();
  const primeiroNome = user?.nome?.split(" ")[0] || "Cliente";

  const [contadores,       setContadores]       = useState(null);
  const [candidatosPendentes, setCandidatosPendentes] = useState(0);
  const [carregando,       setCarregando]       = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    carregarResumo();
  }, [user?.id]);

  async function carregarResumo() {
    setCarregando(true);
    try {
      const { data: servicos } = await api.get(`/api/servicos/cliente/${user.id}`);

      // Conta serviços por grupo de status
      const contagem = {};
      STATUS_CARDS.forEach(card => {
        contagem[card.label] = servicos.filter(s =>
          card.statuses.includes(s.status)
        ).length;
      });
      setContadores(contagem);

      // Busca candidatos pendentes em serviços PUBLICADO
      const servicosPublicados = servicos.filter(s => s.status === "PUBLICADO");
      if (servicosPublicados.length > 0) {
        const resultados = await Promise.all(
          servicosPublicados.map(s =>
            api.get(`/api/candidaturas/servico/${s.id}`).catch(() => ({ data: [] }))
          )
        );
        const total = resultados.reduce((acc, r) => acc + (r.data?.length ?? 0), 0);
        setCandidatosPendentes(total);
      }
    } catch {
      // silencioso — contadores ficam nulos, UI mostra "–"
    } finally {
      setCarregando(false);
    }
  }

  function handleStatusKeyDown(e, path) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigate(path);
    }
  }

  return (
    <PageLayout title="Início" subtitle="Bem-vindo ao WorkMatch">
      <style>{`
        .wm-skeleton {
          background: var(--clr-bg);
          animation: wm-pulse 1.4s ease-in-out infinite;
        }
        @keyframes wm-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: .5; }
        }
      `}</style>

      <div style={{
        background:   "var(--clr-blue-pale)",
        borderRadius: "var(--r-lg)",
        padding:      "var(--sp-6)",
      }}>

        {/* ── Banner boas-vindas ── */}
        <div
          className="wm-animate-fadeUp"
          style={{
            background:     "linear-gradient(135deg, var(--clr-navy-deep) 0%, var(--clr-navy-mid) 100%)",
            borderRadius:   "var(--r-xl)",
            padding:        "var(--sp-8)",
            color:          "#fff",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "space-between",
            flexWrap:       "wrap",
            gap:            "var(--sp-6)",
            marginBottom:   "var(--sp-6)",
          }}
        >
          <div>
            <p style={{
              fontSize: 13, color: "rgba(255,255,255,0.6)", fontWeight: 600,
              textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "var(--sp-2)",
            }}>
              Olá, {primeiroNome}
            </p>
            <h2 style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(22px, 3vw, 32px)",
              marginBottom: "var(--sp-3)", lineHeight: 1.2,
            }}>
              Precisa de um profissional?
            </h2>
            <p style={{ color: "rgba(255,255,255,0.72)", fontSize: 15, maxWidth: 420, lineHeight: 1.6 }}>
              Converse com nossa IA e publique seu serviço em minutos.
              Profissionais da sua região vão se candidatar.
            </p>
          </div>

          <Btn
            variant="accent"
            size="lg"
            onClick={() => navigate("/novo-servico")}
            style={{ flexShrink: 0 }}
          >
            <IcoBot size={18} />
            Iniciar com IA
          </Btn>
        </div>

        {/* ── Badge de candidatos pendentes ── */}
        {!carregando && candidatosPendentes > 0 && (
          <div
            onClick={() => navigate("/meus-servicos")}
            style={{
              background:   "var(--clr-warning-bg)",
              border:       "1.5px solid var(--clr-warning)",
              borderRadius: "var(--r-lg)",
              padding:      "var(--sp-4) var(--sp-5)",
              display:      "flex",
              alignItems:   "center",
              gap:          "var(--sp-3)",
              marginBottom: "var(--sp-5)",
              cursor:       "pointer",
              transition:   "opacity var(--t-fast)",
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            <span style={{
              background:   "var(--clr-warning)",
              color:        "#fff",
              borderRadius: "var(--r-full)",
              fontWeight:   800,
              fontSize:     13,
              padding:      "2px 10px",
              flexShrink:   0,
            }}>
              {candidatosPendentes}
            </span>
            <span style={{ fontSize: 14, color: "var(--clr-warning)", fontWeight: 600 }}>
              <IcoUsers size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />
              {candidatosPendentes === 1
                ? "novo candidato aguardando sua resposta"
                : "novos candidatos aguardando sua resposta"
              } — clique para ver
            </span>
          </div>
        )}

        {/* ── Contadores por status ── */}
        <div style={{ marginBottom: "var(--sp-6)" }}>
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between", marginBottom: "var(--sp-4)",
          }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", color: "var(--clr-navy)" }}>
              Meus serviços
            </h3>
            <button
              onClick={() => navigate("/meus-servicos")}
              style={{
                background: "none", border: "none",
                color: "var(--clr-blue)", fontWeight: 700,
                fontSize: 13, cursor: "pointer", fontFamily: "inherit",
              }}
            >
              Ver todos
            </button>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "var(--sp-4)",
          }}>
            {carregando
              ? Array.from({ length: 4 }).map((_, i) => <CounterSkeleton key={i} />)
              : STATUS_CARDS.map(({ label, Icon, color, path }, i) => (
                <div
                  key={label}
                  className={`wm-animate-fadeUp wm-delay-${i + 1}`}
                  role="button"
                  tabIndex={0}
                  aria-label={label}
                  onClick={() => navigate(path)}
                  onKeyDown={(e) => handleStatusKeyDown(e, path)}
                  style={{
                    background:   "var(--clr-surface)",
                    borderRadius: "var(--r-lg)",
                    border:       "1px solid var(--clr-border)",
                    borderTop:    `3px solid ${color}`,
                    padding:      "var(--sp-5)",
                    cursor:       "pointer",
                    transition:   "box-shadow var(--t-base), transform var(--t-base)",
                    boxShadow:    "var(--shadow-xs)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "var(--shadow-md)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "var(--shadow-xs)";
                    e.currentTarget.style.transform = "none";
                  }}
                >
                  <div style={{ marginBottom: "var(--sp-2)", color, display: "flex", alignItems: "center" }}>
                    <Icon size={28} />
                  </div>
                  {/* Contador real */}
                  <p style={{
                    fontSize:     28,
                    fontWeight:   800,
                    color:        contadores?.[label] > 0 ? color : "var(--clr-text-light)",
                    lineHeight:   1,
                    marginBottom: "var(--sp-1)",
                    fontFamily:   "var(--font-body)",
                  }}>
                    {contadores?.[label] ?? 0}
                  </p>
                  <p style={{ fontWeight: 600, color: "var(--clr-navy)", fontSize: 13 }}>
                    {label}
                  </p>
                </div>
              ))
            }
          </div>
        </div>

        {/* ── Como funciona ── */}
        <div>
          <h3 style={{
            fontFamily: "var(--font-display)", fontSize: "1.2rem",
            color: "var(--clr-navy)", marginBottom: "var(--sp-4)",
          }}>
            Como funciona
          </h3>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "var(--sp-4)",
          }}>
            {COMO_FUNCIONA.map(({ n, Icon, title, desc }, i) => (
              <Card key={n} className={`wm-animate-fadeUp wm-delay-${i + 1}`}>
                <CardBody>
                  <div style={{
                    position: "relative", display: "inline-flex",
                    marginBottom: "var(--sp-4)", color: "var(--clr-blue)",
                  }}>
                    <Icon size={32} />
                    <span style={{
                      position: "absolute", top: -6, right: -10,
                      background: "var(--clr-blue)", color: "#fff",
                      width: 20, height: 20, borderRadius: "var(--r-full)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 900,
                    }}>
                      {n}
                    </span>
                  </div>
                  <p style={{ fontWeight: 700, color: "var(--clr-navy)", marginBottom: "var(--sp-2)", fontSize: 15 }}>
                    {title}
                  </p>
                  <p style={{ fontSize: 13, color: "var(--clr-text-mid)", lineHeight: 1.6 }}>
                    {desc}
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>

      </div>
    </PageLayout>
  );
}