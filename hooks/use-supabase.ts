import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import type {
  Modelo,
  ModeloPeticao,
  Documento,
  User,
  Atividade,
  WordSync,
  DashboardMetrics,
} from "@/lib/types"

// ─── Generic fetch hook ───────────────────────────────────────

function useSupabaseQuery<T>(
  fetcher: () => Promise<{ data: T | null; error: unknown }>,
  deps: unknown[] = []
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetcher()
      if (result.error) {
        setError((result.error as Error).message ?? "Erro ao carregar dados")
      } else {
        setData(result.data)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro de conexao")
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    refetch()
  }, [refetch])

  return { data, loading, error, refetch, setData }
}

// ─── Realtime subscription hook ───────────────────────────────

function useRealtimeSubscription<T>(
  table: string,
  setData: (updater: (prev: T[] | null) => T[] | null) => void
) {
  useEffect(() => {
    const channel = supabase
      .channel(`realtime-${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setData((prev) => prev ? [...prev, payload.new as T] : [payload.new as T])
        } else if (payload.eventType === 'UPDATE') {
          setData((prev) => prev ? prev.map(item =>
            (item as any).id === payload.new.id ? payload.new as T : item
          ) : prev)
        } else if (payload.eventType === 'DELETE') {
          setData((prev) => prev ? prev.filter(item =>
            (item as any).id !== payload.old.id
          ) : prev)
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, setData])
}

// ─── Dashboard Metrics ────────────────────────────────────────

export function useDashboardMetrics() {
  return useSupabaseQuery<DashboardMetrics>(async () => {
    const now = new Date()
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const [modelosRes, modeloPeticaoRes, usuariosRes, documentosMesRes] = await Promise.all([
      supabase.from("modelos").select("id", { count: "exact", head: true }),
      supabase.from("ModeloPeticao").select("id", { count: "exact", head: true }).eq("ativo", true),
      supabase.from("users").select("id", { count: "exact", head: true }).eq("status", "ativo"),
      supabase.from("documentos").select("id", { count: "exact", head: true }).gte("created_at", firstOfMonth),
    ])

    // Conta modelos de ambas as tabelas
    const totalModelos = (modelosRes.count ?? 0) + (modeloPeticaoRes.count ?? 0)
    const usuariosAtivos = usuariosRes.count ?? 0
    const documentosMes = documentosMesRes.count ?? 0

    // Soma blocos_count dos modelos internos
    const blocosRes = await supabase.from("modelos").select("blocos_count")
    const totalBlocos = (blocosRes.data ?? []).reduce((sum, m) => sum + (m.blocos_count ?? 0), 0)

    return {
      data: {
        total_modelos: totalModelos,
        total_blocos: totalBlocos,
        usuarios_ativos: usuariosAtivos,
        documentos_mes: documentosMes,
      },
      error: null,
    }
  })
}

// ─── Atividades (recentes) ────────────────────────────────────

export function useAtividades(limit?: number) {
  const result = useSupabaseQuery<Atividade[]>(async () => {
    let query = supabase
      .from("atividades")
      .select("*")
      .order("created_at", { ascending: false })

    if (limit) query = query.limit(limit)

    return query
  })

  useRealtimeSubscription<Atividade>("atividades", result.setData)

  return result
}

// ─── Word Syncs ───────────────────────────────────────────────

export function useWordSyncs(limit?: number) {
  const result = useSupabaseQuery<WordSync[]>(async () => {
    let query = supabase
      .from("word_syncs")
      .select("*")
      .order("created_at", { ascending: false })

    if (limit) query = query.limit(limit)

    return query
  })

  useRealtimeSubscription<WordSync>("word_syncs", result.setData)

  return result
}

// ─── Modelos de Peticao (Extensao Word) ───────────────────────

export function useModelosPeticao() {
  return useSupabaseQuery<ModeloPeticao[]>(async () => {
    return supabase
      .from("ModeloPeticao")
      .select("id, nome, tipoBase, descricao, ativo, storage_path")
      .eq("ativo", true)
      .order("nome")
  })
}

export function useAllModelosPeticao() {
  const result = useSupabaseQuery<ModeloPeticao[]>(async () => {
    return supabase
      .from("ModeloPeticao")
      .select("id, nome, tipoBase, descricao, ativo, storage_path")
      .order("nome")
  })

  useRealtimeSubscription<ModeloPeticao>("ModeloPeticao", result.setData)

  return result
}

// ─── Modelos ──────────────────────────────────────────────────

export function useModelos() {
  return useSupabaseQuery<Modelo[]>(async () => {
    return supabase
      .from("modelos")
      .select("*")
      .order("updated_at", { ascending: false })
  })
}

export async function deleteModelo(id: string) {
  return supabase.from("modelos").delete().eq("id", id)
}

// ─── Documentos ───────────────────────────────────────────────

export function useDocumentos() {
  const result = useSupabaseQuery<Documento[]>(async () => {
    return supabase
      .from("documentos")
      .select("*")
      .order("updated_at", { ascending: false })
  })

  useRealtimeSubscription<Documento>("documentos", result.setData)

  return result
}

export async function deleteDocumento(id: string) {
  return supabase.from("documentos").delete().eq("id", id)
}

// ─── Usuarios ─────────────────────────────────────────────────

export function useUsuarios() {
  const result = useSupabaseQuery<User[]>(async () => {
    return supabase
      .from("users")
      .select("*")
      .order("nome")
  })

  useRealtimeSubscription<User>("users", result.setData)

  return result
}

export async function createUsuario(data: {
  nome: string
  email: string
  role: string
}) {
  return supabase.from("users").insert({
    ...data,
    status: "ativo",
    word_conectado: false,
  }).select().single()
}

export async function updateUsuario(id: string, data: Partial<User>) {
  return supabase.from("users").update(data).eq("id", id).select().single()
}

// ─── Sync helper ──────────────────────────────────────────────

export async function createWordSync(userId: string, documentosCount: number) {
  return supabase.from("word_syncs").insert({
    user_id: userId,
    documentos_count: documentosCount,
    status: "sucesso",
  }).select().single()
}
