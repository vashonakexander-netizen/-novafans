-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('FAN', 'CREATOR', 'ADMIN', 'AGENCY', 'MODEL');

-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('SUBSCRIPTION', 'TIP', 'PAID_DM', 'PAID_POST', 'REFUND');

-- CreateEnum
CREATE TYPE "TransactionSource" AS ENUM ('CARD', 'CRYPTO');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'REFUNDED', 'FAILED', 'CANCELED');

-- CreateEnum
CREATE TYPE "PostVisibility" AS ENUM ('SUBSCRIBERS', 'PAID', 'PUBLIC_TEASER');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateEnum
CREATE TYPE "PurchaseType" AS ENUM ('POST', 'BUNDLE');

-- CreateEnum
CREATE TYPE "MessageSenderType" AS ENUM ('FAN', 'CREATOR', 'AI');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('REQUESTED', 'PROCESSING', 'PAID', 'REJECTED');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('NEW', 'IN_REVIEW', 'RESOLVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ImportSessionStatus" AS ENUM ('PENDING', 'READY', 'COMMITTED', 'CANCELED');

-- CreateEnum
CREATE TYPE "ImportSourceType" AS ENUM ('LOCAL', 'REMOTE');

-- CreateEnum
CREATE TYPE "CryptoInvoiceStatus" AS ENUM ('PENDING', 'PAID', 'EXPIRED', 'CANCELED');

-- CreateEnum
CREATE TYPE "LiveSessionStatus" AS ENUM ('SCHEDULED', 'LIVE', 'ENDED', 'CANCELED');

-- CreateEnum
CREATE TYPE "LiveAccessType" AS ENUM ('FREE', 'SUBSCRIBERS_ONLY', 'TICKETED');

-- CreateEnum
CREATE TYPE "AgencyClientStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MediaVaultStatus" AS ENUM ('UPLOADED', 'REVIEWED', 'APPROVED', 'SCHEDULED');

-- CreateEnum
CREATE TYPE "ScheduledPostStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'POSTED', 'FAILED');

-- CreateEnum
CREATE TYPE "AgencyMessageDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "AgencyMessageStatus" AS ENUM ('UNREAD', 'READ', 'DRAFT_PENDING', 'REPLIED');

-- CreateEnum
CREATE TYPE "AgencyPlatform" AS ENUM ('INSTAGRAM', 'REDDIT', 'TWITTER', 'ONLYFANS', 'OTHER');

-- CreateEnum
CREATE TYPE "AgencyProductType" AS ENUM ('PHOTO', 'VIDEO', 'BUNDLE', 'PPV');

-- CreateEnum
CREATE TYPE "AgencySubTier" AS ENUM ('FREE', 'PREMIUM', 'VIP');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'FAN',
    "country" TEXT,
    "dob" TIMESTAMP(3),
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "ageVerified" BOOLEAN NOT NULL DEFAULT false,
    "tosAccepted" BOOLEAN NOT NULL DEFAULT false,
    "tosAcceptedAt" TIMESTAMP(3),
    "privacyAccepted" BOOLEAN NOT NULL DEFAULT false,
    "privacyAcceptedAt" TIMESTAMP(3),
    "expoPushToken" TEXT,
    "telegramChatId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "headerImageUrl" TEXT,
    "kycStatus" "KycStatus" NOT NULL DEFAULT 'PENDING',
    "kycRef" TEXT,
    "baseSubPrice" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "aiPersonaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "aiPersonaSettings" JSONB,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreatorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "fanId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "externalSubscriptionId" TEXT,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "price" DECIMAL(65,30) NOT NULL,
    "renewsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amountGross" DECIMAL(65,30) NOT NULL,
    "platformFee" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "amountNetCreator" DECIMAL(65,30) NOT NULL,
    "externalTxnId" TEXT,
    "source" "TransactionSource" NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatorBalance" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "balanceAvailable" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "balancePending" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreatorBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayoutRequest" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "payoutMethod" TEXT NOT NULL,
    "payoutDetails" JSONB,
    "status" "PayoutStatus" NOT NULL DEFAULT 'REQUESTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayoutRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "title" TEXT,
    "body" TEXT,
    "visibility" "PostVisibility" NOT NULL DEFAULT 'PUBLIC_TEASER',
    "price" DECIMAL(65,30),
    "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "publishAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostMedia" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "mediaType" "MediaType" NOT NULL,
    "durationSeconds" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "type" "PurchaseType" NOT NULL,
    "transactionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "fanId" TEXT NOT NULL,
    "lastMessageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderType" "MessageSenderType" NOT NULL,
    "senderId" TEXT,
    "body" TEXT NOT NULL,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "price" DECIMAL(65,30),
    "mediaUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiSession" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "fanId" TEXT NOT NULL,
    "aiModel" TEXT NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "systemPrompt" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiLog" (
    "id" TEXT NOT NULL,
    "aiSessionId" TEXT NOT NULL,
    "requestPayload" JSONB NOT NULL,
    "responsePayload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ban" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "bannedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "Ban_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CryptoInvoice" (
    "id" TEXT NOT NULL,
    "fanId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "CryptoInvoiceStatus" NOT NULL DEFAULT 'PENDING',
    "processorInvoiceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "CryptoInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportSession" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "status" "ImportSessionStatus" NOT NULL DEFAULT 'PENDING',
    "totalFiles" INTEGER NOT NULL DEFAULT 0,
    "sourceType" "ImportSourceType" NOT NULL,
    "sourceUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImportSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportMedia" (
    "id" TEXT NOT NULL,
    "importSessionId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "tempFileUrl" TEXT NOT NULL,
    "mediaType" "MediaType" NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageUnlock" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "fanId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageUnlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatorReport" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolution" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreatorReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiveSession" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "LiveSessionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "accessType" "LiveAccessType" NOT NULL DEFAULT 'FREE',
    "ticketPrice" DECIMAL(65,30),
    "scheduledStartAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "streamKey" TEXT,
    "streamUrl" TEXT,
    "liveRoomId" TEXT,
    "liveStreamProvider" TEXT,
    "liveRecordingUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LiveSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiveTip" (
    "id" TEXT NOT NULL,
    "liveSessionId" TEXT NOT NULL,
    "fanId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LiveTip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiveTicketPurchase" (
    "id" TEXT NOT NULL,
    "liveSessionId" TEXT NOT NULL,
    "fanId" TEXT NOT NULL,
    "transactionId" TEXT,
    "amount" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LiveTicketPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgencyClient" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "bio" TEXT,
    "colorTag" TEXT NOT NULL DEFAULT '#8B5CF6',
    "toneProfile" TEXT,
    "payoutSplit" DOUBLE PRECISION NOT NULL DEFAULT 0.8,
    "platformLinks" JSONB,
    "avatarUrl" TEXT,
    "status" "AgencyClientStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgencyClient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgencyMediaVault" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "uploaderId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "caption" TEXT,
    "tags" TEXT[],
    "status" "MediaVaultStatus" NOT NULL DEFAULT 'UPLOADED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgencyMediaVault_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgencyScheduledPost" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "mediaId" TEXT,
    "platform" "AgencyPlatform" NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "caption" TEXT,
    "status" "ScheduledPostStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgencyScheduledPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgencyMessage" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "platform" "AgencyPlatform" NOT NULL,
    "fanName" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "direction" "AgencyMessageDirection" NOT NULL DEFAULT 'INBOUND',
    "status" "AgencyMessageStatus" NOT NULL DEFAULT 'UNREAD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgencyMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgencyAiDraft" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "draftContent" TEXT NOT NULL,
    "confidenceScore" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "rejected" BOOLEAN NOT NULL DEFAULT false,
    "editedContent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgencyAiDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgencyResponseTemplate" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgencyResponseTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgencyProduct" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(65,30) NOT NULL,
    "fileUrl" TEXT,
    "type" "AgencyProductType" NOT NULL DEFAULT 'PHOTO',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgencyProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgencyFan" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "displayName" TEXT NOT NULL,
    "email" TEXT,
    "totalSpend" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgencyFan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgencySubscription" (
    "id" TEXT NOT NULL,
    "fanId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "tier" "AgencySubTier" NOT NULL DEFAULT 'FREE',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "stripeSubscriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgencySubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgencyOrder" (
    "id" TEXT NOT NULL,
    "fanId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "stripePaymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgencyOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgencyAnalyticsEvent" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgencyAnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_telegramChatId_idx" ON "User"("telegramChatId");

-- CreateIndex
CREATE UNIQUE INDEX "CreatorProfile_userId_key" ON "CreatorProfile"("userId");

-- CreateIndex
CREATE INDEX "CreatorProfile_userId_idx" ON "CreatorProfile"("userId");

-- CreateIndex
CREATE INDEX "Subscription_fanId_idx" ON "Subscription"("fanId");

-- CreateIndex
CREATE INDEX "Subscription_creatorId_idx" ON "Subscription"("creatorId");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_fanId_creatorId_key" ON "Subscription"("fanId", "creatorId");

-- CreateIndex
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");

-- CreateIndex
CREATE INDEX "Transaction_creatorId_idx" ON "Transaction"("creatorId");

-- CreateIndex
CREATE INDEX "Transaction_status_idx" ON "Transaction"("status");

-- CreateIndex
CREATE INDEX "Transaction_externalTxnId_idx" ON "Transaction"("externalTxnId");

-- CreateIndex
CREATE UNIQUE INDEX "CreatorBalance_creatorId_key" ON "CreatorBalance"("creatorId");

-- CreateIndex
CREATE INDEX "PayoutRequest_creatorId_idx" ON "PayoutRequest"("creatorId");

-- CreateIndex
CREATE INDEX "PayoutRequest_status_idx" ON "PayoutRequest"("status");

-- CreateIndex
CREATE INDEX "Post_creatorId_idx" ON "Post"("creatorId");

-- CreateIndex
CREATE INDEX "Post_status_idx" ON "Post"("status");

-- CreateIndex
CREATE INDEX "Post_visibility_idx" ON "Post"("visibility");

-- CreateIndex
CREATE INDEX "Post_publishAt_idx" ON "Post"("publishAt");

-- CreateIndex
CREATE INDEX "PostMedia_postId_idx" ON "PostMedia"("postId");

-- CreateIndex
CREATE INDEX "Purchase_userId_idx" ON "Purchase"("userId");

-- CreateIndex
CREATE INDEX "Purchase_postId_idx" ON "Purchase"("postId");

-- CreateIndex
CREATE INDEX "Purchase_transactionId_idx" ON "Purchase"("transactionId");

-- CreateIndex
CREATE INDEX "Conversation_creatorId_idx" ON "Conversation"("creatorId");

-- CreateIndex
CREATE INDEX "Conversation_fanId_idx" ON "Conversation"("fanId");

-- CreateIndex
CREATE INDEX "Conversation_updatedAt_idx" ON "Conversation"("updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_creatorId_fanId_key" ON "Conversation"("creatorId", "fanId");

-- CreateIndex
CREATE INDEX "Message_conversationId_idx" ON "Message"("conversationId");

-- CreateIndex
CREATE INDEX "Message_senderType_idx" ON "Message"("senderType");

-- CreateIndex
CREATE INDEX "Message_createdAt_idx" ON "Message"("createdAt");

-- CreateIndex
CREATE INDEX "AiSession_conversationId_idx" ON "AiSession"("conversationId");

-- CreateIndex
CREATE INDEX "AiLog_aiSessionId_idx" ON "AiLog"("aiSessionId");

-- CreateIndex
CREATE INDEX "Report_reporterId_idx" ON "Report"("reporterId");

-- CreateIndex
CREATE INDEX "Report_status_idx" ON "Report"("status");

-- CreateIndex
CREATE INDEX "Report_targetType_targetId_idx" ON "Report"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "Ban_userId_idx" ON "Ban"("userId");

-- CreateIndex
CREATE INDEX "Ban_bannedById_idx" ON "Ban"("bannedById");

-- CreateIndex
CREATE INDEX "CryptoInvoice_fanId_idx" ON "CryptoInvoice"("fanId");

-- CreateIndex
CREATE INDEX "CryptoInvoice_creatorId_idx" ON "CryptoInvoice"("creatorId");

-- CreateIndex
CREATE INDEX "CryptoInvoice_status_idx" ON "CryptoInvoice"("status");

-- CreateIndex
CREATE INDEX "CryptoInvoice_processorInvoiceId_idx" ON "CryptoInvoice"("processorInvoiceId");

-- CreateIndex
CREATE INDEX "ImportSession_creatorId_idx" ON "ImportSession"("creatorId");

-- CreateIndex
CREATE INDEX "ImportSession_status_idx" ON "ImportSession"("status");

-- CreateIndex
CREATE INDEX "ImportMedia_importSessionId_idx" ON "ImportMedia"("importSessionId");

-- CreateIndex
CREATE INDEX "ImportMedia_creatorId_idx" ON "ImportMedia"("creatorId");

-- CreateIndex
CREATE INDEX "MessageUnlock_messageId_idx" ON "MessageUnlock"("messageId");

-- CreateIndex
CREATE INDEX "MessageUnlock_fanId_idx" ON "MessageUnlock"("fanId");

-- CreateIndex
CREATE INDEX "MessageUnlock_transactionId_idx" ON "MessageUnlock"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "MessageUnlock_messageId_fanId_key" ON "MessageUnlock"("messageId", "fanId");

-- CreateIndex
CREATE INDEX "CreatorReport_creatorId_idx" ON "CreatorReport"("creatorId");

-- CreateIndex
CREATE INDEX "CreatorReport_status_idx" ON "CreatorReport"("status");

-- CreateIndex
CREATE INDEX "CreatorReport_reporterId_idx" ON "CreatorReport"("reporterId");

-- CreateIndex
CREATE INDEX "LiveSession_creatorId_idx" ON "LiveSession"("creatorId");

-- CreateIndex
CREATE INDEX "LiveSession_status_idx" ON "LiveSession"("status");

-- CreateIndex
CREATE INDEX "LiveSession_scheduledStartAt_idx" ON "LiveSession"("scheduledStartAt");

-- CreateIndex
CREATE INDEX "LiveTip_liveSessionId_idx" ON "LiveTip"("liveSessionId");

-- CreateIndex
CREATE INDEX "LiveTip_fanId_idx" ON "LiveTip"("fanId");

-- CreateIndex
CREATE INDEX "LiveTicketPurchase_liveSessionId_idx" ON "LiveTicketPurchase"("liveSessionId");

-- CreateIndex
CREATE INDEX "LiveTicketPurchase_fanId_idx" ON "LiveTicketPurchase"("fanId");

-- CreateIndex
CREATE INDEX "LiveTicketPurchase_status_idx" ON "LiveTicketPurchase"("status");

-- CreateIndex
CREATE UNIQUE INDEX "LiveTicketPurchase_liveSessionId_fanId_key" ON "LiveTicketPurchase"("liveSessionId", "fanId");

-- CreateIndex
CREATE UNIQUE INDEX "AgencyClient_slug_key" ON "AgencyClient"("slug");

-- CreateIndex
CREATE INDEX "AgencyClient_agencyId_idx" ON "AgencyClient"("agencyId");

-- CreateIndex
CREATE INDEX "AgencyClient_slug_idx" ON "AgencyClient"("slug");

-- CreateIndex
CREATE INDEX "AgencyClient_status_idx" ON "AgencyClient"("status");

-- CreateIndex
CREATE INDEX "AgencyMediaVault_clientId_idx" ON "AgencyMediaVault"("clientId");

-- CreateIndex
CREATE INDEX "AgencyMediaVault_uploaderId_idx" ON "AgencyMediaVault"("uploaderId");

-- CreateIndex
CREATE INDEX "AgencyMediaVault_status_idx" ON "AgencyMediaVault"("status");

-- CreateIndex
CREATE INDEX "AgencyScheduledPost_clientId_idx" ON "AgencyScheduledPost"("clientId");

-- CreateIndex
CREATE INDEX "AgencyScheduledPost_scheduledAt_idx" ON "AgencyScheduledPost"("scheduledAt");

-- CreateIndex
CREATE INDEX "AgencyScheduledPost_status_idx" ON "AgencyScheduledPost"("status");

-- CreateIndex
CREATE INDEX "AgencyMessage_clientId_idx" ON "AgencyMessage"("clientId");

-- CreateIndex
CREATE INDEX "AgencyMessage_status_idx" ON "AgencyMessage"("status");

-- CreateIndex
CREATE INDEX "AgencyMessage_direction_idx" ON "AgencyMessage"("direction");

-- CreateIndex
CREATE INDEX "AgencyAiDraft_messageId_idx" ON "AgencyAiDraft"("messageId");

-- CreateIndex
CREATE INDEX "AgencyResponseTemplate_agencyId_idx" ON "AgencyResponseTemplate"("agencyId");

-- CreateIndex
CREATE INDEX "AgencyProduct_clientId_idx" ON "AgencyProduct"("clientId");

-- CreateIndex
CREATE INDEX "AgencyFan_userId_idx" ON "AgencyFan"("userId");

-- CreateIndex
CREATE INDEX "AgencyFan_email_idx" ON "AgencyFan"("email");

-- CreateIndex
CREATE INDEX "AgencySubscription_fanId_idx" ON "AgencySubscription"("fanId");

-- CreateIndex
CREATE INDEX "AgencySubscription_clientId_idx" ON "AgencySubscription"("clientId");

-- CreateIndex
CREATE INDEX "AgencySubscription_status_idx" ON "AgencySubscription"("status");

-- CreateIndex
CREATE INDEX "AgencyOrder_fanId_idx" ON "AgencyOrder"("fanId");

-- CreateIndex
CREATE INDEX "AgencyOrder_productId_idx" ON "AgencyOrder"("productId");

-- CreateIndex
CREATE INDEX "AgencyAnalyticsEvent_clientId_idx" ON "AgencyAnalyticsEvent"("clientId");

-- CreateIndex
CREATE INDEX "AgencyAnalyticsEvent_eventType_idx" ON "AgencyAnalyticsEvent"("eventType");

-- CreateIndex
CREATE INDEX "AgencyAnalyticsEvent_createdAt_idx" ON "AgencyAnalyticsEvent"("createdAt");

-- AddForeignKey
ALTER TABLE "CreatorProfile" ADD CONSTRAINT "CreatorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_fanId_fkey" FOREIGN KEY ("fanId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatorBalance" ADD CONSTRAINT "CreatorBalance_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayoutRequest" ADD CONSTRAINT "PayoutRequest_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostMedia" ADD CONSTRAINT "PostMedia_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_fanId_fkey" FOREIGN KEY ("fanId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiSession" ADD CONSTRAINT "AiSession_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiLog" ADD CONSTRAINT "AiLog_aiSessionId_fkey" FOREIGN KEY ("aiSessionId") REFERENCES "AiSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ban" ADD CONSTRAINT "Ban_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ban" ADD CONSTRAINT "Ban_bannedById_fkey" FOREIGN KEY ("bannedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CryptoInvoice" ADD CONSTRAINT "CryptoInvoice_fanId_fkey" FOREIGN KEY ("fanId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CryptoInvoice" ADD CONSTRAINT "CryptoInvoice_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportSession" ADD CONSTRAINT "ImportSession_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportMedia" ADD CONSTRAINT "ImportMedia_importSessionId_fkey" FOREIGN KEY ("importSessionId") REFERENCES "ImportSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageUnlock" ADD CONSTRAINT "MessageUnlock_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageUnlock" ADD CONSTRAINT "MessageUnlock_fanId_fkey" FOREIGN KEY ("fanId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageUnlock" ADD CONSTRAINT "MessageUnlock_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatorReport" ADD CONSTRAINT "CreatorReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatorReport" ADD CONSTRAINT "CreatorReport_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatorReport" ADD CONSTRAINT "CreatorReport_resolvedBy_fkey" FOREIGN KEY ("resolvedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveSession" ADD CONSTRAINT "LiveSession_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveTip" ADD CONSTRAINT "LiveTip_liveSessionId_fkey" FOREIGN KEY ("liveSessionId") REFERENCES "LiveSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveTip" ADD CONSTRAINT "LiveTip_fanId_fkey" FOREIGN KEY ("fanId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveTicketPurchase" ADD CONSTRAINT "LiveTicketPurchase_liveSessionId_fkey" FOREIGN KEY ("liveSessionId") REFERENCES "LiveSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveTicketPurchase" ADD CONSTRAINT "LiveTicketPurchase_fanId_fkey" FOREIGN KEY ("fanId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgencyClient" ADD CONSTRAINT "AgencyClient_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgencyMediaVault" ADD CONSTRAINT "AgencyMediaVault_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "AgencyClient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgencyMediaVault" ADD CONSTRAINT "AgencyMediaVault_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgencyScheduledPost" ADD CONSTRAINT "AgencyScheduledPost_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "AgencyClient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgencyScheduledPost" ADD CONSTRAINT "AgencyScheduledPost_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "AgencyMediaVault"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgencyMessage" ADD CONSTRAINT "AgencyMessage_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "AgencyClient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgencyAiDraft" ADD CONSTRAINT "AgencyAiDraft_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "AgencyMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgencyResponseTemplate" ADD CONSTRAINT "AgencyResponseTemplate_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgencyProduct" ADD CONSTRAINT "AgencyProduct_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "AgencyClient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgencyFan" ADD CONSTRAINT "AgencyFan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgencySubscription" ADD CONSTRAINT "AgencySubscription_fanId_fkey" FOREIGN KEY ("fanId") REFERENCES "AgencyFan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgencySubscription" ADD CONSTRAINT "AgencySubscription_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "AgencyClient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgencyOrder" ADD CONSTRAINT "AgencyOrder_fanId_fkey" FOREIGN KEY ("fanId") REFERENCES "AgencyFan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgencyOrder" ADD CONSTRAINT "AgencyOrder_productId_fkey" FOREIGN KEY ("productId") REFERENCES "AgencyProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgencyAnalyticsEvent" ADD CONSTRAINT "AgencyAnalyticsEvent_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "AgencyClient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
