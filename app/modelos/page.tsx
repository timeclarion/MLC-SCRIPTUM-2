"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { AppLayout } from "@/components/layout"
import { EmptyState } from "@/components/ui/empty-state"
import type { ModeloPeticao } from "@/lib/types"
import { useAllModelosPeticao } from "@/hooks/use-supabase"
import { abrirNoWord, baixarDocx } from "@/lib/word-deeplink"
import {
  FileText,
  Search,
  MoreHorizontal,
  Eye,
  ExternalLink,
  Download,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Layers,
  Gavel,
  Building2
} from "lucide-react"
import { cn } from "@/lib/utils"

const tipoBaseLabels: Record<string, string> = {
  "JUDICIAL_TJ": "Judicial",
  "ADMINISTRATIVA_INSS": "Administrativa INSS",
}

const tipoBaseConfig: Record<string, { label: string; icon: typeof Gavel; className: string }> = {
  "JUDICIAL_TJ": {
    label: "Judicial",
    icon: Gavel,
    className: "bg-[#E8F0EC] text-[#005230]",
  },
  "ADMINISTRATIVA_INSS": {
    label: "Administrativa",
    icon: Building2,
    className: "bg-[#FEF3E7] text-[#B54708]",
  },
}

const filterOptions = ["Todos", "JUDICIAL_TJ", "ADMINISTRATIVA_INSS"]
const filterLabels: Record<string, string> = {
  "Todos": "Todos",
  "JUDICIAL_TJ": "Judicial",
  "ADMINISTRATIVA_INSS": "Administrativa",
}

export default function ModelosPage() {
  // Supabase data - modelos reais da extensao Word (ModeloPeticao)
  const { data: modelosData, loading: modelosLoading } = useAllModelosPeticao()
  const modelos = modelosData ?? []

  // Estado de UI
  const [search, setSearch] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("Todos")
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)
  const [selectedModelo, setSelectedModelo] = useState<ModeloPeticao | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  // Ref para click outside
  const menuRef = useRef<HTMLDivElement>(null)

  // Filtros
  const filteredModelos = modelos.filter(modelo => {
    const matchesSearch = modelo.nome.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = selectedFilter === "Todos" || modelo.tipoBase === selectedFilter
    return matchesSearch && matchesFilter
  })

  const activeCount = modelos.filter(m => m.ativo).length
  const totalCount = modelos.length

  // Click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

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

  // Handlers
  const handleView = (modelo: ModeloPeticao) => {
    setSelectedModelo(modelo)
    setShowViewModal(true)
    setOpenMenuId(null)
  }

  const handleUsarNoWord = (modelo: ModeloPeticao) => {
    setOpenMenuId(null)
    abrirNoWord(modelo.id)
    showToast("Abrindo modelo no Word...", "success")
  }

  const handleDownload = (modelo: ModeloPeticao) => {
    setOpenMenuId(null)
    baixarDocx(modelo.id)
    showToast("Baixando documento...", "success")
  }

  return (
    <AppLayout
      title="Modelos"
      description="Modelos de peticoes do Scriptum"
    >
      {/* Toast */}
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

      {/* Info banner */}
      <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Modelos integrados com o Microsoft Word
            </p>
            <p className="text-sm text-foreground-secondary mt-1">
              Clique em &quot;Usar no Word&quot; para abrir o modelo diretamente no Word Desktop.
              A extensao Scriptum carregara automaticamente as variaveis para preenchimento.
            </p>
          </div>
        </div>
      </div>

      {/* Header com busca */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-secondary" />
          <input
            type="text"
            placeholder="Buscar modelos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>

        <div className="text-sm text-foreground-secondary">
          {activeCount} ativos de {totalCount} modelos
        </div>
      </div>

      {/* Filtros de tipo */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {filterOptions.map((option) => (
          <button
            key={option}
            onClick={() => setSelectedFilter(option)}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap",
              selectedFilter === option
                ? "bg-primary text-white"
                : "bg-muted text-foreground-secondary hover:bg-accent"
            )}
          >
            {filterLabels[option]}
          </button>
        ))}
      </div>

      {/* Lista de modelos */}
      {modelosLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : modelos.length === 0 ? (
        <div className="bg-card rounded-xl border border-border">
          <EmptyState
            icon={Layers}
            title="Nenhum modelo cadastrado"
            description="Crie modelos de peticao na extensao Scriptum do Word."
          />
        </div>
      ) : filteredModelos.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12">
          <div className="text-center">
            <Search className="w-12 h-12 text-foreground-secondary/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Nenhum resultado encontrado</h3>
            <p className="text-sm text-foreground-secondary">Tente ajustar os filtros ou termo de busca.</p>
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border divide-y divide-border" ref={menuRef}>
          {filteredModelos.map((modelo) => {
            const tipoConfig = tipoBaseConfig[modelo.tipoBase] ?? tipoBaseConfig["JUDICIAL_TJ"]
            const TipoIcon = tipoConfig.icon

            return (
              <div
                key={modelo.id}
                className={cn(
                  "flex items-center justify-between p-4 hover:bg-accent/30 transition-colors",
                  !modelo.ativo && "opacity-50"
                )}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="p-2 rounded-lg bg-[#E8F0EC] flex-shrink-0">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium text-foreground truncate">
                      {modelo.nome}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium rounded",
                        tipoConfig.className
                      )}>
                        <TipoIcon className="w-3 h-3" />
                        {tipoConfig.label}
                      </span>
                      {!modelo.ativo && (
                        <span className="px-1.5 py-0.5 text-xs bg-[#FEF3E7] text-[#B54708] rounded">
                          Inativo
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Botao principal: Usar no Word */}
                  {modelo.ativo && (
                    <button
                      onClick={() => handleUsarNoWord(modelo)}
                      className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-800 transition-colors active:scale-[0.98]"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Usar no Word
                    </button>
                  )}

                  {/* Menu de acoes */}
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === modelo.id ? null : modelo.id)}
                      className="p-2 rounded-lg hover:bg-accent transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4 text-foreground-secondary" />
                    </button>

                    {openMenuId === modelo.id && (
                      <div className="absolute right-0 top-full mt-1 w-52 bg-card border border-border rounded-lg shadow-lg z-50 py-1 animate-in fade-in-0 zoom-in-95">
                        <button
                          onClick={() => handleView(modelo)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Visualizar detalhes
                        </button>
                        {modelo.ativo && (
                          <>
                            <button
                              onClick={() => handleUsarNoWord(modelo)}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors sm:hidden"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Usar no Word
                            </button>
                            <button
                              onClick={() => handleDownload(modelo)}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                            >
                              <Download className="w-4 h-4" />
                              Baixar .docx
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal de Visualizacao */}
      {showViewModal && selectedModelo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowViewModal(false)}
          />
          <div className="relative bg-card rounded-xl border border-border w-full max-w-lg p-6 mx-4 animate-in fade-in-0 zoom-in-95">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-lg font-medium text-foreground">
                {selectedModelo.nome}
              </h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-1 rounded hover:bg-accent transition-colors"
              >
                <X className="w-5 h-5 text-foreground-secondary" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-foreground-secondary uppercase tracking-wider mb-1">Descricao</p>
                <p className="text-sm text-foreground">{selectedModelo.descricao || "Sem descricao"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-foreground-secondary uppercase tracking-wider mb-1">Tipo</p>
                  <p className="text-sm text-foreground">{tipoBaseLabels[selectedModelo.tipoBase] || selectedModelo.tipoBase}</p>
                </div>
                <div>
                  <p className="text-xs text-foreground-secondary uppercase tracking-wider mb-1">Status</p>
                  <p className="text-sm text-foreground">{selectedModelo.ativo ? "Ativo" : "Inativo"}</p>
                </div>
                <div>
                  <p className="text-xs text-foreground-secondary uppercase tracking-wider mb-1">ID do Modelo</p>
                  <p className="text-sm text-foreground font-mono">{selectedModelo.id}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 text-sm font-medium text-foreground-secondary hover:text-foreground transition-colors"
              >
                Fechar
              </button>
              <button
                onClick={() => handleDownload(selectedModelo)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground border border-border rounded-lg hover:bg-accent transition-colors"
              >
                <Download className="w-4 h-4" />
                Baixar .docx
              </button>
              {selectedModelo.ativo && (
                <button
                  onClick={() => {
                    setShowViewModal(false)
                    handleUsarNoWord(selectedModelo)
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-800 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Usar no Word
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
