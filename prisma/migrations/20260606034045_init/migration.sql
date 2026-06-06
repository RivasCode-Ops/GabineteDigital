-- CreateEnum
CREATE TYPE "RoleName" AS ENUM ('ADMIN', 'COORDENADOR_GERAL', 'COORDENADOR_REGIONAL', 'COORDENADOR_MUNICIPAL', 'LIDERANCA', 'OPERADOR');

-- CreateEnum
CREATE TYPE "TerritoryType" AS ENUM ('state', 'region', 'city', 'neighborhood', 'community');

-- CreateEnum
CREATE TYPE "PersonCategory" AS ENUM ('lideranca', 'morador', 'empresario', 'vereador', 'ex_vereador', 'presidente_associacao', 'sindicato', 'influenciador', 'parceiro_institucional');

-- CreateEnum
CREATE TYPE "DemandStatus" AS ENUM ('recebida', 'triagem', 'encaminhada', 'acompanhamento', 'resolvida', 'encerrada');

-- CreateEnum
CREATE TYPE "DemandCategory" AS ENUM ('saude', 'educacao', 'infraestrutura', 'transporte', 'agricultura', 'assistencia_social', 'regularizacao_fundiaria', 'outro');

-- CreateEnum
CREATE TYPE "DemandPriority" AS ENUM ('baixa', 'media', 'alta', 'urgente');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('visita', 'reuniao', 'evento', 'ligacao', 'atendimento');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('reuniao', 'evento', 'audiencia', 'viagem', 'visita', 'entrevista');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('scheduled', 'confirmed', 'cancelled', 'completed');

-- CreateEnum
CREATE TYPE "Sentiment" AS ENUM ('muito_favoravel', 'favoravel', 'neutro', 'resistente', 'muito_resistente');

-- CreateEnum
CREATE TYPE "AnswerType" AS ENUM ('text', 'number', 'multiple_choice', 'scale');

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "name" "RoleName" NOT NULL,
    "level" INTEGER NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role_id" UUID NOT NULL,
    "phone" VARCHAR(20),
    "avatar_url" VARCHAR(500),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "password_reset_token" VARCHAR(255),
    "password_reset_expires" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "action" VARCHAR(50) NOT NULL,
    "entity" VARCHAR(50) NOT NULL,
    "entity_id" VARCHAR(50),
    "changes" JSONB,
    "ip" VARCHAR(45),
    "user_agent" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "territories" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "type" "TerritoryType" NOT NULL,
    "parent_id" UUID,
    "slug" VARCHAR(255) NOT NULL,
    "population" INTEGER,
    "ibge_code" VARCHAR(10),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "territories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "people" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "email" VARCHAR(255),
    "category" "PersonCategory" NOT NULL,
    "territory_id" UUID,
    "contact_origin" VARCHAR(100),
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "people_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leadership_network" (
    "id" UUID NOT NULL,
    "leader_id" UUID NOT NULL,
    "superior_id" UUID,
    "role" VARCHAR(100) NOT NULL,
    "territory_id" UUID,
    "is_coordinator" BOOLEAN NOT NULL DEFAULT false,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "leadership_network_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demands" (
    "id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "category" "DemandCategory" NOT NULL,
    "status" "DemandStatus" NOT NULL DEFAULT 'recebida',
    "priority" "DemandPriority" NOT NULL DEFAULT 'media',
    "territory_id" UUID,
    "requester_id" UUID,
    "assigned_to" UUID,
    "assigned_by" UUID,
    "solution" TEXT,
    "resolved_at" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "demands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demand_history" (
    "id" UUID NOT NULL,
    "demand_id" UUID NOT NULL,
    "field" VARCHAR(50) NOT NULL,
    "old_value" TEXT,
    "new_value" TEXT,
    "changed_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "demand_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" UUID NOT NULL,
    "type" "ActivityType" NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "territory_id" UUID,
    "people_ids" JSONB,
    "performed_by" UUID,
    "performed_at" TIMESTAMP(3) NOT NULL,
    "duration_min" INTEGER,
    "location" VARCHAR(255),
    "notes" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "type" "EventType" NOT NULL,
    "territory_id" UUID,
    "start_at" TIMESTAMP(3) NOT NULL,
    "end_at" TIMESTAMP(3) NOT NULL,
    "all_day" BOOLEAN NOT NULL DEFAULT false,
    "location" VARCHAR(255),
    "address" TEXT,
    "created_by" UUID,
    "status" "EventStatus" NOT NULL DEFAULT 'scheduled',
    "notes" TEXT,
    "color" VARCHAR(7),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_participants" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "person_id" UUID NOT NULL,
    "role" VARCHAR(100),
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "surveys" (
    "id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "territory_id" UUID,
    "collected_by" UUID,
    "collected_at" TIMESTAMP(3) NOT NULL,
    "sentiment" "Sentiment" NOT NULL,
    "problems" JSONB,
    "priorities" JSONB,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "surveys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "survey_questions" (
    "id" UUID NOT NULL,
    "survey_id" UUID NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT,
    "answer_type" "AnswerType" NOT NULL DEFAULT 'text',
    "options" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "survey_questions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "roles_level_key" ON "roles"("level");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_entity_idx" ON "audit_logs"("entity");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "territories_slug_key" ON "territories"("slug");

-- CreateIndex
CREATE INDEX "territories_parent_id_idx" ON "territories"("parent_id");

-- CreateIndex
CREATE INDEX "territories_type_idx" ON "territories"("type");

-- CreateIndex
CREATE INDEX "territories_parent_id_type_idx" ON "territories"("parent_id", "type");

-- CreateIndex
CREATE INDEX "people_phone_idx" ON "people"("phone");

-- CreateIndex
CREATE INDEX "people_territory_id_idx" ON "people"("territory_id");

-- CreateIndex
CREATE INDEX "people_category_idx" ON "people"("category");

-- CreateIndex
CREATE INDEX "people_created_by_idx" ON "people"("created_by");

-- CreateIndex
CREATE INDEX "leadership_network_leader_id_idx" ON "leadership_network"("leader_id");

-- CreateIndex
CREATE INDEX "leadership_network_superior_id_idx" ON "leadership_network"("superior_id");

-- CreateIndex
CREATE INDEX "leadership_network_territory_id_idx" ON "leadership_network"("territory_id");

-- CreateIndex
CREATE INDEX "leadership_network_is_active_idx" ON "leadership_network"("is_active");

-- CreateIndex
CREATE INDEX "demands_status_idx" ON "demands"("status");

-- CreateIndex
CREATE INDEX "demands_category_idx" ON "demands"("category");

-- CreateIndex
CREATE INDEX "demands_territory_id_idx" ON "demands"("territory_id");

-- CreateIndex
CREATE INDEX "demands_requester_id_idx" ON "demands"("requester_id");

-- CreateIndex
CREATE INDEX "demands_assigned_to_idx" ON "demands"("assigned_to");

-- CreateIndex
CREATE INDEX "demands_priority_idx" ON "demands"("priority");

-- CreateIndex
CREATE INDEX "demands_created_at_idx" ON "demands"("created_at");

-- CreateIndex
CREATE INDEX "demand_history_demand_id_idx" ON "demand_history"("demand_id");

-- CreateIndex
CREATE INDEX "demand_history_changed_by_idx" ON "demand_history"("changed_by");

-- CreateIndex
CREATE INDEX "activities_type_idx" ON "activities"("type");

-- CreateIndex
CREATE INDEX "activities_territory_id_idx" ON "activities"("territory_id");

-- CreateIndex
CREATE INDEX "activities_performed_by_idx" ON "activities"("performed_by");

-- CreateIndex
CREATE INDEX "activities_performed_at_idx" ON "activities"("performed_at");

-- CreateIndex
CREATE INDEX "events_type_idx" ON "events"("type");

-- CreateIndex
CREATE INDEX "events_territory_id_idx" ON "events"("territory_id");

-- CreateIndex
CREATE INDEX "events_start_at_end_at_idx" ON "events"("start_at", "end_at");

-- CreateIndex
CREATE INDEX "events_created_by_idx" ON "events"("created_by");

-- CreateIndex
CREATE INDEX "events_status_idx" ON "events"("status");

-- CreateIndex
CREATE INDEX "event_participants_event_id_idx" ON "event_participants"("event_id");

-- CreateIndex
CREATE INDEX "event_participants_person_id_idx" ON "event_participants"("person_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_participants_event_id_person_id_key" ON "event_participants"("event_id", "person_id");

-- CreateIndex
CREATE INDEX "surveys_territory_id_idx" ON "surveys"("territory_id");

-- CreateIndex
CREATE INDEX "surveys_collected_by_idx" ON "surveys"("collected_by");

-- CreateIndex
CREATE INDEX "surveys_sentiment_idx" ON "surveys"("sentiment");

-- CreateIndex
CREATE INDEX "surveys_collected_at_idx" ON "surveys"("collected_at");

-- CreateIndex
CREATE INDEX "survey_questions_survey_id_idx" ON "survey_questions"("survey_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "territories" ADD CONSTRAINT "territories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "territories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "people" ADD CONSTRAINT "people_territory_id_fkey" FOREIGN KEY ("territory_id") REFERENCES "territories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "people" ADD CONSTRAINT "people_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leadership_network" ADD CONSTRAINT "leadership_network_leader_id_fkey" FOREIGN KEY ("leader_id") REFERENCES "people"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leadership_network" ADD CONSTRAINT "leadership_network_superior_id_fkey" FOREIGN KEY ("superior_id") REFERENCES "people"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leadership_network" ADD CONSTRAINT "leadership_network_territory_id_fkey" FOREIGN KEY ("territory_id") REFERENCES "territories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demands" ADD CONSTRAINT "demands_territory_id_fkey" FOREIGN KEY ("territory_id") REFERENCES "territories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demands" ADD CONSTRAINT "demands_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "people"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demands" ADD CONSTRAINT "demands_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demands" ADD CONSTRAINT "demands_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demands" ADD CONSTRAINT "demands_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demand_history" ADD CONSTRAINT "demand_history_demand_id_fkey" FOREIGN KEY ("demand_id") REFERENCES "demands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_territory_id_fkey" FOREIGN KEY ("territory_id") REFERENCES "territories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_territory_id_fkey" FOREIGN KEY ("territory_id") REFERENCES "territories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_participants" ADD CONSTRAINT "event_participants_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_participants" ADD CONSTRAINT "event_participants_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "people"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surveys" ADD CONSTRAINT "surveys_territory_id_fkey" FOREIGN KEY ("territory_id") REFERENCES "territories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surveys" ADD CONSTRAINT "surveys_collected_by_fkey" FOREIGN KEY ("collected_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_questions" ADD CONSTRAINT "survey_questions_survey_id_fkey" FOREIGN KEY ("survey_id") REFERENCES "surveys"("id") ON DELETE CASCADE ON UPDATE CASCADE;
