import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { logout, getUserRole } from "../services/auth";
import classNames from "classnames";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = getUserRole();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleLogoClick = () => {
    navigate("/home");
  };

  return (
    <nav className="bg-[#168479] text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <img
            src="/login-logo.svg"
            alt="Logo"
            className="h-12 w-12 cursor-pointer" // Aumentei o tamanho da logo
            onClick={handleLogoClick}
          />
        </div>
        <ul className="flex space-x-8">
          {" "}
          {/* Aumentei o espaçamento entre as abas */}
          <li>
            <button
              onClick={() => handleNavigation("/profile")}
              className={classNames("font-bold hover:text-[#26A7C3]", {
                "text-[#26A7C3]": location.pathname === "/profile",
              })}
            >
              PERFIL
            </button>
          </li>
          {userRole === 2 && (
            <li>
              <button
                onClick={() => handleNavigation("/funcionarios")}
                className={classNames("font-bold hover:text-[#26A7C3]", {
                  "text-[#26A7C3]": location.pathname === "/funcionarios",
                })}
              >
                FUNCIONÁRIOS
              </button>
            </li>
          )}
          <li>
            <button
              onClick={() => handleNavigation("/tutors")}
              className={classNames("font-bold hover:text-[#26A7C3]", {
                "text-[#26A7C3]": location.pathname === "/tutors",
              })}
            >
              TUTORES
            </button>
          </li>
          <li>
            <button
              onClick={() => handleNavigation("/pets")}
              className={classNames("font-bold hover:text-[#26A7C3]", {
                "text-[#26A7C3]": location.pathname === "/pets",
              })}
            >
              PETS
            </button>
          </li>
          <li>
            <button
              onClick={handleLogout}
              className="font-bold hover:text-[#f02849]"
            >
              SAIR
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
