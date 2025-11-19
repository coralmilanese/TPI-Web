// src/Components/layout.js
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Layout({ children }) {
  const navigate = useNavigate();
  const [compact, setCompact] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user"));
      setUser(u || null);
    } catch { setUser(null); }
  }, []);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "transparent" }}>
      <header className="navbar navbar-expand-lg navbar-dark">
        <div className="container">
          <span className="navbar-brand" style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
            Museo Digital
          </span>

          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="mainNav">
            <ul className="navbar-nav ms-auto align-items-center" style={{ gap: 12 }}>
              <li className="nav-item">
                <button className="btn btn-link nav-link" onClick={() => navigate("/")}>Inicio</button>
              </li>

              <li className="nav-item">
                <button className="btn btn-link nav-link" onClick={() => navigate("/galeria")}>Galería</button>
              </li>

              <li className="nav-item">
                <button className="btn btn-link nav-link" onClick={() => navigate("/subir-imagen")}>Subir Imagen</button>
              </li>

              {user ? (
                <>
                  <li className="nav-item">
                    <span className="small" aria-hidden="true">Hola, {user.nombre}</span>
                  </li>
                  <li className="nav-item">
                    <button className="btn btn-outline-light" onClick={logout}>Cerrar sesión</button>
                  </li>
                </>
              ) : (
                <li className="nav-item">
                  <button className="btn btn-primary" onClick={() => navigate("/login")}>Ingresar</button>
                </li>
              )}
            </ul>
          </div>
        </div>
      </header>

      <main>
        {children}
      </main>

      <footer className="py-4 mt-5">
        <div className="container center">
          <div style={{ maxWidth: 980, textAlign: "center" }}>
            <p style={{ margin: 0, color: "var(--muted)" }}>Museo Digital © 2025 — Proyecto Integrador</p>
            <small className="small">Diseño accesible · Responsive · WCAG-aware</small>
          </div>
        </div>
      </footer>
    </div>
  );
}
