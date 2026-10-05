import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import PageLayout from "../components/PageLayout";
import { Card, CardHeader, CardBody, CardTitle, Divider, Input, Btn } from "../components/ui";
import { useToast } from "../hooks/useToast";
import Toast from "../components/Toast";

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

/* =========================================================
   ÍCONES SVG — mesmo estilo inline usado em PerfilProfissional.jsx
========================================================= */

const IcoUser = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const IcoMapPin = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const IcoBriefcase = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </svg>
);

const IcoLock = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

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

/* Gravatar aceita SHA-256 do e-mail (minúsculo, sem espaços).
   crypto.subtle só existe em HTTPS ou localhost. */
async function gravatarHash(email) {
  const dados = new TextEncoder().encode(email.trim().toLowerCase());
  const buf   = await crypto.subtle.digest("SHA-256", dados);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/* Bloco de skeleton — usado só durante o carregamento inicial */
function Skeleton({ width = "100%", height = 14, radius = "var(--r-md)" }) {
  return <div className="wm-skeleton" style={{ width, height, borderRadius: radius }} />;
}

/* Fundo da página — azul suave (mesmo tom usado em PerfilProfissional.jsx
   para destacar a nota média), no padrão visual da LoginPage */
const canvasStyle = {
  background:   "var(--clr-blue-pale)",
  borderRadius: "var(--r-lg)",
  padding:      "var(--sp-6)",
};

/* =========================================================
   CARD DE ALTERAR SENHA
   Reaproveita o fluxo que já existe e funciona:
   /esqueci-senha (CPF + nascimento) -> /redefinir-senha.
   Não precisa de endpoint novo no backend.
========================================================= */

function AlterarSenhaCard() {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--sp-2)" }}>
            <IcoLock /> Senha
          </span>
        </CardTitle>
      </CardHeader>
      <CardBody>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: "var(--sp-4)", flexWrap: "wrap",
        }}>
          <p style={{ fontSize: 13, color: "var(--clr-text-light)", lineHeight: 1.6, maxWidth: 420 }}>
            Para trocar sua senha, confirme seu CPF e data de nascimento e
            depois defina a nova senha.
          </p>
          <Btn type="button" onClick={() => navigate("/esqueci-senha")}>
            Alterar senha
          </Btn>
        </div>
      </CardBody>
    </Card>
  );
}

/* =========================================================
   PÁGINA
========================================================= */

export default function ConfiguracaoPerfilPage() {
  const { user, setUser } = useAuth();

  // Mesma tela para cliente e profissional; muda o endpoint e o card extra.
  const ehProfissional = user?.role === "PROFISSIONAL";
  const baseUrl        = ehProfissional ? "/api/profissionais" : "/api/usuarios";
  const { toast, showToast, hideToast } = useToast();

  const [form, setForm] = useState({
    nome:     "",
    email:    "",
    telefone: "",
    endereco: "",
    cidade:   "",
    estado:   "",
    especialidade:   "",
    descricao:       "",
    experienciaAnos: "",
  });
  const [dadosOriginais, setDadosOriginais] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando,   setSalvando]   = useState(false);

  const [hashEmail,  setHashEmail]  = useState("");
  const [fotoErro,   setFotoErro]   = useState(false);
  const [fotoVersao, setFotoVersao] = useState(0);

  // Recalcula o hash só com o e-mail salvo (não a cada tecla digitada)
  useEffect(() => {
    const email = dadosOriginais?.email;
    if (!email) return;
    let ativo = true;
    setFotoErro(false);
    gravatarHash(email)
      .then((h) => ativo && setHashEmail(h))
      .catch(() => ativo && setFotoErro(true));
    return () => { ativo = false; };
  }, [dadosOriginais?.email]);

  const fotoUrl = hashEmail
    ? `https://www.gravatar.com/avatar/${hashEmail}?s=192&d=404&v=${fotoVersao}`
    : null;

  function recarregarFoto() {
    setFotoErro(false);
    setFotoVersao((v) => v + 1);
  }

  useEffect(() => {
    if (!user?.id) return;

    api.get(ehProfissional ? `${baseUrl}/${user.id}/perfil` : `${baseUrl}/${user.id}`)
      .then(({ data }) => {
        const carregado = {
          nome:     data.nome     ?? "",
          email:    data.email    ?? "",
          telefone: formatarTelefone(data.telefone ?? ""),
          endereco: data.endereco ?? "",
          cidade:   data.cidade   ?? "",
          estado:   data.estado   ?? "",
          especialidade:   data.especialidade   ?? "",
          descricao:       data.descricao       ?? "",
          experienciaAnos: data.experienciaAnos ?? "",
        };
        setForm(carregado);
        setDadosOriginais(carregado);
      })
      .catch(() => showToast("Não foi possível carregar o perfil.", "error"))
      .finally(() => setCarregando(false));
  }, [user?.id]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function handleTelefoneChange(e) {
    setForm(prev => ({ ...prev, telefone: formatarTelefone(e.target.value) }));
  }

  function handleCancelar() {
    if (dadosOriginais) setForm(dadosOriginais);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSalvando(true);

    try {
      // Envia só os campos editáveis desta tela
      const payload = {
        nome:     form.nome,
        email:    form.email,
        telefone: form.telefone.replace(/\D/g, ""),
        endereco: form.endereco,
        cidade:   form.cidade,
        estado:   form.estado,
        ...(ehProfissional && {
          especialidade:   form.especialidade,
          descricao:       form.descricao,
          experienciaAnos: form.experienciaAnos === "" ? null : Number(form.experienciaAnos),
        }),
      };

      const { data } = await api.put(`${baseUrl}/${user.id}`, payload);
      setDadosOriginais(form);
      showToast("Perfil atualizado com sucesso.", "success");

      // Atualizar o nome na sessão não pode derrubar o "salvo com sucesso".
      // Exige que o AuthContext exponha setUser.
      if (data?.usuario?.nome && typeof setUser === "function") {
        setUser(prev => ({ ...prev, nome: data.usuario.nome }));
      }
    } catch (err) {
      console.error("Erro ao salvar perfil:", err);
      const msg = err.response?.data?.message ?? "Erro ao salvar. Tente novamente.";
      showToast(msg, "error");
    } finally {
      setSalvando(false);
    }
  }

  const initials = (form.nome || "?")
    .trim().split(" ").filter(Boolean)
    .map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  if (carregando) {
    return (
      <PageLayout title="Meu Perfil" subtitle="Atualize suas informações pessoais" backPath="/home">
        <style>{`
          .wm-skeleton {
            background: var(--clr-bg);
            animation: wm-pulse 1.4s ease-in-out infinite;
          }
          @keyframes wm-pulse {
            0%, 100% { opacity: 1; }
            50%      { opacity: .5; }
          }
        `}</style>

        <div role="status" aria-live="polite" style={canvasStyle}>
          <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden" }}>
            Carregando perfil...
          </span>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "var(--sp-6)", alignItems: "start" }}>
            <Card>
              <CardBody>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--sp-4)" }}>
                  <Skeleton width={96} height={96} radius="var(--r-full)" />
                  <Skeleton width={140} height={16} />
                  <Skeleton width={180} height={12} />
                </div>
              </CardBody>
            </Card>

            <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-5)" }}>
              <Card>
                <CardBody>
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
                    <Skeleton height={44} />
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--sp-4)" }}>
                      <Skeleton height={44} />
                      <Skeleton height={44} />
                    </div>
                  </div>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
                    <Skeleton height={44} />
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "var(--sp-4)" }}>
                      <Skeleton height={44} />
                      <Skeleton height={44} />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Meu Perfil" subtitle="Atualize suas informações pessoais" backPath="/home">
      <div style={canvasStyle}>
        <Toast {...toast} onClose={hideToast} />

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "var(--sp-6)", alignItems: "start" }}>

            {/* ── Coluna esquerda: identidade ── */}
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
                    overflow: "hidden",
                  }}>
                    {fotoUrl && !fotoErro ? (
                      <img
                        key={fotoUrl}
                        src={fotoUrl}
                        alt={`Foto de perfil de ${form.nome || "usuário"}`}
                        width={96}
                        height={96}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={() => setFotoErro(true)}
                      />
                    ) : (
                      initials
                    )}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--sp-2)" }}>
                    <a
                      href="https://gravatar.com/profile"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: 13, fontWeight: 700, color: "var(--clr-blue)" }}
                    >
                      Editar foto no Gravatar ↗
                    </a>
                    <button
                      type="button"
                      onClick={recarregarFoto}
                      style={{
                        background: "none", border: "none", padding: 0, cursor: "pointer",
                        fontSize: 12, fontFamily: "inherit", color: "var(--clr-text-light)",
                        textDecoration: "underline",
                      }}
                    >
                      Já atualizei, recarregar foto
                    </button>
                  </div>

                  <div>
                    <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", color: "var(--clr-navy)", marginBottom: 4 }}>
                      {form.nome || "Seu nome"}
                    </h2>
                    <p style={{ fontSize: 13, color: "var(--clr-text-light)" }}>
                      {form.email || "seu@email.com"}
                    </p>
                    {form.especialidade && (
                      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--clr-blue)", marginTop: 6 }}>
                        {form.especialidade}
                      </p>
                    )}
                  </div>

                  <Divider />

                  <p style={{ fontSize: 12, color: "var(--clr-text-light)", lineHeight: 1.6 }}>
                    Mantenha seus dados sempre atualizados. Essas informações são usadas para
                    identificação e contato dentro do WorkMatch.
                  </p>
                </div>
              </CardBody>
            </Card>

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
                    <Input
                      label="Nome completo"
                      name="nome"
                      value={form.nome}
                      onChange={handleChange}
                      required
                      autoComplete="name"
                    />
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--sp-4)" }}>
                      <Input
                        label="E-mail"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        autoComplete="email"
                      />
                      <Input
                        label="Telefone"
                        name="telefone"
                        type="tel"
                        value={form.telefone}
                        onChange={handleTelefoneChange}
                        placeholder="(XX) XXXXX-XXXX"
                        autoComplete="tel"
                      />
                    </div>
                  </div>
                </CardBody>
              </Card>

              {ehProfissional && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--sp-2)" }}>
                      <IcoBriefcase /> Perfil profissional
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--sp-4)" }}>
                      <Input
                        label="Especialidade"
                        name="especialidade"
                        value={form.especialidade}
                        onChange={handleChange}
                        placeholder="Ex.: Eletricista, Encanador"
                        required
                      />
                      <Input
                        label="Anos de experiência"
                        name="experienciaAnos"
                        type="number"
                        min="0"
                        value={form.experienciaAnos}
                        onChange={handleChange}
                        placeholder="0"
                      />
                    </div>
                    <div className="wm-form-group">
                      <label className="wm-label" htmlFor="descricao-field">Sobre você</label>
                      <textarea
                        id="descricao-field"
                        name="descricao"
                        value={form.descricao}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Conte sua experiência e os serviços que você realiza."
                        className="wm-input"
                        style={{ resize: "vertical", fontFamily: "inherit" }}
                      />
                    </div>
                  </div>
                </CardBody>
              </Card>
              )}

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
                    <Input
                      label="Endereço"
                      name="endereco"
                      value={form.endereco}
                      onChange={handleChange}
                      placeholder="Rua, número, bairro"
                      autoComplete="street-address"
                    />
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "var(--sp-4)" }}>
                      <Input
                        label="Cidade"
                        name="cidade"
                        value={form.cidade}
                        onChange={handleChange}
                        autoComplete="address-level2"
                      />
                      <div className="wm-form-group">
                        <label className="wm-label" htmlFor="estado-field">Estado</label>
                        <select
                          id="estado-field"
                          name="estado"
                          value={form.estado}
                          onChange={handleChange}
                          className="wm-input"
                        >
                          <option value="">Selecione</option>
                          {ESTADOS_BR.map(({ uf, nome }) => (
                            <option key={uf} value={uf}>{uf} — {nome}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <div
                    className="wm-form-actions"
                    style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "var(--sp-3)", flexWrap: "wrap" }}
                  >
                    <Btn type="button" variant="ghost" onClick={handleCancelar} disabled={salvando}>
                      Cancelar
                    </Btn>
                    <Btn type="submit" disabled={salvando}>
                      {salvando ? "Salvando..." : "Salvar alterações"}
                    </Btn>
                  </div>
                </CardBody>
              </Card>

            </div>
          </div>
        </form>

        {/* Fora do <form> principal: form aninhado não é válido em HTML */}
        <div style={{ marginTop: "var(--sp-6)" }}>
          <AlterarSenhaCard />
        </div>
      </div>
    </PageLayout>
  );
}