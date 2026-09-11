CREATE TABLE "VisitorSession" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisitorSession_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "VisitorSession_updatedAt_idx" ON "VisitorSession"("updatedAt");
