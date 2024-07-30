import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import Profile from "./components/Profile";
import AddTutor from "./components/AddTutor";
import Tutors from "./components/Tutors";
import EditTutor from "./components/EditTutor";
import Funcionarios from "./components/Funcionarios";
import EditFuncionario from "./components/EditFuncionario";
import Pets from "./components/Pets";
import AddPet from "./components/AddPet";
import EditPet from "./components/EditPet";
import ProtectedRoute from "./components/ProtectedRoute";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/tutors" element={<Tutors />} />
          <Route path="/add-tutor" element={<AddTutor />} />
          <Route path="/edit-tutor/:id" element={<EditTutor />} />
          <Route path="/pets" element={<Pets />} />
          <Route path="/add-pet" element={<AddPet />} />
          <Route path="/edit-pet/:id" element={<EditPet />} />
        </Route>
        <Route element={<ProtectedRoute requiredRole={2} />}>
          <Route path="/register" element={<Register />} />
          <Route path="/funcionarios" element={<Funcionarios />} />
          <Route path="/edit-funcionario/:id" element={<EditFuncionario />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
