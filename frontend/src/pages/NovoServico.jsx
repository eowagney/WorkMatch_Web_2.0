/**
 * WorkMatch — pages/NovoServico.jsx
 * CEL Design System v3.0
 *
 * Melhorias desta versão:
 *  - Chips de respostas rápidas contextuais por etapa
 *  - Barra de progresso visual (4 etapas)
 *  - Mensagem inicial mais direta
 *  - Layout mais compacto e moderno
 *  - Chips desaparecem após uso
 */

import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth }     from "../context/AuthContext";
import PageLayout      from "../components/PageLayout";
import { Btn, Card, CardBody } from "../components/ui";
import { enviarMensagemIA, extrairDadosColetados } from "../services/aiService";
import api from "../services/api";

/* =========================================================
   ÍCONES SVG
========================================================= */

const IcoSend = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
  </svg>
);

const IcoCheckCircle = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const IcoClipboard = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <path d="M12 11h4M12 16h4M8 11h.01M8 16h.01"/>
  </svg>
);

/* =========================================================
   CHIPS POR ETAPA
   A IA detecta em qual etapa está pela última pergunta feita.
   Mapeamos chips para cada contexto.
========================================================= */

const CHIPS_ESPECIALIDADE = [
  "Eletricista", "Encanador", "Pintor", "Pedreiro",
  "Diarista", "Jardineiro", "Técnico em TI", "Marceneiro",
  "Serralheiro", "Chaveiro",
];

const CHIPS_DESCRICAO = [
  "Instalação elétrica completa",
  "Conserto de vazamento",
  "Pintura de apartamento",
  "Reforma de banheiro",
  "Limpeza geral da casa",
  "Manutenção de jardim",
  "Instalação de ar-condicionado",
  "Montagem de móveis",
];

const CHIPS_CIDADE_ESTADO = [
  "São Paulo / SP",
  "Rio de Janeiro / RJ",
  "Belo Horizonte / MG",
  "Curitiba / PR",
  "Salvador / BA",
  "Fortaleza / CE",
  "Brasília / DF",
  "Recife / PE",
];

/* Detecta qual conjunto de chips mostrar baseado no histórico */
function detectarEtapa(mensagens) {
  if (mensagens.length <= 1) return "especialidade";

  const ultimaIA = [...mensagens]
    .reverse()
    .find((m) => m.autor === "ia")?.texto?.toLowerCase() || "";

  if (
    ultimaIA.includes("descrição") ||
    ultimaIA.includes("descricao") ||
    ultimaIA.includes("precisa ser feito") ||
    ultimaIA.includes("o que")
  ) return "descricao";

  if (
    ultimaIA.includes("cidade") ||
    ultimaIA.includes("estado") ||
    ultimaIA.includes("localidade") ||
    ultimaIA.includes("onde")
  ) return "cidade";

  if (mensagens.filter((m) => m.autor === "usuario").length === 0)
    return "especialidade";

  return null;
}

function getChips(etapa) {
  if (etapa === "especialidade") return CHIPS_ESPECIALIDADE;
  if (etapa === "descricao")    return CHIPS_DESCRICAO;
  if (etapa === "cidade")       return CHIPS_CIDADE_ESTADO;
  return [];
}

/* =========================================================
   BARRA DE PROGRESSO
========================================================= */

const ETAPAS = ["Especialidade", "Descrição", "Localização", "Confirmação"];

function ProgressBar({ etapaAtual }) {
  const idx = etapaAtual === "especialidade" ? 0
    : etapaAtual === "descricao" ? 1
    : etapaAtual === "cidade"    ? 2
    : 3;

  return (
    <div style={{ marginBottom: "var(--sp-5)" }}>
      <div style={{
        display:       "flex",
        justifyContent:"space-between",
        marginBottom:  "var(--sp-2)",
      }}>
        {ETAPAS.map((label, i) => (
          <span key={label} style={{
            fontSize:   11,
            fontWeight: i <= idx ? 600 : 400,
            color:      i <= idx ? "var(--clr-blue)" : "var(--clr-text-light)",
            flex:       1,
            textAlign:  "center",
          }}>
            {label}
          </span>
        ))}
      </div>
      <div style={{
        height:       4,
        background:   "var(--clr-border)",
        borderRadius: "var(--r-full)",
        overflow:     "hidden",
      }}>
        <div style={{
          height:       "100%",
          width:        `${((idx + 1) / ETAPAS.length) * 100}%`,
          background:   "var(--clr-blue)",
          borderRadius: "var(--r-full)",
          transition:   "width 0.4s ease",
        }} />
      </div>
    </div>
  );
}

/* =========================================================
   MENSAGEM INICIAL
========================================================= */

const MENSAGEM_INICIAL = {
  id:    1,
  autor: "ia",
  texto: "Olá! Para publicar seu serviço, preciso de 3 informações rápidas. Qual tipo de profissional você precisa?",
};

/* =========================================================
   COMPONENTE PRINCIPAL
========================================================= */

export default function NovoServico() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [mensagens,      setMensagens]      = useState([MENSAGEM_INICIAL]);
  const [input,          setInput]          = useState("");
  const [loading,        setLoading]        = useState(false);
  const [dadosColetados, setDadosColetados] = useState(null);
  const [publicando,     setPublicando]     = useState(false);

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens, loading]);

  const etapa = dadosColetados ? "confirmacao" : detectarEtapa(mensagens);
  const chips = dadosColetados ? [] : getChips(etapa);

  /* ── Envio de mensagem ── */

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleEnviar();
    }
  }

  async function handleEnviar(textoOverride) {
    const texto = (textoOverride ?? input).trim();
    if (!texto || loading) return;

    setInput("");

    const novaMensagemUsuario = { id: Date.now(), autor: "usuario", texto };
    const novasMensagens      = [...mensagens, novaMensagemUsuario];
    setMensagens(novasMensagens);
    setLoading(true);

    try {
      const historico = novasMensagens.map((m) => ({
        role:    m.autor === "usuario" ? "user" : "assistant",
        content: m.texto,
      }));

      const respostaIA = await enviarMensagemIA(historico);
      const dados      = extrairDadosColetados(respostaIA);

      if (dados) {
        setDadosColetados(dados);
        setMensagens((prev) => [
          ...prev,
          {
            id:    Date.now() + 1,
            autor: "ia",
            texto: "Coletei tudo! Veja o resumo abaixo e confirme para publicar.",
          },
        ]);
      } else {
        setMensagens((prev) => [
          ...prev,
          { id: Date.now() + 1, autor: "ia", texto: respostaIA },
        ]);
      }
    } catch {
      setMensagens((prev) => [
        ...prev,
        {
          id:    Date.now() + 1,
          autor: "ia",
          texto: "Erro ao processar. Tente novamente.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  /* Chip clicado — envia como mensagem direto */
  function handleChip(texto) {
    // chips de cidade/estado precisam separar cidade e estado
    if (etapa === "cidade" && texto.includes(" / ")) {
      const [cidade, estado] = texto.split(" / ");
      handleEnviar(`${cidade}, ${estado}`);
    } else {
      handleEnviar(texto);
    }
  }

  /* ── Publicar serviço ── */

  async function handlePublicar() {
    if (!dadosColetados) return;
    setPublicando(true);
    try {
      await api.post("/api/servicos", { ...dadosColetados, clienteId: user.id });
      setMensagens((prev) => [
        ...prev,
        {
          id:    Date.now(),
          autor: "ia",
          texto: "Serviço publicado com sucesso! Profissionais já podem se candidatar.",
        },
      ]);
      setTimeout(() => navigate("/meus-servicos"), 2000);
    } catch {
      setMensagens((prev) => [
        ...prev,
        {
          id:    Date.now(),
          autor: "ia",
          texto: "Erro ao publicar o serviço. Tente novamente.",
        },
      ]);
    } finally {
      setPublicando(false);
    }
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <PageLayout
      title="Novo serviço"
      subtitle="Responda 3 perguntas rápidas para publicar"
      backPath="/home"
    >
      <div style={{
        background:   "var(--clr-blue-pale)",
        borderRadius: "var(--r-lg)",
        padding:      "var(--sp-6)",
      }}>

        {/* ── Progresso ── */}
        <ProgressBar etapaAtual={etapa} />

        {/* ── Área de chat ── */}
        <Card style={{ marginBottom: "var(--sp-3)" }}>
          <CardBody style={{ padding: 0 }}>
            <div
              role="log"
              aria-live="polite"
              style={{
                height:        380,
                overflowY:     "auto",
                padding:       "var(--sp-5)",
                display:       "flex",
                flexDirection: "column",
                gap:           "var(--sp-3)",
              }}
            >
              {mensagens.map((msg) => {
                const isUsuario = msg.autor === "usuario";
                return (
                  <div key={msg.id} style={{
                    display:        "flex",
                    justifyContent: isUsuario ? "flex-end" : "flex-start",
                  }}>
                    {/* Avatar IA */}
                    {!isUsuario && (
                      <div style={{
                        width:        28,
                        height:       28,
                        borderRadius: "var(--r-full)",
                        background:   "var(--clr-blue)",
                        color:        "#fff",
                        display:      "flex",
                        alignItems:   "center",
                        justifyContent:"center",
                        fontSize:     11,
                        fontWeight:   700,
                        flexShrink:   0,
                        marginRight:  "var(--sp-2)",
                        alignSelf:    "flex-end",
                      }}>
                        IA
                      </div>
                    )}
                    <div style={{
                      maxWidth:     "75%",
                      padding:      "var(--sp-3) var(--sp-4)",
                      borderRadius: isUsuario
                        ? "var(--r-lg) var(--r-lg) var(--r-sm) var(--r-lg)"
                        : "var(--r-lg) var(--r-lg) var(--r-lg) var(--r-sm)",
                      background:   isUsuario ? "var(--clr-blue)"  : "var(--clr-surface)",
                      color:        isUsuario ? "#fff"              : "var(--clr-text)",
                      border:       isUsuario ? "none"              : "1px solid var(--clr-border)",
                      fontSize:     14,
                      lineHeight:   1.55,
                      boxShadow:    "var(--shadow-xs)",
                    }}>
                      {msg.texto}
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {loading && (
                <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)" }}>
                  <div style={{
                    width:        28, height: 28, borderRadius: "var(--r-full)",
                    background:   "var(--clr-blue)", color: "#fff",
                    display:      "flex", alignItems: "center", justifyContent: "center",
                    fontSize:     11, fontWeight: 700, flexShrink: 0,
                  }}>IA</div>
                  <div style={{
                    background:   "var(--clr-surface)",
                    border:       "1px solid var(--clr-border)",
                    borderRadius: "var(--r-lg)",
                    padding:      "var(--sp-3) var(--sp-4)",
                    display:      "flex",
                    gap:          5,
                    alignItems:   "center",
                  }}>
                    {[0, 1, 2].map((i) => (
                      <div key={i} style={{
                        width: 6, height: 6,
                        borderRadius: "var(--r-full)",
                        background: "var(--clr-blue)",
                        animation: `wmFadeUp 0.8s ease-in-out ${i * 0.2}s infinite alternate`,
                        opacity: 0.5,
                      }} />
                    ))}
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          </CardBody>
        </Card>

        {/* ── Chips de resposta rápida ── */}
        {!dadosColetados && chips.length > 0 && !loading && (
          <div style={{
            background:    "var(--clr-surface)",
            border:        "1px solid var(--clr-border)",
            borderRadius:  "var(--r-lg)",
            padding:       "var(--sp-4) var(--sp-5)",
            marginBottom:  "var(--sp-3)",
          }}>
            <p style={{
              fontSize:     12,
              fontWeight:   600,
              color:        "var(--clr-text-light)",
              marginBottom: "var(--sp-3)",
              textTransform:"uppercase",
              letterSpacing:"0.05em",
            }}>
              Sugestões rápidas
            </p>
            <div style={{
              display:  "flex",
              flexWrap: "wrap",
              gap:      "var(--sp-2)",
            }}>
              {chips.map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleChip(chip)}
                  style={{
                    padding:      "7px 16px",
                    borderRadius: "var(--r-full)",
                    border:       "1.5px solid var(--clr-blue)",
                    background:   "var(--clr-blue-pale)",
                    color:        "var(--clr-blue)",
                    fontSize:     13,
                    fontWeight:   500,
                    cursor:       "pointer",
                    transition:   "all var(--t-fast)",
                    fontFamily:   "var(--font-body)",
                    lineHeight:   1,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--clr-blue)";
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--clr-blue-pale)";
                    e.currentTarget.style.color = "var(--clr-blue)";
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Card de resumo ── */}
        {dadosColetados && (
          <Card style={{
            marginBottom: "var(--sp-4)",
            border:       "1.5px solid var(--clr-blue)",
          }}>
            <CardBody>
              <p style={{
                fontWeight:   700,
                marginBottom: "var(--sp-3)",
                color:        "var(--clr-blue)",
                display:      "flex",
                alignItems:   "center",
                gap:          "var(--sp-2)",
                fontSize:     15,
              }}>
                <IcoClipboard /> Resumo do serviço
              </p>
              <div style={{
                display:       "flex",
                flexDirection: "column",
                gap:           "var(--sp-2)",
                fontSize:      14,
              }}>
                <p><strong>Título:</strong> {dadosColetados.titulo}</p>
                <p><strong>Especialidade:</strong> {dadosColetados.especialidade}</p>
                <p><strong>Descrição:</strong> {dadosColetados.descricao}</p>
                <p><strong>Local:</strong> {dadosColetados.cidade} / {dadosColetados.estado}</p>
              </div>
              <div style={{ display: "flex", gap: "var(--sp-3)", marginTop: "var(--sp-4)" }}>
                <Btn variant="secondary" onClick={() => {
                  setDadosColetados(null);
                  setMensagens([MENSAGEM_INICIAL]);
                }} disabled={publicando}>
                  Recomeçar
                </Btn>
                <Btn variant="primary" onClick={handlePublicar} disabled={publicando}>
                  {publicando ? "Publicando..." : <><IcoCheckCircle /> Confirmar e publicar</>}
                </Btn>
              </div>
            </CardBody>
          </Card>
        )}

        {/* ── Input de mensagem ── */}
        {!dadosColetados && (
          <div style={{ display: "flex", gap: "var(--sp-2)", alignItems: "flex-end" }}>
            <textarea
              className="wm-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ou digite sua resposta... (Enter para enviar)"
              rows={2}
              style={{ flex: 1, resize: "none", lineHeight: 1.5 }}
              disabled={loading}
            />
            <Btn
              variant="primary"
              onClick={() => handleEnviar()}
              disabled={!input.trim() || loading}
              style={{ alignSelf: "flex-end", height: 48, minWidth: 48 }}
            >
              <IcoSend />
            </Btn>
          </div>
        )}

      </div>
    </PageLayout>
  );
}