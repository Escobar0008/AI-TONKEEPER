-- CreateEnum
CREATE TYPE "KYCFileType" AS ENUM ('ID_DOCUMENT', 'SELFIE', 'ADDRESS_PROOF');

-- CreateEnum
CREATE TYPE "KYCStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED');

-- CreateTable
CREATE TABLE "KYCApplication" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "birthDate" TIMESTAMP(3),
    "country" TEXT,
    "status" "KYCStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KYCApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KYCDocument" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "type" "KYCFileType" NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileData" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KYCDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "KYCApplication_userId_key" ON "KYCApplication"("userId");

-- CreateIndex
CREATE INDEX "KYCApplication_status_idx" ON "KYCApplication"("status");

-- CreateIndex
CREATE INDEX "KYCApplication_createdAt_idx" ON "KYCApplication"("createdAt");

-- CreateIndex
CREATE INDEX "KYCDocument_applicationId_idx" ON "KYCDocument"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "KYCDocument_applicationId_type_key" ON "KYCDocument"("applicationId", "type");

-- AddForeignKey
ALTER TABLE "KYCApplication" ADD CONSTRAINT "KYCApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KYCDocument" ADD CONSTRAINT "KYCDocument_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "KYCApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
