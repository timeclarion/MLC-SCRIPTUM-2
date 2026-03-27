/**
 * Abre um modelo no Word Desktop via URI scheme do Office.
 *
 * Usa ms-word:nft (new from template) que:
 *   - Cria um documento NOVO baseado no template
 *   - NAO abre em Protected View (porque e um documento novo local)
 *   - Permite edicao imediata
 *   - A extensao Scriptum abre automaticamente (AutoOpen)
 */
export function abrirNoWord(modeloId: number | string) {
  const baseUrl = window.location.origin

  // nft (new from template) com .dotx — cria doc novo, sem Protected View
  const dotxUrl = `${baseUrl}/docs/${modeloId}/modelo.dotx`
  const wordUri = `ms-word:nft|u|${dotxUrl}`
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
