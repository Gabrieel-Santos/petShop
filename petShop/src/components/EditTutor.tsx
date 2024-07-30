import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const EditTutor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [tutorData, setTutorData] = useState({
    nome: "",
    endereco: "",
    telefone: "",
    cpf: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTutorData = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        const response = await axios.get(`http://localhost:5000/tutors/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTutorData(response.data);
      }
    };

    fetchTutorData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTutorData({ ...tutorData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (token) {
      try {
        await axios.put(`http://localhost:5000/tutors/${id}`, tutorData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Tutor atualizado com sucesso");
        navigate("/tutors");
      } catch (error) {
        alert("Erro ao atualizar tutor");
      }
    }
  };

  return (
    <div>
      <h2>Editar Tutor</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Nome:
          <input
            type="text"
            name="nome"
            value={tutorData.nome}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Endereço:
          <input
            type="text"
            name="endereco"
            value={tutorData.endereco}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Telefone:
          <input
            type="text"
            name="telefone"
            value={tutorData.telefone}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          CPF:
          <input
            type="text"
            name="cpf"
            value={tutorData.cpf}
            onChange={handleChange}
            required
          />
        </label>
        <button type="submit">Atualizar</button>
      </form>
    </div>
  );
};

export default EditTutor;
