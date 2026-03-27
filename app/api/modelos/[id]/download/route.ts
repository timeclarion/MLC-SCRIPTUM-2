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

  // Gera o .docx com a custom property mlc_modelo_id
  const doc = new Document({
    customProperties: [
      {
        name: "mlc_modelo_id",
        value: String(modelo.id),
      },
    ],
    sections: [
      {
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: modelo.nome,
                bold: true,
                size: 28,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Tipo: ${modelo.tipoBase}`,
                size: 20,
                color: "888888",
              }),
            ],
            spacing: { after: 400 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: modelo.descricao || "Modelo de peticao juridica - MLC Advocacia",
                size: 22,
              }),
            ],
            spacing: { after: 400 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Este documento foi gerado pelo sistema MLC Scriptum. A extensao do Word carregara automaticamente o modelo com as variaveis para preenchimento.",
                italics: true,
                size: 18,
                color: "999999",
              }),
            ],
          }),
        ],
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

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `inline; filename="${fileName}.docx"`,
      "Content-Length": String(buffer.byteLength),
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "ngrok-skip-browser-warning": "true",
    },
  })
}
