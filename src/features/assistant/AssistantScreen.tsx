import { useEffect, useRef, useState } from 'react'
import { ArrowUp, RotateCcw, Sparkles } from 'lucide-react'
import { askAssistant, type ChatMessage } from '@/services/ai/client'
import { topInsight } from '@/services/ai/mock'
import { useStore } from '@/store'
import { uid } from '@/lib/format'
import { cx, IconButton } from '@/components/ui'
import { ScreenHeader } from '@/components/layout/AppChrome'
import { maskMoneyText } from '@/hooks/useMoney'

const SUGGESTIONS = ['Quanto gastei com delivery?', 'Como guardo mais para a viagem?', 'Quanto ainda posso gastar?', 'Quanto pago de assinaturas?']

interface Msg extends ChatMessage { id: string; error?: boolean }

/** Assistente (estágio 2): uma tela de chat. Usuário em lima, resposta como insight em gradiente. */
export default function AssistantScreen() {
  const { state, dispatch } = useStore()
  // a conversa fica salva por usuário (state.chat); erros não são salvos
  const [msgs, setMsgs] = useState<Msg[]>(() => state.chat.map(({ id, role, content }) => ({ id, role, content })))
  const [text, setText] = useState('')
  const [waiting, setWaiting] = useState(false)
  const [streaming, setStreaming] = useState<{ id: string; shown: number } | null>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const abort = useRef<AbortController | null>(null)
  const insight = topInsight(state)

  useEffect(() => () => abort.current?.abort(), [])
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }) }, [msgs, waiting, streaming?.shown])

  // efeito de streaming: revela a resposta aos poucos
  useEffect(() => {
    if (!streaming) return
    const m = msgs.find((x) => x.id === streaming.id)
    if (!m || streaming.shown >= m.content.length) { setStreaming(null); return }
    const t = setTimeout(() => setStreaming({ id: streaming.id, shown: streaming.shown + 3 }), 14)
    return () => clearTimeout(t)
  }, [streaming, msgs])

  const send = async (q: string) => {
    const question = q.trim()
    if (!question || waiting) return
    const user: Msg = { id: uid(), role: 'user', content: question }
    dispatch({ type: 'chatAdd', entry: { id: user.id, role: 'user', content: question, createdAt: new Date().toISOString() } })
    const history = [...msgs, user]
    setMsgs(history); setText(''); setWaiting(true)
    abort.current = new AbortController()
    try {
      const reply = await askAssistant(history.map(({ role, content }) => ({ role, content })), state, abort.current.signal)
      const id = uid()
      setMsgs((m) => [...m, { id, role: 'assistant', content: reply }])
      dispatch({ type: 'chatAdd', entry: { id, role: 'assistant', content: reply, createdAt: new Date().toISOString() } })
      setStreaming({ id, shown: 0 })
    } catch (e) {
      if ((e as Error).name !== 'AbortError') setMsgs((m) => [...m, { id: uid(), role: 'assistant', content: (e as Error).message && !/fetch|network/i.test((e as Error).message) ? (e as Error).message : 'Não consegui responder agora. Tente de novo em instantes.', error: true }])
    } finally {
      setWaiting(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-[760px] flex-col">
      <ScreenHeader
        kicker="Assistente Gamora"
        title="Pergunte sobre seu dinheiro"
        action={msgs.length > 0 && <IconButton label="Nova conversa" onClick={() => { abort.current?.abort(); setMsgs([]); setWaiting(false); setStreaming(null); dispatch({ type: 'chatClear' }) }}><RotateCcw size={18} /></IconButton>}
      />

      <div className="flex-1 space-y-4 pb-40 lg:pb-36" aria-live="polite">
        {msgs.length === 0 && (
          <>
            {insight && (
              <div className="rounded-hero bg-hero p-6 text-gm-on">
                <p className="kicker opacity-60">{insight.context}</p>
                <p className="mt-2 text-[32px] font-bold leading-none num">{maskMoneyText(insight.number, state.hideBalance)}</p>
                <p className="mt-2 text-[15px] font-medium opacity-80">{maskMoneyText(insight.consequence, state.hideBalance)}</p>
              </div>
            )}
            <p className="pt-2 text-[14px] text-gm-secondary">Respondo com os números que estão no app. Experimente:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)} className="cursor-pointer rounded-full border border-gm-track px-4 py-2.5 text-[14px] text-gm-text-2 transition hover:border-gm-accent hover:text-gm-accent">{s}</button>
              ))}
            </div>
          </>
        )}

        {msgs.map((m) => {
          const visible = streaming?.id === m.id ? m.content.slice(0, streaming.shown) : m.content
          return m.role === 'user' ? (
            <div key={m.id} className="flex justify-end">
              <p className="max-w-[80%] rounded-[22px] rounded-br-[8px] bg-gm-primary px-5 py-3 text-[15px] font-medium text-gm-on-primary">{m.content}</p>
            </div>
          ) : (
            <div key={m.id} className="flex gap-3">
              <span className="mt-1 grid size-8 shrink-0 place-items-center rounded-full bg-gm-lilac text-gm-on-primary"><Sparkles size={15} /></span>
              <p className={cx('max-w-[85%] rounded-[22px] rounded-tl-[8px] px-5 py-4 text-[15px] font-medium leading-relaxed', m.error ? 'border border-gm-track bg-gm-surface text-gm-secondary' : 'bg-hero text-gm-on')}>
                {visible}{streaming?.id === m.id && <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-gm-on/60 align-middle" />}
              </p>
            </div>
          )
        })}

        {waiting && (
          <div className="flex gap-3" aria-label="O assistente está pensando">
            <span className="mt-1 grid size-8 shrink-0 place-items-center rounded-full bg-gm-lilac text-gm-on"><Sparkles size={15} /></span>
            <span className="flex items-center gap-1.5 rounded-[22px] rounded-tl-[8px] bg-gm-surface px-5 py-4">
              {[0, 1, 2].map((i) => <span key={i} className="size-2 animate-bounce rounded-full bg-gm-lilac" style={{ animationDelay: `${i * 0.15}s` }} />)}
            </span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); send(text) }}
        className="fixed inset-x-0 bottom-0 z-40 border-t border-gm-border bg-gm-bg/95 px-5 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl"
      >
        <div className="mx-auto flex max-w-[760px] items-center gap-2 rounded-full border border-gm-track bg-gm-surface p-1.5 pl-5 focus-within:border-gm-accent">
          <input
            id="assistant-input" aria-label="Sua pergunta" value={text} onChange={(e) => setText(e.target.value)} maxLength={300}
            placeholder="Pergunte sobre seu dinheiro" className="h-11 min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-gm-muted"
          />
          <button type="submit" disabled={!text.trim() || waiting} aria-label="Enviar" className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full bg-gm-primary text-gm-on-primary transition disabled:opacity-30">
            <ArrowUp size={20} strokeWidth={2.5} />
          </button>
        </div>
      </form>
    </div>
  )
}
