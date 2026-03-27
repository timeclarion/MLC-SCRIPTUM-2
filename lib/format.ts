const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"]

/**
 * Formata um timestamp ISO para exibicao amigavel.
 * "agora", "ha 5min", "ha 2h", "ha 3d", "27 mar 2026"
 */
export function formatTimestamp(iso: string | null | undefined): string {
  if (!iso) return ""

  const date = new Date(iso)
  if (isNaN(date.getTime())) return ""

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHrs = Math.floor(diffMin / 60)
  const diffDays = Math.floor(diffHrs / 24)

  if (diffMin < 1) return "agora"
  if (diffMin < 60) return `ha ${diffMin}min`
  if (diffHrs < 24) return `ha ${diffHrs}h`
  if (diffDays < 7) return `ha ${diffDays}d`

  return `${date.getDate()} ${MESES[date.getMonth()]} ${date.getFullYear()}`
}

/**
 * Formata um timestamp ISO com hora: "27 mar 2026, 19:24"
 */
export function formatTimestampFull(iso: string | null | undefined): string {
  if (!iso) return ""

  const date = new Date(iso)
  if (isNaN(date.getTime())) return ""

  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")

  return `${date.getDate()} ${MESES[date.getMonth()]} ${date.getFullYear()}, ${hours}:${minutes}`
}
