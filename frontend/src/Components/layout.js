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
  const [isExpanded, setIsExpanded] = useState(() => {
    try {
      return typeof window !== "undefined" && window.innerWidth >= 992;
    } catch {
      return false;
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
    function onResize() {
      setIsExpanded(window.innerWidth >= 992);
    }
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("resize", onResize);
    };
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
          <button
            className="navbar-brand fw-bold btn btn-link p-0"
            style={{
              fontSize: "1.4rem",
              letterSpacing: "1.2px",
              color: "#222",
            }}
            onClick={() => navigate("/")}
          >
            Museo Digital
          </button>

          {/* Desktop menu:  */}
          <div className="d-none d-lg-flex w-100 align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
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
            </div>
            <div className="d-flex align-items-center gap-2">
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

          {/* Mobile menu: */}
          <button
            className="navbar-toggler d-lg-none"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNavbar"
            aria-controls="mainNavbar"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div
            className={`collapse navbar-collapse d-lg-none ${
              isExpanded ? "show" : ""
            }`}
            id="mainNavbar"
          >
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <button
                  className="btn nav-link"
                  style={{ color: "#222" }}
                  onClick={() => navigate("/")}
                >
                  Inicio
                </button>
              </li>
              <li className="nav-item">
                <button
                  className="btn nav-link"
                  style={{ color: "#222" }}
                  onClick={() => navigate("/galeria")}
                >
                  Galería
                </button>
              </li>
              <li className="nav-item">
                <button
                  className="btn nav-link"
                  style={{ color: "#222" }}
                  onClick={() => navigate("/subir-imagen")}
                >
                  Subir imagen
                </button>
              </li>
            </ul>

            <div className="d-flex align-items-center gap-2">
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
