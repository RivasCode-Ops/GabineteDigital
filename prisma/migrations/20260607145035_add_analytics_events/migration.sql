-- CreateTable
CREATE TABLE "analytics_events" (
    "id" UUID NOT NULL,
    "page" VARCHAR(255) NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "label" VARCHAR(255),
    "session_id" VARCHAR(100),
    "duration" INTEGER,
    "user_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "analytics_events_page_idx" ON "analytics_events"("page");

-- CreateIndex
CREATE INDEX "analytics_events_action_idx" ON "analytics_events"("action");

-- CreateIndex
CREATE INDEX "analytics_events_created_at_idx" ON "analytics_events"("created_at");
