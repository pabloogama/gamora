/**
 * Implementação futura de `DataApi` (src/services/api/contracts.ts) sobre o Supabase.
 * Os mapeadores domínio ⇄ linha já existem em src/services/api/mappers.ts e
 * os tipos das linhas em src/types/database.ts. Mapa completo: docs/CRUD.md.
 *
 *   State.transactions → public.transactions        (CRUD)
 *   State.cards        → public.cards               (CRUD)
 *   State.goals        → public.goals + view goal_progress (CRUD)
 *   State.deposits     → public.goal_deposits       (CRUD)
 *   State.budgets      → public.budgets             (CRUD, upsert por categoria)
 *   State.imports      → public.invoice_imports     (RPC import_invoice / undo_invoice_import)
 *   State.chat         → public.assistant_messages  (criar, ver, limpar)
 *   monthCap, hideBalance, baseBalance, user → public.profiles + auth.users
 *
 * Exemplo do padrão (cartões):
 *
 *   cards: {
 *     list:   async () => (await supabase.from('cards').select('*').order('created_at')).data!.map(cardFromRow),
 *     get:    async (id) => { const { data } = await supabase.from('cards').select('*').eq('id', id).maybeSingle(); return data && cardFromRow(data) },
 *     create: async (c) => cardFromRow((await supabase.from('cards').insert(cardToRow(c)).select().single()).data!),
 *     update: async (id, p) => cardFromRow((await supabase.from('cards').update(cardToRow({ ...current, ...p })).eq('id', id).select().single()).data!),
 *     remove: async (id) => { await supabase.from('cards').delete().eq('id', id) },
 *   }
 */
export {}
