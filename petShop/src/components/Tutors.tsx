import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Tutor {
  id: number;
  nome: string;
  telefone: string;
  cpf: string;
}

const Tutors: React.FC = () => {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [searchCpf, setSearchCpf] = useState("");
  const [page, setPage] = useState(1);
  const [totalTutors, setTotalTutors] = useState(0);
  const [limit] = useState(5); // Ajuste o limite para 5
  const navigate = useNavigate();

  const fetchTutors = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (token) {
      const response = await axios.get("http://localhost:5000/tutors", {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, limit },
      });
      setTutors(response.data.tutors);
      setTotalTutors(response.data.totalTutors);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchTutors();
  }, [fetchTutors]);

  const handleEdit = (id: number) => {
    navigate(`/edit-tutor/${id}`);
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir este tutor?"
    );
    if (confirmed) {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          await axios.delete(`http://localhost:5000/tutors/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          alert("Tutor excluído com sucesso");
          fetchTutors();
        } catch (error) {
          alert("Erro ao excluir tutor");
        }
      }
    }
  };

  const handleAddTutor = () => {
    navigate("/add-tutor");
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (token && searchCpf) {
      try {
        const response = await axios.get(
          `http://localhost:5000/tutors/cpf/${searchCpf}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setTutors(response.data ? [response.data] : []);
      } catch (error) {
        alert("Erro ao buscar tutor");
      }
    }
  };

  const handleClearSearch = () => {
    setSearchCpf("");
    fetchTutors();
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const totalPages = Math.ceil(totalTutors / limit);

  return (
    <div>
      <h2>Tutores</h2>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Buscar por CPF"
          value={searchCpf}
          onChange={(e) => setSearchCpf(e.target.value)}
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
            <th>Telefone</th>
            <th>CPF</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {tutors.map((tutor) => (
            <tr key={tutor.id}>
              <td>{tutor.nome}</td>
              <td>{tutor.telefone}</td>
              <td>{tutor.cpf}</td>
              <td>
                <button onClick={() => handleEdit(tutor.id)}>Editar</button>
                <button onClick={() => handleDelete(tutor.id)}>Excluir</button>
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
      <button onClick={handleAddTutor}>Adicionar Tutor</button>
    </div>
  );
};

export default Tutors;
