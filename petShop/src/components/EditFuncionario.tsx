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
        alert("Funcionário atualizado com sucesso");
        navigate("/funcionarios");
      } catch (error) {
        alert("Erro ao atualizar funcionário");
      }
    }
  };

  return (
    <div>
      <h2>Editar Funcionário</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Nome:
          <input
            type="text"
            name="nome"
            value={funcionarioData.nome}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Email:
          <input
            type="email"
            name="email"
            value={funcionarioData.email}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Autoridade:
          <select
            name="autoridade"
            value={funcionarioData.autoridade}
            onChange={handleChange}
            required
          >
            <option value={1}>Funcionário</option>
            <option value={2}>Administrador</option>
          </select>
        </label>
        <button type="submit">Atualizar</button>
      </form>
    </div>
  );
};

export default EditFuncionario;
