

import React, { useState } from "react";
import { useNavigate }      from "react-router-dom";
import { Btn, Input }       from "../components/ui";
import Toast                from "../components/Toast";
import { useToast }         from "../hooks/useToast";
import api, { validacaoService } from "../services/api";

/* =========================================================
   ÍCONES SVG — inline, Lucide-style
========================================================= */

const IcoUser = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <circle cx="12" cy="8" r="4"/>
    <path d="M20 21a8 8 0 1 0-16 0"/>
  </svg>
);

const IcoHardHat = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v2z"/>
    <path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5"/>
    <path d="M4 15v-3a8 8 0 0 1 16 0v3"/>
  </svg>
);

const IcoLock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const IcoEye = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const IcoEyeOff = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/>
    <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/>
    <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/>
    <path d="m2 2 20 20"/>
  </svg>
);

/* Logo-mark painel esquerdo */
const LogoMarkLarge = () => (
  <svg width="72" height="72" viewBox="0 0 72 72" fill="none"
    xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect width="72" height="72" rx="20" fill="#F2C94C" fillOpacity="0.15"/>
    <path
      d="M50 24a13 13 0 0 0-12.5 16.6L19.5 58.8a4 4 0 1 0 5.66 5.66l18.1-18.1A13 13 0 1 0 50 24z"
      fill="#F2C94C" fillOpacity="0.9"/>
    <circle cx="50" cy="37" r="6" fill="#1E5FAF"/>
    <path d="M22.5 58a3 3 0 1 1-4.5-3.9"
      stroke="#1E5FAF" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

/* =========================================================
   CONSTANTES — preservadas integralmente
========================================================= */

const ESTADOS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA",
  "MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN",
  "RS","RO","RR","SC","SP","SE","TO",
];

const INITIAL_USUARIO = {
  nome: "", cpf: "", email: "", telefone: "",
  dataNascimento: "", cep: "", endereco: "",
  numero: "", complemento: "", cidade: "",
  estado: "", login: "", senha: "", role: "CLIENTE",
};

const INITIAL_PROFISSIONAL = {
  nome: "", cpf: "", email: "", telefone: "",
  dataNascimento: "", cep: "", endereco: "",
  numero: "", complemento: "", cidade: "",
  estado: "", especialidade: "", descricao: "",
  experienciaAnos: "", login: "", senha: "",
};

/* =========================================================
   FORMATADORES — preservados integralmente
========================================================= */

function fmtCpf(v) {
  v = v.replace(/\D/g, "").slice(0, 11);
  return v.replace(
    /(\d{3})(\d{3})(\d{3})(\d{0,2})/,
    (_, a, b, c, d) =>
      d ? `${a}.${b}.${c}-${d}` : c ? `${a}.${b}.${c}` : b ? `${a}.${b}` : a
  );
}

function fmtTel(v) {
  v = v.replace(/\D/g, "").slice(0, 11);
  if (v.length <= 2) return `(${v}`;
  if (v.length <= 7) return `(${v.slice(0, 2)}) ${v.slice(2)}`;
  return `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
}

function fmtCep(v) {
  v = v.replace(/\D/g, "").slice(0, 8);
  return v.length > 5 ? `${v.slice(0, 5)}-${v.slice(5)}` : v;
}

/* =========================================================
   VALIDADORES — preservados integralmente
========================================================= */

function validateStep1(form) {
  const errs = {};
  if (!form.nome.trim())                       errs.nome          = "Nome obrigatório";
  if (!form.cpf || form.cpf.length < 14)       errs.cpf           = "CPF inválido";
  if (!form.telefone || form.telefone.length < 14) errs.telefone  = "Telefone inválido";
  if (!form.dataNascimento)                    errs.dataNascimento = "Obrigatório";
  return errs;
}

function validateStep2(form, isProfissional) {
  const errs = {};
  if (!form.email || !form.email.includes("@"))       errs.email       = "E-mail inválido";
  if (!form.cep || form.cep.replace(/\D/g, "").length < 8) errs.cep   = "CEP inválido";
  if (!form.endereco?.trim())                          errs.endereco    = "Endereço obrigatório";
  if (!form.cidade?.trim())                            errs.cidade      = "Cidade obrigatória";
  if (!form.estado)                                    errs.estado      = "Estado obrigatório";
  if (isProfissional && !form.especialidade?.trim())   errs.especialidade = "Especialidade obrigatória";
  return errs;
}

function validateStep3(form) {
  const errs = {};
  if (!form.login?.trim() || form.login.length < 4) errs.login = "Login mínimo de 4 caracteres";
  if (!form.senha || form.senha.length < 6)         errs.senha = "Mínimo 6 caracteres";
  return errs;
}

/* =========================================================
   RÓTULOS DE PASSO — para exibição no card
========================================================= */
const STEP_LABELS = ["", "Dados pessoais", "Endereço", "Acesso"];

/* =========================================================
   COMPONENTE
========================================================= */

export default function CadastroPage() {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();

  const [perfil,      setPerfil]      = useState(null);
  const [form,        setForm]        = useState({});
  const [errors,      setErrors]      = useState({});
  const [loading,     setLoading]     = useState(false);
  const [loadingCep,  setLoadingCep]  = useState(false);
  const [showPass,    setShowPass]    = useState(false);
  const [step,        setStep]        = useState(0);

  const isProfissional = perfil === "PROFISSIONAL";

  /* ── Lógica preservada integralmente ── */

  function escolherPerfil(tipo) {
    setPerfil(tipo);
    setForm(tipo === "PROFISSIONAL" ? { ...INITIAL_PROFISSIONAL } : { ...INITIAL_USUARIO });
    setErrors({});
    setStep(1);
  }

  function handleChange(e) {
    let { name, value } = e.target;
    if (name === "cpf")      value = fmtCpf(value);
    if (name === "telefone") value = fmtTel(value);
    if (name === "cep") {
      value = fmtCep(value);
      if (value.replace(/\D/g, "").length === 8) buscarCep(value);
    }
    setForm((prev)   => ({ ...prev,   [name]: value }));
    setErrors((prev) => ({ ...prev,   [name]: ""    }));
  }

  async function buscarCep(cep) {
    const cepLimpo = cep.replace(/\D/g, "");
    setLoadingCep(true);
    try {
      const res  = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await res.json();
      if (data.erro) { setErrors((p) => ({ ...p, cep: "CEP não encontrado" })); return; }
      setForm((p) => ({ ...p, endereco: data.logradouro || "", cidade: data.localidade || "", estado: data.uf || "" }));
    } catch {
      setErrors((p) => ({ ...p, cep: "Erro ao buscar CEP" }));
    } finally {
      setLoadingCep(false);
    }
  }

  function field(name, label, extra = {}) {
    return { label, name, value: form[name] || "", onChange: handleChange, error: errors[name], ...extra };
  }

  async function handleStep1Next() {
    const errs = validateStep1(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const cpfLimpo = form.cpf.replace(/\D/g, "");
      const { valido } = await validacaoService.validarCpf(cpfLimpo);
      if (!valido) { setErrors({ cpf: "CPF inválido." }); return; }
      const { existe } = await validacaoService.cpfExiste(cpfLimpo);
      if (existe)  { setErrors({ cpf: "CPF já cadastrado." }); return; }
      setStep(2);
    } catch {
      showToast("Erro ao validar CPF.", "error");
    } finally {
      setLoading(false);
    }
  }

  function handleStep2Next() {
    const errs = validateStep2(form, isProfissional);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setStep(3);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validateStep3(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const cpfLimpo       = form.cpf.replace(/\D/g, "");
      const telLimpo       = form.telefone.replace(/\D/g, "");
      const enderecoCompleto = [form.endereco, form.numero, form.complemento].filter(Boolean).join(", ");
      const payload = {
        nome: form.nome, cpf: cpfLimpo, dataNascimento: form.dataNascimento,
        telefone: telLimpo, endereco: enderecoCompleto, cidade: form.cidade,
        estado: form.estado, email: form.email, login: form.login,
        senha: form.senha, role: isProfissional ? "PROFISSIONAL" : "CLIENTE",
        ...(isProfissional && {
          especialidade:  form.especialidade,
          descricao:      form.descricao,
          experienciaAnos: form.experienciaAnos ? Number(form.experienciaAnos) : null,
        }),
      };
      const endpoint = isProfissional ? "/api/profissionais" : "/api/usuarios";
      await api.post(endpoint, payload);
      showToast("Conta criada com sucesso!", "success");
      setTimeout(() => { navigate("/login"); }, 1500);
    } catch (error) {
      const backendMsg =
        error.response?.data?.message ||
        error.response?.data?.erro    ||
        JSON.stringify(error.response?.data);
      showToast(backendMsg || "Erro ao criar conta.", "error");
    } finally {
      setLoading(false);
    }
  }

  /* ── Estilo compartilhado do botão olho ── */
  const eyeBtnStyle = {
    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
    background: "none", border: "none", cursor: "pointer",
    color: "var(--clr-text-light)", display: "flex", alignItems: "center", padding: 4,
  };

  return (
    <div className="wm-auth">

      {/* ── Painel esquerdo — navy CEL ── */}
      <div className="wm-auth__panel-left">
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", color: "#fff", maxWidth: 380 }}>

          {/* Logo-mark SVG — sem emoji */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "var(--sp-6)" }}>
            <LogoMarkLarge />
          </div>

          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(26px, 4vw, 34px)", marginBottom: "var(--sp-4)", lineHeight: 1.2, fontWeight: 400 }}>
            Junte-se ao{" "}
            <em style={{ color: "var(--clr-yellow)" }}>WorkMatch</em>
          </h2>

          <p style={{ fontSize: 15, opacity: 0.72, lineHeight: 1.7 }}>
            Cadastre-se e conecte-se a profissionais verificados — ou ofereça seus serviços para quem precisa.
          </p>

          <div style={{ display: "flex", gap: "var(--sp-3)", justifyContent: "center", marginTop: "var(--sp-8)", flexWrap: "wrap" }}>
            {["Gratuito", "Seguro", "Rápido"].map((item) => (
              <span key={item} style={{
                padding: "var(--sp-2) var(--sp-4)", borderRadius: "var(--r-full)",
                background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
                fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.75)", letterSpacing: "0.02em",
              }}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Painel direito ── */}
      <div className="wm-auth__panel-right">

        <span className="wm-auth__logo" onClick={() => navigate("/")}
          role="link" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && navigate("/")}>
          Work<span>Match</span>
        </span>

        <div className="wm-auth__card">

          <h1 className="wm-auth__heading">Cadastro</h1>
          <p className="wm-auth__sub">
            {perfil
              ? `Passo ${step} de 3 — ${STEP_LABELS[step]}`
              : "Crie sua conta gratuita"}
          </p>

          {/* ── Barra de progresso de passos ── */}
          {perfil && (
            <div className="wm-steps">
              {[1, 2, 3].map((n) => (
                <div key={n} className={`wm-step${step >= n ? " wm-step--active" : ""}`} />
              ))}
            </div>
          )}

          {/* ── Passo 0: Escolher perfil ── */}
          {!perfil && (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)", marginTop: "var(--sp-5)" }}>

              {/* SVG User + texto — sem emoji 👤 */}
              <Btn fullWidth size="lg" onClick={() => escolherPerfil("CLIENTE")}>
                <IcoUser />
                Sou Cliente
              </Btn>

              {/* SVG HardHat + texto — sem emoji 🛠️ */}
              <Btn fullWidth size="lg" variant="secondary" onClick={() => escolherPerfil("PROFISSIONAL")}>
                <IcoHardHat />
                Sou Profissional
              </Btn>

            </div>
          )}

          {/* ── Passos 1–3: Formulário ── */}
          {perfil && (
            <form onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)", marginTop: "var(--sp-5)" }}
              noValidate>

              {/* ── PASSO 1: Dados pessoais ── */}
              {step === 1 && (
                <>
                  {/* icon props removidos — eram ignorados pelo componente Input */}
                  <Input {...field("nome",           "Nome completo")}    placeholder="Seu nome completo" />
                  <Input {...field("cpf",            "CPF")}              placeholder="000.000.000-00" />
                  <Input {...field("telefone",       "Telefone")}         placeholder="(00) 00000-0000" />
                  <Input {...field("dataNascimento", "Data de nascimento", { type: "date" })} />

                  <Btn type="button" fullWidth size="lg"
                    disabled={loading} onClick={handleStep1Next}>
                    {loading ? "Validando..." : "Próximo"}
                  </Btn>
                </>
              )}

              {/* ── PASSO 2: Endereço ── */}
              {step === 2 && (
                <>
                  <Input {...field("email",        "E-mail")}    type="email" placeholder="seuemail@email.com" />
                  <Input {...field("cep",          "CEP")}       placeholder="00000-000"
                    /* loadingCep não altera lógica, apenas informativo */
                  />
                  <Input {...field("endereco",     "Endereço")}  placeholder="Rua, Avenida..." />
                  <Input {...field("numero",       "Número")}    placeholder="Ex.: 123" />
                  <Input {...field("complemento",  "Complemento")} placeholder="Apto, Sala..." />
                  <Input {...field("cidade",       "Cidade")}    placeholder="Sua cidade" />

                  {/* Select de estado — sem emoji */}
                  <div className="wm-form-group">
                    <label className="wm-label">Estado</label>
                    <select name="estado" value={form.estado || ""} onChange={handleChange}
                      className="wm-input wm-input--select">
                      <option value="">Selecione</option>
                      {ESTADOS.map((uf) => (
                        <option key={uf} value={uf}>{uf}</option>
                      ))}
                    </select>
                    {errors.estado && <span className="wm-field-error">{errors.estado}</span>}
                  </div>

                  {/* Campos exclusivos do profissional */}
                  {isProfissional && (
                    <>
                      <Input {...field("especialidade", "Especialidade")} placeholder="Ex.: Eletricista" />
                      <Input {...field("descricao",     "Descrição")}
                        placeholder="Descreva sua experiência..."
                        /* textarea via className sobrescrito na renderização nativa */
                      />
                      <Input {...field("experienciaAnos", "Anos de experiência", { type: "number", min: 0 })}
                        placeholder="Ex.: 5" />
                    </>
                  )}

                  <div style={{ display: "flex", gap: 12 }}>
                    <Btn type="button" variant="secondary" fullWidth onClick={() => setStep(1)}>
                      Voltar
                    </Btn>
                    <Btn type="button" fullWidth onClick={handleStep2Next}>
                      Próximo
                    </Btn>
                  </div>
                </>
              )}

              {/* ── PASSO 3: Login e senha ── */}
              {step === 3 && (
                <>
                  {/* Campo login — sem icon prop ignorado */}
                  <Input {...field("login", "Login")} placeholder="Mínimo 4 caracteres" />

                  {/* Campo senha — ícone SVG Lock + toggle SVG Eye/EyeOff */}
                  <div className="wm-form-group">
                    <label className="wm-label">Senha</label>
                    <div className="wm-input-wrapper">
                      <span className="wm-input-icon" style={{ color: "var(--clr-text-light)" }}>
                        <IcoLock />
                      </span>
                      <input
                        name="senha"
                        type={showPass ? "text" : "password"}
                        value={form.senha || ""}
                        onChange={handleChange}
                        placeholder="Mínimo 6 caracteres"
                        className="wm-input wm-input--with-icon"
                        style={{ paddingRight: "var(--sp-10)" }}
                      />
                      {/* Toggle olho — SVG sem emoji */}
                      <button type="button" onClick={() => setShowPass(!showPass)}
                        aria-label={showPass ? "Ocultar senha" : "Mostrar senha"}
                        style={eyeBtnStyle}>
                        {showPass ? <IcoEyeOff /> : <IcoEye />}
                      </button>
                    </div>
                    {errors.senha && <span className="wm-field-error">{errors.senha}</span>}
                  </div>

                  <div style={{ display: "flex", gap: 12 }}>
                    <Btn type="button" variant="secondary" fullWidth onClick={() => setStep(2)}>
                      Voltar
                    </Btn>
                    <Btn type="submit" fullWidth size="lg" disabled={loading}>
                      {loading ? "Criando conta..." : "Criar Conta"}
                    </Btn>
                  </div>
                </>
              )}

            </form>
          )}

          {/* ── Link para login ── */}
          <p style={{ textAlign: "center", marginTop: "var(--sp-5)", fontSize: 14, color: "var(--clr-text-light)" }}>
            Já possui conta?{" "}
            <button onClick={() => navigate("/login")} style={{
              background: "none", border: "none",
              color: "var(--clr-blue)", fontWeight: 700,
              fontSize: 14, cursor: "pointer", fontFamily: "inherit",
            }}>
              Entrar
            </button>
          </p>

        </div>
      </div>

      <Toast {...toast} onClose={hideToast} />
    </div>
  );
}
