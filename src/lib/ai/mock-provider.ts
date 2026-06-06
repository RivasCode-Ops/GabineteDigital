import { AIProvider, Insight, InsightInput, Report, ReportInput, Diagnostic, TerritoryMetricData } from "./types";

let counter = 0;

function uid(): string {
  counter++;
  return `insight-${counter}-${Date.now()}`;
}

function statusLabel(score: number): string {
  if (score <= 20) return "Crítico";
  if (score <= 40) return "Fraco";
  if (score <= 60) return "Regular";
  if (score <= 80) return "Forte";
  return "Estratégico";
}

function daysSince(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export const mockAIProvider: AIProvider = {
  name: "assistente-operacional",

  async generateInsights(data: InsightInput): Promise<Insight[]> {
    const insights: Insight[] = [];

    for (const t of data.territories) {
      const days = daysSince(t.lastActivityAt);

      if (days !== null && days > 15) {
        insights.push({
          id: uid(),
          type: days > 30 ? "critical" : "warning",
          title: `${t.name} está há ${days} dias sem visitas`,
          description: `Última atividade registrada foi há ${days} dias. Recomenda-se agendar visita nas próximas 48 horas.`,
          category: "activity",
          relatedTerritory: t.name,
        });
      }

      if (t.activitiesCount === 0) {
        insights.push({
          id: uid(),
          type: "warning",
          title: `${t.name} nunca recebeu visita`,
          description: "Território sem nenhuma atividade registrada desde o cadastro.",
          category: "activity",
          relatedTerritory: t.name,
        });
      }

      if (t.openDemands > 5) {
        insights.push({
          id: uid(),
          type: t.openDemands > 15 ? "critical" : "warning",
          title: `${t.openDemands} demandas abertas em ${t.name}`,
          description: `Acúmulo de ${t.openDemands} demandas sem resolução. Priorizar triagem e encaminhamento.`,
          category: "demand",
          relatedTerritory: t.name,
          score: Math.min(t.openDemands * 5, 100),
        });
      }

      if (t.leadersCount === 0) {
        insights.push({
          id: uid(),
          type: "warning",
          title: `${t.name} não tem lideranças`,
          description: "Território sem lideranças cadastradas. Mobilização local prejudicada.",
          category: "leadership",
          relatedTerritory: t.name,
        });
      }

      if (t.surveysCount === 0) {
        insights.push({
          id: uid(),
          type: "info",
          title: `${t.name} sem pesquisas de opinião`,
          description: "Realizar pesquisa de campo para captar demanda da comunidade.",
          category: "territory",
          relatedTerritory: t.name,
        });
      }

      if (t.score >= 80) {
        insights.push({
          id: uid(),
          type: "positive",
          title: `${t.name} é território estratégico (score ${t.score})`,
          description: `Score alto: ${t.leadersCount} lideranças, ${t.activitiesCount} atividades, ${t.surveysCount} pesquisas.`,
          category: "territory",
          relatedTerritory: t.name,
          score: t.score,
        });
      }
    }

    if (data.demandsByCategory.length > 0) {
      const top = data.demandsByCategory[0];
      insights.push({
        id: uid(),
        type: "info",
        title: `Principal demanda: ${top.category} (${top.count})`,
        description: `${top.category} é a categoria com mais registros: ${top.count} demandas. Avaliar ação coordenada.`,
        category: "demand",
      });
    }

    if (data.criticalTerritories > 0) {
      insights.push({
        id: uid(),
        type: "critical",
        title: `${data.criticalTerritories} território${data.criticalTerritories > 1 ? "s" : ""} em estado crítico`,
        description: `Score abaixo de 40. Requer intervenção imediata da coordenação.`,
        category: "general",
      });
    }

    if (data.avgScore >= 60) {
      insights.push({
        id: uid(),
        type: "positive",
        title: `Score médio geral: ${data.avgScore}`,
        description: "Média geral acima de 60. Operação com desempenho satisfatório.",
        category: "general",
      });
    }

    insights.sort((a, b) => {
      const order = { critical: 0, warning: 1, info: 2, positive: 3 };
      return order[a.type] - order[b.type];
    });

    return insights.slice(0, 30);
  },

  async generateReport(input: ReportInput): Promise<Report> {
    if (input.type === "territory" && input.metrics) {
      const m = input.metrics;
      const status = statusLabel(m.score);

      return {
        title: `Diagnóstico Territorial: ${input.territoryName}`,
        summary: `${input.territoryName} apresenta score ${m.score} (${status}). ${m.peopleCount} pessoas cadastradas, ${m.leadersCount} lideranças ativas, ${m.demandsCount} demandas registradas (${m.openDemands} em aberto). ${m.activitiesCount} atividades realizadas.`,
        sections: [
          {
            heading: "Indicadores Gerais",
            content: "",
            type: "table",
            items: [
              `Pessoas: ${m.peopleCount}`,
              `Lideranças: ${m.leadersCount}`,
              `Demandas: ${m.demandsCount} (${m.openDemands} abertas, ${m.resolvedDemands} resolvidas)`,
              `Atividades: ${m.activitiesCount}`,
              `Eventos: ${m.eventsCount}`,
              `Pesquisas: ${m.surveysCount}`,
              `Score: ${m.score}/100 (${status})`,
            ],
          },
          {
            heading: "Análise",
            content: m.score >= 60
              ? `${input.territoryName} apresenta desempenho positivo. Manter ritmo de atividades e fortalecer vínculo com lideranças locais.`
              : `${input.territoryName} requer atenção. Baixo score indica necessidade de intensificar visitas, ativar lideranças e acelerar resolução de demandas.`,
            type: "text",
          },
          {
            heading: "Recomendações",
            content: "",
            type: "list",
            items: [
              m.activitiesCount === 0 ? "Iniciar agenda de visitas periódicas" : "Manter frequência de visitas",
              m.leadersCount === 0 ? "Mobilizar e cadastrar lideranças locais" : "Fortalecer rede de lideranças existente",
              m.openDemands > 5 ? `Priorizar resolução das ${m.openDemands} demandas abertas` : "Monitorar novas demandas",
              m.surveysCount === 0 ? "Realizar pesquisa de opinião com a comunidade" : "Atualizar pesquisas periódicas",
            ],
          },
        ],
        generatedAt: new Date().toISOString(),
      };
    }

    return {
      title: "Relatório Geral da Operação",
      summary: "Relatório consolidado do período.",
      sections: [],
      generatedAt: new Date().toISOString(),
    };
  },
};

export function generateDiagnostic(metrics: TerritoryMetricData): Diagnostic {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];

  if (metrics.leadersCount > 3) strengths.push(`${metrics.leadersCount} lideranças ativas`);
  else if (metrics.leadersCount === 0) weaknesses.push("Nenhuma liderança cadastrada");
  else weaknesses.push("Poucas lideranças para o território");

  if (metrics.activitiesCount > 10) strengths.push(`${metrics.activitiesCount} atividades realizadas`);
  else if (metrics.activitiesCount === 0) weaknesses.push("Nenhuma atividade registrada");
  else weaknesses.push("Poucas atividades para o território");

  if (metrics.surveysCount > 0) strengths.push(`${metrics.surveysCount} pesquisas realizadas`);
  else weaknesses.push("Nenhuma pesquisa de opinião");

  if (metrics.resolvedDemands > metrics.openDemands) strengths.push("Mais demandas resolvidas que abertas");
  else if (metrics.openDemands > 5) weaknesses.push(`${metrics.openDemands} demandas em aberto sem resolução`);

  if (metrics.eventsCount > 0) strengths.push(`${metrics.eventsCount} eventos realizados`);

  if (metrics.lastActivityAt) {
    const days = daysSince(metrics.lastActivityAt);
    if (days !== null && days < 7) strengths.push("Atividade recente (menos de 7 dias)");
    else if (days !== null && days > 15) weaknesses.push(`Sem visitas há ${days} dias`);
  }

  if (metrics.activitiesCount === 0) recommendations.push("Agendar primeira visita ao território");
  if (metrics.leadersCount === 0) recommendations.push("Identificar e cadastrar lideranças comunitárias");
  if (metrics.surveysCount === 0) recommendations.push("Realizar pesquisa de campo");
  if (metrics.openDemands > 3) recommendations.push("Priorizar resolução de demandas em aberto");
  if (metrics.score < 60) recommendations.push("Elaborar plano de ação para elevar score territorial");

  const status = statusLabel(metrics.score);

  const metricItems: Diagnostic["metrics"] = [
    { label: "Lideranças", value: metrics.leadersCount, status: metrics.leadersCount > 0 ? "good" : "bad" },
    { label: "Atividades", value: metrics.activitiesCount, status: metrics.activitiesCount > 0 ? "good" : "bad" },
    { label: "Demandas Abertas", value: metrics.openDemands, status: metrics.openDemands <= 3 ? "good" : metrics.openDemands <= 10 ? "warning" : "bad" },
    { label: "Pesquisas", value: metrics.surveysCount, status: metrics.surveysCount > 0 ? "good" : "bad" },
    { label: "Eventos", value: metrics.eventsCount, status: metrics.eventsCount > 0 ? "good" : "warning" },
  ];

  return {
    territory: metrics.name,
    score: metrics.score,
    status,
    strengths,
    weaknesses,
    recommendations,
    metrics: metricItems,
  };
}
