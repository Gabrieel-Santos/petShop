import { useState } from "react";
import axios from "axios";

const AddTutor: React.FC = () => {
  const [tutorData, setTutorData] = useState({
    nome: "",
    endereco: "",
    telefone: "",
    cpf: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

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
        setErrorMessage("");
      } catch (error) {
        setErrorMessage("Erro ao adicionar tutor");
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
          Cadastrar Tutor
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="relative">
            <input
              type="text"
              name="nome"
              value={tutorData.nome}
              onChange={handleChange}
              placeholder="Nome"
              required
              className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#168479]"
            />
          </div>
          <div className="relative">
            <input
              type="text"
              name="endereco"
              value={tutorData.endereco}
              onChange={handleChange}
              placeholder="Endereço"
              required
              className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#168479]"
            />
          </div>
          <div className="relative">
            <input
              type="text"
              name="telefone"
              value={tutorData.telefone}
              onChange={handleChange}
              placeholder="Telefone"
              required
              className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#168479]"
            />
          </div>
          <div className="relative">
            <input
              type="text"
              name="cpf"
              value={tutorData.cpf}
              onChange={handleChange}
              placeholder="CPF"
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
            Cadastrar
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTutor;
