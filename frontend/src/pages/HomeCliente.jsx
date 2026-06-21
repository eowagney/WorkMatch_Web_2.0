
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageLayout from "../components/PageLayout";
import { Btn, Card, CardBody } from "../components/ui";

/* =========================================================
   ÍCONES SVG — inline, Lucide-style
========================================================= */

/* Bot / IA */
const IcoBot = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <path d="M12 8V4H8"/>
    <rect width="16" height="12" x="4" y="8" rx="2"/>
    <path d="M2 14h2M20 14h2M9 17v1M15 17v1M9 13h.01M15 13h.01"/>
  </svg>
);

/* Clipboard — publicados */
const IcoClipboard = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <path d="M12 11h4M12 16h4M8 11h.01M8 16h.01"/>
  </svg>
);

/* MessageSquare — negociando */
const IcoMessage = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

/* Settings — em andamento */
const IcoSettings = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

/* CheckCircle — concluídos / etapa 4 */
const IcoCheck = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

/* Handshake / Users — negocie e contrate */
const IcoHandshake = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/>
  </svg>
);

/* Sparks / publicação automática */
const IcoSparks = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3z"/>
    <path d="M5 3v4M19 17v4M3 5h4M17 19h4"/>
  </svg>
);

/* =========================================================
   DADOS — emoji substituído por componente Icon
========================================================= */

const COMO_FUNCIONA = [
  {
    n: "1",
    Icon: IcoBot,
    title: "Converse com a IA",
    desc: "Nossa inteligência artificial coleta os detalhes do seu serviço por meio de uma conversa simples e natural.",
  },
  {
    n: "2",
    Icon: IcoSparks,
    title: "Publicação automática",
    desc: "A IA organiza as informações e publica o seu serviço para que profissionais qualificados possam se candidatar.",
  },
  {
    n: "3",
    Icon: IcoHandshake,
    title: "Negocie e contrate",
    desc: "Avalie os candidatos, negocie os detalhes e contrate o profissional ideal para o seu serviço.",
  },
  {
    n: "4",
    Icon: IcoCheck,
    title: "Serviço concluído",
    desc: "Após a conclusão, avalie o profissional e ajude outros clientes a encontrar os melhores.",
  },
];

const STATUS_CARDS = [
  { label: "Publicados",   Icon: IcoClipboard, color: "var(--clr-blue)",    path: "/meus-servicos?status=publicado"  },
  { label: "Negociando",   Icon: IcoMessage,   color: "var(--clr-warning)", path: "/meus-servicos?status=negociando" },
  { label: "Em andamento", Icon: IcoSettings,  color: "var(--clr-teal)",    path: "/meus-servicos?status=andamento"  },
  { label: "Concluídos",   Icon: IcoCheck,     color: "var(--clr-success)", path: "/meus-servicos?status=concluido"  },
];

/* Fundo da página — azul suave, padrão fixo do sistema */
const canvasStyle = {
  background:   "var(--clr-blue-pale)",
  borderRadius: "var(--r-lg)",
  padding:      "var(--sp-6)",
};

/* =========================================================
   COMPONENTE
========================================================= */

export default function HomeCliente() {
  const navigate = useNavigate();
  const { user }  = useAuth();
  const primeiroNome = user?.nome?.split(" ")[0] || "Cliente";

  function handleStatusKeyDown(e, path) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigate(path);
    }
  }

  return (
    <PageLayout title="Início" subtitle="Bem-vindo ao WorkMatch">
      <div style={canvasStyle}>

        {/* ── Banner boas-vindas ── */}
        <div
          className="wm-animate-fadeUp"
          style={{
            background:    "linear-gradient(135deg, var(--clr-navy-deep) 0%, var(--clr-purple-mid) 100%)",
            borderRadius:  "var(--r-xl)",
            padding:       "var(--sp-8)",
            color:         "#fff",
            display:       "flex",
            alignItems:    "center",
            justifyContent:"space-between",
            flexWrap:      "wrap",
            gap:           "var(--sp-6)",
            marginBottom:  "var(--sp-6)",
          }}
        >
          <div>
            {/* Saudação — emoji 👋 removido, padrão CEL */}
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

          {/* Botão IA — SVG Bot, sem emoji 🤖 */}
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

        {/* ── Resumo de serviços por status ── */}
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
            {STATUS_CARDS.map(({ label, Icon, color, path }, i) => (
              <div
                key={label}
                className={`wm-animate-fadeUp wm-delay-${i + 1}`}
                role="button"
                tabIndex={0}
                aria-label={label}
                onClick={() => navigate(path)}
                onKeyDown={(e) => handleStatusKeyDown(e, path)}
                style={{
                  background:    "var(--clr-surface)",
                  borderRadius:  "var(--r-lg)",
                  border:        "1px solid var(--clr-border)",
                  borderTop:     `3px solid ${color}`,
                  padding:       "var(--sp-5)",
                  cursor:        "pointer",
                  transition:    "box-shadow var(--t-base), transform var(--t-base)",
                  boxShadow:     "var(--shadow-xs)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow  = "var(--shadow-md)";
                  e.currentTarget.style.transform  = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow  = "var(--shadow-xs)";
                  e.currentTarget.style.transform  = "none";
                }}
              >
                {/* Ícone SVG no lugar do emoji */}
                <div style={{
                  marginBottom: "var(--sp-3)", color,
                  display: "flex", alignItems: "center",
                }}>
                  <Icon size={28} />
                </div>
                <p style={{ fontWeight: 700, color: "var(--clr-navy)", fontSize: 13 }}>
                  {label}
                </p>
              </div>
            ))}
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

                  {/* Ícone SVG + badge de número — sem emoji */}
                  <div style={{
                    position: "relative", display: "inline-flex",
                    marginBottom: "var(--sp-4)",
                    color: "var(--clr-blue)",
                  }}>
                    <Icon size={32} />

                    {/* Badge do número — var(--clr-blue) direto, sem alias purple */}
                    <span style={{
                      position:       "absolute", top: -6, right: -10,
                      background:     "var(--clr-blue)", color: "#fff",
                      width: 20, height: 20, borderRadius: "var(--r-full)",
                      display:        "flex", alignItems: "center", justifyContent: "center",
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