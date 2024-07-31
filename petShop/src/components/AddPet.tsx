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
  const [idade, setIdade] = useState(0);
  const [porte, setPorte] = useState("");
  const [cpfTutor, setCpfTutor] = useState<{
    value: string;
    label: string;
  } | null>(null);
  const [tutors, setTutors] = useState<{ value: string; label: string }[]>([]);
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
      alert("Pet adicionado com sucesso");
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

  return (
    <form onSubmit={handleSubmit}>
      <h2>Adicionar Pet</h2>
      <input
        type="text"
        placeholder="Nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Idade"
        value={idade}
        onChange={(e) => setIdade(Number(e.target.value))}
        required
      />
      <input
        type="text"
        placeholder="Porte"
        value={porte}
        onChange={(e) => setPorte(e.target.value)}
        required
      />
      <Select
        options={tutors}
        onChange={setCpfTutor}
        value={cpfTutor}
        placeholder="Selecione ou digite o CPF do Tutor"
        isClearable
        isSearchable
      />
      <button type="submit">Adicionar Pet</button>
    </form>
  );
};

export default AddPet;
