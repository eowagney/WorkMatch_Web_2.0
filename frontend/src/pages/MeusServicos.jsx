import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import PageLayout from "../components/PageLayout";
import { Card, Btn } from "../components/ui";
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

  return (
    <PageLayout title="Meus Serviços">

      {/* Abas */}
      <div className="wm-tabs" role="tablist">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            role="tab"
            aria-selected={abaAtiva === i}
            className={`wm-tab${abaAtiva === i ? " wm-tab--active" : ""}`}
            onClick={() => setAbaAtiva(i)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {carregando ? (
        <div className="wm-empty-state">Carregando...</div>
      ) : servicosFiltrados.length === 0 ? (
        <div className="wm-empty-state">Nenhum serviço nesta categoria.</div>
      ) : (
        <div className="wm-card-grid">
          {servicosFiltrados.map(servico => {
            const jaAvaliou = avaliados.has(servico.id);

            return (
              <Card key={servico.id}>
                <div className="wm-service-card">
                  <div className="wm-service-card__header">
                    <h3 className="wm-service-card__title">{servico.titulo}</h3>
                    <span className={`wm-badge ${STATUS_CLASS[servico.status] ?? "wm-badge--gray"}`}>
                      {STATUS_LABEL[servico.status] ?? servico.status}
                    </span>
                  </div>

                  <p className="wm-service-card__specialty">{servico.especialidade}</p>

                  {servico.cidade && (
                    <p className="wm-text-muted" style={{ fontSize: 13, marginBottom: 8 }}>
                      {servico.cidade}{servico.estado ? ` — ${servico.estado}` : ""}
                    </p>
                  )}

                  {servico.profissionalNome && (
                    <p className="wm-text-muted" style={{ fontSize: 13, marginBottom: 12 }}>
                      Profissional: {servico.profissionalNome}
                    </p>
                  )}

                  <div className="wm-service-card__actions">
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
                        Avançar status
                      </Btn>
                    )}

                    {/* Cancelar — apenas em PUBLICADO */}
                    {servico.status === "PUBLICADO" && (
                      <Btn
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancelar(servico)}
                      >
                        Cancelar
                      </Btn>
                    )}

                    {/* Avaliar — CLIENTE em FINALIZADO, ainda não avaliado */}
                    {!ehProfissional && servico.status === "FINALIZADO" && !jaAvaliou && (
                      <Btn size="sm" onClick={() => setServicoAvaliando(servico)}>
                        <IconStar /> Avaliar
                      </Btn>
                    )}

                    {!ehProfissional && servico.status === "FINALIZADO" && jaAvaliou && (
                      <span className="wm-text-muted" style={{ fontSize: 13 }}>
                        ★ Avaliado
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
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
    </PageLayout>
  );
}
