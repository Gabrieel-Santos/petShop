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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPetData({ ...petData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        alert("Pet atualizado com sucesso");
        navigate("/pets");
      } catch (error) {
        alert("Erro ao atualizar pet");
        console.error("Erro ao atualizar pet:", error);
      }
    }
  };

  return (
    <div>
      <h2>Editar Pet</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Nome:
          <input
            type="text"
            name="nome"
            value={petData.nome}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Idade:
          <input
            type="number"
            name="idade"
            value={petData.idade}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Porte:
          <input
            type="text"
            name="porte"
            value={petData.porte}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          CPF do Tutor:
          <input
            type="text"
            name="cpfTutor"
            value={petData.cpfTutor}
            onChange={handleChange}
            required
          />
        </label>
        <button type="submit">Atualizar</button>
      </form>
    </div>
  );
};

export default EditPet;
