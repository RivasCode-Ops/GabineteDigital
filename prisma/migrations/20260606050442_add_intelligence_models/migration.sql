-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('TERRITORIO_SEM_VISITA', 'DEMANDA_ATRASADA', 'LIDERANCA_INATIVA', 'SEM_PESQUISA', 'SEM_EVENTO');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('baixo', 'medio', 'alto', 'critico');

-- CreateTable
CREATE TABLE "territory_metrics" (
    "id" UUID NOT NULL,
    "territory_id" UUID NOT NULL,
    "people_count" INTEGER NOT NULL DEFAULT 0,
    "leaders_count" INTEGER NOT NULL DEFAULT 0,
    "demands_count" INTEGER NOT NULL DEFAULT 0,
    "open_demands" INTEGER NOT NULL DEFAULT 0,
    "resolved_demands" INTEGER NOT NULL DEFAULT 0,
    "activities_count" INTEGER NOT NULL DEFAULT 0,
    "events_count" INTEGER NOT NULL DEFAULT 0,
    "surveys_count" INTEGER NOT NULL DEFAULT 0,
    "last_activity_at" TIMESTAMP(3),
    "score" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "territory_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" UUID NOT NULL,
    "territory_id" UUID,
    "type" "AlertType" NOT NULL,
    "severity" "AlertSeverity" NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "territory_metrics_territory_id_key" ON "territory_metrics"("territory_id");

-- CreateIndex
CREATE INDEX "territory_metrics_score_idx" ON "territory_metrics"("score");

-- CreateIndex
CREATE INDEX "territory_metrics_territory_id_idx" ON "territory_metrics"("territory_id");

-- CreateIndex
CREATE INDEX "alerts_territory_id_idx" ON "alerts"("territory_id");

-- CreateIndex
CREATE INDEX "alerts_type_idx" ON "alerts"("type");

-- CreateIndex
CREATE INDEX "alerts_severity_idx" ON "alerts"("severity");

-- CreateIndex
CREATE INDEX "alerts_resolved_at_idx" ON "alerts"("resolved_at");

-- AddForeignKey
ALTER TABLE "territory_metrics" ADD CONSTRAINT "territory_metrics_territory_id_fkey" FOREIGN KEY ("territory_id") REFERENCES "territories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_territory_id_fkey" FOREIGN KEY ("territory_id") REFERENCES "territories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
