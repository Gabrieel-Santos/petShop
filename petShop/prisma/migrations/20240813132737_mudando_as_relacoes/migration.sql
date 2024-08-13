/*
  Warnings:

  - You are about to drop the `_PetToServico` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_PetToServico";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "_AtendimentoToPet" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_AtendimentoToPet_A_fkey" FOREIGN KEY ("A") REFERENCES "Atendimento" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_AtendimentoToPet_B_fkey" FOREIGN KEY ("B") REFERENCES "Pet" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_AtendimentoToPet_AB_unique" ON "_AtendimentoToPet"("A", "B");

-- CreateIndex
CREATE INDEX "_AtendimentoToPet_B_index" ON "_AtendimentoToPet"("B");
