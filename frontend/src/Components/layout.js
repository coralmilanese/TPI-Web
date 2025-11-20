// src/Components/Layout.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Layout({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    function onStorage(e) {
      if (e.key === "user") {
        try {
          setUser(e.newValue ? JSON.parse(e.newValue) : null);
        } catch (_) {
          setUser(null);
        }
      }
    }

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  }

  return (
    <div
      style={{
        fontFamily: "serif",
        backgroundColor: "#f8f6f2",
        minHeight: "100vh",
      }}
    >
      {/* NAVBAR GLOBAL */}
      <nav
        className="navbar navbar-expand-lg navbar-light shadow-sm"
        style={{
          backgroundColor: "#ffffffd9",
          backdropFilter: "blur(6px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div className="container">
          <span
            className="navbar-brand fw-bold"
            style={{
              fontSize: "1.6rem",
              cursor: "pointer",
              letterSpacing: "1.5px",
              color: "#222",
            }}
            onClick={() => navigate("/")}
          >
            Museo Digital
          </span>

          <div className="d-flex ms-auto align-items-center gap-3">
            <button
              className="btn nav-link"
              style={{ color: "#222" }}
              onClick={() => navigate("/")}
            >
              Inicio
            </button>
            <button
              className="btn nav-link"
              style={{ color: "#222" }}
              onClick={() => navigate("/galeria")}
            >
              Galería
            </button>
            <button
              className="btn nav-link"
              style={{ color: "#222" }}
              onClick={() => navigate("/subir-imagen")}
            >
              Subir imagen
            </button>

            {user ? (
              <div className="d-flex align-items-center gap-2">
                <span className="navbar-text" style={{ color: "#222" }}>
                  Hola, {user.nombre || user.name}
                </span>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={logout}
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <button
                  className="btn btn-dark btn-sm"
                  onClick={() => navigate("/login")}
                >
                  Ingresar
                </button>
                <button
                  className="btn btn-outline-dark btn-sm"
                  onClick={() => navigate("/registrarse")}
                >
                  Registrarse
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* CONTENIDO */}
      <main>{children}</main>

      {/* FOOTER GLOBAL */}
      <footer
        className="text-center py-4 mt-5"
        style={{ backgroundColor: "#efede8" }}
      >
        <p className="mb-0" style={{ color: "#444" }}>
          Museo Digital © 2025 — Proyecto Integrador
        </p>
      </footer>
    </div>
  );
}
