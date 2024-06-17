/*
  Warnings:

  - The primary key for the `Event` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Organizer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Volunteer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[cnpj]` on the table `Organizer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cpf]` on the table `Volunteer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cnpj` to the `Organizer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `Organizer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cpf` to the `Volunteer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `Volunteer` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_organizerId_fkey";

-- DropForeignKey
ALTER TABLE "Volunteer" DROP CONSTRAINT "Volunteer_eventId_fkey";

-- AlterTable
ALTER TABLE "Event" DROP CONSTRAINT "Event_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "organizerId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Event_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Event_id_seq";

-- AlterTable
ALTER TABLE "Organizer" DROP CONSTRAINT "Organizer_pkey",
ADD COLUMN     "cnpj" TEXT NOT NULL,
ADD COLUMN     "password" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Organizer_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Organizer_id_seq";

-- AlterTable
ALTER TABLE "Volunteer" DROP CONSTRAINT "Volunteer_pkey",
ADD COLUMN     "cpf" TEXT NOT NULL,
ADD COLUMN     "password" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "eventId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Volunteer_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Volunteer_id_seq";

-- CreateIndex
CREATE UNIQUE INDEX "Organizer_cnpj_key" ON "Organizer"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "Volunteer_cpf_key" ON "Volunteer"("cpf");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "Organizer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Volunteer" ADD CONSTRAINT "Volunteer_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
