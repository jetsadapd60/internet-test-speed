-- CreateTable
CREATE TABLE "TestResult" (
    "id" TEXT NOT NULL,
    "testSessionId" TEXT NOT NULL,
    "downloadSpeed" DOUBLE PRECISION NOT NULL,
    "uploadSpeed" DOUBLE PRECISION NOT NULL,
    "ping" DOUBLE PRECISION NOT NULL,
    "jitter" DOUBLE PRECISION NOT NULL,
    "packetLoss" DOUBLE PRECISION NOT NULL,
    "healthScore" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TestResult_testSessionId_key" ON "TestResult"("testSessionId");

-- AddForeignKey
ALTER TABLE "TestResult" ADD CONSTRAINT "TestResult_testSessionId_fkey" FOREIGN KEY ("testSessionId") REFERENCES "TestSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
