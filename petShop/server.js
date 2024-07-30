import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();
const SECRET_KEY = "your_secret_key";

app.use(cors());
app.use(bodyParser.json());

const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.get("/health", (req, res) => {
  res.json({ status: "Server is running" });
});

app.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  const funcionario = await prisma.funcionario.findUnique({ where: { email } });
  if (!funcionario) {
    return res.status(401).json({ message: "Email ou senha incorretos" });
  }

  const isPasswordValid = await bcrypt.compare(senha, funcionario.senha);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Email ou senha incorretos" });
  }

  const token = jwt.sign(
    { id: funcionario.id, autoridade: funcionario.autoridade },
    SECRET_KEY
  );
  res.json({ token });
});

app.post("/register", authenticateToken, async (req, res) => {
  const { nome, email, senha, autoridade } = req.body;

  const hashedPassword = await bcrypt.hash(senha, 10);
  try {
    const funcionario = await prisma.funcionario.create({
      data: {
        nome,
        email,
        senha: hashedPassword,
        autoridade,
      },
    });
    res.json(funcionario);
  } catch (error) {
    console.error("Erro ao registrar funcionário:", error);
    res.status(400).json({ message: "Erro ao registrar funcionário" });
  }
});

app.get("/profile", authenticateToken, async (req, res) => {
  try {
    const funcionario = await prisma.funcionario.findUnique({
      where: { id: req.user.id },
      select: {
        nome: true,
        email: true,
      },
    });
    res.json(funcionario);
  } catch (error) {
    console.error("Erro ao obter perfil:", error);
    res.status(500).json({ message: "Erro no servidor" });
  }
});

app.put("/profile", authenticateToken, async (req, res) => {
  const { nome, email, novaSenha } = req.body;

  const data = { nome, email };
  if (novaSenha) {
    const hashedPassword = await bcrypt.hash(novaSenha, 10);
    data.senha = hashedPassword;
  }

  try {
    const updatedFuncionario = await prisma.funcionario.update({
      where: { id: req.user.id },
      data,
    });
    res.json(updatedFuncionario);
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    res.status(400).json({ message: "Erro ao atualizar perfil" });
  }
});

// Rota para criar um novo tutor
app.post("/tutors", authenticateToken, async (req, res) => {
  const { nome, endereco, telefone, cpf } = req.body;

  try {
    const tutor = await prisma.tutor.create({
      data: {
        nome,
        endereco,
        telefone,
        cpf,
      },
    });
    res.json(tutor);
  } catch (error) {
    console.error("Erro ao criar tutor:", error);
    res.status(400).json({ message: "Erro ao criar tutor" });
  }
});

// Rota para listar todos os tutores com paginação
app.get("/tutors", authenticateToken, async (req, res) => {
  const { page = 1, limit = 5 } = req.query; // Ajuste o limite padrão para 5
  const skip = (page - 1) * limit;

  try {
    const tutors = await prisma.tutor.findMany({
      skip: parseInt(skip),
      take: parseInt(limit),
      include: {
        pets: true,
      },
    });
    const totalTutors = await prisma.tutor.count();
    res.json({ tutors, totalTutors });
  } catch (error) {
    console.error("Erro ao listar tutores:", error);
    res.status(400).json({ message: "Erro ao listar tutores" });
  }
});

// Rota para obter um tutor pelo ID
app.get("/tutors/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const tutor = await prisma.tutor.findUnique({
      where: { id: parseInt(id) },
    });
    res.json(tutor);
  } catch (error) {
    console.error("Erro ao obter tutor:", error);
    res.status(400).json({ message: "Erro ao obter tutor" });
  }
});

// Rota para buscar tutor pelo CPF
app.get("/tutors/cpf/:cpf", authenticateToken, async (req, res) => {
  const { cpf } = req.params;

  try {
    const tutor = await prisma.tutor.findUnique({
      where: { cpf },
    });
    res.json(tutor);
  } catch (error) {
    console.error("Erro ao buscar tutor:", error);
    res.status(400).json({ message: "Erro ao buscar tutor" });
  }
});

// Rota para atualizar um tutor pelo ID
app.put("/tutors/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { nome, endereco, telefone, cpf } = req.body;

  try {
    const updatedTutor = await prisma.tutor.update({
      where: { id: parseInt(id) },
      data: {
        nome,
        endereco,
        telefone,
        cpf,
      },
    });
    res.json(updatedTutor);
  } catch (error) {
    console.error("Erro ao atualizar tutor:", error);
    res.status(400).json({ message: "Erro ao atualizar tutor" });
  }
});

// Rota para excluir um tutor pelo ID
app.delete("/tutors/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.tutor.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: "Tutor excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir tutor:", error);
    res.status(400).json({ message: "Erro ao excluir tutor" });
  }
});

// Rota para criar um novo pet
app.post("/pets", authenticateToken, async (req, res) => {
  const { nome, idade, porte, cpfTutor } = req.body;

  try {
    const tutor = await prisma.tutor.findUnique({
      where: { cpf: cpfTutor },
    });

    if (!tutor) {
      return res.status(404).json({ message: "Tutor não encontrado" });
    }

    const pet = await prisma.pet.create({
      data: {
        nome,
        idade,
        porte,
        tutorId: tutor.id,
      },
    });
    res.json(pet);
  } catch (error) {
    console.error("Erro ao criar pet:", error);
    res.status(400).json({ message: "Erro ao criar pet" });
  }
});

// Rota para listar todos os pets
app.get("/pets", authenticateToken, async (req, res) => {
  const { page = 1, limit = 5 } = req.query;
  const skip = (page - 1) * limit;

  try {
    const pets = await prisma.pet.findMany({
      skip: parseInt(skip),
      take: parseInt(limit),
      include: {
        tutor: true,
      },
    });
    const totalPets = await prisma.pet.count();
    res.json({ pets, totalPets });
  } catch (error) {
    console.error("Erro ao listar pets:", error);
    res.status(400).json({ message: "Erro ao listar pets" });
  }
});

// Rota para buscar pets pelo CPF do tutor
app.get("/pets/cpf/:cpf", authenticateToken, async (req, res) => {
  const { cpf } = req.params;

  try {
    const pets = await prisma.pet.findMany({
      where: {
        tutor: {
          cpf,
        },
      },
      include: {
        tutor: true,
      },
    });
    res.json(pets);
  } catch (error) {
    console.error("Erro ao buscar pets por CPF:", error);
    res.status(400).json({ message: "Erro ao buscar pets por CPF" });
  }
});

app.put("/pets/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { nome, idade, porte, cpfTutor } = req.body;

  try {
    const tutor = await prisma.tutor.findUnique({
      where: { cpf: cpfTutor },
    });

    if (!tutor) {
      return res.status(404).json({ message: "Tutor não encontrado" });
    }

    const updatedPet = await prisma.pet.update({
      where: { id: parseInt(id) },
      data: {
        nome,
        idade,
        porte,
        tutorId: tutor.id,
      },
    });
    res.json(updatedPet);
  } catch (error) {
    console.error("Erro ao atualizar pet:", error);
    res.status(400).json({ message: "Erro ao atualizar pet" });
  }
});

app.delete("/pets/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.pet.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: "Pet excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir pet:", error);
    res.status(400).json({ message: "Erro ao excluir pet" });
  }
});

// Rota para listar todos os funcionários com paginação
app.get("/funcionarios", authenticateToken, async (req, res) => {
  const { page = 1, limit = 5 } = req.query; // Ajuste o limite padrão para 5
  const skip = (page - 1) * limit;

  try {
    const funcionarios = await prisma.funcionario.findMany({
      skip: parseInt(skip),
      take: parseInt(limit),
    });
    const totalFuncionarios = await prisma.funcionario.count();
    res.json({ funcionarios, totalFuncionarios });
  } catch (error) {
    console.error("Erro ao listar funcionários:", error);
    res.status(400).json({ message: "Erro ao listar funcionários" });
  }
});

// Rota para buscar funcionário pelo email
app.get("/funcionarios/email/:email", authenticateToken, async (req, res) => {
  const { email } = req.params;

  try {
    const funcionario = await prisma.funcionario.findUnique({
      where: { email },
    });
    res.json(funcionario);
  } catch (error) {
    console.error("Erro ao buscar funcionário por email:", error);
    res.status(400).json({ message: "Erro ao buscar funcionário por email" });
  }
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
