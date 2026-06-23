import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams }       from "react-router-dom";
import { useAuth }         from "../context/AuthContext";
import PageLayout          from "../components/PageLayout";
import { Btn, Card, CardBody, Spinner } from "../components/ui";
import api                 from "../services/api";

/* =========================================================
   ÍCONES SVG
========================================================= */

const IcoMessageSquare = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const IcoSend = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
  </svg>
);

const IcoWifi = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/>
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1" fill="currentColor"/>
  </svg>
);

/* =========================================================
   HELPERS
========================================================= */

function fmtHora(iso) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function fmtData(iso) {
  const d = new Date(iso);
  const hoje = new Date();
  const ontem = new Date();
  ontem.setDate(hoje.getDate() - 1);

  if (d.toDateString() === hoje.toDateString())  return "Hoje";
  if (d.toDateString() === ontem.toDateString()) return "Ontem";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function agruparPorData(msgs) {
  const itens = [];
  let dataAtual = null;
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

/* =========================================================
   COMPONENTE
========================================================= */

const POLL_INTERVAL = 4000;

export default function ChatServico() {
  const { servicoId } = useParams();
  const { user }      = useAuth();

  const [servico,    setServico]    = useState(null);
  const [mensagens,  setMensagens]  = useState([]);
  const [input,      setInput]      = useState("");
  const [loading,    setLoading]    = useState(true);
  const [enviando,   setEnviando]   = useState(false);
  const [online,     setOnline]     = useState(true);
  const [novasMsgs,  setNovasMsgs]  = useState(0);

  const bottomRef    = useRef(null);
  const pollRef      = useRef(null);
  const countRef     = useRef(0); // total de mensagens na última leitura

  /* ── Scroll automático apenas quando o usuário está no fundo ── */
  const chatBoxRef   = useRef(null);
  const noFundo      = useRef(true);

  function onScroll() {
    if (!chatBoxRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatBoxRef.current;
    noFundo.current = scrollHeight - scrollTop - clientHeight < 60;
    if (noFundo.current) setNovasMsgs(0);
  }

  function scrollParaBaixo(force = false) {
    if (force || noFundo.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setNovasMsgs(0);
    }
  }

  /* ── Carrega dados iniciais ── */
  useEffect(() => {
    async function init() {
      try {
        const [sRes, mRes] = await Promise.all([
          api.get(`/api/servicos/${servicoId}`),
          api.get(`/api/mensagens/servico/${servicoId}`),
        ]);
        setServico(sRes.data);
        setMensagens(mRes.data);
        countRef.current = mRes.data.length;
      } catch {
        setOnline(false);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [servicoId]);

  /* ── Scroll inicial após carregar ── */
  useEffect(() => {
    if (!loading) scrollParaBaixo(true);
  }, [loading]);

  /* ── Polling de novas mensagens ── */
  const pollMensagens = useCallback(async () => {
    try {
      const { data } = await api.get(`/api/mensagens/servico/${servicoId}`);
      setOnline(true);
      if (data.length !== countRef.current) {
        const novas = data.length - countRef.current;
        countRef.current = data.length;
        setMensagens(data);
        if (novas > 0 && !noFundo.current) {
          setNovasMsgs(prev => prev + novas);
        } else {
          scrollParaBaixo();
        }
      }
    } catch {
      setOnline(false);
    }
  }, [servicoId]);

  useEffect(() => {
    pollRef.current = setInterval(pollMensagens, POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [pollMensagens]);

  /* ── Envio de mensagem ── */
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
      // destinatarioId: profissional envia para o cliente do serviço,
      // cliente envia para o profissional — o backend resolve pelo remetenteTipo
      const destinatarioId = user.role === "PROFISSIONAL"
        ? servico?.clienteId
        : servico?.profissionalId;

      await api.post("/api/mensagens", {
        servicoId,
        remetenteId:   user.id,
        remetenteTipo: user.role,
        destinatarioId,
        conteudo:      texto,
      });
      await pollMensagens();
      scrollParaBaixo(true);
    } catch {
      setInput(texto); // devolve o texto se falhar
    } finally {
      setEnviando(false);
    }
  }

  function isMinha(msg) {
    return msg.remetenteId === user.id;
  }

  const outraParte = user?.role === "PROFISSIONAL"
    ? servico?.clienteNome
    : servico?.profissionalNome;

  const itens = agruparPorData(mensagens);

  if (loading) {
    return (
      <PageLayout title="Conversa" backPath="/meus-servicos">
        <Spinner size="md" center />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={outraParte ? `Conversa com ${outraParte}` : "Conversa"}
      subtitle={servico?.titulo || ""}
      backPath="/meus-servicos"
    >

      {/* ── Info do serviço ── */}
      <Card style={{ marginBottom: "var(--sp-4)", background: "var(--clr-blue-pale)", border: "1px solid rgba(30,95,175,0.2)" }}>
        <CardBody style={{ padding: "var(--sp-3) var(--sp-5)" }}>
          <div style={{ display: "flex", gap: "var(--sp-5)", flexWrap: "wrap", fontSize: 13, alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: "var(--sp-5)", flexWrap: "wrap", alignItems: "center" }}>
              {servico?.titulo        && <span><strong>Serviço:</strong> {servico.titulo}</span>}
              {servico?.especialidade && <span><strong>Área:</strong> {servico.especialidade}</span>}
              {servico?.cidade        && <span><strong>Local:</strong> {servico.cidade}{servico.estado ? `/${servico.estado}` : ""}</span>}
              {servico?.status        && (
                <span style={{ background: "var(--clr-blue)", color: "#fff", padding: "2px 10px", borderRadius: "var(--r-full)", fontSize: 11, fontWeight: 600 }}>
                  {servico.status}
                </span>
              )}
            </div>

            {/* Indicador de conexão */}
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: online ? "var(--clr-success)" : "var(--clr-danger)", fontWeight: 600, flexShrink: 0 }}>
              <IcoWifi size={12} />
              {online ? "Ao vivo" : "Sem conexão"}
            </span>
          </div>
        </CardBody>
      </Card>

      {/* ── Área de mensagens ── */}
      <Card style={{ marginBottom: "var(--sp-4)", position: "relative" }}>
        <CardBody style={{ padding: 0 }}>
          <div
            ref={chatBoxRef}
            onScroll={onScroll}
            style={{ height: 460, overflowY: "auto", padding: "var(--sp-5)", display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}
          >

            {mensagens.length === 0 && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--clr-text-light)", gap: "var(--sp-2)", paddingTop: "var(--sp-10)" }}>
                <IcoMessageSquare size={36} />
                <p style={{ fontSize: 14 }}>Nenhuma mensagem ainda.</p>
                <p style={{ fontSize: 12 }}>Seja o primeiro a escrever.</p>
              </div>
            )}

            {itens.map((item, i) => {
              if (item.tipo === "data") {
                return (
                  <div key={`d-${i}`} style={{ textAlign: "center" }}>
                    <span style={{ fontSize: 11, color: "var(--clr-text-light)", background: "var(--clr-bg)", padding: "2px 10px", borderRadius: "var(--r-full)", border: "1px solid var(--clr-border)" }}>
                      {item.label}
                    </span>
                  </div>
                );
              }

              const { msg } = item;
              const minha   = isMinha(msg);

              return (
                <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: minha ? "flex-end" : "flex-start", gap: 2 }}>
                  {!minha && (
                    <span style={{ fontSize: 11, color: "var(--clr-text-light)", paddingLeft: 4 }}>
                      {msg.remetenteNome}
                    </span>
                  )}
                  <div style={{
                    maxWidth: "72%", padding: "var(--sp-3) var(--sp-4)",
                    borderRadius: minha ? "var(--r-lg) var(--r-lg) var(--r-sm) var(--r-lg)" : "var(--r-lg) var(--r-lg) var(--r-lg) var(--r-sm)",
                    background: minha ? "var(--clr-blue)" : "var(--clr-bg)",
                    color:      minha ? "#fff"            : "var(--clr-text)",
                    border:     minha ? "none"            : "1px solid var(--clr-border)",
                    fontSize: 14, lineHeight: 1.5, boxShadow: "var(--shadow-xs)",
                  }}>
                    {msg.conteudo}
                  </div>
                  <span style={{ fontSize: 10, color: "var(--clr-text-light)", paddingLeft: minha ? 0 : 4, paddingRight: minha ? 4 : 0 }}>
                    {fmtHora(msg.enviadoEm)}
                  </span>
                </div>
              );
            })}

            <div ref={bottomRef} />
          </div>
        </CardBody>

        {/* Badge de novas mensagens */}
        {novasMsgs > 0 && (
          <button
            onClick={() => scrollParaBaixo(true)}
            style={{
              position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)",
              background: "var(--clr-blue)", color: "#fff", border: "none",
              borderRadius: "var(--r-full)", padding: "6px 16px", fontSize: 12,
              fontWeight: 600, cursor: "pointer", boxShadow: "var(--shadow-md)",
              fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6,
            }}
          >
            {novasMsgs} nova{novasMsgs !== 1 ? "s" : ""} mensagem{novasMsgs !== 1 ? "s" : ""} ↓
          </button>
        )}
      </Card>

      {/* ── Input ── */}
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
          {enviando ? <Spinner size="sm" center={false} /> : <IcoSend />}
        </Btn>
      </div>

    </PageLayout>
  );
}