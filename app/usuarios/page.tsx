"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { AppLayout } from "@/components/layout"
import { EmptyState } from "@/components/ui/empty-state"
import type { User, UserRole, UserPermissions } from "@/lib/types"
import { useUsuarios, createUsuario, updateUsuario } from "@/hooks/use-supabase"
import {
  Users,
  MoreHorizontal,
  Plus,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Check,
  X,
  KeyRound,
  UserCog,
  FileCode,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Copy
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatTimestamp } from "@/lib/format"
import { UserListSkeleton } from "@/components/ui/skeleton-loaders"

interface Permission {
  key: string
  label: string
  description: string
}

interface PermissionGroup {
  name: string
  permissions: Permission[]
}

const permissionGroups: PermissionGroup[] = [
  {
    name: "Acesso Geral",
    permissions: [
      { key: "platform_access", label: "Acessar a plataforma", description: "Permite login no sistema" },
      { key: "view_models", label: "Visualizar modelos", description: "Ver lista de modelos disponiveis" },
      { key: "view_blocks", label: "Visualizar blocos", description: "Ver biblioteca de blocos" },
    ],
  },
  {
    name: "Criacao no Word",
    permissions: [
      { key: "create_models", label: "Criar modelos", description: "Criar novos modelos no Word" },
      { key: "edit_models", label: "Editar modelos", description: "Modificar modelos existentes" },
      { key: "create_blocks", label: "Criar blocos", description: "Criar novos blocos reutilizaveis" },
      { key: "edit_blocks", label: "Editar blocos", description: "Modificar blocos existentes" },
    ],
  },
  {
    name: "Administracao",
    permissions: [
      { key: "manage_users", label: "Gerenciar usuarios", description: "Adicionar, editar e remover usuarios" },
      { key: "view_full_history", label: "Visualizar historico completo", description: "Ver todas as atividades do sistema" },
      { key: "delete_items", label: "Excluir itens", description: "Remover modelos, blocos e documentos" },
    ],
  },
]

const rolePermissions: Record<UserRole, string[]> = {
  admin: [
    "platform_access", "view_models", "view_blocks",
    "create_models", "edit_models", "create_blocks", "edit_blocks",
    "manage_users", "view_full_history", "delete_items"
  ],
  advogado: [
    "platform_access", "view_models", "view_blocks",
    "create_models", "edit_models", "create_blocks", "edit_blocks",
    "view_full_history"
  ],
  operador: [
    "platform_access", "view_models", "view_blocks"
  ],
}

const roleLabels: Record<UserRole, string> = {
  admin: "Administrador",
  advogado: "Advogado",
  operador: "Operador",
}

const roleColors: Record<UserRole, { bg: string; text: string; border: string; icon: typeof Shield }> = {
  admin: { bg: "bg-[#E8F0EC]", text: "text-[#005230]", border: "border border-[#005230]", icon: ShieldAlert },
  advogado: { bg: "bg-[#F3F2EE]", text: "text-[#6B6B6B]", border: "border border-[#E1DFDB]", icon: ShieldCheck },
  operador: { bg: "bg-[#F3F2EE]", text: "text-[#6B6B6B]", border: "border border-[#E1DFDB]", icon: Shield },
}

export default function UsuariosPage() {
  // Supabase data
  const { data: usersData, loading: usersLoading, setData: setUsersData } = useUsuarios()

  // Estado de dados
  const users = usersData ?? []
  const setUsers = (updater: (prev: User[]) => User[]) => {
    setUsersData(updater(users))
  }
  // Estado de UI
  const [search, setSearch] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userPermissions, setUserPermissions] = useState<string[]>([])
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null)
  
  // Estados dos modais
  const [showPermissionsModal, setShowPermissionsModal] = useState(false)
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false)
  const [showStatusConfirmModal, setShowStatusConfirmModal] = useState(false)
  const [showNewUserModal, setShowNewUserModal] = useState(false)
  
  // Estados de loading por acao
  const [savingPermissions, setSavingPermissions] = useState(false)
  const [resettingPassword, setResettingPassword] = useState(false)
  const [togglingStatus, setTogglingStatus] = useState(false)
  const [creatingUser, setCreatingUser] = useState(false)
  
  // Estado de feedback
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  
  // Estado do novo usuario
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "operador" as UserRole
  })
  
  // Ref para click outside
  const menuRef = useRef<HTMLDivElement>(null)
  
  // Filtro de usuarios
  const filteredUsers = users.filter(user =>
    user.nome.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  )

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowActionsMenu(null)
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

  // Handlers
  const openPermissionsModal = (user: User) => {
    setSelectedUser(user)
    setSelectedRole(user.role)
    setUserPermissions(rolePermissions[user.role])
    setShowPermissionsModal(true)
    setShowActionsMenu(null)
  }

  const openResetPasswordModal = (user: User) => {
    setSelectedUser(user)
    setShowResetPasswordModal(true)
    setShowActionsMenu(null)
  }

  const openStatusConfirmModal = (user: User) => {
    setSelectedUser(user)
    setShowStatusConfirmModal(true)
    setShowActionsMenu(null)
  }

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role)
    setUserPermissions(rolePermissions[role])
  }

  const togglePermission = (key: string) => {
    setUserPermissions(prev =>
      prev.includes(key)
        ? prev.filter(p => p !== key)
        : [...prev, key]
    )
    setSelectedRole(null)
  }

  const savePermissions = async () => {
    if (!selectedUser) return
    setSavingPermissions(true)

    if (selectedRole) {
      const { error } = await updateUsuario(selectedUser.id, { role: selectedRole })
      if (error) {
        showToast("Erro ao salvar permissoes", "error")
        setSavingPermissions(false)
        return
      }
      setUsers(prev => prev.map(u =>
        u.id === selectedUser.id ? { ...u, role: selectedRole } : u
      ))
    }

    setSavingPermissions(false)
    setShowPermissionsModal(false)
    showToast("Permissoes atualizadas com sucesso", "success")
  }

  const resetPassword = async () => {
    if (!selectedUser) return
    setResettingPassword(true)
    
    // TODO: Chamar API de reset de senha
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setResettingPassword(false)
    setShowResetPasswordModal(false)
    showToast("Email de redefinicao enviado", "success")
  }

  const toggleUserStatus = async () => {
    if (!selectedUser) return
    setTogglingStatus(true)

    const newStatus = selectedUser.status === "ativo" ? "inativo" : "ativo"

    const { error } = await updateUsuario(selectedUser.id, { status: newStatus })
    if (error) {
      showToast("Erro ao alterar status", "error")
      setTogglingStatus(false)
      return
    }

    setUsers(prev => prev.map(u =>
      u.id === selectedUser.id ? { ...u, status: newStatus } : u
    ))

    setTogglingStatus(false)
    setShowStatusConfirmModal(false)
    showToast(`Usuario ${newStatus === "ativo" ? "ativado" : "desativado"} com sucesso`, "success")
  }

  const createUser = async () => {
    if (!newUser.name || !newUser.email) return
    setCreatingUser(true)

    const { data: createdUser, error } = await createUsuario({
      nome: newUser.name,
      email: newUser.email,
      role: newUser.role,
    })

    if (error || !createdUser) {
      showToast("Erro ao criar usuario", "error")
      setCreatingUser(false)
      return
    }

    setUsers(prev => [...prev, createdUser as User])
    setCreatingUser(false)
    setShowNewUserModal(false)
    setNewUser({ name: "", email: "", role: "operador" })
    showToast("Usuario criado com sucesso", "success")
  }

  return (
    <AppLayout 
      title="Usuarios" 
      description="Gerencie os usuarios e permissoes do sistema"
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
            : "bg-[#6B6B6B] text-white"
        )}
      >
        {toast?.type === "success" ? (
          <CheckCircle2 className="w-5 h-5" />
        ) : (
          <AlertCircle className="w-5 h-5" />
        )}
        <span className="text-sm font-medium">{toast?.message}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-secondary" />
          <input
            type="text"
            placeholder="Buscar usuarios..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>
        
        <button
          onClick={() => setShowNewUserModal(true)}
          className="inline-flex items-center justify-center gap-2 h-10 px-4 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-800 transition-colors active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Novo Usuario
        </button>
      </div>

      {/* Info */}
      <div className="bg-[#E8F0EC] border border-[#005230]/20 rounded-lg p-4 mb-6">
        <p className="text-sm text-[#005230]">
          <strong>Plugin Word:</strong> As permissoes definidas aqui controlam o que cada usuario pode fazer no plugin do Microsoft Word.
        </p>
      </div>

      {/* Lista de usuarios ou empty state */}
      {usersLoading ? (
        <UserListSkeleton count={4} />
      ) : users.length === 0 ? (
        <div className="bg-card rounded-xl border border-border">
          <EmptyState
            icon={Users}
            title="Nenhum usuario cadastrado"
            description="Adicione usuarios para gerenciar permissoes do sistema."
            action={{
              label: "Adicionar Usuario",
              onClick: () => setShowNewUserModal(true)
            }}
          />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12">
          <div className="text-center">
            <Search className="w-12 h-12 text-foreground-secondary/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Nenhum resultado encontrado</h3>
            <p className="text-sm text-foreground-secondary">Tente ajustar o termo de busca.</p>
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border divide-y divide-border" ref={menuRef}>
          {filteredUsers.map((user) => {
            const roleConfig = roleColors[user.role]
            const RoleIcon = roleConfig.icon
            
            return (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 hover:bg-accent/30 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#E8F0EC] text-[#005230] font-medium flex-shrink-0">
                    {user.nome.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-foreground truncate">
                        {user.nome}
                      </h3>
                      {user.status === "inativo" && (
                        <span className="px-1.5 py-0.5 text-xs bg-[#F3F2EE] text-[#6B6B6B] border border-[#E1DFDB] rounded">
                          Inativo
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-foreground-secondary truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className={cn(
                    "inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-md",
                    roleConfig.bg, roleConfig.text, roleConfig.border
                  )}>
                    <RoleIcon className="w-3.5 h-3.5" />
                    {roleLabels[user.role]}
                  </span>
                  
                  <div className="flex items-center gap-2 text-xs text-foreground-secondary">
                    <span className={cn(
                      "w-2 h-2 rounded-full",
                      user.word_conectado ? "bg-[#005230]" : "bg-[#E1DFDB]"
                    )} />
                    Word
                  </div>
                  
                  <div className="relative">
                    <button
                      onClick={() => setShowActionsMenu(showActionsMenu === user.id ? null : user.id)}
                      className="p-2 rounded-lg hover:bg-accent transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4 text-foreground-secondary" />
                    </button>
                    
                    {showActionsMenu === user.id && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg z-50 py-1 animate-in fade-in-0 zoom-in-95">
                        <button
                          onClick={() => openPermissionsModal(user)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                        >
                          <UserCog className="w-4 h-4" />
                          Editar Permissoes
                        </button>
                        <button
                          onClick={() => openResetPasswordModal(user)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                        >
                          <KeyRound className="w-4 h-4" />
                          Redefinir Senha
                        </button>
                        <hr className="my-1 border-border" />
                        <button
                          onClick={() => openStatusConfirmModal(user)}
                          className={cn(
                            "flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors",
                            user.status === "ativo"
                              ? "text-[#6B6B6B] hover:bg-[#F3F2EE]"
                              : "text-[#005230] hover:bg-[#E8F0EC]"
                          )}
                        >
                          {user.status === "ativo" ? (
                            <>
                              <X className="w-4 h-4" />
                              Desativar
                            </>
                          ) : (
                            <>
                              <Check className="w-4 h-4" />
                              Ativar
                            </>
                          )}
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

      {/* Modal de Permissoes */}
      {showPermissionsModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => !savingPermissions && setShowPermissionsModal(false)} 
          />
          <div className="relative bg-card rounded-xl border border-border w-full max-w-xl p-6 mx-4 max-h-[90vh] overflow-y-auto animate-in fade-in-0 zoom-in-95">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-lg font-medium text-foreground">
                  Permissoes de {selectedUser.nome}
                </h2>
                <p className="text-sm text-foreground-secondary mt-1">
                  Defina o que este usuario pode fazer no sistema e no plugin Word.
                </p>
              </div>
              <button
                onClick={() => setShowPermissionsModal(false)}
                disabled={savingPermissions}
                className="p-1 rounded hover:bg-accent transition-colors"
              >
                <X className="w-5 h-5 text-foreground-secondary" />
              </button>
            </div>

            {/* Perfis base */}
            <div className="mb-6">
              <p className="text-xs text-foreground-secondary uppercase tracking-wider mb-3">
                Perfil Base
              </p>
              <div className="flex gap-2">
                {(Object.keys(roleLabels) as UserRole[]).map((role) => {
                  const config = roleColors[role]
                  const Icon = config.icon
                  return (
                    <button
                      key={role}
                      onClick={() => handleRoleChange(role)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors",
                        selectedRole === role
                          ? "bg-primary border-primary text-white"
                          : "bg-background border-border text-foreground hover:bg-accent"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {roleLabels[role]}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Permissoes detalhadas */}
            <div className="space-y-6">
              {permissionGroups.map((group) => (
                <div key={group.name}>
                  <p className="text-xs text-foreground-secondary uppercase tracking-wider mb-3">
                    {group.name}
                  </p>
                  <div className="space-y-2">
                    {group.permissions.map((perm) => (
                      <label
                        key={perm.key}
                        className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/30 cursor-pointer transition-colors"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {perm.label}
                          </p>
                          <p className="text-xs text-foreground-secondary">
                            {perm.description}
                          </p>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={userPermissions.includes(perm.key)}
                          onClick={() => togglePermission(perm.key)}
                          className={cn(
                            "relative w-10 h-6 rounded-full transition-colors",
                            userPermissions.includes(perm.key) ? "bg-[#005230]" : "bg-[#E1DFDB]"
                          )}
                        >
                          <span
                            className={cn(
                              "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform shadow-sm",
                              userPermissions.includes(perm.key) ? "left-5" : "left-1"
                            )}
                          />
                        </button>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
              <button
                onClick={() => setShowPermissionsModal(false)}
                disabled={savingPermissions}
                className="px-4 py-2 text-sm font-medium text-foreground-secondary hover:text-foreground transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={savePermissions}
                disabled={savingPermissions}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-800 transition-colors disabled:opacity-50"
              >
                {savingPermissions ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Permissoes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reset Password */}
      {showResetPasswordModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => !resettingPassword && setShowResetPasswordModal(false)} 
          />
          <div className="relative bg-card rounded-xl border border-border w-full max-w-md p-6 mx-4 animate-in fade-in-0 zoom-in-95">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-[#F3F2EE]">
                <KeyRound className="w-6 h-6 text-[#6B6B6B]" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-foreground">
                  Redefinir Senha
                </h2>
                <p className="text-sm text-foreground-secondary mt-1">
                  Um email sera enviado para <strong>{selectedUser.email}</strong> com instrucoes para criar uma nova senha.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowResetPasswordModal(false)}
                disabled={resettingPassword}
                className="px-4 py-2 text-sm font-medium text-foreground-secondary hover:text-foreground transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={resetPassword}
                disabled={resettingPassword}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#005230] rounded-lg hover:bg-[#003d24] transition-colors disabled:opacity-50"
              >
                {resettingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar Email"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Status Confirm */}
      {showStatusConfirmModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => !togglingStatus && setShowStatusConfirmModal(false)} 
          />
          <div className="relative bg-card rounded-xl border border-border w-full max-w-md p-6 mx-4 animate-in fade-in-0 zoom-in-95">
            <div className="flex items-start gap-4">
              <div className={cn(
                "p-3 rounded-full",
                selectedUser.status === "ativo" ? "bg-[#F3F2EE]" : "bg-[#E8F0EC]"
              )}>
                {selectedUser.status === "ativo" ? (
                  <X className="w-6 h-6 text-[#6B6B6B]" />
                ) : (
                  <Check className="w-6 h-6 text-[#005230]" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-medium text-foreground">
                  {selectedUser.status === "ativo" ? "Desativar" : "Ativar"} Usuario
                </h2>
                <p className="text-sm text-foreground-secondary mt-1">
                  {selectedUser.status === "ativo" 
                    ? `${selectedUser.nome} nao podera mais acessar o sistema ou o plugin do Word.`
                    : `${selectedUser.nome} podera acessar o sistema e o plugin do Word novamente.`
                  }
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowStatusConfirmModal(false)}
                disabled={togglingStatus}
                className="px-4 py-2 text-sm font-medium text-foreground-secondary hover:text-foreground transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={toggleUserStatus}
                disabled={togglingStatus}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50",
                  selectedUser.status === "ativo"
                    ? "bg-[#6B6B6B] hover:bg-[#555555]"
                    : "bg-[#005230] hover:bg-[#003d24]"
                )}
              >
                {togglingStatus ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  selectedUser.status === "ativo" ? "Desativar" : "Ativar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Novo Usuario */}
      {showNewUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => !creatingUser && setShowNewUserModal(false)} 
          />
          <div className="relative bg-card rounded-xl border border-border w-full max-w-md p-6 mx-4 animate-in fade-in-0 zoom-in-95">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-lg font-medium text-foreground">
                  Novo Usuario
                </h2>
                <p className="text-sm text-foreground-secondary mt-1">
                  Adicione um novo usuario ao sistema.
                </p>
              </div>
              <button
                onClick={() => setShowNewUserModal(false)}
                disabled={creatingUser}
                className="p-1 rounded hover:bg-accent transition-colors"
              >
                <X className="w-5 h-5 text-foreground-secondary" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-foreground-secondary uppercase tracking-wider mb-1.5 block">
                  Nome
                </label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome completo"
                  className="w-full h-10 px-3 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
              </div>
              
              <div>
                <label className="text-xs text-foreground-secondary uppercase tracking-wider mb-1.5 block">
                  Email
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@exemplo.com"
                  className="w-full h-10 px-3 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
              </div>
              
              <div>
                <label className="text-xs text-foreground-secondary uppercase tracking-wider mb-1.5 block">
                  Perfil
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value as UserRole }))}
                  className="w-full h-10 px-3 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                >
                  {(Object.keys(roleLabels) as UserRole[]).map(role => (
                    <option key={role} value={role}>{roleLabels[role]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowNewUserModal(false)}
                disabled={creatingUser}
                className="px-4 py-2 text-sm font-medium text-foreground-secondary hover:text-foreground transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={createUser}
                disabled={creatingUser || !newUser.name || !newUser.email}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-800 transition-colors disabled:opacity-50"
              >
                {creatingUser ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Criar Usuario
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
