
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import PageLayout from "../components/PageLayout";
import { Card, CardHeader, CardBody, CardTitle, Btn } from "../components/ui";
import AvaliacaoModal from "../components/AvaliacaoModal";
import { useToast } from "../hooks/useToast";

const TABS_CLIENTE = [
  { label: "Ativos",     statuses: ["PUBLICADO","NEGOCIANDO","CONTRATADO","ANDAMENTO"] },
  { label: "Finalizados", statuses: ["FINALIZADO"] },
  { label: "Arquivados",  statuses: ["ARQUIVADO"] },
];

const TABS_PROFISSIONAL = [
  { label: "Ativos",     statuses: ["NEGOCIANDO","CONTRATADO","ANDAMENTO"] },
  { label: "Finalizados", statuses: ["FINALIZADO"] },
];

const STATUS_LABEL = {
  PUBLICADO:  "Publicado",
  NEGOCIANDO: "Negociando",
  CONTRATADO: "Contratado",
  ANDAMENTO:  "Em andamento",
  FINALIZADO: "Finalizado",
  ARQUIVADO:  "Arquivado",
};

const STATUS_CLASS = {
  PUBLICADO:  "wm-badge--blue",
  NEGOCIANDO: "wm-badge--yellow",
  CONTRATADO: "wm-badge--green",
  ANDAMENTO:  "wm-badge--green",
  FINALIZADO: "wm-badge--gray",
  ARQUIVADO:  "wm-badge--gray",
};

/* =========================================================
   ÍCONES SVG — inline, Lucide-style
========================================================= */

function IconMessageCircle() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconStar() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconFilter() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}

function IconMapPin() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconBriefcase() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function IconArrowRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function IconX() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function IconInbox() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  );
}

/* Fundo da página — azul suave, padrão fixo do sistema */
const canvasStyle = {
  background:   "var(--clr-blue-pale)",
  borderRadius: "var(--r-lg)",
  padding:      "var(--sp-6)",
};

/* Skeleton de um card de serviço — usado só durante o carregamento inicial */
function ServicoSkeletonCard() {
  return (
    <Card>
      <CardBody>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--sp-3)" }}>
            <div className="wm-skeleton" style={{ height: 18, width: "60%", borderRadius: "var(--r-md)" }} />
            <div className="wm-skeleton" style={{ height: 18, width: 70, borderRadius: "var(--r-full)" }} />
          </div>
          <div className="wm-skeleton" style={{ height: 12, width: "40%", borderRadius: "var(--r-md)" }} />
          <div className="wm-skeleton" style={{ height: 12, width: "55%", borderRadius: "var(--r-md)" }} />
          <div className="wm-skeleton" style={{ height: 32, width: 120, borderRadius: "var(--r-md)" }} />
        </div>
      </CardBody>
    </Card>
  );
}

export default function MeusServicos() {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const { showToast } = useToast();

  const ehProfissional = user?.role === "PROFISSIONAL";
  const tabs           = ehProfissional ? TABS_PROFISSIONAL : TABS_CLIENTE;

  const [abaAtiva,         setAbaAtiva]         = useState(0);
  const [servicos,         setServicos]         = useState([]);
  const [avaliados,        setAvaliados]        = useState(new Set());
  const [carregando,       setCarregando]       = useState(true);
  const [servicoAvaliando, setServicoAvaliando] = useState(null); // modal

  useEffect(() => {
    if (!user?.id) return;
    carregarDados();
  }, [user?.id]);

  async function carregarDados() {
    setCarregando(true);
    try {
      const endpoint = ehProfissional
        ? `/api/servicos/profissional/${user.id}`
        : `/api/servicos/cliente/${user.id}`;

      const [resServicos, resAvaliados] = await Promise.all([
        api.get(endpoint),
        ehProfissional
          ? Promise.resolve({ data: [] })
          : api.get(`/api/avaliacoes/cliente/${user.id}/avaliados`),
      ]);

      setServicos(resServicos.data ?? []);
      setAvaliados(new Set(resAvaliados.data ?? []));
    } catch {
      showToast("Erro ao carregar serviços.", "erro");
    } finally {
      setCarregando(false);
    }
  }

  async function handleAvancar(servico) {
    try {
      await api.patch(`/api/servicos/${servico.id}/avancar`, null, {
        params: { profissionalId: servico.profissionalId },
      });
      await carregarDados();
      showToast("Status atualizado.", "sucesso");
    } catch (err) {
      showToast(err.response?.data?.message ?? "Erro ao avançar status.", "erro");
    }
  }

  async function handleCancelar(servico) {
    if (!window.confirm(`Cancelar o serviço "${servico.titulo}"?`)) return;
    try {
      await api.delete(`/api/servicos/${servico.id}`);
      await carregarDados();
      showToast("Serviço cancelado.", "sucesso");
    } catch (err) {
      showToast(err.response?.data?.message ?? "Erro ao cancelar.", "erro");
    }
  }

  function handleAvaliacaoSucesso() {
    setServicoAvaliando(null);
    carregarDados();
    showToast("Avaliação enviada!", "sucesso");
  }

  const servicosFiltrados = servicos.filter(s =>
    tabs[abaAtiva].statuses.includes(s.status)
  );

  function contarPorTab(tab) {
    return servicos.filter(s => tab.statuses.includes(s.status)).length;
  }

  return (
    <PageLayout title="Meus Serviços" backPath="/home">
      <style>{`
        .wm-skeleton {
          background: var(--clr-bg);
          animation: wm-pulse 1.4s ease-in-out infinite;
        }
        @keyframes wm-pulse {
          0%, 100% { opacity: 1; }
          50%      { opacity: .5; }
        }
      `}</style>

      <div style={canvasStyle}>

        {/* Abas — Card temático + segmented control com contador */}
        <Card style={{ marginBottom: "var(--sp-6)" }}>
          <CardHeader>
            <CardTitle>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--sp-2)" }}>
                <IconFilter /> Filtrar por status
              </span>
            </CardTitle>
          </CardHeader>
          <CardBody>
            <p style={{ fontSize: 12, color: "var(--clr-text-light)", marginBottom: "var(--sp-3)" }}>
              {servicos.length} serviço{servicos.length !== 1 ? "s" : ""} no total
            </p>

            <div
              className="wm-tabs"
              role="tablist"
              style={{
                display: "inline-flex", gap: "var(--sp-1)", flexWrap: "wrap",
                background: "var(--clr-bg)", padding: 4, borderRadius: "var(--r-full)",
              }}
            >
              {tabs.map((tab, i) => {
                const ativa = abaAtiva === i;
                return (
                  <button
                    key={tab.label}
                    role="tab"
                    aria-selected={ativa}
                    className={`wm-tab${ativa ? " wm-tab--active" : ""}`}
                    onClick={() => setAbaAtiva(i)}
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "var(--sp-2) var(--sp-4)",
                      borderRadius: "var(--r-full)",
                      border: "none",
                      background: ativa ? "var(--clr-blue)" : "transparent",
                      color: ativa ? "#fff" : "var(--clr-text-mid)",
                      fontWeight: 600, fontSize: 13, cursor: "pointer",
                      fontFamily: "inherit",
                      transition: "background var(--t-base), color var(--t-base)",
                      boxShadow: ativa ? "var(--shadow-xs)" : "none",
                    }}
                  >
                    {tab.label}
                    <span style={{
                      background: ativa ? "rgba(255,255,255,0.25)" : "var(--clr-border)",
                      color:      ativa ? "#fff" : "var(--clr-text-light)",
                      borderRadius: "var(--r-full)",
                      fontSize: 11, fontWeight: 700,
                      padding: "1px 7px", minWidth: 18, textAlign: "center",
                    }}>
                      {contarPorTab(tab)}
                    </span>
                  </button>
                );
              })}
            </div>
          </CardBody>
        </Card>

        {carregando ? (
          <div
            role="status"
            aria-live="polite"
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--sp-5)" }}
          >
            <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden" }}>
              Carregando...
            </span>
            {Array.from({ length: 6 }).map((_, i) => (
              <ServicoSkeletonCard key={i} />
            ))}
          </div>
        ) : servicosFiltrados.length === 0 ? (
          <Card>
            <CardBody>
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                textAlign: "center", gap: "var(--sp-3)", padding: "var(--sp-8) var(--sp-4)",
              }}>
                <div style={{ color: "var(--clr-text-light)" }}>
                  <IconInbox />
                </div>
                <p style={{ fontWeight: 700, color: "var(--clr-navy)", fontSize: 15 }}>
                  Nenhum serviço nesta categoria
                </p>
                <p style={{ fontSize: 13, color: "var(--clr-text-light)", maxWidth: 320, lineHeight: 1.6 }}>
                  Quando houver serviços com esse status, eles vão aparecer aqui.
                </p>
              </div>
            </CardBody>
          </Card>
        ) : (
          <>
            <p style={{ fontSize: 13, color: "var(--clr-text-light)", marginBottom: "var(--sp-3)" }}>
              {servicosFiltrados.length} serviço{servicosFiltrados.length !== 1 ? "s" : ""} encontrado{servicosFiltrados.length !== 1 ? "s" : ""}
            </p>

            <div
              className="wm-card-grid"
              style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "var(--sp-5)" }}
            >
              {servicosFiltrados.map(servico => {
                const jaAvaliou = avaliados.has(servico.id);

                return (
                  <Card key={servico.id}>
                    <div className="wm-service-card" style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
                      <div
                        className="wm-service-card__header"
                        style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--sp-3)" }}
                      >
                        <h3
                          className="wm-service-card__title"
                          style={{ fontFamily: "var(--font-display)", fontSize: 15, color: "var(--clr-navy)", lineHeight: 1.3 }}
                        >
                          {servico.titulo}
                        </h3>
                        <span
                          className={`wm-badge ${STATUS_CLASS[servico.status] ?? "wm-badge--gray"}`}
                          style={{ flexShrink: 0 }}
                        >
                          {STATUS_LABEL[servico.status] ?? servico.status}
                        </span>
                      </div>

                      <p
                        className="wm-service-card__specialty"
                        style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "var(--clr-blue)" }}
                      >
                        <IconBriefcase /> {servico.especialidade}
                      </p>

                      {(servico.cidade || servico.profissionalNome) && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          {servico.cidade && (
                            <p className="wm-text-muted" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                              <IconMapPin /> {servico.cidade}{servico.estado ? ` — ${servico.estado}` : ""}
                            </p>
                          )}
                          {servico.profissionalNome && (
                            <p className="wm-text-muted" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                              <IconUser /> {servico.profissionalNome}
                            </p>
                          )}
                        </div>
                      )}

                      <div
                        className="wm-service-card__actions"
                        style={{ display: "flex", gap: "var(--sp-2)", flexWrap: "wrap", marginTop: "var(--sp-1)" }}
                      >
                        {/* Chat disponível quando há profissional vinculado */}
                        {["NEGOCIANDO","CONTRATADO","ANDAMENTO"].includes(servico.status) && (
                          <Btn
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/chat/${servico.id}/${servico.profissionalId ?? user.id}`)}
                          >
                            <IconMessageCircle /> Chat
                          </Btn>
                        )}

                        {/* Ver candidatos — apenas CLIENTE em PUBLICADO/NEGOCIANDO */}
                        {!ehProfissional && ["PUBLICADO","NEGOCIANDO"].includes(servico.status) && (
                          <Btn
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/servico/${servico.id}/candidatos`)}
                          >
                            <IconUsers /> Candidatos
                          </Btn>
                        )}

                        {/* Avançar status — CLIENTE em serviços ativos */}
                        {!ehProfissional && ["CONTRATADO","ANDAMENTO"].includes(servico.status) && (
                          <Btn size="sm" onClick={() => handleAvancar(servico)}>
                            <IconArrowRight /> Avançar status
                          </Btn>
                        )}

                        {/* Cancelar — apenas em PUBLICADO */}
                        {servico.status === "PUBLICADO" && (
                          <Btn
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancelar(servico)}
                          >
                            <IconX /> Cancelar
                          </Btn>
                        )}

                        {/* Avaliar — CLIENTE em FINALIZADO, ainda não avaliado */}
                        {!ehProfissional && servico.status === "FINALIZADO" && !jaAvaliou && (
                          <Btn size="sm" onClick={() => setServicoAvaliando(servico)}>
                            <IconStar /> Avaliar
                          </Btn>
                        )}

                        {!ehProfissional && servico.status === "FINALIZADO" && jaAvaliou && (
                          <span
                            className="wm-text-muted"
                            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13 }}
                          >
                            <IconStar /> Avaliado
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </>
        )}

        {/* Modal de avaliação */}
        {servicoAvaliando && (
          <AvaliacaoModal
            servico={servicoAvaliando}
            clienteId={user.id}
            onClose={() => setServicoAvaliando(null)}
            onSucesso={handleAvaliacaoSucesso}
          />
        )}
      </div>
    </PageLayout>
  );
}