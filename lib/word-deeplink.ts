/**
 * Abre um modelo no Word Desktop via URI scheme do Office.
 * Funciona tanto em HTTPS quanto em HTTP/localhost.
 *
 * Formato: ms-word:ofe|u|<url-do-docx>
 */
export function abrirNoWord(modeloId: number | string) {
  const baseUrl = window.location.origin
  const docxUrl = `${baseUrl}/docs/${modeloId}/modelo.docx`

  // Tenta abrir no Word via URI scheme (funciona em HTTP e HTTPS)
  const wordUri = `ms-word:ofe|u|${docxUrl}`
  window.location.href = wordUri

  // Fallback apos 3s: se o navegador ainda tem foco, Word nao abriu
  setTimeout(() => {
    if (document.hasFocus()) {
      const confirmar = confirm(
        "Nao foi possivel abrir o Word automaticamente.\nDeseja baixar o arquivo .docx?"
      )
      if (confirmar) {
        triggerDownload(`${baseUrl}/api/modelos/${modeloId}/download`, modeloId)
      }
    }
  }, 3000)
}

/**
 * Faz download direto do .docx sem tentar abrir o Word
 */
export function baixarDocx(modeloId: number | string) {
  const baseUrl = window.location.origin
  triggerDownload(`${baseUrl}/api/modelos/${modeloId}/download`, modeloId)
}

function triggerDownload(url: string, modeloId: number | string) {
  const a = document.createElement("a")
  a.href = url
  a.download = `modelo-${modeloId}.docx`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
