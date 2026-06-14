/**
 * WorkMatch — components/PageLayout.jsx
 * CEL Design System v3.0
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import MenuLateral from "./MenuLateral";

export default function PageLayout({
  title,
  subtitle,
  backPath,
  children,
  headerRight,
}) {
  const navigate = useNavigate();

  return (
    <div>
      {/* ── Topbar ── */}
      <header className="wm-topbar">

        {/* Botão voltar */}
        {backPath && (
          <button
            className="wm-topbar__back"
            onClick={() => navigate(backPath)}
            aria-label="Voltar"
          >
            ←
          </button>
        )}

        {/* Título */}
        <div className="wm-topbar__title-group">
          {title && <h1 className="wm-topbar__title">{title}</h1>}
          {subtitle && (
            <p className="wm-topbar__subtitle">{subtitle}</p>
          )}
        </div>

        {/* Lado direito */}
        {headerRight ? (
          <div style={{ flexShrink: 0 }}>
            {headerRight}
          </div>
        ) : null}

      </header>

      {/* Menu lateral */}
      <MenuLateral />

      {/* Conteúdo */}
      <main className="wm-main wm-animate-page">
        <div className="wm-container">{children}</div>
      </main>
    </div>
  );
}