"use client"

import { useState } from "react"
import { AppLayout } from "@/components/layout"
import { EmptyState } from "@/components/ui/empty-state"
import type { Atividade } from "@/lib/types"
import { useAtividades } from "@/hooks/use-supabase"
import {
  Search,
  Filter,
  FileText,
  Layers,
  Box,
  Plus,
  Pencil,
  Play,
  ChevronDown,
  X,
  Clock,
  Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatTimestampFull } from "@/lib/format"

const users = ["Todos"]
const actionTypes = ["Todas", "criado", "editado", "utilizado"]

const actionLabels: Record<string, string> = {
  "Todas": "Todas",
  "criado": "Criado",
  "editado": "Editado",
  "utilizado": "Utilizado"
}

function getTypeIcon(tipo: string) {
  switch (tipo) {
    case "modelo":
      return Layers
    case "bloco":
      return Box
    default:
      return FileText
  }
}

function getActionBadge(action: Atividade["tipo"]) {
  switch (action) {
    case "criado":
      return {
        label: "Criado",
        icon: Plus,
        className: "bg-[#E8F0EC] text-[#005230]"
      }
    case "editado":
      return {
        label: "Editado",
        icon: Pencil,
        className: "bg-[#FEF3E7] text-[#B54708]"
      }
    case "utilizado":
      return {
        label: "Utilizado",
        icon: Play,
        className: "bg-[#F3F2EE] text-[#6B6B6B]"
      }
    case "sincronizado":
      return {
        label: "Sincronizado",
        icon: FileText,
        className: "bg-[#E8F0EC] text-[#005230]"
      }
    case "excluido":
      return {
        label: "Excluído",
        icon: X,
        className: "bg-[#FEF3E7] text-[#B54708]"
      }
    default:
      return {
        label: action,
        icon: FileText,
        className: "bg-[#F3F2EE] text-[#6B6B6B]"
      }
  }
}

export default function HistoricoPage() {
  const { data: activityData, loading: activityLoading } = useAtividades()
  const activityHistory = activityData ?? []

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState("Todos")
  const [selectedAction, setSelectedAction] = useState("Todas")
  const [showFilters, setShowFilters] = useState(false)

  // Filter logic
  const filteredHistory = activityHistory.filter(item => {
    const matchesSearch = (item.documento_nome?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (item.modelo_nome?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
    const matchesUser = selectedUser === "Todos" || item.user_nome === selectedUser
    const matchesAction = selectedAction === "Todas" || item.tipo === selectedAction
    return matchesSearch && matchesUser && matchesAction
  })

  const hasActiveFilters = selectedUser !== "Todos" || selectedAction !== "Todas"

  const clearFilters = () => {
    setSelectedUser("Todos")
    setSelectedAction("Todas")
  }

  return (
    <AppLayout 
      title="Historico" 
      description="Acompanhe toda a atividade de documentos do escritorio"
    >
      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-secondary" />
            <input
              type="text"
              placeholder="Buscar por nome do documento..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "inline-flex items-center gap-2 h-10 px-3 text-sm font-medium rounded-lg border transition-colors",
              hasActiveFilters 
                ? "bg-primary/10 border-primary text-primary" 
                : "bg-background border-border text-foreground-secondary hover:bg-accent"
            )}
          >
            <Filter className="w-4 h-4" />
            Filtros
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-primary" />
            )}
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="bg-card rounded-xl border border-border p-4 animate-in fade-in-0 slide-in-from-top-2">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="text-xs text-foreground-secondary uppercase tracking-wider mb-1.5 block">
                  Usuario
                </label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="h-9 px-3 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  {users.map(user => (
                    <option key={user} value={user}>{user}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-foreground-secondary uppercase tracking-wider mb-1.5 block">
                  Acao
                </label>
                <select
                  value={selectedAction}
                  onChange={(e) => setSelectedAction(e.target.value)}
                  className="h-9 px-3 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  {actionTypes.map(action => (
                    <option key={action} value={action}>{actionLabels[action]}</option>
                  ))}
                </select>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary hover:text-primary-800 transition-colors mt-5"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Activity List ou Empty State */}
      {activityLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : activityHistory.length === 0 ? (
        <div className="bg-card rounded-xl border border-border">
          <EmptyState
            icon={Clock}
            title="Nenhuma atividade registrada"
            description="O historico de atividades aparecera aqui conforme o sistema for utilizado."
          />
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12">
          <div className="text-center">
            <Search className="w-12 h-12 text-foreground-secondary/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Nenhum resultado encontrado</h3>
            <p className="text-sm text-foreground-secondary">Tente ajustar os filtros ou termo de busca.</p>
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border divide-y divide-border">
          {filteredHistory.map((item) => {
            const TypeIcon = getTypeIcon(item.tipo)
            const actionBadge = getActionBadge(item.tipo)
            const ActionIcon = actionBadge.icon
            const displayName = item.documento_nome || item.modelo_nome || "Item desconhecido"

            return (
              <div key={item.id} className="p-4 hover:bg-accent/30 transition-colors">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="p-2 rounded-lg bg-[#E8F0EC] flex-shrink-0">
                    <TypeIcon className="w-5 h-5 text-[#005230]" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="text-sm font-medium text-foreground truncate">
                          {displayName}
                        </h3>
                        <div className="flex items-center gap-2 mt-1.5">
                          {/* Action Badge */}
                          <span className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium",
                            actionBadge.className
                          )}>
                            <ActionIcon className="w-3 h-3" />
                            {actionBadge.label}
                          </span>
                          
                          <span className="text-xs text-foreground-secondary">
                            por {item.user_nome}
                          </span>
                        </div>
                      </div>

                      {/* Date & Origin */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm text-foreground-secondary">
                          {formatTimestampFull(item.created_at)}
                        </p>
                        <span className="inline-flex items-center gap-1 mt-1 rounded-md px-2 py-0.5 text-xs bg-[#F3F2EE] text-[#9B9B9B] border border-[#E1DFDB]">
                          {item.origem === "word" ? "Word" : "Web"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </AppLayout>
  )
}
