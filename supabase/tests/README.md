# Testes do schema

Rodam num Postgres 16 puro, sem precisar do Supabase. `_supabase_stub.sql` simula o mínimo: o schema `auth`, a função `auth.uid()`, o `storage` e o papel `authenticated`.

```bash
createdb gamora_test
psql -d gamora_test -v ON_ERROR_STOP=1 -f supabase/tests/_supabase_stub.sql
psql -d gamora_test -v ON_ERROR_STOP=1 -f supabase/migrations/0001_init.sql
psql -d gamora_test -tA -f supabase/tests/crud_rls.test.sql
```

O que é conferido:

- **C / R / U / D** em cartões, lançamentos, metas, depósitos, tetos e mensagens.
- **Views:** `goal_progress` (quanto a meta já tem) e `account_summary` (saldo).
- **Fatura:** um gasto no cartão soma na fatura; editar ou apagar o gasto desconta.
- **RPCs:** `import_invoice` e `undo_invoice_import`.
- **Isolamento entre contas:**
  - não dá para ver nem alterar dados de outra pessoa;
  - não dá para usar o cartão ou a meta de outra pessoa.
- **Cascatas:**
  - apagar um cartão mantém os gastos dele (o vínculo com o cartão fica vazio);
  - apagar uma meta apaga os depósitos, e o valor volta para o saldo;
  - excluir a conta apaga tudo.
