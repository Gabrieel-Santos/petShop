import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();
const SECRET_KEY = process.env.SECRET_KEY;

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
    const funcionarioExistente = await prisma.funcionario.findUnique({
      where: { email },
    });

    if (funcionarioExistente) {
      return res.status(409).json({ message: "Email já cadastrado" });
    }

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

app.get("/tutors/all", authenticateToken, async (req, res) => {
  try {
    const tutors = await prisma.tutor.findMany({
      include: {
        pets: true,
      },
    });
    res.json({ tutors });
  } catch (error) {
    console.error("Erro ao listar todos os tutores:", error);
    res.status(400).json({ message: "Erro ao listar todos os tutores" });
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

// Rota para excluir um tutor pelo ID e seus pets associados
app.delete("/tutors/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.$transaction([
      prisma.pet.deleteMany({ where: { tutorId: parseInt(id) } }),
      prisma.tutor.delete({ where: { id: parseInt(id) } }),
    ]);
    res.json({ message: "Tutor e seus pets excluídos com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir tutor e seus pets:", error);
    res.status(400).json({ message: "Erro ao excluir tutor e seus pets" });
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

// Rota para obter um pet pelo ID
app.get("/pets/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const pet = await prisma.pet.findUnique({
      where: { id: parseInt(id) },
      include: {
        tutor: true, // Inclui os dados do tutor
      },
    });
    if (!pet) {
      return res.status(404).json({ message: "Pet não encontrado" });
    }
    res.json(pet);
  } catch (error) {
    console.error("Erro ao obter pet:", error);
    res.status(400).json({ message: "Erro ao obter pet" });
  }
});

// Rota para atualizar um pet pelo ID
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
        idade: parseInt(idade),
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

// rota para excluir um pet pelo id
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

// Rota para buscar funcionário pelo ID
app.get("/funcionarios/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const funcionario = await prisma.funcionario.findUnique({
      where: { id: parseInt(id) },
    });
    res.json(funcionario);
  } catch (error) {
    console.error("Erro ao buscar funcionário por ID:", error);
    res.status(400).json({ message: "Erro ao buscar funcionário por ID" });
  }
});

// Rota para atualizar funcionário pelo ID
app.put("/funcionarios/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { nome, email, autoridade, novaSenha } = req.body;

  const data = { nome, email, autoridade };
  if (novaSenha) {
    const hashedPassword = await bcrypt.hash(novaSenha, 10);
    data.senha = hashedPassword;
  }

  try {
    const updatedFuncionario = await prisma.funcionario.update({
      where: { id: parseInt(id) },
      data,
    });
    res.json(updatedFuncionario);
  } catch (error) {
    console.error("Erro ao atualizar funcionário:", error);
    res.status(400).json({ message: "Erro ao atualizar funcionário" });
  }
});

// Rota para deletar funcionário pelo ID
app.delete("/funcionarios/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.funcionario.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: "Funcionário excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir funcionário:", error);
    res.status(400).json({ message: "Erro ao excluir funcionário" });
  }
});

// Rota para criar um novo serviço
app.post("/services", authenticateToken, async (req, res) => {
  const { nome, valor, tempoGasto } = req.body;

  try {
    // Verifica se o serviço já existe
    const existingService = await prisma.servico.findUnique({
      where: { nome },
    });

    if (existingService) {
      return res.status(409).json({ message: "Serviço já cadastrado" });
    }

    // Cria o novo serviço
    const service = await prisma.servico.create({
      data: {
        nome,
        valor: parseFloat(valor),
        tempoGasto: parseInt(tempoGasto, 10),
      },
    });

    res.status(201).json(service);
  } catch (error) {
    console.error("Erro ao criar serviço:", error);
    res.status(400).json({ message: "Erro ao criar serviço" });
  }
});

// Rota para listar serviços com paginação
app.get("/services", authenticateToken, async (req, res) => {
  const { page = 1, limit = 5 } = req.query;
  const skip = (page - 1) * limit;

  try {
    const services = await prisma.servico.findMany({
      skip: parseInt(skip),
      take: parseInt(limit),
    });
    const totalServices = await prisma.servico.count();
    res.json({ services, totalServices });
  } catch (error) {
    console.error("Erro ao listar serviços:", error);
    res.status(400).json({ message: "Erro ao listar serviços" });
  }
});

// Rota para buscar serviço pelo nome
app.get("/services/nome/:nome", authenticateToken, async (req, res) => {
  const { nome } = req.params;

  try {
    const services = await prisma.servico.findMany({
      where: {
        nome: {
          contains: nome, // Permite busca parcial pelo nome
        },
      },
    });
    res.json(services);
  } catch (error) {
    console.error("Erro ao buscar serviço:", error);
    res.status(400).json({ message: "Erro ao buscar serviço" });
  }
});

// Rota para obter um serviço pelo ID
app.get("/services/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const service = await prisma.servico.findUnique({
      where: { id: parseInt(id) },
    });

    if (!service) {
      return res.status(404).json({ message: "Serviço não encontrado" });
    }

    res.json(service);
  } catch (error) {
    console.error("Erro ao obter serviço:", error);
    res.status(400).json({ message: "Erro ao obter serviço" });
  }
});

// Rota para atualizar um serviço pelo ID
app.put("/services/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { nome, valor, tempoGasto } = req.body;

  try {
    const service = await prisma.servico.findUnique({
      where: { id: parseInt(id) },
    });

    if (!service) {
      return res.status(404).json({ message: "Serviço não encontrado" });
    }

    const updatedService = await prisma.servico.update({
      where: { id: parseInt(id) },
      data: {
        nome,
        valor: parseFloat(valor),
        tempoGasto: parseInt(tempoGasto, 10),
      },
    });

    res.json(updatedService);
  } catch (error) {
    console.error("Erro ao atualizar serviço:", error);
    res.status(400).json({ message: "Erro ao atualizar serviço" });
  }
});

// Rota para excluir um serviço pelo ID
app.delete("/services/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const service = await prisma.servico.findUnique({
      where: { id: parseInt(id) },
    });

    if (!service) {
      return res.status(404).json({ message: "Serviço não encontrado" });
    }

    await prisma.servico.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "Serviço excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir serviço:", error);
    res.status(400).json({ message: "Erro ao excluir serviço" });
  }
});

// Rota para criar um atendimento
app.post("/atendimentos", authenticateToken, async (req, res) => {
  const { data, valorTotal, petId, servicos } = req.body;

  try {
    // Cria o atendimento associando um único pet e múltiplos serviços
    const atendimento = await prisma.atendimento.create({
      data: {
        data: new Date(data), // Converte a string de data para objeto Date
        valorTotal,
        pets: {
          connect: { id: petId }, // Conecta apenas um pet pelo ID
        },
        servicos: {
          connect: servicos.map((servicoId) => ({ id: servicoId })), // Conecta múltiplos serviços pelo ID
        },
      },
    });

    // Retorna o atendimento criado
    res.status(201).json(atendimento);
  } catch (error) {
    console.error("Erro ao criar atendimento:", error);
    res.status(500).json({ message: "Erro ao criar atendimento" });
  }
});

// Rota para listar atendimentos com paginação e ordenação por data
app.get("/atendimentos", authenticateToken, async (req, res) => {
  const { page = 1, limit = 5 } = req.query;
  const skip = (page - 1) * limit;

  try {
    const atendimentos = await prisma.atendimento.findMany({
      orderBy: {
        data: "desc", // Ordena pela data em ordem decrescente (mais recente primeiro)
      },
      skip: parseInt(skip), // Aplica a paginação após a ordenação correta
      take: parseInt(limit),
      include: {
        pets: {
          include: {
            tutor: true, // Inclui o tutor do pet
          },
        },
      },
    });

    const totalAtendimentos = await prisma.atendimento.count();

    res.json({
      atendimentos,
      totalAtendimentos,
    });
  } catch (error) {
    console.error("Erro ao buscar atendimentos:", error);
    res.status(500).json({ message: "Erro ao buscar atendimentos" });
  }
});

// Rota para buscar pelo nome do tutor
app.get("/atendimentos/tutor/:nome", authenticateToken, async (req, res) => {
  const { nome } = req.params;

  try {
    const atendimentos = await prisma.atendimento.findMany({
      where: {
        pets: {
          some: {
            tutor: {
              nome: {
                contains: nome, // Remova o 'mode' pois não é suportado no SQLite
              },
            },
          },
        },
      },
      include: {
        pets: {
          include: {
            tutor: true, // Inclui o tutor do pet
          },
        },
      },
    });

    res.json(atendimentos);
  } catch (error) {
    console.error("Erro ao buscar atendimentos por tutor:", error);
    res.status(500).json({ message: "Erro ao buscar atendimentos por tutor" });
  }
});

// Rota para obter um atendimento pelo ID
app.get("/atendimentos/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const atendimento = await prisma.atendimento.findUnique({
      where: { id: parseInt(id) },
      include: {
        pets: {
          include: {
            tutor: true, // Inclui o tutor do pet
          },
        },
        servicos: true, // Inclui os serviços associados ao atendimento
      },
    });

    if (!atendimento) {
      return res.status(404).json({ message: "Atendimento não encontrado" });
    }

    res.json(atendimento);
  } catch (error) {
    console.error("Erro ao buscar atendimento por ID:", error);
    res.status(400).json({ message: "Erro ao buscar atendimento por ID" });
  }
});

// Rota para atualizar um atendimento pelo ID
app.put("/atendimentos/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { data, valorTotal, petId, servicos } = req.body;

  try {
    // Atualiza o atendimento, associando os novos pets e serviços
    const updatedAtendimento = await prisma.atendimento.update({
      where: { id: parseInt(id) },
      data: {
        data: new Date(data), // Converte a string de data para objeto Date
        valorTotal,
        pets: {
          set: [{ id: petId }], // Substitui os pets associados pelo novo pet
        },
        servicos: {
          set: servicos.map((servicoId) => ({ id: servicoId })), // Substitui os serviços associados pelos novos serviços
        },
      },
    });

    res.json(updatedAtendimento);
  } catch (error) {
    console.error("Erro ao atualizar atendimento:", error);
    res.status(500).json({ message: "Erro ao atualizar atendimento" });
  }
});

// Rota para excluir um atendimento pelo ID
app.delete("/atendimentos/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.atendimento.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: "Atendimento excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir atendimento:", error);
    res.status(500).json({ message: "Erro ao excluir atendimento" });
  }
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
