import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardBody, CardHeader, CardTitle, Btn, Spinner, Stars, EmptyState } from "../components/ui";
import PageLayout from "../components/PageLayout";
import api from "../services/api";

/* =========================================================
   ÍCONES SVG
========================================================= */

const IcoBriefcase = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </svg>
);

const IcoMapPin = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const IcoStar = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"
    fill="currentColor" stroke="currentColor" strokeWidth="1.5"
    strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const IcoClock = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const IcoUser = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const IcoMessageSquare = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const IcoCheckCircle = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

/* =========================================================
   SKELETON
========================================================= */

function PerfilSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-5)" }}>
      <Card>
        <CardBody>
          <div style={{ display: "flex", gap: "var(--sp-6)", flexWrap: "wrap", alignItems: "center" }}>
            <div className="wm-skeleton" style={{ width: 88, height: 88, borderRadius: "var(--r-full)", flexShrink: 0 }} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
              <div className="wm-skeleton" style={{ height: 24, width: "50%", borderRadius: "var(--r-md)" }} />
              <div className="wm-skeleton" style={{ height: 14, width: "30%", borderRadius: "var(--r-md)" }} />
              <div className="wm-skeleton" style={{ height: 14, width: "40%", borderRadius: "var(--r-md)" }} />
            </div>
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
            <div className="wm-skeleton" style={{ height: 14, width: "100%", borderRadius: "var(--r-md)" }} />
            <div className="wm-skeleton" style={{ height: 14, width: "90%", borderRadius: "var(--r-md)" }} />
            <div className="wm-skeleton" style={{ height: 14, width: "70%", borderRadius: "var(--r-md)" }} />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

/* =========================================================
   LABEL DE AVALIAÇÃO
========================================================= */

function labelAvaliacao(nota) {
  if (nota >= 4.5) return "Excelente";
  if (nota >= 4.0) return "Muito bom";
  if (nota >= 3.0) return "Bom";
  if (nota >= 2.0) return "Regular";
  return "Iniciante";
}

/* =========================================================
   COMPONENTE PRINCIPAL
========================================================= */

export default function PerfilPublicoProfissional() {
  const { profissionalId } = useParams();
  const navigate           = useNavigate();

  const [profissional, setProfissional] = useState(null);
  const [avaliacoes,   setAvaliacoes]   = useState([]);
  const [carregando,   setCarregando]   = useState(true);
  const [erro,         setErro]         = useState(false);

  useEffect(() => {
    if (!profissionalId) return;
    carregarPerfil();
  }, [profissionalId]);

  async function carregarPerfil() {
    setCarregando(true);
    try {
      const [{ data: prof }, { data: avs }] = await Promise.all([
        api.get(`/api/profissionais/${profissionalId}`),
        api.get(`/api/avaliacoes/profissional/${profissionalId}`).catch(() => ({ data: [] })),
      ]);
      setProfissional(prof);
      setAvaliacoes(avs ?? []);
    } catch {
      setErro(true);
    } finally {
      setCarregando(false);
    }
  }

  if (carregando) {
    return (
      <PageLayout title="Perfil do profissional" backPath={-1}>
        <style>{`.wm-skeleton{background:var(--clr-border);animation:wm-pulse 1.4s ease-in-out infinite}@keyframes wm-pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
        <PerfilSkeleton />
      </PageLayout>
    );
  }

  if (erro || !profissional) {
    return (
      <PageLayout title="Perfil do profissional" backPath={-1}>
        <EmptyState title="Profissional não encontrado" description="Este perfil não existe ou foi removido." />
      </PageLayout>
    );
  }

  const nota        = Number(profissional.avaliacaoMedia ?? 0);
  const totalAvs    = profissional.totalAvaliacoes ?? 0;
  const iniciaisNome = profissional.nome?.split(" ").slice(0, 2).map(p => p[0]).join("").toUpperCase() || "?";

  return (
    <PageLayout title="Perfil do profissional" backPath={-1}>
      <style>{`.wm-skeleton{background:var(--clr-border);animation:wm-pulse 1.4s ease-in-out infinite}@keyframes wm-pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-5)" }}>

        {/* ── Card de identidade ── */}
        <Card>
          <CardBody>
            <div style={{ display: "flex", gap: "var(--sp-6)", flexWrap: "wrap", alignItems: "flex-start" }}>

              {/* Avatar com iniciais */}
              <div style={{
                width:          88,
                height:         88,
                borderRadius:   "var(--r-full)",
                background:     "linear-gradient(135deg, var(--clr-navy) 0%, var(--clr-blue) 100%)",
                color:          "#fff",
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                fontSize:       28,
                fontWeight:     700,
                flexShrink:     0,
                fontFamily:     "var(--font-display)",
                boxShadow:      "var(--shadow-md)",
              }}>
                {iniciaisNome}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(20px, 3vw, 26px)", color: "var(--clr-navy)", margin: "0 0 var(--sp-2)" }}>
                  {profissional.nome}
                </h2>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--sp-3)", marginBottom: "var(--sp-3)" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 600, color: "var(--clr-blue)" }}>
                    <IcoBriefcase size={14} /> {profissional.especialidade}
                  </span>
                  {profissional.cidade && (
                    <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "var(--clr-text-mid)" }}>
                      <IcoMapPin size={14} /> {profissional.cidade}{profissional.estado ? ` — ${profissional.estado}` : ""}
                    </span>
                  )}
                  {profissional.experienciaAnos != null && (
                    <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "var(--clr-text-mid)" }}>
                      <IcoClock size={14} /> {profissional.experienciaAnos} {profissional.experienciaAnos === 1 ? "ano" : "anos"} de experiência
                    </span>
                  )}
                </div>

                {/* Avaliação média */}
                {nota > 0 ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)", flexWrap: "wrap" }}>
                    <Stars rating={nota} />
                    <span style={{ fontSize: 13, color: "var(--clr-text-mid)" }}>
                      {totalAvs} avaliação{totalAvs !== 1 ? "ões" : ""}
                    </span>
                    <span style={{
                      background:   "var(--clr-success-bg)",
                      color:        "var(--clr-success)",
                      borderRadius: "var(--r-full)",
                      fontSize:     12,
                      fontWeight:   700,
                      padding:      "2px 10px",
                    }}>
                      {labelAvaliacao(nota)}
                    </span>
                  </div>
                ) : (
                  <span style={{ fontSize: 13, color: "var(--clr-text-light)" }}>Sem avaliações ainda</span>
                )}
              </div>
            </div>

            {/* Status ativo */}
            {profissional.ativo && (
              <div style={{
                marginTop:    "var(--sp-4)",
                paddingTop:   "var(--sp-4)",
                borderTop:    "1px solid var(--clr-border)",
                display:      "flex",
                alignItems:   "center",
                gap:          6,
                fontSize:     13,
                color:        "var(--clr-success)",
                fontWeight:   600,
              }}>
                <IcoCheckCircle size={14} /> Disponível para novos serviços
              </div>
            )}
          </CardBody>
        </Card>

        {/* ── Sobre o profissional ── */}
        {profissional.descricao && (
          <Card>
            <CardHeader><CardTitle>Sobre</CardTitle></CardHeader>
            <CardBody>
              <p style={{ fontSize: 14, color: "var(--clr-text-mid)", lineHeight: 1.8, margin: 0 }}>
                {profissional.descricao}
              </p>
            </CardBody>
          </Card>
        )}

        {/* ── Estatísticas ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "var(--sp-4)" }}>
          {[
            { label: "Avaliação",    valor: nota > 0 ? nota.toFixed(1) : "—", icon: <IcoStar size={20} />,        color: "var(--clr-yellow)"  },
            { label: "Avaliações",   valor: totalAvs,                          icon: <IcoMessageSquare size={20} />, color: "var(--clr-blue)"    },
            { label: "Experiência",  valor: profissional.experienciaAnos != null ? `${profissional.experienciaAnos}a` : "—", icon: <IcoClock size={20} />, color: "var(--clr-teal)" },
          ].map(({ label, valor, icon, color }) => (
            <div key={label} style={{
              background:   "var(--clr-surface)",
              border:       "1px solid var(--clr-border)",
              borderTop:    `3px solid ${color}`,
              borderRadius: "var(--r-lg)",
              padding:      "var(--sp-5)",
              textAlign:    "center",
            }}>
              <div style={{ color, display: "flex", justifyContent: "center", marginBottom: "var(--sp-2)" }}>{icon}</div>
              <p style={{ fontSize: 22, fontWeight: 800, color: "var(--clr-navy)", margin: "0 0 var(--sp-1)", fontFamily: "var(--font-body)" }}>{valor}</p>
              <p style={{ fontSize: 12, color: "var(--clr-text-light)", margin: 0, fontWeight: 600 }}>{label}</p>
            </div>
          ))}
        </div>

        {/* ── Avaliações recebidas ── */}
        {avaliacoes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Avaliações ({avaliacoes.length})</CardTitle>
            </CardHeader>
            <CardBody style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
              {avaliacoes.slice(0, 5).map((av) => (
                <div key={av.id} style={{
                  paddingBottom: "var(--sp-4)",
                  borderBottom:  "1px solid var(--clr-border)",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--sp-2)", flexWrap: "wrap", gap: "var(--sp-2)" }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--clr-navy)" }}>
                      {av.clienteNome ?? "Cliente"}
                    </span>
                    <Stars rating={av.nota} />
                  </div>
                  {av.comentario && (
                    <p style={{ fontSize: 13, color: "var(--clr-text-mid)", lineHeight: 1.6, margin: 0 }}>
                      "{av.comentario}"
                    </p>
                  )}
                </div>
              ))}
              {avaliacoes.length > 5 && (
                <p style={{ fontSize: 13, color: "var(--clr-text-light)", textAlign: "center", margin: 0 }}>
                  + {avaliacoes.length - 5} avaliação{avaliacoes.length - 5 !== 1 ? "ões" : ""}
                </p>
              )}
            </CardBody>
          </Card>
        )}

        {/* ── Botão voltar ── */}
        <div>
          <Btn variant="secondary" onClick={() => navigate(-1)}>← Voltar</Btn>
        </div>

      </div>
    </PageLayout>
  );
}
