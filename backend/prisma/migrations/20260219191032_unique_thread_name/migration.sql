/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Thread` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Thread_name_key" ON "Thread"("name");
