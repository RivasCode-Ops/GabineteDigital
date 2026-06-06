import { AIProvider } from "./types";
import { mockAIProvider } from "./mock-provider";

let provider: AIProvider = mockAIProvider;

export function getAIProvider(): AIProvider {
  return provider;
}

export function setAIProvider(p: AIProvider) {
  provider = p;
}

export { type AIProvider, type Insight, type InsightInput, type Report, type ReportInput, type ReportSection, type Diagnostic } from "./types";
export { generateDiagnostic } from "./mock-provider";
