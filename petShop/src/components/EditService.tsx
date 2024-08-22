import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const EditService: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [serviceData, setServiceData] = useState({
    nome: "",
    valor: "",
    tempoGasto: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServiceData = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await axios.get(
            `http://localhost:5000/services/${id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (response.status === 200) {
            const service = response.data;
            setServiceData({
              nome: service.nome,
              valor: service.valor.toString(),
              tempoGasto: service.tempoGasto.toString(),
            });
          }
        } catch (error) {
          console.error("Erro ao buscar dados do serviço:", error);
          alert("Erro ao buscar dados do serviço");
        }
      }
    };

    fetchServiceData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "valor" && parseFloat(value) <= 0) {
      setErrorMessage("O valor deve ser maior que zero");
    } else if (name === "tempoGasto" && parseInt(value, 10) <= 0) {
      setErrorMessage("O tempo gasto deve ser maior que zero");
    } else {
      setErrorMessage("");
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

    const token = localStorage.getItem("token");
    if (token) {
      try {
        await axios.put(
          `http://localhost:5000/services/${id}`,
          {
            nome: serviceData.nome,
            valor: valor,
            tempoGasto: tempoGasto,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setErrorMessage("");
        navigate("/services");
      } catch (error) {
        console.error("Erro ao atualizar serviço:", error);
        setErrorMessage("Erro ao atualizar serviço");
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
          Editar Serviço
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
            Atualizar
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditService;
