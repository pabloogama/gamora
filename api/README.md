# /api — rotas de servidor (Vercel Functions)

Tudo que precisa de **segredo** mora aqui: `OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
O navegador chama `/api/*`; nunca a OpenAI direto.

| Rota (futura)     | Estágio | Exemplo pronto                      |
|-------------------|---------|-------------------------------------|
| `POST /api/assistant` | 2   | `_examples/assistant.example.ts`    |
| `POST /api/invoice`   | 2   | `_examples/invoice.example.ts`      |

Arquivos e pastas começando com `_` **não** são publicados pela Vercel —
por isso os exemplos estão desligados. Para ativar, copie para `api/<nome>.ts`.
