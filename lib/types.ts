// ===========================================
// TIPOS DO BANCO DE DADOS - MLC SCRIPTUM
// ===========================================
// Estes tipos devem corresponder às tabelas do Supabase
// Após conectar o Supabase, você pode gerar tipos automaticamente com:
// npx supabase gen types typescript --project-id <seu-project-id> > lib/database.types.ts

// -----------------------------------------
// USUÁRIOS
// -----------------------------------------
export type UserRole = "admin" | "advogado" | "operador"
export type UserStatus = "ativo" | "inativo" | "pendente"

export interface User {
  id: string
  nome: string
  email: string
  role: UserRole
  status: UserStatus
  ultimo_acesso: string | null
  word_conectado: boolean
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface UserPermissions {
  user_id: string
  ver_modelos: boolean
  usar_modelos: boolean
  ver_historico: boolean
  criar_modelos: boolean
  editar_modelos: boolean
  excluir_modelos: boolean
  gerenciar_usuarios: boolean
  ver_configuracoes: boolean
  editar_configuracoes: boolean
}

// -----------------------------------------
// MODELOS DE DOCUMENTO
// -----------------------------------------
export type ModeloCategoria = "contrato" | "peticao" | "procuracao" | "parecer" | "outros"
export type ModeloStatus = "sincronizado" | "pendente" | "erro"

export interface Modelo {
  id: string
  nome: string
  categoria: ModeloCategoria
  descricao: string | null
  autor_id: string
  autor_nome: string
  status: ModeloStatus
  blocos_count: number
  uso_count: number
  ultima_edicao: string
  created_at: string
  updated_at: string
}

// -----------------------------------------
// DOCUMENTOS GERADOS
// -----------------------------------------
export type DocumentoStatus = "rascunho" | "em_revisao" | "finalizado"

export interface Documento {
  id: string
  nome: string
  modelo_id: string
  modelo_nome: string
  cliente_nome: string | null
  autor_id: string
  autor_nome: string
  status: DocumentoStatus
  created_at: string
  updated_at: string
}

// -----------------------------------------
// HISTÓRICO / ATIVIDADE
// -----------------------------------------
export type AtividadeTipo = "criado" | "editado" | "utilizado" | "excluido" | "sincronizado"

export interface Atividade {
  id: string
  tipo: AtividadeTipo
  descricao: string
  documento_nome: string | null
  modelo_nome: string | null
  user_id: string
  user_nome: string
  origem: "word" | "web"
  created_at: string
}

// -----------------------------------------
// SINCRONIZAÇÕES WORD
// -----------------------------------------
export interface WordSync {
  id: string
  user_id: string
  documentos_count: number
  status: "sucesso" | "erro"
  created_at: string
}

// -----------------------------------------
// MODELOS DE PETICAO (Extensao Word - Scriptum)
// -----------------------------------------
export type TipoBase = "JUDICIAL_TJ" | "ADMINISTRATIVA_INSS"

export interface ModeloPeticao {
  id: number
  nome: string
  tipoBase: TipoBase
  descricao: string | null
  conteudoBase?: string | null
  ativo: boolean
  storage_path: string | null
}

// -----------------------------------------
// MÉTRICAS DO DASHBOARD
// -----------------------------------------
export interface DashboardMetrics {
  total_modelos: number
  total_blocos: number
  usuarios_ativos: number
  documentos_mes: number
}
