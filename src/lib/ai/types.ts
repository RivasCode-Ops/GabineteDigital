export interface AIProvider {
  name: string;
  generateInsights(data: InsightInput): Promise<Insight[]>;
  generateReport(data: ReportInput): Promise<Report>;
}

export interface InsightInput {
  territories: TerritoryMetricData[];
  demandsByCategory: { category: string; count: number }[];
  totalPeople: number;
  totalDemands: number;
  totalActivities: number;
  avgScore: number;
  criticalTerritories: number;
}

export interface TerritoryMetricData {
  name: string;
  type: string;
  score: number;
  peopleCount: number;
  leadersCount: number;
  demandsCount: number;
  openDemands: number;
  resolvedDemands: number;
  activitiesCount: number;
  eventsCount: number;
  surveysCount: number;
  lastActivityAt: string | null;
}

export interface Insight {
  id: string;
  type: "warning" | "positive" | "info" | "critical";
  title: string;
  description: string;
  category: "territory" | "demand" | "activity" | "leadership" | "general";
  relatedTerritory?: string;
  score?: number;
}

export interface ReportInput {
  type: "territory" | "general" | "period";
  territoryId?: string;
  territoryName?: string;
  metrics?: TerritoryMetricData;
  period?: { start: string; end: string };
}

export interface Report {
  title: string;
  summary: string;
  sections: ReportSection[];
  generatedAt: string;
}

export interface ReportSection {
  heading: string;
  content: string;
  type: "text" | "list" | "table";
  items?: string[];
}

export interface Diagnostic {
  territory: string;
  score: number;
  status: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  metrics: {
    label: string;
    value: number;
    status: "good" | "warning" | "bad";
  }[];
}
