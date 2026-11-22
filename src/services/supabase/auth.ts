/**
 * Autenticação real (Supabase Auth) — mesmo contrato do localAuth.
 *
 *   signIn         → auth.signInWithPassword + profile
 *   signUp         → auth.signUp (nome e saldo inicial vão em options.data; o trigger cria o profile)
 *   currentSession → auth.getSession (sessão salva e renovada pelo supabase-js)
 *   updateProfile  → profiles (nome, foto) + Storage avatars/<uid>/ + auth.updateUser({ email })
 *   changePassword → confere a senha atual + auth.updateUser({ password })
 *   deleteAccount  → confere a senha + apaga arquivos do Storage + RPC delete_my_account (cascata)
 */
import type { User } from '@/types/finance'
import { AuthError, AuthNotice, type AuthService } from '../auth-types'
import { currentUserId, publicUrl, sb } from './client'

const norm = (e: string) => e.trim().toLowerCase()

function translate(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('invalid login credentials')) return 'E-mail ou senha incorretos.'
  if (m.includes('email not confirmed')) return 'Confirme seu e-mail pelo link que enviamos antes de entrar.'
  if (m.includes('already registered') || m.includes('already been registered')) return 'Este e-mail já tem uma conta. Entre com ele.'
  if (m.includes('should be different')) return 'Use uma senha diferente da atual.'
  if (m.includes('password should be at least') || m.includes('weak password')) return 'Senha fraca. Use pelo menos 6 caracteres.'
  if (m.includes('rate limit') || m.includes('too many')) return 'Muitas tentativas. Espere um pouco e tente de novo.'
  if (m.includes('invalid') && m.includes('email')) return 'Digite um e-mail válido.'
  if (m.includes('failed to fetch') || m.includes('network')) return 'Sem conexão com o servidor. Confira sua internet.'
  return 'Não foi possível concluir agora. Tente de novo.'
}

async function profileUser(id: string, email: string): Promise<User> {
  const { data, error } = await sb().from('profiles').select('name, avatar_url').eq('id', id).single()
  if (error || !data) throw new AuthError('Não encontramos o perfil desta conta.')
  return { name: data.name, email, avatar: data.avatar_url ?? undefined }
}

async function confirmPassword(email: string, password: string, wrong: string) {
  const { error } = await sb().auth.signInWithPassword({ email: norm(email), password })
  if (error) throw new AuthError(error.message.toLowerCase().includes('invalid login') ? wrong : translate(error.message))
}

async function removeFolder(bucket: string, uid: string) {
  const { data } = await sb().storage.from(bucket).list(uid, { limit: 1000 })
  if (data?.length) await sb().storage.from(bucket).remove(data.map((f) => `${uid}/${f.name}`))
}

export const supabaseAuth: AuthService = {
  async signIn(email, password) {
    const { data, error } = await sb().auth.signInWithPassword({ email: norm(email), password })
    if (error || !data.user) throw new AuthError(translate(error?.message ?? ''))
    return profileUser(data.user.id, data.user.email ?? norm(email))
  },

  async signUp(name, email, password, startingBalance = 0) {
    const { data, error } = await sb().auth.signUp({
      email: norm(email),
      password,
      options: { data: { name: name.trim(), starting_balance: startingBalance }, emailRedirectTo: window.location.origin },
    })
    if (error) throw new AuthError(translate(error.message))
    // com confirmação de e-mail ligada, um e-mail já cadastrado volta sem identidades
    if (data.user && data.user.identities?.length === 0) throw new AuthError('Este e-mail já tem uma conta. Entre com ele.')
    if (!data.session || !data.user) throw new AuthNotice(`Conta criada! Enviamos um link para ${norm(email)}. Confirme e depois entre.`)
    return profileUser(data.user.id, data.user.email ?? norm(email))
  },

  async signOut() {
    await sb().auth.signOut({ scope: 'local' })
  },

  async currentSession() {
    const { data } = await sb().auth.getSession()
    const u = data.session?.user
    if (!u) return null
    try {
      return await profileUser(u.id, u.email ?? '')
    } catch {
      await sb().auth.signOut({ scope: 'local' }) // conta apagada em outro aparelho
      return null
    }
  },

  async updateProfile(currentEmail, next) {
    const uid = await currentUserId()
    let avatar = next.avatar
    if (avatar?.startsWith('data:')) {
      const blob = await (await fetch(avatar)).blob()
      const ext = blob.type === 'image/webp' ? 'webp' : blob.type === 'image/png' ? 'png' : 'jpg'
      // um arquivo por pessoa; apaga versões com outra extensão
      await removeFolder('avatars', uid)
      const path = `${uid}/avatar.${ext}`
      const { error } = await sb().storage.from('avatars').upload(path, blob, { upsert: true, contentType: blob.type, cacheControl: '3600' })
      if (error) throw new AuthError('Não foi possível enviar a foto. Tente outra imagem.')
      avatar = publicUrl('avatars', path)
    } else if (!avatar) {
      await removeFolder('avatars', uid)
    }

    const { error } = await sb().from('profiles').update({ name: next.name.trim(), avatar_url: avatar ?? null }).eq('id', uid)
    if (error) throw new AuthError(translate(error.message))

    let pendingEmail: string | undefined
    if (norm(next.email) !== norm(currentEmail)) {
      const { error: e } = await sb().auth.updateUser({ email: norm(next.email) }, { emailRedirectTo: window.location.origin })
      if (e) throw new AuthError(translate(e.message))
      pendingEmail = norm(next.email)
    }
    // o e-mail só muda depois que a pessoa confirma o link
    return { name: next.name.trim(), email: norm(currentEmail), avatar, pendingEmail }
  },

  async changePassword(email, current, next) {
    if (next.length < 6) throw new AuthError('A nova senha precisa de pelo menos 6 caracteres.')
    await confirmPassword(email, current, 'A senha atual não confere.')
    const { error } = await sb().auth.updateUser({ password: next })
    if (error) throw new AuthError(translate(error.message))
  },

  async deleteAccount(email, password) {
    await confirmPassword(email, password, 'Senha incorreta.')
    const uid = await currentUserId()
    await Promise.all([removeFolder('avatars', uid), removeFolder('invoices', uid)])
    const { error } = await sb().rpc('delete_my_account')
    if (error) throw new AuthError(translate(error.message))
    await sb().auth.signOut({ scope: 'local' })
  },
}
