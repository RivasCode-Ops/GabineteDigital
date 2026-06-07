import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

async function getProgress() {
  const [territories, people, users, demands, events, surveys] = await Promise.all([
    prisma.territory.count({ where: { deletedAt: null } }),
    prisma.person.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { deletedAt: null, isActive: true } }),
    prisma.demand.count({ where: { deletedAt: null } }),
    prisma.event.count({ where: { deletedAt: null } }),
    prisma.survey.count({ where: { deletedAt: null } }),
  ]);

  return {
    territories: territories >= 1,
    users: users >= 2,
    people: people >= 10,
    demands: demands >= 3,
    events: events >= 2,
    surveys: surveys >= 1,
  };
}

const STEPS = [
  {
    id: "territories",
    label: "Criar territórios",
    desc: "Defina a hierarquia territorial do gabinete (estado → município → bairro)",
    href: "/territories",
  },
  {
    id: "users",
    label: "Criar usuários",
    desc: "Adicione coordenadores e lideranças ao sistema com suas permissões",
    href: "/admin",
  },
  {
    id: "people",
    label: "Importar pessoas",
    desc: "Cadastre as pessoas da comunidade com consentimento LGPD",
    href: "/people",
  },
  {
    id: "demands",
    label: "Criar primeira demanda",
    desc: "Registre as primeiras demandas e veja o pipeline funcionar",
    href: "/demands",
  },
  {
    id: "events",
    label: "Criar primeiro evento",
    desc: "Agende audiências, reuniões e compromissos no calendário",
    href: "/agenda",
  },
  {
    id: "surveys",
    label: "Aplicar pesquisa",
    desc: "Meça o sentimento da comunidade com pesquisas de campo",
    href: "/surveys",
  },
];

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const progress = await getProgress();
  const done = Object.values(progress).filter(Boolean).length;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Primeiros Passos</h1>
        <p className="text-gray-500 mt-1">
          Complete estes passos para configurar seu gabinete no sistema.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progresso geral</span>
          <span className="text-sm font-medium text-gray-700">{done}/{STEPS.length}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${(done / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {STEPS.map((step) => {
          const isDone = progress[step.id as keyof typeof progress];
          return (
            <a
              key={step.id}
              href={step.href}
              className={`block bg-white border rounded-lg p-4 hover:shadow-md transition-shadow ${
                isDone ? "border-emerald-200" : "border-gray-200"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    isDone
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {isDone ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-sm font-medium">{STEPS.indexOf(step) + 1}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-medium ${isDone ? "text-emerald-700" : "text-gray-900"}`}>
                    {step.label}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">{step.desc}</p>
                </div>
                <svg
                  className={`w-5 h-5 shrink-0 mt-1 ${
                    isDone ? "text-emerald-400" : "text-gray-300"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </a>
          );
        })}
      </div>

      {done === STEPS.length && (
        <div className="mt-8 bg-emerald-50 border border-emerald-200 rounded-lg p-6 text-center">
          <p className="text-emerald-800 font-medium text-lg">
            🎉 Configuração inicial completa!
          </p>
          <p className="text-emerald-600 mt-1">
            Seu gabinete está pronto. Acesse o{" "}
            <a href="/war-room" className="underline font-medium">
              War Room
            </a>{" "}
            para acompanhar os indicadores.
          </p>
        </div>
      )}
    </div>
  );
}
