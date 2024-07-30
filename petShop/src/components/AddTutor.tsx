import React, { useState } from "react";
import axios from "axios";

const AddTutor: React.FC = () => {
  const [tutorData, setTutorData] = useState({
    nome: "",
    endereco: "",
    telefone: "",
    cpf: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTutorData({ ...tutorData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (token) {
      try {
        await axios.post("http://localhost:5000/tutors", tutorData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Tutor adicionado com sucesso");
        setTutorData({ nome: "", endereco: "", telefone: "", cpf: "" });
      } catch (error) {
        alert("Erro ao adicionar tutor");
      }
    }
  };

  return (
    <div>
      <h2>Adicionar Tutor</h2>
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
        <button type="submit">Adicionar</button>
      </form>
    </div>
  );
};

export default AddTutor;
