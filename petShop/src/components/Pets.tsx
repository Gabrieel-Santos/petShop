import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faTimes,
  faTrash,
  faEdit,
  faEllipsisV,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "react-modal";

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
  const [limit] = useState(5);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [petToDelete, setPetToDelete] = useState<number | null>(null);
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

  const openModal = (id: number) => {
    setPetToDelete(id);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setPetToDelete(null);
  };

  const handleDelete = async () => {
    if (petToDelete !== null) {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          await axios.delete(`http://localhost:5000/pets/${petToDelete}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          fetchPets();
          closeModal();
        } catch (error) {
          alert("Erro ao excluir pet");
          closeModal();
        }
      }
    }
  };

  const handleAddPet = () => {
    navigate("/add-pet");
  };

  const handleSearch = async (e: React.FormEvent | React.MouseEvent) => {
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
    <div
      className="min-h-screen flex flex-col items-center justify-center py-8"
      style={{ backgroundColor: "#98D1AA" }}
    >
      <div className="w-full max-w-4xl flex items-center space-x-2">
        <form onSubmit={handleSearch} className="flex-grow relative">
          <input
            type="text"
            placeholder="Buscar por CPF do Tutor"
            value={searchCpf}
            onChange={(e) => setSearchCpf(e.target.value)}
            className="w-full pl-10 pr-10 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#168479]"
          />
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
          />
          <FontAwesomeIcon
            icon={faTimes}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
            onClick={handleClearSearch}
          />
        </form>
        <button
          onClick={handleSearch}
          className="px-4 py-2 font-bold text-white rounded-md"
          style={{ backgroundColor: "#168479" }}
        >
          Pesquisar
        </button>
      </div>
      <table className="mt-4 w-full max-w-4xl bg-[#168479] rounded-md shadow-md">
        <thead>
          <tr>
            <th className="py-2 px-4 text-left text-white">Nome do Pet</th>
            <th className="py-2 px-4 text-left text-white">Nome do Tutor</th>
            <th className="py-2 px-4 text-left text-white">CPF do Tutor</th>
            <th className="py-2 px-4 text-left text-white w-16 text-center">
              <FontAwesomeIcon icon={faEllipsisV} />
            </th>
          </tr>
        </thead>
        <tbody>
          {pets.length > 0 ? (
            pets.map((pet) => (
              <tr key={pet.id} className="border-t border-gray-400 text-white">
                <td className="py-2 px-4">{pet.nome}</td>
                <td className="py-2 px-4">{pet.tutor.nome}</td>
                <td className="py-2 px-4">{pet.tutor.cpf}</td>
                <td className="py-2 px-4 w-32 flex justify-around items-center">
                  <button
                    onClick={() => handleEdit(pet.id)}
                    className="text-blue-300 hover:text-blue-500 text-lg mx-2"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    onClick={() => openModal(pet.id)}
                    className="text-red-300 hover:text-red-500 text-lg mx-2 mr-4"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
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
      <div className="flex items-center space-x-2 mt-4 text-white">
        <button
          disabled={page <= 1}
          onClick={() => handlePageChange(page - 1)}
          className="px-4 py-2 font-bold rounded-md"
          style={{ backgroundColor: page <= 1 ? "#ccc" : "#168479" }}
        >
          Anterior
        </button>
        <span className="font-bold">
          {page} de {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => handlePageChange(page + 1)}
          className="px-4 py-2 font-bold rounded-md"
          style={{ backgroundColor: page >= totalPages ? "#ccc" : "#168479" }}
        >
          Próxima
        </button>
      </div>
      <button
        onClick={handleAddPet}
        className="mt-4 px-4 py-2 font-bold text-white rounded-md"
        style={{ backgroundColor: "#168479" }}
      >
        Cadastrar Pet
      </button>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Confirmação de Exclusão"
        className="modal"
        overlayClassName="modal-overlay"
      >
        <h2 className="text-lg font-bold mb-4">Confirmação de Exclusão</h2>
        <p>Tem certeza que deseja excluir este pet?</p>
        <div className="flex justify-end mt-4">
          <button
            onClick={closeModal}
            className="px-4 py-2 mr-2 bg-gray-300 rounded-md"
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500 text-white rounded-md"
          >
            Excluir
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Pets;
