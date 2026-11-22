/**
 * Implementação futura de FinanceRepository sobre o Supabase.
 * Mapa de tabelas (ver supabase/migrations/0001_init.sql):
 *
 *   State.transactions → public.transactions
 *   State.cards        → public.cards
 *   State.goals        → public.goals (+ public.goal_deposits)
 *   State.budgets      → public.budgets
 *   monthCap, hideBalance, baseBalance → public.profiles
 *
 * Login simples (e-mail + senha): supabase.auth.signInWithPassword
 * Sair: supabase.auth.signOut
 */
export {}
