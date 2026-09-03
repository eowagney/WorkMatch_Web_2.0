import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

import { AuthContext }  from "../context/AuthContext";
import { authService }  from "../services/api";
import { Btn }          from "../components/ui";
import Toast            from "../components/Toast";
import { useToast }     from "../hooks/useToast";

/* =========================================================
   ÍCONES SVG — inline, Lucide-style
========================================================= */

const IcoUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <circle cx="12" cy="8" r="4"/>
    <path d="M20 21a8 8 0 1 0-16 0"/>
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

/* Logo-mark WorkMatch — padrão CEL (amarelo + blue) */
const LogoMarkLarge = () => (
  <svg width="72" height="72" viewBox="0 0 72 72" fill="none"
    xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect width="72" height="72" rx="20" fill="#F2C94C" fillOpacity="0.15"/>
    {/* Chave inglesa WorkMatch */}
    <path
      d="M50 24a13 13 0 0 0-12.5 16.6L19.5 58.8a4 4 0 1 0 5.66 5.66l18.1-18.1A13 13 0 1 0 50 24z"
      fill="#F2C94C" fillOpacity="0.9"
    />
    <circle cx="50" cy="37" r="6" fill="#1E5FAF"/>
    {/* Porca da chave */}
    <path
      d="M22.5 58a3 3 0 1 1-4.5-3.9"
      stroke="#1E5FAF" strokeWidth="2.5" strokeLinecap="round"
    />
  </svg>
);

/* =========================================================
   COMPONENTE
========================================================= */

export default function LoginPage() {
  const navigate           = useNavigate();
  const { login }          = useContext(AuthContext);
  const { toast, showToast, hideToast } = useToast();

  const [form, setForm]     = useState({ login: "", senha: "" });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  /* ── Lógica preservada integralmente ── */

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.login || !form.senha) {
      showToast("Preencha todos os campos.", "warning");
      return;
    }

    setLoading(true);

    try {
      const data = await authService.login({ login: form.login, senha: form.senha });

      localStorage.setItem("user", JSON.stringify(data));
      login(data);

      /* Emoji 👋 removido do texto — padrão CEL */
      showToast(`Bem-vindo, ${data.nome}!`, "success");

      setTimeout(() => { navigate("/home"); }, 800);

    } catch (err) {
      const mensagem =
        err.response?.status === 401
          ? "Login ou senha inválidos."
          : "Erro ao conectar ao servidor.";

      showToast(mensagem, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="wm-auth">

      {/* ── Painel esquerdo — navy + gradiente radial CEL ── */}
      <div className="wm-auth__panel-left">
        <div style={{
          position:  "relative",
          zIndex:    1,
          textAlign: "center",
          color:     "#fff",
          maxWidth:  380,
        }}>

          {/* Logo-mark SVG — sem emoji 🔧 */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "var(--sp-6)" }}>
            <LogoMarkLarge />
          </div>

          <h2 style={{
            fontFamily:    "var(--font-display)",
            fontSize:      "clamp(28px, 4vw, 38px)",
            marginBottom:  "var(--sp-4)",
            lineHeight:    1.15,
            fontWeight:    400,
          }}>
            Bem-vindo ao{" "}
            <em style={{ color: "var(--clr-yellow)" }}>WorkMatch</em>
          </h2>

          <p style={{ fontSize: 16, opacity: 0.72, lineHeight: 1.7 }}>
            Encontre o profissional certo para cada serviço — com facilidade e segurança.
          </p>

          {/* Indicadores visuais CEL */}
          <div style={{
            display:        "flex",
            gap:            "var(--sp-4)",
            justifyContent: "center",
            marginTop:      "var(--sp-8)",
            flexWrap:       "wrap",
          }}>
            {[
              "Profissionais verificados",
              "Negociação direta",
              "Sem intermediários",
            ].map((item) => (
              <span
                key={item}
                style={{
                  padding:      "var(--sp-2) var(--sp-4)",
                  borderRadius: "var(--r-full)",
                  background:   "rgba(255,255,255,0.08)",
                  border:       "1px solid rgba(255,255,255,0.12)",
                  fontSize:     12,
                  fontWeight:   600,
                  color:        "rgba(255,255,255,0.75)",
                  letterSpacing:"0.02em",
                }}
              >
                {item}
              </span>
            ))}
          </div>

        </div>
      </div>

      {/* ── Painel direito — card de login CEL ── */}
      <div className="wm-auth__panel-right">

        {/* Logo texto — link para landing */}
        <span
          className="wm-auth__logo"
          onClick={() => navigate("/")}
          role="link"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && navigate("/")}
          aria-label="Ir para a página inicial"
        >
          Work<span>Match</span>
        </span>

        <div className="wm-auth__card">

          <h1 className="wm-auth__heading">Entrar</h1>
          <p className="wm-auth__sub">Faça login com sua conta</p>

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}
            noValidate
          >

            {/* ── Campo login — ícone SVG User (padrão CEL login-input) ── */}
            <div className="wm-form-group">
              <label className="wm-label" htmlFor="login-field">
                Login
              </label>
              <div className="wm-input-wrapper">
                <span className="wm-input-icon" style={{ color: "var(--clr-text-light)" }}>
                  <IcoUser />
                </span>
                <input
                  id="login-field"
                  name="login"
                  type="text"
                  value={form.login}
                  onChange={handleChange}
                  placeholder="Digite seu login"
                  autoComplete="username"
                  required
                  className="wm-input wm-input--with-icon"
                />
              </div>
            </div>

            {/* ── Campo senha — ícone Lock + toggle Eye/EyeOff ── */}
            <div className="wm-form-group">
              <label className="wm-label" htmlFor="senha-field">
                Senha
              </label>
              <div className="wm-input-wrapper">

                {/* Ícone cadeado — SVG */}
                <span className="wm-input-icon" style={{ color: "var(--clr-text-light)" }}>
                  <IcoLock />
                </span>

                <input
                  id="senha-field"
                  name="senha"
                  type={showPass ? "text" : "password"}
                  value={form.senha}
                  onChange={handleChange}
                  placeholder="Digite sua senha"
                  autoComplete="current-password"
                  required
                  className="wm-input wm-input--with-icon"
                  style={{ paddingRight: "var(--sp-10)" }}
                />

                {/* Toggle olho — SVG Eye / EyeOff (sem emoji) */}
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  aria-label={showPass ? "Ocultar senha" : "Mostrar senha"}
                  style={{
                    position:   "absolute",
                    right:      12,
                    top:        "50%",
                    transform:  "translateY(-50%)",
                    background: "none",
                    border:     "none",
                    cursor:     "pointer",
                    color:      "var(--clr-text-light)",
                    display:    "flex",
                    alignItems: "center",
                    padding:    4,
                    transition: "color var(--t-fast)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--clr-text-mid)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--clr-text-light)")}
                >
                  {showPass ? <IcoEyeOff /> : <IcoEye />}
                </button>

              </div>
            </div>
            <div style={{ textAlign: "right", marginTop: -4 }}>
              <button
                type="button"
                onClick={() => navigate("/esqueci-senha")}
                style={{
                  background: "none", border: "none", color: "var(--clr-blue)",
                  fontWeight: 600, cursor: "pointer", fontSize: 13, fontFamily: "inherit",
                }}
              >
                Esqueci minha senha
              </button>
            </div>
            {/* ── Botão entrar ── */}
            <Btn
              type="submit"
              fullWidth
              disabled={loading}
              style={{ marginTop: "var(--sp-2)" }}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Btn>

          </form>

          {/* ── Link para cadastro ── */}
          <p style={{
            textAlign:  "center",
            marginTop:  "var(--sp-5)",
            fontSize:   14,
            color:      "var(--clr-text-mid)",
          }}>
            Não tem conta?{" "}
            <button
              onClick={() => navigate("/cadastro")}
              style={{
                background: "none",
                border:     "none",
                color:      "var(--clr-blue)",
                fontWeight: 700,
                cursor:     "pointer",
                fontSize:   14,
                fontFamily: "inherit",
              }}
            >
              Cadastrar
            </button>
          </p>

        </div>
      </div>

      {/* ── Toast de feedback ── */}
      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />

    </div>
  );
}
