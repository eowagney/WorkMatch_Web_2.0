import PageLayout from "../components/PageLayout";
import { Card, CardBody, CardHeader, CardTitle, Btn } from "../components/ui";
import { usePlano } from "../hooks/usePlano";

const PLANOS = [
  {
    id: "BASICO", nome: "Básico", preco: "Grátis",
    itens: ["2 contratações por mês", "Candidaturas enquanto houver vaga no mês", "Chat e perfil público"],
  },
  {
    id: "PLUS", nome: "Plus", preco: "R$ 50/mês",
    itens: ["Candidaturas ilimitadas", "Contratações ilimitadas", "Chat e perfil público"],
  },
  {
    id: "PREMIUM", nome: "Premium", preco: "R$ 100/mês",
    itens: ["Tudo do Plus", "Aba de relatórios com gráficos", "Serviços realizados e avaliações"],
  },
];

const canvasStyle = {
  background:   "var(--clr-blue-pale)",
  borderRadius: "var(--r-lg)",
  padding:      "var(--sp-6)",
};

export default function PlanosPage() {
  const { carregando, ativo, plano, limiteMensal, usadosNoMes, restantes } = usePlano();

  return (
    <PageLayout title="Planos" subtitle="Escolha como quer crescer na WorkMatch" backPath="/home">
      <div style={canvasStyle}>

        {!carregando && !ativo && (
          <div style={{
            background: "rgba(242, 201, 76, 0.15)", border: "1px solid rgba(242, 201, 76, 0.55)",
            borderRadius: "var(--r-md)", padding: "var(--sp-4)", marginBottom: "var(--sp-5)",
            fontSize: 13, color: "var(--clr-text-mid)", lineHeight: 1.6,
          }}>
            <strong style={{ color: "var(--clr-navy)" }}>Em breve.</strong>{" "}
            Os planos ainda não estão valendo: hoje você pode se candidatar e ser contratado sem limite.
            Já vá conhecendo as opções.
          </div>
        )}

        {!carregando && ativo && (
          <Card style={{ marginBottom: "var(--sp-5)" }}>
            <CardBody>
              <p style={{ fontSize: 14, color: "var(--clr-text-mid)" }}>
                Seu plano: <strong style={{ color: "var(--clr-navy)" }}>{plano}</strong>
                {limiteMensal != null && (
                  <> · {usadosNoMes} de {limiteMensal} contratações usadas neste mês
                    {restantes === 0 && " (limite atingido)"}</>
                )}
              </p>
            </CardBody>
          </Card>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "var(--sp-5)" }}>
          {PLANOS.map((p) => {
            const atual = ativo && plano === p.id;
            return (
              <Card key={p.id}>
                <CardHeader>
                  <CardTitle>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--sp-2)" }}>
                      {p.nome}
                      {atual && <span className="wm-badge wm-badge--green">Seu plano</span>}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
                    <p style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", color: "var(--clr-navy)" }}>
                      {p.preco}
                    </p>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.8, color: "var(--clr-text-mid)" }}>
                      {p.itens.map((i) => <li key={i}>{i}</li>)}
                    </ul>
                    {/* Pagamento entra na fase do gateway; por ora o botão fica desativado. */}
                    <Btn type="button" variant={atual ? "ghost" : "outline"} disabled>
                      {atual ? "Plano atual" : "Em breve"}
                    </Btn>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </div>
    </PageLayout>
  );
}