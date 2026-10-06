import { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

/**
 * Estado dos planos para o front.
 * - ativo:      interruptor global (workmatch.planos.ativo no backend)
 * - plano:      BASICO | PLUS | PREMIUM (só para profissional logado)
 * - restantes:  contratações que ainda cabem no mês (null = ilimitado)
 * Se o backend ainda não tiver os endpoints, tudo cai no padrão "desligado".
 */
const PADRAO = {
  carregando:   false,
  ativo:        false,
  plano:        "BASICO",
  limiteMensal: null,
  usadosNoMes:  0,
  restantes:    null,
};

export function usePlano() {
  const { user } = useAuth();
  const [estado, setEstado] = useState({ ...PADRAO, carregando: true });

  useEffect(() => {
    let vivo = true;

    async function carregar() {
      try {
        const { data: cfg } = await api.get("/api/planos/config");
        let status = {};

        if (user?.role === "PROFISSIONAL" && user?.id) {
          const res = await api.get(`/api/planos/profissional/${user.id}`);
          status = res.data ?? {};
        }

        if (vivo) {
          setEstado({
            carregando:   false,
            ativo:        Boolean(cfg?.ativo),
            plano:        status.plano        ?? "BASICO",
            limiteMensal: status.limiteMensal ?? null,
            usadosNoMes:  status.usadosNoMes  ?? 0,
            restantes:    status.restantes    ?? null,
          });
        }
      } catch {
        if (vivo) setEstado(PADRAO);
      }
    }

    carregar();
    return () => { vivo = false; };
  }, [user?.id, user?.role]);

  return estado;
}