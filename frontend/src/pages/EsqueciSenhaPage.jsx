/**
 * WorkMatch — pages/EsqueciSenhaPage.jsx
 * CEL Design System v3.0
 *
 * Tela 1 do fluxo de recuperação de senha.
 * O cliente/profissional informa CPF + data de nascimento.
 * Se os dados baterem com algum cadastro (usuarios ou profissionais),
 * o backend devolve um "resetToken" de curta duração, que é passado
 * (via state da navegação) para a tela RedefinirSenhaPage.
 *
 * ENDPOINT QUE O BACKEND PRECISA EXPOR (ainda não existe):
 *   POST /api/auth/esqueci-senha/verificar
 *   body: { cpf: "00000000000", dataNascimento: "2000-01-01" }
 *   200 -> { resetToken: "..." }
 *   404 -> { message: "CPF ou data de nascimento não encontrados." }
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import api          from "../services/api";
import { Btn }       from "../components/ui";
import Toast         from "../components/Toast";
import { useToast }  from "../hooks/useToast";

/* ── Ícones SVG inline (mesmo padrão do LoginPage) ── */

const IcoIdCard = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <rect width="20" height="14" x="2" y="5" rx="2" />
    <circle cx="8" cy="12" r="2" />
    <path d="M14 10h6M14 14h4" />
  </svg>
);

const IcoCalendar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18M8 2v4M16 2v4" />
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

/* CPF: 000.000.000-00 */
function fmtCpf(v) {
  v = v.replace(/\D/g, "").slice(0, 11);
  return v.replace(
    /(\d{3})(\d{3})(\d{3})(\d{0,2})/,
    (_, a, b, c, d) =>
      d ? `${a}.${b}.${c}-${d}` : c ? `${a}.${b}.${c}` : b ? `${a}.${b}` : a
  );
}

export default function EsqueciSenhaPage() {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();

  const [form, setForm]       = useState({ cpf: "", dataNascimento: "" });
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "cpf" ? fmtCpf(value) : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const cpfLimpo = form.cpf.replace(/\D/g, "");

    if (cpfLimpo.length !== 11 || !form.dataNascimento) {
      showToast("Preencha CPF e data de nascimento corretamente.", "warning");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/api/auth/esqueci-senha/verificar", {
        cpf: cpfLimpo,
        dataNascimento: form.dataNascimento,
      });

      showToast("Dados confirmados! Agora crie sua nova senha.", "success");
      setTimeout(() => {
        navigate("/redefinir-senha", { state: { resetToken: data.resetToken } });
      }, 600);

    } catch (err) {
      const msg =
        err.response?.status === 404
          ? "CPF ou data de nascimento não encontrados."
          : "Erro ao verificar os dados. Tente novamente.";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  }

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
            Esqueceu sua <em style={{ color: "var(--clr-yellow)" }}>senha?</em>
          </h2>
          <p style={{ fontSize: 16, opacity: 0.72, lineHeight: 1.7 }}>
            Sem problema. Confirme seus dados e crie uma senha nova em poucos passos.
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

          <h1 className="wm-auth__heading">Esqueci minha senha</h1>
          <p className="wm-auth__sub">Informe seu CPF e data de nascimento para continuar</p>

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}
            noValidate
          >
            <div className="wm-form-group">
              <label className="wm-label" htmlFor="cpf-field">CPF</label>
              <div className="wm-input-wrapper">
                <span className="wm-input-icon" style={{ color: "var(--clr-text-light)" }}>
                  <IcoIdCard />
                </span>
                <input
                  id="cpf-field"
                  name="cpf"
                  type="text"
                  inputMode="numeric"
                  value={form.cpf}
                  onChange={handleChange}
                  placeholder="000.000.000-00"
                  required
                  className="wm-input wm-input--with-icon"
                />
              </div>
            </div>

            <div className="wm-form-group">
              <label className="wm-label" htmlFor="data-field">Data de nascimento</label>
              <div className="wm-input-wrapper">
                <span className="wm-input-icon" style={{ color: "var(--clr-text-light)" }}>
                  <IcoCalendar />
                </span>
                <input
                  id="data-field"
                  name="dataNascimento"
                  type="date"
                  value={form.dataNascimento}
                  onChange={handleChange}
                  required
                  className="wm-input wm-input--with-icon"
                />
              </div>
            </div>

            <Btn type="submit" fullWidth disabled={loading} style={{ marginTop: "var(--sp-2)" }}>
              {loading ? "Verificando..." : "Continuar"}
            </Btn>
          </form>

          <p style={{ textAlign: "center", marginTop: "var(--sp-5)", fontSize: 14, color: "var(--clr-text-mid)" }}>
            Lembrou a senha?{" "}
            <button
              onClick={() => navigate("/login")}
              style={{
                background: "none", border: "none", color: "var(--clr-blue)",
                fontWeight: 700, cursor: "pointer", fontSize: 14, fontFamily: "inherit",
              }}
            >
              Entrar
            </button>
          </p>

        </div>
      </div>

      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={hideToast} />
    </div>
  );
}
