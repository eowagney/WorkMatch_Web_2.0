import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Btn, Card, CardBody, Badge, Spinner, EmptyState, Stars } from "../components/ui.jsx";
import { useToast } from "../hooks/useToast.js";
import api from "../services/api.js";

/* =========================================================
   ÍCONES SVG
========================================================= */

const IconUsers = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const IconMapPin = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const IconMessage = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const IconCheck = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5"/>
  </svg>
);

const IconBriefcase = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </svg>
);

const IconFileText = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" x2="8" y1="13" y2="13"/>
    <line x1="16" x2="8" y1="17" y2="17"/>
    <line x1="10" x2="8" y1="9" y2="9"/>
  </svg>
);

const IconChevronDown = ({ rotated }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ transition: "transform 0.2s ease", transform: rotated ? "rotate(180deg)" : "none" }}>
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

/* =========================================================
   SKELETON
========================================================= */

function CandidatoSkeleton() {
  return (
    <Card style={{ borderRadius: "14px" }}>
      <CardBody style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div className="wm-skeleton" style={{ height: 18, width: "50%", borderRadius: 6 }} />
          <div className="wm-skeleton" style={{ height: 18, width: 70, borderRadius: 99 }} />
        </div>
        <div className="wm-skeleton" style={{ height: 12, width: "35%", borderRadius: 6 }} />
        <div className="wm-skeleton" style={{ height: 12, width: "45%", borderRadius: 6 }} />
        <div style={{ display: "flex", gap: 8, paddingTop: 8, borderTop: "1px solid var(--clr-border)" }}>
          <div className="wm-skeleton" style={{ height: 32, width: 100, borderRadius: 8 }} />
          <div className="wm-skeleton" style={{ height: 32, width: 150, borderRadius: 8 }} />
        </div>
      </CardBody>
    </Card>
  );
}

/* =========================================================
   CARD DE DETALHES DO SERVIÇO (colapsável)
========================================================= */

function ServicoDetalheCard({ servico }) {
  const [aberto, setAberto] = useState(false);
  if (!servico) return null;

  return (
    <Card style={{
      marginBottom: "var(--sp-5)",
      border: "1.5px solid var(--clr-blue)",
      borderRadius: "var(--r-lg)",
    }}>
      <CardBody style={{ padding: "var(--sp-4) var(--sp-5)" }}>
        <button
          onClick={() => setAberto(v => !v)}
          style={{
            width: "100%", background: "none", border: "none",
            cursor: "pointer", display: "flex", justifyContent: "space-between",
            alignItems: "center", padding: 0, fontFamily: "inherit",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", fontWeight: 700, color: "var(--clr-blue)", fontSize: 14 }}>
            <IconFileText /> {servico.titulo}
          </span>
          <span style={{ color: "var(--clr-blue)" }}>
            <IconChevronDown rotated={aberto} />
          </span>
        </button>

        {aberto && (
          <div style={{ marginTop: "var(--sp-4)", display: "flex", flexDirection: "column", gap: "var(--sp-2)", fontSize: 13 }}>
            <p><strong>Especialidade:</strong> {servico.especialidade}</p>
            {servico.descricao && <p><strong>Descrição:</strong> {servico.descricao}</p>}
            {servico.cidade && <p><strong>Local:</strong> {servico.cidade}{servico.estado ? ` — ${servico.estado}` : ""}</p>}
            <span style={{
              display: "inline-flex", alignSelf: "flex-start",
              background: "var(--clr-blue)", color: "#fff",
              padding: "2px 10px", borderRadius: "var(--r-full)",
              fontSize: 11, fontWeight: 600, marginTop: "var(--sp-1)",
            }}>
              {servico.status}
            </span>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

/* =========================================================
   COMPONENTE PRINCIPAL
========================================================= */

export default function CandidatosServico() {
  const { servicoId } = useParams();
  const { user }      = useAuth();
  const navigate      = useNavigate();
  const { showToast } = useToast();

  const [servico,     setServico]     = useState(null);
  const [candidatos,  setCandidatos]  = useState([]);
  const [carregando,  setCarregando]  = useState(true);
  const [contratando, setContratando] = useState(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const [{ data: sData }, { data: cData }] = await Promise.all([
        api.get(`/api/servicos/${servicoId}`),
        api.get(`/api/candidaturas/servico/${servicoId}`),
      ]);
      setServico(sData);
      setCandidatos(cData);
    } catch {
      showToast("Erro ao carregar candidatos.", "danger");
    } finally {
      setCarregando(false);
    }
  }, [servicoId]);

  useEffect(() => { carregar(); }, [carregar]);

  const contratar = async (profissionalId) => {
    setContratando(profissionalId);
    try {
      await api.patch(`/api/servicos/${servicoId}/avancar?profissionalId=${profissionalId}`);
      showToast("Profissional selecionado! Negociação iniciada.", "success");
      navigate(`/chat/${servicoId}/${profissionalId}`);
    } catch (e) {
      showToast(e?.response?.data?.message || "Erro ao selecionar profissional.", "danger");
    } finally {
      setContratando(null);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--clr-bg)" }}>
      <style>{`
        .wm-skeleton { background: var(--clr-border); animation: wm-pulse 1.4s ease-in-out infinite; }
        @keyframes wm-pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
      `}</style>

      <header style={{
        background: "linear-gradient(135deg, #0A2F5A 0%, #1E5FAF 100%)",
        padding: "20px 24px", boxShadow: "0 2px 12px rgba(10,47,90,0.18)",
      }}>
        <h1 style={{ margin: 0, color: "#fff", fontSize: "1.1rem", fontWeight: 600, fontFamily: "var(--font-display)" }}>
          Candidatos
        </h1>
        <p style={{ margin: "2px 0 0", color: "rgba(255,255,255,0.7)", fontSize: "0.82rem" }}>
          Selecione o profissional para iniciar a negociação
        </p>
      </header>

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "24px 16px" }}>

        {carregando ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {Array.from({ length: 3 }).map((_, i) => <CandidatoSkeleton key={i} />)}
          </div>
        ) : (
          <>
            {/* Card do serviço colapsável */}
            <ServicoDetalheCard servico={servico} />

            {candidatos.length === 0 ? (
              <EmptyState
                icon={<IconUsers />}
                title="Nenhum candidato ainda"
                description="Aguarde profissionais se candidatarem ao seu serviço."
              />
            ) : (
              <>
                <p style={{ fontSize: 13, color: "var(--clr-text-light)", marginBottom: 16, fontWeight: 500 }}>
                  {candidatos.length} candidato{candidatos.length !== 1 ? "s" : ""} encontrado{candidatos.length !== 1 ? "s" : ""}
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {candidatos.map(c => (
                    <Card key={c.id} style={{ borderRadius: "14px" }}>
                      <CardBody style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                          <div>
                            <span style={{ fontWeight: 700, fontSize: "1rem", color: "var(--clr-navy)" }}>
                              {c.nome}
                            </span>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
                              <Badge variant="blue"><IconBriefcase /> {c.especialidade}</Badge>
                              {c.cidade && (
                                <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: "0.8rem", color: "var(--clr-text-mid)" }}>
                                  <IconMapPin /> {c.cidade}{c.estado ? ` — ${c.estado}` : ""}
                                </span>
                              )}
                            </div>
                          </div>

                          {c.avaliacaoMedia != null && Number(c.avaliacaoMedia) > 0 && (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0 }}>
                              <Stars rating={c.avaliacaoMedia} />
                              {c.totalAvaliacoes != null && (
                                <span style={{ fontSize: 11, color: "var(--clr-text-light)", marginTop: 2 }}>
                                  {c.totalAvaliacoes} avaliação{c.totalAvaliacoes !== 1 ? "ões" : ""}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", paddingTop: "8px", borderTop: "1px solid var(--clr-border)" }}>
                          <Btn variant="outline" size="sm" onClick={() => navigate(`/profissional/${c.profissionalId}`)}>
                            Ver perfil
                          </Btn>
                          <Btn variant="secondary" size="sm" onClick={() => navigate(`/chat/${servicoId}/${c.profissionalId}`)}>
                            <IconMessage /> &nbsp;Conversar
                          </Btn>
                          <Btn
                            variant="primary" size="sm"
                            onClick={() => contratar(c.profissionalId)}
                            disabled={contratando === c.profissionalId}
                          >
                            {contratando === c.profissionalId
                              ? <Spinner size="sm" center={false} />
                              : <><IconCheck /> &nbsp;Selecionar</>
                            }
                          </Btn>
                        </div>

                      </CardBody>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        <div style={{ marginTop: "24px" }}>
          <Btn variant="secondary" size="sm" onClick={() => navigate(-1)}>← Voltar</Btn>
        </div>
      </div>
    </div>
  );
}