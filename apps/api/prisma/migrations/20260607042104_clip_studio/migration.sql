-- CreateEnum
CREATE TYPE "ClipChannelStatus" AS ENUM ('INDEXING', 'ACTIVE', 'PAUSED', 'ERROR');

-- CreateEnum
CREATE TYPE "ClipStatus" AS ENUM ('PROCESSING', 'READY', 'POSTED', 'FAILED');

-- CreateEnum
CREATE TYPE "ClipPlatform" AS ENUM ('TIKTOK', 'INSTAGRAM', 'YOUTUBE_SHORTS', 'YOUTUBE');

-- CreateEnum
CREATE TYPE "ClipPostStatus" AS ENUM ('QUEUED', 'POSTED', 'FAILED');

-- CreateTable
CREATE TABLE "ClipChannel" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "youtubeChannelUrl" TEXT NOT NULL,
    "channelName" TEXT,
    "channelThumbnail" TEXT,
    "status" "ClipChannelStatus" NOT NULL DEFAULT 'INDEXING',
    "totalVideosIndexed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClipChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Clip" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sourceVideoUrl" TEXT NOT NULL,
    "sourceVideoTitle" TEXT,
    "clipTitle" TEXT,
    "clipStartSeconds" INTEGER,
    "clipEndSeconds" INTEGER,
    "clipDurationSeconds" INTEGER,
    "storagePath" TEXT,
    "publicUrl" TEXT,
    "thumbnailUrl" TEXT,
    "viralScore" INTEGER NOT NULL DEFAULT 0,
    "status" "ClipStatus" NOT NULL DEFAULT 'PROCESSING',
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Clip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClipPost" (
    "id" TEXT NOT NULL,
    "clipId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" "ClipPlatform" NOT NULL,
    "postStatus" "ClipPostStatus" NOT NULL DEFAULT 'QUEUED',
    "externalPostId" TEXT,
    "externalUrl" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "postedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClipPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClipSocialAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" "ClipPlatform" NOT NULL,
    "accountUsername" TEXT,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "tokenExpiry" TIMESTAMP(3),
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClipSocialAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClipEarning" (
    "id" TEXT NOT NULL,
    "clipId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" "ClipPlatform",
    "totalViews" INTEGER NOT NULL DEFAULT 0,
    "earningsUsd" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "ratePer1k" DECIMAL(6,4) NOT NULL DEFAULT 1.00,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClipEarning_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClipChannel_userId_idx" ON "ClipChannel"("userId");

-- CreateIndex
CREATE INDEX "ClipChannel_status_idx" ON "ClipChannel"("status");

-- CreateIndex
CREATE INDEX "Clip_channelId_idx" ON "Clip"("channelId");

-- CreateIndex
CREATE INDEX "Clip_userId_idx" ON "Clip"("userId");

-- CreateIndex
CREATE INDEX "Clip_status_idx" ON "Clip"("status");

-- CreateIndex
CREATE INDEX "Clip_viralScore_idx" ON "Clip"("viralScore");

-- CreateIndex
CREATE INDEX "ClipPost_clipId_idx" ON "ClipPost"("clipId");

-- CreateIndex
CREATE INDEX "ClipPost_userId_idx" ON "ClipPost"("userId");

-- CreateIndex
CREATE INDEX "ClipPost_platform_idx" ON "ClipPost"("platform");

-- CreateIndex
CREATE INDEX "ClipPost_postStatus_idx" ON "ClipPost"("postStatus");

-- CreateIndex
CREATE INDEX "ClipSocialAccount_userId_idx" ON "ClipSocialAccount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ClipSocialAccount_userId_platform_key" ON "ClipSocialAccount"("userId", "platform");

-- CreateIndex
CREATE INDEX "ClipEarning_clipId_idx" ON "ClipEarning"("clipId");

-- CreateIndex
CREATE INDEX "ClipEarning_userId_idx" ON "ClipEarning"("userId");

-- CreateIndex
CREATE INDEX "ClipEarning_platform_idx" ON "ClipEarning"("platform");

-- AddForeignKey
ALTER TABLE "ClipChannel" ADD CONSTRAINT "ClipChannel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Clip" ADD CONSTRAINT "Clip_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "ClipChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Clip" ADD CONSTRAINT "Clip_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClipPost" ADD CONSTRAINT "ClipPost_clipId_fkey" FOREIGN KEY ("clipId") REFERENCES "Clip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClipPost" ADD CONSTRAINT "ClipPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClipSocialAccount" ADD CONSTRAINT "ClipSocialAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClipEarning" ADD CONSTRAINT "ClipEarning_clipId_fkey" FOREIGN KEY ("clipId") REFERENCES "Clip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClipEarning" ADD CONSTRAINT "ClipEarning_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
