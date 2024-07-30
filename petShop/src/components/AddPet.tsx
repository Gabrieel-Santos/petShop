import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddPet: React.FC = () => {
  const [nome, setNome] = useState("");
  const [idade, setIdade] = useState(0);
  const [porte, setPorte] = useState("");
  const [cpfTutor, setCpfTutor] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/pets",
        {
          nome,
          idade,
          porte,
          cpfTutor,
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
      alert("Erro ao adicionar pet");
      console.error("Erro ao adicionar pet:", error);
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
      <input
        type="text"
        placeholder="CPF do Tutor"
        value={cpfTutor}
        onChange={(e) => setCpfTutor(e.target.value)}
        required
      />
      <button type="submit">Adicionar Pet</button>
    </form>
  );
};

export default AddPet;
