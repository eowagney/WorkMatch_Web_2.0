import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlano } from "../hooks/usePlano";

const CHAVE = "wm-aviso-planos-fechado";

/**
 * Aviso "planos em breve". Só aparece com os planos DESLIGADOS.
 * Quando o interruptor for ligado no backend, some sozinho.
 */
export default function AvisoPlanos({ dismissivel = false, comLink = false }) {
  const navigate = useNavigate();
  const { carregando, ativo } = usePlano();

  const [oculto, setOculto] = useState(() => {
    try { return dismissivel && localStorage.getItem(CHAVE) === "1"; }
    catch { return false; }
  });

  if (carregando || ativo || oculto) return null;

  function fechar() {
    setOculto(true);
    try { localStorage.setItem(CHAVE, "1"); } catch { /* sem storage, tudo bem */ }
  }

  return (
    <div
      role="note"
      style={{
        background:   "rgba(242, 201, 76, 0.15)",
        border:       "1px solid rgba(242, 201, 76, 0.55)",
        borderRadius: "var(--r-md)",
        padding:      "var(--sp-4)",
        marginBottom: "var(--sp-5)",
        display:      "flex",
        gap:          "var(--sp-4)",
        alignItems:   "flex-start",
        justifyContent: "space-between",
      }}
    >
      <div style={{ fontSize: 13, lineHeight: 1.6, color: "var(--clr-text-mid)" }}>
        <strong style={{ color: "var(--clr-navy)" }}>Planos chegando em breve.</strong>{" "}
        Por enquanto o acesso é livre. Em breve: <strong>Básico</strong> (grátis, 2 contratações
        por mês), <strong>Plus</strong> (R$ 50/mês, ilimitado) e <strong>Premium</strong> (R$ 100/mês,
        ilimitado + relatórios). Vá se organizando!
        {comLink && (
          <>
            {" "}
            <button
              type="button"
              onClick={() => navigate("/planos")}
              style={{
                background: "none", border: "none", padding: 0, cursor: "pointer",
                color: "var(--clr-blue)", fontWeight: 700, fontFamily: "inherit", fontSize: 13,
              }}
            >
              Ver planos
            </button>
          </>
        )}
      </div>

      {dismissivel && (
        <button
          type="button"
          onClick={fechar}
          aria-label="Fechar aviso"
          style={{
            background: "none", border: "none", cursor: "pointer", fontSize: 18,
            lineHeight: 1, color: "var(--clr-text-light)", padding: 2,
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}