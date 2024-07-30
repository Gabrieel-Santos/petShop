import React from "react";
import { useNavigate } from "react-router-dom";
import { logout, getUserRole } from "../services/auth";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const userRole = getUserRole();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleFuncionarios = () => {
    navigate("/funcionarios");
  };

  const handleProfile = () => {
    navigate("/profile");
  };

  const handleTutors = () => {
    navigate("/tutors");
  };

  const handlePets = () => {
    navigate("/pets");
  };

  return (
    <div>
      <nav>
        <ul>
          <li>
            <button onClick={handleLogout}>Logout</button>
          </li>
          {userRole === 2 && (
            <li>
              <button onClick={handleFuncionarios}>Funcionários</button>
            </li>
          )}
          <li>
            <button onClick={handleProfile}>Perfil</button>
          </li>
          <li>
            <button onClick={handleTutors}>Tutores</button>
          </li>
          <li>
            <button onClick={handlePets}>Pets</button>
          </li>
        </ul>
      </nav>
      <h2>Bem-vindo ao Home!</h2>
    </div>
  );
};

export default Home;
