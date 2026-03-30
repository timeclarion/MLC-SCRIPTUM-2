"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Bell, FileEdit, FileText, Layers, RefreshCw, Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { formatTimestamp } from "@/lib/format"
import type { Atividade, AtividadeTipo } from "@/lib/types"

const STORAGE_KEY = "mlc_notifications_last_seen"

const tipoIcons: Record<AtividadeTipo, React.ElementType> = {
  criado: FileEdit,
  editado: FileText,
  utilizado: Layers,
  sincronizado: RefreshCw,
  excluido: Trash2,
}

export function NotificationsDropdown() {
  const [open, setOpen] = useState(false)
  const [atividades, setAtividades] = useState<Atividade[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  const getLastSeen = useCallback((): string | null => {
    if (typeof window === "undefined") return null
    return localStorage.getItem(STORAGE_KEY)
  }, [])

  const computeUnread = useCallback(
    (items: Atividade[]) => {
      const lastSeen = getLastSeen()
      if (!lastSeen) return items.length
      return items.filter((a) => a.created_at > lastSeen).length
    },
    [getLastSeen]
  )

  const fetchAtividades = useCallback(async () => {
    const { data } = await supabase
      .from("atividades")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10)

    if (data) {
      setAtividades(data as Atividade[])
      setUnreadCount(computeUnread(data as Atividade[]))
    }
  }, [computeUnread])

  // Initial fetch
  useEffect(() => {
    fetchAtividades()
  }, [fetchAtividades])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("atividades_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "atividades" },
        () => {
          fetchAtividades()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchAtividades])

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  function markAllRead() {
    if (atividades.length > 0) {
      localStorage.setItem(STORAGE_KEY, atividades[0].created_at)
    }
    setUnreadCount(0)
  }

  function isUnread(a: Atividade): boolean {
    const lastSeen = getLastSeen()
    if (!lastSeen) return true
    return a.created_at > lastSeen
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex items-center justify-center w-9 h-9 rounded-lg text-foreground-secondary hover:bg-accent transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-semibold leading-none bg-[#005230] text-white rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-80 max-h-[400px] flex flex-col bg-[#FAFAF9] border border-[#E1DFDB] rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E1DFDB]">
            <h3 className="text-sm font-semibold text-[#1A1A1A]">Notificacoes</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs font-medium text-[#005230] hover:underline"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {atividades.length === 0 ? (
              <div className="flex items-center justify-center py-10">
                <p className="text-sm text-[#9B9B9B]">Nenhuma notificacao</p>
              </div>
            ) : (
              <ul>
                {atividades.map((a) => {
                  const Icon = tipoIcons[a.tipo] ?? FileText
                  const unread = isUnread(a)
                  return (
                    <li
                      key={a.id}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-[#F3F2EE] transition-colors cursor-default"
                    >
                      {/* Unread dot */}
                      <div className="flex-shrink-0 mt-1.5 w-2 h-2">
                        {unread && (
                          <span className="block w-2 h-2 rounded-full bg-[#005230]" />
                        )}
                      </div>

                      {/* Icon */}
                      <div className="flex-shrink-0 mt-0.5">
                        <Icon className="w-4 h-4 text-[#6B6B6B]" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#1A1A1A] leading-snug">
                          {a.descricao}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-xs text-[#6B6B6B]">{a.user_nome}</span>
                          <span className="text-xs text-[#9B9B9B]">·</span>
                          <span className="text-xs text-[#9B9B9B]">
                            {formatTimestamp(a.created_at)}
                          </span>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
