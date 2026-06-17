/**
 * WorkMatch — pages/NovoServico.jsx
 * CEL Design System v3.0
 *
 * Lógica 100% preservada:
 *  - MENSAGEM_INICIAL / mensagens state / input / dadosColetados
 *  - handleEnviar / handlePublicar / handleKeyDown
 *  - enviarMensagemIA / extrairDadosColetados (aiService)
 *  - bottomRef para auto-scroll
 *  - loading / publicando states
 *
 * Alterações visuais (rodada anterior):
 *  - "Olá! 👋 Sou a assistente..." → remove 👋
 *  - Info banner: 🤖 → SVG Bot, rgba(109,40,217) → rgba(30,95,175)
 *  - Typing indicator: var(--clr-purple) → var(--clr-blue) explícito
 *  - Resumo card: 📋 → SVG Clipboard, purple → blue
 *  - "✅ Confirmar e publicar" → SVG CheckCircle + texto
 *  - "✅ Serviço publicado" na mensagem → sem emoji
 *  - "Enviar →" → SVG Send
 *
 * Alterações visuais (esta rodada):
 *  - Fundo de página azul suave (var(--clr-blue-pale))
 *  - Banner informativo: fundo passou de var(--clr-blue-pale) para
 *    var(--clr-surface) + borda de destaque var(--clr-blue) — caso
 *    contrário ele se misturaria com o novo fundo da página
 *  - Área de mensagens: role="log" + aria-live="polite" (novas respostas
 *    da IA são anunciadas a leitores de tela)
 */

import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth }     from "../context/AuthContext";
import PageLayout      from "../components/PageLayout";
import { Btn, Card, CardBody } from "../components/ui";
import { enviarMensagemIA, extrairDadosColetados } from "../services/aiService";
import api from "../services/api";

/* =========================================================
   ÍCONES SVG — inline, Lucide-style
========================================================= */

const IcoBot = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <path d="M12 8V4H8"/>
    <rect width="16" height="12" x="4" y="8" rx="2"/>
    <path d="M2 14h2M20 14h2M9 17v1M15 17v1M9 13h.01M15 13h.01"/>
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

const IcoCheckCircle = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
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
   MENSAGEM INICIAL — emoji 👋 removido (padrão CEL)
========================================================= */

const MENSAGEM_INICIAL = {
  id:    1,
  autor: "ia",
  texto: "Olá! Sou a assistente do WorkMatch. Vou te ajudar a publicar seu serviço em poucos passos. Me conta: qual tipo de serviço você precisa?",
};

/* Fundo da página — azul suave, padrão fixo do sistema */
const canvasStyle = {
  background:   "var(--clr-blue-pale)",
  borderRadius: "var(--r-lg)",
  padding:      "var(--sp-6)",
};

/* =========================================================
   COMPONENTE
========================================================= */

export default function NovoServico() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [mensagens,     setMensagens]     = useState([MENSAGEM_INICIAL]);
  const [input,         setInput]         = useState("");
  const [loading,       setLoading]       = useState(false);
  const [dadosColetados,setDadosColetados]= useState(null);
  const [publicando,    setPublicando]    = useState(false);

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  /* ── Lógica preservada integralmente ── */

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleEnviar();
    }
  }

  async function handleEnviar() {
    if (!input.trim() || loading) return;

    const texto = input.trim();
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
            /* Sem "Perfeito!" nem emojis — tom neutro CEL */
            texto: "Coletei todas as informações. Veja o resumo abaixo e confirme para publicar.",
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
          texto: "Erro ao processar mensagem. Tente novamente.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handlePublicar() {
    if (!dadosColetados) return;
    setPublicando(true);
    try {
      await api.post("/api/servicos", { ...dadosColetados, clienteId: user.id });

      /* Mensagem de sucesso sem emoji ✅ — padrão CEL */
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

  return (
    <PageLayout
      title="Novo serviço"
      subtitle="Converse com a IA para publicar"
      backPath="/home"
    >
      <div style={canvasStyle}>

        {/* ── Banner informativo — fundo "surface" + borda azul, para não
             se misturar com o novo fundo azul suave da página ── */}
        <div style={{
          background:   "var(--clr-surface)",
          border:       "1px solid var(--clr-border)",
          borderLeft:   "4px solid var(--clr-blue)",
          borderRadius: "var(--r-lg)",
          padding:      "var(--sp-4) var(--sp-5)",
          display:      "flex",
          gap:          "var(--sp-3)",
          alignItems:   "flex-start",
          marginBottom: "var(--sp-5)",
          fontSize:     14,
          color:        "var(--clr-blue)",
        }}>
          {/* SVG Bot — substitui 🤖 */}
          <span style={{ flexShrink: 0, marginTop: 2 }}>
            <IcoBot size={18} />
          </span>
          <p style={{ lineHeight: 1.6 }}>
            Nossa IA vai extrair as informações do seu serviço por meio desta conversa
            e publicar automaticamente para que profissionais possam se candidatar.
          </p>
        </div>

        {/* ── Área de chat ── */}
        <Card style={{ marginBottom: "var(--sp-4)" }}>
          <CardBody style={{ padding: 0 }}>
            <div
              role="log"
              aria-live="polite"
              style={{
                height:         420,
                overflowY:      "auto",
                padding:        "var(--sp-5)",
                display:        "flex",
                flexDirection:  "column",
                gap:            "var(--sp-4)",
              }}
            >

              {mensagens.map((msg) => {
                const isUsuario = msg.autor === "usuario";
                return (
                  <div
                    key={msg.id}
                    style={{
                      display:        "flex",
                      justifyContent: isUsuario ? "flex-end" : "flex-start",
                    }}
                  >
                    <div style={{
                      maxWidth:    "78%",
                      padding:     "var(--sp-3) var(--sp-4)",
                      borderRadius: isUsuario
                        ? "var(--r-lg) var(--r-lg) var(--r-sm) var(--r-lg)"
                        : "var(--r-lg) var(--r-lg) var(--r-lg) var(--r-sm)",
                      /* var(--clr-blue) substitui var(--clr-purple) nas mensagens do usuário */
                      background:  isUsuario ? "var(--clr-blue)" : "var(--clr-bg)",
                      color:       isUsuario ? "#fff"            : "var(--clr-text)",
                      border:      isUsuario ? "none"            : "1px solid var(--clr-border)",
                      fontSize:    14,
                      lineHeight:  1.5,
                      boxShadow:   "var(--shadow-xs)",
                    }}>
                      {msg.texto}
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator — dots azuis, substitui purple ── */}
              {loading && (
                <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)" }}>
                  <div style={{ display: "flex", gap: 5, padding: "var(--sp-3) var(--sp-4)" }}>
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        style={{
                          width:        7,
                          height:       7,
                          borderRadius: "var(--r-full)",
                          /* var(--clr-blue) explícito — substitui var(--clr-purple) */
                          background:   "var(--clr-blue)",
                          display:      "inline-block",
                          animation:    `wmFadeUp 0.8s ease-in-out ${i * 0.2}s infinite alternate`,
                          opacity:      0.6,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          </CardBody>
        </Card>

        {/* ── Card de resumo dos dados coletados ── */}
        {dadosColetados && (
          <Card style={{
            marginBottom: "var(--sp-4)",
            /* border blue explícito — substitui var(--clr-purple) */
            border:       "1.5px solid var(--clr-blue)",
          }}>
            <CardBody>

              {/* Título do resumo — SVG Clipboard, sem 📋 */}
              <p style={{
                fontWeight:    700,
                marginBottom:  "var(--sp-3)",
                color:         "var(--clr-blue)",
                display:       "flex",
                alignItems:    "center",
                gap:           "var(--sp-2)",
              }}>
                <IcoClipboard /> Resumo do serviço
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-2)", fontSize: 14 }}>
                <p><strong>Título:</strong> {dadosColetados.titulo}</p>
                <p><strong>Especialidade:</strong> {dadosColetados.especialidade}</p>
                <p><strong>Descrição:</strong> {dadosColetados.descricao}</p>
                <p><strong>Local:</strong> {dadosColetados.cidade} / {dadosColetados.estado}</p>
              </div>

              <div style={{ display: "flex", gap: "var(--sp-3)", marginTop: "var(--sp-4)" }}>
                <Btn variant="secondary" onClick={() => setDadosColetados(null)} disabled={publicando}>
                  Corrigir
                </Btn>

                {/* SVG CheckCircle — substitui ✅ */}
                <Btn variant="primary" onClick={handlePublicar} disabled={publicando}>
                  {publicando
                    ? "Publicando..."
                    : <><IcoCheckCircle /> Confirmar e publicar</>
                  }
                </Btn>
              </div>
            </CardBody>
          </Card>
        )}

        {/* ── Input de mensagem — SVG Send, substitui → ── */}
        {!dadosColetados && (
          <div style={{ display: "flex", gap: "var(--sp-3)" }}>
            <textarea
              className="wm-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua mensagem... (Enter para enviar)"
              rows={2}
              style={{ flex: 1, resize: "none", lineHeight: 1.5 }}
              disabled={loading}
            />
            <Btn
              variant="primary"
              onClick={handleEnviar}
              disabled={!input.trim() || loading}
              style={{ alignSelf: "flex-end", height: 48 }}
            >
              <IcoSend />
            </Btn>
          </div>
        )}

      </div>
    </PageLayout>
  );
}