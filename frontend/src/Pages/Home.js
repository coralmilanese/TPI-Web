// src/Pages/Home.js
import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <>
      {/* HERO estilo museo */}
      <header
        className="d-flex align-items-center justify-content-center"
        style={{
          height: "72vh",
          backgroundImage:
            "url('https://images.unsplash.com/photo-1520690214124-2d7f63e39b9a?auto=format&fit=crop&w=1600&q=60')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.32)",
          }}
        />

        <div className="text-center text-white" style={{ position: "relative", zIndex: 2 }}>
          <h1
            className="fw-bold"
            style={{
              fontSize: "3.4rem",
              letterSpacing: "3px",
              textShadow: "0 4px 10px rgba(0,0,0,0.45)",
            }}
          >
            Museo Digital
          </h1>

          <p className="mt-3" style={{ fontSize: "1.15rem", opacity: 0.95 }}>
            Donde el arte se encuentra con la tecnología.
          </p>

          <div className="mt-4 d-flex justify-content-center gap-3">

            <button
              className="btn btn-outline-light btn-lg px-4"
              onClick={() => navigate("/galeria")}
            >
              Explorar Galería
            </button>

            {/* 🔥 NUEVO BOTÓN — sin romper diseño */}
            <button
              className="btn btn-outline-light btn-lg px-4"
              onClick={() => navigate("/subir-imagen")}
            >
              Subir Imagen
            </button>

            <button
              className="btn btn-light btn-lg px-4"
              onClick={() => navigate("/login")}
            >
              Ingresar
            </button>

          </div>
        </div>
      </header>

      {/* Info */}
      <section className="container text-center py-5">
        <h2 className="fw-bold mb-3" style={{ fontSize: "2rem" }}>
          Una experiencia curada
        </h2>

        <p style={{ maxWidth: "760px", margin: "0 auto", color: "#444", lineHeight: 1.7 }}>
          Nuestro museo digital ofrece colecciones seleccionadas, navegación clara y una
          experiencia de visualización profesional para todo público.
        </p>
      </section>
    </>
  );
}
