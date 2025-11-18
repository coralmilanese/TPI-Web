// src/Components/Layout.js
import React from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Layout({ children }) {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: "serif", backgroundColor: "#f8f6f2", minHeight: "100vh" }}>
      
      {/* NAVBAR GLOBAL */}
      <nav
        className="navbar navbar-expand-lg navbar-light shadow-sm"
        style={{
          backgroundColor: "#ffffffd9",
          backdropFilter: "blur(6px)",
          position: "sticky",
          top: 0,
          zIndex: 50
        }}
      >
        <div className="container">
          <span
            className="navbar-brand fw-bold"
            style={{ fontSize: "1.6rem", cursor: "pointer", letterSpacing: "1.5px" }}
            onClick={() => navigate("/")}
          >
            Museo Digital
          </span>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="mainNav">
            <ul className="navbar-nav ms-auto gap-3">

              <li className="nav-item">
                <button className="btn btn-link nav-link" onClick={() => navigate("/")}>
                  Inicio
                </button>
              </li>

              <li className="nav-item">
                <button className="btn btn-link nav-link" onClick={() => navigate("/galeria")}>
                  Galería
                </button>
              </li>

              <li className="nav-item">
                <button className="btn btn-link nav-link" onClick={() => navigate("/subir-imagen")}>
                  Subir Imagen
                </button>
              </li>

              <li className="nav-item">
                <button className="btn btn-dark px-4" onClick={() => navigate("/login")}>
                  Ingresar
                </button>
              </li>

            </ul>
          </div>
        </div>
      </nav>

      {/* CONTENIDO */}
      <main>{children}</main>

      {/* FOOTER GLOBAL */}
      <footer className="text-center py-4 mt-5" style={{ backgroundColor: "#efede8" }}>
        <p className="mb-0" style={{ color: "#444" }}>
          Museo Digital © 2025 — Proyecto Integrador
        </p>
      </footer>

    </div>
  );
}
