-- AlterTable
ALTER TABLE "User"
ADD COLUMN "phone" TEXT,
ADD COLUMN "instagram" TEXT,
ADD COLUMN "snapchat" TEXT;

-- AlterTable
ALTER TABLE "Review"
ADD COLUMN "spotType" TEXT,
ADD COLUMN "reaction" TEXT,
ADD COLUMN "goodFor" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "taggedPeople" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "visitDate" TIMESTAMP(3),
ADD COLUMN "liked" TEXT,
ADD COLUMN "disliked" TEXT;

-- CreateTable
CREATE TABLE "SpotList" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpotList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpotListItem" (
    "id" TEXT NOT NULL,
    "listId" TEXT NOT NULL,
    "spotId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpotListItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SpotListItem_listId_spotId_key" ON "SpotListItem"("listId", "spotId");

-- AddForeignKey
ALTER TABLE "SpotList" ADD CONSTRAINT "SpotList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpotListItem" ADD CONSTRAINT "SpotListItem_listId_fkey" FOREIGN KEY ("listId") REFERENCES "SpotList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpotListItem" ADD CONSTRAINT "SpotListItem_spotId_fkey" FOREIGN KEY ("spotId") REFERENCES "StudySpot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
