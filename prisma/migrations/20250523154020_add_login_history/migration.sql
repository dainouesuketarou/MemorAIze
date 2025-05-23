-- CreateTable
CREATE TABLE "LoginHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "loginAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LoginHistory_userId_loginAt_idx" ON "LoginHistory"("userId", "loginAt");

-- AddForeignKey
ALTER TABLE "LoginHistory" ADD CONSTRAINT "LoginHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
