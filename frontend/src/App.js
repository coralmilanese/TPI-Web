// src/App.js
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./Pages/Home";
import Galeria from "./Pages/Galeria";
import SubirImagen from "./Pages/SubirImagen";
import Login from "./Pages/Login";
import DetalleImagen from "./Pages/DetalleImagen"; // si lo usas

import Layout from "./Components/layout";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/galeria" element={<Galeria />} />
          <Route path="/subir-imagen" element={<SubirImagen />} />
          <Route path="/login" element={<Login />} />
          <Route path="/detalle" element={<DetalleImagen />} />

          <Route path="*" element={<h1>404 - Página no encontrada</h1>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
