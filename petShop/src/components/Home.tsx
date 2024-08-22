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
  faFilePdf,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "react-modal";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Pet {
  nome: string;
  tutor: {
    nome: string;
  };
}

interface Atendimento {
  id: number;
  data: string;
  valorTotal: number;
  pets: Pet[];
}

const Home: React.FC = () => {
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
  const [searchTutor, setSearchTutor] = useState("");
  const [page, setPage] = useState(1);
  const [totalAtendimentos, setTotalAtendimentos] = useState(0);
  const [limit] = useState(5);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [atendimentoToDelete, setAtendimentoToDelete] = useState<number | null>(
    null
  );
  const navigate = useNavigate();

  const fetchAtendimentos = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await axios.get("http://localhost:5000/atendimentos", {
          headers: { Authorization: `Bearer ${token}` },
          params: { page, limit },
        });
        setAtendimentos(response.data.atendimentos || []);
        setTotalAtendimentos(response.data.totalAtendimentos || 0);
      } catch (error) {
        console.error("Erro ao buscar atendimentos:", error);
        setAtendimentos([]);
        setTotalAtendimentos(0);
      }
    }
  }, [page, limit]);

  useEffect(() => {
    fetchAtendimentos();
  }, [fetchAtendimentos]);

  const handleEdit = (id: number) => {
    navigate(`/edit-atendimento/${id}`);
  };

  const openModal = (id: number) => {
    setAtendimentoToDelete(id);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setAtendimentoToDelete(null);
  };

  const handleDelete = async () => {
    if (atendimentoToDelete !== null) {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          await axios.delete(
            `http://localhost:5000/atendimentos/${atendimentoToDelete}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          fetchAtendimentos();
          closeModal();
        } catch (error) {
          alert("Erro ao excluir atendimento");
          closeModal();
        }
      }
    }
  };

  const handleSearch = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (token && searchTutor) {
      try {
        const response = await axios.get(
          `http://localhost:5000/atendimentos/tutor/${searchTutor}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setAtendimentos(response.data || []);
      } catch (error) {
        alert("Erro ao buscar atendimentos pelo tutor");
        setAtendimentos([]);
      }
    }
  };

  const handleClearSearch = () => {
    setSearchTutor("");
    fetchAtendimentos();
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleAddAtendimento = () => {
    navigate("/add-atendimento");
  };

  const handleGeneratePDF = (atendimento: Atendimento) => {
    const doc = new jsPDF();

    // Caminho para o logo na pasta public
    const logo = "/login-logo.png";

    // Definir cores
    const headerColor = "#168479"; // Verde
    const secondaryColor = "#26A7C3"; // Azul
    const textColor = "#ffffff"; // Branco para o cabeçalho
    const bodyTextColor = "#000000"; // Preto para o texto comum

    // Adicionar o logo PNG no topo
    doc.addImage(logo, "PNG", 80, 10, 50, 30); // Ajuste as dimensões conforme necessário

    // Adicionar título do documento
    doc.setFontSize(24);
    doc.setTextColor(headerColor);
    doc.text("Nota Fiscal - Atendimento", 105, 50, { align: "center" });

    // Seção de detalhes do atendimento
    doc.setFontSize(16);
    doc.setTextColor(secondaryColor);
    doc.text("Detalhes do Atendimento", 10, 70);

    doc.setFontSize(12);
    doc.setTextColor(bodyTextColor);
    doc.text(
      `Data: ${new Date(atendimento.data).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      10,
      80
    );

    doc.text(
      `Tutor: ${
        atendimento.pets.length > 0
          ? atendimento.pets
              .map((pet) => pet.tutor?.nome)
              .filter(Boolean)
              .join(", ")
          : "Tutor não encontrado"
      }`,
      10,
      90
    );

    doc.text(
      `Pets: ${
        atendimento.pets.length > 0
          ? atendimento.pets.map((pet) => pet.nome).join(", ")
          : "Pet não encontrado"
      }`,
      10,
      100
    );

    // Valor total destacado com fundo colorido
    doc.setFillColor(headerColor);
    doc.rect(0, 120, 210, 30, "F");
    doc.setFontSize(20);
    doc.setTextColor(textColor);
    doc.text(`Valor Total: R$ ${atendimento.valorTotal.toFixed(2)}`, 105, 140, {
      align: "center",
    });

    // Exemplo de tabela usando autoTable (opcional)
    autoTable(doc, {
      head: [["Descrição", "Quantidade", "Preço Unitário", "Preço Total"]],
      body: [
        ["Banho", "1", "R$ 50,00", "R$ 50,00"],
        ["Tosa", "1", "R$ 30,00", "R$ 30,00"],
      ],
      startY: 160, // Começa a tabela um pouco mais abaixo da seção anterior
    });

    // Rodapé ou outras informações
    doc.setFontSize(12);
    doc.setTextColor(bodyTextColor);
    doc.text("Obrigado por escolher nosso Petshop!", 105, 200, {
      align: "center",
    });

    // Baixar o PDF
    doc.save(`atendimento_${atendimento.pets[0]?.tutor.nome}.pdf`);
  };

  const totalPages = Math.ceil(totalAtendimentos / limit);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center py-8"
      style={{ backgroundColor: "#98D1AA" }}
    >
      <div className="w-full max-w-4xl flex items-center space-x-2">
        <form onSubmit={handleSearch} className="flex-grow relative">
          <input
            type="text"
            placeholder="Buscar por nome do tutor"
            value={searchTutor}
            onChange={(e) => setSearchTutor(e.target.value)}
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
            <th className="py-2 px-4 text-left text-white">Data</th>
            <th className="py-2 px-4 text-left text-white">Tutor</th>
            <th className="py-2 px-4 text-left text-white">Pet</th>
            <th className="py-2 px-4 text-left text-white">Valor Total</th>
            <th className="py-2 px-4 text-left text-white w-24 text-center">
              <FontAwesomeIcon icon={faEllipsisV} />
            </th>
          </tr>
        </thead>
        <tbody>
          {atendimentos.length > 0 ? (
            atendimentos.map((atendimento) => (
              <tr
                key={atendimento.id}
                className="border-t border-gray-400 text-white"
              >
                <td className="py-2 px-4">
                  {new Date(atendimento.data).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="py-2 px-4">
                  {atendimento.pets.length > 0
                    ? atendimento.pets
                        .map((pet) => pet.tutor?.nome)
                        .filter(Boolean)
                        .join(", ")
                    : "Tutor não encontrado"}
                </td>
                <td className="py-2 px-4">
                  {atendimento.pets.length > 0
                    ? atendimento.pets.map((pet) => pet.nome).join(", ")
                    : "Pet não encontrado"}
                </td>
                <td className="py-2 px-4">
                  R$ {atendimento.valorTotal.toFixed(2)}
                </td>
                <td className="py-2 px-4 w-32 flex justify-between items-center">
                  <button
                    onClick={() => handleEdit(atendimento.id)}
                    className="text-blue-300 hover:text-blue-500 text-lg mx-2"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    onClick={() => openModal(atendimento.id)}
                    className="text-red-300 hover:text-red-500 text-lg mx-2"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                  <button
                    onClick={() => handleGeneratePDF(atendimento)}
                    className="text-white hover:text-gray-300 text-lg mx-2"
                  >
                    <FontAwesomeIcon icon={faFilePdf} />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5}>Nenhum atendimento encontrado</td>
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
        onClick={handleAddAtendimento}
        className="mt-4 px-4 py-2 font-bold text-white rounded-md"
        style={{ backgroundColor: "#168479" }}
      >
        Cadastrar Atendimento
      </button>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Confirmação de Exclusão"
        className="modal"
        overlayClassName="modal-overlay"
      >
        <h2 className="text-lg font-bold mb-4">Confirmação de Exclusão</h2>
        <p>Tem certeza que deseja excluir este atendimento?</p>
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

export default Home;
