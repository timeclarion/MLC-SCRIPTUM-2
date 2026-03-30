"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, FileText, Users, Layers, ArrowRight, Command, X } from "lucide-react"
import { supabase } from "@/lib/supabase"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

interface ResultItem {
  id: string
  category: "modelos" | "documentos" | "usuarios"
  name: string
  subtitle: string
  href: string
}

// ---------------------------------------------------------------------------
// Hook: useCommandPalette
// ---------------------------------------------------------------------------

export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((v) => !v), [])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        toggle()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggle])

  return { isOpen, open, close, toggle }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CATEGORY_META: Record<
  ResultItem["category"],
  { label: string; icon: React.ElementType }
> = {
  modelos: { label: "Modelos", icon: Layers },
  documentos: { label: "Documentos", icon: FileText },
  usuarios: { label: "Usuarios", icon: Users },
}

const SUGGESTED_ITEMS: ResultItem[] = [
  {
    id: "sug-1",
    category: "modelos",
    name: "Petição Inicial",
    subtitle: "Modelo de petição",
    href: "/modelos",
  },
  {
    id: "sug-2",
    category: "documentos",
    name: "Documentos Recentes",
    subtitle: "Ver todos os documentos",
    href: "/documentos",
  },
  {
    id: "sug-3",
    category: "usuarios",
    name: "Gerenciar Usuários",
    subtitle: "Administração",
    href: "/usuarios",
  },
]

function groupByCategory(items: ResultItem[]) {
  const groups: Record<string, ResultItem[]> = {}
  for (const item of items) {
    if (!groups[item.category]) groups[item.category] = []
    groups[item.category].push(item)
  }
  return groups
}

// ---------------------------------------------------------------------------
// Component: CommandPalette
// ---------------------------------------------------------------------------

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const [query, setQuery] = useState("")
  const [results, setResults] = useState<ResultItem[]>([])
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  // Items currently displayed (results or suggestions)
  const displayedItems = useMemo(
    () => (query.trim() === "" ? SUGGESTED_ITEMS : results),
    [query, results],
  )

  const grouped = useMemo(() => groupByCategory(displayedItems), [displayedItems])

  // Flat list for keyboard navigation
  const flatItems = useMemo(() => {
    const flat: ResultItem[] = []
    for (const cat of ["modelos", "documentos", "usuarios"] as const) {
      if (grouped[cat]) flat.push(...grouped[cat])
    }
    return flat
  }, [grouped])

  // ---- Focus input on open ------------------------------------------------
  useEffect(() => {
    if (isOpen) {
      setQuery("")
      setResults([])
      setActiveIndex(0)
      // small delay so the modal is rendered
      const t = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(t)
    }
  }, [isOpen])

  // ---- Debounced search ----------------------------------------------------
  useEffect(() => {
    if (!isOpen) return
    const trimmed = query.trim()
    if (trimmed === "") {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    const timer = setTimeout(async () => {
      try {
        const searchTerm = `%${trimmed}%`

        const [modelosRes, documentosRes, usuariosRes] = await Promise.all([
          supabase
            .from("ModeloPeticao")
            .select("id, nome, tipo")
            .ilike("nome", searchTerm)
            .limit(5),
          supabase
            .from("Documento")
            .select("id, nome, status")
            .ilike("nome", searchTerm)
            .limit(5),
          supabase
            .from("Usuario")
            .select("id, nome, email")
            .ilike("nome", searchTerm)
            .limit(5),
        ])

        const items: ResultItem[] = []

        if (modelosRes.data) {
          for (const m of modelosRes.data) {
            items.push({
              id: `modelo-${m.id}`,
              category: "modelos",
              name: m.nome,
              subtitle: m.tipo ?? "Modelo",
              href: `/modelos/${m.id}`,
            })
          }
        }

        if (documentosRes.data) {
          for (const d of documentosRes.data) {
            items.push({
              id: `doc-${d.id}`,
              category: "documentos",
              name: d.nome,
              subtitle: d.status ?? "Documento",
              href: `/documentos/${d.id}`,
            })
          }
        }

        if (usuariosRes.data) {
          for (const u of usuariosRes.data) {
            items.push({
              id: `user-${u.id}`,
              category: "usuarios",
              name: u.nome,
              subtitle: u.email ?? "Usuário",
              href: `/usuarios/${u.id}`,
            })
          }
        }

        setResults(items)
        setActiveIndex(0)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query, isOpen])

  // ---- Keyboard navigation -------------------------------------------------
  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault()
        onClose()
        return
      }

      if (e.key === "ArrowDown") {
        e.preventDefault()
        setActiveIndex((prev) => (prev + 1) % Math.max(flatItems.length, 1))
        return
      }

      if (e.key === "ArrowUp") {
        e.preventDefault()
        setActiveIndex((prev) =>
          prev <= 0 ? Math.max(flatItems.length - 1, 0) : prev - 1,
        )
        return
      }

      if (e.key === "Enter") {
        e.preventDefault()
        const item = flatItems[activeIndex]
        if (item) {
          router.push(item.href)
          onClose()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, flatItems, activeIndex, router, onClose])

  // ---- Scroll active item into view ----------------------------------------
  useEffect(() => {
    if (!listRef.current) return
    const activeEl = listRef.current.querySelector("[data-active='true']")
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest" })
    }
  }, [activeIndex])

  // ---- Navigate to item ----------------------------------------------------
  function handleSelect(item: ResultItem) {
    router.push(item.href)
    onClose()
  }

  // ---- Don't render when closed --------------------------------------------
  if (!isOpen) return null

  // ---- Flat index counter for mapping grouped items to flatItems index ------
  let flatIdx = -1

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] animate-in fade-in duration-150"
      onClick={onClose}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-[560px] mx-4 bg-[#FAFAF9] border border-[#E1DFDB] rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E1DFDB]">
          <Search className="w-5 h-5 text-[#9B9B9B] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar modelos, documentos, usuários..."
            className="flex-1 bg-[#F3F2EE] rounded-xl px-3 py-2 text-sm text-[#1A1A1A] placeholder:text-[#9B9B9B] outline-none border border-[#E1DFDB] focus:ring-1 focus:ring-[#E1DFDB]"
          />
          <button
            onClick={onClose}
            className="flex items-center justify-center w-7 h-7 rounded-lg text-[#9B9B9B] hover:text-[#6B6B6B] hover:bg-[#F3F2EE] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results area */}
        <div ref={listRef} className="max-h-[360px] overflow-y-auto py-2">
          {/* Loading indicator */}
          {loading && query.trim() !== "" && (
            <div className="flex items-center justify-center py-8">
              <div className="w-5 h-5 border-2 border-[#E1DFDB] border-t-[#6B6B6B] rounded-full animate-spin" />
            </div>
          )}

          {/* No results */}
          {!loading && query.trim() !== "" && flatItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 px-4">
              <Search className="w-8 h-8 text-[#E1DFDB] mb-3" />
              <p className="text-sm text-[#6B6B6B]">Nenhum resultado</p>
              <p className="text-xs text-[#9B9B9B] mt-1">
                Tente buscar com outros termos
              </p>
            </div>
          )}

          {/* Suggested header */}
          {!loading && query.trim() === "" && (
            <div className="px-4 pt-1 pb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9B9B9B]">
                Sugestões
              </span>
            </div>
          )}

          {/* Grouped results */}
          {!loading &&
            (["modelos", "documentos", "usuarios"] as const).map((cat) => {
              const items = grouped[cat]
              if (!items || items.length === 0) return null
              const { label, icon: Icon } = CATEGORY_META[cat]

              return (
                <div key={cat} className="mb-1">
                  {query.trim() !== "" && (
                    <div className="px-4 pt-3 pb-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9B9B9B]">
                        {label}
                      </span>
                    </div>
                  )}

                  {items.map((item) => {
                    flatIdx++
                    const isActive = flatIdx === activeIndex
                    const currentIdx = flatIdx

                    return (
                      <button
                        key={item.id}
                        data-active={isActive}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setActiveIndex(currentIdx)}
                        className={`flex items-center gap-3 w-full px-4 py-2.5 text-left transition-colors ${
                          isActive ? "bg-[#E8F0EC]" : "hover:bg-[#F3F2EE]"
                        }`}
                      >
                        <Icon className="w-4 h-4 text-[#9B9B9B] shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#1A1A1A] truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-[#6B6B6B] truncate">
                            {item.subtitle}
                          </p>
                        </div>
                        {isActive && (
                          <ArrowRight className="w-4 h-4 text-[#9B9B9B] shrink-0" />
                        )}
                      </button>
                    )
                  })}
                </div>
              )
            })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-[#E1DFDB] bg-[#F3F2EE]">
          <div className="flex items-center gap-3 text-xs text-[#9B9B9B]">
            <span className="flex items-center gap-1">
              <kbd className="inline-flex items-center justify-center w-5 h-5 rounded border border-[#E1DFDB] bg-[#FAFAF9] text-[10px]">
                ↑
              </kbd>
              <kbd className="inline-flex items-center justify-center w-5 h-5 rounded border border-[#E1DFDB] bg-[#FAFAF9] text-[10px]">
                ↓
              </kbd>
              navegar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="inline-flex items-center justify-center h-5 px-1.5 rounded border border-[#E1DFDB] bg-[#FAFAF9] text-[10px]">
                Enter
              </kbd>
              abrir
            </span>
            <span className="flex items-center gap-1">
              <kbd className="inline-flex items-center justify-center h-5 px-1.5 rounded border border-[#E1DFDB] bg-[#FAFAF9] text-[10px]">
                Esc
              </kbd>
              fechar
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-[#9B9B9B]">
            <Command className="w-3 h-3" />
            <span>Scriptum</span>
          </div>
        </div>
      </div>
    </div>
  )
}
