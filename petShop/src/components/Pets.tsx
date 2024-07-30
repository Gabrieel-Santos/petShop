import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Pet {
  id: number;
  nome: string;
  idade: number;
  porte: string;
  tutor: {
    nome: string;
    cpf: string;
  };
}

const Pets: React.FC = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [searchCpf, setSearchCpf] = useState("");
  const [page, setPage] = useState(1);
  const [totalPets, setTotalPets] = useState(0);
  const [limit] = useState(5); // Ajuste o limite para 5
  const navigate = useNavigate();

  const fetchPets = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await axios.get("http://localhost:5000/pets", {
          headers: { Authorization: `Bearer ${token}` },
          params: { page, limit },
        });
        setPets(response.data.pets || []);
        setTotalPets(response.data.totalPets || 0);
      } catch (error) {
        console.error("Erro ao buscar pets:", error);
        setPets([]);
        setTotalPets(0);
      }
    }
  }, [page, limit]);

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  const handleEdit = (id: number) => {
    navigate(`/edit-pet/${id}`);
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir este pet?"
    );
    if (confirmed) {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          await axios.delete(`http://localhost:5000/pets/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          alert("Pet excluído com sucesso");
          fetchPets();
        } catch (error) {
          alert("Erro ao excluir pet");
        }
      }
    }
  };

  const handleAddPet = () => {
    navigate("/add-pet");
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (token && searchCpf) {
      try {
        const response = await axios.get(
          `http://localhost:5000/pets/cpf/${searchCpf}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setPets(response.data || []);
      } catch (error) {
        alert("Erro ao buscar pet");
        setPets([]);
      }
    }
  };

  const handleClearSearch = () => {
    setSearchCpf("");
    fetchPets();
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const totalPages = Math.ceil(totalPets / limit);

  return (
    <div>
      <h2>Pets</h2>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Buscar por CPF do Tutor"
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
            <th>Nome do Pet</th>
            <th>Nome do Tutor</th>
            <th>CPF do Tutor</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {pets.length > 0 ? (
            pets.map((pet) => (
              <tr key={pet.id}>
                <td>{pet.nome}</td>
                <td>{pet.tutor.nome}</td>
                <td>{pet.tutor.cpf}</td>
                <td>
                  <button onClick={() => handleEdit(pet.id)}>Editar</button>
                  <button onClick={() => handleDelete(pet.id)}>Excluir</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4}>Nenhum pet encontrado</td>
            </tr>
          )}
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
      <button onClick={handleAddPet}>Adicionar Pet</button>
    </div>
  );
};

export default Pets;
