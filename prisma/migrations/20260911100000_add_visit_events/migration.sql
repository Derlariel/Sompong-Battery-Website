CREATE TABLE "VisitEvent" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisitEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "VisitEvent_createdAt_idx" ON "VisitEvent"("createdAt");
