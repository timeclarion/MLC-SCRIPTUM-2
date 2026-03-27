"use client"

import { useState, useEffect, useCallback } from "react"
import { AppLayout } from "@/components/layout"
import { 
  User, 
  Users, 
  Link2, 
  Bell, 
  Shield, 
  ChevronRight,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Mail,
  Phone,
  Building2,
  Clock,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  LogOut
} from "lucide-react"
import { cn } from "@/lib/utils"

const tabs = [
  { id: "perfil", label: "Perfil", icon: User },
  { id: "equipe", label: "Equipe", icon: Users },
  { id: "integracao", label: "Integração Word", icon: Link2 },
  { id: "notificacoes", label: "Notificações", icon: Bell },
  { id: "seguranca", label: "Segurança", icon: Shield },
]

const teamMembers: { id: string; name: string; email: string; role: string; status: string; lastAccess: string }[] = []

const initialSyncHistory: { id: string; action: string; time: string; status: string }[] = []

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState("perfil")
  
  // Profile state
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    role: ""
  })
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  
  // Notifications state
  const [notifications, setNotifications] = useState({
    newDocs: true,
    deadlines: true,
    teamActivity: false,
    systemUpdates: true
  })
  const [isSavingNotifications, setIsSavingNotifications] = useState(false)
  
  // Security state
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  
  // Word sync state
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncHistory, setSyncHistory] = useState(initialSyncHistory)
  const [lastSync, setLastSync] = useState("há 15 min")
  
  // Toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

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
  const handleSaveProfile = async () => {
    setIsSavingProfile(true)
    await new Promise(resolve => setTimeout(resolve, 1200))
    setIsSavingProfile(false)
    showToast("Perfil atualizado com sucesso", "success")
  }

  const handleSaveNotifications = async (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }))
    setIsSavingNotifications(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    setIsSavingNotifications(false)
    showToast("Preferências atualizadas", "success")
  }

  const handleChangePassword = async () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      showToast("Preencha todos os campos", "error")
      return
    }
    if (passwords.new !== passwords.confirm) {
      showToast("As senhas não coincidem", "error")
      return
    }
    if (passwords.new.length < 8) {
      showToast("A senha deve ter no mínimo 8 caracteres", "error")
      return
    }
    
    setIsChangingPassword(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsChangingPassword(false)
    setPasswords({ current: "", new: "", confirm: "" })
    showToast("Senha alterada com sucesso", "success")
  }

  const handleSync = async () => {
    if (isSyncing) return
    
    setIsSyncing(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const newSync = {
      id: String(Date.now()),
      action: "Sincronização manual",
      time: "agora",
      status: "success"
    }
    
    setSyncHistory(prev => [newSync, ...prev.slice(0, 3)])
    setLastSync("agora")
    setIsSyncing(false)
    showToast("Sincronização concluída", "success")
  }

  const handleEndSession = async (sessionId: string) => {
    showToast("Sessão encerrada", "success")
  }

  const handleInviteMember = () => {
    showToast("Convite enviado por email", "success")
  }

  return (
    <AppLayout
      title="Configurações"
      description="Gerencie as configurações do sistema"
    >
      {/* Toast Notification */}
      <div
        className={cn(
          "fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg transition-all duration-300 ease-out",
          toast 
            ? "translate-y-0 opacity-100" 
            : "translate-y-4 opacity-0 pointer-events-none",
          toast?.type === "success"
            ? "bg-[#005230] text-white"
            : "bg-red-600 text-white"
        )}
      >
        {toast?.type === "success" ? (
          <CheckCircle2 className="w-5 h-5" />
        ) : (
          <AlertCircle className="w-5 h-5" />
        )}
        <span className="text-sm font-medium">{toast?.message}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <nav className="lg:w-64 flex-shrink-0">
          <div className="bg-card rounded-xl border border-border p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-all",
                  activeTab === tab.id
                    ? "bg-primary text-white"
                    : "text-foreground-secondary hover:bg-accent hover:text-foreground"
                )}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1">
          {/* Profile Tab */}
          {activeTab === "perfil" && (
            <div className="space-y-6">
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="font-serif text-lg font-semibold text-foreground mb-6">
                  Informações Pessoais
                </h2>
                
                <div className="flex items-start gap-6 mb-8">
                  <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary text-white text-2xl font-semibold">
                    {profileData.name ? profileData.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : <User className="w-8 h-8" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-foreground">{profileData.name}</h3>
                    <p className="text-sm text-foreground-secondary">Administrador</p>
                    <button 
                      onClick={() => showToast("Funcionalidade em desenvolvimento", "success")}
                      className="mt-2 text-sm text-primary hover:text-primary-800 font-medium transition-colors"
                    >
                      Alterar foto
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Nome completo
                    </label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-secondary" />
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Telefone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-secondary" />
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Cargo
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-secondary" />
                      <input
                        type="text"
                        value={profileData.role}
                        onChange={(e) => setProfileData(prev => ({ ...prev, role: e.target.value }))}
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button 
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-primary rounded-xl hover:bg-primary-800 transition-colors disabled:opacity-70"
                  >
                    {isSavingProfile ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      "Salvar alterações"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Team Tab */}
          {activeTab === "equipe" && (
            <div className="space-y-6">
              <div className="bg-card rounded-xl border border-border">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                  <h2 className="font-serif text-lg font-semibold text-foreground">
                    Membros da Equipe
                  </h2>
                  <button 
                    onClick={handleInviteMember}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-800 active:scale-[0.98] transition-all"
                  >
                    Convidar membro
                  </button>
                </div>
                <div className="divide-y divide-border">
                  {teamMembers.length === 0 ? (
                    <div className="px-6 py-8 text-center">
                      <p className="text-sm text-[#6B6B6B]">Nenhum membro na equipe</p>
                    </div>
                  ) : (
                    teamMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between px-6 py-4 hover:bg-accent/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-medium">
                              {member.name.split(" ").map(n => n[0]).join("")}
                            </div>
                            <span className={cn(
                              "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card transition-colors",
                              member.status === "online" ? "bg-[#005230]" : "bg-[#6B6B6B]"
                            )} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{member.name}</p>
                            <p className="text-xs text-foreground-secondary">{member.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-sm text-foreground">{member.role}</p>
                            <p className="text-xs text-foreground-secondary">{member.lastAccess}</p>
                          </div>
                          <button
                            onClick={() => showToast("Redirecionando para perfil...", "success")}
                            className="p-2 rounded-lg text-foreground-secondary hover:text-foreground hover:bg-accent transition-colors"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Word Integration Tab */}
          {activeTab === "integracao" && (
            <div className="space-y-6">
              {/* Connection Status */}
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#E8F0EC]">
                    <CheckCircle2 className="w-6 h-6 text-[#005230]" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-serif text-lg font-semibold text-foreground">
                      Microsoft Word Conectado
                    </h2>
                    <p className="text-sm text-foreground-secondary mt-1">
                      O plugin está ativo e sincronizando automaticamente.
                    </p>
                  </div>
                  <button 
                    onClick={handleSync}
                    disabled={isSyncing}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all",
                      isSyncing 
                        ? "bg-primary/5 text-primary/70 cursor-not-allowed"
                        : "text-primary bg-primary/10 hover:bg-primary/20 active:scale-[0.98]"
                    )}
                  >
                    <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
                    {isSyncing ? "Sincronizando..." : "Sincronizar"}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-foreground-secondary" />
                    <div>
                      <p className="text-xs text-foreground-secondary">Última sincronização</p>
                      <p className="text-sm font-medium text-foreground">{lastSync}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link2 className="w-5 h-5 text-foreground-secondary" />
                    <div>
                      <p className="text-xs text-foreground-secondary">Versão do Plugin</p>
                      <p className="text-sm font-medium text-foreground">v2.4.1</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-foreground-secondary" />
                    <div>
                      <p className="text-xs text-foreground-secondary">Conta Microsoft</p>
                      <p className="text-sm font-medium text-foreground">joao@mlcadvogados.com</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sync Info */}
              <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      A criação e edição de documentos acontecem no Word
                    </p>
                    <p className="text-sm text-foreground-secondary mt-1">
                      Esta plataforma sincroniza automaticamente com o plugin do Word. 
                      Todos os documentos criados ou editados no Word aparecem aqui automaticamente.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sync History */}
              <div className="bg-card rounded-xl border border-border">
                <div className="px-6 py-4 border-b border-border">
                  <h3 className="font-serif text-base font-semibold text-foreground">
                    Histórico de Sincronização
                  </h3>
                </div>
                <div className="divide-y divide-border">
                  {syncHistory.length === 0 ? (
                    <div className="px-6 py-8 text-center">
                      <p className="text-sm text-[#6B6B6B]">Nenhuma sincronizacao registrada</p>
                    </div>
                  ) : (
                    syncHistory.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 px-6 py-3 hover:bg-accent/30 transition-colors">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#E8F0EC]">
                          <CheckCircle2 className="w-4 h-4 text-[#005230]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-foreground">{item.action}</p>
                        </div>
                        <span className="text-xs text-foreground-secondary">{item.time}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notificacoes" && (
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="font-serif text-lg font-semibold text-foreground mb-6">
                Preferências de Notificação
              </h2>
              
              <div className="space-y-1">
                {[
                  { key: "newDocs" as const, label: "Novos documentos sincronizados", desc: "Receba alertas quando novos documentos forem sincronizados" },
                  { key: "deadlines" as const, label: "Prazos próximos", desc: "Lembretes de prazos com 3, 7 e 15 dias de antecedência" },
                  { key: "teamActivity" as const, label: "Atividade da equipe", desc: "Atualizações sobre ações dos membros da equipe" },
                  { key: "systemUpdates" as const, label: "Atualizações do sistema", desc: "Novidades e melhorias da plataforma" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-4 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-foreground-secondary mt-0.5">{item.desc}</p>
                    </div>
                    <button 
                      onClick={() => handleSaveNotifications(item.key)}
                      className={cn(
                        "relative inline-flex items-center h-6 w-11 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20",
                        notifications[item.key] ? "bg-primary" : "bg-border"
                      )}
                    >
                      <span 
                        className={cn(
                          "inline-block w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200",
                          notifications[item.key] ? "translate-x-5" : "translate-x-0.5"
                        )}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "seguranca" && (
            <div className="space-y-6">
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="font-serif text-lg font-semibold text-foreground mb-6">
                  Senha e Autenticação
                </h2>
                
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Senha atual
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={passwords.current}
                        onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                        className="w-full px-4 py-2.5 pr-10 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-secondary hover:text-foreground transition-colors"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Nova senha
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={passwords.new}
                        onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                        className="w-full px-4 py-2.5 pr-10 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-secondary hover:text-foreground transition-colors"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-foreground-secondary mt-1">Mínimo de 8 caracteres</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Confirmar nova senha
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={passwords.confirm}
                      onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                      className="w-full px-4 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <div className="flex justify-start mt-6">
                  <button 
                    onClick={handleChangePassword}
                    disabled={isChangingPassword}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-primary rounded-xl hover:bg-primary-800 transition-colors disabled:opacity-70"
                  >
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Alterando...
                      </>
                    ) : (
                      "Alterar senha"
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-serif text-base font-semibold text-foreground mb-4">
                  Sessões Ativas
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-foreground">Este dispositivo</p>
                      <p className="text-xs text-foreground-secondary">São Paulo, Brasil • Chrome</p>
                    </div>
                    <span className="text-xs text-[#005230] font-medium">Ativa agora</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-foreground">MacBook Pro</p>
                      <p className="text-xs text-foreground-secondary">São Paulo, Brasil • Safari</p>
                    </div>
                    <button 
                      onClick={() => handleEndSession("macbook")}
                      className="flex items-center gap-1.5 text-xs text-red-600 font-medium hover:underline transition-colors"
                    >
                      <LogOut className="w-3 h-3" />
                      Encerrar
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-foreground">iPhone 15</p>
                      <p className="text-xs text-foreground-secondary">São Paulo, Brasil • App iOS</p>
                    </div>
                    <button 
                      onClick={() => handleEndSession("iphone")}
                      className="flex items-center gap-1.5 text-xs text-red-600 font-medium hover:underline transition-colors"
                    >
                      <LogOut className="w-3 h-3" />
                      Encerrar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
