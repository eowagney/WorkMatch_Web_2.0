import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import PageLayout from "../components/PageLayout";
import { Card, Btn } from "../components/ui";
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

      {/* Filtros */}
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

      {/* Lista */}
      {carregando && pagina === 0 ? (
        <div className="wm-empty-state">Carregando serviços...</div>
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
                        <span className="wm-text-muted" style={{ fontSize: 14 }}>
                          ✓ Candidatura enviada
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
    </PageLayout>
  );
}
