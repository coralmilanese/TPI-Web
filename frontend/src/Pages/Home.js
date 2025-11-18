// src/Pages/Home.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Home() {
  const navigate = useNavigate();
  const [imagenes, setImagenes] = useState([]);

  // hero background: usa la última imagen subida si existe
  const heroUrl = (imagenes && imagenes[0] && imagenes[0].url) ||
    "https://images.unsplash.com/photo-1520690214124-2d7f63e39b9a?auto=format&fit=crop&w=1600&q=60";

  useEffect(() => {
    loadImagenes();
    // eslint-disable-next-line
  }, []);

  async function loadImagenes() {
    try {
      const res = await axios.get("http://localhost:4000/api/imagenes");
      const data = res.data || [];
      // tomar las últimas 6 imágenes (si existen), ordenadas por fecha si viene
      const sorted = data.slice().sort((a, b) => {
        const da = new Date(a.creado_en || a.created_at || 0).getTime();
        const db = new Date(b.creado_en || b.created_at || 0).getTime();
        return db - da;
      });
      setImagenes(sorted.slice(0, 6));
    } catch (err) {
      console.error("Error cargando imágenes en Home", err);
    }
  }

  return (
    <>
      {/* HERO estilo museo */}
      <header
        role="banner"
        className="d-flex align-items-center justify-content-center"
        style={{
          minHeight: "56vh",
          height: "72vh",
          backgroundImage: `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.25)), url('${heroUrl}')`,
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
          transition: "background-image 300ms ease-in-out",
          position: "relative",
          color: "#fff",
        }}
      >

        <div className="text-center" style={{ position: "relative", zIndex: 2, padding: '0 1rem' }}>
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

      {/* Carrusel con imágenes subidas */}
      <section className="container my-5">
        {imagenes.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-muted">Aún no hay imágenes para mostrar.</p>
          </div>
        ) : (
          <div
            id="homeCarousel"
            className="carousel slide"
            data-bs-ride="carousel"
          >
            <div className="carousel-indicators">
              {imagenes.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  data-bs-target="#homeCarousel"
                  data-bs-slide-to={i}
                  className={i === 0 ? "active" : ""}
                  aria-current={i === 0 ? "true" : undefined}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>

            <div
              className="carousel-inner rounded shadow-sm"
              style={{ overflow: "hidden" }}
            >
              {imagenes.map((img, i) => (
                <div
                  key={img.id || i}
                  className={`carousel-item ${i === 0 ? "active" : ""}`}
                >
                  <img
                    src={img.url}
                    className="d-block w-100"
                    alt={img.titulo || `Imagen ${i + 1}`}
                    style={{ maxHeight: "420px", objectFit: "cover" }}
                  />
                  {img.titulo && (
                    <div className="carousel-caption d-none d-md-block bg-dark bg-opacity-25 rounded px-3 py-2">
                      <h5 className="m-0">{img.titulo}</h5>
                      {img.autor && (
                        <small className="text-white-50">{img.autor}</small>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              className="carousel-control-prev"
              type="button"
              data-bs-target="#homeCarousel"
              data-bs-slide="prev"
            >
              <span
                className="carousel-control-prev-icon"
                aria-hidden="true"
              ></span>
              <span className="visually-hidden">Anterior</span>
            </button>
            <button
              className="carousel-control-next"
              type="button"
              data-bs-target="#homeCarousel"
              data-bs-slide="next"
            >
              <span
                className="carousel-control-next-icon"
                aria-hidden="true"
              ></span>
              <span className="visually-hidden">Siguiente</span>
            </button>
          </div>
        )}
      </section>

      {/* Info */}
      <section className="container text-center py-5">
        <h2 className="fw-bold mb-3" style={{ fontSize: "2rem" }}>
          Una experiencia curada
        </h2>

        <p
          style={{
            maxWidth: "760px",
            margin: "0 auto",
            color: "#444",
            lineHeight: 1.7,
          }}
        >
          Nuestro museo digital ofrece colecciones seleccionadas, navegación
          clara y una experiencia de visualización profesional para todo
          público.
        </p>
      </section>
    </>
  );
}
