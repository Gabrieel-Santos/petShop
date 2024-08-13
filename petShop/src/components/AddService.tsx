import React, { useState } from "react";
import axios from "axios";

const AddService: React.FC = () => {
  const [serviceData, setServiceData] = useState({
    nome: "",
    valor: "",
    tempoGasto: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Realiza a validação em tempo real
    if (name === "valor" && parseFloat(value) <= 0) {
      setErrorMessage("O valor deve ser maior que zero");
    } else if (name === "tempoGasto" && parseInt(value, 10) <= 0) {
      setErrorMessage("O tempo gasto deve ser maior que zero");
    } else {
      setErrorMessage(""); // Limpa a mensagem de erro se o valor for válido
    }

    setServiceData({ ...serviceData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valor = parseFloat(serviceData.valor);
    const tempoGasto = parseInt(serviceData.tempoGasto, 10);

    if (valor <= 0 || tempoGasto <= 0) {
      setErrorMessage("Valor e Tempo Gasto devem ser maiores que zero");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/services",
        {
          nome: serviceData.nome,
          valor: valor,
          tempoGasto: tempoGasto,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Serviço adicionado com sucesso");
      setServiceData({ nome: "", valor: "", tempoGasto: "" });
      setErrorMessage("");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 409) {
          setErrorMessage("Serviço já cadastrado");
        } else {
          setErrorMessage("Erro ao adicionar serviço");
        }
      } else {
        setErrorMessage("Erro ao adicionar serviço");
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
          Cadastrar Serviço
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="relative">
            <input
              type="text"
              name="nome"
              value={serviceData.nome}
              onChange={handleChange}
              placeholder="Nome"
              required
              className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#168479]"
            />
          </div>
          <div className="relative flex items-center">
            {serviceData.valor && (
              <span className="absolute left-3 text-gray-500">R$</span>
            )}
            <input
              type="number"
              name="valor"
              value={serviceData.valor}
              onChange={handleChange}
              placeholder="Valor"
              required
              min="0"
              step="0.01"
              className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#168479] custom-number-input ${
                serviceData.valor ? "pl-8" : "pl-3"
              }`}
            />
          </div>
          <div className="relative flex items-center">
            <input
              type="number"
              name="tempoGasto"
              value={serviceData.tempoGasto}
              onChange={handleChange}
              placeholder="Tempo Gasto (em minutos)"
              required
              min="0"
              className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#168479] custom-number-input"
            />
          </div>
          {errorMessage && (
            <p className="text-sm font-bold text-red-600 mt-2 text-center">
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

export default AddService;
