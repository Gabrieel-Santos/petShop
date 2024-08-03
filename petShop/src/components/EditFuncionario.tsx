import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const EditFuncionario: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [funcionarioData, setFuncionarioData] = useState({
    nome: "",
    email: "",
    autoridade: 1,
  });
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFuncionarioData = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        const response = await axios.get(
          `http://localhost:5000/funcionarios/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setFuncionarioData(response.data);
      }
    };

    fetchFuncionarioData();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFuncionarioData({ ...funcionarioData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (token) {
      try {
        await axios.put(
          `http://localhost:5000/funcionarios/${id}`,
          funcionarioData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setErrorMessage(""); // Limpar a mensagem de erro se a atualização for bem-sucedida
        navigate("/funcionarios");
      } catch (error) {
        setErrorMessage("Erro ao atualizar funcionário");
      }
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#98D1AA" }}
    >
      <div className="w-full max-w-md p-8 space-y-6 bg-[#26A7C3] rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-white">
          Editar Funcionário
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="relative">
            <input
              type="text"
              name="nome"
              value={funcionarioData.nome}
              onChange={handleChange}
              placeholder="Nome"
              required
              className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#168479]"
            />
          </div>
          <div className="relative">
            <input
              type="email"
              name="email"
              value={funcionarioData.email}
              onChange={handleChange}
              placeholder="Email"
              required
              className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#168479]"
            />
          </div>
          <div className="relative">
            <select
              name="autoridade"
              value={funcionarioData.autoridade}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#168479]"
            >
              <option value={1}>Funcionário</option>
              <option value={2}>Administrador</option>
            </select>
          </div>
          {errorMessage && (
            <p className="text-sm font-bold text-red-600 mt-2">
              {errorMessage}
            </p>
          )}
          <button
            type="submit"
            className="w-full px-4 py-2 font-bold text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-[#168479]"
            style={{ backgroundColor: "#168479" }}
          >
            Atualizar
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditFuncionario;
