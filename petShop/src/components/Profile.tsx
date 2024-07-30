import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Profile: React.FC = () => {
  const [userData, setUserData] = useState({
    nome: "",
    email: "",
  });
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
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
      alert("As senhas não coincidem");
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
      alert("Dados atualizados com sucesso");
      setNovaSenha("");
      setConfirmarSenha("");
      navigate("/home");
    }
  };

  return (
    <div>
      <h2>Perfil</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Nome:
          <input
            type="text"
            name="nome"
            value={userData.nome}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Email:
          <input
            type="email"
            name="email"
            value={userData.email}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Nova Senha:
          <input
            type="password"
            name="novaSenha"
            value={novaSenha}
            onChange={handlePasswordChange}
          />
        </label>
        <label>
          Confirmar Nova Senha:
          <input
            type="password"
            name="confirmarSenha"
            value={confirmarSenha}
            onChange={handlePasswordChange}
          />
        </label>
        <button type="submit">Atualizar</button>
      </form>
    </div>
  );
};

export default Profile;
