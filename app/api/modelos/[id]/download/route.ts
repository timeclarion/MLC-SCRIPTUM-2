import { NextRequest, NextResponse } from "next/server"
import { Document, Packer, Paragraph, TextRun } from "docx"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Busca o modelo na tabela ModeloPeticao
  const { data: modelo, error } = await supabase
    .from("ModeloPeticao")
    .select("id, nome, tipoBase, descricao, conteudoBase")
    .eq("id", Number(id))
    .single()

  if (error || !modelo) {
    return NextResponse.json(
      { error: "Modelo nao encontrado" },
      { status: 404 }
    )
  }

  // Gera documento em branco com apenas a custom property mlc_modelo_id
  // A extensao Scriptum detecta essa property e carrega o modelo automaticamente
  const doc = new Document({
    customProperties: [
      {
        name: "mlc_modelo_id",
        value: String(modelo.id),
      },
    ],
    sections: [
      {
        children: [],
      },
    ],
  })

  const buffer = await Packer.toBuffer(doc)

  // Sanitiza o nome do arquivo
  const fileName = modelo.nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .replace(/\s+/g, "_")

  // Detecta se deve servir como template (.dotx)
  // Verifica ?template=true OU se a URL original continha .dotx
  const originalUrl = request.headers.get("x-matched-path") || request.nextUrl.pathname || ""
  const isTemplate = request.nextUrl.searchParams.get("template") === "true" || originalUrl.includes(".dotx")
  const contentType = isTemplate
    ? "application/vnd.openxmlformats-officedocument.wordprocessingml.template"
    : "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  const ext = isTemplate ? "dotx" : "docx"

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `inline; filename="${fileName}.${ext}"`,
      "Content-Length": String(buffer.byteLength),
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  })
}
