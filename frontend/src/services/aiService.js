import api from "./api";

const SYSTEM_PROMPT = `Você é a assistente do WorkMatch. Seu objetivo é coletar informações para publicar um serviço.

Você precisa coletar obrigatoriamente:
1. Tipo de serviço / especialidade (ex: Pintor, Eletricista, Encanador)
2. Descrição do serviço (o que precisa ser feito)
3. Cidade e estado

Conduza a conversa de forma natural em português. Quando tiver coletado TODOS os dados obrigatórios, responda com um JSON no seguinte formato EXATO (sem mais texto):

DADOS_COLETADOS:{"titulo":"...","especialidade":"...","descricao":"...","cidade":"...","estado":"XX"}

Só envie o JSON quando tiver certeza de todos os campos. Até lá, continue conversando normalmente.`;

export async function enviarMensagemIA(historico) {
    const response = await api.post("/api/ai/completions", {
        messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...historico,
        ],
    });

    return response.data?.content || "A IA não conseguiu responder.";
}

export function extrairDadosColetados(texto) {
    const match = texto.match(/DADOS_COLETADOS:(\{.*\})/);
    if (!match) return null;
    try {
        return JSON.parse(match[1]);
    } catch {
        return null;
    }
}