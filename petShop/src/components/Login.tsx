import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/login", {
        email,
        senha,
      });
      localStorage.setItem("token", response.data.token);
      alert("Login bem-sucedido");
      navigate("/home");
    } catch (error) {
      setErrorMessage("Email ou senha incorretos");
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{ backgroundColor: "#98D1AA" }}
    >
      <div
        className="w-full max-w-md p-8 space-y-4 rounded-lg shadow-md"
        style={{ backgroundColor: "#26A7C3" }}
      >
        <div className="flex justify-center mb-4">
          <img src="/login-logo.svg" alt="Login Logo" className="h-16" />
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="relative">
            <input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-3 pr-10 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#168479]"
            />
            <FontAwesomeIcon
              icon={faUser}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            />
          </div>
          <div className="relative">
            <input
              id="senha"
              type={showPassword ? "text" : "password"}
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              className="w-full pl-3 pr-10 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#168479]"
            />
            <div
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
            >
              <FontAwesomeIcon
                icon={showPassword ? faEyeSlash : faEye}
                className="text-gray-500"
              />
            </div>
          </div>
          {errorMessage && (
            <p
              className="text-sm font-bold"
              style={{ color: "#f02849", marginTop: "4px" }}
            >
              {errorMessage}
            </p>
          )}
          <button
            type="submit"
            className="w-full px-4 py-2 font-bold text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-[#168479]"
            style={{ backgroundColor: "#168479" }}
          >
            ENTRAR
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
