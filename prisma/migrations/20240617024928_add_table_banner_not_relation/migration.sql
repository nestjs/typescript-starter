-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "deleteAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Organizer" ADD COLUMN     "deleteAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Volunteer" ADD COLUMN     "deleteAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Banner" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleteAt" TIMESTAMP(3),

    CONSTRAINT "Banner_pkey" PRIMARY KEY ("id")
);
