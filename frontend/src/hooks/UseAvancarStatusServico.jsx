import { useState } from "react";
import api from "../services/api";
import { useToast } from "./useToast";

export function useAvancarStatusServico() {
  const { showToast } = useToast();
  const [avancandoId, setAvancandoId] = useState(null);

  async function avancar(servicoId, profissionalId, {
    mensagemSucesso = "Status atualizado.",
    mensagemErroPadrao = "Erro ao avançar status.",
    onSucesso,
    variantSucesso = "sucesso",
    variantErro = "erro",
  } = {}) {
    setAvancandoId(profissionalId ?? servicoId);
    try {
      await api.patch(`/api/servicos/${servicoId}/avancar`, null, {
        params: { profissionalId },
      });
      showToast(mensagemSucesso, variantSucesso);
      await onSucesso?.();
      return true;
    } catch (err) {
      showToast(err.response?.data?.message ?? mensagemErroPadrao, variantErro);
      return false;
    } finally {
      setAvancandoId(null);
    }
  }

  return { avancar, avancandoId };
}