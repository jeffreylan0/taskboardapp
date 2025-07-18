-- AlterTable
ALTER TABLE "User" ADD COLUMN     "taskSpacing" TEXT NOT NULL DEFAULT 'default',
ADD COLUMN     "theme" TEXT NOT NULL DEFAULT 'system';

-- CreateTable
CREATE TABLE "DefaultProperty" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PropertyType" NOT NULL,
    "options" JSONB,
    "order" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "DefaultProperty_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DefaultProperty_userId_name_key" ON "DefaultProperty"("userId", "name");

-- AddForeignKey
ALTER TABLE "DefaultProperty" ADD CONSTRAINT "DefaultProperty_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
