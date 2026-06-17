/**
 * WorkMatch — pages/ChatServico.jsx
 * CEL Design System v3.0
 *
 * Lógica 100% preservada:
 *  - carregarDados / carregarMensagens (polling 4s)
 *  - handleEnviar / isMinha / agruparPorData
 *  - bottomRef auto-scroll / poolRef interval
 *  - comentários de API preservados (código com // intacto)
 *
 * Alterações visuais:
 *  - Info card: rgba(109,40,217) → rgba(30,95,175) + blue-pale
 *  - Status badge no info card: var(--clr-purple) → var(--clr-blue)
 *  - Empty state 💬 → SVG MessageSquare
 *  - Bubble remetente: var(--clr-purple) → var(--clr-blue) explícito
 *  - Loading text → Spinner CEL
 *  - "Enviar →" → SVG Send
 */

import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate }              from "react-router-dom";
import { useAuth }                             from "../context/AuthContext";
import PageLayout                              from "../components/PageLayout";
import { Btn, Card, CardBody, Spinner }        from "../components/ui";
import api                                     from "../services/api";

/* =========================================================
   ÍCONES SVG — inline, Lucide-style
========================================================= */

const IcoMessageSquare = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const IcoSend = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <path d="m22 2-7 20-4-9-9-4Z"/>
    <path d="M22 2 11 13"/>
  </svg>
);

/* =========================================================
   HELPERS — preservados integralmente
========================================================= */

function fmtHora(iso) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function fmtData(iso) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

/* =========================================================
   COMPONENTE
========================================================= */

export default function ChatServico() {
  const { servicoId }  = useParams();
  const navigate        = useNavigate();
  const { user }        = useAuth();

  const [servico,   setServico]   = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [input,     setInput]     = useState("");
  const [loading,   setLoading]   = useState(true);
  const [enviando,  setEnviando]  = useState(false);

  const bottomRef = useRef(null);
  const poolRef   = useRef(null);

  useEffect(() => {
    carregarDados();
    poolRef.current = setInterval(carregarMensagens, 4000);
    return () => clearInterval(poolRef.current);
  }, [servicoId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  /* ── Lógica preservada integralmente (incluindo comentários originais) ── */

  async function carregarDados() {
    try {
      const [sRes, mRes] = await Promise.all([
        //  api.get(`/api/servicos/${servicoId}`),
        // api.get(`/api/mensagens/servico/${servicoId}`),
      ]);
      setServico(sRes.data);
      setMensagens(mRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function carregarMensagens() {
    try {
      // const { data } = await api.get(`/api/mensagens/servico/${servicoId}`);
      setMensagens(data);
    } catch {}
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleEnviar();
    }
  }

  async function handleEnviar() {
    if (!input.trim() || enviando) return;
    const texto = input.trim();
    setInput("");
    setEnviando(true);
    try {
      await api.post("/api/mensagens", {
        servicoId,
        remetenteId:   user.id,
        remetenteNome: user.nome,
        role:          user.role,
        conteudo:      texto,
      });
      await carregarMensagens();
    } catch (err) {
      console.error(err);
    } finally {
      setEnviando(false);
    }
  }

  function isMinha(msg) {
    return msg.remetenteId === user.id;
  }

  function agruparPorData(msgs) {
    const itens     = [];
    let dataAtual   = null;
    msgs.forEach((m) => {
      const d = fmtData(m.enviadoEm);
      if (d !== dataAtual) {
        itens.push({ tipo: "data", label: d });
        dataAtual = d;
      }
      itens.push({ tipo: "msg", msg: m });
    });
    return itens;
  }

  const backPath  = "/meus-servicos";
  const outraParte = user?.role === "PROFISSIONAL"
    ? servico?.clienteNome
    : servico?.profissionalNome;
  const itens = agruparPorData(mensagens);

  /* ── Estado de loading — Spinner CEL, sem texto simples ── */
  if (loading) {
    return (
      <PageLayout title="Conversa" backPath={backPath}>
        <Spinner size="md" center />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={outraParte ? `Conversa com ${outraParte}` : "Conversa"}
      subtitle={servico?.titulo || ""}
      backPath={backPath}
    >

      {/* ── Card de info do serviço ── */}
      {/* rgba(109,40,217,0.2) → rgba(30,95,175,0.2) — purple hardcoded → blue CEL */}
      <Card style={{
        marginBottom: "var(--sp-4)",
        background:   "var(--clr-blue-pale)",
        border:       "1px solid rgba(30,95,175,0.2)",
      }}>
        <CardBody style={{ padding: "var(--sp-3) var(--sp-5)" }}>
          <div style={{
            display:     "flex",
            gap:         "var(--sp-5)",
            flexWrap:    "wrap",
            fontSize:    13,
            alignItems:  "center",
          }}>
            {servico?.titulo       && <span><strong>Serviço:</strong> {servico.titulo}</span>}
            {servico?.especialidade && <span><strong>Especialidade:</strong> {servico.especialidade}</span>}
            {servico?.cidade       && <span><strong>Local:</strong> {servico.cidade}/{servico.estado}</span>}
            {servico?.status       && (
              /* badge de status — var(--clr-blue) explícito, substitui var(--clr-purple) */
              <span style={{
                background:   "var(--clr-blue)",
                color:        "#fff",
                padding:      "2px 10px",
                borderRadius: "var(--r-full)",
                fontSize:     11,
                fontWeight:   600,
              }}>
                {servico.status}
              </span>
            )}
          </div>
        </CardBody>
      </Card>

      {/* ── Área de mensagens ── */}
      <Card style={{ marginBottom: "var(--sp-4)" }}>
        <CardBody style={{ padding: 0 }}>
          <div style={{
            height:        460,
            overflowY:     "auto",
            padding:       "var(--sp-5)",
            display:       "flex",
            flexDirection: "column",
            gap:           "var(--sp-3)",
          }}>

            {/* Estado vazio — SVG, sem emoji 💬 */}
            {mensagens.length === 0 && (
              <div style={{
                flex:           1,
                display:        "flex",
                flexDirection:  "column",
                alignItems:     "center",
                justifyContent: "center",
                color:          "var(--clr-text-light)",
                gap:            "var(--sp-2)",
                paddingTop:     "var(--sp-10)",
              }}>
                <IcoMessageSquare size={36} />
                <p style={{ fontSize: 14 }}>Nenhuma mensagem ainda.</p>
              </div>
            )}

            {/* Mensagens agrupadas por data */}
            {itens.map((item, i) => {

              /* Separador de data */
              if (item.tipo === "data") {
                return (
                  <div key={`d-${i}`} style={{ textAlign: "center" }}>
                    <span style={{
                      fontSize:     11,
                      color:        "var(--clr-text-light)",
                      background:   "var(--clr-bg)",
                      padding:      "2px 10px",
                      borderRadius: "var(--r-full)",
                      border:       "1px solid var(--clr-border)",
                    }}>
                      {item.label}
                    </span>
                  </div>
                );
              }

              /* Bubble de mensagem */
              const { msg }  = item;
              const minha    = isMinha(msg);

              return (
                <div key={msg.id} style={{
                  display:       "flex",
                  flexDirection: "column",
                  alignItems:    minha ? "flex-end" : "flex-start",
                  gap:           2,
                }}>
                  {!minha && (
                    <span style={{ fontSize: 11, color: "var(--clr-text-light)", paddingLeft: 4 }}>
                      {msg.remetenteNome}
                    </span>
                  )}

                  <div style={{
                    maxWidth:     "72%",
                    padding:      "var(--sp-3) var(--sp-4)",
                    borderRadius: minha
                      ? "var(--r-lg) var(--r-lg) var(--r-sm) var(--r-lg)"
                      : "var(--r-lg) var(--r-lg) var(--r-lg) var(--r-sm)",
                    /* var(--clr-blue) explícito — substitui var(--clr-purple) */
                    background:   minha ? "var(--clr-blue)" : "var(--clr-bg)",
                    color:        minha ? "#fff"            : "var(--clr-text)",
                    border:       minha ? "none"            : "1px solid var(--clr-border)",
                    fontSize:     14,
                    lineHeight:   1.5,
                    boxShadow:    "var(--shadow-xs)",
                  }}>
                    {msg.conteudo}
                  </div>

                  <span style={{
                    fontSize: 10,
                    color:    "var(--clr-text-light)",
                    paddingLeft: minha ? 0 : 4,
                    paddingRight: minha ? 4 : 0,
                  }}>
                    {fmtHora(msg.enviadoEm)}
                  </span>
                </div>
              );
            })}

            <div ref={bottomRef} />
          </div>
        </CardBody>
      </Card>

      {/* ── Input de mensagem — SVG Send, sem → ── */}
      <div style={{ display: "flex", gap: "var(--sp-3)" }}>
        <textarea
          className="wm-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite sua mensagem... (Enter para enviar)"
          rows={2}
          style={{ flex: 1, resize: "none", lineHeight: 1.5 }}
          disabled={enviando}
        />
        <Btn
          variant="primary"
          onClick={handleEnviar}
          disabled={!input.trim() || enviando}
          style={{ alignSelf: "flex-end", height: 48 }}
        >
          {enviando ? "..." : <IcoSend />}
        </Btn>
      </div>

    </PageLayout>
  );
}
