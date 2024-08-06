import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

interface Tutor {
  id: number;
  nome: string;
  cpf: string;
}

const AddPet: React.FC = () => {
  const [nome, setNome] = useState("");
  const [idade, setIdade] = useState<number | null>(null);
  const [porte, setPorte] = useState("");
  const [cpfTutor, setCpfTutor] = useState<{
    value: string;
    label: string;
  } | null>(null);
  const [tutors, setTutors] = useState<{ value: string; label: string }[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/tutors/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const options = response.data.tutors.map((tutor: Tutor) => ({
          value: tutor.cpf,
          label: `${tutor.cpf} - ${tutor.nome}`,
        }));
        setTutors(options);
      } catch (error) {
        console.error("Erro ao buscar tutores:", error);
      }
    };

    fetchTutors();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (idade !== null && idade < 0) {
      setErrorMessage("A idade não pode ser negativa");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      // Verifica se o CPF do tutor existe
      const tutorResponse = await axios.get(
        `http://localhost:5000/tutors/cpf/${cpfTutor?.value}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (tutorResponse.status !== 200) {
        alert("CPF do tutor não encontrado");
        return;
      }

      await axios.post(
        "http://localhost:5000/pets",
        {
          nome,
          idade,
          porte,
          cpfTutor: cpfTutor?.value,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      navigate("/pets");
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        error.response &&
        error.response.status === 404
      ) {
        alert("CPF do tutor não encontrado");
      } else {
        alert("Erro ao adicionar pet");
        console.error("Erro ao adicionar pet:", error);
      }
    }
  };

  const handleIdadeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value < 0) {
      setErrorMessage("A idade não pode ser negativa");
      setIdade(null);
    } else {
      setErrorMessage("");
      setIdade(value);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#98D1AA" }}
    >
      <div className="w-full max-w-md p-8 space-y-6 bg-[#26A7C3] rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-white">
          Cadastrar Pet
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="relative">
            <input
              type="text"
              placeholder="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#168479]"
            />
          </div>
          <div className="relative">
            <input
              type="number"
              placeholder="Idade"
              value={idade ?? ""}
              onChange={handleIdadeChange}
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
              value={porte}
              onChange={(e) => setPorte(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#168479]"
            >
              <option value="" disabled hidden>
                Selecione o Porte
              </option>
              <option value="Pequeno">Pequeno</option>
              <option value="Médio">Médio</option>
              <option value="Grande">Grande</option>
            </select>
          </div>
          <div className="relative">
            <Select
              options={tutors}
              onChange={setCpfTutor}
              value={cpfTutor}
              placeholder="Selecione ou digite o CPF do Tutor"
              isClearable
              isSearchable
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 font-bold text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-[#168479]"
            style={{ backgroundColor: "#168479" }}
          >
            Cadastrar Pet
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddPet;
