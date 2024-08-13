-- CreateTable
CREATE TABLE "Servico" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "valor" REAL NOT NULL,
    "tempoGasto" INTEGER NOT NULL,
    "atendimentoId" INTEGER,
    CONSTRAINT "Servico_atendimentoId_fkey" FOREIGN KEY ("atendimentoId") REFERENCES "Atendimento" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Atendimento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "data" DATETIME NOT NULL,
    "valorTotal" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "_PetToServico" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_PetToServico_A_fkey" FOREIGN KEY ("A") REFERENCES "Pet" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_PetToServico_B_fkey" FOREIGN KEY ("B") REFERENCES "Servico" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Servico_nome_key" ON "Servico"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "_PetToServico_AB_unique" ON "_PetToServico"("A", "B");

-- CreateIndex
CREATE INDEX "_PetToServico_B_index" ON "_PetToServico"("B");
