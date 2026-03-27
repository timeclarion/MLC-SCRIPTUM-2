export interface TourStep {
  target: string
  title: string
  description: string
  position: "top" | "right" | "bottom" | "left"
}

export const TOUR_STEPS: TourStep[] = [
  {
    target: "[data-tour='sidebar']",
    title: "Menu de navegacao",
    description:
      "Acesse todas as secoes do sistema por aqui. Dashboard, Modelos, Documentos, Usuarios e Historico.",
    position: "right",
  },
  {
    target: "[data-tour='dashboard-stats']",
    title: "Resumo do escritorio",
    description:
      "Visao rapida dos seus modelos, blocos e usuarios ativos. Os numeros atualizam em tempo real.",
    position: "bottom",
  },
  {
    target: "[data-tour='activity']",
    title: "Atividade recente",
    description:
      "Acompanhe quem criou, editou ou sincronizou documentos. Tudo registrado automaticamente.",
    position: "top",
  },
  {
    target: "[data-tour='word-sync']",
    title: "Sincronizacao com o Word",
    description:
      "Veja o status da conexao com o Microsoft Word. Documentos criados no plugin aparecem aqui automaticamente.",
    position: "left",
  },
  {
    target: "[data-tour='nav-modelos']",
    title: "Modelos",
    description:
      "Templates reutilizaveis do escritorio. Contratos, peticoes, procuracoes — todos organizados e sincronizados com o Word.",
    position: "right",
  },
  {
    target: "[data-tour='nav-documentos']",
    title: "Documentos",
    description:
      "Documentos gerados a partir dos modelos. Cada documento mantem vinculo com o modelo original.",
    position: "right",
  },
  {
    target: "[data-tour='nav-usuarios']",
    title: "Usuarios",
    description:
      "Gerencie quem tem acesso ao sistema e ao plugin do Word. Defina permissoes por funcao.",
    position: "right",
  },
  {
    target: "[data-tour='nav-historico']",
    title: "Historico",
    description:
      "Registro completo de todas as acoes. Saiba quem fez o que, quando e de onde — Web ou Word.",
    position: "right",
  },
  {
    target: "[data-tour='search']",
    title: "Busca rapida",
    description: "Encontre qualquer modelo, documento ou usuario. Atalho: Ctrl+K.",
    position: "bottom",
  },
]
