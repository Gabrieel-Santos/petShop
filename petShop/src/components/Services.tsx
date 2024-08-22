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

interface Service {
  id: number;
  nome: string;
  valor: number;
  tempoGasto: number;
}

const Services: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [searchName, setSearchName] = useState("");
  const [page, setPage] = useState(1);
  const [totalServices, setTotalServices] = useState(0);
  const [limit] = useState(5);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<number | null>(null);
  const navigate = useNavigate();

  const fetchServices = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await axios.get("http://localhost:5000/services", {
          headers: { Authorization: `Bearer ${token}` },
          params: { page, limit },
        });
        setServices(response.data.services || []);
        setTotalServices(response.data.totalServices || 0);
      } catch (error) {
        console.error("Erro ao buscar serviços:", error);
        setServices([]);
        setTotalServices(0);
      }
    }
  }, [page, limit]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleEdit = (id: number) => {
    navigate(`/edit-service/${id}`);
  };

  const openModal = (id: number) => {
    setServiceToDelete(id);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setServiceToDelete(null);
  };

  const handleDelete = async () => {
    if (serviceToDelete !== null) {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          await axios.delete(
            `http://localhost:5000/services/${serviceToDelete}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          fetchServices();
          closeModal();
        } catch (error) {
          alert("Erro ao excluir serviço");
          closeModal();
        }
      }
    }
  };

  const handleAddService = () => {
    navigate("/add-service");
  };

  const handleSearch = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (token && searchName) {
      try {
        const response = await axios.get(
          `http://localhost:5000/services/nome/${searchName}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setServices(response.data || []);
      } catch (error) {
        alert("Erro ao buscar serviço");
        setServices([]);
      }
    }
  };

  const handleClearSearch = () => {
    setSearchName("");
    fetchServices();
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const totalPages = Math.ceil(totalServices / limit);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center py-8"
      style={{ backgroundColor: "#98D1AA" }}
    >
      <div className="w-full max-w-4xl flex items-center space-x-2">
        <form onSubmit={handleSearch} className="flex-grow relative">
          <input
            type="text"
            placeholder="Buscar por nome do serviço"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
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
            <th className="py-2 px-4 text-left text-white">Nome do Serviço</th>
            <th className="py-2 px-4 text-left text-white">Valor</th>
            <th className="py-2 px-4 text-left text-white">
              Tempo Gasto (min)
            </th>
            <th className="py-2 px-4 text-left text-white w-16 text-center">
              <FontAwesomeIcon icon={faEllipsisV} />
            </th>
          </tr>
        </thead>
        <tbody>
          {services.length > 0 ? (
            services.map((service) => (
              <tr
                key={service.id}
                className="border-t border-gray-400 text-white"
              >
                <td className="py-2 px-4">{service.nome}</td>
                <td className="py-2 px-4">R$ {service.valor.toFixed(2)}</td>
                <td className="py-2 px-4">{service.tempoGasto}</td>
                <td className="py-2 px-4 w-32 flex justify-around items-center">
                  <button
                    onClick={() => handleEdit(service.id)}
                    className="text-blue-300 hover:text-blue-500 text-lg mx-2"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    onClick={() => openModal(service.id)}
                    className="text-red-300 hover:text-red-500 text-lg mx-2 mr-4"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4}>Nenhum serviço encontrado</td>
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
        onClick={handleAddService}
        className="mt-4 px-4 py-2 font-bold text-white rounded-md"
        style={{ backgroundColor: "#168479" }}
      >
        Cadastrar Serviço
      </button>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Confirmação de Exclusão"
        className="modal"
        overlayClassName="modal-overlay"
      >
        <h2 className="text-lg font-bold mb-4">Confirmação de Exclusão</h2>
        <p>Tem certeza que deseja excluir este serviço?</p>
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

export default Services;
