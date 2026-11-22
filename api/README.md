# /api — rotas de servidor (Vercel Functions, runtime Node)

Tudo que precisa de **segredo** mora aqui. O navegador chama `/api/*`, **nunca** a OpenAI direto.

| Rota | O que faz |
|---|---|
| `POST /api/assistant` | Assistente. Corpo `{ messages }`. O contexto financeiro é lido do banco **no servidor**, com o login da pessoa (o RLS vale). Responde `{ reply }`. |
| `POST /api/invoice` | Leitura de fatura. `multipart/form-data` com `file` (PDF, JPG, PNG ou WEBP; até 4 MB). Responde `{ items, total }` para a pessoa revisar antes de confirmar. |

**Proteções:**

- **Login obrigatório.** As duas rotas exigem `Authorization: Bearer <access_token do Supabase>` e devolvem 401 sem login. Ninguém gasta a sua chave chamando a rota direto.
- **Resposta da fatura validada.** Ela vem num JSON com formato fixo (`json_schema` com `strict`) e ainda é normalizada no servidor:
  - categorias válidas;
  - datas no formato certo;
  - valores maiores que zero (estornos saem);
  - total recalculado.
- **Erros da OpenAI viram mensagens em português.** Chave recusada → 502, sem cota → 429, sem chave → 503.
- `_lib/` é código compartilhado. Arquivos e pastas com `_` não viram rota.

## Variáveis (Vercel → Settings → Environment Variables)

| Variável | Valor |
|---|---|
| `OPENAI_API_KEY` | a chave secreta da OpenAI (**sem** `VITE_`) |
| `OPENAI_MODEL` | opcional, padrão `gpt-4o-mini` (assistente) |
| `OPENAI_VISION_MODEL` | opcional, padrão `gpt-4o-mini` (fatura) |
| `VITE_FEATURE_AI` | `true` liga a IA no app (precisa de Redeploy). `false` volta às respostas simuladas |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | já cadastradas. As funções usam essas mesmas para conferir o login |

"Testar com um exemplo", na tela de Fatura, usa sempre a leitura simulada, porque o arquivo de exemplo não é uma fatura de verdade.

## Testes

`tests/api/routes.test.mjs` testa as duas rotas com o Supabase real e uma OpenAI **falsa** local (24 verificações; não gasta créditos). As instruções estão no topo do arquivo.
