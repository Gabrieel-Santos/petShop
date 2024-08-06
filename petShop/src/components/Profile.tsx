import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const Profile: React.FC = () => {
  const [userData, setUserData] = useState({
    nome: "",
    email: "",
  });
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        const response = await axios.get("http://localhost:5000/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(response.data);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "novaSenha") {
      setNovaSenha(value);
    } else {
      setConfirmarSenha(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (novaSenha !== confirmarSenha) {
      setErrorMessage("As senhas não coincidem");
      return;
    }

    const token = localStorage.getItem("token");
    if (token) {
      await axios.put(
        "http://localhost:5000/profile",
        { ...userData, novaSenha },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setErrorMessage("");
      setNovaSenha("");
      setConfirmarSenha("");
      navigate("/home");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#98D1AA" }}
    >
      <div className="w-full max-w-md p-8 space-y-6 bg-[#26A7C3] rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-white">Perfil</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="relative">
            <input
              type="text"
              name="nome"
              value={userData.nome}
              onChange={handleChange}
              placeholder="Nome"
              required
              className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#168479]"
            />
          </div>
          <div className="relative">
            <input
              type="email"
              name="email"
              value={userData.email}
              onChange={handleChange}
              placeholder="Email"
              required
              className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#168479]"
            />
          </div>
          <div className="relative">
            <input
              type={showNovaSenha ? "text" : "password"}
              name="novaSenha"
              value={novaSenha}
              onChange={handlePasswordChange}
              placeholder="Nova Senha"
              className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#168479]"
            />
            <div
              onClick={() => setShowNovaSenha(!showNovaSenha)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
            >
              <FontAwesomeIcon
                icon={showNovaSenha ? faEyeSlash : faEye}
                className="text-gray-500"
              />
            </div>
          </div>
          <div className="relative">
            <input
              type={showConfirmarSenha ? "text" : "password"}
              name="confirmarSenha"
              value={confirmarSenha}
              onChange={handlePasswordChange}
              placeholder="Confirmar Nova Senha"
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

export default Profile;
