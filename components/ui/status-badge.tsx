import { CheckCircle2, Clock, FileEdit } from "lucide-react"
import { cn } from "@/lib/utils"

type StatusKey = "finalizado" | "em_revisao" | "rascunho" | "sincronizado" | "pendente" | "erro" | "ativo" | "inativo" | "sucesso"

const STATUS_CONFIG: Record<StatusKey, { label: string; colorClass: string; bgClass: string; icon: typeof CheckCircle2 }> = {
  finalizado: {
    label: "Finalizado",
    colorClass: "text-[#005230]",
    bgClass: "bg-[#E8F0EC]",
    icon: CheckCircle2,
  },
  sincronizado: {
    label: "Sincronizado",
    colorClass: "text-[#005230]",
    bgClass: "bg-[#E8F0EC]",
    icon: CheckCircle2,
  },
  sucesso: {
    label: "Sucesso",
    colorClass: "text-[#005230]",
    bgClass: "bg-[#E8F0EC]",
    icon: CheckCircle2,
  },
  ativo: {
    label: "Ativo",
    colorClass: "text-[#005230]",
    bgClass: "bg-[#E8F0EC]",
    icon: CheckCircle2,
  },
  em_revisao: {
    label: "Em Revisao",
    colorClass: "text-[#B54708]",
    bgClass: "bg-[#FEF3E7]",
    icon: Clock,
  },
  pendente: {
    label: "Pendente",
    colorClass: "text-[#B54708]",
    bgClass: "bg-[#FEF3E7]",
    icon: Clock,
  },
  rascunho: {
    label: "Rascunho",
    colorClass: "text-[#6B6B6B]",
    bgClass: "bg-[#F3F2EE]",
    icon: FileEdit,
  },
  erro: {
    label: "Erro",
    colorClass: "text-[#B54708]",
    bgClass: "bg-[#FEF3E7]",
    icon: Clock,
  },
  inativo: {
    label: "Inativo",
    colorClass: "text-[#6B6B6B]",
    bgClass: "bg-[#F3F2EE]",
    icon: Clock,
  },
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status as StatusKey] ?? STATUS_CONFIG.rascunho
  const Icon = config.icon

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full",
        config.bgClass,
        config.colorClass,
        className
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  )
}
