import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register: React.FC = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [autoridade, setAutoridade] = useState(1);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/register",
        {
          nome,
          email,
          senha,
          autoridade,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Cadastro bem-sucedido");
      navigate("/home");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Erro ao registrar:", error.response?.data);
        alert(
          "Erro ao registrar: " +
            (error.response?.data.message || error.message)
        );
      } else if (error instanceof Error) {
        alert("Erro ao registrar: " + error.message);
      } else {
        alert("Erro ao registrar: Erro desconhecido");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Registrar</h2>
      <input
        type="text"
        placeholder="Nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Senha"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        required
      />
      <select
        value={autoridade}
        onChange={(e) => setAutoridade(Number(e.target.value))}
      >
        <option value={1}>Funcionário</option>
        <option value={2}>Administrador</option>
      </select>
      <button type="submit">Registrar</button>
    </form>
  );
};

export default Register;
