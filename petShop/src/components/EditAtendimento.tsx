import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Select, { MultiValue, SingleValue } from "react-select";

interface Pet {
  id: number;
  nome: string;
}

interface Servico {
  id: number;
  nome: string;
  valor: number;
}

const EditAtendimento: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [valorTotal, setValorTotal] = useState(0);
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [selectedPet, setSelectedPet] = useState<SingleValue<{
    value: number;
    label: string;
  }> | null>(null);
  const [selectedServicos, setSelectedServicos] = useState<
    MultiValue<{ value: number; label: string; valor: number }>
  >([]);
  const [petsOptions, setPetsOptions] = useState<
    { value: number; label: string }[]
  >([]);
  const [servicosOptions, setServicosOptions] = useState<
    { value: number; label: string; valor: number }[]
  >([]);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  // Carrega os pets e serviços cadastrados ao montar o componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Busca os pets cadastrados
        const petsResponse = await axios.get("http://localhost:5000/pets", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const petsOptions = petsResponse.data.pets.map((pet: Pet) => ({
          value: pet.id,
          label: pet.nome,
        }));
        setPetsOptions(petsOptions);

        // Busca os serviços cadastrados
        const servicosResponse = await axios.get(
          "http://localhost:5000/services",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const servicosOptions = servicosResponse.data.services.map(
          (servico: Servico) => ({
            value: servico.id,
            label: servico.nome,
            valor: servico.valor,
          })
        );
        setServicosOptions(servicosOptions);

        // Busca os dados do atendimento
        const atendimentoResponse = await axios.get(
          `http://localhost:5000/atendimentos/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const atendimento = atendimentoResponse.data;

        // Popula o estado com os dados do atendimento
        setData(new Date(atendimento.data).toISOString().split("T")[0]);
        setHora(
          new Date(atendimento.data).toISOString().split("T")[1].slice(0, 5)
        );
        setValorTotal(atendimento.valorTotal);

        // Define o pet selecionado com tipagem explícita
        const petSelecionado = petsOptions.find(
          (pet: { value: number; label: string }) =>
            pet.value === atendimento.pets[0].id
        );

        setSelectedPet(petSelecionado || null);

        // Define os serviços selecionados
        const servicosSelecionados = atendimento.servicos.map(
          (servico: Servico) => ({
            value: servico.id,
            label: servico.nome,
            valor: servico.valor,
          })
        );
        setSelectedServicos(servicosSelecionados);
      } catch (error) {
        console.error("Erro ao buscar dados do atendimento:", error);
        alert("Erro ao buscar dados do atendimento");
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedPet || selectedServicos.length === 0) {
      setErrorMessage("Por favor, selecione um pet e pelo menos um serviço");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const petId = selectedPet.value;
      const servicoIds = selectedServicos.map((servico) => servico.value);

      // Combina a data e a hora em um único objeto Date
      const combinedDateTime = new Date(`${data}T${hora}`);

      await axios.put(
        `http://localhost:5000/atendimentos/${id}`,
        {
          data: combinedDateTime.toISOString(),
          valorTotal,
          petId,
          servicos: servicoIds,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      navigate("/home"); // Redireciona após o atendimento ser atualizado
    } catch (error) {
      alert("Erro ao atualizar atendimento");
      console.error("Erro ao atualizar atendimento:", error);
    }
  };

  const handleValorTotalChange = (
    selectedServicos: MultiValue<{
      value: number;
      label: string;
      valor: number;
    }>
  ) => {
    let total = 0;
    selectedServicos.forEach((servico) => {
      total += servico.valor;
    });
    setValorTotal(parseFloat(total.toFixed(2))); // Arredonda o valor total para 2 casas decimais
  };

  const handleValorTotalInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const inputValue = e.target.value;
    const parsedValue = parseFloat(inputValue);

    if (parsedValue < 0) {
      setErrorMessage("O valor total não pode ser negativo");
    } else {
      setErrorMessage("");
      setValorTotal(parsedValue);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#98D1AA" }}
    >
      <div className="w-full max-w-md p-8 space-y-6 bg-[#26A7C3] rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-white">
          Editar Atendimento
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="relative">
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#168479]"
            />
          </div>
          <div className="relative">
            <input
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#168479]"
            />
          </div>
          <div className="relative">
            <Select
              options={petsOptions}
              onChange={setSelectedPet}
              value={selectedPet}
              placeholder="Selecione o Pet"
              isClearable
              isSearchable
            />
          </div>
          <div className="relative">
            <Select
              options={servicosOptions}
              onChange={(value) => {
                setSelectedServicos(value);
                handleValorTotalChange(value);
              }}
              value={selectedServicos}
              placeholder="Selecione os Serviços"
              isMulti
              isClearable
              isSearchable
            />
          </div>
          <div className="relative flex items-center">
            {valorTotal !== 0 && (
              <span className="absolute left-3 text-gray-500">R$</span>
            )}
            <input
              type="number"
              value={valorTotal}
              onChange={handleValorTotalInputChange}
              placeholder="Valor Total"
              className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#168479] custom-number-input ${
                valorTotal !== 0 ? "pl-8" : "pl-3"
              }`}
              min="0"
              step="0.01"
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

export default EditAtendimento;
