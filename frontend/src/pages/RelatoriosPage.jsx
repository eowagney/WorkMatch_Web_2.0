import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import PageLayout from "../components/PageLayout";
import { Card, CardHeader, CardBody, CardTitle, Btn } from "../components/ui";
import { usePlano } from "../hooks/usePlano";

const STATUS_ROTULO = {
  NEGOCIANDO: "Negociando", CONTRATADO: "Contratado", ANDAMENTO: "Andamento",
  FINALIZADO: "Finalizado", CANCELADO: "Cancelado", ARQUIVADO: "Arquivado",
};

const canvasStyle = {
  background:   "var(--clr-blue-pale)",
  borderRadius: "var(--r-lg)",
  padding:      "var(--sp-6)",
};

/* ── Helpers de data ── */

function chaveMes(valor) {
  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function ultimosMeses(qtd = 6) {
  const hoje = new Date();
  return Array.from({ length: qtd }, (_, i) => {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - (qtd - 1 - i), 1);
    return {
      chave:  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      rotulo: d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
    };
  });
}

/* ── Gráfico de barras (sem biblioteca) ── */

function Barras({ itens, max, formatar = (v) => v }) {
  const topo = max ?? Math.max(1, ...itens.map((i) => i.valor));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "var(--sp-3)" }}>
      {itens.map((i) => (
        <div key={i.rotulo} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 0 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--clr-navy)" }}>
            {formatar(i.valor)}
          </span>
          <div style={{ height: 120, width: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
            <div
              title={`${i.rotulo}: ${formatar(i.valor)}`}
              style={{
                width: "100%", maxWidth: 48,
                height: `${(i.valor / topo) * 100}%`,
                minHeight: i.valor > 0 ? 4 : 0,
                background: "var(--clr-blue)",
                borderRadius: "var(--r-sm) var(--r-sm) 0 0",
              }}
            />
          </div>
          <span style={{ fontSize: 11, color: "var(--clr-text-light)", textAlign: "center" }}>
            {i.rotulo}
          </span>
        </div>
      ))}
    </div>
  );
}

function Grafico({ titulo, vazio, children }) {
  return (
    <Card>
      <CardHeader><CardTitle>{titulo}</CardTitle></CardHeader>
      <CardBody>
        {vazio
          ? <p style={{ fontSize: 13, color: "var(--clr-text-light)" }}>Ainda não há dados para este gráfico.</p>
          : children}
      </CardBody>
    </Card>
  );
}

function Indicador({ rotulo, valor }) {
  return (
    <Card>
      <CardBody>
        <p style={{ fontSize: 12, color: "var(--clr-text-light)", marginBottom: 4 }}>{rotulo}</p>
        <p style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", color: "var(--clr-navy)" }}>{valor}</p>
      </CardBody>
    </Card>
  );
}

export default function RelatoriosPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { carregando: carregandoPlano, ativo, plano } = usePlano();

  const [servicos,   setServicos]   = useState([]);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro,       setErro]       = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      api.get(`/api/servicos/profissional/${user.id}`),
      api.get(`/api/avaliacoes/profissional/${user.id}`).catch(() => ({ data: [] })),
    ])
      .then(([s, a]) => {
        setServicos(s.data ?? []);
        setAvaliacoes(a.data ?? []);
      })
      .catch(() => setErro(true))
      .finally(() => setCarregando(false));
  }, [user?.id]);

  const meses = useMemo(() => ultimosMeses(6), []);

  const dados = useMemo(() => {
    // Serviços por status
    const porStatus = {};
    servicos.forEach((s) => { porStatus[s.status] = (porStatus[s.status] ?? 0) + 1; });
    const statusItens = Object.entries(porStatus)
      .map(([k, v]) => ({ rotulo: STATUS_ROTULO[k] ?? k, valor: v }));

    // Finalizados por mês (usa a data da última atualização do serviço)
    const finalizados = servicos.filter((s) => s.status === "FINALIZADO");
    const finPorMes = meses.map((m) => ({
      rotulo: m.rotulo,
      valor:  finalizados.filter((s) => chaveMes(s.dataAtualizacao ?? s.dataCriacao) === m.chave).length,
    }));

    // Distribuição das notas
    const notas = avaliacoes.map((a) => Number(a.nota)).filter((n) => n >= 1 && n <= 5);
    const distribuicao = [5, 4, 3, 2, 1].map((n) => ({
      rotulo: `${n}★`,
      valor:  notas.filter((x) => Math.round(x) === n).length,
    }));

    // Nota média por mês
    const mediaPorMes = meses.map((m) => {
      const doMes = avaliacoes
        .filter((a) => chaveMes(a.criadoEm ?? a.dataCriacao ?? a.data) === m.chave)
        .map((a) => Number(a.nota))
        .filter((n) => n >= 1 && n <= 5);
      const media = doMes.length ? doMes.reduce((x, y) => x + y, 0) / doMes.length : 0;
      return { rotulo: m.rotulo, valor: Number(media.toFixed(1)) };
    });

    const mediaGeral = notas.length ? notas.reduce((x, y) => x + y, 0) / notas.length : null;

    return {
      statusItens, finPorMes, distribuicao, mediaPorMes, mediaGeral,
      totalServicos: servicos.length,
      totalFinalizados: finalizados.length,
      totalAvaliacoes: notas.length,
    };
  }, [servicos, avaliacoes, meses]);

  // Com os planos ligados, só o Premium acessa. Desligado, fica liberado para teste por URL.
  const bloqueado = !carregandoPlano && ativo && plano !== "PREMIUM";

  return (
    <PageLayout title="Relatórios" subtitle="Seus serviços realizados e suas avaliações" backPath="/home">
      <div style={canvasStyle}>

        {bloqueado ? (
          <Card>
            <CardBody>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "var(--sp-3)" }}>
                <p style={{ fontSize: 14, color: "var(--clr-text-mid)" }}>
                  Os relatórios fazem parte do plano <strong>Premium</strong>.
                </p>
                <Btn type="button" onClick={() => navigate("/planos")}>Ver planos</Btn>
              </div>
            </CardBody>
          </Card>
        ) : carregando ? (
          <p role="status" style={{ fontSize: 14, color: "var(--clr-text-light)" }}>Carregando relatórios...</p>
        ) : erro ? (
          <p style={{ fontSize: 14, color: "var(--clr-text-mid)" }}>Não foi possível carregar os relatórios.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-5)" }}>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "var(--sp-4)" }}>
              <Indicador rotulo="Serviços no total"  valor={dados.totalServicos} />
              <Indicador rotulo="Finalizados"        valor={dados.totalFinalizados} />
              <Indicador rotulo="Nota média"         valor={dados.mediaGeral != null ? dados.mediaGeral.toFixed(1) : "—"} />
              <Indicador rotulo="Avaliações"         valor={dados.totalAvaliacoes} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "var(--sp-5)" }}>
              <Grafico titulo="Serviços por status" vazio={dados.statusItens.length === 0}>
                <Barras itens={dados.statusItens} />
              </Grafico>

              <Grafico titulo="Finalizados por mês" vazio={dados.totalFinalizados === 0}>
                <Barras itens={dados.finPorMes} />
              </Grafico>

              <Grafico titulo="Distribuição das notas" vazio={dados.totalAvaliacoes === 0}>
                <Barras itens={dados.distribuicao} />
              </Grafico>

              <Grafico titulo="Nota média por mês" vazio={dados.totalAvaliacoes === 0}>
                <Barras itens={dados.mediaPorMes} max={5} formatar={(v) => (v ? v.toFixed(1) : "—")} />
              </Grafico>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}