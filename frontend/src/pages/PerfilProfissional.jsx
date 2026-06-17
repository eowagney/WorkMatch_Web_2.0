import React, { useState }        from "react";
import { useAuth }                 from "../context/AuthContext";
import PageLayout                  from "../components/PageLayout";
import { Card, CardBody, CardHeader, CardTitle, Btn, Divider } from "../components/ui";

/* =========================================================
   ÍCONES SVG — inline, mesmo estilo de PerfilProfissional.jsx
========================================================= */

const IcoUser = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const IcoMail = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <rect width="20" height="16" x="2" y="4" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const IcoPhone = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

const IcoMapPin = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const IcoAlertCircle = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" x2="12" y1="8" y2="12"/>
    <line x1="12" x2="12.01" y1="16" y2="16"/>
  </svg>
);

const IcoCheckCircle = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

/* =========================================================
   DADOS — UFs e mock (fallback caso o usuário ainda não
   tenha dados carregados via AuthContext)
========================================================= */

const ESTADOS_BR = [
  { uf: "AC", nome: "Acre" }, { uf: "AL", nome: "Alagoas" }, { uf: "AP", nome: "Amapá" },
  { uf: "AM", nome: "Amazonas" }, { uf: "BA", nome: "Bahia" }, { uf: "CE", nome: "Ceará" },
  { uf: "DF", nome: "Distrito Federal" }, { uf: "ES", nome: "Espírito Santo" }, { uf: "GO", nome: "Goiás" },
  { uf: "MA", nome: "Maranhão" }, { uf: "MT", nome: "Mato Grosso" }, { uf: "MS", nome: "Mato Grosso do Sul" },
  { uf: "MG", nome: "Minas Gerais" }, { uf: "PA", nome: "Pará" }, { uf: "PB", nome: "Paraíba" },
  { uf: "PR", nome: "Paraná" }, { uf: "PE", nome: "Pernambuco" }, { uf: "PI", nome: "Piauí" },
  { uf: "RJ", nome: "Rio de Janeiro" }, { uf: "RN", nome: "Rio Grande do Norte" }, { uf: "RS", nome: "Rio Grande do Sul" },
  { uf: "RO", nome: "Rondônia" }, { uf: "RR", nome: "Roraima" }, { uf: "SC", nome: "Santa Catarina" },
  { uf: "SP", nome: "São Paulo" }, { uf: "SE", nome: "Sergipe" }, { uf: "TO", nome: "Tocantins" },
];

const MOCK_USUARIO = {
  nomeCompleto: "Davi Mendes Santos",
  email:        "davinevida18@gmail.com",
  telefone:     "62982618908",
  endereco:     "Rua CP75, 0, 0",
  cidade:       "Goiânia",
  estado:       "GO",
};

/* =========================================================
   HELPERS
========================================================= */

function formatarTelefone(valor) {
  const digitos = valor.replace(/\D/g, "").slice(0, 11);
  if (digitos.length <= 2)  return digitos;
  if (digitos.length <= 6)  return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  if (digitos.length <= 10) return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
}

function validar(form) {
  const erros = {};
  if (!form.nomeCompleto.trim()) erros.nomeCompleto = "Informe seu nome completo.";
  if (!form.email.trim()) {
    erros.email = "Informe seu e-mail.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    erros.email = "Informe um e-mail válido.";
  }
  return erros;
}

/* Campo de formulário reutilizável — label com ícone, hint opcional e erro inline */
function Field({ id, label, icon: Icon, required, hint, error, children }) {
  return (
    <div className="wm-form-group">
      <label htmlFor={id} className="wm-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {Icon && <Icon size={13} />} {label}
        {required && <span style={{ color: "var(--clr-danger, #DC2626)" }}>*</span>}
      </label>
      {hint && (
        <p style={{ fontSize: 12, color: "var(--clr-text-light)", margin: "2px 0 6px" }}>{hint}</p>
      )}
      {children}
      {error && (
        <p style={{
          display: "flex", alignItems: "center", gap: 4,
          fontSize: 12, color: "var(--clr-danger, #DC2626)", marginTop: 4,
        }}>
          <IcoAlertCircle size={13} /> {error}
        </p>
      )}
    </div>
  );
}

/* =========================================================
   COMPONENTE
========================================================= */

export default function MeuPerfil() {
  const { user } = useAuth();

  const dadosIniciais = {
    nomeCompleto: user?.nomeCompleto ?? MOCK_USUARIO.nomeCompleto,
    email:        user?.email        ?? MOCK_USUARIO.email,
    telefone:     user?.telefone     ?? MOCK_USUARIO.telefone,
    endereco:     user?.endereco     ?? MOCK_USUARIO.endereco,
    cidade:       user?.cidade       ?? MOCK_USUARIO.cidade,
    estado:       user?.estado       ?? MOCK_USUARIO.estado,
  };

  const [form,     setForm]     = useState(dadosIniciais);
  const [erros,    setErros]    = useState({});
  const [salvando, setSalvando] = useState(false);
  const [salvo,    setSalvo]    = useState(false);

  const initials = (form.nomeCompleto || "?")
    .trim().split(" ").filter(Boolean)
    .map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  function handleChange(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    if (erros[campo]) setErros((prev) => ({ ...prev, [campo]: undefined }));
    if (salvo) setSalvo(false);
  }

  function handleCancelar() {
    setForm(dadosIniciais);
    setErros({});
    setSalvo(false);
  }

  function handleSalvar() {
    const novosErros = validar(form);
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    setSalvando(true);
    setSalvo(false);
    setTimeout(() => {
      setSalvando(false);
      setSalvo(true);
      setTimeout(() => setSalvo(false), 3000);
    }, 900);
  }

  return (
    <PageLayout title="Meu perfil" subtitle="Atualize suas informações pessoais" backPath="/home">

      <p style={{ fontSize: 12, color: "var(--clr-text-light)", marginBottom: "var(--sp-5)" }}>
        Campos marcados com <span style={{ color: "var(--clr-danger, #DC2626)" }}>*</span> são obrigatórios.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "var(--sp-6)", alignItems: "start" }}>

        {/* ── Coluna esquerda: identidade ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-5)" }}>
          <Card>
            <CardBody>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "var(--sp-4)" }}>

                <div style={{
                  width: 96, height: 96,
                  borderRadius: "var(--r-full)",
                  background: "linear-gradient(135deg, var(--clr-navy) 0%, var(--clr-blue) 100%)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: 32, fontWeight: 700,
                  boxShadow: "var(--shadow-blue)", flexShrink: 0,
                }}>
                  {initials}
                </div>

                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", color: "var(--clr-navy)", marginBottom: 4 }}>
                    {form.nomeCompleto || "Seu nome"}
                  </h2>
                  <p style={{ fontSize: 13, color: "var(--clr-text-light)" }}>
                    {form.email || "seu@email.com"}
                  </p>
                </div>

                <Divider />

                <p style={{ fontSize: 12, color: "var(--clr-text-light)", lineHeight: 1.6 }}>
                  Mantenha seus dados sempre atualizados. Essas informações são usadas para
                  identificação e contato dentro do WorkMatch.
                </p>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* ── Coluna direita: formulário ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-5)" }}>

          <Card>
            <CardHeader>
              <CardTitle>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--sp-2)" }}>
                  <IcoUser /> Dados pessoais
                </span>
              </CardTitle>
            </CardHeader>
            <CardBody>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>

                <Field id="nomeCompleto" label="Nome completo" icon={IcoUser} required error={erros.nomeCompleto}>
                  <input
                    id="nomeCompleto" className="wm-input" placeholder="Seu nome completo"
                    value={form.nomeCompleto}
                    onChange={(e) => handleChange("nomeCompleto", e.target.value)}
                    aria-invalid={!!erros.nomeCompleto}
                    style={erros.nomeCompleto ? { borderColor: "var(--clr-danger, #DC2626)" } : undefined}
                  />
                </Field>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--sp-4)" }}>
                  <Field id="email" label="E-mail" icon={IcoMail} required error={erros.email}>
                    <input
                      id="email" type="email" className="wm-input" placeholder="seu@email.com"
                      value={form.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      aria-invalid={!!erros.email}
                      style={erros.email ? { borderColor: "var(--clr-danger, #DC2626)" } : undefined}
                    />
                  </Field>

                  <Field id="telefone" label="Telefone" icon={IcoPhone}>
                    <input
                      id="telefone" className="wm-input" placeholder="(00) 00000-0000"
                      value={formatarTelefone(form.telefone)}
                      onChange={(e) => handleChange("telefone", e.target.value)}
                      inputMode="numeric"
                    />
                  </Field>
                </div>

              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--sp-2)" }}>
                  <IcoMapPin /> Endereço
                </span>
              </CardTitle>
            </CardHeader>
            <CardBody>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>

                <Field id="endereco" label="Endereço" icon={IcoMapPin} hint="Rua, número e complemento">
                  <input
                    id="endereco" className="wm-input" placeholder="Rua, número, complemento"
                    value={form.endereco}
                    onChange={(e) => handleChange("endereco", e.target.value)}
                  />
                </Field>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "var(--sp-4)" }}>
                  <Field id="cidade" label="Cidade">
                    <input
                      id="cidade" className="wm-input" placeholder="Sua cidade"
                      value={form.cidade}
                      onChange={(e) => handleChange("cidade", e.target.value)}
                    />
                  </Field>

                  <Field id="estado" label="Estado">
                    <select
                      id="estado" className="wm-input"
                      value={form.estado}
                      onChange={(e) => handleChange("estado", e.target.value)}
                    >
                      <option value="">Selecione</option>
                      {ESTADOS_BR.map(({ uf, nome }) => (
                        <option key={uf} value={uf}>{uf} — {nome}</option>
                      ))}
                    </select>
                  </Field>
                </div>

              </div>
            </CardBody>
          </Card>

          {/* Barra de ações */}
          <Card>
            <CardBody>
              <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "var(--sp-3)", flexWrap: "wrap" }}>
                {salvo && (
                  <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--clr-blue)", fontWeight: 600 }}>
                    <IcoCheckCircle size={16} /> Alterações salvas com sucesso
                  </span>
                )}
                <Btn variant="ghost" size="sm" onClick={handleCancelar} disabled={salvando}>
                  Cancelar
                </Btn>
                <Btn variant="primary" size="sm" onClick={handleSalvar} disabled={salvando}>
                  {salvando ? "Salvando..." : "Salvar alterações"}
                </Btn>
              </div>
            </CardBody>
          </Card>

        </div>
      </div>

    </PageLayout>
  );
}