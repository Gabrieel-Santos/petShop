import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const EditPet: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [petData, setPetData] = useState({
    nome: "",
    idade: 0,
    porte: "",
    cpfTutor: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPetData = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await axios.get(`http://localhost:5000/pets/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.status === 200) {
            const pet = response.data;
            setPetData({
              nome: pet.nome,
              idade: pet.idade,
              porte: pet.porte,
              cpfTutor: pet.tutor.cpf,
            });
          }
        } catch (error) {
          console.error("Erro ao buscar dados do pet:", error);
          alert("Erro ao buscar dados do pet");
        }
      }
    };

    fetchPetData();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setPetData({ ...petData, [name]: value });
  };

  const handleIdadeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value < 0) {
      setErrorMessage("A idade não pode ser negativa");
      setPetData({ ...petData, idade: 0 });
    } else {
      setErrorMessage("");
      setPetData({ ...petData, idade: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (petData.idade < 0) {
      setErrorMessage("A idade não pode ser negativa");
      return;
    }
    const token = localStorage.getItem("token");
    if (token) {
      try {
        await axios.put(
          `http://localhost:5000/pets/${id}`,
          { ...petData },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setErrorMessage("");
        navigate("/pets");
      } catch (error) {
        setErrorMessage("Erro ao atualizar pet");
        console.error("Erro ao atualizar pet:", error);
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
          Editar Pet
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="relative">
            <input
              type="text"
              name="nome"
              value={petData.nome}
              onChange={handleChange}
              placeholder="Nome"
              required
              className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#168479]"
            />
          </div>
          <div className="relative">
            <input
              type="number"
              name="idade"
              value={petData.idade}
              onChange={handleIdadeChange}
              placeholder="Idade"
              required
              className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#168479] custom-number-input"
            />
            {errorMessage && (
              <p className="text-sm font-bold text-red-600 mt-2">
                {errorMessage}
              </p>
            )}
          </div>
          <div className="relative">
            <select
              name="porte"
              value={petData.porte}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#168479]"
            >
              <option value="">Selecione o Porte</option>
              <option value="Pequeno">Pequeno</option>
              <option value="Médio">Médio</option>
              <option value="Grande">Grande</option>
            </select>
          </div>
          <div className="relative">
            <input
              type="text"
              name="cpfTutor"
              value={petData.cpfTutor}
              onChange={handleChange}
              placeholder="CPF do Tutor"
              required
              className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#168479]"
            />
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

export default EditPet;
