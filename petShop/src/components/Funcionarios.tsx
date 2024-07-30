import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Funcionario {
  id: number;
  nome: string;
  email: string;
  autoridade: number;
}

const Funcionarios: React.FC = () => {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [searchEmail, setSearchEmail] = useState("");
  const [page, setPage] = useState(1);
  const [totalFuncionarios, setTotalFuncionarios] = useState(0);
  const [limit] = useState(5);
  const navigate = useNavigate();

  const fetchFuncionarios = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (token) {
      const response = await axios.get("http://localhost:5000/funcionarios", {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, limit },
      });
      setFuncionarios(response.data.funcionarios);
      setTotalFuncionarios(response.data.totalFuncionarios);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchFuncionarios();
  }, [fetchFuncionarios]);

  const handleEdit = (id: number) => {
    navigate(`/edit-funcionario/${id}`);
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir este funcionário?"
    );
    if (confirmed) {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          await axios.delete(`http://localhost:5000/funcionarios/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          alert("Funcionário excluído com sucesso");
          fetchFuncionarios();
        } catch (error) {
          alert("Erro ao excluir funcionário");
        }
      }
    }
  };

  const handleAddFuncionario = () => {
    navigate("/register");
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (token && searchEmail) {
      try {
        const response = await axios.get(
          `http://localhost:5000/funcionarios/email/${searchEmail}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setFuncionarios(response.data ? [response.data] : []);
      } catch (error) {
        alert("Erro ao buscar funcionário");
      }
    }
  };

  const handleClearSearch = () => {
    setSearchEmail("");
    fetchFuncionarios();
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const totalPages = Math.ceil(totalFuncionarios / limit);

  return (
    <div>
      <h2>Funcionários</h2>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Buscar por Email"
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
        />
        <button type="submit">Buscar</button>
        <button type="button" onClick={handleClearSearch}>
          Limpar Busca
        </button>
      </form>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {funcionarios.map((funcionario) => (
            <tr key={funcionario.id}>
              <td>{funcionario.nome}</td>
              <td>{funcionario.email}</td>
              <td>
                <button onClick={() => handleEdit(funcionario.id)}>
                  Editar
                </button>
                <button onClick={() => handleDelete(funcionario.id)}>
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <button disabled={page <= 1} onClick={() => handlePageChange(page - 1)}>
          Anterior
        </button>
        <span>
          {page} de {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => handlePageChange(page + 1)}
        >
          Próxima
        </button>
      </div>
      <button onClick={handleAddFuncionario}>Adicionar Funcionário</button>
    </div>
  );
};

export default Funcionarios;
