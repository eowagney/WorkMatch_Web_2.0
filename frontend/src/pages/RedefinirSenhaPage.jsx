/**
 * WorkMatch — pages/RedefinirSenhaPage.jsx
 * CEL Design System v3.0
 *
 * Tela 2 do fluxo de recuperação de senha.
 * Só pode ser acessada depois da EsqueciSenhaPage (precisa do
 * "resetToken" recebido via state da navegação). Se a pessoa cair
 * direto aqui sem token, é redirecionada de volta.
 *
 * ENDPOINT QUE O BACKEND PRECISA EXPOR (ainda não existe):
 *   POST /api/auth/esqueci-senha/redefinir
 *   body: { resetToken: "...", novaSenha: "..." }
 *   200 -> { message: "Senha redefinida com sucesso." }
 *   400/401 -> token inválido ou expirado
 */

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import api          from "../services/api";
import { Btn }       from "../components/ui";
import Toast         from "../components/Toast";
import { useToast }  from "../hooks/useToast";

/* ── Ícones SVG inline (mesmo padrão do LoginPage) ── */

const IcoLock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IcoEye = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IcoEyeOff = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
    <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
    <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
    <path d="m2 2 20 20" />
  </svg>
);

const LogoMarkLarge = () => (
  <svg width="72" height="72" viewBox="0 0 72 72" fill="none"
    xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect width="72" height="72" rx="20" fill="#F2C94C" fillOpacity="0.15" />
    <path
      d="M50 24a13 13 0 0 0-12.5 16.6L19.5 58.8a4 4 0 1 0 5.66 5.66l18.1-18.1A13 13 0 1 0 50 24z"
      fill="#F2C94C" fillOpacity="0.9"
    />
    <circle cx="50" cy="37" r="6" fill="#1E5FAF" />
    <path
      d="M22.5 58a3 3 0 1 1-4.5-3.9"
      stroke="#1E5FAF" strokeWidth="2.5" strokeLinecap="round"
    />
  </svg>
);

export default function RedefinirSenhaPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast, showToast, hideToast } = useToast();

  const resetToken = location.state?.resetToken;

  const [form, setForm]         = useState({ novaSenha: "", confirmarSenha: "" });
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  /* Sem token -> volta pra tela anterior */
  useEffect(() => {
    if (!resetToken) {
      navigate("/esqueci-senha", { replace: true });
    }
  }, [resetToken, navigate]);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (form.novaSenha.length < 6) {
      showToast("A senha precisa ter pelo menos 6 caracteres.", "warning");
      return;
    }
    if (form.novaSenha !== form.confirmarSenha) {
      showToast("As senhas não coincidem.", "warning");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/auth/esqueci-senha/redefinir", {
        resetToken,
        novaSenha: form.novaSenha,
      });

      showToast("Senha redefinida com sucesso!", "success");
      setTimeout(() => navigate("/login"), 1000);

    } catch (err) {
      const msg =
        err.response?.status === 401
          ? "Esse link expirou. Refaça o processo de recuperação."
          : "Erro ao redefinir a senha. Tente novamente.";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  }

  if (!resetToken) return null;

  return (
    <div className="wm-auth">

      {/* ── Painel esquerdo ── */}
      <div className="wm-auth__panel-left">
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", color: "#fff", maxWidth: 380 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "var(--sp-6)" }}>
            <LogoMarkLarge />
          </div>
          <h2 style={{
            fontFamily: "var(--font-display)", fontSize: "clamp(28px, 4vw, 38px)",
            marginBottom: "var(--sp-4)", lineHeight: 1.15, fontWeight: 400,
          }}>
            Quase lá! <em style={{ color: "var(--clr-yellow)" }}>Nova senha</em>
          </h2>
          <p style={{ fontSize: 16, opacity: 0.72, lineHeight: 1.7 }}>
            Escolha uma senha forte para manter sua conta protegida.
          </p>
        </div>
      </div>

      {/* ── Painel direito ── */}
      <div className="wm-auth__panel-right">
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

          <h1 className="wm-auth__heading">Redefinir senha</h1>
          <p className="wm-auth__sub">Crie uma nova senha para sua conta</p>

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}
            noValidate
          >
            <div className="wm-form-group">
              <label className="wm-label" htmlFor="nova-senha-field">Nova senha</label>
              <div className="wm-input-wrapper">
                <span className="wm-input-icon" style={{ color: "var(--clr-text-light)" }}>
                  <IcoLock />
                </span>
                <input
                  id="nova-senha-field"
                  name="novaSenha"
                  type={showPass ? "text" : "password"}
                  value={form.novaSenha}
                  onChange={handleChange}
                  placeholder="Mínimo de 6 caracteres"
                  autoComplete="new-password"
                  required
                  className="wm-input wm-input--with-icon"
                  style={{ paddingRight: "var(--sp-10)" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  aria-label={showPass ? "Ocultar senha" : "Mostrar senha"}
                  style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: "var(--clr-text-light)", display: "flex", alignItems: "center", padding: 4,
                  }}
                >
                  {showPass ? <IcoEyeOff /> : <IcoEye />}
                </button>
              </div>
            </div>

            <div className="wm-form-group">
              <label className="wm-label" htmlFor="confirmar-senha-field">Confirmar nova senha</label>
              <div className="wm-input-wrapper">
                <span className="wm-input-icon" style={{ color: "var(--clr-text-light)" }}>
                  <IcoLock />
                </span>
                <input
                  id="confirmar-senha-field"
                  name="confirmarSenha"
                  type={showPass ? "text" : "password"}
                  value={form.confirmarSenha}
                  onChange={handleChange}
                  placeholder="Digite a senha novamente"
                  autoComplete="new-password"
                  required
                  className="wm-input wm-input--with-icon"
                />
              </div>
            </div>

            <Btn type="submit" fullWidth disabled={loading} style={{ marginTop: "var(--sp-2)" }}>
              {loading ? "Salvando..." : "Salvar nova senha"}
            </Btn>
          </form>

        </div>
      </div>

      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={hideToast} />
    </div>
  );
}
