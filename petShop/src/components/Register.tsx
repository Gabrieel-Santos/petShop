import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const Register: React.FC = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [autoridade, setAutoridade] = useState(1);
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (senha !== confirmarSenha) {
      setErrorMessage("As senhas não coincidem");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/register",
        {
          nome,
          email,
          senha,
          autoridade,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      navigate("/home");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 409) {
          setErrorMessage("Email já cadastrado");
        } else {
          setErrorMessage(
            "Erro ao registrar: " +
              (error.response?.data.message || error.message)
          );
        }
      } else if (error instanceof Error) {
        setErrorMessage("Erro ao registrar: " + error.message);
      } else {
        setErrorMessage("Erro ao registrar: Erro desconhecido");
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
          Cadastrar funcionário
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
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#168479]"
            />
          </div>
          <div className="relative">
            <input
              type={showSenha ? "text" : "password"}
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#168479]"
            />
            <div
              onClick={() => setShowSenha(!showSenha)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
            >
              <FontAwesomeIcon
                icon={showSenha ? faEyeSlash : faEye}
                className="text-gray-500"
              />
            </div>
          </div>
          <div className="relative">
            <input
              type={showConfirmarSenha ? "text" : "password"}
              placeholder="Confirmar Senha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#168479]"
            />
            <div
              onClick={() => setShowConfirmarSenha(!showConfirmarSenha)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
            >
              <FontAwesomeIcon
                icon={showConfirmarSenha ? faEyeSlash : faEye}
                className="text-gray-500"
              />
            </div>
          </div>
          <div className="relative">
            <select
              value={autoridade}
              onChange={(e) => setAutoridade(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#168479] bg-white"
            >
              <option value={1}>Funcionário</option>
              <option value={2}>Administrador</option>
            </select>
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

export default Register;
