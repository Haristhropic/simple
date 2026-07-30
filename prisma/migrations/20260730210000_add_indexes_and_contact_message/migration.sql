-- AlterTable: add imageUrl to Category if not already present
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;

-- CreateIndex: Product indexes for common queries
CREATE INDEX IF NOT EXISTS "Product_categoryId_idx" ON "Product"("categoryId");
CREATE INDEX IF NOT EXISTS "Product_status_idx" ON "Product"("status");
CREATE INDEX IF NOT EXISTS "Product_featured_status_idx" ON "Product"("featured", "status");

-- CreateIndex: HeroBanner active filter
CREATE INDEX IF NOT EXISTS "HeroBanner_active_idx" ON "HeroBanner"("active");

-- CreateIndex: AboutSection active filter
CREATE INDEX IF NOT EXISTS "AboutSection_active_idx" ON "AboutSection"("active");

-- CreateTable: ContactMessage
CREATE TABLE IF NOT EXISTS "ContactMessage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);
