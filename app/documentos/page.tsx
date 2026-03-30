"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { AppLayout } from "@/components/layout"
import { EmptyState } from "@/components/ui/empty-state"
import { StatusBadge } from "@/components/ui/status-badge"
import type { Documento } from "@/lib/types"
import { useDocumentos, deleteDocumento } from "@/hooks/use-supabase"
import { abrirNoWord, baixarDocx } from "@/lib/word-deeplink"
import { formatTimestamp } from "@/lib/format"
import {
  Plus,
  ExternalLink,
  Download,
  FileText,
  MoreHorizontal,
  Search,
  ChevronDown,
  X,
  Eye,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ListSkeleton } from "@/components/ui/skeleton-loaders"

const typeOptions = ["Todos", "peticao", "contrato", "parecer"]
const statusOptions = ["Todos", "rascunho", "em_revisao", "finalizado"]

const typeLabels: Record<string, string> = {
  "Todos": "Todos",
  "peticao": "Peticao",
  "contrato": "Contrato",
  "parecer": "Parecer"
}

const statusLabels: Record<string, string> = {
  "Todos": "Todos",
  "rascunho": "Rascunho",
  "em_revisao": "Em Revisao",
  "finalizado": "Finalizado"
}


export default function DocumentosPage() {
  // Supabase data
  const { data: documentosData, loading: documentosLoading, setData: setDocumentosData } = useDocumentos()

  // Estado de dados
  const documentos = documentosData ?? []
  const setDocumentos = (updater: (prev: Documento[]) => Documento[]) => {
    setDocumentosData(updater(documentos))
  }
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("Todos")
  
  // Estado de UI
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedDocumento, setSelectedDocumento] = useState<Documento | null>(null)
  
  // Modais
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  // Loading states
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  
  // Ref para click outside
  const menuRef = useRef<HTMLDivElement>(null)

  // Filtros
  const filteredDocumentos = documentos.filter(doc => {
    const matchesSearch = doc.nome.toLowerCase().includes(search.toLowerCase()) ||
      (doc.cliente_nome?.toLowerCase().includes(search.toLowerCase()) || false)
    const matchesStatus = statusFilter === "Todos" || doc.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const hasActiveFilters = statusFilter !== "Todos"

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

  const clearFilters = () => {
    setStatusFilter("Todos")
  }

  // Handlers
  const handleView = (doc: Documento) => {
    setSelectedDocumento(doc)
    setShowViewModal(true)
    setOpenMenuId(null)
  }

  const handleOpenInWord = (doc: Documento) => {
    setOpenMenuId(null)
    if (doc.modelo_id) {
      abrirNoWord(doc.modelo_id)
      showToast("Abrindo modelo no Word...", "success")
    } else {
      baixarDocx(doc.id)
      showToast("Baixando documento...", "success")
    }
  }

  const handleDelete = (doc: Documento) => {
    setSelectedDocumento(doc)
    setShowDeleteModal(true)
    setOpenMenuId(null)
  }

  const handleCreateNew = () => {
    showToast("Crie documentos a partir dos modelos na pagina Modelos", "success")
  }

  const confirmDelete = async () => {
    if (!selectedDocumento) return
    setIsDeleting(true)

    const { error } = await deleteDocumento(selectedDocumento.id)
    if (error) {
      showToast("Erro ao excluir documento", "error")
      setIsDeleting(false)
      return
    }

    setDocumentos(prev => prev.filter(d => d.id !== selectedDocumento.id))
    setIsDeleting(false)
    setShowDeleteModal(false)
    setSelectedDocumento(null)
    showToast("Documento excluido com sucesso", "success")
  }

  // confirmOpenWord removido - agora usa deep link direto via handleOpenInWord

  return (
    <AppLayout 
      title="Documentos" 
      description="Documentos gerados a partir dos modelos"
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
            : "bg-red-600 text-white"
        )}
      >
        {toast?.type === "success" ? (
          <CheckCircle2 className="w-5 h-5" />
        ) : (
          <AlertCircle className="w-5 h-5" />
        )}
        <span className="text-sm font-medium">{toast?.message}</span>
      </div>

      {/* Header com busca e filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-secondary" />
            <input
              type="text"
              placeholder="Buscar documentos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "inline-flex items-center gap-2 h-10 px-3 text-sm font-medium rounded-lg border transition-colors",
              hasActiveFilters
                ? "bg-[#E8F0EC] border-primary text-[#005230]"
                : "bg-background border-border text-foreground-secondary hover:bg-accent"
            )}
          >
            <ChevronDown className={cn("w-4 h-4 transition-transform", showFilters && "rotate-180")} />
            Filtros
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-primary" />
            )}
          </button>
        </div>
        
        <button
          onClick={handleCreateNew}
          className="inline-flex items-center justify-center gap-2 h-10 px-4 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-800 transition-colors active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Criar no Word
        </button>
      </div>

      {/* Filtros expandidos */}
      {showFilters && (
        <div className="bg-card rounded-xl border border-border p-4 mb-6 animate-in fade-in-0 slide-in-from-top-2">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="text-xs text-foreground-secondary uppercase tracking-wider mb-1.5 block">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 px-3 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                {statusOptions.map(opt => (
                  <option key={opt} value={opt}>{statusLabels[opt]}</option>
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

      {/* Lista de documentos ou empty state */}
      {documentosLoading ? (
        <ListSkeleton count={5} />
      ) : documentos.length === 0 ? (
        <div className="bg-card rounded-xl border border-border">
          <EmptyState
            icon={FileText}
            title="Nenhum documento gerado"
            description="Crie documentos a partir dos modelos no Word."
            action={{
              label: "Criar no Word",
              onClick: handleCreateNew
            }}
          />
        </div>
      ) : filteredDocumentos.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12">
          <div className="text-center">
            <Search className="w-12 h-12 text-foreground-secondary/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Nenhum resultado encontrado</h3>
            <p className="text-sm text-foreground-secondary">Tente ajustar os filtros ou termo de busca.</p>
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border divide-y divide-border" ref={menuRef}>
          {filteredDocumentos.map((doc) => {
            return (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 hover:bg-accent/30 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="p-2 rounded-lg bg-[#E8F0EC] flex-shrink-0">
                    <FileText className="w-5 h-5 text-[#005230]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium text-foreground truncate">
                      {doc.nome}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {doc.cliente_nome && (
                        <>
                          <span className="text-xs text-foreground-secondary">
                            {doc.cliente_nome}
                          </span>
                          <span className="text-xs text-foreground-secondary/50">•</span>
                        </>
                      )}
                      <span className="text-xs text-foreground-secondary">
                        {doc.autor_nome}
                      </span>
                      <span className="text-xs text-foreground-secondary/50">•</span>
                      <span className="text-xs text-foreground-secondary">
                        {formatTimestamp(doc.updated_at)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <StatusBadge status={doc.status} />
                  
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === doc.id ? null : doc.id)}
                      className="p-2 rounded-lg hover:bg-accent transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4 text-foreground-secondary" />
                    </button>
                    
                    {openMenuId === doc.id && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg z-50 py-1 animate-in fade-in-0 zoom-in-95">
                        <button
                          onClick={() => handleView(doc)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Visualizar
                        </button>
                        <button
                          onClick={() => handleOpenInWord(doc)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Abrir no Word
                        </button>
                        <hr className="my-1 border-border" />
                        <button
                          onClick={() => handleDelete(doc)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Excluir
                        </button>
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
      {showViewModal && selectedDocumento && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => setShowViewModal(false)} 
          />
          <div className="relative bg-card rounded-xl border border-border w-full max-w-lg p-6 mx-4 animate-in fade-in-0 zoom-in-95">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-lg font-medium text-foreground">
                {selectedDocumento.nome}
              </h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-1 rounded hover:bg-accent transition-colors"
              >
                <X className="w-5 h-5 text-foreground-secondary" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-foreground-secondary uppercase tracking-wider mb-1">Cliente</p>
                  <p className="text-sm text-foreground">{selectedDocumento.cliente_nome || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-foreground-secondary uppercase tracking-wider mb-1">Modelo</p>
                  <p className="text-sm text-foreground">{selectedDocumento.modelo_nome}</p>
                </div>
                <div>
                  <p className="text-xs text-foreground-secondary uppercase tracking-wider mb-1">Autor</p>
                  <p className="text-sm text-foreground">{selectedDocumento.autor_nome}</p>
                </div>
                <div>
                  <p className="text-xs text-foreground-secondary uppercase tracking-wider mb-1">Status</p>
                  <StatusBadge status={selectedDocumento.status} />
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
                onClick={() => {
                  setShowViewModal(false)
                  handleOpenInWord(selectedDocumento)
                }}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-800 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Abrir no Word
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Exclusao */}
      {showDeleteModal && selectedDocumento && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => !isDeleting && setShowDeleteModal(false)} 
          />
          <div className="relative bg-card rounded-xl border border-border w-full max-w-md p-6 mx-4 animate-in fade-in-0 zoom-in-95">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-red-100">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-foreground">
                  Excluir documento
                </h2>
                <p className="text-sm text-foreground-secondary mt-1">
                  Tem certeza que deseja excluir &quot;{selectedDocumento.nome}&quot;? Esta acao nao pode ser desfeita.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-foreground-secondary hover:text-foreground transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Excluir
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </AppLayout>
  )
}
