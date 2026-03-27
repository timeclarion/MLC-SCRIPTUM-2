"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/layout"
import { EmptyState } from "@/components/ui/empty-state"
import type { Atividade } from "@/lib/types"
import { useDashboardMetrics, useAtividades, useWordSyncs } from "@/hooks/use-supabase"
import {
  FileText,
  Blocks,
  Users,
  RefreshCw,
  CheckCircle2,
  Clock,
  FileEdit,
  UserPlus,
  Upload,
  ChevronRight,
  AlertCircle,
  Database,
  Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatTimestamp } from "@/lib/format"

const getActivityIcon = (tipo: Atividade["tipo"]) => {
  switch (tipo) {
    case "criado": return FileEdit
    case "editado": return FileText
    case "utilizado": return Blocks
    default: return FileText
  }
}

export default function DashboardPage() {
  const router = useRouter()

  // Supabase data
  const { data: metrics, loading: metricsLoading, error: metricsError } = useDashboardMetrics()
  const { data: activities, loading: activitiesLoading, error: activitiesError } = useAtividades(5)
  const { data: wordSyncsData, loading: syncsLoading, error: syncsError, refetch: refetchSyncs } = useWordSyncs(5)

  // Estados
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const wordSyncs = wordSyncsData ?? []
  const isConnected = (wordSyncs.length > 0)

  // Toast auto-dismiss
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type })
  }, [])

  const handleSync = async () => {
    if (isSyncing) return
    setIsSyncing(true)

    await refetchSyncs()

    setIsSyncing(false)
    setLastSync("agora")
    showToast("Sincronização concluída", "success")
  }

  const handleMetricClick = (href: string) => {
    router.push(href)
  }

  const handleActivityClick = (href: string) => {
    router.push(href)
  }

  return (
    <AppLayout 
      title="Dashboard" 
      description="Visao geral do sistema"
    >
      {/* Toast Notification */}
      <div
        className={cn(
          "fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg transition-all duration-300 ease-out",
          toast 
            ? "translate-y-0 opacity-100" 
            : "translate-y-4 opacity-0 pointer-events-none",
          toast?.type === "success"
            ? "bg-[#005230] text-white"
            : "bg-[#B54708] text-white"
        )}
      >
        {toast?.type === "success" ? (
          <CheckCircle2 className="w-5 h-5" />
        ) : (
          <AlertCircle className="w-5 h-5" />
        )}
        <span className="text-sm font-medium">{toast?.message}</span>
      </div>

      {/* Header Section */}
      <section className="mb-8">
        <h1 className="font-serif text-2xl font-semibold text-foreground tracking-tight mb-1">
          Bem-vindo ao Scriptum
        </h1>
        <p className="text-foreground-secondary">
          Acompanhe a atividade e o estado do seu sistema de documentos.
        </p>
      </section>

      {/* Metrics Section */}
      <section data-tour="dashboard-stats" className="mb-8">
        <h2 className="text-xs font-medium text-foreground-secondary uppercase tracking-wider mb-4">
          Resumo
        </h2>
        
        {metricsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : metrics ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => handleMetricClick("/modelos")}
              className="group bg-card rounded-xl border border-border p-5 text-left transition-all duration-200 hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-[#E8F0EC] text-[#005230]">
                  <FileText className="w-4 h-4" />
                </div>
                <ChevronRight className="w-4 h-4 text-foreground-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="font-serif text-3xl font-semibold text-foreground tracking-tight">
                {metrics.total_modelos}
              </p>
              <p className="text-sm text-foreground-secondary mt-1">Modelos</p>
            </button>

            <button
              onClick={() => handleMetricClick("/modelos")}
              className="group bg-card rounded-xl border border-border p-5 text-left transition-all duration-200 hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-[#E8F0EC] text-[#005230]">
                  <Blocks className="w-4 h-4" />
                </div>
                <ChevronRight className="w-4 h-4 text-foreground-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="font-serif text-3xl font-semibold text-foreground tracking-tight">
                {metrics.total_blocos}
              </p>
              <p className="text-sm text-foreground-secondary mt-1">Blocos</p>
            </button>

            <button
              onClick={() => handleMetricClick("/usuarios")}
              className="group bg-card rounded-xl border border-border p-5 text-left transition-all duration-200 hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-[#FEF3E7] text-[#B54708]">
                  <Users className="w-4 h-4" />
                </div>
                <ChevronRight className="w-4 h-4 text-foreground-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="font-serif text-3xl font-semibold text-foreground tracking-tight">
                {metrics.usuarios_ativos}
              </p>
              <p className="text-sm text-foreground-secondary mt-1">Usuarios Ativos</p>
            </button>
          </div>
        ) : metricsError ? (
          <div className="bg-[#FEF3E7] border border-[#B54708]/20 rounded-xl p-6 text-center">
            <AlertCircle className="w-8 h-8 text-[#B54708] mx-auto mb-2" />
            <p className="text-sm font-medium text-[#B54708]">Erro ao carregar metricas</p>
            <p className="text-xs text-[#B54708]/70 mt-1">{metricsError}</p>
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border p-8">
            <EmptyState
              icon={Database}
              title="Sem dados disponíveis"
              description="Nenhum dado encontrado. Crie modelos e documentos para ver as metricas."
            />
          </div>
        )}
      </section>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Activity Section */}
        <section data-tour="activity" className="lg:col-span-3">
          <h2 className="text-xs font-medium text-foreground-secondary uppercase tracking-wider mb-4">
            Atividade Recente
          </h2>
          <div className="bg-card rounded-xl border border-border">
            {activitiesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (activities ?? []).length > 0 ? (
              <>
                <div className="divide-y divide-border">
                  {(activities ?? []).map((activity) => {
                    const Icon = getActivityIcon(activity.tipo)
                    return (
                      <button
                        key={activity.id}
                        onClick={() => handleActivityClick("/historico")}
                        className="flex items-start gap-3 p-4 w-full text-left hover:bg-accent/50 transition-colors group"
                      >
                        <div className="p-2 rounded-lg bg-background flex-shrink-0 group-hover:bg-[#E8F0EC] transition-colors">
                          <Icon className="w-4 h-4 text-foreground-secondary group-hover:text-[#005230] transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {activity.descricao}
                          </p>
                          <p className="text-sm text-foreground-secondary mt-0.5 truncate">
                            {activity.documento_nome || activity.modelo_nome}
                          </p>
                          <p className="text-xs text-foreground-secondary/70 mt-1.5">
                            {activity.user_nome} · {formatTimestamp(activity.created_at)}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-foreground-secondary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-2" />
                      </button>
                    )
                  })}
                </div>
                <div className="px-4 py-3 border-t border-border">
                  <button 
                    onClick={() => router.push("/historico")}
                    className="text-sm font-medium text-primary hover:text-primary-800 transition-colors"
                  >
                    Ver toda a atividade
                  </button>
                </div>
              </>
            ) : (
              <EmptyState
                icon={Clock}
                title="Nenhuma atividade"
                description={activitiesError ? `Erro: ${activitiesError}` : "As atividades aparecerão aqui conforme o sistema for utilizado."}
              />
            )}
          </div>
        </section>

        {/* Word Sync Section */}
        <section data-tour="word-sync" className="lg:col-span-2">
          <h2 className="text-xs font-medium text-foreground-secondary uppercase tracking-wider mb-4">
            Sincronizações Word
          </h2>
          
          {/* Connection Status */}
          <div className="bg-card rounded-xl border border-border p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-lg flex-shrink-0 transition-colors",
                isConnected ? "bg-[#E8F0EC]" : "bg-[#FEF3E7]"
              )}>
                {isConnected ? (
                  <CheckCircle2 className="w-4 h-4 text-[#005230]" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-[#B54708]" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {isConnected ? "Plugin Word conectado" : "Aguardando conexao"}
                </p>
                <p className="text-xs text-foreground-secondary mt-0.5">
                  {lastSync ? `Última verificação ${lastSync}` : "Nenhuma sincronização realizada"}
                </p>
              </div>
            </div>
            <button 
              onClick={handleSync}
              disabled={isSyncing}
              className={cn(
                "flex items-center justify-center gap-2 w-full mt-4 px-4 py-2 text-sm font-medium rounded-lg transition-all",
                isSyncing 
                  ? "bg-primary/5 text-primary/70 cursor-not-allowed"
                  : "text-primary bg-primary/10 hover:bg-primary/15 active:scale-[0.98]"
              )}
            >
              <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
              {isSyncing ? "Sincronizando..." : "Sincronizar agora"}
            </button>
          </div>

          {/* Sync History */}
          <div className="bg-card rounded-xl border border-border">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="text-sm font-medium text-foreground">
                Historico de sincronizações
              </h3>
            </div>
            {wordSyncs.length > 0 ? (
              <div className="divide-y divide-border">
                {wordSyncs.map((sync) => (
                  <div 
                    key={sync.id}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/30"
                  >
                    <div className="p-1.5 rounded-full bg-[#E8F0EC] flex-shrink-0">
                      <Upload className="w-3 h-3 text-[#005230]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">
                        {sync.documentos_count} {sync.documentos_count === 1 ? 'documento' : 'documentos'}
                      </p>
                      <p className="text-xs text-foreground-secondary mt-0.5">
                        {formatTimestamp(sync.created_at)}
                      </p>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-[#005230] flex-shrink-0" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-sm text-foreground-secondary">
                  Nenhuma sincronização registrada
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </AppLayout>
  )
}
