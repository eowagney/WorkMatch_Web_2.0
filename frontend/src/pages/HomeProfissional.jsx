

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import PageLayout from "../components/PageLayout";
import { Card, CardHeader, CardBody, CardTitle, Btn } from "../components/ui";
import { useToast } from "../hooks/useToast";

const ESPECIALIDADES = [
  "Todas", "Eletricista", "Encanador", "Pintor", "Pedreiro",
  "Marceneiro", "Jardineiro", "Diarista", "Técnico de TI", "Outro",
];

function IconMapPin() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function IconBriefcase() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function IconMessageCircle() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
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

function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

const STATUS_LABEL = {
  PUBLICADO:  "Publicado",
  NEGOCIANDO: "Negociando",
  CONTRATADO: "Contratado",
  ANDAMENTO:  "Em andamento",
  FINALIZADO: "Finalizado",
};

const STATUS_CLASS = {
  PUBLICADO:  "wm-badge--blue",
  NEGOCIANDO: "wm-badge--yellow",
  CONTRATADO: "wm-badge--green",
  ANDAMENTO:  "wm-badge--green",
  FINALIZADO: "wm-badge--gray",
};

const PAGE_SIZE = 20;

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
          <div className="wm-skeleton" style={{ height: 18, width: "70%", borderRadius: "var(--r-md)" }} />
          <div className="wm-skeleton" style={{ height: 12, width: "45%", borderRadius: "var(--r-md)" }} />
          <div className="wm-skeleton" style={{ height: 12, width: "90%", borderRadius: "var(--r-md)" }} />
          <div className="wm-skeleton" style={{ height: 12, width: "60%", borderRadius: "var(--r-md)" }} />
          <div className="wm-skeleton" style={{ height: 32, width: 120, borderRadius: "var(--r-md)" }} />
        </div>
      </CardBody>
    </Card>
  );
}

export default function HomeProfissional() {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const { showToast, Toast } = useToast();

  const [servicos,     setServicos]     = useState([]);
  const [paginacao,    setPaginacao]    = useState({ page: 0, totalPages: 1, last: true });
  const [candidatados, setCandidatados] = useState(new Set());
  const [carregando,   setCarregando]   = useState(true);
  const [enviando,     setEnviando]     = useState(null);
  const [filtroEsp,    setFiltroEsp]    = useState("Todas");
  const [filtroCidade, setFiltroCidade] = useState("");
  const [pagina,       setPagina]       = useState(0);

  const carregarServicos = useCallback(async (pg = 0, resetar = false) => {
    if (!user?.id) return;
    setCarregando(true);

    const params = { page: pg, size: PAGE_SIZE };
    if (filtroEsp !== "Todas") params.especialidade = filtroEsp;
    if (filtroCidade.trim())   params.cidade        = filtroCidade.trim();

    try {
      const [resServicos, resCands] = await Promise.all([
        api.get("/api/servicos/publicados", { params }),
        api.get(`/api/candidaturas/profissional/${user.id}`).catch(() => ({ data: [] })),
      ]);

      const { content, page, totalPages, last } = resServicos.data;
      setServicos(prev => resetar ? (content ?? []) : [...prev, ...(content ?? [])]);
      setPaginacao({ page, totalPages, last });
      setCandidatados(new Set((resCands.data ?? []).map(c => c.servicoId)));
    } catch {
      showToast("Erro ao carregar serviços.", "erro");
    } finally {
      setCarregando(false);
    }
  }, [user?.id, filtroEsp, filtroCidade]);

  // Recarrega do zero ao mudar filtros
  useEffect(() => {
    setPagina(0);
    carregarServicos(0, true);
  }, [filtroEsp, filtroCidade]);

  async function handleCandidatar(servico) {
    if (enviando || candidatados.has(servico.id)) return;
    setEnviando(servico.id);
    try {
      await api.post("/api/candidaturas", {
        servicoId:      servico.id,
        profissionalId: user.id,
      });
      setCandidatados(prev => new Set([...prev, servico.id]));
      showToast("Candidatura enviada!", "sucesso");
    } catch (err) {
      showToast(err.response?.data?.message ?? "Erro ao enviar candidatura.", "erro");
    } finally {
      setEnviando(null);
    }
  }
 
  function handleCarregarMais() {
    const proxima = pagina + 1;
    setPagina(proxima);
    carregarServicos(proxima, false);
  }

  return (
    <PageLayout title="Serviços disponíveis" subtitle="Encontre oportunidades na sua área">
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

        {/* Filtros — agora agrupados num Card temático */}
        <Card style={{ marginBottom: "var(--sp-6)" }}>
          <CardHeader>
            <CardTitle>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--sp-2)" }}>
                <IconFilter /> Filtros
              </span>
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div className="wm-filters">
              <div className="wm-filters__chips">
                {ESPECIALIDADES.map(esp => (
                  <button
                    key={esp}
                    className={`wm-chip${filtroEsp === esp ? " wm-chip--active" : ""}`}
                    onClick={() => setFiltroEsp(esp)}
                  >
                    {esp}
                  </button>
                ))}
              </div>
              <input
                className="wm-input wm-filters__city"
                placeholder="Filtrar por cidade..."
                value={filtroCidade}
                onChange={e => setFiltroCidade(e.target.value)}
              />
            </div>
          </CardBody>
        </Card>

        {/* Lista */}
        {carregando && pagina === 0 ? (
          <div
            role="status"
            aria-live="polite"
            className="wm-card-grid"
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "var(--sp-4)" }}
          >
            <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden" }}>
              Carregando serviços...
            </span>
            {Array.from({ length: 6 }).map((_, i) => (
              <ServicoSkeletonCard key={i} />
            ))}
          </div>
        ) : servicos.length === 0 ? (
          <div className="wm-empty-state">Nenhum serviço encontrado com esses filtros.</div>
        ) : (
          <>
            <div className="wm-card-grid">
              {servicos.map(servico => {
                const jaCandidatou  = candidatados.has(servico.id);
                const emEnvio       = enviando === servico.id;
                const podeCandidatar = servico.status === "PUBLICADO" && !jaCandidatou;
                const podeChat       = ["NEGOCIANDO","CONTRATADO","ANDAMENTO"].includes(servico.status)
                                       && servico.profissionalId === user.id;

                return (
                  <Card key={servico.id}>
                    <div className="wm-service-card">
                      <div className="wm-service-card__header">
                        <h3 className="wm-service-card__title">{servico.titulo}</h3>
                        <span className={`wm-badge ${STATUS_CLASS[servico.status] ?? "wm-badge--gray"}`}>
                          {STATUS_LABEL[servico.status] ?? servico.status}
                        </span>
                      </div>

                      <div className="wm-service-card__meta">
                        <span className="wm-service-card__meta-item">
                          <IconBriefcase /> {servico.especialidade}
                        </span>
                        {servico.cidade && (
                          <span className="wm-service-card__meta-item">
                            <IconMapPin /> {servico.cidade}{servico.estado ? ` — ${servico.estado}` : ""}
                          </span>
                        )}
                      </div>

                      {servico.descricao && (
                        <p className="wm-service-card__desc">
                          {servico.descricao.length > 140
                            ? servico.descricao.slice(0, 140) + "..."
                            : servico.descricao}
                        </p>
                      )}

                      <div className="wm-service-card__actions">
                        {podeCandidatar && (
                          <Btn size="sm" onClick={() => handleCandidatar(servico)} disabled={emEnvio}>
                            {emEnvio ? "Enviando..." : "Candidatar-se"}
                          </Btn>
                        )}
                        {jaCandidatou && servico.status === "PUBLICADO" && (
                          <span
                            className="wm-text-muted"
                            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14 }}
                          >
                            <IconCheck /> Candidatura enviada
                          </span>
                        )}
                        {podeChat && (
                          <Btn
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/chat/${servico.id}/${user.id}`)}
                          >
                            <IconMessageCircle /> Chat
                          </Btn>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Carregar mais */}
            {!paginacao.last && (
              <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
                <Btn variant="outline" onClick={handleCarregarMais} disabled={carregando}>
                  {carregando ? "Carregando..." : "Carregar mais"}
                </Btn>
              </div>
            )}

            {paginacao.last && servicos.length > 0 && (
              <p className="wm-text-muted" style={{ textAlign: "center", marginTop: 16, fontSize: 13 }}>
                {servicos.length} serviço{servicos.length !== 1 ? "s" : ""} no total
              </p>
            )}
          </>
        )}
      </div>
    </PageLayout>
  );
}